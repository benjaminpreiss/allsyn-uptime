import { z } from 'zod';

export const subjectSchemeSchema = z.literal('https');
export const subjectAuthorityHostSchema = z.string().min(1);
export const subjectAuthorityPortSchema = z.optional(z.number());
export const subjectPathSchema = z.optional(z.string().min(1));
export const subjectQuerySchema = z.optional(z.string().min(1));
export const subjectFragmentSchema = z.optional(z.string().min(1));
export const keyPortSchema = z.optional(z.boolean());
export const keyStatusSchema = z.optional(z.number());

export const ReceiptMetadataSchema1 = z.object({
	subject: z.object({
		scheme: subjectSchemeSchema,
		authority: z.object({
			// e.g. google.com
			host: subjectAuthorityHostSchema,
			// port can optionally be specified, mostly given by scheme (e.g. https -> 443)
			port: subjectAuthorityPortSchema
		}),
		// The path after google.com:8042/path/here
		path: subjectPathSchema,
		// The part :8042/over/there?query=here
		query: subjectQuerySchema,
		// The part after query: ?name=ferret#frament-here
		fragment: subjectFragmentSchema
	}), // RFC3986 URL
	keys: z
		.object({
			port: keyPortSchema, // net connection check on port
			status: keyStatusSchema // status code, e.g. 200 for http(s)
		})
		.refine((val) => val.port !== undefined || val.status !== undefined, {
			message: 'At least one key (port or status) must be defined'
		}),
	version: z.literal(1)
	// Add any other fields you need
});

export const ReceiptMetadataSchema = ReceiptMetadataSchema1;
