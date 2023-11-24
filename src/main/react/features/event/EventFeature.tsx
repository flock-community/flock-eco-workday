import React, {useState} from "react";
import {EventDialog} from "./EventDialog";
import {EventList} from "./EventList";
import {Box, Card, CardContent, CardHeader} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";

export function EventFeature() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<any>(null);

    function handleCompleteDialog() {
        setReload(!reload);
        setOpen(false);
        setState(null);
    }

    function handleClickAdd() {
        setState(null);
        setOpen(true);
    }

    function handleClickRow(item) {
        setState(item);
        setOpen(true);
    }

    return (
        <Box className={'flow'} flow-gap={'wide'} style={{paddingBottom: '1.5rem'}}>
            <Card>
                <CardHeader
                    title="Events"
                    action={
                        <Button onClick={handleClickAdd}>
                            <AddIcon/> Add
                        </Button>
                    }
                />
                <CardContent>
                    <EventList onClickRow={handleClickRow} refresh={reload}/>
                </CardContent>
            </Card>
            <EventDialog
                open={open}
                code={state && state.code}
                onComplete={handleCompleteDialog}
            />
        </Box>
    );
}

EventFeature.propTypes = {};
