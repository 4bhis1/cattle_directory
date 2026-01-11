"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Button, TextField, Drawer, IconButton } from "@mui/material";
import { TopHeader } from "@/app/components/ui/Header";
import { Add, Close } from "@mui/icons-material";
import { useState } from "react";

import SalesForm from "./Form/SalesForm";
import CustomerForm from "./Form/CustomerForm";

export default function SalesFormLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
          <div className="flex gap-4 items-center">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsDrawerOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all"
              sx={{ textTransform: "none", borderRadius: "12px" }}
            >
              Add Customer
            </Button>
            <TextField
              type="date"
              label="Date"
              size="small"
              value={dateParam}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newDate = e.target.value;
                router.push(`?date=${newDate}`);
              }}
              className="bg-white dark:bg-slate-900 rounded-lg"
            />
          </div>
        }
      />
      <div className="w-full flex-grow flex flex-col h-full">
        {/* Pass refreshKey to force re-fetch when customer added */}
        <SalesForm dateParam={dateParam} key={`${dateParam}-${refreshKey}`} />
      </div>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
            className: "w-full sm:w-[500px] bg-slate-50 dark:bg-slate-950 p-0"
        }}
      >
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add New Customer</h2>
                <IconButton onClick={() => setIsDrawerOpen(false)}>
                    <Close />
                </IconButton>
            </div>
            <div className="p-6 flex-grow overflow-y-auto">
                <CustomerForm 
                    onSuccess={() => {
                        setIsDrawerOpen(false);
                        setRefreshKey(prev => prev + 1); // Trigger re-fetch iin SalesForm
                    }}
                    onClose={() => setIsDrawerOpen(false)}
                />
            </div>
        </div>
      </Drawer>
    </div>
  );
}
