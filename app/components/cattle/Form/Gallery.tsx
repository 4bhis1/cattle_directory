
import React from 'react';
import { useFormContext } from '@/app/components/Form';
import { PhotoLibrary, Delete } from '@mui/icons-material';
import { Avatar, ImageList, ImageListItem, IconButton } from '@mui/material';
import FileUpload from '../../Form/inputs/FileUpload';
import { FormCard, FormCardHeader } from '../../Form/components/FormCard';

const GallerySection = () => {
    const { watch, setValue } = useFormContext();
    const gallery = watch('gallery') || [];
    const profilePhoto = gallery.length > 0 ? gallery[gallery.length - 1].url : '/placeholder-cow.png';

    const handleUploadSuccess = (fileId: string, url: string) => {
        setValue('gallery', [...gallery, { _id: fileId, url }], { shouldDirty: true });
        setValue('lastPhotoDate', new Date().toISOString().split('T')[0]);
    };

    const removeGalleryImage = (index: number) => {
        setValue('gallery', gallery.filter((_: any, i: number) => i !== index), { shouldDirty: true });
    };

    return (
        <FormCard>
            <div className="flex items-center justify-between mb-4">
                 <FormCardHeader
                    title="Gallery"
                    Icon={<PhotoLibrary className="mr-2 text-pink-500" />}
                />
                <FileUpload onUploadSuccess={handleUploadSuccess} label="Add Photo" multiple />
            </div>
            
            <div className="mb-6 flex justify-center">
                <Avatar src={profilePhoto} alt="Profile Preview" sx={{ width: 150, height: 150, border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }} />
            </div>
            {gallery.length > 0 ? (
                <ImageList sx={{ width: '100%', maxHeight: 200 }} cols={3} rowHeight={80}>
                    {gallery.map((item: any, index: number) => (
                        <ImageListItem key={item._id || index}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.url} alt={`Gallery ${index}`} loading="lazy" style={{ borderRadius: 8, height: '80px', objectFit: 'cover' }} />
                            <IconButton sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)', padding: '2px' }} size="small" onClick={() => removeGalleryImage(index)}>
                                <Delete fontSize="small" color="error" />
                            </IconButton>
                        </ImageListItem>
                    ))}
                </ImageList>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">No photos yet. Add one to set profile picture.</p>
            )}
        </FormCard>
    );
};

export default GallerySection;
