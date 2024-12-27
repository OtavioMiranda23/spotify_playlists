import axios from "axios"

test("Deve fazer uma requisição e mostrar a playlist do usuario", async () => {
  const response = await axios.get("http://localhost:3000/playlist");
  console.debug(response.data);
  expect(response.data).toBeDefined();
});