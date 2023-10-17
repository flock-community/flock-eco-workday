import React, {useEffect, useState} from "react";
import {
    Box,
    Dialog,
    DialogContent, Divider,
} from "@material-ui/core";
import {DialogHeader} from "../dialog";
import {makeStyles} from "@material-ui/core/styles";
import HolidayIcon from "@material-ui/icons/WbSunny";
import HealingIcon from "@material-ui/icons/Healing";
import EventIcon from "@material-ui/icons/CalendarToday";
import WorkdayIcon from "@material-ui/icons/Work";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import {MoreHoriz, Timeline} from "@material-ui/icons";
import {layoutClasses} from "../../theme/theme-light";

const useStyles = makeStyles((theme) => ({
    flexDataContainer: {
        display: "flex",
        height: '2rem',
        "& > *": {
            flexBasis: "0%",
        }
    },
    dataItemWorkDay: {
        backgroundColor: "#1de8b5",
    },
    dataItemHoliday: {
        backgroundColor: "#42a5f5",
    },
    dataItemSickDay: {
        backgroundColor: "#ef5350",
    },
    dataItemEventDay: {
        backgroundColor: "#fed766",
    },
    dataItemMissing: {
        backgroundColor: "#9e9e9e",
    },
}));

export function MissingHoursDetailDialog({ open, item, onComplete }) {
    const [state, setState] = useState<any>(null);
    const classes = useStyles();
    const layOutClass = layoutClasses();

    useEffect(() => {
        if (open) {
            setState(item);
        }
    }, [open]);

    const handleClose = () => {
        setState(null);
        onComplete();
    }

    return (<>
        <Dialog open={open} onClose={handleClose} maxWidth={"sm"} fullWidth={true} PaperProps={{ square: true }}>
            <DialogHeader onClose={handleClose} icon={<Timeline />}
                          headline={'Missing hours details'} subheadline={ new Date(state?.monthYear).toLocaleString('en-EN', { month: 'long'})} />
            <DialogContent style={{ padding: '32px 24px' }}>
                <Box className={layOutClass.flow}>
                <div className={classes.flexDataContainer}>
                    <div className={classes.dataItemWorkDay} style={{flexGrow: state?.workDays}}></div>
                    <div className={classes.dataItemHoliday} style={{flexGrow: state?.holiDayUsed}}></div>
                    <div className={classes.dataItemSickDay} style={{flexGrow: state?.sickDays}}></div>
                    <div className={classes.dataItemEventDay} style={{flexGrow: state?.event}}></div>
                    <div className={classes.dataItemMissing} style={{flexGrow: state?.missing}}></div>
                </div>

                <List dense={true}>
                    <ListItem>
                        <ListItemIcon style={{ color: '#1de8b5' }}>
                            <WorkdayIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Worked hours"} />
                        <ListItemSecondaryAction>
                            {state?.workDays}
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon style={{ color: '#42a5f5' }}>
                            <HolidayIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"Holiday hours"} />
                        <ListItemSecondaryAction>
                            {state?.holiDayUsed}
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon style={{ color: '#ef5350' }}>
                            <HealingIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Sick hours"} />
                        <ListItemSecondaryAction>
                            {state?.sickDays}
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon style={{ color: '#fed766' }}>
                            <EventIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Event hours"} />
                        <ListItemSecondaryAction>
                            {state?.event}
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon style={{ color: '#9E9E9E' }}>
                            <MoreHoriz />
                        </ListItemIcon>
                        <ListItemText primary={"Missing hours"} />
                        <ListItemSecondaryAction>
                            {state?.missing}
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemIcon />
                        <ListItemText primary={"Total hours"} />
                        <ListItemSecondaryAction>
                            {state?.total}
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                </List>
                </Box>
            </DialogContent>
        </Dialog>
    </>);
}
