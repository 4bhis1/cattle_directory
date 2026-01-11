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

export const FormContext = createContext<FormContextType | null>(null);

interface FormProps {
  children: React.ReactNode;
  onSubmit?: SubmitHandler<any>;
  endpoint?: string;
  method?: "POST" | "PUT" | "PATCH";
  beforeSubmit?: (data: any) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  defaultValues?: any;
  fetchUrl?: string | null;
  postFetch?: (data: any) => any;
  fetchParams?: any;
}

const FormWrapper = ({
  children,
  fetchUrl,
  postFetch,
  fetchParams,
  onSubmit,
  ...props
}: {
  children: React.ReactNode;
  fetchUrl?: string | null;
  postFetch?: (data: any) => any;
  fetchParams?: any;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  [key: string]: any;
}) => {
  useFormFetch({
    endpoint: fetchUrl,
    params: fetchParams,
    postFetch,
  });
  return (
    <form onSubmit={onSubmit} className="w-full" {...props}>
      {children}
    </form>
  );
};

const Form = ({
  children,
  onSubmit: customSubmit,
  endpoint,
  method,
  beforeSubmit,
  onSuccess,
  onError,
  defaultValues,
  fetchUrl,
  ...props
}: FormProps) => {
  const formProps = useForm({ defaultValues });

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
    beforeSubmit,
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
      <FormWrapper fetchUrl={fetchUrl} onSubmit={formProps.handleSubmit(onSubmit)} {...props}>
        {children}
      </FormWrapper>
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
