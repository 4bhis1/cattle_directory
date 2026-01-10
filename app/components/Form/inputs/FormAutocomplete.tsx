'use client'

import { Controller } from "react-hook-form"
import { Autocomplete, TextField } from "@mui/material"
import { useFormContext } from "../Form"

interface Option {
    label: string
    value: string
}

interface FormAutocompleteProps {
    name: string
    label: string
    options: Option[]
    placeholder?: string
    required?: boolean
    compute?: (value: any, setValue: any) => void
    className?: string
}

const FormAutocomplete = ({ name, label, options, placeholder, required, compute, className }: FormAutocompleteProps) => {
    const { control, setValue: setFormValue } = useFormContext()

    return (
        <div className={`w-full ${className || ''}`}>
            <Controller
                control={control}
                name={name}
                rules={{ required: required ? `${label} is required` : false }}
                render={({ field: { onChange, value, ref, ...fieldProps }, fieldState: { error } }) => (
                    <Autocomplete
                        {...fieldProps}
                        options={options}
                        getOptionLabel={(option) => option.label || ''}
                        value={options.find(opt => opt.value === value) || null}
                        onChange={(_, newValue) => {
                            const val = newValue ? newValue.value : ''
                            onChange(val)
                            if (compute) {
                                compute(val, setFormValue)
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={label}
                                placeholder={placeholder}
                                error={!!error}
                                helperText={error?.message as string}
                                inputRef={ref}
                                required={required}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    }
                                }}
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                    />
                )}
            />
        </div>
    )
}

export default FormAutocomplete
