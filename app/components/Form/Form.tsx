"use client";

import React, { createContext, useContext } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormReturn,
  FieldValues,
} from "react-hook-form";
import FormInput from "./inputs/FormInput";
import FormButton from "./components/FormButton";
import FormRadio from "./inputs/FormRadio";
import FormCheckbox from "./inputs/FormCheckbox";
import FormDate from "./inputs/FormDate";
import FormNumber from "./inputs/FormNumber";
import FormImage from "./inputs/FormImage";
import FormAutocomplete from "./inputs/FormAutocomplete";
import FormSmartAutocomplete from "./inputs/FormSmartAutocomplete";
import useFormFetch from "./hooks/useFormFetch";
import useFormSubmit from "./hooks/useFormSubmit";

type FormContextType = UseFormReturn<any> & {
  onSubmit: SubmitHandler<any>;
  isSubmitting: boolean;
  error: Error | null;
  data: any;
};

const FormContext = createContext<FormContextType | null>(null);

interface FormProps {
  children: React.ReactNode;
  onSubmit?: SubmitHandler<any>;
  endpoint?: string;
  method?: "POST" | "PUT" | "PATCH";
  beforeSubmit?: (data: any) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  defaultValues?: any;
}

const Form = ({
  children,
  onSubmit: customSubmit,
  endpoint,
  method,
  beforeSubmit,
  onSuccess,
  onError,  
  defaultValues,
}: FormProps) => {
  const formProps = useForm({defaultValues});
  const {
    submit,
    isSubmitting,
    error: submitError,
    data: submitResult,
  } = useFormSubmit({
    endpoint,
    method,
    onSuccess,
    onError,
    beforeSubmit
  });
  const onSubmit: SubmitHandler<any> =
    customSubmit || submit || ((data) => console.log("Submitted Data:", data));

  return (
    <FormContext.Provider
      value={{
        ...formProps,
        onSubmit,
        isSubmitting,
        error: submitError,
        data: submitResult,
      }}
    >
      <form onSubmit={formProps.handleSubmit(onSubmit)} className="w-full">
        {children}
      </form>
    </FormContext.Provider>
  );
};

const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a Form");
  }
  return context;
};

export {
  useFormContext,
  FormInput,
  FormButton,
  FormRadio,
  FormCheckbox,
  FormDate,
  FormNumber,
  FormImage,
  FormAutocomplete,
  FormSmartAutocomplete,
};

export default Form;
