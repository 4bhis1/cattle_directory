import { Tooltip } from "@mui/material";

export const ActionableIcon = ({ Icon, onClick, tooltipText, iconStyle = "text-slate-200 hover:text-white ", }: any) => {

    let iconRender = Icon ? <Icon onClick={onClick}
        className={iconStyle}
        fontSize="small" /> : null;

    if (tooltipText) {
        iconRender = <Tooltip title={tooltipText}>{iconRender}</Tooltip>
    }

    return (
        <div className="flex items-center justify-center p-2 rounded-full   cursor-pointer hover:bg-slate-800 transition-all duration-200">
            {iconRender}
        </div>
    )
}