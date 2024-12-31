import axios from "axios"
import puppeteer from "puppeteer";

test.only("Deve enviar uma playlist do spotfy e receber os links de cada respectiva musica no youtube", async () => {
  const input = { playlist: '62w0vYw7cTiWlb6d5eAjPv' };
  const response = await axios.post("http://localhost:3015/spotifytoyoutube", input);
  expect(response.data.length).toBe(37);
  expect(response.data[0]).toContain('/watch?v=XTb9GNIxpMk');
  expect(response.data[1]).toContain('/watch?v=w1WO-jkbcrY');
  expect(response.data[2]).toContain('/watch?v=UsXioRxVGO8');
}, 1200000);