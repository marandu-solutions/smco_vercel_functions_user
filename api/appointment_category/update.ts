import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";
import { updateAppointmentCategory } from "../../schemas/appointment_category";


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "PUT") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  validateJWT(request, response, async (currentUser: CurrentUser) => {
    const xata = getXataClient();

    try {
      const validatedData = updateAppointmentCategory.parse(request.body);

      const { id, name } = validatedData;
      const appoinmentCategory = await xata.db.news.filter({ id, "ubs.id": currentUser.ubs }).getFirst();
      if (!appoinmentCategory) {
        return response.status(404).json({ message: "News not found or access denied" });
      }

      const updatedAppointmentCategory = await xata.db.appointment_category.update(id, {
        name: name,
      });

      return response.status(200).json({ message: "appoinment category updated successfully", updatedAppointmentCategory });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return response.status(500).json({ message: "Failed to update appoinment category", error });
    }
  });
});
