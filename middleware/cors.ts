import { VercelRequest, VercelResponse } from "@vercel/node";

export const allowCors = (route: Function) => async (request: VercelRequest, response: VercelResponse) => {
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  return await route(request, response);
};
