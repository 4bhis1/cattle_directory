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
    const { formState: { isSubmitting } } = useFormContext()

    return (
        <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            fullWidth={fullWidth}
            className={className}
            startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
            sx={{
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                gap: 2
            }}
        >
            {Icon && Icon}
            {isSubmitting ? 'Processing...' : label}
        </Button>
    )
}

export default FormButton
