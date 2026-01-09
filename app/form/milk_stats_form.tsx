'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Breadcrumbs,
  Link,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  CalendarMonth,
  LocalDrink,
  Pets,
  ArrowBack,
  NavigateNext,
} from '@mui/icons-material';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';

import StickyFooter, { SummaryData } from '../components/ui/StickyFooter';
import { Form } from '../components/ui/Form';
import { useMilkProduction, MilkEntry } from '../hooks/useMilkProduction';
import { useSaveMilkRecords } from '../hooks/useSaveMilkRecords';

// Define stable InputProps
const literInputProps = {
  endAdornment: <InputAdornment position="end">L</InputAdornment>,
};





export default function MilkStatsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Date Logic
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const urlDate = searchParams.get('date');
  const [date, setDate] = useState(urlDate || getTodayDate());
  const isReadOnly = searchParams.get('readonly') === 'true';

  // Custom Hooks
  const { data: milkData, loading, refetch } = useMilkProduction(date);
  const { saveRecords, saving } = useSaveMilkRecords();

  // Form Setup
  const methods = useForm<{ records: MilkEntry[] }>({
    defaultValues: {
      records: []
    }
  });

  const { control, register, reset } = methods;

  const { fields, replace } = useFieldArray({
    control,
    name: "records",
    keyName: "key" // unique key for each field
  });

  // Watch fields for totals calculation
  const records = useWatch({
    control,
    name: "records"
  });

  // Sync data to form
  useEffect(() => {
    if (milkData) {
      replace(milkData);
    }
  }, [milkData, replace]);

  // Handle Date Change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    const params = new URLSearchParams(searchParams.toString());
    if (newDate) {
      params.set('date', newDate);
    } else {
      params.delete('date');
    }
    router.replace(`?${params.toString()}`);
  };

  // Calculations
  const totalMorningMilk = records?.reduce((sum, r) => sum + (Number(r.morningMilk) || 0), 0) || 0;
  const totalEveningMilk = records?.reduce((sum, r) => sum + (Number(r.eveningMilk) || 0), 0) || 0;
  const totalMilkProduced = totalMorningMilk + totalEveningMilk;

  const cowsWithMilk = records?.filter(c => (Number(c.morningMilk) > 0 || Number(c.eveningMilk) > 0)).length || 0;
  const progress = fields.length > 0 ? (cowsWithMilk / fields.length) * 100 : 0;

  // Snackbar State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const onSubmit = async (data: { records: MilkEntry[] }) => {
    if (!date) {
      setSnackbar({ open: true, message: 'Please select a date', severity: 'error' });
      return;
    }

    const success = await saveRecords(data.records, date);

    if (success) {
      setSnackbar({ open: true, message: '🥛 Milk production records saved successfully!', severity: 'success' });
      refetch(); // Refresh data
    } else {
      setSnackbar({ open: true, message: 'Failed to save records. Please try again.', severity: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-0 transition-colors duration-300 flex flex-col relative">
      {/* Progress Bar */}
      <div className='sticky top-0 z-50 w-full'>
        <LinearProgress
          variant="determinate"
          className="sticky top-0 z-50 w-full"
          value={progress}
          sx={{
            height: 6,
            backgroundColor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
            }
          }}
        />
      </div>
      <div className="w-full px-4 md:px-8 py-6 flex-grow">
        {/* Breadcrumbs & Header */}
        <div className="mb-8">
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="mb-4">
            <Link color="inherit" href="/home" onClick={(e) => { e.preventDefault(); router.push('/home'); }} className="no-underline hover:text-blue-600 cursor-pointer text-slate-500 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <span className="text-slate-800 dark:text-slate-200 font-medium">Milk Production</span>
          </Breadcrumbs>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <IconButton onClick={() => router.back()} className="mr-4 bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                <ArrowBack />
              </IconButton>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  Milk Production Record
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Record daily milk production for your cattle
                </p>
              </div>
            </div>

            <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center shadow-sm">
              <CalendarMonth className="text-blue-600 dark:text-blue-400 mr-2" />
              <TextField
                type="date"
                value={date}
                size="small"
                onChange={handleDateChange}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  className: "text-slate-800 dark:text-white font-semibold"
                }}
                disabled={isReadOnly}
                sx={{
                  '& input': {
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'inherit',
                    cursor: 'pointer'
                  }
                }}
              />
            </div>
          </div>
        </div>

        <Form methods={methods} onSubmit={onSubmit}>
          <div className="animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                      <th rowSpan={2} className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Pets className="text-blue-500" fontSize="small" />
                          <span>Cow Name</span>
                        </div>
                      </th>
                      <th colSpan={2} className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">
                        <div className="flex items-center justify-center gap-1">
                          <LocalDrink fontSize="small" />
                          Morning
                        </div>
                      </th>
                      <th colSpan={2} className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10">
                        <div className="flex items-center justify-center gap-1">
                          <LocalDrink fontSize="small" />
                          Evening
                        </div>
                      </th>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-medium">Qty (L)</th>
                      <th className="py-2 px-4 text-center font-medium">Fat (%)</th>
                      <th className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-medium">Qty (L)</th>
                      <th className="py-2 px-4 text-center font-medium">Fat (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <CircularProgress size={32} className="text-blue-600" />
                          <p className="mt-2 text-slate-500 text-sm">Loading records...</p>
                        </td>
                      </tr>
                    ) : fields.map((field, index) => (
                      <tr
                        key={field.key}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                              {field.image ? (
                                <img src={field.image} alt={field.name} className="w-full h-full object-cover" />
                              ) : (
                                <Pets fontSize="small" className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-white">
                                {field.name}
                              </div>
                              {field.status && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5 border
                                  ${field.status === 'active'
                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                    : field.status === 'pregnant'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                      : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                  {field.status}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Hidden Inputs for ID and Name */}
                          <input type="hidden" {...register(`records.${index}._id`)} />
                          <input type="hidden" {...register(`records.${index}.cattleId`)} />
                          <input type="hidden" {...register(`records.${index}.name`)} />
                        </td>

                        {/* Morning Milk */}
                        <td className="py-2 px-4 border-l border-slate-200 dark:border-slate-800">
                          <TextField
                            type="number"
                            disabled={isReadOnly}
                            placeholder="0.0"
                            {...register(`records.${index}.morningMilk`, { valueAsNumber: true })}
                            inputProps={{ min: 0, step: 0.1, className: 'text-center font-bold' }}
                            size="small"
                            fullWidth
                            InputProps={{
                              disableUnderline: true,
                              className: "bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors"
                            }}
                            variant="standard"
                            sx={{
                              '& .MuiInputBase-root': { padding: '4px 8px' },
                              '& input': { textAlign: 'center', color: '#3b82f6', fontWeight: 600 }
                            }}
                          />
                        </td>
                        <td className="py-2 px-4">
                          <TextField
                            type="number"
                            disabled={isReadOnly}
                            placeholder={field.morningFat?.toString() || ""}
                            {...register(`records.${index}.morningFat`, { valueAsNumber: true })}
                            inputProps={{ min: 0, step: 0.1 }}
                            size="small"
                            fullWidth
                            InputProps={{
                              disableUnderline: true,
                              endAdornment: <span className="text-xs text-slate-400 ml-1">%</span>,
                              className: "rounded-lg"
                            }}
                            variant="standard"
                            sx={{
                              '& .MuiInputBase-root': { padding: '4px 8px' },
                              '& input': { textAlign: 'center', color: '#64748b' }
                            }}
                          />
                        </td>

                        {/* Evening Milk */}
                        <td className="py-2 px-4 border-l border-slate-200 dark:border-slate-800">
                          <TextField
                            type="number"
                            disabled={isReadOnly}
                            placeholder="0.0"
                            {...register(`records.${index}.eveningMilk`, { valueAsNumber: true })}
                            inputProps={{ min: 0, step: 0.1 }}
                            size="small"
                            fullWidth
                            InputProps={{
                              disableUnderline: true,
                              className: "bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors"
                            }}
                            variant="standard"
                            sx={{
                              '& .MuiInputBase-root': { padding: '4px 8px' },
                              '& input': { textAlign: 'center', color: '#8b5cf6', fontWeight: 600 }
                            }}
                          />
                        </td>
                        <td className="py-2 px-4">
                          <TextField
                            type="number"
                            disabled={isReadOnly}
                            placeholder={field.eveningFat?.toString() || "4.5"}
                            {...register(`records.${index}.eveningFat`, { valueAsNumber: true })}
                            inputProps={{ min: 0, step: 0.1 }}
                            size="small"
                            fullWidth
                            InputProps={{
                              disableUnderline: true,
                              endAdornment: <span className="text-xs text-slate-400 ml-1">%</span>,
                              className: "rounded-lg"
                            }}
                            variant="standard"
                            sx={{
                              '& .MuiInputBase-root': { padding: '4px 8px' },
                              '& input': { textAlign: 'center', color: '#64748b' }
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </Form>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ bottom: { xs: 100, sm: 100 } }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>

      <StickyFooter
        summary={<SummaryData stats={[
          { label: 'Morning', value: totalMorningMilk.toFixed(1), unit: 'L', valueColor: 'text-blue-600 dark:text-blue-400' },
          { label: 'Evening', value: totalEveningMilk.toFixed(1), unit: 'L', valueColor: 'text-purple-600 dark:text-purple-400' },
          { label: 'Total', value: totalMilkProduced.toFixed(1), unit: 'L', valueColor: 'text-slate-800 dark:text-white' }
        ]} />}


        submitButton={{
          text: 'Save',
          onClick: () => methods.handleSubmit(onSubmit)(),
          loading: saving,
          disabled: saving || isReadOnly
        }}
      />
    </div>
  );
}
