import React, {useEffect, useState} from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {BudgetSummaryCards} from './BudgetSummaryCards';
import {BudgetAllocationList} from './BudgetAllocationList';
import {
  BudgetAllocationDetails,
  generateMockBudgetDetailsForAllPersons,
  mockApiDelay,
  mockBudgetAllocationDetails,
  StudyMoneyBudgetAllocation,
} from './mocks/BudgetAllocationMocks';
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

interface BudgetAllocationFeatureProps {
  // For admin mode - allow selecting different persons
  isAdmin?: boolean;
  // Current user's person ID
  currentPersonId?: string;
}

export function BudgetAllocationFeature({
                                          isAdmin = false,
                                          currentPersonId = '550e8400-e29b-41d4-a716-446655440000',
                                        }: BudgetAllocationFeatureProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedPersonId, setSelectedPersonId] = useState(currentPersonId);
  const [budgetDetails, setBudgetDetails] = useState<BudgetAllocationDetails>(
    mockBudgetAllocationDetails
  );
  const [loading, setLoading] = useState(false);

  // Mock data for all persons (for admin selector)
  const allPersonsBudgetDetails = generateMockBudgetDetailsForAllPersons();

  // Load budget details when year or person changes
  useEffect(() => {
    const loadBudgetDetails = async () => {
      setLoading(true);
      console.log('Loading budget details for:', {
        personId: selectedPersonId,
        year,
      });

      // Simulate API delay
      await mockApiDelay(300);

      // Find budget details for selected person
      const personDetails = allPersonsBudgetDetails.find(
        (p) => p.personId === selectedPersonId
      );

      if (personDetails) {
        setBudgetDetails(personDetails);
      }

      setLoading(false);
    };

    loadBudgetDetails();
  }, [year, selectedPersonId]);

  const handleCreateStudyMoney = (
    allocation: Partial<StudyMoneyBudgetAllocation>
  ) => {
    console.log('Creating StudyMoneyBudgetAllocation:', allocation);
    // In real implementation, this would call the API
  };

  const handleEditStudyMoney = (allocation: StudyMoneyBudgetAllocation) => {
    console.log('Updating StudyMoneyBudgetAllocation:', allocation);
    // In real implementation, this would call the API
  };

  const handleDeleteStudyMoney = (allocation: StudyMoneyBudgetAllocation) => {
    console.log('Deleting StudyMoneyBudgetAllocation:', allocation.id);
    // In real implementation, this would call the API
  };

  // Generate year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <Card>
      <CardHeader
        title="Budget Allocation"
        action={
          <Button onClick={() => {
          }}>
            <AddIcon/> Add Study Money Budget Allocation
          </Button>
        }
      />
      <CardContent>
        <Container maxWidth="lg" sx={{py: 4}}>
          {/* Header with filters */}
          <Paper sx={{p: 3, mb: 3}}>
            <Stack
              direction={{xs: 'column', sm: 'row'}}
              spacing={2}
              alignItems={{xs: 'stretch', sm: 'center'}}
              justifyContent="space-between"
            >
              <Typography variant="h4">Budget Allocation</Typography>

              <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                {/* Year selector */}
                <FormControl sx={{minWidth: 120}}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={year}
                    label="Year"
                    onChange={(e) => setYear(e.target.value as number)}
                  >
                    {yearOptions.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Person selector (admin only) */}
                {isAdmin && (
                  <FormControl sx={{minWidth: 200}}>
                    <InputLabel>Person</InputLabel>
                    <Select
                      value={selectedPersonId}
                      label="Person"
                      onChange={(e) => setSelectedPersonId(e.target.value)}
                    >
                      {allPersonsBudgetDetails.map((person) => (
                        <MenuItem key={person.personId} value={person.personId}>
                          {person.personName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Stack>

            {/* Person info */}
            <Box sx={{mt: 2}}>
              <Typography variant="subtitle1" color="text.secondary">
                {budgetDetails.personName}
              </Typography>
            </Box>
          </Paper>

          {/* Budget summary cards */}
          {!loading && <BudgetSummaryCards summary={budgetDetails.summary}/>}

          {/* Allocation details */}
          {!loading && (
            <BudgetAllocationList
              allocations={budgetDetails.allocations}
              availableStudyMoney={budgetDetails.summary.studyMoney.available}
              personName={budgetDetails.personName}
              hasWritePermission={isAdmin}
              onCreateStudyMoney={handleCreateStudyMoney}
              onEditStudyMoney={handleEditStudyMoney}
              onDeleteStudyMoney={handleDeleteStudyMoney}
            />
          )}

          {/* Loading state */}
          {loading && (
            <Box sx={{textAlign: 'center', py: 4}}>
              <Typography variant="body1" color="text.secondary">
                Loading budget details...
              </Typography>
            </Box>
          )}
        </Container>
      </CardContent>
    </Card>
  )
}
