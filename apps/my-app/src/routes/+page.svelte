<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { derived, writable } from 'svelte/store';
	import {
		aleoGetLatestHeight,
		getAllsynAccountRecords,
		aleoAccount,
		aleoPrivateKey,
		loadRecordMetadata,
		getReceiptTokenIdBs58
	} from '$lib/utilities/aleo';
	import { createQuery } from '@tanstack/svelte-query';
	import CheckerForm from '$lib/components/forms/CheckerForm.svelte';
	import { stringifySubject } from '$lib/utilities/schemas';
	import { goto } from '$app/navigation';

	const aleoLatestHeightQuery = createQuery({
		queryKey: ['latest-height'],
		queryFn: aleoGetLatestHeight
	});
	const aleoReceiptRecords = createQuery(
		derived(aleoAccount, ($aleoAccount) => ({
			queryKey: ['receipts', $aleoAccount?.address],
			enabled: !!$aleoAccount,
			queryFn: async () =>
				$aleoAccount === undefined
					? []
					: await getAllsynAccountRecords({
							account: $aleoAccount,
							programs: ['allsyn.aleo']
						})
		}))
	);

	const aleoAllsynTokenRecords = createQuery(
		derived(aleoAccount, ($aleoAccount) => ({
			queryKey: ['allsyn-token-records', $aleoAccount?.address],
			enabled: !!$aleoAccount,
			queryFn: async () => {
				if ($aleoAccount === undefined) return [];
				const records = await getAllsynAccountRecords({
					account: $aleoAccount,
					programs: ['token_registry.aleo']
				});
				console.log(records.toString());
				return records;
			}
		}))
	);

	let inputValue: string;
	const privateKeyEditable = writable(true);
</script>

<div class="flex h-full min-h-full w-full flex-col items-center p-10">
	<div class="grid grid-cols-3 gap-10">
		<Card.Root class="col-span-2 flex flex-col">
			<Card.Header>
				<Card.Title>Your registered uptime checks</Card.Title>
				<Card.Description>
					{#if $aleoLatestHeightQuery.isLoading}
						... Loading latest block height
					{:else if $aleoLatestHeightQuery.isError}
						Error retrieving latest block height
					{:else}
						Queried up until aleo block {$aleoLatestHeightQuery.data}
					{/if}
				</Card.Description>
			</Card.Header>
			<Card.Content class="h-full">
				{#if $aleoReceiptRecords.isLoading}
					Loading your records
				{:else if $aleoReceiptRecords.isError}
					Error loading your records
				{:else if $aleoReceiptRecords.isSuccess}
					{#if $aleoReceiptRecords.data.length === 0}
						No records found for your account
					{:else}
						<div>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head class="w-[100px]">Check subject</Table.Head>
										<Table.Head>Check port</Table.Head>
										<Table.Head>Check status</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each $aleoReceiptRecords.data as record}
										{#await loadRecordMetadata({ record }) then recordMetadata}
											<Table.Row
												class="cursor-pointer"
												onclick={() => goto(`checks/${getReceiptTokenIdBs58({ record })}`)}
											>
												<Table.Cell class="font-medium"
													>{stringifySubject(recordMetadata.subject)}</Table.Cell
												>
												<Table.Cell>{recordMetadata.keys.port ?? '-'}</Table.Cell>
												<Table.Cell
													>{recordMetadata.keys.status === undefined
														? '-'
														: recordMetadata.keys.status}</Table.Cell
												>
											</Table.Row>
										{/await}
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					{/if}
				{:else}
					Please setup private key to continue
				{/if}
			</Card.Content>
			<Card.Footer class="flex justify-start">
				<CheckerForm allsynToken={$aleoAllsynTokenRecords.data?.[0]} />
			</Card.Footer>
		</Card.Root>
		<Card.Root class="w-full max-w-screen-lg">
			<Card.Header>
				<Card.Title>Your aleo wallet</Card.Title>
				<Card.Description>Please connect private key to get started</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="grid w-full items-center gap-4">
					<div class="flex flex-col space-y-1.5">
						<Label for="aleo-private-key">Aleo Private key</Label>
						<Input
							disabled={!$privateKeyEditable}
							type="password"
							bind:value={inputValue}
							id="aleo-private-key"
							placeholder="Your aleo private key"
						/>
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<Button variant="outline">Cancel</Button>
				<Button
					disabled={!inputValue}
					onclick={() => {
						privateKeyEditable.update((v) => !v);
						aleoPrivateKey.set(inputValue);
					}}>{$privateKeyEditable ? 'Save' : 'Edit'}</Button
				>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
