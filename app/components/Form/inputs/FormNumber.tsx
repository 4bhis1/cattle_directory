'use client'

import useInput, { UseInputProps } from "../hooks/useInput"
import { TextField } from "@mui/material"

interface FormNumberProps extends Omit<UseInputProps, 'name'> {
    name: string
    className?: string
}

const FormNumber = ({ className, ...props }: FormNumberProps) => {
    const { inputProps, error, label, isError } = useInput({ ...props, type: 'number' } as UseInputProps)
    const { ref, ...restInputProps } = inputProps

    return (
        <div className={`w-full ${className || ''}`}>
            <TextField
                {...restInputProps}
                inputRef={ref}
                label={label}
                type="number"
                error={isError}
                helperText={error}
                variant="outlined"
                fullWidth
                size="medium"
                required={!!props.required}
                slotProps={{
                    inputLabel: {
                        shrink: true,
                    },
                    htmlInput: {
                        step: 'any',
                        ...((restInputProps as any).inputProps || {})
                    }
                }}
            />
        </div>
    )
}

export default FormNumber
