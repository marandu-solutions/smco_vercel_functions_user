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
      const patientsResult = await xata.db.user.select(["id", "name"]).filter({ ubs: currentUser.ubs }).getAll();
      const appointmentCategoriesResult = await xata.db.user.select(["id", "name"]).filter({ ubs: currentUser.ubs }).getAll();

      const createOptions = {
        patients: patientsResult.map(user => ({
          id: user.id,
          name: user.name
        })),
        appointmentCategories: appointmentCategoriesResult.map(appointmentCategory => ({
          id: appointmentCategory.id,
          name: appointmentCategory.name
        }))
      };

      return response.status(200).json(createOptions);
    } catch (error) {
      return response.status(500).json({ message: "Failed to fetch users", error: error });
    }
  });
});
