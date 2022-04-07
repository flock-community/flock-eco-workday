import React, {useEffect, useState} from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import {Card, Grid, Table, TableBody, TableCell, TableContainer, TableRow} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {ConfirmDialog} from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import {Person, PersonClient} from "../../clients/PersonClient";
import {PersonWidget} from "../../components/person-widget/PersonWidget";
import {AlignedLoader} from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import {Feed} from "./widgets/Feed";
import {PersonDialog} from "./PersonDialog";

const useStyle = makeStyles(() => ({
  root: { margin: "-8px" },
  marginLeft: {
    marginLeft: "1rem",
  },
  defaultPadding: {
    padding: "1rem",
  },
}));

export const PersonDetails = (props) => {
  const history = useHistory();
  const { params } = useRouteMatch();
  const [reload, setReload] = useState(false);
  const [person, setPerson] = useState<Person>();
  const [dialog, setDialog] = useState({ edit: false, del: false });
  const classes = useStyle();

  useEffect(() => {
    PersonClient.get(params.personId).then((person) => {
      setPerson(person);
    });
  }, [reload]);

  const handleEditDialog = () => {
    const { edit, del } = dialog;
    setDialog({ edit: !edit, del });
    setReload(!reload);
  };

  const handleDelDialog = () => {
    const { edit, del } = dialog;
    setDialog({ edit, del: !del });
  };

  const handleDelete = () => {
    PersonClient.delete(person!!.uuid).then(() => {
      handleDelDialog();
      history.push("/person");
    });
  };

  if (person === undefined) {
    return <AlignedLoader />;
  }

  return (
    // <Grid container> wrapper is defined @PersonFeature
    <div>
      <Grid container item xs={12} spacing={2} className={classes.root}>
        <Grid item xs={12} sm={4}>
          <PersonWidget person={person} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Card>
            <Feed
              title="User Information"
              onEdit={handleEditDialog}
              onDelete={handleDelDialog}
            />
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th">First name</TableCell>
                    <TableCell>{ person.firstname }</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Last name</TableCell>
                    <TableCell>{ person.lastname }</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Email address</TableCell>
                    <TableCell>{ person.email }</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Active</TableCell>
                    <TableCell>{ person.active ? 'Yes' : 'No' }</TableCell>
                  </TableRow>
                  { person.active ||
                    <TableRow>
                      <TableCell component="th">Last active at</TableCell>
                      <TableCell>{ person.lastActiveAt.toLocaleString() }</TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </TableContainer>

          </Card>
        </Grid>
      </Grid>

      <PersonDialog
        open={dialog.edit}
        onClose={handleEditDialog}
        item={person}
      />
      <ConfirmDialog
        open={dialog.del}
        onConfirm={handleDelete}
        onClose={handleDelDialog}
      >
        Surely you cant be serious? Delete {person.firstname} {person.lastname}
      </ConfirmDialog>
    </div>
  );
};
