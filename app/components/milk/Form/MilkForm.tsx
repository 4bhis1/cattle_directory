"use client";

import React, { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { LocalDrink, Pets, Search, FilterList } from "@mui/icons-material";
import { TextField, InputAdornment, MenuItem, IconButton, Menu, LinearProgress } from "@mui/material";

import Form, { useFormContext } from "@/app/components/Form/Form";
import FormNumber from "@/app/components/Form/inputs/FormNumber";
import StickyFooter, { SummaryData } from "@/app/components/ui/StickyFooter";
import Loader from "@/app/components/ui/Loader";
import { useSnackbar } from "@/app/context/SnackbarContext";
import { milkBeforeSubmit, milkPostFetch } from "../helperFunctions";

// --- Types ---
interface MilkEntry {
  cattleId: string;
  name: string;
  breed: string;
  image?: string;
  status: string;
  expectedMilk: number;
  morningMilk: number;
  morningFat: number;
  eveningMilk: number;
  eveningFat: number;
  morningId?: string;
  eveningId?: string;
}

// --- Table Component ---
const MilkTable = ({
  loading,
  isReadOnly,
}: {
  loading?: boolean;
  isReadOnly?: boolean;
}) => {
  const { control, watch } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: "records",
    keyName: "key",
  });

  // Local state for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [breedFilter, setBreedFilter] = useState("All");

  // Get unique breeds for filter
  // We need to watch 'records' to get current values if we want dynamic filtering based on updated values,
  // but for static properties like 'breed' and 'name', 'fields' is usually sufficient if they were populated initially.
  // However, 'fields' only has default values. If we used reset(), fields should be populated.
  // Let's use the 'fields' array for the source of truth for filtering static data.
  const breeds = Array.from(new Set(fields.map((f: any) => f.breed || "Unknown"))).filter(Boolean);
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
        <Loader text="Loading records..." />
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <Pets className="text-slate-400" fontSize="large" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            No Cattle Found
          </h3>
          <p className="text-slate-500 max-w-sm">
            There are no active cattle available for milk recording. Add cattle
            to the directory to get started.
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
             <TextField
                select
                value={breedFilter}
                onChange={(e) => setBreedFilter(e.target.value)}
                size="small"
                InputProps={{ className: "bg-slate-50 dark:bg-slate-800 rounded-xl" }}
                className="w-40"
             >
                 <MenuItem value="All">All Breeds</MenuItem>
                 {breeds.map((breed) => (
                     <MenuItem key={breed as string} value={breed as string}>{breed as string}</MenuItem>
                 ))}
             </TextField>
         </div>
         <div className="text-sm text-slate-500 font-medium">
             Showing {fields.filter((field: any) => {
                 const matchesSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase());
                 const matchesBreed = breedFilter === "All" || field.breed === breedFilter;
                 return matchesSearch && matchesBreed;
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
                  className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 min-w-[250px]"
                >
                  <div className="flex items-center gap-2">
                    <Pets className="text-blue-500" fontSize="small" />
                    <span>Cattle Details</span>
                  </div>
                </th>
                <th
                  colSpan={2}
                  className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                >
                  <div className="flex items-center justify-center gap-1">
                    <LocalDrink fontSize="small" /> Morning
                  </div>
                </th>
                <th
                  colSpan={2}
                  className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10"
                >
                  <div className="flex items-center justify-center gap-1">
                    <LocalDrink fontSize="small" /> Evening
                  </div>
                </th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-medium">
                  Qty (L)
                </th>
                <th className="py-2 px-4 text-center font-medium">Fat (%)</th>
                <th className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-medium">
                  Qty (L)
                </th>
                <th className="py-2 px-4 text-center font-medium">Fat (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fields.map((field: any, index) => {
                 // Filter Logic
                 const matchesSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase());
                 const matchesBreed = breedFilter === "All" || field.breed === breedFilter;
                 
                 if (!matchesSearch || !matchesBreed) return null;

                 return (
                  <tr
                    key={field.key}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                          {field.image ? (
                            <img
                              src={field.image}
                              alt={field.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Pets fontSize="small" className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-white text-base">
                            {field.name}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {field.breed}
                            </span>
                            {field.status && (
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                  field.status === "active"
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                                    : field.status === "pregnant"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                {field.status}
                              </span>
                            )}
                            {field.expectedMilk > 0 && (
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
                                title="Expected daily yield"
                              >
                                Exp: {field.expectedMilk}L
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Morning */}
                    <td className="py-2 px-4 border-l border-slate-200 dark:border-slate-800 bg-blue-50/20">
                      <FormNumber
                        name={`records.${index}.morningMilk`}
                        placeholder="0.0"
                        readOnly={isReadOnly}
                        min={0}
                        step={0.1}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                          className: "bg-transparent",
                        }}
                        inputProps={{
                          className: "text-center font-bold text-blue-600",
                        }}
                      />
                    </td>
                    <td className="py-2 px-4 bg-blue-50/20">
                      <FormNumber
                        name={`records.${index}.morningFat`}
                        placeholder={field.morningFat?.toString() || "0.0"}
                        readOnly={isReadOnly}
                        min={0}
                        step={0.1}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                          endAdornment: (
                            <span className="text-xs text-slate-400 ml-1">%</span>
                          ),
                        }}
                        inputProps={{ className: "text-center text-slate-500" }}
                      />
                    </td>

                    {/* Evening */}
                    <td className="py-2 px-4 border-l border-slate-200 dark:border-slate-800 bg-purple-50/20">
                      <FormNumber
                        name={`records.${index}.eveningMilk`}
                        placeholder="0.0"
                        readOnly={isReadOnly}
                        min={0}
                        step={0.1}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                          className: "bg-transparent",
                        }}
                        inputProps={{
                          className: "text-center font-bold text-purple-600",
                        }}
                      />
                    </td>
                    <td className="py-2 px-4 bg-purple-50/20">
                      <FormNumber
                        name={`records.${index}.eveningFat`}
                        placeholder={field.eveningFat?.toString() || "0.0"}
                        readOnly={isReadOnly}
                        min={0}
                        step={0.1}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                          endAdornment: (
                            <span className="text-xs text-slate-400 ml-1">%</span>
                          ),
                        }}
                        inputProps={{ className: "text-center text-slate-500" }}
                      />
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

// --- Form Inner Content for Stats & Submit ---
const MilkFormInner = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { watch, isSubmitting, handleSubmit, onSubmit } = useFormContext();

  // Calculations
  const records = watch("records") || [];
  const totalMorning = records.reduce(
    (sum: number, r: any) => sum + (Number(r.morningMilk) || 0),
    0
  );
  const totalEvening = records.reduce(
    (sum: number, r: any) => sum + (Number(r.eveningMilk) || 0),
    0
  );
  const total = totalMorning + totalEvening;

  return (
    <>
      <div className="sticky top-20 z-50 w-full">
        <LinearProgress variant="determinate" value={0} sx={{ height: 6 }} />
      </div>
      <div className="w-full flex-grow px-4 md:px-8 py-6">
        <MilkTable isReadOnly={isReadOnly} />
      </div>
      <StickyFooter
        summary={
          <SummaryData
            stats={[
              {
                label: "Morning",
                value: totalMorning.toFixed(1),
                unit: "L",
                valueColor: "text-blue-600",
              },
              {
                label: "Evening",
                value: totalEvening.toFixed(1),
                unit: "L",
                valueColor: "text-purple-600",
              },
              {
                label: "Total",
                value: total.toFixed(1),
                unit: "L",
                valueColor: "text-slate-800 dark:text-white",
              },
            ]}
          />
        }
        submitButton={{
          text: "Save Records", // Handled by Form's submit with onClick
          onClick: handleSubmit((data) => {
             console.log("Submit Clicked", data);
             onSubmit(data);
          }),
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

const MilkForm = ({ dateParam }: { dateParam: string }) => {
  const { showSnackbar } = useSnackbar();

  const formProps = {
    fetchUrl: `/milk/daily?date=${dateParam}`,
    postFetch: milkPostFetch,
    endpoint: "/milk/bulk",
    method: "POST" as "POST",
    beforeSubmit: (data: any) => {
        console.log("Before Submit Data:", data);
        return milkBeforeSubmit(data, dateParam);
    },
    onSuccess: () => {
      showSnackbar("Milk records saved successfully!", "success");
    },
    onError: (err: any) => {
      showSnackbar(err.message || "Failed to save records", "error");
    },
    defaultValues: {
      records: [],
    },
    // Pass class to form element via Form component (requires Form.tsx fix)
    className: "flex flex-col flex-grow h-full"
  };

  return (
    <div className="flex flex-col flex-grow h-full"> 
        <Form {...formProps}>
            <MilkFormInner />
        </Form>
    </div>
  );
};

export default MilkForm;
