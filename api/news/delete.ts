import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { UserJwt as CurrentUser } from "../../types/user";
import { deleteNewsSchema } from "../../schemas/news";
import { allowCors } from "../../middleware/cors";


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "DELETE") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  validateJWT(request, response, async (currentUser: CurrentUser) => {
    const xata = getXataClient();

    try {
      const validatedData = deleteNewsSchema.parse(request.body);
      const { id } = validatedData;

      const newsItem = await xata.db.news.filter({ id: id }).getFirst();
      if (!newsItem) {
        return response.status(404).json({ message: "News not found or access denied" });
      }

      const deletedNews = await xata.db.news.update(id, {
        status: false,
      });

      return response.status(200).json({ message: "News soft deleted successfully", deletedNews });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error(error);
      return response.status(500).json({ message: "Failed to delete news", error });
    }
  });
});