interface MilkEntry {
  cattleId: string;
  name: string;
  breed: string;
  image?: string;
  status: string;
  expectedMilk: number;
  morningMilk: number;
  morningFat: number;
  eveningMilk: number;
  eveningFat: number;
  morningId?: string;
  eveningId?: string;
}

export const milkPostFetch = (data: any) => {
  // Data is the array of merged records
  return { records: data };
};

export const milkBeforeSubmit = (data: any, dateParam: string) => {
  const milkPayload: any[] = [];
  const records = data.records || [];

  records.forEach((record: MilkEntry) => {
    // Morning Record
    if (Number(record.morningMilk) > 0 || record.morningId) {
      milkPayload.push({
        cattleId: record.cattleId,
        milkingSession: "morning",
        date: dateParam,
        quantity: Number(record.morningMilk) || 0,
        quality: {
          fat: Number(record.morningFat) || 0,
          snf: 0,
          temperature: 0,
        },
        soldTo: "dairy",
        pricePerLiter: 20,
        totalAmount: 0,
        paymentStatus: "pending",
        notes: "",
      });
    }

    // Evening Record
    if (Number(record.eveningMilk) > 0 || record.eveningId) {
      milkPayload.push({
        cattleId: record.cattleId,
        milkingSession: "evening",
        date: dateParam,
        quantity: Number(record.eveningMilk) || 0,
        quality: {
          fat: Number(record.eveningFat) || 0,
          snf: 0,
          temperature: 0,
        },
        soldTo: "dairy",
        pricePerLiter: 20,
        totalAmount: 0,
        paymentStatus: "pending",
        notes: "",
      });
    }
  });

  // Backend expects array directly
  return milkPayload;
};
