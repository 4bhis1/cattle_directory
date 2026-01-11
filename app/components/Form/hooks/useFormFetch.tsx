import { useEffect, useState, useContext } from "react"
import { FormContext, useFormContext } from "../Form"
import { apiService } from "@/lib/apiService"
import { useSnackbar } from "@/app/context/SnackbarContext";

interface UseFormFetchOptions {
    endpoint?: string | null;
    params?: Record<string, string | number | boolean>;
    queryKey?: any[]; // optional, for dependency array
    enabled?: boolean; // default true
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    resetForm?: boolean; // If true, uses reset() on the form. If false, you might manually handle data.
    postFetch?: (data: any) => any;
    reset?: any; // Allow passing reset directly
}

const useFormFetch = ({
    endpoint,
    params,
    queryKey = [],
    enabled = true,
    onSuccess,
    onError,
    resetForm = true,
    postFetch,
    reset: resetFn // Destructure reset as resetFn to differentiate clearly
}: UseFormFetchOptions) => {
    // Safely attempt to get context, but don't crash if it's missing (returns null)
    const {reset} = useFormContext();
    
    const {showSnackbar} = useSnackbar()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [data, setData] = useState<any>(null)

    if (!endpoint) {
        return {isLoading, error, data}
    };

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

                    let formData = (response as any).data || response;

                    if(postFetch){
                        formData = postFetch(formData);
                    }
                    
                    // Only try to reset if we have a valid reset function
                    if (resetForm && reset) {
                        reset(formData);
                    }
                    if (onSuccess) onSuccess(formData);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err as Error);
                    console.error("Form Fetch Error:", err);
                    if (onError) onError(err);
                    console.log(err);
                    showSnackbar('Something went wrong', 'error');
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
    }, [endpoint, enabled, resetForm, reset, ...queryKey])

    return { isLoading, error, data }
}

export default useFormFetch
