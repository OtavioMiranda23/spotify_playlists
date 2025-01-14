import axios from 'axios';

import { CreateLinkFactory } from '../factory/CreateLinkFactory';
import { SpotifyService } from '../service/SpotifyService';
import { Output } from '../usecase/CreateYoutubeLinksParallelWithGoogle';
import { Application, NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload }  from 'jsonwebtoken'

let SECRET = 'otaviomda'

interface DecodedToken extends JwtPayload {
  userId: string;
}

export default class SpotifyController {
  constructor(readonly app: Application) {
  }

  convertPlaylist () {
    this.app.post('/convert', this.verifyJWT, async function (req: Request, res: Response) {
      try {
        //@ts-ignore
        console.log(req.userId, 'fez essa chamada');
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
            const dataFromApi = spotifyService.extractDataFromApiSpotify(item);
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
  }
  verifyJWT(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-access-token'];
    if (!token) res.status(400).end();
    //@ts-ignore
    jwt.verify(token, SECRET, (err: any, decoded: any) => {
      if(err) return err.status(401).end();
      const payload = decoded as DecodedToken
      //@ts-ignore
      req.userId = decoded.userId;
      next();
    })
  }

  login() {
    this.app.post('/login', (req: Request, res: Response) => {
      if (req.body.user === "admin" && req.body.password === '123') {
        const token = jwt.sign({ userId: 1}, SECRET, { expiresIn: 300 });
        return res.json({ auth: true, token });
      }
      res.status(401).end();
    })

  }

}

export type playlistItem  = {
  track: {
      name: string;
      artists: { name: string }[];
      album: { name: string };
  };
}