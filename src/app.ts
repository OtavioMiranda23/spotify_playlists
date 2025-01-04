import axios from 'axios';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import  CreateYoutubeLinksParallel, { Output } from './usecase/CreateYoutubeLinkParallel';
import CreateYoutubeLinksAxios from './usecase/CreateYoutubeLinkAxios';
import { CreateLinkFactory } from './factory/CreateLinkFactory';

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

app.post('/convert', async function (req: Request, res: Response) {
  try {
    const token = await getSpotifyToken();
    const playlist = req.body.playlist;
    const fields = "fields=items%28track%28name%2C+album%28name%29%2C+artists%28name%29%29%29"
    const url = `https://api.spotify.com/v1/playlists/${playlist}/tracks?${fields}`;
    const response: any = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    }); 
    console.log(response.data.items.length);
    
    const youtubeLinks: Output[] = await CreateLinkFactory(response.data.items);
    res.status(201).json(youtubeLinks)
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