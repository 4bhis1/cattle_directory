import { useState } from "react";
import { Vaccines } from "@mui/icons-material";
import { FormCard, FormCardHeader } from "../../Form/components/FormCard";
import { FormDate, FormInput } from "../../Form/Form";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List } from "@mui/material";

export const VaccinationSection = () => {
    const [showAllVaccinations, setShowAllVaccinations] = useState(false);
    return (
       <FormCard>      
             <FormCardHeader
                    title=" Health & Vaccination Records"
                    Icon={<Vaccines sx={{ color: "#8b5cf6" }} />}
                  />
            <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
                <FormInput name="vaccineName" label="Name" required />
                <FormDate name="administeredDate" label="Date" required />
                <FormDate name="nextDueDate" label="Next Due Date" required />
            </div>

            <div className="space-y-2">
                {/* {(!form.vaccinations || form.vaccinations.length === 0) ? (
                    <p className="text-center text-slate-400">No vaccination records added.</p>
                ) : (
                    <div className="space-y-2">
                        {form.vaccinations.slice().reverse().slice(0, 2).map((vac: any, i: number) => (
                            <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 flex justify-between items-center rounded-lg">
                                <div>
                                    <span className="block font-bold text-slate-800 dark:text-white text-sm">{vac.vaccineName}</span>
                                    <span className="text-xs text-slate-500">Date: {new Date(vac.administeredDate).toLocaleDateString()}</span>
                                </div>
                                {vac.nextDueDate && <Chip label={`Next: ${new Date(vac.nextDueDate).toLocaleDateString()}`} size="small" color="primary" variant="outlined" />}
                            </div>
                        ))}
                        {form.vaccinations.length > 2 && (
                            <Button size="small" onClick={() => setShowAllVaccinations(true)} sx={{ textTransform: 'none' }}>View all {form.vaccinations.length} records</Button>
                        )}
                    </div>
                )} */}
            </div>
            <Dialog 
            open={showAllVaccinations}
             onClose={() => setShowAllVaccinations(false)}
             >
                <DialogTitle>Vaccination History</DialogTitle>
                <DialogContent dividers>
                    <List>
                        {/* {form.vaccinations?.slice().reverse().map((vac: any, i: number) => (
                            <ListItem key={i} divider>
                                <ListItemText
                                    primary={vac.vaccineName}
                                    secondary={<><Typography variant="body2" component="span" display="block">Administered: {new Date(vac.administeredDate).toLocaleDateString()}</Typography>{vac.nextDueDate && <Typography variant="body2" component="span" color="primary">Next Due: {new Date(vac.nextDueDate).toLocaleDateString()}</Typography>}</>}
                                />
                            </ListItem>
                        ))} */}
                    </List>
                </DialogContent>
                <DialogActions><Button
                //  onClick={() => setShowAllVaccinations(false)}
                 >Close</Button></DialogActions>
            </Dialog>
        </FormCard>
    );
};