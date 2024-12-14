import { getXataClient } from "../../database/xata";
import { validateJWT } from "../../middleware/jwt";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { UserJwt as CurrentUser, UserDetails } from "../../types/user";
import { allowCors } from "../../middleware/cors";


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  validateJWT(request, response, async (currentUser: CurrentUser) => {
    const xata = getXataClient();

    try {
      const result = await xata.db.user.select([
        "id", "name", "cpf", "status", "birthdate", "email", "gender", "phone", "ubs.id",
        "social_name", "profile_pic_url", "sus_id", "profile"
      ]).filter({ id: currentUser.id }).getFirst();

      if (!result) {
        return response.status(404).json({ message: "User not found" });
      }

      const userDetails: UserDetails = {
        id: result.id,
        name: result.name,
        cpf: result.cpf,
        status: result.status,
        birthdate: result.birthdate,
        email: result.email,
        gender: result.gender,
        phone: result.phone,
        social_name: result.social_name,
        profile_pic_url: result.profile_pic_url,
        sus_id: result.sus_id,
        ubs: result.ubs.id,
        profile: result.profile
      };

      return response.status(200).json(userDetails);
    } catch (error) {
      return response.status(500).json({ message: "Failed to fetch user details", error: error });
    }
  });
});
