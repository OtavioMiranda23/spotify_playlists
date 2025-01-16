import axios from 'axios';

import { SpotifyService } from '../../service/SpotifyService';
import { Output } from '../../usecase/CreateYoutubeLinksParallelWithGoogle';
import { Application, NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload }  from 'jsonwebtoken'
import CreateUser from '../../usecase/CreateUser';
import UserRepository from '../repositories/UserRepository';
import { CreateLinkFactory } from '../factory/CreateLinkFactory';

let SECRET = 'otaviomda'

interface DecodedToken extends JwtPayload {
  userId: string;
}
interface AuthenticatedRequest extends Request {
  userId?: string;
}

export default class SpotifyController {
  public blacklist: string[] = [];
  
  constructor(readonly app: Application, readonly createUser: CreateUser) {
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

  register() {
    this.app.post('/register', async (req: Request, res: Response) => {
      const { username, email, password } = req.body;
      this.createUser.execute({ username, email, password })
    })
  }

  verifyJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers['x-access-token'];
    if (!token|| typeof token !== 'string') return res.status(400).json( { error: "Token não fornecido"});
    jwt.verify(token, SECRET, (err, decoded) => {
      if(err) return res.status(401).json({ error: 'Token inválido ou expirado.' });
      const payload = decoded as DecodedToken
      req.userId = payload.userId;
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

  logout() {
    this.app.post('/logout',  (req, res) => {
      const token = req.headers['x-access-token'];
      if (!token || typeof token !== 'string') return res.status(400).json({ error: "Token não fornecido ou inválido" });
      this.blacklist.push(token);
      res.status(200).json({ message: "Logout realizado com sucesso." });
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