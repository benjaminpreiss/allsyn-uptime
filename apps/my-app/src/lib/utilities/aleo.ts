import { Account, AleoNetworkClient, NetworkRecordProvider } from '@provablehq/sdk';

export function initClient(privateKey: string) {
	const account = new Account({ privateKey });
	const networkClient = new AleoNetworkClient('http://0.0.0.0:3030');
	networkClient.setAccount(account);
	const recordProvider = new NetworkRecordProvider(account, networkClient);
	return { account, networkClient, recordProvider };
}

// Retrieves all records for the current account related to allsyn.aleo smart contract.
export async function getAllsynAccountRecords({
	networkClient
}: {
	networkClient: AleoNetworkClient;
}) {
	const lastBlockHeight = await networkClient.getLatestHeight();
	// find allsyn records
	const records = await networkClient.findRecords(0, lastBlockHeight, false, ['allsyn.aleo']);
	return records;
}
