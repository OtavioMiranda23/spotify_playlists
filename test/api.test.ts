import axios from "axios"
import puppeteer from "puppeteer";

test("Deve fazer uma requisição e mostrar a playlist do usuario", async () => {
  const response = await axios.get("http://localhost:3000/playlist");
  console.debug(response.data);
  expect(response.data.length).toBeGreaterThan(0);
});

test.only("Deve procurar o link do video no youtube e achar o correto", async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = "https://www.youtube.com/results?search_query=paralelas+belchior+Coração+Selvagem"
  await page.goto(url);
  
  const hrefs = await page.evaluate(() => Array.from(
        document.querySelectorAll('a[href]'),
        a => a.getAttribute('href')
      )
    );
  const links = hrefs.filter(href => href?.includes('watch'))
  browser.close()
  expect(links[2]).toBe("/watch?v=fVNUe4np2SM&pp=ygUlcGFyYWxlbGFzIGJlbGNoaW9yIENvcmHDp8OjbyBTZWx2YWdlbQ%3D%3D");
}, 10000)