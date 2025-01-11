import axios from "axios"

test.only("Deve enviar uma playlist enorme do spotfy e receber os links de cada respectiva musica no youtube", async () => {
  const input = { playlist: '38I3kAxrRDcs6a4w7C9q71' };
  const response = await axios.post("http://localhost:3015/convert", input);
  expect(response.data.length).toBe(6);
  expect(response.status).toBe(201);
}, 1200000);