import { z } from 'zod';

export const createAppointment = z.object({
    appointment_category: z.string(),
    created_by: z.string(),
    patient: z.string(),
    scheduled_date: z.date(),
    ubs: z.string(),
});

export const updateAppointment = z.object({
    doctor: z.string(),
    status: z.string(),
    appointment_category: z.string(),
    updated_by: z.string(),
    scheduled_date: z.date(),
    id: z.string(),
});

export const deleteAppointment = z.object({
    id: z.string(),
});
