import Form, { useFormContext } from "./Form";

import FormRadio from "./inputs/FormRadio";
import FormInput from "./inputs/FormInput";
import FormCheckbox from "./inputs/FormCheckbox";
import FormDate from "./inputs/FormDate";
import FormNumber from "./inputs/FormNumber";
import FormImage from "./inputs/FormImage";
import FormAutocomplete from "./inputs/FormAutocomplete";
import FormSmartAutocomplete from "./inputs/FormSmartAutocomplete";
import FileUpload from "./inputs/FileUpload";

import { FormCard, FormCardHeader } from "./components/FormCard";
import FormProgressBar from "./components/ProgressBar";
import FormButton from "./components/FormButton";

export {
  useFormContext,
  FileUpload,
  FormInput,
  FormButton,
  FormRadio,
  FormCheckbox,
  FormDate,
  FormNumber,
  FormImage,
  FormAutocomplete,
  FormSmartAutocomplete,
  FormProgressBar,
  FormCard,
  FormCardHeader,
};

export default Form;
