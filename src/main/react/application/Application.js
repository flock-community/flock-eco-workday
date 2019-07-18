import React from 'react'
import {withStyles} from '@material-ui/core'

import {HashRouter, Route} from "react-router-dom";
import {HolidayFeature} from "../holiday/HolidayFeature";
import UserFeature from "@flock-eco/feature-user/src/main/react/user/UserFeature";
import ApplicationLayout from "./ApplicationLayout";
import {EventFeature} from "../event/EventFeature";

const styles = theme => ({});

class Application extends React.Component {


    render() {
        return (<HashRouter>
            <div>
                <ApplicationLayout/>
                <Route path="/" exact component={HolidayFeature}/>
                <Route path="/users" exact component={UserFeature}/>
                <Route path="/events" exact component={EventFeature}/>
            </div>
        </HashRouter>)
    }
}

export default withStyles(styles)(Application)
