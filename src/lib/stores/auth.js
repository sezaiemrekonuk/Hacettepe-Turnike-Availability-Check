import { writable } from 'svelte/store';

const isAuthenticated = writable(false);
const isSuperAdmin = writable(false);

const currUser = writable({
    email: '',
    password: '',
});

export { isAuthenticated, isSuperAdmin, currUser };
