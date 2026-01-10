
import React from 'react';
import { useFormContext } from '../../Form/Form';
import { InfoOutlined } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { FormAutocomplete, FormInput } from '../../Form/Form';
import { FormCard, FormCardHeader } from '../../Form/components/FormCard';

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Pregnant', value: 'pregnant' },
    { label: 'Sick', value: 'sick' },
    { label: 'Sold', value: 'sold' },
    { label: 'Deceased', value: 'deceased' },
    { label: 'Dry', value: 'dry' },
];

const StatusSection = () => {
    const { watch } = useFormContext();
    const status = watch('status');
    const statusHistory = watch('statusHistory') || [];

    return (
        <FormCard>
            <FormCardHeader
                title="Current Status"
                Icon={<InfoOutlined className="mr-2 text-blue-500" />}
            />
            <div className="space-y-4">
                <FormAutocomplete
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    required
                />

                {['sick', 'sold', 'deceased'].includes(status) && (
                    <FormInput
                        name="statusReason"
                        label={status === 'sold' ? "Sold To & Price" : "Reason/Details"}
                        multiline
                        rows={2}
                    />
                )}
                {status === 'pregnant' && (
                    <FormInput
                        name="semen"
                        label="Semen Used (Bull ID/Name)"
                    />
                )}

                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">Status History</span>
                <div className="max-h-52 overflow-y-auto">
                    {statusHistory.length === 0 ? (
                        <p className="text-sm text-slate-400">No status records.</p>
                    ) : (
                        <div className="space-y-2">
                            {statusHistory.slice().reverse().slice(0, 2).map((rec: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-2 border border-slate-100 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50">
                                    <Chip label={rec.status} size="small" color={rec.status === 'active' ? 'success' : 'warning'} variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(rec.measuredAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </FormCard>
    );
};

export default StatusSection;
