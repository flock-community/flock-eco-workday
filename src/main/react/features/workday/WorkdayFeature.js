import React, {useEffect, useState} from 'react'
import {makeStyles} from "@material-ui/core/styles";
import {WorkdayClient} from '../../clients/WorkdayClient.js'

const useStyles = makeStyles({
    root: {
        padding: 20
    },
    fab: {
        position: 'absolute',
        bottom: "25px",
        right: "25px"
    }
});

export function WorkdayFeature() {

    const classes = useStyles();
    
    const [list, setList] = useState([]);

    useEffect(() => {
        WorkdayClient.getWorkday().then(data => setList(data));
    }, []);
    
    function renderItem(item) {
        return (
            <div>yolo {item.id}</div>
        )
    }

    return (<div className={classes.root}>
        <div variant="h2">Yolo</div>
        
        <div>{list && list.map(renderItem)}</div>
    </div>)
}
