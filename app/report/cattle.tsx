'use client'
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import { Pets, Store, CalendarMonth, AttachMoney, Phone, LocationOn, LocalDrink } from '@mui/icons-material';

const sampleCattleData = [
  {
    id: 'C001',
    name: 'Bessie',
    breed: 'Jersey',
    cattleType: 'cow',
    dateOfJoining: '2023-02-15',
    purchaseAmount: 70000,
    sellerContactNumber: '9876543210',
    sellerAddress: 'Village Farm, Karnataka',
    age: 4,
    photo: 'https://via.placeholder.com/180',
    estimatedMilkProductionDaily: 12,
  },
  {
    id: 'C002',
    name: 'Molly',
    breed: 'Holstein',
    cattleType: 'buffalo',
    dateOfJoining: '2022-05-10',
    purchaseAmount: 80000,
    sellerContactNumber: '9876501234',
    sellerAddress: 'Green Pastures Farm',
    age: 5,
    photo: 'https://via.placeholder.com/180',
    estimatedMilkProductionDaily: 15,
  },
];

export default function CattleReportPage() {
  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Box className="max-w-5xl mx-auto">
        <Typography variant="h3" className="font-bold text-gray-900 mb-8 text-center">
          Cattle Report
        </Typography>

        {sampleCattleData.map((cattle) => (
          <Paper
            key={cattle.id}
            elevation={3}
            className="p-8 mb-8 bg-white rounded-2xl"
          >
            <Box className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <Avatar
                alt={cattle.name}
                src={cattle.photo}
                sx={{
                  width: 180,
                  height: 180,
                  border: '4px solid #e5e7eb',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                }}
              />
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold mb-2">
                  {cattle.name} {cattle.cattleType === 'cow' ? '🐄' : '🐃'}
                </Typography>
                <Divider className="mb-4" />
                <Typography variant="body1" className="mb-1">
                  <Pets fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Breed: {cattle.breed}
                </Typography>
                <Typography variant="body1" className="mb-1">
                  <CalendarMonth fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Date of Joining: {cattle.dateOfJoining}
                </Typography>
                <Typography variant="body1" className="mb-1">
                  Age: {cattle.age} years
                </Typography>
                <Typography variant="body1" className="mb-1">
                  <AttachMoney fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Purchase Amount: ₹{cattle.purchaseAmount.toLocaleString()}
                </Typography>
                <Typography variant="body1" className="mb-1">
                  <Phone fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Seller Contact: {cattle.sellerContactNumber}
                </Typography>
                <Typography variant="body1" className="mb-1">
                  <LocationOn fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Seller Address: {cattle.sellerAddress}
                </Typography>
                <Typography variant="body1" className="mt-3 flex items-center gap-1">
                  <LocalDrink fontSize="small" sx={{ verticalAlign: 'middle' }} />
                  Estimated Milk Production: {cattle.estimatedMilkProductionDaily} liters/day
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
