import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

export const PBHost = "http://85.215.78.118:80";
export const pb = new PocketBase(PBHost);

export const currentToken = writable(pb.authStore.token);

pb.authStore.onChange((token) => {
  currentToken.set(token);
});