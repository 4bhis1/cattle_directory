'use client'

import { useFormContext } from "../Form"
import { useState, ChangeEvent } from "react"
import { FormControl, FormLabel, FormHelperText, Box, Typography } from "@mui/material"
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

interface FormImageProps {
    name: string
    label: string
    required?: boolean
    className?: string
}

const FormImage = ({ name, label, required, className }: FormImageProps) => {
    const { register, setValue, formState: { errors } } = useFormContext()
    const [preview, setPreview] = useState<string | null>(null)
    const error = errors[name]

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            setValue(name, file, { shouldValidate: true })
        }
    }

    return (
        <FormControl error={!!error} fullWidth className={className}>
            <FormLabel required={required} sx={{ mb: 1, fontWeight: 600 }}>{label}</FormLabel>
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: 192, // h-48
                    border: '2px dashed',
                    borderColor: error ? 'error.main' : 'grey.300',
                    borderRadius: 3, // rounded-xl
                    bgcolor: error ? 'error.light' : (preview ? 'primary.50' : 'grey.50'),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: error ? 'error.main' : 'primary.main',
                        bgcolor: error ? 'error.light' : 'primary.50',
                    },
                    cursor: 'pointer',
                    overflow: 'hidden'
                }}
            >
                {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={preview}
                        alt="Preview"
                        style={{ height: '100%', width: '100%', objectFit: 'contain', padding: 8, borderRadius: 12 }}
                    />
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'text.secondary' }}>
                        <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: error ? 'error.main' : 'text.disabled' }} />
                        <Typography variant="body2" fontWeight="medium" color={error ? 'error.main' : 'text.primary'}>
                            Click to upload image
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            PNG, JPG up to 5MB
                        </Typography>
                    </Box>
                )}

                <input
                    type="file"
                    accept="image/*"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                    }}
                    onChange={handleImageChange}
                />
            </Box>
            {error && <FormHelperText>{error.message as string}</FormHelperText>}
        </FormControl>
    )
}

export default FormImage
