import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { WarningAmber, UploadFile } from '@mui/icons-material';
import {
  StudyMoneyBudgetAllocation,
  ApprovalStatus,
} from './mocks/BudgetAllocationMocks';

interface StudyMoneyAllocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (allocation: Partial<StudyMoneyBudgetAllocation>) => void;
  allocation?: StudyMoneyBudgetAllocation | null;
  availableBudget: number;
  personName: string;
}

export function StudyMoneyAllocationDialog({
  open,
  onClose,
  onSave,
  allocation,
  availableBudget,
  personName,
}: StudyMoneyAllocationDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const isEdit = !!allocation;
  const isOverBudget =
    typeof amount === 'number' && amount > availableBudget;

  useEffect(() => {
    if (allocation) {
      setDescription(allocation.description || '');
      setAmount(allocation.amount);
      setDate(allocation.date);
      setFiles([]);
    } else {
      // Reset form for new allocation
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setFiles([]);
    }
  }, [allocation, open]);

  const handleSave = () => {
    const allocationData: Partial<StudyMoneyBudgetAllocation> = {
      description,
      amount: typeof amount === 'number' ? amount : 0,
      date,
      status: ApprovalStatus.REQUESTED,
      type: 'StudyMoney',
    };

    console.log('Saving StudyMoneyBudgetAllocation:', allocationData);
    onSave(allocationData);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      console.log('Files selected:', newFiles.map((f) => f.name));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isValid =
    description.trim() !== '' &&
    typeof amount === 'number' &&
    amount > 0 &&
    date !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Study Money Allocation' : 'Add Study Money Allocation'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Budget info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>{personName}</strong>
            </Typography>
            <Typography variant="body2">
              Available budget: €
              {availableBudget.toLocaleString('nl-NL', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Typography>
          </Alert>

          {/* Over budget warning */}
          {isOverBudget && (
            <Alert severity="warning" icon={<WarningAmber />}>
              This amount exceeds your available budget by €
              {((amount as number) - availableBudget).toLocaleString('nl-NL', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              . You can still submit this request for approval.
            </Alert>
          )}

          {/* Description */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
            placeholder="e.g., Online course: Advanced TypeScript Patterns"
          />

          {/* Amount */}
          <TextField
            label="Amount (€)"
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value ? parseFloat(e.target.value) : '')
            }
            fullWidth
            required
            inputProps={{ min: 0, step: 0.01 }}
          />

          {/* Date */}
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          {/* File upload */}
          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFile />}
              fullWidth
            >
              Upload Receipt/Invoice
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </Button>
            {files.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                {files.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => handleRemoveFile(index)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            )}
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Optional: Upload receipts or invoices (PDF, JPG, PNG)
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isValid}
          color={isOverBudget ? 'warning' : 'primary'}
        >
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}