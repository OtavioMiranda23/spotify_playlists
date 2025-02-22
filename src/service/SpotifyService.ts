import axios from "axios";
import { musicInfos } from "../usecase/CreateYoutubeLinksParallelWithGoogle";
import { playlistItem } from "../infra/controllers/spotifyController";

export class SpotifyService {
  private clientId = process.env.CLIENT_ID;
  private clientSecret = process.env.CLIENT_SECRET;
  constructor() {
    if (!this.clientId) throw new Error("ClientId não definido");
    if (!this.clientSecret) throw new Error("clientSecret não definido");
  }
  
  async getSToken() {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
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

extractDataFromApiSpotify(item: playlistItem): musicInfos  {
  const musicName = item.track.name;
  const artistName = item.track.artists.map(artist => artist.name);
  const albumName = item.track.album.name;  
  return { musicName, artistName, albumName };
};

}