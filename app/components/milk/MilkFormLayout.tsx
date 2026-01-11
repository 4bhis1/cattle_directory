"use client";

import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { TextField } from "@mui/material";
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
          <TextField
            type="date"
            label="Date"
            size="small"
            value={dateParam}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newDate = e.target.value;
              router.push(`?date=${newDate}`);
            }}
          />
        }
      />
      <div className="w-full flex-grow">
        <MilkForm dateParam={dateParam} />
      </div>
    </div>
  );
}
