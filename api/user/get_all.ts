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
    if (currentUser.profile !== "manager") {
        return response.status(401).json({ message: "Your profile does not allow" });
    }

    const xata = getXataClient();
    try {
      const result = await xata.db.user.select([
        "xata_id", "ubs.xata_id", "name", "profile"
      ]).filter({ ubs: currentUser.ubs }).getAll();

      const users = result.map(user => ({
        id: user.xata_id,
        ubs: user.ubs,
        name: user.name,
        profile: user.profile
      }));

      return response.status(200).json(users);
    } catch (error) {
      return response.status(500).json({ message: "Failed to fetch appointment categories", error: error });
    }
  });
});
