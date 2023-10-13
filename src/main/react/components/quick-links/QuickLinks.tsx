import {Box, Card, CardContent, CardHeader} from "@material-ui/core";
import React, {useState} from "react";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import {usePerson} from "../../hooks/PersonHook";
import {WorkDayDialog} from "../../features/workday/WorkDayDialog";
import {addError} from "../../hooks/ErrorHook";
import {HolidayDialog} from "../../features/holiday/HolidayDialog";

export function QuickLinks() {
    const [person, setPerson] = usePerson();
    const [value, setValue] = useState<any>()
    const [workDayOpen, setWorkDayOpen] = useState(false);
    const [LeaveDayOpen, setLeaveDayOpen] = useState(false);

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

    const openAddTravelExpense = () => {}

    const openAddCostExpense = () => {}

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
        <HolidayDialog
            open={LeaveDayOpen}
            code={value?.code}
            personId={person?.uuid}
            onComplete={handleCompleteLeaveDayDialog}
        />
    </>
    );
}
