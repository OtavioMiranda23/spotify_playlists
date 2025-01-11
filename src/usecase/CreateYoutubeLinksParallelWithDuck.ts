import axios from 'axios';
import Youtube from '../entity/Youtube';
import * as cheerio from 'cheerio';
import LinkGenerator from './LinkGenerator';
import Duck from '../entity/Duck';
import { Output } from './CreateYoutubeLinksParallelWithGoogle';

export default class CreateYoutubeLinkParallelWithDuck implements LinkGenerator {
  private musicInfos: musicInfos[];
  private failedLinks: musicInfos[] = [];

  constructor (musicInfos: musicInfos[]) {
    this.musicInfos = musicInfos;
  }

  public async execute(): Promise<Output[]> {            
    const youtubeLinks = this.musicInfos.map(info => {      
      const youtube = new Duck(info.musicName, info.artistName, info.albumName);
      youtube.createSearchDuckUrl()
      return { name: info.musicName, url: youtube.getSearchUrl() };
    })   
    const requests = youtubeLinks.map(link => { 
      console.log(link.url);
      return axios.get(link.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        }
      })
    });
    
    const youtubeFinalData: Output[] = [];
    return Promise.allSettled(requests).then(async results => {
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {          
          const finalLink  = this.createFinalLink(this.musicInfos[index], result.value.data);          
          if (finalLink) youtubeFinalData.push(finalLink); 
        } else {

        }
      })
      let maxRetry = 0;
      while (this.failedLinks.length && maxRetry < 3) {
        for (const [i, info] of this.failedLinks.entries()) {
          const youtube = new Duck(info.musicName, info.artistName, info.albumName);
          youtube.createSearchDuckUrlWithoutAlbum()
          const response = await axios.get(youtube.getSearchUrl());
          const $ = cheerio.load(response.data);
          const hrefs = $('.result__url').map((_, element) => $(element).text()).get();
          const links = hrefs.filter(href => href?.includes('watch'));
          if (!links[0]) { 
            maxRetry ++;
            continue;
          }
          const idMusic = links[0].replaceAll(" ", "").split("?v=")[1].replace("\n", "");
          const musicUrl = youtube.createMusicUrl(idMusic);
          youtubeFinalData.push({ name: info.musicName, url: musicUrl });
          this.failedLinks.splice(i, 1);
      }
      }
      return youtubeFinalData;
    })
  };

  private createFinalLink(musicInfos: musicInfos, data: any) {
      const youtube = new Youtube(musicInfos.musicName, musicInfos.artistName, musicInfos.albumName);
      youtube.createSearchGoogleUrl()
      const $ = cheerio.load(data);
      const hrefs = $('.result__url').map((_, element) => $(element).text()).get();
      const links = hrefs.filter(href => href?.includes('watch'));
      if (!links[0]) {
        this.failedLinks.push(musicInfos);        
        return;
      };
      const idMusic = links[0].replaceAll(" ", "").split("?v=")[1].replace("\n", "");
      console.log(idMusic);
      const musicUrl = youtube.createMusicUrl(idMusic);
      return { name: musicInfos.musicName, url: musicUrl };
  };

};

export type musicInfos = {
  artistName: string[],
  musicName: string,
  albumName: string
};