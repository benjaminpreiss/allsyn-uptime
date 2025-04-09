import { Uploader } from '@irys/upload';
import { Solana } from '@irys/upload-solana';

export async function getIrysSolanaDevnetUploader(privateKey: string, rpc: string) {
	// RPC URLs change often. Use a current one from https://chainlist.org/
	const irysUploader = await Uploader(Solana).withWallet(privateKey).withRpc(rpc).devnet();

	return irysUploader;
}
