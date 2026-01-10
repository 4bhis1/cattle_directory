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
import useFormFetch from "./hooks/useFormFetch";
import useFormSubmit from "./hooks/useFormSubmit";

type FormContextType = UseFormReturn<any> & {
  onSubmit: SubmitHandler<any>;
  isSubmitting: boolean;
  error: Error | null;
  data: any;
};

const FormContext = createContext<FormContextType | null>(null);

const Form = ({
  children,
  onSubmit: customSubmit,
  endpoint,
  method,
  onSuccess,
  onError,
}: {
  children: React.ReactNode;
  onSubmit?: SubmitHandler<any>;
  endpoint?: string;
  method?: "POST" | "PUT" | "PATCH";
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  const formProps = useForm();
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
};

export default Form;
