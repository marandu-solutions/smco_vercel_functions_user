import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  validateJWT(request, response, async (currentUser: CurrentUser) => {
    const xata = getXataClient();

    try {
      const result = await xata.db.news.select([
        "id", "ubs.id", "title", "text", "image_url", "created_by.name", "xata.createdAt", "xata.updatedAt"
      ]).filter({ ubs: currentUser.ubs }).getAll();

      const newsList = result.map(news => ({
        id: news.id,
        ubs: news.ubs.id,
        title: news.title,
        text: news.text,
        image_url: news.image_url,
        created_by: news.created_by.name,
        createdAt: news.xata.createdAt,
        updatedAt: news.xata.updatedAt
      }));

      const news = newsList.sort((a, b) => {
        const aDate = Math.max(new Date(a.createdAt).getTime(), new Date(a.updatedAt).getTime());
        const bDate = Math.max(new Date(b.createdAt).getTime(), new Date(b.updatedAt).getTime());

        return bDate - aDate;
      });

      return response.status(200).json(news);
    } catch (error) {
      return response.status(500).json({ message: "Failed to fetch news", error: error });
    }
  });
});
