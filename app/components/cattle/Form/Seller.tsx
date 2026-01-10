
import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../Form/Form';
import { Storefront, Add } from '@mui/icons-material';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { FormSmartAutocomplete } from '../../Form/Form';
import { FormCard, FormCardHeader } from '../../Form/components/FormCard';
import { apiService } from '@/lib/apiService';

const SellerSection = () => {
    const { setValue } = useFormContext();
    const [openNewSeller, setOpenNewSeller] = useState(false);
    const [newSellerData, setNewSellerData] = useState({ name: '', phoneNumber: '', address: '' });

    const handleCreateSeller = async () => {
        try {
            const res = await apiService.post('/sellers', newSellerData);
            if (res.success) {
                setValue('sellerId', res.data); // Set the full object
                setOpenNewSeller(false);
                setNewSellerData({ name: '', phoneNumber: '', address: '' });
            }
        } catch (error) {
            console.error('Failed to create seller');
        }
    };

    return (
        <FormCard>
            <FormCardHeader
                title="Seller Information"
                Icon={<Storefront className="mr-2 text-indigo-500" />}
            />

            <div className="space-y-4">
                <div className="flex gap-2 items-start">
                     <FormSmartAutocomplete
                        name="sellerId"
                        label="Select Seller"
                        endpoint="/sellers"
                        placeholder="Search seller by name..."
                        getLabel={(option: any) => option.name}
                        getValue={(option: any) => option._id}
                        searchParam="search"
                        className="flex-grow"
                    />
                    <Button variant="outlined" sx={{ minWidth: '40px', px: 1, mt: 1 }} onClick={() => setOpenNewSeller(true)}>
                        <Add />
                    </Button>
                </div>
            </div>

            <Dialog open={openNewSeller} onClose={() => setOpenNewSeller(false)}>
                <DialogTitle>Add New Seller</DialogTitle>
                <DialogContent>
                    <div className="grid gap-4 mt-2 min-w-[300px]">
                        <TextField label="Name" fullWidth size="small" value={newSellerData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSellerData({ ...newSellerData, name: e.target.value })} />
                        <TextField label="Phone Number" fullWidth size="small" value={newSellerData.phoneNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSellerData({ ...newSellerData, phoneNumber: e.target.value })} />
                        <TextField label="Address" fullWidth size="small" value={newSellerData.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSellerData({ ...newSellerData, address: e.target.value })} />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewSeller(false)}>Cancel</Button>
                    <Button onClick={handleCreateSeller} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </FormCard>
    );
};

export default SellerSection;
