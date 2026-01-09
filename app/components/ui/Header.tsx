import { NavigateNext } from "@mui/icons-material";
import { Breadcrumbs, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const TopHeader = ({actionButton, routes}: {actionButton: React.ReactNode, routes: React.ReactNode}) => {
    const router = useRouter();
    return <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                <div className="md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4"> 
                           {routes}
                        </div>
                        {actionButton}
                    </div>
                </div>
            </div>
}