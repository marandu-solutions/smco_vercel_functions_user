import { getXataClient } from "../../database/xata";
import { z } from "zod";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";
import { createAppointment } from "../../types/appointment";


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  validateJWT(request, response, async (currentUser: CurrentUser) => {
    let userData;
    try {
      userData = createAppointment.parse({
        ...request.body,
        ubs: currentUser.ubs,
        created_by: currentUser.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Validation failed", errors: error.errors });
      }
      return response.status(500).json({ message: "Unexpected error", error: error });
    }

    const xata = getXataClient();
    try {
      const appointment = await xata.db.appointment.create(userData);
      return response.status(200).json({ message: "Appointment category created successfully", appointment: appointment });
    } catch (error) {
      return response.status(500).json({ message: "Failed to create appointment category", error });
    }
  });
});
