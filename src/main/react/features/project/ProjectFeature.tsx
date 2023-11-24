import {Box, Card, CardContent, CardHeader} from "@material-ui/core";
import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import ProjectList from "./ProjectList";
import ProjectDialog from "./ProjectDialog";
import {Project} from "../../clients/ProjectClient";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles({
    root: {
        marginTop: 100,
    },
});

type DialogState = {
    open: boolean;
    project?: Project;
};

export function ProjectFeature() {
    const classes = useStyles();
    const [dialog, setDialog] = useState<DialogState>({
        open: false,
        project: undefined,
    });
    const [refresh, setRefresh] = useState(false);

    const openEditDialog = (project: Project) =>
        setDialog({open: true, project: project});

    const closeDialog = () => {
        setDialog({open: false, project: undefined});
        setRefresh(!refresh);
    };

    const newProject = () => {
        setDialog({open: true, project: undefined});
    };

    return (
        <Box className={'flow'} flow-gap={'wide'} style={{paddingBottom: '1.5rem'}}>
            <Card>
                <CardHeader
                    title="Projects"
                    action={
                        <Button onClick={newProject}>
                            <AddIcon/> Add
                        </Button>
                    }
                />
                <CardContent>
                    <ProjectList editProject={openEditDialog} refresh={refresh}/>
                </CardContent>
            </Card>
            <ProjectDialog
                open={dialog.open}
                project={dialog.project}
                closeDialog={closeDialog}
            />
        </Box>
    );
}
