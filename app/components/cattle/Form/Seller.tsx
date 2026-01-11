
import React, { useState, useEffect } from 'react';
import { Storefront, Add } from '@mui/icons-material';
import { FormSmartAutocomplete } from '../../Form/Form';
import { FormCard, FormCardHeader } from '../../Form/components/FormCard';
import { apiService } from '@/lib/apiService';
import { ActionableIcon } from '../../ui/ActionableIcon';
import AddSellerForm from './AddSellerForm';

const SellerSection = () => {
    const [openNewSeller, setOpenNewSeller] = useState(false);
    


    return (
        <FormCard>
            <FormCardHeader
                title="Seller Information"
                Icon={<Storefront className="mr-2 text-indigo-500" />}
            />

            <div className="space-y-4">
                <div className="flex gap-3 items-center">
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
                    {/* <Button variant="outlined" sx={{ minWidth: '40px', px: 1, mt: 1 }} onClick={() => setOpenNewSeller(true)}>
                        <Add />
                    </Button> */}
                    <ActionableIcon Icon={Add} iconStyle="text-slate-200 hover:text-white h-10 w-10" onClick={() => setOpenNewSeller(true)} tooltipText="Add New Seller" />
                </div>
            </div>

           <AddSellerForm openNewSeller={openNewSeller} setOpenNewSeller={setOpenNewSeller} />
        </FormCard>
    );
};

export default SellerSection;
