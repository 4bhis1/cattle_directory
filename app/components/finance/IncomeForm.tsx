'use client';

import React, { useState, useEffect } from 'react';
import Form, {
  FormInput,
  FormNumber,
  FormButton,
  useFormContext,
  FormAutocomplete
} from '@/app/components/Form';
import { useSnackbar } from '@/app/context/SnackbarContext';
import { DEFAULT_ORGANISATION_ID } from '@/app/context/CommonProvider';
import dayjs, { Dayjs } from 'dayjs';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Chip } from '@mui/material';
import { apiService } from '@/lib/apiService';

const INCOME_SOURCES = [
    { value: 'milk_sale', label: 'Milk Sale' },
    { value: 'cattle_sale', label: 'Cattle Sale' },
    { value: 'semen_sale', label: 'Semen Sale' },
    { value: 'waste_sale', label: 'Waste Sale' },
    { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = ['cash', 'upi', 'bank-transfer', 'cheque', 'card'];

const IncomeFormInner = ({ onClose }: { onClose?: () => void }) => {
    const { watch, setValue, isSubmitting } = useFormContext();
    const source = watch('source');
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [pendingSales, setPendingSales] = useState<any[]>([]);
    const [selectedSales, setSelectedSales] = useState<string[]>([]);
    const [loadingSales, setLoadingSales] = useState(false);
    
    // Fetch Customers
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await apiService.get('/customers');
                setCustomers(res.data || []);
            } catch (err) {
                console.error("Failed to fetch customers", err);
            }
        };
        fetchCustomers();
    }, []);

    // Fetch Pending Sales when Customer Selected
    useEffect(() => {
        if (source === 'milk_sale' && selectedCustomer) {
            fetchPendingSales(selectedCustomer._id);
        } else {
            setPendingSales([]);
            setSelectedSales([]);
        }
    }, [source, selectedCustomer]);

    const fetchPendingSales = async (customerId: string) => {
        setLoadingSales(true);
        try {
            // Fetch sales pending payment
            const res = await apiService.get(`/sales?customerId=${customerId}&paymentStatus=pending&limit=100`);
            setPendingSales(res.data || []);
        } catch (err) {
            console.error("Failed to fetch pending sales", err);
        } finally {
            setLoadingSales(false);
        }
    };

    // Handle Sales Selection
    const handleToggleSale = (saleId: string, amount: number) => {
        const currentIndex = selectedSales.indexOf(saleId);
        const newSelected = [...selectedSales];

        if (currentIndex === -1) {
            newSelected.push(saleId);
        } else {
            newSelected.splice(currentIndex, 1);
        }

        setSelectedSales(newSelected);
        setValue('transactionIds', newSelected);

        // Recalculate Total Amount
        const total = pendingSales
            .filter(s => newSelected.includes(s._id))
            .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        
        setValue('amount', total);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = pendingSales.map(s => s._id);
            setSelectedSales(allIds);
            setValue('transactionIds', allIds);
            const total = pendingSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
            setValue('amount', total);
        } else {
            setSelectedSales([]);
            setValue('transactionIds', []);
            setValue('amount', 0);
        }
    };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="date"
          label="Date"
          type="date"
          defaultValue={dayjs().format('YYYY-MM-DD')}
          rules={{ required: 'Date is required' }}
        />
        <FormAutocomplete
            name="source"
            label="Source"
            options={INCOME_SOURCES}
            rules={{ required: 'Source is required' }}
        />
      </div>

      {source === 'milk_sale' && (
          <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl space-y-4">
               <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => `${option.name} (${option.phone})`}
                    value={selectedCustomer}
                    onChange={(event, newValue) => {
                        setSelectedCustomer(newValue);
                        setValue('relatedCustomerId', newValue?._id);
                    }}
                    renderInput={(params) => <TextField {...params} label="Select Client" variant="outlined" size="small" />}
                />

                {loadingSales && <CircularProgress size={20} />}

                {!loadingSales && pendingSales.length > 0 && (
                    <div className="max-h-60 overflow-y-auto bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox 
                                            checked={pendingSales.length > 0 && selectedSales.length === pendingSales.length}
                                            indeterminate={selectedSales.length > 0 && selectedSales.length < pendingSales.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Session</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingSales.map((sale) => {
                                    const isSelected = selectedSales.indexOf(sale._id) !== -1;
                                    return (
                                        <TableRow 
                                            key={sale._id} 
                                            hover 
                                            role="checkbox" 
                                            selected={isSelected}
                                            className={isSelected ? "!bg-green-50 dark:!bg-green-900/20" : ""}
                                            onClick={() => handleToggleSale(sale._id, sale.totalAmount)}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected} />
                                            </TableCell>
                                            <TableCell>{dayjs(sale.date).format('DD MMM')}</TableCell>
                                            <TableCell className="capitalize">{sale.session}</TableCell>
                                            <TableCell align="right">{sale.quantityInLiters}L</TableCell>
                                            <TableCell align="right">₹{sale.totalAmount}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
                
                {!loadingSales && selectedCustomer && pendingSales.length === 0 && (
                    <Typography variant="body2" color="textSecondary" align="center" className="py-4">
                        No pending sales found for this client.
                    </Typography>
                )}
          </div>
      )}

      <FormNumber
        name="amount"
        label="Amount (₹)"
        placeholder="e.g. 5000"
        rules={{ required: 'Amount is required', min: { value: 0, message: 'Must be positive' } }}
        min={0}
        // Disabled if milk sale, to force selection? Or allow override?
        // User requested "mark that column green", implying selection driven.
        // I'll keep it editable but selection updates it.
      />

      <FormAutocomplete
        name="paymentMethod"
        label="Payment Method"
        options={PAYMENT_METHODS.map((m) => ({ value: m.toLowerCase(), label: m }))}
        rules={{ required: 'Select a payment method' }}
      />
      
      <FormInput
        name="description"
        label="Description / Notes"
        multiline
        rows={3}
        placeholder="Add any extra details"
      />

      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <FormButton label="Save Transaction" fullWidth={false} />
      </div>
    </div>
  );
};

const IncomeForm = ({ incomeId, onSuccess, onClose, defaultDate, editData }: {
  incomeId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  defaultDate?: string;
  editData?: any;
}) => {
  const { showSnackbar } = useSnackbar();

  const formProps = {
    endpoint: incomeId ? `/finance/income/${incomeId}` : '/finance/income',
    method: (incomeId ? 'PATCH' : 'POST') as 'POST' | 'PATCH',
    onSuccess: () => {
      showSnackbar('Income recorded successfully!', 'success');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      showSnackbar(err.message || 'Failed to save income', 'error');
    },
    defaultValues: editData ? {
        ...editData,
        date: dayjs(editData.date).format('YYYY-MM-DD'),
        // Map fields if necessary, e.g. transactionIds
    } : {
      source: 'milk_sale',
      organisation_id: DEFAULT_ORGANISATION_ID,
      date: defaultDate || dayjs().format('YYYY-MM-DD'),
      paymentMethod: 'cash',
      amount: 0
    },
  };

  return (
    <Form {...formProps}>
      <IncomeFormInner onClose={onClose} />
    </Form>
  );
};

export default IncomeForm;
