import puppeteer from 'puppeteer';
import Youtube from '../entity/Youtube';

export default class CreateYoutubeLinks {
  public async execute(items: any): Promise<string[]> {    
    const musicInfos: musicInfos[]  = [];
    for (const item of items) {
      const albumName = item.track.album.name;
      const artistName = item.track.artists.map((artist: any) => artist.name);
      const musicName = item.track.name;
      musicInfos.push({ musicName, artistName, albumName })
    };
    const youtubeLinks: string[] = [];
    for (const info of musicInfos) {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const youtube = new Youtube(info.musicName, info.artistName, info.albumName);
      youtube.createSearchUrl();
      await page.goto(youtube.getSearchUrl());
      const hrefs = await page.evaluate(() => Array.from(
            document.querySelectorAll('a[href]'),
            a => a.getAttribute('href')
          )
        );
      const links = hrefs.filter(href => href?.includes('watch'));
      browser.close();      
      if (!links[0]) { 
        throw new Error("Não foi encontrado link para a musica");
      };
      const musicUrl = youtube.createMusicUrl(links[0])
      youtubeLinks.push(musicUrl);
    }
    return youtubeLinks;
  };
};

type musicInfos = {
  artistName: string[],
  musicName: string,
  albumName: string
};