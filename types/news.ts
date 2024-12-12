import { z } from "zod";

export const createNewsSchema = z.object({
  title: z.string(),
  text: z.string(),
  image_url: z.string().url().nullable(),
  created_by: z.string(),
  ubs: z.string(),
});
