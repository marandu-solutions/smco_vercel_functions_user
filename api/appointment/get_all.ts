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
        "xata_id",
        "patient.name",
        "doctor.name",
        "created_by.name",
        "scheduled_date",
        "status",
        "appointment_category.name",
        "previous_appointment.xata_id",
        "xata_createdat",
        "updated_by.name",
        "xata_updatedat"
      ]).filter({ ubs: currentUser.ubs }).sort("xata_createdat").getAll();

      const appointments = result.map(appointment => ({
        id: appointment.xata_id,
        patient: appointment.patient.name,
        doctor: appointment.doctor?.name ?? null,
        created_by: appointment.created_by.name,
        scheduled_date: appointment.scheduled_date,
        status: appointment.status,
        previous_appointment: appointment.previous_appointment?.xata_id ?? null,
        scheduled_at: appointment.xata_createdat,
        updated_by: appointment.updated_by?.name ?? null,
        updated_at: appointment.xata_updatedat,
        appointment_category: appointment.appointment_category.name,
      }));

      return response.status(200).json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return response.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
});
