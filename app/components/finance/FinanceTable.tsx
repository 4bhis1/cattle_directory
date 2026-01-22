"use client";

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Typography,
    Box
} from '@mui/material';
import { Edit, Delete, AttachMoney, TrendingUp, TrendingDown } from '@mui/icons-material';
import dayjs from 'dayjs';

interface Transaction {
    _id: string;
    date: string;
    recordType: 'income' | 'expense';
    expenseCategory?: string; // For expenses
    subcategory?: string;     // For expenses
    source?: string;          // For income (if we use a source field, or map category to source)
    // Note: Backend might use same field 'expenseCategory' for 'Group/Source'.
    description: string;
    amount: number;
    paymentMethod: string;
    paidTo?: string; // Vendor
}

interface FinanceTableProps {
    data: Transaction[];
    loading: boolean;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export default function FinanceTable({ data, loading, onEdit, onDelete }: FinanceTableProps) {

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Loading records...</div>;
    }

    if (data.length === 0) {
        return (
            <div className="p-10 text-center flex flex-col items-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                <AttachMoney fontSize="large" className="text-slate-300 mb-2" />
                <Typography>No transactions found for this period.</Typography>
            </div>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0} className="border border-slate-200 rounded-xl overflow-hidden">
            <Table sx={{ minWidth: 650 }} aria-label="finance table">
                <TableHead className="bg-slate-50">
                    <TableRow>
                        <TableCell className="font-bold text-slate-600">Date</TableCell>
                        <TableCell className="font-bold text-slate-600">Type</TableCell>
                        <TableCell className="font-bold text-slate-600">Category / Source</TableCell>
                        <TableCell className="font-bold text-slate-600">Details</TableCell>
                        <TableCell className="font-bold text-slate-600">Payment</TableCell>
                        <TableCell align="right" className="font-bold text-slate-600">Amount</TableCell>
                        <TableCell align="center" className="font-bold text-slate-600">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => {
                        const isExpense = row.recordType === 'expense';
                        const colorClass = isExpense ? 'text-red-600' : 'text-green-600';
                        const bgClass = isExpense ? 'bg-red-50' : 'bg-green-50';
                        
                        return (
                            <TableRow
                                key={row._id}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                <TableCell component="th" scope="row">
                                    <span className="font-medium text-slate-700">
                                        {dayjs(row.date).format('DD MMM, YYYY')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        icon={isExpense ? <TrendingDown fontSize="small"/> : <TrendingUp fontSize="small"/>}
                                        label={isExpense ? 'Money Out' : 'Money In'} 
                                        size="small"
                                        className={`${bgClass} ${colorClass} font-bold border-none`}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-700">
                                            {row.expenseCategory || row.source || 'N/A'}
                                        </span>
                                        {row.subcategory && (
                                            <span className="text-xs text-slate-500">
                                                {row.subcategory}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col max-w-[200px]">
                                        <span className="text-sm text-slate-600 truncate" title={row.description}>
                                            {row.description}
                                        </span>
                                        {row.paidTo && (
                                            <span className="text-xs text-slate-400">
                                                {isExpense ? 'To: ' : 'From: '}{row.paidTo}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-slate-500 border border-slate-200 rounded px-2 py-0.5 bg-slate-50">
                                        {row.paymentMethod}
                                    </span>
                                </TableCell>
                                <TableCell align="right">
                                    <span className={`font-bold ${colorClass}`}>
                                        {isExpense ? '-' : '+'} ₹{row.amount.toLocaleString()}
                                    </span>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" onClick={() => onEdit && onEdit(row._id)}>
                                        <Edit fontSize="small" className="text-slate-400 hover:text-blue-600"/>
                                    </IconButton>
                                    {/* <IconButton size="small" onClick={() => onDelete && onDelete(row._id)}>
                                        <Delete fontSize="small" className="text-slate-400 hover:text-red-600"/>
                                    </IconButton> */}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
