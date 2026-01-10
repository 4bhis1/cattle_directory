'use client'

import useInput, { UseInputProps } from "../hooks/useInput"
import { TextField } from "@mui/material"

interface FormInputProps extends Omit<UseInputProps, 'name'> {
    name: string
    className?: string
}

const FormInput = ({ className, ...props }: FormInputProps) => {
    // Cast props to UseInputProps to satisfy TS logic for the spread object
    const { inputProps, error, label, isError } = useInput(props as UseInputProps)

    // MUI TextField requires ref to be passed as inputRef for the underlying input element
    const { ref, ...restInputProps } = inputProps

    return (
        <div className={`w-full ${className || ''}`}>
            <TextField
                {...restInputProps}
                inputRef={ref}
                label={label}
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
                        ...restInputProps
                    }
                }}
            />
        </div>
    )
}

export default FormInput
