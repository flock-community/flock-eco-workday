import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import type { StudyMoneyAllocationInput, BudgetAllocationFile } from '../../wirespec/model';
import { BudgetAllocationClient } from '../../clients/BudgetAllocationClient';

interface StudyMoneyAllocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  personId?: string;
}

export function StudyMoneyAllocationDialog({
  open,
  onClose,
  onSaved,
  personId,
}: StudyMoneyAllocationDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<BudgetAllocationFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setFiles([]);
      setUploadedFiles([]);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!date || typeof amount !== 'number' || amount <= 0) return;

    setSaving(true);
    setError(null);

    try {
      // Upload files first
      const fileResults: BudgetAllocationFile[] = [...uploadedFiles];
      for (const file of files) {
        const result = await BudgetAllocationClient.uploadFile(file);
        fileResults.push({ name: result.name, file: result.id });
      }

      const input: StudyMoneyAllocationInput = {
        personId: personId ?? '',
        eventCode: undefined,
        date,
        description: description || undefined,
        amount: typeof amount === 'number' ? amount : 0,
        files: fileResults,
      };

      await BudgetAllocationClient.createStudyMoney(input);
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to create study money allocation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create allocation');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isValid =
    typeof amount === 'number' &&
    amount > 0 &&
    date !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Study Money Allocation</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          {/* Description */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="e.g., Online course: Advanced TypeScript Patterns"
          />

          {/* Amount */}
          <TextField
            label="Amount (EUR)"
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
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isValid || saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
