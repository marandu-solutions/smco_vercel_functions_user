import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { UserJwt as CurrentUser } from "../../types/user";

const updateNewsSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
});

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "PUT") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  validateJWT(request, response, async (currentUser: CurrentUser) => {
    const xata = getXataClient();

    try {
      const validatedData = updateNewsSchema.parse(request.body);

      const { id, title, text } = validatedData;
      const newsItem = await xata.db.news.filter({ id, "ubs.id": currentUser.ubs }).getFirst();
      if (!newsItem) {
        return response.status(404).json({ message: "News not found or access denied" });
      }

      const updatedNews = await xata.db.news.update(id, {
        title: title,
        text: text,
      });

      return response.status(200).json({ message: "News updated successfully", updatedNews });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error(error);
      return response.status(500).json({ message: "Failed to update news", error });
    }
  });
}
