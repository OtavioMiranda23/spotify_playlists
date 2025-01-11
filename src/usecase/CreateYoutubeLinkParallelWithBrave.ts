import axios from 'axios';
import * as cheerio from 'cheerio';
import LinkGenerator from './LinkGenerator';
import { Output } from './CreateYoutubeLinksParallelWithGoogle';
import Brave from '../entity/Brave';

export default class CreateYoutubeLinkParallelWithBrave implements LinkGenerator {
  private musicInfos: musicInfos[];
  private failedLinks: musicInfos[] = [];

  constructor (musicInfos: musicInfos[]) {
    this.musicInfos = musicInfos;
  }

  public async execute(): Promise<Output[] | undefined> {            
    const youtubeLinks = this.musicInfos.map(info => {      
      const brave = new Brave(info.musicName, info.artistName, info.albumName);
      brave.createSearchBraveUrl()
      return { name: info.musicName, url: brave.getSearchUrl() };
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
          
      }})
      let maxRetry = 0;
      while (this.failedLinks.length && maxRetry < 3) {
        for (const [i, info] of this.failedLinks.entries()) {
          const brave = new Brave(info.musicName, info.artistName, info.albumName);
          brave.createSearchBraveUrlWithoutAlbum()
          const response = await axios.get(brave.getSearchUrl());
          const $ = cheerio.load(response.data);
          const hrefs = $('a[href]').map((_, element) => $(element).attr('href')).get();      
          const idMusic = hrefs.find(href => href.includes('watch?v='))?.split('?v=')[0]
          if (!idMusic) {
            this.failedLinks.push(info);        
            return;
          };
          // const idMusic = links[0].replaceAll(" ", "").split("?v=")[1].replace("\n", "");
          // const musicUrl = youtube.createMusicUrl(idMusic);
          // youtubeFinalData.push({ name: youtube.getMusicName(), url: musicUrl });
          const musicUrl = brave.createMusicUrl(idMusic);
          youtubeFinalData.push({ name: info.musicName, url: musicUrl });
          this.failedLinks.splice(i, 1);
      }
      }
      return youtubeFinalData;
    })
  };

  private createFinalLink(musicInfos: musicInfos, data: any) {
      const brave = new Brave(musicInfos.musicName, musicInfos.artistName, musicInfos.albumName);
      brave.createSearchBraveUrl()
      const $ = cheerio.load(data);
      const hrefs = $('a[href]').map((_, element) => $(element).attr('href')).get();      
      const idMusic = hrefs.find(href => href.includes('watch?v='))?.split('?v=')[1]
      if (!idMusic) {
        this.failedLinks.push(musicInfos);        
        return;
      };
      const musicUrl = brave.createMusicUrl(idMusic);
      return { name: musicInfos.musicName, url: musicUrl };
  };

};

export type musicInfos = {
  artistName: string[],
  musicName: string,
  albumName: string
};