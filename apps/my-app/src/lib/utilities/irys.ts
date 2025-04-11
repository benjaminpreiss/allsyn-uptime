import { Uploader } from '@irys/upload';
import { Solana } from '@irys/upload-solana';
import BaseNodeIrys from '@irys/upload/esm/base';

export async function getIrysSolanaDevnetUploader(privateKey: string, rpc: string) {
	// RPC URLs change often. Use a current one from https://chainlist.org/
	const irysUploader = await Uploader(Solana).withWallet(privateKey).withRpc(rpc).devnet();

	return irysUploader;
}

type UploadResponse = Awaited<ReturnType<typeof BaseNodeIrys.prototype.uploader.uploadData>>;

export type IrysUploadApiSuccessResponse = {
	success: true;
	receipt: UploadResponse;
};

export type IrysUploadApiResponse =
	| {
			success: true;
			receipt: UploadResponse;
	  }
	| { success: false; error: string };
