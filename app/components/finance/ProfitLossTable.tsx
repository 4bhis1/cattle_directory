
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { apiService } from '@/lib/apiService';
import { EXPENSE_GROUPS, PAYMENT_METHODS } from '@/app/lib/constants/expenseConstants';

interface Transaction {
  _id: string;
  date: string;
  amount: number;
  recordType: 'expense' | 'income';
  expenseCategory?: string;
  subcategory?: string;
  source?: string; // used for some legacy data or specific income types
  paymentMethod: string;
  description?: string;
  paidTo?: string;
  paymentStatus: 'paid' | 'pending' | 'partial';
}

export default function ProfitLossTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterGroup, setFilterGroup] = useState('');
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/expenses'); // Using generic expense endpoint
      const data: Transaction[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTransactions(data);
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleStatusToggle = async (id: string, current: string) => {
    const newStatus = current === 'paid' ? 'pending' : 'paid';
    try {
      await apiService.patch(`/expenses/${id}`, { paymentStatus: newStatus });
      setTransactions((prev) =>
        prev.map((t) => (t._id === id ? { ...t, paymentStatus: newStatus } : t))
      );
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.recordType !== filterType) return false;
    if (filterGroup) {
      const group = t.recordType === 'expense' ? t.expenseCategory : (t.source || t.expenseCategory);
      if (!group || !group.toLowerCase().includes(filterGroup.toLowerCase())) return false;
    }
    if (dateFrom && dayjs(t.date).isBefore(dateFrom, 'day')) return false;
    if (dateTo && dayjs(t.date).isAfter(dateTo, 'day')) return false;
    return true;
  });

  const totalIncome = filtered
    .filter((t) => t.recordType === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.recordType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Profit / Loss Overview
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
            <MenuItem value="income">Income</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Group / Source"
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
        />
        <DatePicker
          label="From"
          value={dateFrom}
          onChange={(d) => setDateFrom(d)}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="To"
          value={dateTo}
          onChange={(d) => setDateTo(d)}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          Total Income: <strong>₹{totalIncome.toFixed(2)}</strong>
        </Typography>
        <Typography variant="subtitle1">
          Total Expense: <strong>₹{totalExpense.toFixed(2)}</strong>
        </Typography>
        <Typography variant="subtitle1">
          Net: <strong>₹{(totalIncome - totalExpense).toFixed(2)}</strong>
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Received</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category / Source</TableCell>
              <TableCell>Subcategory</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t._id} hover>
                <TableCell padding="checkbox">
                  <Tooltip title={t.paymentStatus === 'paid' ? 'Mark as pending' : 'Mark as paid'}>
                    <Checkbox
                      checked={t.paymentStatus === 'paid'}
                      onChange={() => handleStatusToggle(t._id, t.paymentStatus)}
                      color="primary"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>{dayjs(t.date).format('YYYY-MM-DD')}</TableCell>
                <TableCell>
                    <span className={t.recordType === 'expense' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                        {t.recordType === 'expense' ? 'Out' : 'In'}
                    </span>
                </TableCell>
                <TableCell>{t.expenseCategory || t.source || '-'}</TableCell>
                <TableCell>{t.subcategory || '-'}</TableCell>
                <TableCell>₹{t.amount.toFixed(2)}</TableCell>
                <TableCell>{t.paymentMethod}</TableCell>
                <TableCell>{t.description || '-'}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
                <TableRow>
                    <TableCell colSpan={8} align="center">No transactions found.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
