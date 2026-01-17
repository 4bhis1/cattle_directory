
const BACKEND_URL = 'http://localhost:8000/api/v1';

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success?: boolean;
    [key: string]: any;
}

class ApiService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
            const headers: any = {
                ...options.headers,
            };

            // Only set application/json if body is not FormData
            if (!(options.body instanceof FormData) && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(url, {
                ...options,
                headers,
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error(`API Error [${response.status}]:`, responseData);
                throw new Error(responseData.message || `API Request failed with status ${response.status}`);
            }

            return responseData as T;
        } catch (error) {
            console.error('API Service Error:', error);
            throw error;
        }
    }

    async get<T = any>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
        const queryString = new URLSearchParams(
            Object.entries(params).map(([key, value]) => [key, String(value)])
        ).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request<T>(url, { method: 'GET' });
    }

    async post<T = any>(endpoint: string, data: any): Promise<T> {
        const isFormData = data instanceof FormData;
        return this.request<T>(endpoint, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    async put<T = any>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch<T = any>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const apiService = new ApiService();
