"use client";

import React from "react";
import { LinearProgress } from "@mui/material";
import { Pets } from "@mui/icons-material";
import FormButton from "@/app/components/Form/components/FormButton";
import { useSnackbar } from "@/app/context/SnackbarContext";
import { useUser, DEFAULT_ORGANISATION_ID } from "@/app/context/CommonProvider";
import StickyFooter from "../../ui/StickyFooter";
import BasicInfoSection from "./BasicInfo";
import Form from "../../Form/Form";
import { VaccinationSection } from "./Vaccination";
import GallerySection from "./Gallery";
import StatusSection from "./Status";
import WeightSection from "./Weight";
import SellerSection from "./Seller";
import InsuranceSection from "./Insurance";
import { cattleBeforeSubmit, cattlePostFetch } from "../helperFunctions";
import FormProgressBar from "../../Form/components/ProgressBar";
import { useRouter } from "next/navigation";

const requiredFields = [
  "name",
  "cattleType",
  "gender",
  "acquisitionType",
  "dateOfAcquisition",
  "breed",
  "status",
  "sellerId",
  "cost",
];
const otherFields = ["weight", "insuranceNumber"];

const CattleForm = ({ id }: { id?: string }) => {
  const { showSnackbar } = useSnackbar();
  const { isAdmin } = useUser();
  const router = useRouter();

  const formProps = {
    endpoint: id ? `/cattle/${id}` : "/cattle",
    method: (id ? "PUT" : "POST") as "POST" | "PUT" | "PATCH",
    beforeSubmit: cattleBeforeSubmit,
    onSuccess: (response: any) => {
      showSnackbar("Saved successfully!", "success");
      const savedData = response.data || response;
      router.push(`/cattle/${savedData._id}`);
    },
    onError: (err: any) => {
      showSnackbar(err.message, "error");
    },
    defaultValues: React.useMemo(() => ({
      dateOfAcquisition: new Date().toISOString(),
      gender: "female",
      cattleType: "cow",
      numberOfBirths: 0,
      acquisitionType: "purchased",
      organisation_id: DEFAULT_ORGANISATION_ID,
    }), []),
    fetchUrl: id ? `/cattle/${id}` : undefined,
    postFetch: cattlePostFetch,
    mode: "onChange" as const,
  };

  const calculateProgress = (formData: any, isValid: boolean) => {
    if (!isValid) {
      let filled = 0;
      requiredFields.forEach((field) => {
        if (formData?.[field]) filled++;
      });
      return (filled / requiredFields.length) * 100;
    } else {
      const allFields = [...requiredFields, ...otherFields];
      let filled = 0;
      allFields.forEach((field) => {
        if (formData?.[field]) filled++;
      });
      return (filled / allFields.length) * 100;
    }
  };

  return (
    <Form {...formProps}>
      <>
        <FormProgressBar calculateProgress={calculateProgress} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
          <div className="lg:col-span-1 space-y-6">
            <GallerySection />
            <StatusSection />
            <SellerSection />
            <WeightSection />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoSection />
            <VaccinationSection />
            <InsuranceSection />
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
