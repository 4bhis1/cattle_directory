"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import Form, { FormButton, FormInput, useFormContext } from "../../Form/Form";
import { useState } from "react";
import { apiService } from "@/lib/apiService";
import { FormCard, FormCardHeader } from "../../Form/components/FormCard";
import { Storefront } from "@mui/icons-material";
import { DEFAULT_ORGANISATION_ID } from "../../../context/CommonProvider";
import { useSnackbar } from "@/app/context/SnackbarContext";

const AddSellerForm = ({
  openNewSeller,
  setOpenNewSeller,
  fieldName,
}: {
  openNewSeller: boolean;
  setOpenNewSeller: (open: boolean) => void;
  fieldName: string;
}) => {

    const { showSnackbar } = useSnackbar();
    const { ...parentFormProps } = useFormContext();
  


  const formProps = {
    endpoint: "/sellers",
    method: "POST" as "POST" | "PUT" | "PATCH",
    beforeSubmit: (data: any) => {
      return {
        ...data,
        organisation_id: DEFAULT_ORGANISATION_ID
      }
    },
    onSuccess: (response: any) => {
      const newSeller = response.data;
      showSnackbar("Saved successfully!", "success");
      setTimeout(() => {
        setOpenNewSeller(false);
      }, 1000);
      parentFormProps.setValue(fieldName, newSeller._id || newSeller.id);
    },
    onError: (err: any) => {
      showSnackbar(err.message, "error");
    },
    defaultValues: {
      organisation_id: DEFAULT_ORGANISATION_ID,
    },
    mode: "onChange" as const,
  }

  return (
    <Dialog open={openNewSeller} onClose={() => setOpenNewSeller(false)}>
      <Form {...formProps}>
        <FormCard>
          <FormCardHeader
            title="Seller Information"
            Icon={<Storefront className="mr-2 text-indigo-500" />}
          />
          <div className="flex flex-col gap-4">
            <FormInput name="name" label="Name" required />
            <FormInput name="phoneNumber" label="Phone Number" required />
            <FormInput name="address" label="Address" required />
            <div className="flex justify-end gap-8 mt-4">
              <Button onClick={() => setOpenNewSeller(false)}>Close</Button>
              <FormButton label="Save and close" />
            </div>
          </div>
        </FormCard>
      </Form>
    </Dialog>
  );
};

export default AddSellerForm;
