import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { apiService } from '@/lib/apiService';

interface FileUploadProps {
    onUploadSuccess: (fileId: string, url: string) => void;
    label?: string;
    multiple?: boolean;
}

export default function FileUpload({ onUploadSuccess, label = 'Upload Photo', multiple = false }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);

                const res = await apiService.post('/upload', formData);

                if (res.success || res.status === 'success') {
                    const data = res.data;
                    if (data && data.fileId) {
                        onUploadSuccess(data.fileId, data.url);
                    }
                }
            }
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <Button
            variant="outlined"
            component="label"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
            size="small"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
        >
            {uploading ? 'Uploading...' : label}
            <input type="file" hidden multiple={multiple} accept="image/*" onChange={handleUpload} />
        </Button>
    );
}
