import React from "react";
import { useFormContext } from "../../Form/Form";
import { Security, Delete, AttachFile } from "@mui/icons-material";
import { IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar } from "@mui/material";
import FileUpload from "../../Form/inputs/FileUpload";
import { FormCard, FormCardHeader } from "../../Form/components/FormCard";
import { FormInput, FormNumber } from "../../Form/Form";

const InsuranceSection = () => {
  const { watch, setValue } = useFormContext();
  const insurance = watch("insurance") || {};
  const attachments = insurance.attachments || [];

  const handleUploadSuccess = (fileId: string, url: string) => {
    const newAttachments = [...attachments, { _id: fileId, url, name: `Attachment ${attachments.length + 1}` }];
    setValue("insurance", { ...insurance, attachments: newAttachments }, { shouldDirty: true });
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_: any, i: number) => i !== index);
    setValue("insurance", { ...insurance, attachments: newAttachments }, { shouldDirty: true });
  };

  return (
    <FormCard>
      <FormCardHeader
        title="Cattle Insurance"
        Icon={<Security className="mr-2 text-green-500" />}
      />

      <div className="grid grid-cols-2 gap-6 mb-6">
        <FormInput name="insurance.company" label="Insurance Company" />
        <FormNumber name="insurance.value" label="Insurance Value" />
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Attachments</span>
            <FileUpload onUploadSuccess={handleUploadSuccess} label="Add" multiple />
        </div>
        
        <div className="bg-white">
        {attachments.length > 0 ? (
          <List dense disablePadding>
            {attachments.map((item: any, index: number) => (
              <ListItem
                key={item._id || index}
                divider={index < attachments.length - 1}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => removeAttachment(index)} size="small" className="text-gray-400 hover:text-red-500">
                    <Delete fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                    <AttachFile fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<span className="text-sm text-gray-700">{item.name || `Attachment ${index + 1}`}</span>}
                  secondary={<a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View File</a>}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <div className="p-8 text-center bg-white">
             <p className="text-sm text-gray-400 italic">No attachments added</p>
          </div>
        )}
        </div>
      </div>
    </FormCard>
  );
};

export default InsuranceSection;
