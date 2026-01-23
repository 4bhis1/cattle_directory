'use client';

import React from 'react';
import Form, {
  FormInput,
  FormNumber,
  FormButton,
  useFormContext,
  FormAutocomplete
} from '@/app/components/Form';
import { useSnackbar } from '@/app/context/SnackbarContext';
import { DEFAULT_ORGANISATION_ID } from '@/app/context/CommonProvider';
import { EXPENSE_GROUPS, PAYMENT_METHODS } from '@/app/lib/constants/expenseConstants';
import dayjs, { Dayjs } from 'dayjs';

/**
 * ExpenseForm – a reusable form for creating or editing an expense/income transaction.
 * Mirrors the design of the CustomerForm, using the same Form wrapper and validation
 * utilities, but with fields relevant to finance tracking.
 */
const ExpenseFormInner = ({ onClose }: { onClose?: () => void }) => {
  const { isSubmitting } = useFormContext();
  const [date, setDate] = React.useState<Dayjs | null>(dayjs());

  return (
    <div className="space-y-6">
      {/* Date & Amount */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="date"
          label="Date"
          type="date"
          defaultValue={date?.format('YYYY-MM-DD') || ''}
          rules={{ required: 'Date is required' }}
        />
        <FormNumber
          name="amount"
          label="Amount (₹)"
          placeholder="e.g. 5000"
          rules={{ required: 'Amount is required', min: { value: 0, message: 'Must be positive' } }}
          min={0}
        />
      </div>

      {/* Transaction Type */}


      {/* Group / Source */}
      <FormAutocomplete
        name="expenseCategory"
        label="Group / Source"
        options={Object.keys(EXPENSE_GROUPS).map((g) => ({ value: g, label: g }))}
        rules={{ required: 'Select a group' }}
      />

      {/* Subgroup – only shown when the chosen group has sub‑items */}
      <FormAutocomplete
        name="subgroup"
        label="Subgroup (Optional)"
        options={[]}
        // The options will be populated dynamically in the parent component if needed.
        // Keeping the field here ensures the form schema knows about it.
      />

      {/* Payment Method */}
      <FormAutocomplete
        name="paymentMethod"
        label="Payment Method"
        options={PAYMENT_METHODS.map((m) => ({ value: m.toLowerCase(), label: m }))}
        rules={{ required: 'Select a payment method' }}
      />

      {/* Vendor / Received From */}
      <FormInput
        name="paidTo"
        label="Vendor / Received From"
        placeholder="Optional"
      />

      {/* Description / Notes */}
      <FormInput
        name="description"
        label="Description / Notes"
        multiline
        rows={3}
        placeholder="Add any extra details"
      />

      {/* Action Buttons */}
      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <FormButton label="Save Transaction" fullWidth={false} />
      </div>
    </div>
  );
};

/**
 * ExpenseForm – wrapper that supplies endpoint, method and default values.
 */
const ExpenseForm = ({ expenseId, onSuccess, onClose, defaultDate, editData }: {
  expenseId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  defaultDate?: string;
  editData?: any;
}) => {
  const { showSnackbar } = useSnackbar();

  const formProps = {
    endpoint: expenseId ? `/finance/expenses/${expenseId}` : '/finance/expenses',
    method: (expenseId ? 'PATCH' : 'POST') as 'POST' | 'PATCH',
    onSuccess: () => {
      showSnackbar('Transaction saved successfully!', 'success');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      showSnackbar(err.message || 'Failed to save transaction', 'error');
    },
    defaultValues: editData ? {
        ...editData,
        date: dayjs(editData.date).format('YYYY-MM-DD'),
    } : {
      organisation_id: DEFAULT_ORGANISATION_ID,
      date: defaultDate || dayjs().format('YYYY-MM-DD'),
    },
  };

  return (
    <Form {...formProps}>
      <ExpenseFormInner onClose={onClose} />
    </Form>
  );
};

export default ExpenseForm;
