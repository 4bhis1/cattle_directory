
import React from 'react';
import { useFormContext } from '../../Form/Form';
import { MonitorWeight } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FormNumber } from '../../Form/Form';
import { FormCard, FormCardHeader } from '../../Form/components/FormCard';

const WeightSection = () => {
    const { watch, setValue, getValues } = useFormContext();
    const weightHistory = watch('weightHistory') || [];

    return (
        <FormCard>
            <FormCardHeader
                title="Weight Records"
                Icon={<MonitorWeight className="mr-2 text-green-500" />}
            />
            <div className="flex items-center space-x-2 mb-4">
                <div className="flex-grow">
                    <FormNumber name="currentWeight" label="Current Weight (kg)" />
                </div>
            </div>


            <div className="max-h-52 overflow-y-auto mt-4">
                {weightHistory.length === 0 ? (
                    <p className="text-sm text-slate-400">No weight history.</p>
                ) : (
                    <div className="space-y-2">
                        {weightHistory.slice().reverse().slice(0, 2).map((rec: any, i: number) => (
                            <div key={i} className="flex justify-between p-2 border border-slate-100 dark:border-slate-800 rounded">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{rec.weight} kg</span>
                                <span className="text-xs text-slate-500">{new Date(rec.measuredAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FormCard>
    );
};

export default WeightSection;
