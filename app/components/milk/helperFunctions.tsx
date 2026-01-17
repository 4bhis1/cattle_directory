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
  return { records: data };
};

export const milkBeforeSubmit = (data: any, dateParam: string) => {
  const milkPayload: any[] = [];
  const records = data.records || [];

  records.forEach((record: MilkEntry) => {
    if (Number(record.morningMilk) > 0 || record.morningId) {
      milkPayload.push({
        cattleId: record.cattleId,
        session: "morning",
        date: dateParam,
        quantity: Number(record.morningMilk) || 0,
        fat: Number(record.morningFat) || 0,
      });
    }

    if (Number(record.eveningMilk) > 0 || record.eveningId) {
      milkPayload.push({
        cattleId: record.cattleId,
        session: "evening",
        date: dateParam,
        quantity: Number(record.eveningMilk) || 0,
        fat: Number(record.eveningFat) || 0,
      });
    }
  });

  return milkPayload;
};
