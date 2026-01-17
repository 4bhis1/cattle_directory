"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Switch,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Button
} from "@mui/material";
import { Close, Search, Person, Phone, Add, Edit } from "@mui/icons-material";
import { apiService } from "@/lib/apiService";
import { useSnackbar } from "@/app/context/SnackbarContext";
import CustomerForm from "./Form/CustomerForm";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  isActive: boolean;
  rateGroup?: string;
  organisation_id?: string;
  defaultMorningRate?: number;
  defaultEveningRate?: number;
  address?: string;
  email?: string;
}

interface ManageCustomersDrawerProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void; // Trigger refresh of parent
}

const ManageCustomersDrawer = ({ open, onClose, onUpdate }: ManageCustomersDrawerProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { showSnackbar } = useSnackbar();
  
  // State for Add Customer view inside drawer
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Fetch customers when drawer opens or when switching back from Add New
  useEffect(() => {
    if (open && !isAddingNew) {
      fetchCustomers();
    }
  }, [open, isAddingNew]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
        // Sort by name
      const response: any = await apiService.get("/customers?sort=name");
      const list = Array.isArray(response) ? response : (response.data || []);
      setCustomers(list);
    } catch (err) {
      console.error("Failed to fetch customers", err);
      showSnackbar("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (customer: Customer) => {
    const newStatus = !customer.isActive;
    // Optimistic update
    setCustomers((prev) =>
      prev.map((c) =>
        c._id === customer._id ? { ...c, isActive: newStatus } : c
      )
    );

    try {
      await apiService.patch(`/customers/${customer._id}`, {
        isActive: newStatus,
      });
      showSnackbar(`Customer ${newStatus ? "Activated" : "Deactivated"}`, "success");
      onUpdate(); // Trigger parent refresh
    } catch (err) {
      // Revert on error
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customer._id ? { ...c, isActive: !newStatus } : c
        )
      );
      showSnackbar("Failed to update status", "error");
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );


  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          className: "w-full sm:w-[600px] bg-slate-50 dark:bg-slate-950 flex flex-col h-full"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Manage Clients
          </h2>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>

        <div className="flex-grow overflow-auto p-0 relative">
          {/* Search & Add Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 flex gap-3">
            <TextField
              placeholder="Search customers..."
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-slate-400" fontSize="small" />
                  </InputAdornment>
                ),
                className: "bg-white dark:bg-slate-900 rounded-xl",
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsAddingNew(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm whitespace-nowrap min-w-[max-content]"
            >
              Add
            </Button>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress size={30} />
            </div>
          ) : (
            <List className="py-0">
              {filteredCustomers.length === 0 ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Person className="text-slate-300 transform scale-150 mb-2" />
                  <p>No customers found.</p>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <ListItem
                    key={customer._id}
                    className="border-b border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 transition-colors bg-white/50 dark:bg-slate-900/50 mb-px"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center mr-4 text-blue-600 dark:text-blue-400">
                      <Person fontSize="small" />
                    </div>
                    <ListItemText
                      primary={
                        <span
                          className={`font-semibold ${
                            !customer.isActive
                              ? "text-slate-400"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {customer.name}
                        </span>
                      }
                      secondary={
                        <div className="flex items-center text-xs text-slate-400 gap-2 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Phone style={{ fontSize: 14 }} />
                            {customer.phone}
                          </div>
                          {customer.rateGroup && (
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px]">
                              Grp {customer.rateGroup}
                            </span>
                          )}
                        </div>
                      }
                    />
                    <div className="flex items-center gap-1">
                      <Tooltip title="Edit Customer">
                        <IconButton 
                            size="small" 
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsAddingNew(true);
                            }}
                            className="text-slate-400 hover:text-blue-600"
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={customer.isActive ? "Deactivate" : "Activate"}
                        placement="left"
                      >
                        <Switch
                          checked={customer.isActive}
                          onChange={() => handleToggleActive(customer)}
                          color="success"
                          size="small"
                        />
                      </Tooltip>
                    </div>
                  </ListItem>
                ))
              )}
            </List>
          )}
        </div>
      </Drawer>

      {/* Add Customer Drawer (Nested/Stacked) */}
      <Drawer
        anchor="right"
        open={isAddingNew}
        onClose={() => { setIsAddingNew(false); setEditingCustomer(null); }}
        PaperProps={{
          className:
            "w-full sm:w-[500px] bg-slate-50 dark:bg-slate-950 flex flex-col h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl",
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </h2>
          <IconButton onClick={() => { setIsAddingNew(false); setEditingCustomer(null); }}>
            <Close />
          </IconButton>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <CustomerForm
            customerId={editingCustomer?._id}
            initialValues={editingCustomer}
            onSuccess={() => {
              setIsAddingNew(false);
              setEditingCustomer(null);
              fetchCustomers(); // Refresh list in parent drawer
              onUpdate(); // Refresh parent SalesForm
            }}
            onClose={() => { setIsAddingNew(false); setEditingCustomer(null); }}
          />
        </div>
      </Drawer>
    </>
  );
};

export default ManageCustomersDrawer;
