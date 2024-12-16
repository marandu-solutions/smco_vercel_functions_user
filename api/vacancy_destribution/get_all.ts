import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";
import { getVacancyDistribution } from "../../schemas/vacancy_destribution";

export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== "GET") {
        return response.status(405).json({ message: "Method Not Allowed" });
    }

    validateJWT(request, response, async (currentUser: CurrentUser) => {
        const queryValidation = getVacancyDistribution.safeParse(request.query);
        if (!queryValidation.success) {
            return response.status(400).json({ message: "Invalid query parameter", errors: queryValidation.error.errors });
        }

        const { datetime } = queryValidation.data;
        const selectedDate = new Date(datetime);

        const xata = getXataClient();

        try {
            const result = await xata.db.vacancy_destribution.select([
                "xata_id",
                "doctor.name",
                "ubs.xata_id",
                "date",
                "vacancy_config",
                "priority_config",
                "xata_createdat",
                "xata_updatedat",
            ]).filter({ ubs: currentUser.ubs }).getAll();
            console.log(result);
            const filteredResults = result.filter((item) => {
                const itemDate = new Date(item.date);
                return (
                    itemDate.getUTCFullYear() === selectedDate.getUTCFullYear() &&
                    itemDate.getUTCMonth() === selectedDate.getUTCMonth() &&
                    itemDate.getUTCDate() === selectedDate.getUTCDate()
                );
            });

            const appointmentCategories = filteredResults.map((appointmentCategory) => ({
                id: appointmentCategory.xata_id,
                ubs: appointmentCategory.ubs?.xata_id || null,
                doctor: appointmentCategory.doctor.name,
                date: appointmentCategory.date,
                vacancy_config: appointmentCategory.vacancy_config,
                priority_config: appointmentCategory.priority_config,
                created_at: appointmentCategory.xata_createdat,
                updated_at: appointmentCategory.xata_updatedat,
            }));

            return response.status(200).json(appointmentCategories);
        } catch (error) {
            return response.status(500).json({ message: "Failed to fetch appointment categories", error: error });
        }
    });
});
