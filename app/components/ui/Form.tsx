import React from 'react';
import { UseFormReturn, FormProvider, FieldValues, SubmitHandler } from 'react-hook-form';

interface FormProps<T extends FieldValues> {
    methods: UseFormReturn<T>;
    onSubmit: SubmitHandler<T>;
    children: React.ReactNode;
    className?: string;
    id?: string;
}

export const Form = <T extends FieldValues>({ methods, onSubmit, children, className, id }: FormProps<T>) => {
    return (
        <FormProvider {...methods}>
            <form id={id} onSubmit={methods.handleSubmit(onSubmit)} className={className}>
                {children}
            </form>
        </FormProvider>
    );
};
