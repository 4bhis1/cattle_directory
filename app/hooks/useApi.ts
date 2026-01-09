// Generic API hooks built on top of useFetch and useMutation
// Provides convenient typed hooks for GET, POST, PUT, DELETE operations.

import { useFetch } from './useFetch';
import { useMutation } from './useMutation';

export function useGet<T>(url: string, deps: any[] = []) {
    return useFetch<T>(url, undefined, deps);
}

export function usePost<T, B = unknown>(url: string) {
    return useMutation<T, B>(url, 'POST');
}

export function usePut<T, B = unknown>(url: string) {
    return useMutation<T, B>(url, 'PUT');
}

export function useDelete<T>(url: string) {
    return useMutation<T, undefined>(url, 'DELETE');
}
