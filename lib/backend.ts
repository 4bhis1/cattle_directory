const BACKEND_URL = 'http://localhost:8000/api/v1';

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
    try {
        const res = await fetch(`${BACKEND_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            console.error(`Backend Error [${res.status}]:`, data);
            throw new Error(data.message || `Backend fetch failed with status ${res.status}`);
        }

        return data;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
}
