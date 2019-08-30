import React, {useEffect, useState} from "react";
import HolidayClient from "./HolidayClient";
import {Card, Typography} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

export function HolidaySummary(users) {

    const [summary, setSummary] = useState([]);
    const [typeFilter, setTypeFilter] = useState('');
    const typeFilters = ['', 'HOLIDAY', 'SICK_DAY', 'EVENT_DAY'];

    useEffect(() => {
        HolidayClient.getSummary(typeFilter).then(summary => {
            setSummary(summary);
        })

    }, [users, typeFilter]);

    function handleChange(ev) {
        setTypeFilter(ev.target.value)
    }

    function renderMenuItem(item) {
        return (<MenuItem value={item} key={item}>{item}</MenuItem>)
    }

    return (<Grid item xs={12}>
        <Card>
            <CardContent>
                <Typography variant="h6" >Summary</Typography>
                <FormControl fullWidth>
                    <InputLabel>Filter op Type</InputLabel>
                    <Select value={typeFilter} onChange={handleChange}>
                        {typeFilters.map(function (filter) {
                            return renderMenuItem(filter)
                        })}
                    </Select>
                </FormControl>
                <Typography>Total hours: {summary.totalHours}</Typography>
                <Typography>Total days: {summary.totalDays}</Typography>
            </CardContent>
        </Card>
    </Grid>)

}
