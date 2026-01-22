import React, { useEffect, useState } from "react";
import { Description } from "@mui/icons-material";
import Form, {
  FormInput,
  FormButton,
  FormAutocomplete,
  FormNumber
} from "@/app/components/Form";
import { useSnackbar } from "@/app/context/SnackbarContext";
import { apiService } from "@/lib/apiService";
import { DEFAULT_ORGANISATION_ID } from "@/app/context/CommonProvider";

const WasteFormInner = ({ onClose, isEdit }: { onClose?: () => void; isEdit?: boolean }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <FormNumber
            name="quantity"
            label="Quantity (Liters)"
            placeholder="0.0"
            rules={{ required: "Quantity is required", min: 0.1 }}
            min={0}
            step={0.1}
        />
        
        <FormAutocomplete
            name="reason"
            label="Reason"
            options={[
                { value: 'spilled', label: 'Spilled / Staff Mismanagement' },
                { value: 'sour', label: 'Sour / Curdled (Phat gaya)' },
                { value: 'contaminated', label: 'Contaminated' },
                { value: 'excess', label: 'Excess Production' },
                { value: 'other', label: 'Other' }
            ]}
            rules={{ required: "Reason is required" }}
        />

        <FormInput
            name="description"
            label="Description / Notes"
            placeholder="Additional details..."
            multiline
            rows={3}
            icon={<Description />}
        />
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
        {onClose && (
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
                Cancel
            </button>
        )}
        <FormButton
          label={isEdit ? "Update Waste Record" : "Save Waste Record"}
          fullWidth={false}
        />
      </div>
    </div>
  );
};


const WasteForm = ({ 
    date, 
    onSuccess,
    onClose 
}: { 
    date: string; 
    onSuccess?: () => void;
    onClose?: () => void;
}) => {
  const { showSnackbar } = useSnackbar();
  const [existingWaste, setExistingWaste] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExisting = async () => {
        setLoading(true);
        try {
            // Fetch from sales with recordType=waste
            const res: any = await apiService.get(`/sales?date=${date}&recordType=waste`);
            const records = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []); 
            if (records.length > 0) {
                setExistingWaste(records[0]);
            } else {
                setExistingWaste(null);
            }
        } catch (err) {
            console.error("Failed to fetch waste", err);
        } finally {
            setLoading(false);
        }
    };
    if (date) fetchExisting();
  }, [date]);

  const formProps = {
    endpoint: existingWaste ? `/sales/${existingWaste._id}` : "/sales",
    method: (existingWaste ? "PATCH" : "POST") as "POST" | "PATCH",
    beforeSubmit: (data: any) => ({
        // Map form fields to Sales model fields
        date: date,
        recordType: 'waste',
        quantityInLiters: data.quantity,
        wasteReason: data.reason,
        notes: data.description,
        totalAmount: 0,
        organisation_id: DEFAULT_ORGANISATION_ID
    }),
    onSuccess: () => {
      showSnackbar("Waste record saved!", "success");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (err: any) => {
      console.error(err);
      showSnackbar(err.message || "Failed to save waste", "error");
    },
    defaultValues: existingWaste ? {
        quantity: existingWaste.quantityInLiters,
        reason: existingWaste.wasteReason,
        description: existingWaste.notes,
        organisation_id: existingWaste.organisation_id
    } : {
        quantity: '',
        reason: 'spilled',
        description: '',
        organisation_id: DEFAULT_ORGANISATION_ID
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Loading...</div>;

  return (
    <Form {...formProps}>
      <WasteFormInner onClose={onClose} isEdit={!!existingWaste} />
    </Form>
  );
};

export default WasteForm;
