'use client'

import { useFormContext } from "../Form"
import { Button, CircularProgress } from "@mui/material"

interface FormButtonProps {
    label?: string
    className?: string
    fullWidth?: boolean
    Icon?: React.ReactNode
}

const FormButton = ({ label = "Submit", className, fullWidth = true, Icon }: FormButtonProps) => {
    const { formState: { isSubmitting, isDirty, isLoading, isValid, errors } } = useFormContext()
    const disabled = isSubmitting || !isDirty || !isValid || isLoading
    return (
        <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={disabled}
            fullWidth={fullWidth}
            className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'pointer'}`}
            startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
            sx={{
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                gap: 2,
                transition: 'all 0.2s ease-in-out',
                cursor: disabled ? 'not-allowed' : 'pointer',
                '&:hover': {
                    opacity: disabled ? 1 : 0.9,
                },
            }}
        >
            {Icon && Icon}
            {isLoading ? 'Processing...' : label}
        </Button>
    )
}

export default FormButton
