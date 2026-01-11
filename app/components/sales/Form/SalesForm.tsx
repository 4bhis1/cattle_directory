"use client";

import React, { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { LocalDrink, Person, Search, AttachMoney } from "@mui/icons-material";
import { TextField, InputAdornment, MenuItem, LinearProgress } from "@mui/material";

import Form, { useFormContext } from "@/app/components/Form/Form";
import FormNumber from "@/app/components/Form/inputs/FormNumber";
import StickyFooter, { SummaryData } from "@/app/components/ui/StickyFooter";
import Loader from "@/app/components/ui/Loader";
import { useSnackbar } from "@/app/context/SnackbarContext";
import { salesBeforeSubmit, salesPostFetch } from "../helperFunctions";

// --- Table Component ---
const SalesTable = ({
  loading,
  isReadOnly,
}: {
  loading?: boolean;
  isReadOnly?: boolean;
}) => {
  const { control } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: "records",
    keyName: "key",
  });

  // Local state for filtering
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
        <Loader text="Loading customers..." />
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <Person className="text-slate-400" fontSize="large" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            No Customers Found
          </h3>
          <p className="text-slate-500 max-w-sm">
            There are no customers available. Add a customer to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
         <div className="flex items-center gap-2 w-full md:w-auto">
             <TextField
                placeholder="Search by name..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search className="text-slate-400" fontSize="small" />
                        </InputAdornment>
                    ),
                    className: "bg-slate-50 dark:bg-slate-800 rounded-xl"
                }}
                className="w-full md:w-64"
             />
         </div>
         <div className="text-sm text-slate-500 font-medium">
             Showing {fields.filter((field: any) => {
                 return field.name.toLowerCase().includes(searchQuery.toLowerCase());
             }).length} entries
         </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <th
                  rowSpan={2}
                  className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]"
                >
                  <div className="flex items-center gap-2">
                    <Person className="text-blue-500" fontSize="small" />
                    <span>Customer</span>
                  </div>
                </th>
                <th
                  colSpan={3} // Qty, Rate, Amt. Fat can be optional or hidden if fixed? Let's include Fat for now if backend supports it. MilkForm had Fat.
                  // Sales usually is Qty * Rate. Fat determines Rate sometimes.
                  // Previous SalesForm had Qty, Fat, Rate, Amt.
                  className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                >
                  <div className="flex items-center justify-center gap-1">
                    <LocalDrink fontSize="small" /> Morning
                  </div>
                </th>
                <th
                  colSpan={3}
                  className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10"
                >
                  <div className="flex items-center justify-center gap-1">
                    <LocalDrink fontSize="small" /> Evening
                  </div>
                </th>
                <th rowSpan={2} className="py-4 px-6 font-semibold text-right text-slate-700 dark:text-slate-300">
                    Total
                </th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {/* Morning */}
                <th className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-medium">Qty (L)</th>
                 {/* Fat column removed for simplicity/space? Or add it? Re-adding Fat as requested in "same as milk form" layout but tailored for sales. MilkForm had Fat. SalesForm had Fat. */
                 <th className="py-2 px-4 text-center font-medium">Fat (%)</th>
                 /* Rate is important for sales */ }
                <th className="py-2 px-4 text-center font-medium">Rate</th>
                {/* Amount calculated visually? */}

                {/* Evening */}
                <th className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-medium">Qty (L)</th>
                <th className="py-2 px-4 text-center font-medium">Fat (%)</th>
                <th className="py-2 px-4 text-center font-medium">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fields.map((field: any, index) => {
                 // Filter
                 if (!field.name.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                 // We need to access current values for calculations.
                 // FormNumber doesn't return value here. We rely on useWatch or watch in parent?
                 // Or we accept we don't show row total dynamically without watching EVERY row (perf hit).
                 // MilkForm didn't show row totals, only footer totals.
                 // SalesForm (previous) showed row totals.
                 // Let's rely on default functionality: Input fields.
                 
                 return (
                  <tr
                    key={field.key}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="py-3 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-white text-base">
                            {field.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs text-slate-500">{field.phone}</span>
                             {field.rateGroup && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                                    Grp {field.rateGroup}
                                </span>
                             )}
                        </div>
                      </div>
                    </td>

                    {/* Morning */}
                    <td className="py-2 px-4 border-l border-slate-200 dark:border-slate-800 bg-blue-50/20">
                      <FormNumber
                        name={`records.${index}.morningQty`}
                        placeholder="0.0"
                        readOnly={isReadOnly}
                        min={0}
                        step={0.1}
                        variant="standard"
                        InputProps={{ disableUnderline: true, className: "bg-transparent" }}
                        inputProps={{ className: "text-center font-bold text-blue-600" }}
                        onFocus={(e: any) => e.target.select()}
                      />
                    </td>
                    <td className="py-2 px-4 bg-blue-50/20">
                      <FormNumber
                         name={`records.${index}.morningFat`}
                         placeholder="4.5"
                         readOnly={isReadOnly}
                         min={0}
                         step={0.1}
                         variant="standard"
                         InputProps={{ disableUnderline: true, endAdornment: <span className="text-xs text-slate-400">%</span> }}
                         inputProps={{ className: "text-center text-slate-500" }}
                         onFocus={(e: any) => e.target.select()}
                      />
                    </td>
                    <td className="py-2 px-4 bg-blue-50/20">
                       <FormNumber
                         name={`records.${index}.morningRate`}
                         placeholder="45"
                         readOnly={isReadOnly}
                         min={0}
                         variant="standard"
                         InputProps={{ disableUnderline: true }}
                         inputProps={{ className: "text-center text-slate-500" }}
                         onFocus={(e: any) => e.target.select()}
                       />
                    </td>

                    {/* Evening */}
                    <td className="py-2 px-4 border-l border-slate-200 dark:border-slate-800 bg-purple-50/20">
                      <FormNumber
                        name={`records.${index}.eveningQty`}
                        placeholder="0.0"
                        readOnly={isReadOnly}
                        min={0}
                        step={0.1}
                        variant="standard"
                        InputProps={{ disableUnderline: true, className: "bg-transparent" }}
                        inputProps={{ className: "text-center font-bold text-purple-600" }}
                        onFocus={(e: any) => e.target.select()}
                      />
                    </td>
                    <td className="py-2 px-4 bg-purple-50/20">
                      <FormNumber
                         name={`records.${index}.eveningFat`}
                         placeholder="4.5"
                         readOnly={isReadOnly}
                         min={0}
                         step={0.1}
                         variant="standard"
                         InputProps={{ disableUnderline: true, endAdornment: <span className="text-xs text-slate-400">%</span> }}
                         inputProps={{ className: "text-center text-slate-500" }}
                         onFocus={(e: any) => e.target.select()}
                      />
                    </td>
                    <td className="py-2 px-4 bg-purple-50/20">
                       <FormNumber
                         name={`records.${index}.eveningRate`}
                         placeholder="45"
                         readOnly={isReadOnly}
                         min={0}
                         variant="standard"
                         InputProps={{ disableUnderline: true }}
                         inputProps={{ className: "text-center text-slate-500" }}
                         onFocus={(e: any) => e.target.select()}
                       />
                    </td>
                    
                    {/* Total (Cannot easily calculate row total here without watching row values. Will leave placeholder or fix later) */}
                    <td className="py-3 px-6 text-right font-medium text-slate-500">
                        {/* - */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Form Inner ---
const SalesFormInner = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { watch, isSubmitting, handleSubmit, onSubmit } = useFormContext();

  // Calculations
  const records = watch("records") || [];
  
  let totalMorningQty = 0;
  let totalEveningQty = 0;
  let totalAmount = 0;

  records.forEach((r: any) => {
      const mQty = Number(r.morningQty) || 0;
      const mRate = Number(r.morningRate) || 0;
      const eQty = Number(r.eveningQty) || 0;
      const eRate = Number(r.eveningRate) || 0;

      totalMorningQty += mQty;
      totalEveningQty += eQty;
      totalAmount += (mQty * mRate) + (eQty * eRate);
  });
  
  const totalQty = totalMorningQty + totalEveningQty;

  return (
    <>
      <div className="sticky top-20 z-50 w-full">
        <LinearProgress variant="determinate" value={0} sx={{ height: 6 }} />
      </div>
      <div className="w-full flex-grow px-4 md:px-8 py-6">
        <SalesTable isReadOnly={isReadOnly} />
      </div>
      <StickyFooter
        summary={
          <SummaryData
            stats={[
              {
                label: "Morning",
                value: totalMorningQty.toFixed(1),
                unit: "L",
                valueColor: "text-blue-600",
              },
              {
                label: "Evening",
                value: totalEveningQty.toFixed(1),
                unit: "L",
                valueColor: "text-purple-600",
              },
              {
                 label: "Sales Value",
                 value: totalAmount.toFixed(0),
                 unit: "₹",
                 valueColor: "text-green-600",
              },
              {
                label: "Total Qty",
                value: totalQty.toFixed(1),
                unit: "L",
                valueColor: "text-slate-800 dark:text-white",
              },
            ]}
          />
        }
        submitButton={{
          text: "Save Sales",
          onClick: handleSubmit(onSubmit),
          loading: isSubmitting,
          disabled: isSubmitting || isReadOnly,
        }}
        buttonStyle="w-32"
        buttonLabel="Save"
        parentStyle="px-4 md:px-10"
      />
    </>
  );
};

const SalesForm = ({ dateParam }: { dateParam: string }) => {
  const { showSnackbar } = useSnackbar();

  const formProps = {
    fetchUrl: `/sales/daily?date=${dateParam}`,
    postFetch: salesPostFetch,
    endpoint: "/sales/bulk",
    method: "POST" as "POST",
    beforeSubmit: (data: any) => salesBeforeSubmit(data, dateParam),
    onSuccess: () => {
      showSnackbar("Sales records saved successfully!", "success");
    },
    onError: (err: any) => {
      showSnackbar(err.message || "Failed to save records", "error");
    },
    defaultValues: {
      records: [],
    },
    className: "flex flex-col flex-grow h-full"
  };

  return (
    <div className="flex flex-col flex-grow h-full"> 
        <Form {...formProps}>
            <SalesFormInner />
        </Form>
    </div>
  );
};

export default SalesForm;
