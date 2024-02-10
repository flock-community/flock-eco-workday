import { Box, Card, CardContent, CardHeader, Link } from "@material-ui/core";
import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import { usePerson } from "../../hooks/PersonHook";
import { WorkDayDialog } from "../../features/workday/WorkDayDialog";
import { addError } from "../../hooks/ErrorHook";
import { LeaveDayDialog } from "../../features/holiday/LeaveDayDialog";
import { ExpenseDialog } from "../../features/expense/ExpenseDialog";
import { ExpenseType } from "../../features/expense/ExpenseType";
import { Cloud } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  containerWrapper: {
    containerType: "inline-size",
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "1rem",
    "@container (max-width: 500px)": {
      flexDirection: "column",
    },
  },
});

export function QuickLinks() {
  const classes = useStyles();

  const [person, setPerson] = usePerson();
  const [value, setValue] = useState<any>();
  const [workDayOpen, setWorkDayOpen] = useState(false);
  const [leaveDayOpen, setLeaveDayOpen] = useState(false);
  const [travelExpenseOpen, setTravelExpenseOpen] = useState(false);
  const [costExpenseOpen, setCostExpenseOpen] = useState(false);

  const openAddWorkDay = () => {
    if (person === null) {
      addError("No person selected");
    } else {
      setValue(undefined);
      setWorkDayOpen(true);
    }
  };

  const handleCLoseWorkdayDialog = () => {
    setWorkDayOpen(false);
    setValue(undefined);
  };

  const openAddLeaveDay = () => {
    setValue(undefined);
    setLeaveDayOpen(true);
  };

  const handleCompleteLeaveDayDialog = () => {
    setLeaveDayOpen(false);
    setValue(undefined);
  };

  const openAddTravelExpense = () => {
    setValue(undefined);
    setTravelExpenseOpen(true);
  };

  const handleCompleteTravelExpenseDialog = () => {
    setValue(undefined);
    setTravelExpenseOpen(false);
  };

  const openAddCostExpense = () => {
    setValue(undefined);
    setCostExpenseOpen(true);
  };

  const handleCompleteCostExpenseDialog = () => {
    setValue(undefined);
    setCostExpenseOpen(false);
  };

  return (
    <>
      <Card variant={"outlined"} style={{ borderRadius: 0 }}>
        <CardHeader title={"Quick links"} />
        <CardContent className={classes.containerWrapper}>
          <Box className={classes.buttonWrapper}>
            <Button
              variant={"contained"}
              startIcon={<AddIcon />}
              onClick={openAddWorkDay}
            >
              Workday
            </Button>
            <Button
              variant={"contained"}
              startIcon={<AddIcon />}
              onClick={openAddLeaveDay}
            >
              Holiday
            </Button>
            <Button
              variant={"contained"}
              startIcon={<AddIcon />}
              onClick={openAddTravelExpense}
            >
              Travel expense
            </Button>
            <Button
              variant={"contained"}
              startIcon={<AddIcon />}
              onClick={openAddCostExpense}
            >
              Cost expense
            </Button>
            {person?.googleDriveId && (
              <Link
                href={`https://drive.google.com/drive/folders/${person?.googleDriveId}`}
                component={Button}
                target={"_blank"}
                rel={"noreferrer"}
                underline="none"
                startIcon={<Cloud />}
              >
                Google Drive
              </Link>
            )}
          </Box>
        </CardContent>
      </Card>

      <WorkDayDialog
        personFullName={person?.fullName}
        open={workDayOpen}
        code={value?.code}
        onComplete={handleCLoseWorkdayDialog}
      />
      <LeaveDayDialog
        open={leaveDayOpen}
        code={value?.code}
        personId={person?.uuid}
        onComplete={handleCompleteLeaveDayDialog}
      />
      <ExpenseDialog
        open={travelExpenseOpen}
        id={undefined}
        personId={person?.uuid}
        personFullName={person?.fullName ?? ""}
        onComplete={handleCompleteTravelExpenseDialog}
        expenseType={ExpenseType.TRAVEL}
      />
      <ExpenseDialog
        open={costExpenseOpen}
        id={undefined}
        personId={person?.uuid}
        personFullName={person?.fullName ?? ""}
        onComplete={handleCompleteCostExpenseDialog}
        expenseType={ExpenseType.COST}
      />
    </>
  );
}
