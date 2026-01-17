"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
import Loader from "../ui/Loader";

export type FormContextType = UseFormReturn<any> & {
  onSubmit: SubmitHandler<any>;
  isSubmitting: boolean;
  error: Error | null;
  data: any;
  isLoading: boolean;
};

export const FormContext = createContext<FormContextType | null>(null);

type FormProps = {
  children: React.ReactNode;
  onSubmit?: SubmitHandler<any>; // Renamed to customSubmit in component
  endpoint?: string;
  method?: "POST" | "PUT" | "PATCH";
  beforeSubmit?: (data: any) => any;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  defaultValues?: FieldValues;
  fetchUrl?: string;
  mode?: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all";
  // For other props passed to the form element
  [key: string]: any;
};

const FormWrapper = ({
  children,
  fetchUrl,
  postFetch,
  fetchParams,
  onSubmit,
  setLoading,
  ...props
}: {
  children: React.ReactNode;
  fetchUrl?: string | null;
  postFetch?: (data: any) => any;
  fetchParams?: any;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  setLoading: (loading: boolean) => void;
  [key: string]: any;
}) => {
  const { isLoading } = useFormFetch({
    endpoint: fetchUrl,
    params: fetchParams,
    postFetch,
  });

  useEffect(() => {
      setLoading(isLoading);
  }, [isLoading, setLoading]);

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
  mode = "onChange",
  ...props
}: FormProps) => {
  const formProps = useForm({ defaultValues, mode });
  const { reset } = formProps;
  // Initialize loading to true if we are going to fetch, to prevent empty flash
  const [isLoading, setIsLoading] = useState(!!fetchUrl);

  useEffect(() => {
    if (defaultValues) {
        reset(defaultValues);
    }
  }, [defaultValues, reset]);
  
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
        isLoading,
      }}
    >
      <FormWrapper 
        fetchUrl={fetchUrl} 
        onSubmit={formProps.handleSubmit(onSubmit)} 
        setLoading={setIsLoading}
        {...props}
      >
        {isLoading ? <Loader /> : children}
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
