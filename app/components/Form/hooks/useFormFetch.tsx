import { useEffect, useState } from "react"
import { useFormContext } from "../Form"
import { apiService } from "@/lib/apiService"

interface UseFormFetchOptions {
    endpoint: string;
    params?: Record<string, string | number | boolean>;
    queryKey?: any[]; // optional, for dependency array
    enabled?: boolean; // default true
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    resetForm?: boolean; // If true, uses reset() on the form. If false, you might manually handle data.
}

const useFormFetch = ({
    endpoint,
    params,
    queryKey = [],
    enabled = true,
    onSuccess,
    onError,
    resetForm = true
}: UseFormFetchOptions) => {
    const { reset } = useFormContext()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        if (!enabled || !endpoint) return;

        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiService.get(endpoint, params);
                if (isMounted) {
                    setData(response);

                    // Assuming response.data is the actual form data object, 
                    // or sometimes response itself is the object. 
                    // We'll try to guess or let the user map it via onSuccess if needed.
                    // For now, let's assume `response` or `response.data` is the object.
                    const formData = (response as any).data || response;

                    if (resetForm) {
                        reset(formData);
                    }
                    if (onSuccess) onSuccess(response);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err as Error);
                    console.error("Form Fetch Error:", err);
                    if (onError) onError(err);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, enabled, resetForm, ...queryKey])

    return { isLoading, error, data }
}

export default useFormFetch
