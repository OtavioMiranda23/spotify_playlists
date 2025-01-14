import SpotifyController from "./controllers/spotifyController";
import express from 'express';
import dotenv from 'dotenv';

const app = express();
dotenv.config();
const port = Number(process.env.PORT);
app.use(express.json());

const spotifyController = new SpotifyController(app);
spotifyController.convertPlaylist();
spotifyController.login();


app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
