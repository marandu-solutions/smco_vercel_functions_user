import {z} from "zod";

export const createVacancyDistribution = z.object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format, must be ISO 8601",
    }).transform((val) => new Date(val)),
    doctor: z.string(),
    vacancy_config: z.record(z.string(), z.number().positive()),
    priority_config: z.object({
        normal: z.number(),
        priority: z.number(),
    }),
    created_by: z.string(),
    ubs: z.string(),
});

export const updateVacancyDistribution = z.object({
    doctor: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format, must be ISO 8601",
    }).transform((val) => new Date(val)).optional(),
    priority: z.object({
        normal: z.number().optional(),
        priority: z.number().optional(),
    }).optional(),
    vacancy_config: z.record(z.string(), z.number().positive()).optional(),
    id: z.string()
}).partial();

export const deleteVacancyDistribution = z.object({
    id: z.string(),
});

export const getVacancyDistribution = z.object({
    datetime: z.string().refine((value) => !isNaN(Date.parse(value)), {
        message: "Invalid datetime format",
    }),
});