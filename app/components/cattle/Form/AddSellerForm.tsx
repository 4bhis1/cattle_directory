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

const AddSellerForm = ({
  openNewSeller,
  setOpenNewSeller,
}: {
  openNewSeller: boolean;
  setOpenNewSeller: (open: boolean) => void;
}) => {

  return <div>
    hello

  </div>
  // const [newSellerData, setNewSellerData] = useState({
  //   name: "",
  //   phoneNumber: "",
  //   address: "",
  // });
  // const { setValue } = useFormContext();

  // const handleCreateSeller = async () => {
  //   try {
  //     const res = await apiService.post("/sellers", newSellerData);
  //     if (res.success) {
  //       setValue("sellerId", res.data); // Set the full object
  //       setOpenNewSeller(false);
  //       setNewSellerData({ name: "", phoneNumber: "", address: "" });
  //     }
  //   } catch (error) {
  //     console.error("Failed to create seller");
  //   }
  // };

  // return (
  //   <Dialog open={openNewSeller} onClose={() => setOpenNewSeller(false)}>
  //     <Form>
  //       <FormCard>
  //         <FormCardHeader
  //           title="Seller Information"
  //           Icon={<Storefront className="mr-2 text-indigo-500" />}
  //         />
  //         <div className="flex flex-col gap-4">
  //           <FormInput name="name" label="Name" required />
  //           <FormInput name="phoneNumber" label="Phone Number" required />
  //           <FormInput name="address" label="Address" required />
  //           <div className="flex justify-end gap-8 mt-4">
  //             <FormButton label="Close" />
  //             <FormButton label="Save and close" />
  //           </div>
  //         </div>
  //       </FormCard>
  //     </Form>
  //   </Dialog>
  // );
};

export default AddSellerForm;
