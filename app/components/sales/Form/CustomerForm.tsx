"use client";

import React from "react";
import { Person, Phone, Home, Email, CurrencyRupee } from "@mui/icons-material";
import Form, {
  FormInput,
  FormButton,
  useFormContext,
  FormAutocomplete,
  FormNumber
} from "@/app/components/Form";
import { useSnackbar } from "@/app/context/SnackbarContext";
import { DEFAULT_ORGANISATION_ID } from "@/app/context/CommonProvider";

const CustomerFormInner = ({ onClose }: { onClose?: () => void }) => {
  const { isSubmitting } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormInput
          name="name"
          label="Customer Name"
          placeholder="Enter full name"
          icon={<Person />}
          rules={{ required: "Name is required" }}
        />
        <FormInput
          name="phone"
          label="Phone Number"
          placeholder="10-digit mobile number"
          icon={<Phone />}
          rules={{ 
            required: "Phone is required",
            pattern: {
                value: /^[0-9]{10}$/,
                message: "Invalid phone number"
            }
          }}
        />
        <FormInput
          name="address"
          label="Address"
          placeholder="Village/Area address"
          icon={<Home />}
          multiline
          rows={3}
        />
        <FormInput
            name="email"
            label="Email (Optional)"
            placeholder="email@example.com"
            icon={<Email />}
        />
        
        <div className="grid grid-cols-2 gap-4">
             <FormAutocomplete
                name="rateGroup"
                label="Rate Group"
                options={[
                    { value: 'A', label: 'Group A (Premium)' },
                    { value: 'B', label: 'Group B (Standard)' },
                    { value: 'C', label: 'Group C (Discount)' }
                ]}
             />
             <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <FormNumber
                    name="defaultMorningRate"
                    label="Morning Rate (₹)"
                    placeholder="e.g. 45"
                    rules={{ required: "Required" }}
                    min={0}
                />
                <FormNumber
                    name="defaultEveningRate"
                    label="Evening Rate (₹)"
                    placeholder="e.g. 45"
                    rules={{ required: "Required" }}
                    min={0}
                />
             </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
        {onClose && (
            <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
                Cancel
            </button>
        )}
        <FormButton
          label="Save Customer"
          fullWidth={false} // Let it size itself
        />
      </div>
    </div>
  );
};

const CustomerForm = ({ 
    customerId, 
    initialValues,
    onSuccess,
    onClose 
}: { 
    customerId?: string; 
    initialValues?: any;
    onSuccess?: () => void;
    onClose?: () => void;
}) => {
  const { showSnackbar } = useSnackbar();

  const formProps = {
    endpoint: customerId ? `/customers/${customerId}` : "/customers",
    method: (customerId ? "PATCH" : "POST") as "POST" | "PATCH",
    onSuccess: () => {
      showSnackbar("Customer saved successfully!", "success");
      if (onSuccess) onSuccess();

      // if (onClose) onClose();
    },
    onError: (err: any) => {
      showSnackbar(err.message || "Failed to save customer", "error");
    },

    defaultValues: {
        rateGroup: 'A',
        defaultMorningRate: 45,
        defaultEveningRate: 45,
        organisation_id: DEFAULT_ORGANISATION_ID,
        ...(() => {
            if (!initialValues) return {};
            const { _id, ...rest } = initialValues;
            return rest;
        })()
    }
  };

  return (
    <Form {...formProps}>
      <CustomerFormInner onClose={onClose} />
    </Form>
  );
};

export default CustomerForm;
