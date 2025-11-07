'use client'
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';

const sampleMilkProductionData = [
  {
    cattleId: 'C001',
    name: 'Bessie',
    productionRecords: [
      { date: '2025-11-01', morningMilk: 6, eveningMilk: 5 },
      { date: '2025-11-02', morningMilk: 6.5, eveningMilk: 5.2 },
      { date: '2025-11-03', morningMilk: 6.1, eveningMilk: 5.3 },
    ],
  },
  {
    cattleId: 'C002',
    name: 'Molly',
    productionRecords: [
      { date: '2025-11-01', morningMilk: 8, eveningMilk: 7 },
      { date: '2025-11-02', morningMilk: 7.8, eveningMilk: 7.4 },
      { date: '2025-11-03', morningMilk: 8.1, eveningMilk: 7.3 },
    ],
  },
];

export default function MilkProductionReportPage() {
  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Box className="max-w-5xl mx-auto">
        <Typography variant="h3" className="font-bold text-gray-900 mb-8 text-center">
          Milk Production Report
        </Typography>

        {sampleMilkProductionData.map((cattle) => {
          const totalMilk = cattle.productionRecords.reduce(
            (sum, record) => sum + record.morningMilk + record.eveningMilk,
            0
          );
          const averageMilk =
            totalMilk / (cattle.productionRecords.length * 2);

          return (
            <Paper
              key={cattle.cattleId}
              elevation={3}
              className="p-6 mb-8 bg-white rounded-2xl"
            >
              <Typography variant="h4" className="font-bold mb-4">
                {cattle.name}
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Morning Milk (liters)</TableCell>
                    <TableCell>Evening Milk (liters)</TableCell>
                    <TableCell>Total (liters)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cattle.productionRecords.map((record) => (
                    <TableRow key={record.date}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.morningMilk}</TableCell>
                      <TableCell>{record.eveningMilk}</TableCell>
                      <TableCell>
                        {(record.morningMilk + record.eveningMilk).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                      Average per session
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {averageMilk.toFixed(2)} liters
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                      Total Milk Produced
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {totalMilk.toFixed(2)} liters
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
