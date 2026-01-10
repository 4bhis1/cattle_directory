

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