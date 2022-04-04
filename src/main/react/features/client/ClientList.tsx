import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import {CardContent} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {Client, ClientClient} from "../../clients/ClientClient";
import {isDefined} from "../../utils/validation";

const useStyles = makeStyles({
  root: {
    padding: 10,
  },
  fab: {
    position: "absolute",
    bottom: "25px",
    right: "25px",
  },
});

export function ClientList(props) {
  const { reload, onItemClick } = props;
  const classes = useStyles();

  const [list, setList] = useState<Client[]>([]);

  useEffect(() => {
    ClientClient.findAllByPage({ page: 0 }).then((res) => setList(res.list));
  }, [reload]);

  const handleItem = (it) => () => {
    if (isDefined(onItemClick)) onItemClick(it);
  };

  return (
    <Grid container className={classes.root} spacing={1}>
      {list.map((it) => (
        <Grid item xs={12} key={`clients-${it.code}`}>
          <Card onClick={handleItem(it)}>
            <CardContent>
              <Typography variant="h6">{it.name}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

ClientList.propTypes = {
  reload: PropTypes.bool,
  onItemClick: PropTypes.func,
};
