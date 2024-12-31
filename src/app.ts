import axios from 'axios';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import Youtube from './entity/Youtube';

dotenv.config();
const app = express();
const port = 3015;
app.use(express.json());

async function getSpotifyToken() {
  const clientId = process.env.CLIENT_ID;
  if (!clientId) throw new Error("ClientId não definido");
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) throw new Error("clientSecret não definido");
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter token:', error);
    throw error;
  }
}

app.post('/playlist', async function (req: Request, res: Response) {
  try {
    const token = await getSpotifyToken();
    const playlist = req.body.playlist;
    const fields = "fields=items%28track%28name%2C+album%28name%29%2C+artists%28name%29%29%29"
    const url = `https://api.spotify.com/v1/playlists/${playlist}/tracks?${fields}`;
    const response: any = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    }); 
    const musicInfos: musicInfos[]  = [];
    for (const item of response.data.items) {
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
      //const urlYoutube = createYoutubeUrl(info);
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
    res.json(youtubeLinks);
  } catch (error: any) {
    console.error('Erro ao buscar playlist:', error.message);

    // Trata os erros da API do Spotify
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).send({ error: 'Erro interno do servidor.' });
  }
});


app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});

function createYoutubeUrl(musicInfos: musicInfos): string {
  const baseUrl = "https://www.youtube.com/results?search_query=";
  const artist = musicInfos.artistName.toString().replaceAll(" ", "+").replaceAll(",", "+");
  const album = musicInfos.albumName.replaceAll(" ", "+");
  const music = musicInfos.musicName.replaceAll(" ", "+");
  const urlYoutube = `${baseUrl}+${music}+${artist}+${album}`;
  return urlYoutube;
};

type musicInfos = {
  artistName: string[],
  musicName: string,
  albumName: string
};