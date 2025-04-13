<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';
	import { browser } from '$app/environment';
	let { children } = $props();

	// Create a client
	const queryClient = new QueryClient();
</script>

<ParaglideJS {i18n}>
	<QueryClientProvider client={queryClient}>
		{#if browser}
			{@render children()}
		{/if}
	</QueryClientProvider>
</ParaglideJS>
