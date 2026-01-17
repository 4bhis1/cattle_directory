
import React, { useState, useEffect } from 'react';
import { Storefront, Add } from '@mui/icons-material';
import { FormSmartAutocomplete } from '../../Form/Form';
import { FormCard, FormCardHeader } from '../../Form/components/FormCard';
import { apiService } from '@/lib/apiService';
import { ActionableIcon } from '../../ui/ActionableIcon';
import AddSellerForm from './AddSellerForm';

import { Button } from '@mui/material';

const SellerSection = () => {
    const [openNewSeller, setOpenNewSeller] = useState(false);
    
    return (
        <FormCard>
            <FormCardHeader
                title="Seller Information"
                Icon={<Storefront className="mr-2 text-indigo-500" />}
                action={
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setOpenNewSeller(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        sx={{ textTransform: "none", borderRadius: "8px" }}
                    >
                        Add Seller
                    </Button>
                }
            />

            <div className="space-y-4">
                <div className="w-full">
                     <FormSmartAutocomplete
                        name="sellerId"
                        label="Select Seller"
                        endpoint="/sellers"
                        placeholder="Search seller by name..."
                        getLabel={(option: any) => option.name}
                        getValue={(option: any) => option._id}
                        searchParam="search"
                        className="w-full"
                    />
                </div>
            </div>

           <AddSellerForm fieldName={'sellerId'} openNewSeller={openNewSeller} setOpenNewSeller={setOpenNewSeller} />
        </FormCard>
    );
};

export default SellerSection;
