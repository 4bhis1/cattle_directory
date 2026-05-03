"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Alert, AlertTitle } from "@mui/material";
import CattleLifecycleDashboard from "@/app/components/cattle/Lifecycle/CattleLifecycleDashboard";
import Loader from "@/app/components/ui/Loader";
import { fetchFromBackend } from "@/lib/backend";

const useFetchCattle = (cattleId: string | null) => {
  const [cattle, setCattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCattle = async () => {
    if (!cattleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchFromBackend(`/cattle/${cattleId}`);
      console.log(data);
      if (data.status === "success") {
        setCattle(data.data);
      } else {
        setError(data.message || "Failed to fetch cattle data");
        console.error("Failed to fetch cattle:", data.message || "Unknown error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching cattle";
      setError(errorMessage);
      console.error("Error fetching cattle:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCattle();
  }, [cattleId]);

  return { cattle, loading, error };
};

function LifecycleContent() {
  const searchParams = useSearchParams();
  const cattleId = searchParams.get("id");

  const { cattle, loading, error } = useFetchCattle(cattleId);

  if (!cattleId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <AlertTitle>No Cattle Selected</AlertTitle>
          Please select a cattle from the cattle list to view its lifecycle.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return <Loader text="Loading cattle lifecycle data..." />;
  }

  if (error || !cattle) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Cattle Data</AlertTitle>
          {error || "Failed to load cattle information"}
        </Alert>
      </Box>
    );
  }

  // Debug: Log the full cattle data
  console.log("=== CATTLE DATA DEBUG ===");
  console.log("Full cattle object:", cattle);
  console.log("Status history:", cattle.status?.history);
  console.log("Number of births:", cattle.numberOfBirths);
  console.log("Current status:", cattle.status?.current);

  // Extract last calving date from status history
  // Logic: Find when cattle transitioned FROM pregnant to active (birth happened)
  // OR use the most recent "active" status after a "pregnant" status
  let lastCalvingDate = null;
  
  if (cattle.status?.history && cattle.status.history.length > 0) {
    const sortedHistory = [...cattle.status.history].sort(
      (a: any, b: any) =>
        new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
    );

    console.log("Sorted status history (newest first):", sortedHistory);

    // Find the most recent transition from pregnant to active
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = sortedHistory[i];
      const previous = sortedHistory[i + 1];
      
      // If previous was pregnant and current is active, that's when birth happened
      if (previous.status === "pregnant" && current.status === "active") {
        lastCalvingDate = current.measuredAt;
        console.log("Found calving date (pregnant->active transition):", lastCalvingDate);
        break;
      }
    }

    // Fallback: If numberOfBirths > 0 but no transition found, 
    // use the most recent "active" status date
    if (!lastCalvingDate && cattle.numberOfBirths > 0) {
      const lastActive = sortedHistory.find((h: any) => h.status === "active");
      if (lastActive) {
        lastCalvingDate = lastActive.measuredAt;
        console.log("Using fallback: most recent active status:", lastCalvingDate);
      }
    }
  }

  console.log("Final lastCalvingDate:", lastCalvingDate);

  const cattleData = {
    cattleType: cattle.cattleType,
    breed: cattle.breed,
    dateOfBirth: cattle.dateOfBirth,
    lastCalvingDate: lastCalvingDate || null,
    numberOfBirths: cattle.numberOfBirths || 0,
    status: cattle.status?.current,
  };

  console.log("Cattle data being passed to dashboard:", cattleData);
  console.log("=== END DEBUG ===");

  return <CattleLifecycleDashboard cattleData={cattleData} />;
}

export default function CattleLifecyclePage() {
  return (
    <Suspense fallback={<Loader text="Loading..." />}>
      <LifecycleContent />
    </Suspense>
  );
}
