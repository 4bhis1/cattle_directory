'use client'

import useInput, { UseInputProps } from "../hooks/useInput"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs from "dayjs"

import { useWatch } from "react-hook-form"
import { useFormContext } from "../Form"

interface FormDateProps extends Omit<UseInputProps, 'name'> {
    name: string
    className?: string
}

const FormDate = ({ className, ...props }: FormDateProps) => {
    const { inputProps, error, label, isError } = useInput({ ...props, type: 'date' } as UseInputProps)
    const { ref, onChange, ...restInputProps } = inputProps
    const { control } = useFormContext()
    const value = useWatch({ control, name: props.name })

    return (
        <div className={`w-full ${className || ''}`}>
            <DatePicker
                {...restInputProps}
                inputRef={ref}
                label={label}
                value={value ? dayjs(value) : null}
                onChange={(newValue) => {
                    const formattedDate = newValue ? newValue.format('YYYY-MM-DD') : '';
                    onChange({ target: { value: formattedDate, name: props.name } } as any);
                }}
                slotProps={{
                    textField: {
                        error: isError,
                        helperText: error,
                        variant: "outlined",
                        fullWidth: true,
                        size: "medium",
                        required: !!props.required
                    }
                }}
            />
        </div>
    )
}

export default FormDate
