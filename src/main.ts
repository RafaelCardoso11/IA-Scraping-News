import puppeteer from "puppeteer";

const url = "";

async function scrapeWebsite() {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
    });
    const page = await browser.newPage();
    await page.goto(url);

    const elements = await page.$$eval(".feed-post-body", el => el.map(e => e.textContent));
    console.log(elements);
  } catch (error) {
    console.error("Erro ao fazer web scraping:", error);
    return [];
  }
}

scrapeWebsite();
