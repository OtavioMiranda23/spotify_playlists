import axios from "axios"

test("Deve enviar uma playlist media do spotfy e receber os links de cada respectiva musica no youtube", async () => {
  const input = { playlist: '62w0vYw7cTiWlb6d5eAjPv' };
  const response = await axios.post("http://localhost:3015/convert", input);
  expect(response.data.length).toBe(37);  
  expect(response.status).toBe(201);
}, 1200000);

test("Deve enviar uma playlist media com musicas desconhecidas do spotfy e receber os links de cada respectiva musica no youtube", async () => {
  const input = { playlist: '5wwh5xcV9kQEvc3WlHGw2g' };
  const response = await axios.post("http://localhost:3015/convert", input);
  expect(response.data.length).toBe(38);  
  expect(response.status).toBe(201);  
}, 1200000);

test("Deve enviar uma playlist muito pequena do spotfy e receber os links de cada respectiva musica no youtube", async () => {
  const input = { playlist: '5h5dImXStQjOtu9xeoL9Vx' };
  const response = await axios.post("http://localhost:3015/convert", input);
  expect(response.data.length).toBe(4);  
  expect(response.status).toBe(201);
}, 1200000);

test.only("Deve enviar uma playlist enorme do spotfy e receber os links de cada respectiva musica no youtube", async () => {
  const input = { playlist: '6yPiKpy7evrwvZodByKvM9' };
  const response = await axios.post("http://localhost:3015/convert", input);
  expect(response.data.length).toBe(1000);  
  expect(response.status).toBe(201);
}, 1200000);