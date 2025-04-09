import { derived, writable } from 'svelte/store';
import { initClient } from './utilities/aleo';

export const aleoPrivateKey = writable('');

export const aleo = derived(aleoPrivateKey, ($a) => ($a === '' ? undefined : initClient($a)));
