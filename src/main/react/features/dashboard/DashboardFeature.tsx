import React, {useState} from "react";
import Card from "@material-ui/core/Card";
import {Box, CardContent, MenuItem, Select} from "@material-ui/core";
import CardHeader from "@material-ui/core/CardHeader";
import {LeaveDaysPerPersonChart} from "../../components/charts/LeaveDaysPerPersonChart";
import {SickdayPerPersonChart} from "../../components/charts/SickdayPerPersonChart";
import {RevenuePerClientTable} from "../../components/charts/RevenuePerClientTable";
import {TotalPerMonthChart} from "../../components/charts/TotalPerMonthChart";
import {AverageHoursPerDayChart} from "../../components/charts/AverageHoursPerDayChart";
import {InternalOverviewChart} from "../../components/charts/InternalOverviewChart";
import {ExternalOverviewChart} from "../../components/charts/ExternalOverviewChart";
import {ManagementOverviewChart} from "../../components/charts/ManagementOverviewChart";
import {GrossMarginTable} from "../../components/tables/GrossMarginTable";
import dayjs from "dayjs";

const CHART_HEIGHT = 200;

export function DashboardFeature() {
    const startYear = 2019;
    const now = dayjs();
    const [year, setYear] = useState<number>(now.year());

    return (
        <Box className={'flow'} flow-gap={'wide'} style={{paddingBottom: '1.5rem'}}>
            <Card>
                <CardHeader title="Year"/>
                <CardContent>
                    <Select
                        value={year.toString()}
                        onChange={(e) =>
                            setYear(parseInt(e.target.value as string, 10))
                        }
                    >
                        {Array.from(Array(now.year() - startYear + 1).keys())
                            .map((i) => String(startYear + i))
                            .map((it) => (
                                <MenuItem key={it} value={it}>
                                    {it}
                                </MenuItem>
                            ))}
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Actual cost revenue"/>
                <CardContent>
                    <div style={{height: CHART_HEIGHT * 2}}>
                        <TotalPerMonthChart year={year}/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Average hours per day"/>
                <CardContent>
                    <div style={{height: CHART_HEIGHT * 2}}>
                        <AverageHoursPerDayChart year={year}/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Internal overview"/>
                <CardContent>
                    <div style={{height: CHART_HEIGHT * 2}}>
                        <InternalOverviewChart year={year}/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="External overview"/>
                <CardContent>
                    <div style={{height: CHART_HEIGHT * 2}}>
                        <ExternalOverviewChart year={year}/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Management overview"/>
                <CardContent>
                    <div style={{height: CHART_HEIGHT * 2}}>
                        <ManagementOverviewChart year={year}/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Gross revenue per client"/>
                <CardContent>
                    <RevenuePerClientTable year={year}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Holiday"/>
                <CardContent>
                    <LeaveDaysPerPersonChart year={year}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Sickday"/>
                <CardContent>
                    <SickdayPerPersonChart year={year}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader title="Gross margin"/>
                <CardContent>
                    <GrossMarginTable year={year}/>
                </CardContent>
            </Card>

        </Box>
    );
}
