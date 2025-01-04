import axios from 'axios';
import Youtube from '../entity/Youtube';
import * as cheerio from 'cheerio';

export default class CreateYoutubeLinksParallel {
  private failedLinks: musicInfos[] = [];
  public async execute(items: any): Promise<Output[]> {    
    console.log('entrou');
    
    const musicInfos: musicInfos[]  = [];
    for (const item of items) {
      const albumName = item.track.album.name;
      const artistName = item.track.artists.map((artist: any) => artist.name);
      const musicName = item.track.name;
      musicInfos.push({ musicName, artistName, albumName })
    };
    const youtubeLinks = musicInfos.map(info => {
      const youtube = new Youtube(info.musicName, info.artistName, info.albumName);
      youtube.createSearchGoogleUrl()
      return { name: info.musicName, url: youtube.getSearchUrl() };
    })
    const requests = youtubeLinks.map(link => axios.get(link.url));
    const youtubeFinalData: Output[] = [];
    return Promise.allSettled(requests).then(async results => {
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log("Success");
          const finalLink  = this.createFinalLink(musicInfos[index], result.value.data);
          if (finalLink) youtubeFinalData.push(finalLink); 
        } else {
          console.error("Failed");
        }
      })
      console.log(this.failedLinks);
      let maxRetry = 0;

        while (this.failedLinks.length && maxRetry < 3) {
          for (const [i, info] of this.failedLinks.entries()) {
            
            const youtube = new Youtube(info.musicName, info.artistName, info.albumName);
            youtube.createSearchGoogleUrlWithoutAlbum()
            const response = await axios.get(youtube.getSearchUrl());
            const $ = cheerio.load(response.data);
            const hrefs = $('a[href]').map((_, element) => $(element).attr('href')).get();
            const links = hrefs.filter(href => href?.includes('watch'));
            if (!links[0]) { 
              console.log(youtube.getSearchUrl());
              maxRetry ++;
              continue;
            }
            const idMusic = links[0].split("%3D")[1].split("&")[0];
            const musicUrl = youtube.createMusicUrl(idMusic);
            youtubeFinalData.push({ name: youtube.getMusicName(), url: musicUrl });
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
      const hrefs = $('a[href]').map((_, element) => $(element).attr('href')).get();
      const links = hrefs.filter(href => href?.includes('watch'));
      if (!links[0]) {
        this.failedLinks.push(musicInfos);        
        return;
      };
      const idMusic = links[0].split("%3D")[1].split("&")[0];
      const musicUrl = youtube.createMusicUrl(idMusic);
      return { name: musicInfos.musicName, url: musicUrl };
  };

};
export type Output = {
  name: string,
  url: string
}
export type musicInfos = {
  artistName: string[],
  musicName: string,
  albumName: string
};