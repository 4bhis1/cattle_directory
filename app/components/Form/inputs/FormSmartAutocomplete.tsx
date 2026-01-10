import React from 'react';
import { Controller } from 'react-hook-form';
import { useFormContext } from '../Form';
import { AutoComplete } from '@/app/components/ui/AutoComplete';

interface FormSmartAutocompleteProps {
    name: string;
    label: string;
    endpoint?: string;
    options?: any[];
    placeholder?: string;
    required?: boolean;
    className?: string;
    getLabel?: (option: any) => string;
    getValue?: (option: any) => string | number;
    searchParam?: string;
}

const FormSmartAutocomplete = ({ 
    name, 
    label, 
    endpoint,
    options,
    placeholder, 
    required, 
    className,
    getLabel,
    getValue,
    searchParam
}: FormSmartAutocompleteProps) => {
    const { control } = useFormContext();

    return (
        <div className={`w-full ${className || ''}`}>
            <Controller
                control={control}
                name={name}
                rules={{ required: required ? `${label} is required` : false }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <AutoComplete
                        label={label}
                        endpoint={endpoint}
                        options={options}
                        placeholder={placeholder}
                        value={value} // This expects the full object if AutoComplete expects it, or ID?
                        // AutoComplete logic: value is T | null. onChange returns T | null.
                        // But forms usually store ID.
                        // We need to decide: does the form store the ID or the object?
                        // Looking at SellerSection, it stores 'sellerId' (string).
                        // So we need to handle mapping.
                        
                        // If the form stores ID, but AutoComplete needs object to display label...
                        // This is the classic "Autocomplete with ID value" problem.
                        // If we only have ID, we can't show label unless we fetch it or it's in options.
                        
                        // For 'endpoint' based autocomplete, if simpler approaches are used, we might need to fetch the initial object if only ID is present.
                        // OR, we assume 'value' passed to this component is the Object, and we extract ID for the form?
                        // But Controller passes what's in the form state.
                        
                        // Fix: The new AutoComplete handles object selection. 
                        // If the form expects ID, we should wrap the onChange.
                        // But for display, we need the object. 
                        // If the form state only has ID, this component will show empty/ID unless we preload the object.
                        
                        // For now, let's assume the form state stores the entire Object or we provide a way to load initial value.
                        // Or simpler: We pass `value` as the object.
                        // But `SellerSection` sets `sellerId` (string).
                        
                        // To properly support "ID in form, Object in UI", we usually need a `defaultOptions` or `initialData` prop.
                        // Or we change the form to store the whole object.
                        
                        // Let's pass the props as-is for now, but we'll likely need to adjust usage in SellerSection
                        // to ensure it handles the object <-> value mismatch.
                        
                        // Actually, if I look at `FormAutocomplete.tsx`:
                        // value={options.find(opt => opt.value === value) || null}
                        // It searches local options.
                        
                        // For remote data, we can't search local options easily if they aren't loaded.
                        // So the `value` prop passed to AutoComplete must be the Object if we want it to work seamlessly with remote.
                        
                        onChange={(newValue: any) => {
                            // If we want to store just ID:
                            // onChange(newValue?._id || newValue?.id);
                            // But then we lose the label for display if we come back.
                            
                            // Best practice for async autocomplete in React Hook Form: store the whole object.
                            onChange(newValue);
                        }}
                        getLabel={getLabel}
                        getValue={getValue}
                        error={!!error}
                        helperText={error?.message as string}
                        searchParam={searchParam}
                        required={required}
                    />
                )}
            />
        </div>
    );
};

export default FormSmartAutocomplete;
