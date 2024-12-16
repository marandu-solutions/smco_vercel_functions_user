import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";
import { deleteAppointmentCategory } from "../../schemas/appointment_category";


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "DELETE") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  validateJWT(request, response, async (currentUser: CurrentUser) => {
    const xata = getXataClient();

    try {
      const validatedData = deleteAppointmentCategory.parse(request.body);
      const { id } = validatedData;

      const appointmentCategoryItem = await xata.db.appointment_category.filter({ id: id }).getFirst();
      if (!appointmentCategoryItem) {
        return response.status(404).json({ message: "Appointment category not found or access denied" });
      }

      const deletedAppointmentCategory = await xata.db.appointment_category.delete(id);

      return response.status(200).json({ message: "Appointment category soft deleted successfully", deletedAppointmentCategory });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error(error);
      return response.status(500).json({ message: "Failed to delete Appointment category", error });
    }
  });
});