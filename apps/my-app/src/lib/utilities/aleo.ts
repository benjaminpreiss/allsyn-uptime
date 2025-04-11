import {
	Account,
	AleoKeyProvider,
	AleoNetworkClient,
	NetworkRecordProvider,
	ProgramManager
} from '@provablehq/sdk';
import { derived, writable } from 'svelte/store';

export const aleoNetworkClient = new AleoNetworkClient('http://0.0.0.0:3030', { headers: {} });

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
export const aleoProgramManager = derived(
	aleoRecordProvider,
	($r) => $r && new ProgramManager('http://0.0.0.0:3030', aleoKeyProvider, $r)
);

// Retrieves all records for the current account related to allsyn.aleo smart contract.
export async function getAllsynAccountRecords({ account }: { account: Account }) {
	const lastBlockHeight = await aleoNetworkClient.getLatestHeight();
	// find allsyn records
	const records = await aleoNetworkClient.findRecords(
		0,
		lastBlockHeight,
		false,
		['credits.aleo', 'allsyn.aleo', 'token_registry.aleo'],
		undefined,
		undefined,
		undefined,
		account.privateKey()
	);
	return records;
}

export async function aleoGetLatestHeight() {
	return await aleoNetworkClient.getLatestHeight();
}
