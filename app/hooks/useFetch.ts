import { useState, useEffect, useCallback, useRef } from 'react';

// A refined useFetch hook that avoids infinite loops by using deep comparison or careful dependency management
export function useFetch<T>(url: string, options?: RequestInit, dependencies: any[] = []) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Use a ref to keep track of if the component is mounted
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(url, options);
            if (!res.ok) {
                throw new Error(`Error: ${res.status} ${res.statusText}`);
            }
            const json = await res.json();
            const extractedData = json.data !== undefined ? json.data : json;
            if (isMounted.current) {
                setData(extractedData);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err as Error);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [url, JSON.stringify(options)]); // Add options to dependencies

    useEffect(() => {
        fetchData();
    }, [fetchData, ...dependencies]);

    return { data, loading, error, refetch: fetchData };
}
