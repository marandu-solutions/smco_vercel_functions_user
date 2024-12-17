import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { UserJwt as CurrentUser } from "../../types/user";
import { allowCors } from "../../middleware/cors";
import {approveUser} from "../../schemas/user";
 

export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== "PUT") {
        return response.status(405).json({ message: "Method Not Allowed" });
    }

    validateJWT(request, response, async (currentUser: CurrentUser) => {
        const xata = getXataClient();

        try {
            const validatedData = approveUser.parse(request.body);

            const { id, ...updateData } = validatedData;
            const userToUpdate = await xata.db.user.filter({ xata_id: id }).getFirst();
            if (!userToUpdate) {
                return response.status(404).json({ message: "user not found or access denied" });
            }

            const updatedUser = await xata.db.user.update(id, updateData);

            return response.status(200).json({ message: "user updated successfully", updatedUser });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return response.status(400).json({ message: "Validation error", errors: error.errors });
            }
            return response.status(500).json({ message: "Failed to update user", error });
        }
    });
});
