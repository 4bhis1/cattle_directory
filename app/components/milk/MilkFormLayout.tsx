"use client";

import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { TopHeader } from "@/app/components/ui/Header";

import MilkForm from "./Form/MilkForm";

export default function MilkFormLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const dateParam =
  searchParams.get("date") || new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative">
      <TopHeader
        title={"Milk Record"}
        breadcrumbs={[
          { label: "Dashboard", href: "/home" },
          { label: "Milk Record", href: "#" },
        ]}
        actionButton={
          <DatePicker
            label="Date"
            value={dayjs(dateParam)}
            onChange={(newValue) => {
              if (newValue) {
                router.push(`?date=${newValue.format('YYYY-MM-DD')}`);
              }
            }}
            slotProps={{
              textField: {
                size: "small",
              }
            }}
          />
        }
      />
      <MilkForm dateParam={dateParam} />
    </div>
  );
}
