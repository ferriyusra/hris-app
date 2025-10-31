import { z } from 'zod';

export const menuSchema = z.object({
	id: z.string(),
	name: z.string(),
	price: z.number(),
	description: z.string().optional(),
});

export type Menu = z.infer<typeof menuSchema>;
