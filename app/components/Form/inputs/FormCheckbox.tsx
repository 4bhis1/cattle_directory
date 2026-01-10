'use client'

import { useFormContext } from "../Form"
import { Controller } from "react-hook-form"
import { Checkbox, FormControlLabel, FormHelperText } from "@mui/material"

interface FormCheckboxProps {
    name: string
    label: string
    required?: boolean
    className?: string
}

const FormCheckbox = ({ name, label, required, className }: FormCheckboxProps) => {
    const { control } = useFormContext()

    return (
        <div className={`flex flex-col ${className || ''}`}>
            <Controller
                name={name}
                control={control}
                rules={{ required: required ? 'This field is required' : false }}
                render={({ field: { onChange, value, ref, ...rest }, fieldState: { error } }) => (
                    <>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!value}
                                    onChange={onChange}
                                    inputRef={ref}
                                    {...rest}
                                    sx={{
                                        color: error ? 'error.main' : undefined,
                                        '&.Mui-checked': {
                                            color: error ? 'error.main' : 'primary.main',
                                        },
                                    }}
                                />
                            }
                            label={label}
                            sx={{ color: error ? 'error.main' : undefined }}
                        />
                        {error && <FormHelperText error>{error.message as string}</FormHelperText>}
                    </>
                )}
            />
        </div>
    )
}

export default FormCheckbox
