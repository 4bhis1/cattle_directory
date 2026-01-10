import { Pets } from "@mui/icons-material";
import {
  FormAutocomplete,
  FormDate,
  FormInput,
  FormNumber,
  FormSmartAutocomplete,
} from "../../Form/Form";
import { FormCard, FormCardHeader } from "../../Form/components/FormCard";
import {
  ACQUISITION_TYPE_OPTIONS,
  BUFFALO_BREEDS,
  CATTLE_TYPE_OPTIONS,
  COW_BREEDS,
  GENDER_OPTIONS,
} from "../contants";

const calculateAge = (dob: string) => {
  if (!dob) return "";
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
};

const BasicInfoSection = () => {
  return (
    <FormCard>
      <FormCardHeader
        title="Cattle Information"
        Icon={<Pets sx={{ color: "#3b82f6" }} />}
      />

      {/* Group 1: Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FormInput name="name" label="Name" required />
        <FormAutocomplete
          name="gender"
          label="Gender"
          options={GENDER_OPTIONS}
        />
        <FormAutocomplete
          name="cattleType"
          label="Cattle Type"
          options={CATTLE_TYPE_OPTIONS}
        />
        <FormAutocomplete
          name="breed"
          label="Breed"
          required
          options={(data) =>
            data.cattleType === "cow" ? COW_BREEDS : BUFFALO_BREEDS
          }
          compute={(val: string, setValue: any) => {
            const breed = COW_BREEDS.find((breed) => breed.value === val);
            if (breed) {
              setValue("expectedMilkProduction", breed.expectedMilkProduction);
              setValue("fatPercentage", breed.fatPercentage);
            }
          }}
        />
        <FormSmartAutocomplete
          name="motherId"
          label="Select Mother (if in farm)"
          endpoint="/cattle"
          placeholder="Search cattle by name..."
          getLabel={(option: any) => option.name}
          getValue={(option: any) => option._id}
          searchParam="search"
          className="flex-grow"
        />
      </div>

      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4 block">
        Timeline
      </span>

      {/* Group 2: Age/Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <FormDate
          name="dateOfBirth"
          label="Date of Birth"
          // required
          compute={(val: string, setValue: any) => {
            setValue("age", calculateAge(val));
          }}
        />

        <FormInput name="age" label="Age (Years)" readOnly />
      </div>

      {/* Group 3: Production */}
      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4 block">
        Production Metrics
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <FormNumber name="expectedMilkProduction" label="Est. Daily Milk (L)" />
        <FormNumber name="fatPercentage" label="Fat %" />
        <FormNumber name="numberOfBirths" label="No. of Births" />
      </div>

      {/* Group 3: Production */}
      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4 block">
        Sales Metrics
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormAutocomplete
          name="acquisitionType"
          label="Acquisition Type"
          required
          options={ACQUISITION_TYPE_OPTIONS}
        />
        <FormDate
          name="dateOfAcquisition"
          label="Date of Acquisition"
          required
        />
        <FormNumber name="purchasePrice" label="Purchase Price" />
      </div>
    </FormCard>
  );
};

export default BasicInfoSection;
