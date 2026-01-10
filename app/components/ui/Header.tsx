import { NavigateNext } from "@mui/icons-material";
import { Breadcrumbs } from "@mui/material";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  actionButton?: React.ReactNode;
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

export const TopHeader = ({ actionButton, title, breadcrumbs }: HeaderProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div className="md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <div>
              <Breadcrumbs
                separator={<NavigateNext fontSize="small" />}
              >
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  
                  return isLast ? (
                    <span
                      key={index}
                      className="text-slate-800 font-medium dark:text-slate-200"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      key={index}
                      href={item.href || "#"}
                      className="cursor-pointer no-underline text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </Breadcrumbs>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {title}
            </h1>
          </div>
          {actionButton ? actionButton : null}
        </div>
      </div>
    </div>
  );
};
