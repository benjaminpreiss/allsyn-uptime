import { bs58ToField, getReceiptDataFromTokenId } from '$lib/utilities/aleo';
import type { PageLoad } from './$types';
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
	const tokenIdField = bs58ToField(params.tokenIdBs58);
	const receiptData = await getReceiptDataFromTokenId({ tokenId: tokenIdField });
	return receiptData;
};
