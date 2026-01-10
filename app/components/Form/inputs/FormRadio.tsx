'use client'

import { Controller } from "react-hook-form"
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, FormHelperText } from "@mui/material"
import { useFormContext } from "../Form"

interface Option {
    label: string
    value: string
}   

interface FormRadioProps {
    name: string
    label: string
    options: Option[]
    required?: boolean
    row?: boolean
    className?: string
}

const FormRadio = ({ name, label, options, required, row = false, className }: FormRadioProps) => {
    const { control } = useFormContext()

    return (
        <Controller
            name={name}
            control={control}
            rules={{ required: required ? 'This field is required' : false }}
            render={({ field, fieldState: { error } }) => (
                <FormControl component="fieldset" error={!!error} className={className}>
                    <FormLabel component="legend">{label}</FormLabel>
                    <RadioGroup
                        {...field}
                        row={row}
                    >
                        {options.map((option) => (
                            <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                            />
                        ))}
                    </RadioGroup>
                    {error && <FormHelperText>{error.message as string}</FormHelperText>}
                </FormControl>
            )}
        />
    )
}

export default FormRadio
