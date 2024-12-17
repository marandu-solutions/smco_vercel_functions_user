import { z } from 'zod';

export const userSchema = z.object({
  birthdate: z.string().transform((val) => new Date(val)),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  email: z.string().email("E-mail inválido"),
  gender: z.enum(["masc", "fem", "other"]),
  name: z.string().min(1, "Nome é obrigatório"),
  password_hash: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  phone: z.string().min(10, "Número de telefone inválido"),
  sus_id: z.string().min(1, "SUS ID é obrigatório"),
  ubs: z.string().min(1, "UBS é obrigatório"),
});

export const loginSchema = z.object({
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const approveUser = z.object({
  id: z.string(),
  status: z.boolean(),
});
