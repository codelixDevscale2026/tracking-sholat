import { z } from "zod";

export const updateSettingsSchema = z.object({
	globalBufferMinutes: z.number().min(5).max(60).optional(),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
	timezone: z.string().optional(),
	autoDetectLocation: z.boolean().optional(),
	calculationMethod: z
		.enum(["mwl", "isna", "egypt", "karachi", "tehran", "kemenag"])
		.optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const availableCalculationMethods = [
	{ value: "mwl", label: "Muslim World League (MWL)" },
	{ value: "isna", label: "Islamic Society of North America (ISNA)" },
	{ value: "egypt", label: "Egyptian General Authority of Survey" },
	{ value: "karachi", label: "University of Islamic Sciences, Karachi" },
	{ value: "tehran", label: "Institute of Geophysics, University of Tehran" },
	{ value: "kemenag", label: "Kementerian Agama RI" },
];
