import {Box, Card, CardContent, CardHeader} from "@material-ui/core";
import React, {useState} from "react";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import {usePerson} from "../../hooks/PersonHook";
import {WorkDayDialog} from "../../features/workday/WorkDayDialog";
import {addError} from "../../hooks/ErrorHook";
import {LeaveDayDialog} from "../../features/holiday/LeaveDayDialog";
import {ExpenseDialog} from "../../features/expense/ExpenseDialog";
import {ExpenseType} from "../../features/expense/ExpenseType";

export function QuickLinks() {
    const [person, setPerson] = usePerson();
    const [value, setValue] = useState<any>()
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
    }

    const handleCLoseWorkdayDialog = () => {
        setWorkDayOpen(false);
        setValue(undefined);
    }

    const openAddLeaveDay = () => {
        setValue(undefined);
        setLeaveDayOpen(true);
    }

    const handleCompleteLeaveDayDialog = () => {
        setLeaveDayOpen(false);
        setValue(undefined);
    }

    const openAddTravelExpense = () => {
        setValue(undefined);
        setTravelExpenseOpen(true);
    }

    const handleCompleteTravelExpenseDialog = () => {
        setValue(undefined);
        setTravelExpenseOpen(false);
    }

    const openAddCostExpense = () => {
        setValue(undefined);
        setCostExpenseOpen(true);}

    const handleCompleteCostExpenseDialog = () => {
        setValue(undefined);
        setCostExpenseOpen(false);}

    return (
    <>
        <Card variant={"outlined"} style={{ borderRadius: 0 }}>
            <CardHeader title={"Quick links"} />
            <CardContent>
                <Box display="flex" justifyContent="space-around">
                    <Button variant={"contained"} startIcon={<AddIcon/>} onClick={openAddWorkDay} >Workday</Button>
                    <Button variant={"contained"} startIcon={<AddIcon/>} onClick={openAddLeaveDay} >Leave day</Button>
                    <Button variant={"contained"} startIcon={<AddIcon/>} onClick={openAddTravelExpense} >Travel expense</Button>
                    <Button variant={"contained"} startIcon={<AddIcon/>} onClick={openAddCostExpense} >Cost expense</Button>
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
    </>
    );
}
