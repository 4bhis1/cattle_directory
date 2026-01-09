import { useState } from 'react';

type HttpMethod = 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export function useMutation<T, B = unknown>(url: string, method: HttpMethod = 'POST') {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const mutate = async (body: B, customUrl?: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(customUrl || url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.status} ${res.statusText}`);
            }
            const json = await res.json();
            setData(json);
            return json;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { mutate, data, loading, error };
}
