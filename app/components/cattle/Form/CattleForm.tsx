"use client";

import React from "react";
import { LinearProgress } from "@mui/material";
import { Pets } from "@mui/icons-material";
import FormButton from "@/app/components/Form/components/FormButton";
import { useSnackbar } from "@/app/context/SnackbarContext";
import { useUser } from "@/app/context/CommonProvider";
import StickyFooter from "../../ui/StickyFooter";
import BasicInfoSection from "./BasicInfo";
import Form from "../../Form/Form";
import { VaccinationSection } from "./Vaccination";
import GallerySection from "./Gallery";
import StatusSection from "./Status";
import WeightSection from "./Weight";
import SellerSection from "./Seller";
import { cattleBeforeSubmit, cattlePostFetch } from "../helperFunctions";

const CattleForm = ({ id }: { id?: string }) => {
  const { showSnackbar } = useSnackbar();
  const { isAdmin } = useUser();

  const formProps = {
    endpoint: id ? `/cattle/${id}` : "/cattle",
    method: (id ? "PUT" : "POST") as "POST" | "PUT" | "PATCH",
    beforeSubmit: cattleBeforeSubmit,
    onSuccess: () => {
      showSnackbar("Saved successfully!", "success");
    },
    onError: (err: any) => {
      showSnackbar(err.message, "error");
    },
    defaultValues: {
      dateOfAcquisition: new Date().toISOString(),
      gender: "female",
      cattleType: "cow",
      numberOfBirths: 0,
      acquisitionType: "purchased",
    },
    fetchUrl: id ? `/cattle/${id}` : null,
    postFetch: cattlePostFetch,
  };

  return (
    <Form {...formProps}>
      <>
        <div className="sticky top-20 z-50 w-full">
          <LinearProgress variant="determinate" value={0} sx={{ height: 6 }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
          <div className="lg:col-span-1 space-y-6">
            <GallerySection />
            <SellerSection />
            <StatusSection />
            <WeightSection />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoSection />
            <VaccinationSection />
          </div>
        </div>
        {isAdmin && (
          <StickyFooter parentStyle="flex w-full justify-end">
            <FormButton
              label={id ? "Update Cattle" : "Save Cattle"}
              fullWidth={false}
              Icon={<Pets />}
            />
          </StickyFooter>
        )}
      </>
    </Form>
  );
};

export default CattleForm;
