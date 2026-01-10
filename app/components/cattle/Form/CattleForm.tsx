'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    Button,
    Avatar,
    ImageList,
    ImageListItem,
    IconButton,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Breadcrumbs,
    Link,
    Chip,
    Alert,
    TextField,
    Typography
} from '@mui/material';
import {
    PhotoLibrary,
    CloudUpload,
    Delete,
    Pets,
    MonitorWeight,
    NavigateNext,
    FamilyRestroom,
    InfoOutlined,
    Vaccines,
    Person,
    Add,
    Storefront
} from '@mui/icons-material';

import FormInput from '@/app/components/Form/inputs/FormInput';
import FormNumber from '@/app/components/Form/inputs/FormNumber';
import FormDate from '@/app/components/Form/inputs/FormDate';
import FormAutocomplete from '@/app/components/Form/inputs/FormAutocomplete';
import FormButton from '@/app/components/Form/components/FormButton';
import useFormFetch from '@/app/components/Form/hooks/useFormFetch';
import { apiService } from '@/lib/apiService';
import { TopHeader } from '@/app/components/ui/Header';
import { useSnackbar } from '@/app/context/SnackbarContext';

// Types
interface FormData {
    name: string;
    breed: string;
    cattleType: string;
    dateOfJoining: string;
    purchaseAmount: string | number;
    age: string | number;
    estimatedMilkProductionDaily: string | number;
    fatPercentage: string | number;
    expectedMilkProduction: string | number;
    motherId: string | null;
    gallery: { _id: string, url: string }[];
    lastPhotoDate?: string;
    status: 'active' | 'pregnant' | 'sick' | 'sold' | 'deceased' | 'dry';
    statusReason: string;
    semen: string;
    statusHistory: any[];
    currentWeight: string | number;
    weightHistory: any[];
    vaccinations: any[];
    dateOfBirthInput: string;
    numberOfBirths: string | number;
    sellerId: string | null;
    newSeller?: { name: string; phoneNumber: string; address: string };
}

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Pregnant', value: 'pregnant' },
    { label: 'Sick', value: 'sick' },
    { label: 'Sold', value: 'sold' },
    { label: 'Deceased', value: 'deceased' },
    { label: 'Dry', value: 'dry' },
];

// const GallerySection = () => {
//     const { watch, setValue } = useFormContext();
//     const gallery = watch('gallery') || [];
//     const profilePhoto = gallery.length > 0 ? gallery[gallery.length - 1].url : '/placeholder-cow.png';

//     const handleUploadSuccess = (fileId: string, url: string) => {
//         setValue('gallery', [...gallery, { _id: fileId, url }], { shouldDirty: true });
//         setValue('lastPhotoDate', new Date().toISOString().split('T')[0]);
//     };

//     const removeGalleryImage = (index: number) => {
//         setValue('gallery', gallery.filter((_: any, i: number) => i !== index), { shouldDirty: true });
//     };

//     return (
//         <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up">
//             <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
//                     <PhotoLibrary className="mr-2 text-pink-500" /> Gallery
//                 </h3>
//                 <FileUpload onUploadSuccess={handleUploadSuccess} label="Add Photo" multiple />
//             </div>
//             <div className="mb-6 flex justify-center">
//                 <Avatar src={profilePhoto} alt="Profile Preview" sx={{ width: 150, height: 150, border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }} />
//             </div>
//             {gallery.length > 0 ? (
//                 <ImageList sx={{ width: '100%', maxHeight: 200 }} cols={3} rowHeight={80}>
//                     {gallery.map((item: any, index: number) => (
//                         <ImageListItem key={item._id || index}>
//                             <img src={item.url} alt={`Gallery ${index}`} loading="lazy" style={{ borderRadius: 8, height: '80px', objectFit: 'cover' }} />
//                             <IconButton sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)', padding: '2px' }} size="small" onClick={() => removeGalleryImage(index)}>
//                                 <Delete fontSize="small" color="error" />
//                             </IconButton>
//                         </ImageListItem>
//                     ))}
//                 </ImageList>
//             ) : (
//                 <p className="text-sm text-slate-500 dark:text-slate-400 text-center">No photos yet. Add one to set profile picture.</p>
//             )}
//         </div>
//     );
// };

// const StatusSection = () => {
//     const { watch } = useFormContext();
//     const status = watch('status');
//     const statusHistory = watch('statusHistory') || [];
//     const [showAll, setShowAll] = useState(false);

//     return (
//         <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up">
//             <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center mb-4">
//                 <InfoOutlined className="mr-2 text-blue-500" /> Current Status
//             </h3>
//             <div className="space-y-4">
//                 <FormAutocomplete
//                     name="status"
//                     label="Status"
//                     options={STATUS_OPTIONS}
//                     required
//                 />

//                 {['sick', 'sold', 'deceased'].includes(status) && (
//                     <FormInput
//                         name="statusReason"
//                         label={status === 'sold' ? "Sold To & Price" : "Reason/Details"}
//                         multiline
//                         rows={2}
//                     />
//                 )}
//                 {status === 'pregnant' && (
//                     <FormInput
//                         name="semen"
//                         label="Semen Used (Bull ID/Name)"
//                     />
//                 )}

//                 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">Status History</span>
//                 <div className="max-h-52 overflow-y-auto">
//                     {statusHistory.length === 0 ? (
//                         <p className="text-sm text-slate-400">No status records.</p>
//                     ) : (
//                         <div className="space-y-2">
//                             {statusHistory.slice().reverse().slice(0, 2).map((rec: any, i: number) => (
//                                 <div key={i} className="flex justify-between items-center p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50">
//                                     <Chip label={rec.status} size="small" color={rec.status === 'active' ? 'success' : 'warning'} variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
//                                     <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(rec.measuredAt).toLocaleDateString()}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// const WeightSection = () => {
//     const { watch, setValue, getValues } = useFormContext();
//     const weightHistory = watch('weightHistory') || [];
//     const [showAll, setShowAll] = useState(false);

//     return (
//         <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up">
//             <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center mb-4">
//                 <MonitorWeight className="mr-2 text-green-500" /> Weight Records
//             </h3>
//             <div className="flex items-center space-x-2 mb-4">
//                 <div className="flex-grow">
//                     <FormNumber name="currentWeight" label="Current Weight (kg)" />
//                 </div>
//             </div>
//             <Button variant="outlined" size="small" onClick={() => {
//                 const cw = getValues('currentWeight');
//                 if (cw) {
//                     setValue('weightHistory', [...weightHistory, { weight: parseFloat(cw), measuredAt: new Date().toISOString() }]);
//                 }
//             }}>
//                 Save to History
//             </Button>

//             <div className="max-h-52 overflow-y-auto mt-4">
//                 {weightHistory.length === 0 ? (
//                     <p className="text-sm text-slate-400">No weight history.</p>
//                 ) : (
//                     <div className="space-y-2">
//                         {weightHistory.slice().reverse().slice(0, 2).map((rec: any, i: number) => (
//                             <div key={i} className="flex justify-between p-2 border border-slate-100 dark:border-slate-800 rounded">
//                                 <span className="text-sm text-slate-700 dark:text-slate-300">{rec.weight} kg</span>
//                                 <span className="text-xs text-slate-500">{new Date(rec.measuredAt).toLocaleDateString()}</span>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };



// const SellerSection = () => {
//     const { watch, setValue } = useFormContext();
//     const [sellers, setSellers] = useState<any[]>([]);
//     const [openNewSeller, setOpenNewSeller] = useState(false);
//     const [newSellerData, setNewSellerData] = useState({ name: '', phoneNumber: '', address: '' });

//     useEffect(() => {
//         fetchSellers();
//     }, []);

//     const fetchSellers = async () => {
//         try {
//             const res = await apiService.get('/sellers');
//             if (res.success) setSellers(res.data);
//         } catch (error) {
//             console.error('Failed to fetch sellers');
//         }
//     };

//     const handleCreateSeller = async () => {
//         try {
//             const res = await apiService.post('/sellers', newSellerData);
//             if (res.success) {
//                 setSellers([...sellers, res.data]);
//                 setValue('sellerId', res.data._id);
//                 setOpenNewSeller(false);
//                 setNewSellerData({ name: '', phoneNumber: '', address: '' });
//             }
//         } catch (error) {
//             console.error('Failed to create seller');
//         }
//     };

//     return (
//         <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up">
//             <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center mb-4">
//                 <Storefront className="mr-2 text-indigo-500" /> Seller Information
//             </h3>

//             <div className="space-y-4">
//                 <div className="flex gap-2">
//                     <FormAutocomplete
//                         name="sellerId"
//                         label="Select Seller"
//                         options={sellers.map(s => ({ label: s.name, value: s._id }))}
//                     />
//                     <Button variant="outlined" sx={{ minWidth: '40px', px: 1 }} onClick={() => setOpenNewSeller(true)}>
//                         <Add />
//                     </Button>
//                 </div>
//             </div>

//             <Dialog open={openNewSeller} onClose={() => setOpenNewSeller(false)}>
//                 <DialogTitle>Add New Seller</DialogTitle>
//                 <DialogContent>
//                     <div className="grid gap-4 mt-2 min-w-[300px]">
//                         <TextField label="Name" fullWidth size="small" value={newSellerData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSellerData({ ...newSellerData, name: e.target.value })} />
//                         <TextField label="Phone Number" fullWidth size="small" value={newSellerData.phoneNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSellerData({ ...newSellerData, phoneNumber: e.target.value })} />
//                         <TextField label="Address" fullWidth size="small" value={newSellerData.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSellerData({ ...newSellerData, address: e.target.value })} />
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setOpenNewSeller(false)}>Cancel</Button>
//                     <Button onClick={handleCreateSeller} variant="contained">Create</Button>
//                 </DialogActions>
//             </Dialog>
//         </div>
//     );
// };

// const VaccinationSection = () => {
//     const { watch, setValue } = useFormContext();
//     const form = watch();
//     const [newVaccine, setNewVaccine] = useState({ vaccineName: '', administeredDate: '', nextDueDate: '' });
//     const [showAllVaccinations, setShowAllVaccinations] = useState(false);

//     const addVaccination = () => {
//         if (!newVaccine.vaccineName || !newVaccine.administeredDate) return;
//         const currentVaccinations = form.vaccinations || [];
//         setValue('vaccinations', [...currentVaccinations, newVaccine], { shouldDirty: true });
//         setNewVaccine({ vaccineName: '', administeredDate: '', nextDueDate: '' });
//     };

//     return (
//         <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors animate-fade-in-up" style={{ animationDelay: '400ms' }}>
//             <div className="flex items-center mb-6">
//                 <Vaccines sx={{ fontSize: 28, color: '#8b5cf6', mr: 2 }} />
//                 <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
//                     Health & Vaccination Records
//                 </h3>
//             </div>
//             <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
//                 <div className="flex-grow w-full md:w-auto">
//                     <TextField
//                         fullWidth
//                         label="Vaccine Name"
//                         size="small"
//                         value={newVaccine.vaccineName}
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVaccine({ ...newVaccine, vaccineName: e.target.value })}
//                     />
//                 </div>
//                 <div className="w-full md:w-40">
//                     <TextField
//                         fullWidth
//                         label="Administered"
//                         type="date"
//                         size="small"
//                         InputLabelProps={{ shrink: true }}
//                         value={newVaccine.administeredDate}
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVaccine({ ...newVaccine, administeredDate: e.target.value })}
//                     />
//                 </div>
//                 <div className="w-full md:w-40">
//                     <TextField
//                         fullWidth
//                         label="Next Due"
//                         type="date"
//                         size="small"
//                         InputLabelProps={{ shrink: true }}
//                         value={newVaccine.nextDueDate}
//                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVaccine({ ...newVaccine, nextDueDate: e.target.value })}
//                     />
//                 </div>
//                 <div className="w-full md:w-auto">
//                     <Button variant="contained" onClick={addVaccination} disabled={!newVaccine.vaccineName} disableElevation sx={{ height: 40, width: { xs: '100%', md: 'auto' } }}>Add</Button>
//                 </div>
//             </div>

//             <div className="space-y-2">
//                 {(!form.vaccinations || form.vaccinations.length === 0) ? (
//                     <p className="text-center text-slate-400">No vaccination records added.</p>
//                 ) : (
//                     <div className="space-y-2">
//                         {form.vaccinations.slice().reverse().slice(0, 2).map((vac: any, i: number) => (
//                             <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex justify-between items-center rounded-lg">
//                                 <div>
//                                     <span className="block font-bold text-slate-800 dark:text-white text-sm">{vac.vaccineName}</span>
//                                     <span className="text-xs text-slate-500">Date: {new Date(vac.administeredDate).toLocaleDateString()}</span>
//                                 </div>
//                                 {vac.nextDueDate && <Chip label={`Next: ${new Date(vac.nextDueDate).toLocaleDateString()}`} size="small" color="primary" variant="outlined" />}
//                             </div>
//                         ))}
//                         {form.vaccinations.length > 2 && (
//                             <Button size="small" onClick={() => setShowAllVaccinations(true)} sx={{ textTransform: 'none' }}>View all {form.vaccinations.length} records</Button>
//                         )}
//                     </div>
//                 )}
//             </div>
//             <Dialog open={showAllVaccinations} onClose={() => setShowAllVaccinations(false)}>
//                 <DialogTitle>Vaccination History</DialogTitle>
//                 <DialogContent dividers>
//                     <List>
//                         {form.vaccinations?.slice().reverse().map((vac: any, i: number) => (
//                             <ListItem key={i} divider>
//                                 <ListItemText
//                                     primary={vac.vaccineName}
//                                     secondary={<><Typography variant="body2" component="span" display="block">Administered: {new Date(vac.administeredDate).toLocaleDateString()}</Typography>{vac.nextDueDate && <Typography variant="body2" component="span" color="primary">Next Due: {new Date(vac.nextDueDate).toLocaleDateString()}</Typography>}</>}
//                                 />
//                             </ListItem>
//                         ))}
//                     </List>
//                 </DialogContent>
//                 <DialogActions><Button onClick={() => setShowAllVaccinations(false)}>Close</Button></DialogActions>
//             </Dialog>
//         </div>
//     );
// };

import { useUser } from '@/app/context/CommonProvider';
// import { useFormContext } from '../../Form/Form';
import FileUpload from '../../Form/inputs/FileUpload';
import StickyFooter from '../../ui/StickyFooter';
import BasicInfoSection from './BasicInfo';
import Form from '../../Form/Form';


const CattleForm = ({ id }: { id?: string }) => {
    // const { reset, watch, handleSubmit, isSubmitting } = useFormContext();
    // const [allCattle, setAllCattle] = useState<any[]>([]);
    const { isAdmin } = useUser();
    // const router = useRouter();
    const { showSnackbar } = useSnackbar();

    // // Fetch all cattle for options
    // useEffect(() => {
    //     apiService.get('/cattle').then((res: any) => {
    //         if (res.success) {
    //             setAllCattle(id ? res.data.filter((c: any) => c._id !== id) : res.data);
    //         }
    //     });
    // }, [id]);

  

    // useFormFetch({
    //     endpoint: id ? `/cattle/${id}` : '',
    //     enabled: !!id,
    //     resetForm: false, // We'll handle mapping manually
    //     onSuccess: (res) => {
    //         if (res.success && res.data) {
    //             const c = res.data;
    //             const mappedData = {
    //                 name: c.name,
    //                 breed: c.breed,
    //                 cattleType: c.category,
    //                 dateOfJoining: c.dateOfAcquisition?.split('T')[0] || '',
    //                 purchaseAmount: c.purchasePrice?.toString() || '',
    //                 age: calculateAge(c.dateOfBirth),
    //                 dateOfBirthInput: c.dateOfBirth?.split('T')[0] || '',
    //                 estimatedMilkProductionDaily: '0',
    //                 expectedMilkProduction: c.expectedMilkProduction?.toString() || '',
    //                 fatPercentage: c.fatPercentage?.toString() || '',
    //                 numberOfBirths: c.numberOfBirths?.toString() || '',
    //                 motherId: c.motherId || '',
    //                 gallery: c.images ? c.images.map((img: any) => typeof img === 'string' ? { url: img, _id: img } : img) : [],
    //                 status: c.status?.current || 'active',
    //                 statusReason: c.status?.history?.slice(-1)[0]?.reason || '',
    //                 semen: c.status?.history?.slice(-1)[0]?.semen || '',
    //                 statusHistory: c.status?.history || [],
    //                 currentWeight: c.weight?.current?.toString() || '',
    //                 weightHistory: c.weight?.history || [],
    //                 vaccinations: c.healthRecords?.vaccinations || [],
    //                 sellerId: c.sellerId || '',
    //             };
    //             reset(mappedData);
    //         }
    //     }
    // });

    // const onSubmit = async (data: any) => {
    //     const payload = {
    //         name: data.name,
    //         category: data.cattleType,
    //         gender: 'female',
    //         breed: data.breed,
    //         dateOfBirth: data.dateOfBirthInput ? new Date(data.dateOfBirthInput).toISOString() : undefined,
    //         dateOfAcquisition: data.dateOfJoining ? new Date(data.dateOfJoining).toISOString() : new Date().toISOString(),
    //         acquisitionType: 'purchased',
    //         purchasePrice: parseFloat(data.purchaseAmount || '0'),
    //         expectedMilkProduction: parseFloat(data.expectedMilkProduction || '0'),
    //         fatPercentage: parseFloat(data.fatPercentage || '0'),
    //         numberOfBirths: parseFloat(data.numberOfBirths || '0'),
    //         weight: {
    //             current: parseFloat(data.currentWeight || '0'),
    //             history: data.weightHistory
    //         },
    //         status: {
    //             current: data.status,
    //             history: (() => {
    //                 const existing = data.statusHistory || [];
    //                 const newEntry = { status: data.status, measuredAt: new Date(), reason: data.statusReason, semen: data.semen };
    //                 if (existing.length === 0) return [newEntry];
    //                 const last = existing[existing.length - 1];
    //                 if (last.status !== newEntry.status || last.reason !== newEntry.reason) return [...existing, newEntry];
    //                 return existing;
    //             })()
    //         },
    //         healthRecords: { lastCheckup: new Date(), vaccinations: data.vaccinations },
    //         images: data.gallery.map((g: any) => g._id),
    //         motherId: data.motherId || null,
    //         sellerId: data.sellerId || null,
    //     };

    //     try {
    //         if (id) {
    //             await apiService.put(`/cattle/${id}`, payload); // PATCH or PUT
    //         } else {
    //             await apiService.post('/cattle', payload);
    //         }
    //         showSnackbar('Saved successfully!', 'success');
    //         setTimeout(() => router.push('/cattle/dashboard'), 1000);
    //     } catch (err: any) {
    //         showSnackbar(err.message, 'error');
    //     }
    // }

    // const formValues = watch();
    // const calculateProgress = () => {
    //     const fields = ['name', 'breed', 'dateOfJoining', 'purchaseAmount', 'age', 'status', 'currentWeight'];
    //     const filled = fields.filter((k) => !!formValues[k as keyof FormData]).length;
    //     return Math.round((filled / fields.length) * 100);
    // };

    let formType = "add";
    if (id) formType = "edit";


    const formProps = {
        endpoint: id ? `/cattle/${id}` : '/cattle',
        method: id ? 'PUT' : 'POST',
        onSuccess: () => {
            showSnackbar('Saved successfully!', 'success');
        },
        onError: (err: any) => {
            showSnackbar(err.message, 'error');
        }
    }

    return (
        <Form {...formProps}>
            <div className='sticky top-20 z-50 w-full'>
                <LinearProgress variant="determinate" value={0} sx={{ height: 6 }} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
                <div className="lg:col-span-1 space-y-6">
                    {/* <GallerySection /> */}
                    {/* <SellerSection /> */}
                    {/* <StatusSection /> */}
                    {/* <WeightSection /> */}
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <BasicInfoSection />
                    {/* <VaccinationSection /> */}
                </div>
            </div>
            {isAdmin && <StickyFooter parentStyle="flex w-full justify-end">
                <FormButton
                    label="Save Cattle"
                    fullWidth={false}
                    Icon={<Pets />}
                />
            </StickyFooter>}
        </Form>
    )
}

export default CattleForm;
