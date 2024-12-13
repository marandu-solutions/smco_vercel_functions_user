import { z } from "zod";

export const createAppointmentCategory = z.object({
  name: z.string(),
  ubs: z.string(),
});

export const updateAppointmentCategory = z.object({
  id: z.string(),
  name: z.string(),
});

export const deleteAppointmentCategory = z.object({
  id: z.string(),
});
