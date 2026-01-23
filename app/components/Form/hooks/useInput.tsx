'use client'

import { RegisterOptions, FieldValues, Path, PathValue } from "react-hook-form"
import { useFormContext } from "../Form"

export interface UseInputProps<T extends FieldValues = FieldValues> {
    name: Path<T>
    label: string
    type?: string
    required?: boolean | string
    maxLength?: number | { value: number, message: string }
    minLength?: number | { value: number, message: string }
    min?: number | string | { value: number | string, message: string }
    max?: number | string | { value: number | string, message: string }
    readOnly?: boolean
    validate?: RegisterOptions<T>['validate']
    /* 
     * Computation function to update other fields based on this field's value change.
     * Receives the new value and the setValue function.
     */
    compute?: (value: any, setValue: (name: Path<T>, value: PathValue<T, Path<T>>) => void) => void
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    [key: string]: any
}

const useInput = <T extends FieldValues = FieldValues>({
    name,
    label,
    type = "text",
    required,
    maxLength,
    minLength,
    readOnly,
    validate,
    compute,
    min,
    max,
    onChange: customOnChange,
    ...props
}: UseInputProps<T>) => {
    const { register, formState: { errors }, setValue } = useFormContext()

    const error = errors[name]

    // Construct validation rules
    const rules: RegisterOptions<T> = {
        required: required ? (typeof required === 'string' ? required : `${label} is required`) : false,
        maxLength: maxLength,
        minLength: minLength,
        min: typeof min === 'object' ? min : (min !== undefined ? { value: min, message: `${label} must be at least ${min}` } : undefined),
        max: typeof max === 'object' ? max : (max !== undefined ? { value: max, message: `${label} must be at most ${max}` } : undefined),
        validate: validate,
    }

    const { onChange, ...restRegister } = register(name, rules as any) as any

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = type === 'number' ? parseFloat(e.target.value) : e.target.value

        // Execute original react-hook-form onChange
        onChange(e)

        // Execute custom onChange if provided
        if (customOnChange) {
            customOnChange(e)
        }

        // Execute computation logic
        if (compute) {
            // We use a slight timeout or direct call. 
            // Since RHF onChange updates internal state, we can run side effects here.
            compute(value, setValue as any)
        }
    }

    const inputProps = {
        id: name,
        type,
        readOnly,
        // If readOnly, we might want to disable it or just add the attribute
        disabled: readOnly,
        min: typeof min === 'object' ? min.value : min,
        max: typeof max === 'object' ? max.value : max,
        ...props,
        ...restRegister,
        onChange: handleChange,
    }

    return {
        inputProps,
        error: error?.message as string | undefined,
        label,
        name,
        isError: !!error
    }
}

export default useInput
