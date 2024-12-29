import axios from "axios"
import puppeteer from "puppeteer";

test("Deve fazer uma requisição e mostrar a playlist do usuario", async () => {
  const response = await axios.get("http://localhost:3000/playlist");
  console.debug(response.data);
  expect(response.data.length).toBeGreaterThan(0);
});

test("Deve procurar com a lib puppeteer o link do video no youtube e achar o correto", async () => {
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
  
  const browser2 = await puppeteer.launch();
  const page2 = await browser2.newPage();
  const url2 = "https://www.youtube.com/results?search_query=Onde+Anda+Voce++Toquinho++Vinícius+de+Moraes+20+Grandes+Sucessos+De+Toquinho+%26+Vinicius";
  await page2.goto(url2);
  const hrefs2 = await page2.evaluate(() => Array.from(
    document.querySelectorAll('a[href]'),
    a => a.getAttribute('href')
      )
    );
  const links2 = hrefs2.filter(href => href?.includes('watch'))
  browser2.close()
  expect(links2[2]).toContain("/watch?v=Gb5sbORA62w");
}, 20000);

test.only('Deve receber os valores da musica e gerar o link correto', async () => {
  
})