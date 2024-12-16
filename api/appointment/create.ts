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

  await validateJWT(request, response, async (currentUser: CurrentUser) => {
    const xata = getXataClient();

    let userData;
    try {
      userData = createAppointment.parse({
        ...request.body,
        ubs: currentUser.ubs,
        created_by: currentUser.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Validation failed", errors: error.errors });
      }
      console.error("Unexpected error during payload parsing:", error);
      return response.status(500).json({ message: "Unexpected error", error });
    }

    try {
      const vacancyConfig = await xata.db.vacancy_destribution.filter({
        date: userData.scheduled_date,
      }).getFirst();

      if (!vacancyConfig) {
        return response.status(400).json({ message: "No vacancy configuration found for the specified date" });
      }

      const availableSlots = vacancyConfig.vacancy_config[userData.appointment_category];
      if (!availableSlots) {
        return response.status(400).json({ message: "No available slots for the selected appointment category" });
      }

      const existingAppointments = await xata.db.appointment.select(["xata_id"]).filter({
        appointment_category: userData.appointment_category,
        scheduled_date: userData.scheduled_date,
      }).getAll();

      if (existingAppointments.length >= availableSlots) {
        return response.status(400).json({ message: "No more available slots for the selected appointment category and date" });
      }

      const appointment = await xata.db.appointment.create(userData);
      return response.status(200).json(appointment);
    } catch (error) {
      console.error("Unexpected error during appointment creation:", error);
      return response.status(500).json({ message: "Failed to create appointment" });
    }
  });
});
