import { LinearProgress } from "@mui/material";
import { useFormContext } from "../Form";

const FormProgressBar = ({
  calculateProgress,
  ...props
}: {
  calculateProgress: (formData: any, isValid: boolean) => number;
}) => {
  const {
    watch,
    formState: { isValid },
  } = useFormContext();
  const formData = watch();

  return (
    <div className="sticky top-20 z-50 w-full">
      <LinearProgress
        color={isValid ? "primary" : "error"}
        variant="determinate"
        value={calculateProgress(formData, isValid)}
        sx={{
          height: 6,
          "& .MuiLinearProgress-bar": {
            transition: "transform 0.4s linear",
          },
        }}
        {...props}
      />
    </div>
  );
};

export default FormProgressBar;
