import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
interface ContentData {
  title: string;
  subtitle: string;
  by: string;
  interTitle: string[];
  news: string[];
}

interface PostData {
  title: string;
  content: ContentData;
}

async function scrapeWebsite(url: string) {
  const response = await axios.get(url);
  const html = response.data;

  const $ = cheerio.load(html);
  return $;
}

const selectors = {
  containerNews: ".feed-post-body",
  titleNews: ".feed-post-body-title",
  contentNews: {
    title: ".content-head__title",
    subTitle: ".content-head__subtitle",
    interTitle: ".content-intertitle",
    news: ".content-text__container",
  },
};

const url = "https://g1.globo.com/";

async function main() {
  const $Posts = await scrapeWebsite(url);

  const posts = $Posts(selectors.containerNews);
  const limitedPosts = posts.slice(0, 20);

  const promises = $Posts(limitedPosts)
    .map(async (_, element): Promise<PostData> => {
      const post = $Posts(element).find(selectors.titleNews);

      const link = $Posts(post).find("a").attr("href");

      if (link) {
        const $Post = await scrapeWebsite(link);
        const title = $Post(selectors.contentNews.title).text();
        const subtitle = $Post(selectors.contentNews.subTitle).text();
        const interTitle = $Post(selectors.contentNews.interTitle)
          .map((_, it) => $Post(it).text())
          .toArray();

        const news = $Post(selectors.contentNews.news)
          .map((_, news) => $Post(news).text())
          .toArray();

        return {
          title: $Posts(post[0]).text(),
          content: {
            title,
            subtitle,
            by: "IA - Inteligencia artificial",
            interTitle,
            news,
          },
        };
      }
      throw new Error(`Could not find`);
    })
    .toArray();

  const results = await Promise.all(promises);
  fs.writeFileSync("output/news.json", JSON.stringify(results), "utf8");
}
main();
