import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Collapse,
  Chip,
  Stack,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  UploadFile,
  Delete,
  Add,
} from '@mui/icons-material';
import type {
  BudgetAllocationType,
  DailyTimeAllocation,
} from '../budget/mocks/BudgetAllocationMocks';

export interface ParticipantAllocation {
  personId: string;
  personName: string;
  // Time allocation
  allocationType?: BudgetAllocationType;
  totalHours?: number;
  dailyTimeAllocations?: DailyTimeAllocation[];
  // Money allocation
  amount?: number;
  files?: File[];
  description?: string;
}

interface EventBudgetParticipantRowProps {
  allocation: ParticipantAllocation;
  onChange: (allocation: ParticipantAllocation) => void;
  availableStudyHours: number;
  availableHackHours: number;
  availableStudyMoney: number;
  defaultAllocationType: BudgetAllocationType;
  showDailyBreakdown?: boolean;
}

export function EventBudgetParticipantRow({
  allocation,
  onChange,
  availableStudyHours,
  availableHackHours,
  availableStudyMoney,
  defaultAllocationType,
  showDailyBreakdown = false,
}: EventBudgetParticipantRowProps) {
  const [showDaily, setShowDaily] = useState(showDailyBreakdown);
  const [includeTime, setIncludeTime] = useState(
    allocation.totalHours !== undefined && allocation.totalHours > 0
  );
  const [includeMoney, setIncludeMoney] = useState(
    allocation.amount !== undefined && allocation.amount > 0
  );

  const isStudyType = allocation.allocationType === 'STUDY';
  const timeOverBudget = isStudyType
    ? (allocation.totalHours || 0) > availableStudyHours
    : (allocation.totalHours || 0) > availableHackHours;
  const moneyOverBudget = (allocation.amount || 0) > availableStudyMoney;

  const handleAllocationTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: BudgetAllocationType | null
  ) => {
    if (newType !== null) {
      onChange({
        ...allocation,
        allocationType: newType,
      });
    }
  };

  const handleTotalHoursChange = (value: string) => {
    const hours = value ? parseFloat(value) : 0;
    onChange({
      ...allocation,
      totalHours: hours,
      dailyTimeAllocations: allocation.dailyTimeAllocations || [],
    });
  };

  const handleAmountChange = (value: string) => {
    const amount = value ? parseFloat(value) : 0;
    onChange({
      ...allocation,
      amount,
      files: allocation.files || [],
    });
  };

  const handleDescriptionChange = (value: string) => {
    onChange({
      ...allocation,
      description: value,
    });
  };

  const handleDayChange = (
    index: number,
    field: 'date' | 'hours',
    value: string | number
  ) => {
    const updatedDays = [...(allocation.dailyTimeAllocations || [])];
    updatedDays[index] = {
      ...updatedDays[index],
      [field]: value,
    };

    const totalHours = updatedDays.reduce(
      (sum, day) => sum + (day.hours || 0),
      0
    );

    onChange({
      ...allocation,
      dailyTimeAllocations: updatedDays,
      totalHours,
    });
  };

  const handleAddDay = () => {
    const lastDate =
      allocation.dailyTimeAllocations &&
      allocation.dailyTimeAllocations.length > 0
        ? allocation.dailyTimeAllocations[
            allocation.dailyTimeAllocations.length - 1
          ].date
        : new Date().toISOString().split('T')[0];

    const updatedDays = [
      ...(allocation.dailyTimeAllocations || []),
      { date: lastDate, hours: 8 },
    ];

    onChange({
      ...allocation,
      dailyTimeAllocations: updatedDays,
      totalHours: updatedDays.reduce((sum, day) => sum + day.hours, 0),
    });
  };

  const handleRemoveDay = (index: number) => {
    const updatedDays = (allocation.dailyTimeAllocations || []).filter(
      (_, i) => i !== index
    );
    onChange({
      ...allocation,
      dailyTimeAllocations: updatedDays,
      totalHours: updatedDays.reduce((sum, day) => sum + day.hours, 0),
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      onChange({
        ...allocation,
        files: [...(allocation.files || []), ...newFiles],
      });
      console.log('Files selected:', newFiles.map((f) => f.name));
    }
  };

  const handleRemoveFile = (index: number) => {
    onChange({
      ...allocation,
      files: (allocation.files || []).filter((_, i) => i !== index),
    });
  };

  const handleToggleTime = () => {
    const newIncludeTime = !includeTime;
    setIncludeTime(newIncludeTime);

    if (!newIncludeTime) {
      // Remove time allocation
      onChange({
        ...allocation,
        totalHours: undefined,
        dailyTimeAllocations: undefined,
        allocationType: undefined,
      });
    } else {
      // Add time allocation with defaults
      onChange({
        ...allocation,
        totalHours: 8,
        dailyTimeAllocations: [],
        allocationType: defaultAllocationType,
      });
    }
  };

  const handleToggleMoney = () => {
    const newIncludeMoney = !includeMoney;
    setIncludeMoney(newIncludeMoney);

    if (!newIncludeMoney) {
      // Remove money allocation
      onChange({
        ...allocation,
        amount: undefined,
        files: undefined,
      });
    } else {
      // Add money allocation
      onChange({
        ...allocation,
        amount: 0,
        files: [],
      });
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        mb: 2,
      }}
    >
      {/* Participant header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          {allocation.personName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {includeTime && (
            <Chip
              label={`${allocation.totalHours || 0}h`}
              size="small"
              color={timeOverBudget ? 'warning' : 'default'}
            />
          )}
          {includeMoney && (
            <Chip
              label={`€${(allocation.amount || 0).toLocaleString('nl-NL')}`}
              size="small"
              color={moneyOverBudget ? 'warning' : 'default'}
            />
          )}
        </Box>
      </Box>

      {/* Time Allocation Section */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            Time Allocation
          </Typography>
          <Button size="small" onClick={handleToggleTime}>
            {includeTime ? 'Remove' : 'Add'}
          </Button>
        </Box>

        {includeTime && (
          <Stack spacing={2}>
            {timeOverBudget && (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                Exceeds available {isStudyType ? 'study' : 'hack'} hours by{' '}
                {(
                  (allocation.totalHours || 0) -
                  (isStudyType ? availableStudyHours : availableHackHours)
                ).toFixed(1)}
                h
              </Alert>
            )}

            <ToggleButtonGroup
              value={allocation.allocationType}
              exclusive
              onChange={handleAllocationTypeChange}
              size="small"
              fullWidth
            >
              <ToggleButton value="STUDY">Study Time</ToggleButton>
              <ToggleButton value="HACK">Hack Time</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label="Total Hours"
              type="number"
              value={allocation.totalHours || ''}
              onChange={(e) => handleTotalHoursChange(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
            />

            {/* Daily breakdown toggle */}
            {allocation.dailyTimeAllocations &&
              allocation.dailyTimeAllocations.length > 0 && (
                <>
                  <Button
                    size="small"
                    onClick={() => setShowDaily(!showDaily)}
                    endIcon={showDaily ? <ExpandLess /> : <ExpandMore />}
                  >
                    {showDaily ? 'Hide' : 'Show'} Daily Breakdown
                  </Button>

                  <Collapse in={showDaily}>
                    <Stack spacing={1}>
                      {allocation.dailyTimeAllocations.map((day, index) => (
                        <Box
                          key={index}
                          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                        >
                          <TextField
                            type="date"
                            value={day.date}
                            onChange={(e) =>
                              handleDayChange(index, 'date', e.target.value)
                            }
                            size="small"
                            sx={{ flex: 1 }}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            type="number"
                            value={day.hours}
                            onChange={(e) =>
                              handleDayChange(
                                index,
                                'hours',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            label="Hours"
                            size="small"
                            sx={{ width: 100 }}
                            inputProps={{ min: 0, step: 0.5 }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveDay(index)}
                            disabled={
                              allocation.dailyTimeAllocations?.length === 1
                            }
                          >
                            <Delete fontSize="small" />
                          </IconButton>
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
                    </Stack>
                  </Collapse>
                </>
              )}
          </Stack>
        )}
      </Box>

      {/* Money Allocation Section */}
      {isStudyType && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="body2" fontWeight="medium">
              Money Allocation
            </Typography>
            <Button size="small" onClick={handleToggleMoney}>
              {includeMoney ? 'Remove' : 'Add'}
            </Button>
          </Box>

          {includeMoney && (
            <Stack spacing={2}>
              {moneyOverBudget && (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  Exceeds available study money by €
                  {(
                    (allocation.amount || 0) - availableStudyMoney
                  ).toLocaleString('nl-NL')}
                </Alert>
              )}

              <TextField
                label="Amount (€)"
                type="number"
                value={allocation.amount || ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                label="Description (optional)"
                value={allocation.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={2}
              />

              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFile />}
                  size="small"
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
                {allocation.files && allocation.files.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1 }}
                    flexWrap="wrap"
                  >
                    {allocation.files.map((file, index) => (
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
          )}
        </Box>
      )}
    </Box>
  );
}
