"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Button, TextField, Drawer, IconButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { TopHeader } from "@/app/components/ui/Header";
import { Add, Close, DeleteSweep, Settings, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useState } from "react";

import SalesForm from "./Form/SalesForm";
import ManageCustomersDrawer from "./ManageCustomersDrawer";
import CustomerForm from "./Form/CustomerForm";
import WasteForm from "./Form/WasteForm";

export default function SalesFormLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);
  const [isWasteDrawerOpen, setIsWasteDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const dateParam =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative">
      <TopHeader
        title={"Sales Record"}
        breadcrumbs={[
          { label: "Dashboard", href: "/home" },
          { label: "Sales Record", href: "#" },
        ]}
        actionButton={
          <div className="flex gap-2 items-center">
             <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweep />}
              onClick={() => setIsWasteDrawerOpen(true)}
              className="hidden md:flex border-red-500 text-red-500 hover:bg-red-50 font-bold py-2 px-4 rounded-xl transition-all"
              sx={{ textTransform: "none", borderRadius: "12px" }}
            >
              Record Waste
            </Button>
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => setIsManageDrawerOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all"
              sx={{ textTransform: "none", borderRadius: "12px" }}
            >
              Clients
            </Button>
            
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-800">
               <IconButton
                 onClick={() => {
                   const prevDate = dayjs(dateParam).subtract(1, 'day').format('YYYY-MM-DD');
                   router.push(`?date=${prevDate}`);
                 }}
                 size="small"
                 className="text-slate-500 hover:text-blue-600"
               >
                 <ChevronLeft fontSize="small" />
               </IconButton>
               <DatePicker
                 value={dayjs(dateParam)}
                 onChange={(newValue) => {
                   if (newValue) {
                     router.push(`?date=${newValue.format('YYYY-MM-DD')}`);
                   }
                 }}
                 slotProps={{
                   textField: {
                     size: "small",
                     variant: "standard",
                     className: "w-28 text-center",
                     InputProps: {
                        disableUnderline: true,
                        className: "text-sm font-bold text-slate-700 dark:text-slate-200"
                     }
                   }
                 }}
               />
               <IconButton
                 onClick={() => {
                   const nextDate = dayjs(dateParam).add(1, 'day').format('YYYY-MM-DD');
                   router.push(`?date=${nextDate}`);
                 }}
                 size="small"
                 className="text-slate-500 hover:text-blue-600"
               >
                 <ChevronRight fontSize="small" />
               </IconButton>
            </div>
          </div>
        }
      />
      <div className="w-full flex-grow flex flex-col h-full">
        {/* Pass refreshKey to force re-fetch when customer added */}
        <SalesForm dateParam={dateParam} key={`${dateParam}-${refreshKey}`} />
      </div>

      {/* Manage Customers Drawer (Left) */}
      <ManageCustomersDrawer 
        open={isManageDrawerOpen}
        onClose={() => setIsManageDrawerOpen(false)}
        onUpdate={() => setRefreshKey(prev => prev + 1)}
      />

      {/* Waste Drawer */}
      <Drawer
        anchor="right"
        open={isWasteDrawerOpen}
        onClose={() => setIsWasteDrawerOpen(false)}
        PaperProps={{
            className: "w-full sm:w-[500px] bg-slate-50 dark:bg-slate-950 p-0"
        }}
      >
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Record Daily Waste</h2>
                <IconButton onClick={() => setIsWasteDrawerOpen(false)}>
                    <Close />
                </IconButton>
            </div>
            <div className="p-6 flex-grow overflow-y-auto">
                <WasteForm 
                    date={dateParam}
                    onSuccess={() => {
                        setIsWasteDrawerOpen(false);
                        setRefreshKey(prev => prev + 1); // Trigger re-fetch iin SalesForm
                    }}
                    onClose={() => setIsWasteDrawerOpen(false)}
                />
            </div>
        </div>
      </Drawer>
    </div>
  );
}
