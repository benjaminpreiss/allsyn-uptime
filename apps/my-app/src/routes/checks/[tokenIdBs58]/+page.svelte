<script lang="ts">
	import { stringifySubject } from '$lib/utilities/schemas';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { PageProps } from './$types';
	import { createQuery } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	let { data }: PageProps = $props();
	let stringifiedSubject = stringifySubject(data.subject);
	let portCheckDescription = data.keys.port ? 'port reachability' : '';
	let statusCheckDescription =
		data.keys.status !== undefined ? `status code ${data.keys.status} on request` : '';
	let checkKeyDescription = `checking for ${portCheckDescription} ${portCheckDescription.length > 0 && statusCheckDescription.length > 0 ? 'and' : ''} ${statusCheckDescription}.`;
	const dbDiscreteMinutelyAggregatesQuery = createQuery({
		queryKey: ['db-discrete-minutely-aggregates'],
		queryFn: async () => {
			console.log('hey');
			// Calculate date range for the last 24 hours
			const currentEpoch = Date.now();
			const oneDayAgoEpoch = currentEpoch - 24 * 60 * 60 * 1000; // 24 hours in milliseconds

			const from = new Date(oneDayAgoEpoch).toISOString();
			const to = new Date(currentEpoch).toISOString();

			const res = await fetch(
				`http://localhost:8080/v2/allsyn/discrete_aggregates/minutely?from=${from}&to=${to}&checkSubject=${encodeURIComponent(JSON.stringify(data.subject))}`
			);
			const resJson = await res.json();
			return resJson;
		},
		refetchInterval: 3000
	});
	console.log($dbDiscreteMinutelyAggregatesQuery.data);
</script>

<div class="flex h-full min-h-full w-full flex-col items-center p-10">
	<div class="grid grid-cols-3 gap-10">
		<Card.Root class="col-span-2 flex flex-col">
			<Card.Header>
				<Card.Title>Submitted checks</Card.Title>
				<Card.Description
					>Aggregated into minutely statistics, reloaded every 3 seconds</Card.Description
				>
			</Card.Header>
			<Card.Content class="h-full">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[100px]">Time</Table.Head>
							<Table.Head>Check type</Table.Head>
							<Table.Head>Check results</Table.Head>
							<Table.Head>Total checks</Table.Head>
							<Table.Head>Successful checks</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body
						>{#if $dbDiscreteMinutelyAggregatesQuery.isLoading}
							Loading
						{:else if $dbDiscreteMinutelyAggregatesQuery.isError}
							Load error
						{:else if $dbDiscreteMinutelyAggregatesQuery.isSuccess}
							{#each $dbDiscreteMinutelyAggregatesQuery.data as discreteMinutelyAggregate}
								<Table.Row>
									<Table.Cell class="font-medium"
										>{discreteMinutelyAggregate['bucket_time']}</Table.Cell
									>
									<Table.Cell>{discreteMinutelyAggregate['check_key']}</Table.Cell>
									<Table.Cell>{discreteMinutelyAggregate['results']}</Table.Cell>
									<Table.Cell>{discreteMinutelyAggregate['total_checks']}</Table.Cell>
									<Table.Cell>{discreteMinutelyAggregate['successful_checks']}</Table.Cell>
								</Table.Row>
							{/each}
						{/if}</Table.Body
					>
				</Table.Root>
			</Card.Content>
			<Card.Footer class="flex justify-start"></Card.Footer>
		</Card.Root>
		<Card.Root class="h-fit w-full max-w-screen-lg">
			<Card.Header class="space-y-4">
				<Card.Title>Your uptime monitor</Card.Title>
				<Card.Description class="space-y-2">
					<p>{stringifiedSubject}</p>
					<p>{checkKeyDescription}</p>
				</Card.Description>
			</Card.Header>
			<Card.Footer class="mt-6 flex justify-between">
				<Button onclick={() => goto('/')}>Go back</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
