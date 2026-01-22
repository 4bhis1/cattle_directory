"use client";

import React, { useState } from "react";
import { useFieldArray } from "react-hook-form";
import {
  LocalDrink,
  Person,
  Search,
  Settings,
  Save,
  CurrencyRupee,
} from "@mui/icons-material";
import {
  TextField,
  InputAdornment,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import Form, {
  useFormContext,
  FormNumber,
  FormButton,
} from "@/app/components/Form";
import StickyFooter, { SummaryData } from "@/app/components/ui/StickyFooter";
import Loader from "@/app/components/ui/Loader";
import { useSnackbar } from "@/app/context/SnackbarContext";
import { salesBeforeSubmit, salesPostFetch } from "../helperFunctions";
import { DEFAULT_ORGANISATION_ID } from "@/app/context/CommonProvider";
import ManageCustomersDrawer from "../ManageCustomersDrawer";

// --- Table Component ---
const SalesTable = ({
  loading,
  isReadOnly,
}: {
  loading?: boolean;
  isReadOnly?: boolean;
}) => {
  const { control, isLoading } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: "records",
    keyName: "key",
  });

  // Local state for filtering
  const [searchQuery, setSearchQuery] = useState("");

  if (loading || isLoading) {
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
              className: "bg-slate-50 dark:bg-slate-800 rounded-xl",
            }}
            className="w-full md:w-64"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500 font-medium hidden md:block">
            Showing{" "}
            {
              fields.filter((field: any) => {
                return field.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
              }).length
            }{" "}
            entries
          </div>
        </div>
        {/* Mobile count display */}
        <div className="md:hidden text-sm text-slate-500 font-medium w-full text-right">
          Showing{" "}
          {
            fields.filter((field: any) => {
              return field.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            }).length
          }{" "}
          entries
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
                  colSpan={3}
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
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {/* Morning */}
                <th className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-medium">
                  Qty (L)
                </th>
                <th className="py-2 px-4 text-center font-medium">Fat (%)</th>
                <th className="py-2 px-4 text-center font-medium">Rate</th>

                {/* Evening */}
                <th className="py-2 px-4 text-center border-l border-slate-200 dark:border-slate-800 font-medium">
                  Qty (L)
                </th>
                <th className="py-2 px-4 text-center font-medium">Fat (%)</th>
                <th className="py-2 px-4 text-center font-medium">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fields.map((field: any, index) => {
                if (
                  !field.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                  return null;

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
                          <span className="text-xs text-slate-500">
                            {field.phone}
                          </span>
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
                        InputProps={{
                          disableUnderline: true,
                          className: "bg-transparent",
                        }}
                        inputProps={{
                          className: "text-center font-bold text-blue-600",
                        }}
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
                        InputProps={{
                          disableUnderline: true,
                          endAdornment: (
                            <span className="text-xs text-slate-400">%</span>
                          ),
                        }}
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
                        InputProps={{
                          disableUnderline: true,
                          startAdornment: (
                            <span className="text-xs text-slate-400 mr-0.5">
                              ₹
                            </span>
                          ),
                        }}
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
                        InputProps={{
                          disableUnderline: true,
                          className: "bg-transparent",
                        }}
                        inputProps={{
                          className: "text-center font-bold text-purple-600",
                        }}
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
                        InputProps={{
                          disableUnderline: true,
                          endAdornment: (
                            <span className="text-xs text-slate-400">%</span>
                          ),
                        }}
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
                        InputProps={{
                          disableUnderline: true,
                          startAdornment: (
                            <span className="text-xs text-slate-400 mr-0.5">
                              ₹
                            </span>
                          ),
                        }}
                        inputProps={{ className: "text-center text-slate-500" }}
                        onFocus={(e: any) => e.target.select()}
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

// --- Form Inner ---
const SalesFormInner = ({
  isReadOnly,
  onRefresh,
}: {
  isReadOnly?: boolean;
  onRefresh?: () => void;
}) => {
  const { watch, isSubmitting, handleSubmit, onSubmit } = useFormContext();

  const records = watch("records") || [];
  const stats = watch("stats");

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
    totalAmount += mQty * mRate + eQty * eRate;
  });

  const totalQty = totalMorningQty + totalEveningQty;

  const produced = Number(stats?.produced || 0);
  const waste = Number(stats?.waste || 0);
  // User Rule: Red bar if Total Sales (totalQty) + Waste > Produced
  const isOverProduction = totalQty + waste > produced;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSaveClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    handleSubmit(onSubmit)();
  };

  return (
    <>
      <div className="sticky top-20 z-50 w-full">
        <LinearProgress variant="determinate" value={0} sx={{ height: 6 }} />
      </div>
      <div className="w-full flex-grow px-4 md:px-8 py-6 space-y-4">
        {/* Red Bar Validation */}
        {isOverProduction && (
          <Alert
            severity="error"
            variant="filled"
            className="rounded-xl shadow-md font-medium"
            action={
              <div className="text-sm font-bold bg-white/20 px-2 py-1 rounded">
                Diff: {(totalQty + waste - produced).toFixed(1)}L
              </div>
            }
          >
            Production Mismatch: Sales ({totalQty.toFixed(1)}L) + Waste (
            {waste.toFixed(1)}L) exceeds Produced ({produced.toFixed(1)}L)!
          </Alert>
        )}

        <SalesTable />
      </div>
      <StickyFooter
        summary={
          <SummaryData
            stats={[
              {
                label: "Produced",
                value: (stats?.produced || 0).toFixed(1),
                unit: "L",
                valueColor: "text-blue-600 dark:text-blue-400",
                containerStyle: "bg-yellow-500",
              },
              {
                label: "Waste",
                value: (stats?.waste || 0).toFixed(1),
                unit: "L",
                valueColor: "text-red-600 dark:text-red-400",
              },
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
                label: "Total Sold",
                value: totalQty.toFixed(1),
                unit: "L",
                valueColor: "text-slate-800 dark:text-white",
              },
            ]}
          />
        }
        parentStyle="px-4 md:px-10"
      >
        <SummaryData
          stats={[
            {
              label: "Produced",
              value: (stats?.produced || 0).toFixed(1),
              unit: "L",
              valueColor: "text-blue-600 dark:text-blue-400",
            },
            {
              label: "Waste",
              value: (stats?.waste || 0).toFixed(1),
              unit: "L",
              valueColor: "text-red-600 dark:text-red-400",
            },
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
              label: "Total Sold",
              value: totalQty.toFixed(1),
              unit: "L",
              valueColor: "text-slate-800 dark:text-white",
            },
          ]}
        />
        <div onClick={handleSaveClick}>
          <FormButton
            label="Save Sales"
            fullWidth={false}
            Icon={<CurrencyRupee />}
          />
        </div>
      </StickyFooter>

      {/* Confirmation Dialog */}
      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        PaperProps={{
          className:
            "bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800",
        }}
      >
        <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white pb-2">
          Confirm Sales
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-slate-600 dark:text-slate-300">
            Please verify the sales summary before saving.
          </DialogContentText>

          {isOverProduction && (
            <Alert severity="error" className="mt-4 mb-2 rounded-xl">
              <div className="font-bold">Over Production Warning</div>
              Total sales ({totalQty.toFixed(1)} L) + Waste ({waste.toFixed(1)}{" "}
              L) exceeds produced milk ({produced.toFixed(1)} L).
            </Alert>
          )}
          <div className="mt-6 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">
                Total Quantity
              </span>
              <span className="text-lg font-bold text-slate-800 dark:text-white">
                {totalQty.toFixed(1)} L
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-500">
                Total Sales Value
              </span>
              <span className="text-2xl font-black text-green-600">
                ₹{totalAmount.toFixed(0)}
              </span>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4 pt-0">
          <Button
            onClick={() => setIsConfirmOpen(false)}
            className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6"
            autoFocus
          >
            Confirm & Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const SalesForm = ({ dateParam }: { dateParam: string }) => {
  const { showSnackbar } = useSnackbar();
  const [refreshKey, setRefreshKey] = useState(0);

  const formProps = React.useMemo(
    () => ({
      fetchUrl: `/sales/daily?date=${dateParam}&key=${refreshKey}`,
      postFetch: salesPostFetch,
      endpoint: "/sales/bulk",
      method: "POST" as "POST",
      beforeSubmit: (data: any) => salesBeforeSubmit(data, dateParam),
      onSuccess: () => {
        showSnackbar("Sales records saved successfully!", "success");
        setRefreshKey((prev) => prev + 1); // Refresh data (and restore table)
      },
      onError: (err: any) => {
        showSnackbar(err.message || "Failed to save records", "error");
      },
      defaultValues: {
        records: [],
        organisation_id: DEFAULT_ORGANISATION_ID,
      },
      className: "flex flex-col flex-grow h-full",
    }),
    [dateParam, showSnackbar, refreshKey],
  );

  return (
    <div className="flex flex-col flex-grow h-full">
      <Form {...formProps}>
        <SalesFormInner onRefresh={() => setRefreshKey((prev) => prev + 1)} />
      </Form>
    </div>
  );
};

export default SalesForm;
