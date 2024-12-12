import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getXataClient } from '../../database/xata';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const xata = getXataClient();

  const record = await xata.db.user.create({
    birthdate: new Date("2000-01-01T00:00:00Z"),
    cpf: "11124233335",
    email: "email@zmail.com",
    gender: "masc",
    name: "teste",
    password_hash: "longer text",
    phone: "5584988588888",
    sus_id: "11142234345",
    ubs: "rec_ctd0ngtqrj60553q5fp0",
  });

  console.log(record);
}
