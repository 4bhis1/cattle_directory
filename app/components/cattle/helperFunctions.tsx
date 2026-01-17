export const cattleBeforeSubmit = (data: any) => {
  const payload = { ...data };

  // Handle Status Logic
  const statusHistory = payload.statusHistory ? [...payload.statusHistory] : [];
  const lastStatus =
    statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] : null;

  const newStatusEntry = {
    status: payload.status,
    measuredAt: new Date(),
    reason: payload.statusReason,
    semen: payload.semen,
  };

  if (lastStatus && lastStatus.status === payload.status) {
    // Update last entry if status hasn't changed (allow updating reason/semen)
    statusHistory[statusHistory.length - 1] = {
      ...lastStatus,
      reason: payload.statusReason,
      semen: payload.semen,
    };
  } else {
    // Add new entry if status changed
    statusHistory.push(newStatusEntry);
  }

  payload.status = {
    current: payload.status,
    history: statusHistory,
  };

  // Handle Weight Logic
  const weightHistory = payload.weightHistory ? [...payload.weightHistory] : [];
  const currentWeight = Number(payload.currentWeight) || 0;
  const lastWeight =
    weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;

  if (
    currentWeight > 0 &&
    (!lastWeight || lastWeight.weight !== currentWeight)
  ) {
    weightHistory.push({
      weight: currentWeight,
      measuredAt: new Date(),
    });
  }

  payload.weight = {
    current: currentWeight,
    history: weightHistory,
  };

  // Clean up helper fields
  delete payload.statusHistory;
  delete payload.statusReason;
  delete payload.semen;
  delete payload.currentWeight;
  delete payload.weightHistory;

  // Clean empty ObjectIds
  if (!payload.motherId) delete payload.motherId;
  // Handle sellerId if it's an object (from AutoComplete) or string
  if (payload.sellerId && typeof payload.sellerId === "object") {
    payload.sellerId = payload.sellerId._id;
  }
  if (!payload.sellerId) delete payload.sellerId;
  // Ensure dateOfAcquisition is present (fallback to now if missing, though validation should catch it)
  if (!payload.dateOfAcquisition) {
    payload.dateOfAcquisition = new Date().toISOString();
  }
  return payload;
};

const cattleCalculateAge = (dob: string) => {
  if (!dob) return "";
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
};

export const cattlePostFetch = (data: any) => {
  console.log(">>> postfetchData at cattle form", data);
  const c = data._doc || data;
  return {
    name: c.name,
    breed: c.breed,
    cattleType: c.category,
    dateOfAcquisition: c.dateOfAcquisition?.split("T")[0] || "",
    purchasePrice: c.purchasePrice?.toString() || "",
    age: cattleCalculateAge(c.dateOfBirth),
    dateOfBirth: c.dateOfBirth?.split("T")[0] || "",
    estimatedMilkProductionDaily: "0",
    expectedMilkProduction: c.expectedMilkProduction?.toString() || "",
    fatPercentage: c.fatPercentage?.toString() || "",
    numberOfBirths: c.numberOfBirths?.toString() || "",
    motherId: c.motherId || "",
    gallery: c.images
      ? c.images.map((img: any) =>
          typeof img === "string" ? { url: img, _id: img } : img
        )
      : [],
    status: c.status?.current,
    statusHistory: c.status?.history || [],
    currentWeight: c.weight?.current?.toString() || "",
    weightHistory: c.weight?.history || [],
    vaccinations: c.healthRecords?.vaccinations || [],
    sellerId: c.sellerId || "",
    acquisitionType: c.acquisitionType || "purchased",
    insurance: c.insurance || { company: "", value: "", attachments: [] },
  };
};
