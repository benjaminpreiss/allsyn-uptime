import { checkerFormSchema } from '$lib/components/forms/schema.js';
import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(checkerFormSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(checkerFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		return {
			form,
			blue: 'green'
		};
	}
};
