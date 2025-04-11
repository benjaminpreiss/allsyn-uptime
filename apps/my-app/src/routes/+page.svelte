<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { derived, writable } from 'svelte/store';
	import {
		aleoGetLatestHeight,
		getAllsynAccountRecords,
		aleoAccount,
		aleoPrivateKey
	} from '$lib/utilities/aleo';
	import { createQuery } from '@tanstack/svelte-query';
	import CheckerForm from '$lib/components/forms/CheckerForm.svelte';

	const aleoLatestHeightQuery = createQuery({
		queryKey: ['latest-height'],
		queryFn: aleoGetLatestHeight
	});
	const aleoAccountRecords = createQuery(
		derived(aleoAccount, ($aleoAccount) => ({
			queryKey: ['records', $aleoAccount?.address],
			enabled: !!$aleoAccount,
			queryFn: async () =>
				$aleoAccount === undefined ? [] : await getAllsynAccountRecords({ account: $aleoAccount })
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
				{#if $aleoAccountRecords.isLoading}
					Loading your records
				{:else if $aleoAccountRecords.isError}
					Error loading your records
				{:else if $aleoAccountRecords.isSuccess}
					{#if $aleoAccountRecords.data.length === 0}
						No records found for your account
					{:else}
						{#each $aleoAccountRecords.data as record}
							<div>{record.toString()}</div>
						{/each}
					{/if}
				{:else}
					Please setup private key to continue
				{/if}
			</Card.Content>
			<Card.Footer class="flex justify-start">
				<CheckerForm />
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
