import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";
import { deleteAppointment } from "../../types/appointment";


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "DELETE") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  validateJWT(request, response, async (currentUser: CurrentUser) => {
    const xata = getXataClient();

    try {
      const validatedData = deleteAppointment.parse(request.body);
      const { id } = validatedData;

      const appointmentItem = await xata.db.appointment.filter({ id: id }).getFirst();
      if (!appointmentItem) {
        return response.status(404).json({ message: "News not found or access denied" });
      }

      const deletedAppointment = await xata.db.appointment.update(id, {
        status: "canceled",
        updated_by: currentUser.id
      });

      return response.status(200).json({ message: "appointment soft deleted successfully", deletedAppointment });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return response.status(500).json({ message: "Failed to delete appointment", error });
    }
  });
});