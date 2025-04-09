<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { writable } from 'svelte/store';
	import { aleoPrivateKey, aleo } from '$lib/stores';
	import { getAllsynAccountRecords, initClient } from '$lib/utilities/aleo';

	let inputValue: string;
	const privateKeyEditable = writable(true);
</script>

<nav class="flex w-full justify-center gap-4 p-4">
	<Input
		type="password"
		disabled={!$privateKeyEditable}
		placeholder="Enter aleo private key"
		class="max-w-prose"
		bind:value={inputValue}
	/>
	<Button
		disabled={!inputValue}
		onclick={() => {
			privateKeyEditable.update((v) => !v);
			aleoPrivateKey.set(inputValue);
		}}>{$privateKeyEditable ? 'Save' : 'Edit'}</Button
	>
</nav>

{#if $aleo === undefined}
	<div>Please set a private key</div>
{:else}
	{#await $aleo}
		<div>Initializing client</div>
	{:then aleoAwaited}
		{#await getAllsynAccountRecords({ networkClient: aleoAwaited.networkClient })}
			<div>Retrieving Aleo records</div>
		{:then records}
			{#each records as record}
				<div>{record.toString()}</div>
			{/each}
		{/await}
	{/await}
{/if}
