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
      const result = await xata.db.appointment_category.select([
        "id", "ubs.id", "name",
      ]).filter({ ubs: currentUser.ubs }).getAll();

      const appointmentCategories = result.map(appointmentCategory => ({
        id: appointmentCategory.id,
        ubs: appointmentCategory.ubs,
        name: appointmentCategory.name
      }));

      return response.status(200).json(appointmentCategories);
    } catch (error) {
      return response.status(500).json({ message: "Failed to fetch appointment categories", error: error });
    }
  });
});
