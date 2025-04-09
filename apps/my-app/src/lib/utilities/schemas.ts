import { z } from 'zod';

export const ReceiptMetadataSchema1 = z.object({
	subject: z.string().min(1), // RFC3986 URL
	keys: z.object({
		port: z.optional(z.boolean()), // net connection check on port
		status: z.optional(z.number()) // status code, e.g. 200 for http(s)
	}),
	version: z.literal(1)
	// Add any other fields you need
});

export const ReceiptMetadataSchema = ReceiptMetadataSchema1;
