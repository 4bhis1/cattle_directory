export const salesPostFetch = (data: any) => {
  const records = Array.isArray(data) 
    ? data 
    : (data?.data && Array.isArray(data.data) ? data.data : []);

  if (records.length === 0) return { records: [] };
  
  // The API already returns the structure we need for the table
  // but let's ensure all fields are present to avoid undefined issues
  return {
    records: records.map((item: any) => ({
      ...item,
      morningQty: item.morningQty || 0,
      morningFat: item.morningFat || 4.5,
      morningRate: item.morningRate || 45,
      eveningQty: item.eveningQty || 0,
      eveningFat: item.eveningFat || 4.5,
      eveningRate: item.eveningRate || 45,
    }))
  };
};

export const salesBeforeSubmit = (formData: any, date: string) => {
  const records = formData.records || [];
  const payload: any[] = [];

  records.forEach((record: any) => {
    // Process Morning
    if (Number(record.morningQty) > 0) {
      payload.push({
        customerId: record.customerId,
        // clientName: record.name, // Schema has clientName required? Let's check model. Yes.
        clientName: record.name,
        date: date,
        quantityInLiters: Number(record.morningQty),
        pricePerLiter: Number(record.morningRate),
        fat: Number(record.morningFat),
        totalAmount: Number(record.morningQty) * Number(record.morningRate),
        notes: `Session: Morning, Fat: ${record.morningFat}%`
      });
    } else {
        // If qty is 0, we might want to send a delete or update to 0?
        // The bulkUpsert controller logic uses upsert=true.
        // If we want to "clear" a record, we should probably send 0.
        // But usually we just filter active ones. Use 0 to clear.
        payload.push({
            customerId: record.customerId,
            clientName: record.name,
            date: date,
            quantityInLiters: 0,
            pricePerLiter: Number(record.morningRate),
            fat: Number(record.morningFat),
            totalAmount: 0,
            notes: `Session: Morning`
        });
    }

    // Process Evening
    if (Number(record.eveningQty) > 0) {
      payload.push({
        customerId: record.customerId,
        clientName: record.name,
        date: date,
        quantityInLiters: Number(record.eveningQty),
        pricePerLiter: Number(record.eveningRate),
        fat: Number(record.eveningFat),
        totalAmount: Number(record.eveningQty) * Number(record.eveningRate),
        notes: `Session: Evening, Fat: ${record.eveningFat}%`
      });
    } else {
        payload.push({
            customerId: record.customerId,
            clientName: record.name,
            date: date,
            quantityInLiters: 0,
            pricePerLiter: Number(record.eveningRate),
            fat: Number(record.eveningFat),
            totalAmount: 0,
            notes: `Session: Evening`
        });
    }
  });

  return payload;
};
