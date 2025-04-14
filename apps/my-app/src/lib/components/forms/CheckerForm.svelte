<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { zod } from 'sveltekit-superforms/adapters';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { aleoAccount, buyReceipt, aleoProgramManager } from '$lib/utilities/aleo';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { checkerFormSchema, formToMetadata } from './schema';
	import type { IrysUploadApiSuccessResponse } from '$lib/utilities/irys';
	import type { RecordPlaintext } from '@provablehq/sdk';

	let { allsynToken }: { allsynToken?: RecordPlaintext } = $props();

	let open = $state(false);

	const form = superForm(defaults(zod(checkerFormSchema)), {
		SPA: true,
		validators: zod(checkerFormSchema),
		onUpdated: ({ form }) => {
			open = true;
		},
		onUpdate: async ({ cancel, result, form }) => {
			if (result.type === 'success') {
				console.log('validation was successful', result.data);
				const metadata = formToMetadata({ form: form.data });
				const options = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(metadata)
				};
				try {
					const response = await fetch('http://localhost:5173/api/upload', options);
					const data: IrysUploadApiSuccessResponse = await response.json();
					const irysTxId = data.receipt.id;
					console.log('successfully created irys token', irysTxId);
					if (!$aleoAccount) throw new Error('aleo account is currently not defined');
					if (!$aleoProgramManager)
						throw new Error('aleo program manager is currently not defined');
					if (!allsynToken) throw new Error('Allsyn tokens is currently not defined');
					await buyReceipt({
						allsynToken,
						account: $aleoAccount,
						irys_tx_id: irysTxId,
						programManager: $aleoProgramManager
					});
					console.log(data);
				} catch (err) {
					console.log(err);
					cancel();
				}
			}
		},
		onResult: ({ result }) => {
			console.log(result);
		}
	});

	const { form: formData, enhance } = form;
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger disabled={!$aleoAccount || !$aleoProgramManager || !allsynToken}>
		<Button disabled={!$aleoAccount || !$aleoProgramManager || !allsynToken}
			>{!$aleoAccount
				? 'Loading aleo account'
				: !$aleoProgramManager
					? 'Loading aleo program manager'
					: !allsynToken
						? 'Loading allsyn Tokens'
						: 'Register new uptime check'}</Button
		>
	</Sheet.Trigger>
	<Sheet.Content side="right" class="!max-w-2xl">
		<Sheet.Header>
			<Sheet.Title>Register a new uptime check</Sheet.Title>
			<Sheet.Description>Fill out the below information</Sheet.Description>
		</Sheet.Header>
		<form class="py-4" method="POST" use:enhance>
			<!--Subject scheme input of form -->
			<Form.Field {form} name="subjectScheme">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Scheme</Form.Label>
						<Input {...props} placeholder="https" disabled value="https" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<!--Subject authority host input of form -->
			<Form.Field {form} name="subjectAuthorityHost">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Authority host</Form.Label>
						<Input
							{...props}
							placeholder="your-domain.com"
							bind:value={$formData.subjectAuthorityHost}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<!--Subject authority port input of form -->
			<Form.Field {form} name="subjectAuthorityPort">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Authority port</Form.Label>
						<Input {...props} placeholder="443" bind:value={$formData.subjectAuthorityPort} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<!--Subject path input of form -->
			<Form.Field {form} name="subjectPath">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Path</Form.Label>
						<Input {...props} placeholder="some/path" bind:value={$formData.subjectPath} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<!--Subject query input of form -->
			<Form.Field {form} name="subjectQuery">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Query</Form.Label>
						<Input
							{...props}
							placeholder="some=query&other=query"
							bind:value={$formData.subjectQuery}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<!--Subject fragment input of form -->
			<Form.Field {form} name="subjectFragment">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Fragment</Form.Label>
						<Input {...props} placeholder="some-fragment" bind:value={$formData.subjectFragment} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<!--Check key port input of form -->
			<Form.Field {form} name="keyPort">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Do you want the port tcp checked?</Form.Label>
						<Checkbox {...props} bind:checked={$formData.keyPort} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<!--Check key status input of form -->
			<Form.Field {form} name="keyStatus">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Required status code</Form.Label>
						<Input {...props} bind:value={$formData.keyStatus} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Sheet.Footer>
				<Form.Button disabled={!$aleoAccount || !$aleoProgramManager || !allsynToken} type="submit"
					>{!$aleoAccount
						? 'Loading aleo account'
						: !$aleoProgramManager
							? 'Loading aleo program manager'
							: !allsynToken
								? 'Loading allsyn Tokens'
								: 'Submit'}</Form.Button
				>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
