import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";
import {deleteVacancyDistribution} from "../../schemas/vacancy_destribution";


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== "DELETE") {
        return response.status(405).json({ message: "Method Not Allowed" });
    }

    validateJWT(request, response, async (currentUser: CurrentUser) => {
        const xata = getXataClient();

        try {
            const validatedData = deleteVacancyDistribution.parse(request.body);
            const { id } = validatedData;

            const appointmentCategoryItem = await xata.db.vacancy_destribution.filter({ id: id }).getFirst();
            if (!appointmentCategoryItem) {
                return response.status(404).json({ message: "vacancy distribution not found or access denied" });
            }

            const deletedAppointmentCategory = await xata.db.vacancy_destribution.delete(id);
            return response.status(200).json(deletedAppointmentCategory);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return response.status(400).json({ message: "Validation error", errors: error.errors });
            }
            console.error(error);
            return response.status(500).json({ message: "Failed to delete vacancy distribution", error });
        }
    });
});