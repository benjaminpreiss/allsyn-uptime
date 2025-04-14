import { ReceiptMetadataSchema } from '$lib/utilities/schemas';
import { z } from 'zod';

export const checkerFormSchema = z.object({
	subjectScheme: z.literal('https').default('https'),
	subjectAuthorityHost: z.string().min(1),
	subjectAuthorityPort: z.number().nullable(),
	subjectPath: z.string().min(1).nullable(),
	subjectQuery: z.string().min(1).nullable(),
	subjectFragment: z.string().min(1).nullable(),
	keyPort: z.boolean().default(false),
	keyStatus: z.string().nullable()
});

export type CheckerFormSchema = z.infer<typeof checkerFormSchema>;

// transform form data to metadata pushable to an nft
export function formToMetadata({ form }: { form: CheckerFormSchema }) {
	const metadata: z.infer<typeof ReceiptMetadataSchema> = {
		keys: { port: form.keyPort, status: form.keyStatus ? parseInt(form.keyStatus) : undefined },
		subject: {
			authority: { host: form.subjectAuthorityHost, port: form.subjectAuthorityPort ?? undefined },
			scheme: form.subjectScheme,
			fragment: form.subjectFragment ?? undefined,
			query: form.subjectQuery ?? undefined,
			path: form.subjectPath ?? undefined
		},
		version: 1
	};
	return metadata;
}
