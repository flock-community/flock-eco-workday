import React, {useState} from "react";
import {Card, CardContent, CardHeader} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import ProjectAssignmentList from "./assignments/ProjectAssignmentList";
import IconButton from "@material-ui/core/IconButton";
import CreateIcon from "@material-ui/icons/Create";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  status: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

export default function ProjectListItem({ project, editProject }) {
  const classes = useStyles()
  const [showAssignments, setShowAssignments] = useState(false)

  const toggleShowAssignments = () => setShowAssignments(!showAssignments)

  const handleEdit = () => editProject(project)

  return (
    <Card>
      <CardHeader
        title={project.name}
        subheader={project.code}
        action={
          <IconButton onClick={handleEdit}>
            <CreateIcon/>
          </IconButton>
        }
      />
      <CardContent className={classes.root}>
        <Button variant="contained" onClick={() => toggleShowAssignments()}>
          { showAssignments ? 'Hide current assignments' : 'Show current assignments' }
        </Button>
        { showAssignments &&
          <ProjectAssignmentList project={project}/>
        }
      </CardContent>
    </Card>
  )
}
