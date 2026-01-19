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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Autocomplete,
  Divider,
} from '@mui/material';
import { WarningAmber, UploadFile, Add, Delete } from '@mui/icons-material';
import {
  BudgetAllocationType,
  ApprovalStatus,
  DailyTimeAllocation,
  Event,
  mockEvents,
} from './mocks/BudgetAllocationMocks';

interface EventBudgetAllocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (allocations: EventAllocationFormData[]) => void;
  personId: string;
  personName: string;
  availableStudyHours: number;
  availableHackHours: number;
  availableStudyMoney: number;
}

interface EventAllocationFormData {
  type: 'StudyTime' | 'HackTime' | 'StudyMoney' | 'FlockMoney';
  eventCode: string;
  eventName: string;
  date: string;
  description: string;
  // For time allocations
  dailyTimeAllocations?: DailyTimeAllocation[];
  totalHours?: number;
  // For money allocations
  amount?: number;
  files?: File[];
}

export function EventBudgetAllocationDialog({
  open,
  onClose,
  onSave,
  personId,
  personName,
  availableStudyHours,
  availableHackHours,
  availableStudyMoney,
}: EventBudgetAllocationDialogProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [allocationType, setAllocationType] = useState<BudgetAllocationType>(
    BudgetAllocationType.STUDY
  );
  const [includeTime, setIncludeTime] = useState(true);
  const [includeMoney, setIncludeMoney] = useState(false);
  const [description, setDescription] = useState('');

  // Time allocation state
  const [dailyTimeAllocations, setDailyTimeAllocations] = useState<
    DailyTimeAllocation[]
  >([]);

  // Money allocation state
  const [amount, setAmount] = useState<number | ''>('');
  const [files, setFiles] = useState<File[]>([]);

  const totalHours = dailyTimeAllocations.reduce(
    (sum, allocation) => sum + allocation.hours,
    0
  );

  const isStudyType = allocationType === BudgetAllocationType.STUDY;
  const isHackType = allocationType === BudgetAllocationType.HACK;

  // Budget validation
  const timeOverBudget = isStudyType
    ? totalHours > availableStudyHours
    : totalHours > availableHackHours;
  const moneyOverBudget =
    typeof amount === 'number' && amount > availableStudyMoney;

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setSelectedEvent(null);
      setAllocationType(BudgetAllocationType.STUDY);
      setIncludeTime(true);
      setIncludeMoney(false);
      setDescription('');
      setDailyTimeAllocations([]);
      setAmount('');
      setFiles([]);
    }
  }, [open]);

  useEffect(() => {
    // When event is selected, set defaults
    if (selectedEvent) {
      // Set default allocation type based on event
      if (selectedEvent.defaultTimeAllocationType) {
        setAllocationType(selectedEvent.defaultTimeAllocationType);
      }

      // Generate daily time allocations based on event dates
      if (selectedEvent.from && selectedEvent.to && includeTime) {
        const eventDays = generateEventDays(
          selectedEvent.from,
          selectedEvent.to
        );
        setDailyTimeAllocations(
          eventDays.map((date) => ({ date, hours: 8 }))
        );
      }
    }
  }, [selectedEvent, includeTime]);

  const generateEventDays = (from: string, to: string): string[] => {
    const days: string[] = [];
    const startDate = new Date(from);
    const endDate = new Date(to);

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      days.push(date.toISOString().split('T')[0]);
    }

    return days;
  };

  const handleAddDay = () => {
    const lastDate =
      dailyTimeAllocations.length > 0
        ? dailyTimeAllocations[dailyTimeAllocations.length - 1].date
        : new Date().toISOString().split('T')[0];

    setDailyTimeAllocations([
      ...dailyTimeAllocations,
      { date: lastDate, hours: 8 },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    setDailyTimeAllocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDayChange = (
    index: number,
    field: 'date' | 'hours',
    value: string | number
  ) => {
    setDailyTimeAllocations((prev) =>
      prev.map((allocation, i) =>
        i === index ? { ...allocation, [field]: value } : allocation
      )
    );
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

  const handleSave = () => {
    if (!selectedEvent) return;

    const allocations: EventAllocationFormData[] = [];
    const baseData = {
      eventCode: selectedEvent.code,
      eventName: selectedEvent.name,
      date: selectedEvent.from,
      description,
    };

    // Add time allocation if selected
    if (includeTime && dailyTimeAllocations.length > 0) {
      const timeType = isStudyType ? 'StudyTime' : 'HackTime';
      allocations.push({
        type: timeType as 'StudyTime' | 'HackTime',
        ...baseData,
        dailyTimeAllocations,
        totalHours,
      });
    }

    // Add money allocation if selected
    if (includeMoney && typeof amount === 'number' && amount > 0) {
      allocations.push({
        type: 'StudyMoney',
        ...baseData,
        amount,
        files,
      });
    }

    console.log('Creating Event Budget Allocations:', allocations);
    onSave(allocations);
    onClose();
  };

  const isValid =
    selectedEvent !== null &&
    ((includeTime && dailyTimeAllocations.length > 0) ||
      (includeMoney && typeof amount === 'number' && amount > 0));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Event Budget Allocation</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Person info */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>{personName}</strong>
            </Typography>
            <Typography variant="body2">
              Available: {availableStudyHours}h study | {availableHackHours}h
              hack | €{availableStudyMoney.toLocaleString('nl-NL')} study money
            </Typography>
          </Alert>

          {/* Event selector */}
          <Autocomplete
            options={mockEvents}
            getOptionLabel={(option) => `${option.name} (${option.code})`}
            value={selectedEvent}
            onChange={(_, newValue) => setSelectedEvent(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Event" required />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.code} • {new Date(option.from).toLocaleDateString('nl-NL')}
                    {option.from !== option.to &&
                      ` - ${new Date(option.to).toLocaleDateString('nl-NL')}`}
                  </Typography>
                </Box>
              </li>
            )}
          />

          {selectedEvent && (
            <>
              <Divider />

              {/* Allocation type selector */}
              <FormControl fullWidth required>
                <InputLabel>Allocation Type</InputLabel>
                <Select
                  value={allocationType}
                  label="Allocation Type"
                  onChange={(e) =>
                    setAllocationType(e.target.value as BudgetAllocationType)
                  }
                >
                  <MenuItem value={BudgetAllocationType.STUDY}>
                    Study Budget
                  </MenuItem>
                  <MenuItem value={BudgetAllocationType.HACK}>
                    Hack Budget
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Description */}
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Additional notes about this allocation"
              />

              <Divider />

              {/* Include time allocation */}
              {isStudyType || isHackType ? (
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1">
                      {isStudyType ? 'Study' : 'Hack'} Time
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setIncludeTime(!includeTime)}
                    >
                      {includeTime ? 'Remove' : 'Add'}
                    </Button>
                  </Box>

                  {includeTime && (
                    <>
                      {timeOverBudget && (
                        <Alert severity="warning" icon={<WarningAmber />} sx={{ mb: 2 }}>
                          This exceeds your available{' '}
                          {isStudyType ? 'study' : 'hack'} hours by{' '}
                          {(
                            totalHours -
                            (isStudyType
                              ? availableStudyHours
                              : availableHackHours)
                          ).toFixed(1)}
                          h
                        </Alert>
                      )}

                      <Stack spacing={1}>
                        {dailyTimeAllocations.map((allocation, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              gap: 1,
                              alignItems: 'center',
                            }}
                          >
                            <TextField
                              type="date"
                              value={allocation.date}
                              onChange={(e) =>
                                handleDayChange(index, 'date', e.target.value)
                              }
                              sx={{ flex: 1 }}
                              InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                              type="number"
                              value={allocation.hours}
                              onChange={(e) =>
                                handleDayChange(
                                  index,
                                  'hours',
                                  parseFloat(e.target.value)
                                )
                              }
                              label="Hours"
                              sx={{ width: 120 }}
                              inputProps={{ min: 0, step: 0.5 }}
                            />
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemoveDay(index)}
                              disabled={dailyTimeAllocations.length === 1}
                            >
                              <Delete fontSize="small" />
                            </Button>
                          </Box>
                        ))}
                        <Button
                          startIcon={<Add />}
                          onClick={handleAddDay}
                          variant="outlined"
                          size="small"
                        >
                          Add Day
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                          Total: <strong>{totalHours}h</strong>
                        </Typography>
                      </Stack>
                    </>
                  )}
                </Box>
              ) : null}

              {/* Include money allocation (only for study) */}
              {isStudyType && (
                <>
                  <Divider />
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">Study Money</Typography>
                      <Button
                        size="small"
                        onClick={() => setIncludeMoney(!includeMoney)}
                      >
                        {includeMoney ? 'Remove' : 'Add'}
                      </Button>
                    </Box>

                    {includeMoney && (
                      <>
                        {moneyOverBudget && (
                          <Alert
                            severity="warning"
                            icon={<WarningAmber />}
                            sx={{ mb: 2 }}
                          >
                            This exceeds your available study money by €
                            {((amount as number) - availableStudyMoney).toLocaleString(
                              'nl-NL'
                            )}
                          </Alert>
                        )}

                        <Stack spacing={2}>
                          <TextField
                            label="Amount (€)"
                            type="number"
                            value={amount}
                            onChange={(e) =>
                              setAmount(
                                e.target.value ? parseFloat(e.target.value) : ''
                              )
                            }
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
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
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ mt: 1 }}
                                flexWrap="wrap"
                              >
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
                          </Box>
                        </Stack>
                      </>
                    )}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isValid}
          color={timeOverBudget || moneyOverBudget ? 'warning' : 'primary'}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
