import { createHash } from "crypto";

export function hashPassword(password: string, cpf: string): string {
  const saltedPassword = password + cpf;
  const hash = createHash('sha256');
  hash.update(saltedPassword);
  return hash.digest('hex');
}
