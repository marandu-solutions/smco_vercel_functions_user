import { getXataClient } from "../../database/xata";
import { z } from "zod";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";
import {createVacancyDistribution} from "../../schemas/vacancy_destribution";


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== "POST") {
        return response.status(405).json({ message: "Method Not Allowed" });
    }

    validateJWT(request, response, async (currentUser: CurrentUser) => {
        try {
            const createData = createVacancyDistribution.parse({
                ...request.body,
                created_by: currentUser.id,
                ubs: currentUser.ubs
            });

            const xata = getXataClient();
            const newVacancyDestribution = await xata.db.vacancy_destribution.create(createData);

            return response.status(201).json(newVacancyDestribution);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.log(error);
                return response.status(400).json({ message: "Validation error" });
            }
            console.error(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    });
});