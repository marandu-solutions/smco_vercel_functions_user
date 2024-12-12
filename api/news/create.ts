import { getXataClient } from "../../database/xata";
import { z } from "zod";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserJwt as CurrentUser } from "../../types/user";
import { createNewsSchema } from "../../types/news";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  validateJWT(request, response, async (currentUser: CurrentUser) => {
    let newsData;

    try {
      newsData = createNewsSchema.parse({ ...request.body, created_by: currentUser.id, ubs: currentUser.ubs });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Validation failed", errors: error.errors });
      }
      console.log(error);
      return response.status(500).json({ message: "Unexpected error", error: error });
    }

    const xata = getXataClient();
    try {
      const news = await xata.db.news.create(newsData);
      return response.status(200).json({ message: "News created successfully", news: news });
    } catch (error) {
      return response.status(500).json({ message: "Failed to create news", error });
    }
  });
}
