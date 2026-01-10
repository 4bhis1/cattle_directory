'use client'

import useInput, { UseInputProps } from "../hooks/useInput"
import { TextField } from "@mui/material"

interface FormDateProps extends Omit<UseInputProps, 'name'> {
    name: string
    className?: string
}

const FormDate = ({ className, ...props }: FormDateProps) => {
    const { inputProps, error, label, isError } = useInput({ ...props, type: 'date' } as UseInputProps)
    const { ref, ...restInputProps } = inputProps

    return (
        <div className={`w-full ${className || ''}`}>
            <TextField
                {...restInputProps}
                inputRef={ref}
                label={label}
                type="date"
                error={isError}
                helperText={error}
                variant="outlined"
                fullWidth
                size="medium"
                required={!!props.required}
                slotProps={{
                    inputLabel: {
                        shrink: true,
                    }
                }}
            />
        </div>
    )
}

export default FormDate
