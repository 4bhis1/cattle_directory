import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { debounce } from '@mui/material/utils';
import { apiService } from '@/lib/apiService';

interface AutoCompleteProps<T> {
    // Data Source
    endpoint?: string;
    options?: T[]; // For local data
    
    // Configuration
    label: string;
    placeholder?: string;
    getLabel?: (option: T) => string;
    getValue?: (option: T) => string | number;
    
    // Controlled State
    value?: T | null;
    onChange?: (value: T | null) => void;
    
    // Events
    onInputChange?: (value: string) => void;
    
    // Customization
    limit?: number;
    searchParam?: string; // Query param for search (default: 'search')
    pageParam?: string;   // Query param for page (default: 'page')
    limitParam?: string;  // Query param for limit (default: 'limit')
    
    // Styling
    className?: string;
    error?: boolean;
    helperText?: string;
    required?: boolean;
}

export function AutoComplete<T extends Record<string, any>>({
    endpoint,
    options: localOptions = [],
    label,
    placeholder,
    getLabel = (option) => option.label || option.name || '',
    getValue = (option) => option.value || option.id || option._id,
    value,
    onChange,
    onInputChange,
    limit = 20,
    searchParam = 'search',
    pageParam = 'page',
    limitParam = 'limit',
    className,
    error,
    helperText,
    required
}: AutoCompleteProps<T>) {
    const [open, setOpen] = useState(false);
    const [fetchedOptions, setFetchedOptions] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const listboxRef = useRef<HTMLUListElement>(null);

    const isRemote = !!endpoint;
    const currentOptions = isRemote ? fetchedOptions : localOptions;

    const fetchOptions = useCallback(
        async (input: string, newPage: number, reset: boolean) => {
            if (!endpoint) return;

            setLoading(true);
            try {
                const params = {
                    [searchParam]: input,
                    [pageParam]: newPage,
                    [limitParam]: limit,
                };
                
                const response = await apiService.get(endpoint, params);
                
                if (response.status==="success") {
                    const newData = response.data;
                    
                    const items = Array.isArray(newData) ? newData : [];
                    const totalCount = Array.isArray(newData) ? (response.total || response.count || 0) : 0;

                    setFetchedOptions(prev => reset ? items : [...prev, ...items]);
                    setTotal(totalCount);
                    setHasMore(items.length === limit);
                }
            } catch (err) {
                console.error("AutoComplete fetch error:", err);
            } finally {
                setLoading(false);
            }
        },
        [endpoint, searchParam, pageParam, limitParam, limit]
    );

    const debouncedFetch = useMemo(
        () => debounce((input: string) => {
            setPage(1);
            fetchOptions(input, 1, true);
        }, 500),
        [fetchOptions]
    );

    useEffect(() => {
        if (!isRemote) return;
        
        if (open) {
            // Initial fetch when opened
            fetchOptions(inputValue, 1, true); 
        }
    }, [open, isRemote]); // removed inputValue dependency to rely on debouncedFetch for typing

    const handleInputChange = (event: any, newInputValue: string) => {
        setInputValue(newInputValue);
        if (onInputChange) onInputChange(newInputValue);
        
        if (isRemote) {
            debouncedFetch(newInputValue);
        }
    };

    const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
        const listboxNode = event.currentTarget;
        
        if (
            listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 20 &&
            !loading &&
            hasMore &&
            isRemote
        ) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchOptions(inputValue, nextPage, false);
        }
    };

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={value || null}
            onChange={(_, newValue) => onChange && onChange(newValue)}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            options={currentOptions}
            loading={loading}
            getOptionLabel={getLabel}
            isOptionEqualToValue={(option, val) => getValue(option) === getValue(val)}
            className={className}
            ListboxProps={{
                onScroll: handleScroll,
                ref: listboxRef,
                className: "custom-scrollbar" // ensure you have scrollbar styles if needed
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    required={required}
                    error={error}
                    helperText={helperText}
                    variant="outlined"
                    fullWidth
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        },
                        inputLabel: {
                            shrink: true,
                        }
                    }}
// Removed manual sx overrides to inherit theme styles
                />
            )}
            renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                <li key={key} {...otherProps}>
                    <div className="flex flex-col">
                        <span className="font-medium">{getLabel(option)}</span>
                    </div>
                </li>
            )}}
        />
    );
}
