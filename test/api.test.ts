import axios from "axios"
import dotenv from 'dotenv';

dotenv.config();

test("Deve enviar uma playlist enorme do spotfy e receber os links de cada respectiva musica no youtube", async () => {
  const inputLogin = { user: 'admin', password: '123' };
  const urlLogin = `http://localhost:${process.env.PORT}/login`;
  const headersLogin = {
    'Content-Type': 'application/json',
  };
  const responseLogin = await axios.post(urlLogin, inputLogin, { headers: headersLogin});
  expect(responseLogin.data.token).toBeDefined();
  expect(responseLogin.data.auth).toBe(true);
  const token = responseLogin.data.token;
  console.log(token);
  
  const input = { userId: '1',  playlist: '38I3kAxrRDcs6a4w7C9q71' };
  const headers = {
    'Content-Type': 'application/json',
    'x-access-token': token
  };
  const url = `http://localhost:${process.env.PORT}/convert`;  
  const response = await axios.post(url, input, { headers: headers});
  expect(response.data.length).toBe(6);
  expect(response.status).toBe(201);
}, 1200000);

