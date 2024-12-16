import { z } from "zod";
import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";
import {updateVacancyDistribution} from "../../schemas/vacancy_destribution";

export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method === "PUT") {
        validateJWT(request, response, async (currentUser: CurrentUser) => {
            try {
                const updatePayload = updateVacancyDistribution.partial().parse({
                    ...request.body,
                    updated_by: currentUser.id
                });

                const {id, ...updateData} = updatePayload;

                const xata = getXataClient();
                // @ts-ignore
                const updatedVacancyDistribution = await xata.db.vacancy_destribution.update(id, updateData);

                return response.status(200).json(updatedVacancyDistribution);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    console.log(error);
                    return response.status(400).json({ message: "Validation error" });
                }
                console.error(error);
                return response.status(500).json({ message: "Internal server error" });
            }
        });
    } else {
        return response.status(405).json({ message: "Method Not Allowed" });
    }
});