import {
	Account,
	AleoKeyProvider,
	AleoNetworkClient,
	Field,
	NetworkRecordProvider,
	ProgramManager,
	RecordPlaintext,
	Scalar
} from '@provablehq/sdk';
import { derived, writable } from 'svelte/store';
import bs58 from 'bs58';

function uint8ArrayToBigInt(uint8Array: Uint8Array) {
	let hexString = '0x';
	for (const byte of uint8Array) {
		// Convert each byte to a two-character hexadecimal string
		hexString += byte.toString(16).padStart(2, '0');
	}
	return BigInt(hexString);
}

export const aleoNetworkClient = new AleoNetworkClient('http://localhost:3030', { headers: {} });

// Create a key provider that will be used to find public proving & verifying keys for Aleo programs.
export const aleoKeyProvider = new AleoKeyProvider();
aleoKeyProvider.useCache(true);

export const aleoPrivateKey = writable('');

export const aleoAccount = derived(aleoPrivateKey, ($a) =>
	$a === '' ? undefined : new Account({ privateKey: $a })
);

export const aleoRecordProvider = derived(
	aleoAccount,
	($a) => $a && new NetworkRecordProvider($a, aleoNetworkClient)
);

// Initialize a program manager to talk to the Aleo network with the configured key and record providers.
export const aleoProgramManager = derived(aleoRecordProvider, ($r) => {
	if ($r) {
		const programManager = new ProgramManager('http://localhost:3030', aleoKeyProvider, $r);
		programManager.networkClient = aleoNetworkClient;
		return programManager;
	}
});

// Retrieves all records for the current account related to allsyn.aleo smart contract.
export async function getAllsynAccountRecords({
	account,
	programs
}: {
	account: Account;
	programs: Array<'allsyn.aleo' | 'token_registry.aleo' | 'credits.aleo'>;
}) {
	const lastBlockHeight = await aleoNetworkClient.getLatestHeight();
	// find allsyn records
	const records = await aleoNetworkClient.findRecords(
		0,
		lastBlockHeight,
		false,
		programs,
		undefined,
		undefined,
		undefined,
		account.privateKey()
	);
	return records;
}

export async function buyReceipt({
	allsynToken,
	irys_tx_id,
	programManager,
	account
}: {
	allsynToken: RecordPlaintext;
	irys_tx_id: string; // field
	programManager: ProgramManager;
	account: Account;
}) {
	//const dataString = `{ metadata: { irys_tx_id: ${irys_tx_id}field } }`;
	const currentCheckCycleValuationString = `{
	significand: 5463764315u64,
	neg_exponent: 9u8
}`;
	const edition = Scalar.random().toString();
	const irysTxIdBytes = bs58.decode(irys_tx_id);
	if (irysTxIdBytes.length !== 32) {
		throw new Error('Decoded bytes length must be maximally 32 bytes');
	}
	// Two u128 numbers holding 32bytes
	const irysTxIdU128s = [irysTxIdBytes.slice(0, 16), irysTxIdBytes.slice(16, 32)].map(
		(b) => `${uint8ArrayToBigInt(b).toString()}u128`
	);
	console.log(irysTxIdU128s);
	console.log('Starting build execution transaction...');
	const executeOptions = {
		programName: 'allsyn.aleo',
		functionName: 'mint_private_receipt',
		priorityFee: 10000,
		privateFee: false, // Assuming a value for privateFee
		inputs: [
			allsynToken.toString(),
			account.address().to_string(),
			'100u64',
			...irysTxIdU128s,
			edition.toString(),
			currentCheckCycleValuationString
		], // Example inputs matching the function definition
		privateKey: account.privateKey() // Set the private key
	};
	console.log(executeOptions);
	/*
	const tx = await programManager.buildExecutionTransaction(executeOptions);

	console.log('Submitting transaction...');
	const result = await programManager.networkClient.submitTransaction(tx);

	let transactionFound = false;
	// Loop until the transaction has been Accepted
	while (!transactionFound) {
		try {
			await programManager.networkClient.getTransactionObject(result);
			transactionFound = true;
		} catch (e) {
			console.error(e);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
		}*/
}

export async function aleoGetLatestHeight() {
	return await aleoNetworkClient.getLatestHeight();
}
