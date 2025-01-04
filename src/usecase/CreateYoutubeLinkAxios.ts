import Youtube from '../entity/Youtube';
import LinkGenerator from './LinkGenerator';
import { Output } from './CreateYoutubeLinkParallel';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default class CreateYoutubeLinksAxios implements LinkGenerator {
  private failedLinks: musicInfos[] = [];
  private maxRetry = 0;
  public async execute(items: any): Promise<Output[]> {    
    const musicInfos: musicInfos[]  = [];
    for (const item of items) {
      const albumName = item.track.album.name;
      const artistName = item.track.artists.map((artist: any) => artist.name);
      const musicName = item.track.name;
      musicInfos.push({ musicName, artistName, albumName })
    };
    const youtubeLinks: Output[] = [];
    for (const info of musicInfos) {
      const youtube = new Youtube(info.musicName, info.artistName, info.albumName);
      youtube.createSearchGoogleUrl()
      const response = await axios.get(youtube.getSearchUrl());
      const $ = cheerio.load(response.data);
      const hrefs = $('a[href]').map((_, element) => $(element).attr('href')).get();
      const links = hrefs.filter(href => href?.includes('watch'));
      if (!links[0]) {
        this.failedLinks.push(info);        
        continue;
      };
      const idMusic = links[0].split("%3D")[1].split("&")[0];
      const musicUrl = youtube.createMusicUrl(idMusic);
      youtubeLinks.push({ name: youtube.getMusicName(), url: musicUrl });
    };
    while (this.failedLinks.length && this.maxRetry < 3) {
      for (const [i, info] of this.failedLinks.entries()) {
        const youtube = new Youtube(info.musicName, info.artistName, info.albumName);
        youtube.createSearchGoogleUrlWithoutAlbum()
        const response = await axios.get(youtube.getSearchUrl());
        const $ = cheerio.load(response.data);
        const hrefs = $('a[href]').map((_, element) => $(element).attr('href')).get();
        const links = hrefs.filter(href => href?.includes('watch'));
        if (!links[0]) { 
          this.maxRetry ++;
          continue;
        }
        const idMusic = links[0].split("%3D")[1].split("&")[0];
        const musicUrl = youtube.createMusicUrl(idMusic);
        youtubeLinks.push({ name: youtube.getMusicName(), url: musicUrl });
        this.failedLinks.splice(i, 1);
      } 
    }
    return youtubeLinks;
  };
};

export type musicInfos = {
  artistName: string[],
  musicName: string,
  albumName: string
};