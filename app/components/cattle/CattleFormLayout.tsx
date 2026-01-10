"use client";

import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import { Breadcrumbs, Link } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { TopHeader } from "@/app/components/ui/Header";

import CattleForm from "./Form/CattleForm";

export default function CattleFormLayout() {
 
  const params = useParams();
  const searchParams = useSearchParams();

  const paramId = (params?.id || params?.cattleId) as string;
  const queryId = searchParams?.get("id");
  const rawId = paramId || queryId;

  const isEditMode = rawId && rawId !== "add";
  const cattleId = isEditMode ? rawId : undefined;



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative">
      <TopHeader 
        title={isEditMode ? "Edit Cattle" : "Add New Cattle"} 
        breadcrumbs={[
            { label: "Dashboard", href: "/home" },
            { label: "Cattle", href: "/cattle" },
            { label: isEditMode ? "Edit" : "Add", href: "#" }
        ]}
      />
      <div className="w-full flex-grow">
        <CattleForm id={cattleId} />
      </div>
    </div>
  );
}
