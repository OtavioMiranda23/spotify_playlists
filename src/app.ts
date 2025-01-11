import axios from 'axios';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import  { musicInfos, Output } from './usecase/CreateYoutubeLinksParallelWithGoogle';
import { CreateLinkFactory } from './factory/CreateLinkFactory';
import { sleep } from './utils/Sleep';
import { SpotifyService } from './service/SpotifyService';

dotenv.config();
const app = express();
const port = 3015;
app.use(express.json());



app.post('/convert', async function (req: Request, res: Response) {
  try {
    const spotifyService = new SpotifyService();
    const token = await spotifyService.getSToken();
    const playlist = req.body.playlist;
    const limitPage = 2; 
    let hasNextPage = true;
    let url = `https://api.spotify.com/v1/playlists/${playlist}/tracks?limit=${limitPage}`;
    const youtubeLinks = [];
    for (let i = 1; i < 4 && hasNextPage; i++) {    
      const response: any = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      url = response.data.next;      
      const items: playlistItem[] = response.data.items;
      if (response.data.next === null) {
        hasNextPage = false;
      } 
      const datasFromApi = [];
      for (const item of items) {
        const dataFromApi = extractDataFromApiSpotify(item);
        if(!dataFromApi.musicName) continue
        datasFromApi.push(dataFromApi); 
      }
      const links: Output[] | undefined = await CreateLinkFactory(datasFromApi, i);
      console.log(`Final Links ${i}:`, links);
      if (links) youtubeLinks.push(links
      );
    };
    res.status(201).json(youtubeLinks.flat())
  } catch (error: any) {
    console.error('Erro ao buscar playlist:', error);
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

function extractDataFromApiSpotify(item: playlistItem): musicInfos  {
  const musicName = item.track.name;
  const artistName = item.track.artists.map(artist => artist.name);
  const albumName = item.track.album.name;  
  return { musicName, artistName, albumName };
};

type playlistItem  = {
  track: {
      name: string;
      artists: { name: string }[];
      album: { name: string };
  };
}