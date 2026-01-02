import { Cloud } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Box, Card, CardContent, CardHeader } from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { ExpenseDialog } from '../../features/expense/ExpenseDialog';
import { LeaveDayDialog } from '../../features/holiday/LeaveDayDialog';
import { WorkDayDialog } from '../../features/workday/WorkDayDialog';
import { addError } from '../../hooks/ErrorHook';
import { usePerson } from '../../hooks/PersonHook';
import { ExpenseType } from '../../models/Expense';

const PREFIX = 'QuickLinks';

const classes = {
  containerWrapper: `${PREFIX}ContainerWrapper`,
  buttonWrapper: `${PREFIX}ButtonWrapper`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
  [`& .${classes.containerWrapper}`]: {
    containerType: 'inline-size',
  },
  [`& .${classes.buttonWrapper}`]: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '1rem',
    '@container (max-width: 500px)': {
      flexDirection: 'column',
    },
  },
});

export function QuickLinks() {
  const [person] = usePerson();
  const [workDayOpen, setWorkDayOpen] = useState(false);
  const [leaveDayOpen, setLeaveDayOpen] = useState(false);
  const [travelExpenseOpen, setTravelExpenseOpen] = useState(false);
  const [costExpenseOpen, setCostExpenseOpen] = useState(false);

  const openAddWorkDay = () => {
    if (person === null) {
      addError('No person selected');
    } else {
      setWorkDayOpen(true);
    }
  };

  const handleCloseWorkdayDialog = () => setWorkDayOpen(false);

  const openAddLeaveDay = () => setLeaveDayOpen(true);
  const handleCompleteLeaveDayDialog = () => setLeaveDayOpen(false);

  const openAddTravelExpense = () => {
    if (person === null) {
      addError('No person selected');
    } else {
      setTravelExpenseOpen(true);
    }
  };

  const handleCompleteTravelExpenseDialog = () => setTravelExpenseOpen(false);

  const openAddCostExpense = () => {
    if (person === null) {
      addError('No person selected');
    } else {
      setCostExpenseOpen(true);
    }
  };

  const handleCompleteCostExpenseDialog = () => setCostExpenseOpen(false);

  return (
    <Root>
      <Card variant={'outlined'} style={{ borderRadius: 0 }}>
        <CardHeader title={'Quick links'} />
        <CardContent className={classes.containerWrapper}>
          <Box className={classes.buttonWrapper}>
            <Button
              variant={'contained'}
              startIcon={<AddIcon />}
              onClick={openAddWorkDay}
            >
              Workday
            </Button>
            <Button
              variant={'contained'}
              startIcon={<AddIcon />}
              onClick={openAddLeaveDay}
            >
              Holiday
            </Button>
            <Button
              variant={'contained'}
              startIcon={<AddIcon />}
              onClick={openAddTravelExpense}
            >
              Travel expense
            </Button>
            <Button
              variant={'contained'}
              startIcon={<AddIcon />}
              onClick={openAddCostExpense}
            >
              Cost expense
            </Button>
            {person?.googleDriveId && (
              <Button
                href={`https://drive.google.com/drive/folders/${person?.googleDriveId}`}
                component="a"
                target={'_blank'}
                rel={'noreferrer'}
                startIcon={<Cloud />}
              >
                Google Drive
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      <WorkDayDialog
        personFullName={person?.fullName}
        open={workDayOpen}
        code={undefined}
        onComplete={handleCloseWorkdayDialog}
      />
      <LeaveDayDialog
        open={leaveDayOpen}
        code={undefined}
        personId={person?.uuid}
        onComplete={handleCompleteLeaveDayDialog}
      />
      <ExpenseDialog
        open={travelExpenseOpen}
        id={undefined}
        personId={person?.uuid}
        personFullName={person?.fullName ?? ''}
        onComplete={handleCompleteTravelExpenseDialog}
        expenseType={ExpenseType.TRAVEL}
      />
      <ExpenseDialog
        open={costExpenseOpen}
        id={undefined}
        personId={person?.uuid}
        personFullName={person?.fullName ?? ''}
        onComplete={handleCompleteCostExpenseDialog}
        expenseType={ExpenseType.COST}
      />
    </Root>
  );
}
