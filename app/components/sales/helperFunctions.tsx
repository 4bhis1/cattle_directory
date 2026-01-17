export const salesPostFetch = (data: any) => {
  // Check if data has records directly or nested
  const rawRecords = Array.isArray(data) 
    ? data 
    : (data?.records || (data?.data && Array.isArray(data.data) ? data.data : []));
    
  // Extract stats if available
  const stats = data?.stats || { produced: 0, waste: 0 };

  const records = rawRecords.map((item: any) => ({
      ...item,
      morningQty: item.morningQty || 0,
      morningFat: item.morningFat || 4.5,
      morningRate: item.morningRate || 45,
      eveningQty: item.eveningQty || 0,
      eveningFat: item.eveningFat || 4.5,
      eveningRate: item.eveningRate || 45,
  }));

  return {
    records,
    stats
  };
};

export const salesBeforeSubmit = (formData: any, date: string) => {
  const records = formData.records || [];
  const payload: any[] = [];

  records.forEach((record: any) => {
    // Process Morning
    if (Number(record.morningQty) > 0 || record.morningId) {
      payload.push({
        customerId: record.customerId,
        clientName: record.name,
        date: date,
        session: 'morning',
        quantityInLiters: Number(record.morningQty) || 0,
        pricePerLiter: Number(record.morningRate),
        fat: Number(record.morningFat),
        totalAmount: (Number(record.morningQty) || 0) * Number(record.morningRate),
        notes: `Session: Morning, Fat: ${record.morningFat}%`
      });
    }

    // Process Evening
    if (Number(record.eveningQty) > 0 || record.eveningId) {
      payload.push({
        customerId: record.customerId,
        clientName: record.name,
        date: date,
        session: 'evening',
        quantityInLiters: Number(record.eveningQty) || 0,
        pricePerLiter: Number(record.eveningRate),
        fat: Number(record.eveningFat),
        totalAmount: (Number(record.eveningQty) || 0) * Number(record.eveningRate),
        notes: `Session: Evening, Fat: ${record.eveningFat}%`
      });
    }
  });

  return payload;
};
