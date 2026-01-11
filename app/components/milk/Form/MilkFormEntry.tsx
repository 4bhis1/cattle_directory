import React from 'react';
import { Card, Box, Typography, Avatar, Chip } from '@mui/material';
import FormInput from '@/app/components/Form/inputs/FormInput';
import FormNumber from '@/app/components/Form/inputs/FormNumber';
import { useWatch } from 'react-hook-form';

interface MilkFormEntryProps {
    index: number;
    cattleName: string;
    breed: string;
    status: string;
    image?: string;
    expectedMilk: number;
}

const MilkFormEntry = ({ index, cattleName, breed, status, image, expectedMilk }: MilkFormEntryProps) => {
    // Monitor morning and evening to show total? Optional, but good UX.
    const morning = useWatch({ name: `entries.${index}.morning` });
    const evening = useWatch({ name: `entries.${index}.evening` });
    const fat = useWatch({ name: `entries.${index}.fat` });

    const total = (parseFloat(morning || '0') + parseFloat(evening || '0')).toFixed(1);

    return (
        <Card variant="outlined" className="p-4 mb-4 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Cattle Info */}
                <div className="flex items-center gap-4 min-w-[200px] flex-1">
                    <Avatar 
                        src={image} 
                        alt={cattleName}
                        sx={{ width: 56, height: 56 }}
                        className="bg-blue-100 text-blue-600"
                    >
                        {cattleName.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <div>
                        <Typography variant="h6" className="font-bold text-slate-800 dark:text-slate-100">
                            {cattleName}
                        </Typography>
                        <div className="flex gap-2 items-center mt-1">
                            <Chip 
                                label={breed} 
                                size="small" 
                                className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs" 
                            />
                            {status && (
                                <Chip 
                                    label={status} 
                                    size="small" 
                                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs capitalized" 
                                />
                            )}
                            <Typography variant="caption" className="text-slate-500">
                                Exp: {expectedMilk}L
                            </Typography>
                        </div>
                    </div>
                </div>

                {/* Inputs */}
                <div className="flex flex-wrap gap-4 flex-[2]">
                    <div className="flex-1 min-w-[100px]">
                        <FormNumber
                            name={`entries.${index}.morning`}
                            label="Morning (L)"
                            placeholder="0"
                        />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                        <FormNumber
                            name={`entries.${index}.evening`}
                            label="Evening (L)"
                            placeholder="0"
                        />
                    </div>
                    <div className="flex-1 min-w-[80px]">
                        <FormNumber
                            name={`entries.${index}.fat`}
                            label="Fat %"
                            placeholder="0"
                        />
                    </div>
                    <div className="flex-1 min-w-[80px]">
                         <FormNumber
                            name={`entries.${index}.snf`}
                            label="SNF"
                            placeholder="0"
                        />
                    </div>
                </div>

                 {/* Summary Tag */}
                 <div className="min-w-[80px] text-right md:text-center hidden md:block">
                    <Typography variant="caption" display="block" className="text-slate-500">
                        Total
                    </Typography>
                    <Typography variant="h6" className={`font-bold ${parseFloat(total) > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                        {total}L
                    </Typography>
                </div>
            </div>
        </Card>
    );
};

export default MilkFormEntry;
