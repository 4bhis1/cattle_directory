'use client';

import React from 'react';
import { LinearProgress } from '@mui/material';
import { Pets } from '@mui/icons-material';

import FormButton from '@/app/components/Form/components/FormButton';
import { useSnackbar } from '@/app/context/SnackbarContext';

import { useUser } from '@/app/context/CommonProvider';
import StickyFooter from '../../ui/StickyFooter';
import BasicInfoSection from './BasicInfo';
import Form, { useFormContext } from '../../Form/Form';
import { VaccinationSection } from './Vaccination';
import GallerySection from './Gallery';
import StatusSection from './Status';
import WeightSection from './Weight';
import SellerSection from './Seller';
import useFormFetch from '../../Form/hooks/useFormFetch';

const calculateAge = (dob: string) => {
    if (!dob) return "";
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
};

const CattleFormInner = ({ id }: { id?: string }) => {
    const { reset } = useFormContext();
    const { isAdmin } = useUser();

    useFormFetch({
        endpoint: id ? `/cattle/${id}` : '',
        enabled: !!id,
        resetForm: false, // We'll handle mapping manually
        onSuccess: (res) => {
            if (res.success && res.data) {
                const c = res.data;
                const mappedData = {
                    name: c.name,
                    breed: c.breed,
                    cattleType: c.category,
                    dateOfAcquisition: c.dateOfAcquisition?.split('T')[0] || '',
                    purchasePrice: c.purchasePrice?.toString() || '',
                    age: calculateAge(c.dateOfBirth),
                    dateOfBirth: c.dateOfBirth?.split('T')[0] || '',
                    estimatedMilkProductionDaily: '0',
                    expectedMilkProduction: c.expectedMilkProduction?.toString() || '',
                    fatPercentage: c.fatPercentage?.toString() || '',
                    numberOfBirths: c.numberOfBirths?.toString() || '',
                    motherId: c.motherId || '',
                    gallery: c.images ? c.images.map((img: any) => typeof img === 'string' ? { url: img, _id: img } : img) : [],
                    status: c.status?.current || 'active',
                    statusReason: c.status?.history?.slice(-1)[0]?.reason || '',
                    semen: c.status?.history?.slice(-1)[0]?.semen || '',
                    statusHistory: c.status?.history || [],
                    currentWeight: c.weight?.current?.toString() || '',
                    weightHistory: c.weight?.history || [],
                    vaccinations: c.healthRecords?.vaccinations || [],
                    sellerId: c.sellerId || '',
                    acquisitionType: c.acquisitionType || 'purchased',
                };
                reset(mappedData);
            }
        }
    });
    
    // Set default date for new forms only on client-side to prevent hydration mismatch
    React.useEffect(() => {
        if (!id) {
             const today = new Date().toISOString().split('T')[0];
             // reset will re-initialize the form state. 
             // We need to match what's in defaultValues effectively + the dynamic date.
             reset({
               dateOfAcquisition: today,
               gender: 'female',
               cattleType: 'cow',
               numberOfBirths: 0,
               acquisitionType: 'purchased'
             });
        }
    }, [id, reset]);

    return (
        <>
            <div className='sticky top-20 z-50 w-full'>
                <LinearProgress variant="determinate" value={0} sx={{ height: 6 }} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
                <div className="lg:col-span-1 space-y-6">
                    <GallerySection />
                    <SellerSection />
                    <StatusSection />
                    <WeightSection />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <BasicInfoSection />
                    <VaccinationSection />
                </div>
            </div>
            {isAdmin && <StickyFooter parentStyle="flex w-full justify-end">
                <FormButton
                    label="Save Cattle"
                    fullWidth={false}
                    Icon={<Pets />}
                />
            </StickyFooter>}
        </>
    );
};

const CattleForm = ({ id }: { id?: string }) => {
    const { showSnackbar } = useSnackbar();

    const formProps = {
        endpoint: id ? `/cattle/${id}` : '/cattle',
        method: (id ? 'PUT' : 'POST') as "POST" | "PUT" | "PATCH",
        beforeSubmit: (data: any) => {
            const payload = { ...data };
            // Clean empty ObjectIds
            if (!payload.motherId) delete payload.motherId;
            // Handle sellerId if it's an object (from AutoComplete) or string
            if (payload.sellerId && typeof payload.sellerId === 'object') {
                payload.sellerId = payload.sellerId._id;
            }
            if (!payload.sellerId) delete payload.sellerId;
            // Ensure dateOfAcquisition is present (fallback to now if missing, though validation should catch it)
            if (!payload.dateOfAcquisition) {
                payload.dateOfAcquisition = new Date().toISOString(); 
            }
            return payload;
        },
        onSuccess: () => {
            showSnackbar('Saved successfully!', 'success');
        },
        onError: (err: any) => {
            showSnackbar(err.message, 'error');
        },
        defaultValues: {
            dateOfAcquisition: new Date().toISOString(),
            gender: 'female',
            cattleType: 'cow',
            numberOfBirths: 0,
            acquisitionType: 'purchased',
        }
    }

    return (
        <Form {...formProps}>
            <CattleFormInner id={id} />
        </Form>
    )
}

export default CattleForm;
