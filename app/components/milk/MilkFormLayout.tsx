"use client";

import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { TextField, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { TopHeader } from "@/app/components/ui/Header";

import MilkForm from "./Form/MilkForm";

export default function MilkFormLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const dateParam =
  searchParams.get("date") || new Date().toISOString().split("T")[0];

  const handleDateChange = (newDate: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('date', newDate);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative">
      <TopHeader
        title={"Milk Record"}
        breadcrumbs={[
          { label: "Dashboard", href: "/home" },
          { label: "Milk Record", href: "#" },
        ]}
        actionButton={
          <div className="flex items-center gap-2">
            <IconButton 
              onClick={() => {
                const prev = dayjs(dateParam).subtract(1, 'day');
                handleDateChange(prev.format('YYYY-MM-DD'));
              }}
              className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
              size="small"
            >
              <ChevronLeft />
            </IconButton>
            
            <DatePicker
              label="Date"
              value={dayjs(dateParam)}
              onChange={(newValue) => {
                if (newValue) {
                  handleDateChange(newValue.format('YYYY-MM-DD'));
                }
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 160 }
                }
              }}
            />

            <IconButton 
              onClick={() => {
                 const next = dayjs(dateParam).add(1, 'day');
                 handleDateChange(next.format('YYYY-MM-DD'));
              }}
              className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
              size="small"
            >
              <ChevronRight />
            </IconButton>
          </div>
        }
      />
      <MilkForm dateParam={dateParam} />
    </div>
  );
}
