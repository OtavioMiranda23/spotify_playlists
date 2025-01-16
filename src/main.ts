import SpotifyController from "./infra/controllers/spotifyController";
import express from 'express';
import dotenv from 'dotenv';
import CreateUser from "./usecase/CreateUser";
import UserRepository from "./infra/repositories/UserRepository";
import sqlite3, { Database }  from "sqlite3";

const app = express();
dotenv.config();
const port = Number(process.env.PORT);
app.use(express.json());

const db = new sqlite3.Database(".");
const userRepository = new UserRepository(db);
const createUser = new CreateUser(userRepository);
const spotifyController = new SpotifyController(app, createUser);
spotifyController.convertPlaylist();
spotifyController.login();


app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});


