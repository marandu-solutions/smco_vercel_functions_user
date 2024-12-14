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
      const result = await xata.db.appointment.select([
        "id", "patient.name", "doctor.name", "created_by.name", "scheduled_date", "status", "appointment_category.name",
        "previous_appointment.id", "xata.createdAt", "updated_by.name", "xata.updatedAt"
      ]).filter({ ubs: currentUser.ubs }).sort("xata.createdAt").getAll();

      const appointments = result.map(appointment => ({
        id: appointment.id,
        patient: appointment.patient.name,
        doctor: appointment.doctor.name,
        created_by: appointment.created_by.name,
        scheduled_date: appointment.scheduled_date,
        status: appointment.status,
        previous_appointment: appointment.previous_appointment,
        scheduled_at: appointment.xata.createdAt,
        updated_by: appointment.updated_by.name,
        updated_at: appointment.xata.updatedAt,
        appointment_category: appointment.appointment_category.name,
      }));

      return response.status(200).json(appointments);
    } catch (error) {
      return response.status(500).json({ message: "Failed to fetch appointments", error: error });
    }
  });
});
