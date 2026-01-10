'use client'

import React, { createContext, useContext } from "react"
import { useForm, SubmitHandler, UseFormReturn, FieldValues } from "react-hook-form"
import FormInput from "./inputs/FormInput"
import FormButton from "./components/FormButton"
import FormRadio from "./inputs/FormRadio"
import FormCheckbox from "./inputs/FormCheckbox"
import FormDate from "./inputs/FormDate"
import FormNumber from "./inputs/FormNumber"
import FormImage from "./inputs/FormImage"
import FormAutocomplete from "./inputs/FormAutocomplete"
import useFormFetch from "./hooks/useFormFetch"
import useFormSubmit from "./hooks/useFormSubmit"



type Inputs = {
    example: string
    exampleRequired: string
    [key: string]: any
}

// Define the context type
type FormContextType = UseFormReturn<any> & {
    onSubmit: SubmitHandler<any>
    isSubmitting: boolean
    error: Error | null
    data: any
}

const FormContext = createContext<FormContextType | null>(null)

const Form = ({ children, onSubmit: customSubmit, endpoint, method, onSuccess, onError }: { children: React.ReactNode, onSubmit?: SubmitHandler<any>, endpoint?: string, method?: 'POST' | 'PUT' | 'PATCH', onSuccess?: (data: any) => void, onError?: (error: any) => void }) => {
    const formProps = useForm()
    const { submit, isSubmitting, error: submitError, data: submitResult } = useFormSubmit({
        endpoint,
        method,
        onSuccess,
        onError
    })
    const onSubmit: SubmitHandler<any> = customSubmit || submit || ((data) => console.log("Submitted Data:", data))

    return (
        <FormContext.Provider value={{ ...formProps, onSubmit, isSubmitting, error: submitError, data: submitResult }}>
            <form onSubmit={formProps.handleSubmit(onSubmit)} className="w-full">
                {children}
            </form>
        </FormContext.Provider>
    );
}

const useFormContext = () => {
    const context = useContext(FormContext)
    if (!context) {
        // Fallback to react-hook-form's context if ours is not found, or throw
        throw new Error('useFormContext must be used within a Form')
    }
    return context
}

// Exports for consumption
export {
    Form,
    useFormContext,
    FormInput,
    FormButton,
    FormRadio,
    FormCheckbox,
    FormDate,
    FormNumber,
    FormImage,
    FormAutocomplete
}

// const cattleForm = [
//     {
//         cattleId: "1234",
//         milk: 20,
//     },
//     {
//         cattleId: "1235",
//         milk: 22,
//     }
// ]

// Example Usage Component
// Example Usage Component

// 1. Fetcher Component to be placed inside Form
// const FormFetcher = ({ endpoint }: { endpoint: string }) => {
//     const { isLoading, error, data } = useFormFetch({
//         endpoint,
//         onSuccess: (data) => console.log("Fetched Data:", data),
//         onError: (err) => console.log("Fetch Error (expected if endpoint missing):", err)
//     })

//     if (isLoading) return <div className="text-center py-2 text-blue-600">Loading form data...</div>
//     if (error) return <div className="text-center py-2 text-red-500 text-xs">Error loading data: {error.message}</div>
//     return null
// }

// 2. Main Form Wrapper
// const FormWrapper = () => {
//     // Handling Submission


//     return (
//         <Form onSubmit={(data) => console.log("Submission Success:", data)} endpoint='/users/create' method='POST' onSuccess={(data) => console.log("Submission Success:", data)} onError={(err) => console.log("Submission Error:", err)}>
//             <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center p-4">
//                 <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
//                     <h1 className="text-2xl font-bold text-gray-800 mb-6">Example Form</h1>

//                     <div className="flex flex-col gap-5">
//                         <FormInput
//                             name="fullName"
//                             label="Full Name"
//                             placeholder="John Doe"
//                             validate={(value: any) => !value ? 'Full name is required' : undefined}
//                         />

//                         {/* {cattleForm.map((cattle, index) => <FormNumber value={cattle.milk} key={index} name={cattle.cattleId} label="Milk" placeholder="20" required min={18} max={100} />)} */}

//                         <FormNumber name="milk" label="Milk" placeholder="20" required min={18} max={100} />

//                         <FormDate name="dob" label="Date of Birth" required />

//                         <FormAutocomplete
//                             name="country"
//                             label="Country"
//                             options={[
//                                 { label: 'USA', value: 'usa' },
//                                 { label: 'Canada', value: 'canada' },
//                                 { label: 'India', value: 'india' }
//                             ]}
//                         />

//                         <FormRadio
//                             name="gender"
//                             label="Gender"
//                             options={[
//                                 { label: 'Male', value: 'male' },
//                                 { label: 'Female', value: 'female' }
//                             ]}
//                         />

//                         <FormCheckbox name="terms" label="I agree to terms and conditions" required />

//                         <FormImage name="profilePic" label="Profile Picture" />

//                         <FormButton label="Create Account" className="mt-2" />
//                     </div>
//                 </div>
//             </div>
//         </Form>
//     );
// }

export default Form;
