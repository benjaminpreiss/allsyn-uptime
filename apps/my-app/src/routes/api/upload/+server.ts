import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getIrysSolanaDevnetUploader } from '$lib/utilities/irys';
import { ReceiptMetadataSchema } from '$lib/utilities/schemas';
import { IRYS_UPLOADER_RPC_URL, SOL_WALLET_PRIVATE_KEY } from '$env/static/private';

// Type for the validated data
type ValidatedData = z.infer<typeof ReceiptMetadataSchema>;

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Parse the request body
		const body = await request.json();

		// Validate the data with Zod
		const validationResult = ReceiptMetadataSchema.safeParse(body);

		if (!validationResult.success) {
			return json(
				{
					success: false,
					error: validationResult.error.format()
				},
				{ status: 400 }
			);
		}

		const validatedData: ValidatedData = validationResult.data;

		// Initialize Irys on Solana devnet
		const uploader = await getIrysSolanaDevnetUploader(
			SOL_WALLET_PRIVATE_KEY,
			IRYS_UPLOADER_RPC_URL
		);

		// Upload data to Irys
		const receipt = await uploader.upload(JSON.stringify(validatedData), {
			tags: [
				{ name: 'Content-Type', value: 'application/json' }
				// Add any other tags you need
			]
		});

		// Return the transaction ID
		return json({
			success: true,
			receipt
		});
	} catch (error) {
		console.error('API Error:', error);

		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
