"use client";

import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import { Breadcrumbs, Link } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { TopHeader } from "@/app/components/ui/Header";

import CattleForm from "./Form/CattleForm";

export default function CattleFormLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const paramId = (params?.id || params?.cattleId) as string;
  const queryId = searchParams?.get("id");
  const rawId = paramId || queryId;

  const isEditMode = rawId && rawId !== "add";
  const cattleId = isEditMode ? rawId : undefined;

  const routes = (
    <div>
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        className="mb-4"
      >
        {pathname?.split("/").filter(Boolean).map((segment, index, array) => {
          const isLast = index === array.length - 1;
          const href = `/${array.slice(0, index + 1).join("/")}`;
          const title = segment.charAt(0).toUpperCase() + segment.slice(1);

          return isLast ? (
            <span
              key={href}
              className="text-slate-800 font-medium dark:text-slate-200"
            >
              {title}
            </span>
          ) : (
            <Link
              key={href}
              color="inherit"
              href={href}
              onClick={(e) => {
                e.preventDefault();
                router.push(href);
              }}
              className="cursor-pointer no-underline text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              {title}
            </Link>
          );
        })}
      </Breadcrumbs>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        {isEditMode ? "Edit Cattle" : "Add New Cattle"}
      </h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative">
      <TopHeader routes={routes} />
      <div className="w-full flex-grow">
        <CattleForm id={cattleId} />
      </div>
    </div>
  );
}
