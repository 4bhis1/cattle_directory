"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Fade,
  Avatar,
  IconButton,
  LinearProgress,
  Breadcrumbs,
  Link,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import {
  Pets,
  ArrowBack,
  NavigateNext,
  Add,
  LocalDrink,
  Restaurant,
  Medication,
  ChildCare,
  Edit,
  DeleteOutline,
  FrontLoader,
  ExpandMore,
  Folder,
  Download,
} from "@mui/icons-material";
import { TopHeader } from "@/app/components/ui/Header";
import Loader from "@/app/components/ui/Loader";
import { fetchFromBackend } from "@/lib/backend";
import {
  useCattleFilter,
  CattleData,
} from "@/app/components/cattle/hooks/useCattleFilter";
import { TableToolbar } from "@/app/components/Table/TableToolbar";
import { TablePagination } from "@/app/components/Table/TablePagination";
import CattleFilterContent from "@/app/components/cattle/components/CattleFilterContent";
import { ActionableIcon } from "@/app/components/ui/ActionableIcon";
import { useUser } from "@/app/context/CommonProvider";

const calculateAge = (dobString?: string) => {
  if (!dobString) return "N/A";
  const dob = new Date(dobString);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970) + " yrs";
};

const CattleCard = ({
  cow,
  depth = 0,
  router,
}: {
  cow: CattleData;
  depth?: number;
  router: any;
}) => {
  const currentStatus =
    typeof cow.status === "object" ? (cow.status as any).current : cow.status;
  const hasChildren = cow.children && cow.children.length > 0;

  return (
    <React.Fragment key={cow._id}>
      <div
        className={`mb-4 group relative overflow-hidden transition-all cursor-pointer duration-300 hover:translate-y-[-2px] hover:shadow-lg
                    ${depth > 0 ? "ml-8 border-l-4 border-l-blue-200 bg-slate-50 dark:bg-slate-800/50" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"}`}
        onClick={() => router.push(`/cattle/${cow._id}`)}
      >
        <div className="p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 flex-1">
            {depth > 0 && <ChildCare className="text-slate-400" />}

            <div
              className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner
                                ${depth > 0 ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400"}`}
            >
              {cow.images && cow.images.length > 0 ? (
                <Avatar
                  src={cow.images[cow.images.length - 1]}
                  sx={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Pets fontSize="inherit" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                  {cow.name}
                </h3>
                {cow.lastMilk !== undefined && cow.lastMilk > 0 && (
                  <div
                    className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors group/stat"
                    onClick={() => router.push(`/milk?cattleId=${cow._id}`)}
                  >
                    <LocalDrink
                      sx={{ fontSize: 16 }}
                      className="text-blue-500 group-hover/stat:scale-110 transition-transform"
                    />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      {cow.lastMilk}L
                    </span>
                  </div>
                )}
                {cow.lastFeed !== undefined && cow.lastFeed > 0 && (
                  <div
                    className="flex items-center gap-2 cursor-pointer bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors group/stat"
                    onClick={() => router.push(`/feed/add?cattleId=${cow._id}`)}
                  >
                    <Restaurant
                      sx={{ fontSize: 16 }}
                      className="text-emerald-500 group-hover/stat:scale-110 transition-transform"
                    />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      {cow.lastFeed}kg
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  ID: {cow.cattleId}
                </span>
                <span>•</span>
                <span>{cow.breed}</span>
                <span>•</span>
                <span>{calculateAge(cow.dateOfBirth)}</span>
                {hasChildren && (
                  <Chip
                    label={`${cow.children?.length} children`}
                    size="small"
                    variant="outlined"
                    className="ml-2 h-5 text-[10px]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0 mt-2 md:mt-0">
            <ActionableIcon
              Icon={LocalDrink}
              onClick={() => router.push(`/milk?cattleId=${cow._id}`)}
              tooltipText="Record Milk"
            />
            <ActionableIcon
              Icon={Restaurant}
              onClick={() => router.push(`/feed/add?cattleId=${cow._id}`)}
              tooltipText="Record Feed"
            />
            <ActionableIcon
              Icon={Edit}
              onClick={() => router.push(`/cattle/${cow._id}`)}
              tooltipText="Edit Details"
            />
          </div>
        </div>
      </div>
      {cow.children &&
        cow.children.map((child: CattleData) =>
          CattleCard({ cow: child, depth: depth + 1, router }),
        )}
    </React.Fragment>
  );
};

const useFetchCattle = () => {
  const [cattleList, setCattleList] = useState<CattleData[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchCattle = async () => {
    try {
      setLoading(true);
      const data = await fetchFromBackend("/cattle");
      console.log(data);
      if (data.status === "success") {
        const allCattle: CattleData[] = Array.isArray(data.data)
          ? data.data
          : data.data?.data || [];
        setCattleList(allCattle);
      } else {
        console.error(
          "Failed to fetch cattle:",
          data.message || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Error fetching cattle:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCattle();
  }, []);
  return { cattleList, loading };
};

const NoCattle = ({ isAdmin, router }: { isAdmin: boolean; router: any }) => {
  return (
    <div className="flex flex-col  items-center justify-center p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <Pets
          sx={{ fontSize: 40 }}
          className="text-slate-300 dark:text-slate-600"
        />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        No Cattle Records Found
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
        Your farm inventory is empty. Get started by adding your first cattle to
        the system.
      </p>
      {isAdmin && (
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => router.push("/cattle/add")}
          sx={{ textTransform: "none", borderRadius: "10px" }}
        >
          Add First Cattle
        </Button>
      )}
    </div>
  );
};

export default function CattleDashboard() {
  const router = useRouter();
  let { cattleList, loading } = useFetchCattle();
  const { isAdmin } = useUser();

  const { table, availableBreeds, hierarchyList, isHierarchy, setIsHierarchy } =
    useCattleFilter(cattleList);

  const {
    data: paginatedList,
    groupedData: groupedList,
    totalItems,
    totalPages,
    page,
    setPage,
    limit,
    setLimit,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    groupBy,
    setGroupBy,
  } = table;

  const handleExport = () => {
    // Export logic using all filtered data (sortedData)
    const dataToExport = (table.sortedData || paginatedList).map((c) => ({
      ID: c.cattleId,
      Name: c.name,
      Breed: c.breed,
      Status:
        typeof c.status === "object" ? (c.status as any).current : c.status,
      DOB: c.dateOfBirth,
      "Est. Milk": c.expectedMilkProduction || 0,
      JoinDate: c.dateOfAcquisition,
      MotherID: c.motherId || "N/A",
    }));

    if (dataToExport.length === 0) return;

    const headers = Object.keys(dataToExport[0]).join(",");
    const rows = dataToExport.map((row) =>
      Object.values(row)
        .map((v) => `"${v}"`)
        .join(","),
    ); // Quote values
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `cattle_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionButton = isAdmin && (
    <Button
      variant="contained"
      startIcon={<Add />}
      onClick={() => router.push("/cattle/add")}
      sx={{
        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        borderRadius: "12px",
        textTransform: "none",
        fontWeight: "bold",
        boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.5)",
        padding: "8px 24px",
      }}
    >
      Add Cattle
    </Button>
  );

  const renderContent = () => {
    // 1. Grouped View
    if (groupBy !== "none" && groupedList) {
      return Object.entries(groupedList).map(([groupName, cows]) => (
        <Accordion
          key={groupName}
          defaultExpanded
          elevation={0}
          className="mb-4 border border-slate-200 dark:border-slate-800 before:hidden bg-transparent"
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Folder className="text-blue-500" />
              <Typography className="font-bold text-slate-700 dark:text-slate-200">
                {groupName}
                <span className="ml-2 text-slate-400 text-sm font-normal">
                  ({cows.length})
                </span>
              </Typography>
            </div>
          </AccordionSummary>
          <AccordionDetails className="pt-4 px-0">
            {cows.map((cow) => (
              <CattleCard key={cow._id} cow={cow} router={router} />
            ))}
          </AccordionDetails>
        </Accordion>
      ));
    }

    // 2. Hierarchy View
    if (isHierarchy) {
      return hierarchyList && hierarchyList.length > 0 ? (
        hierarchyList.map((cow) => (
          <CattleCard key={cow._id} cow={cow} depth={0} router={router} />
        ))
      ) : (
        <div className="text-center py-12 text-slate-500">
          No cattle found in hierarchy view.
        </div>
      );
    }

    // 3. Flat List View
    return paginatedList.length > 0 ? (
      paginatedList.map((cow) => (
        <CattleCard key={cow._id} cow={cow} depth={0} router={router} />
      ))
    ) : (
      <div className="text-center py-12 text-slate-500">
        No cattle found matching your filters.
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <TopHeader
        actionButton={actionButton}
        title="Cattle Management"
        breadcrumbs={[
          { label: "Dashboard", href: "/home" },
          { label: "Cattle", href: "#" },
        ]}
      />
      <div className="mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <Loader text="Loading your cattles..." />
        ) : cattleList.length === 0 ? (
          <NoCattle isAdmin={isAdmin} router={router} />
        ) : (
          <>
            <TableToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearFilters={clearFilters}
              groupBy={groupBy}
              onGroupByChange={setGroupBy}
              groupByOptions={[
                { label: "Breed", value: "breed" },
                { label: "Status", value: "status" },
                { label: "Joining Year", value: "joining_date" },
                { label: "Vaccination Date", value: "vaccination_date" },
              ]}
              isHierarchy={isHierarchy}
              onToggleHierarchy={setIsHierarchy}
              actions={
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExport}
                  size="medium"
                  sx={{
                    borderColor: "rgba(0,0,0,0.12)",
                    textTransform: "none",
                    px: 2,
                  }}
                >
                  Export
                </Button>
              }
            >
              <CattleFilterContent
                filters={filters}
                setFilter={setFilter}
                availableBreeds={availableBreeds}
              />
            </TableToolbar>

            <div className="space-y-4">{renderContent()}</div>

            {!isHierarchy && groupBy === "none" && (
              <TablePagination
                page={page}
                count={totalPages}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                totalItems={totalItems}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
