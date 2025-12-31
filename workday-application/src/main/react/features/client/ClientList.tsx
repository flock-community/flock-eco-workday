import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import { CardContent } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Client, ClientClient } from "../../clients/ClientClient";
import { isDefined } from "../../utils/validation";

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

type ClientListProps = {
  reload?: boolean;
  onItemClick?: (item: Client) => void;
};

export function ClientList({ reload, onItemClick }: ClientListProps) {
  const classes = useStyles();

  const [list, setList] = useState<Client[]>([]);

  useEffect(() => {
    ClientClient.findAllByPage({
      page: 0,
      size: 100,
      sort: "name,asc",
    }).then((res) => setList(res.list));
  }, [reload]);

  const handleItem = (it) => () => {
    if (isDefined(onItemClick)) onItemClick(it);
  };

  return (
    <Grid container className={classes.root} spacing={1}>
      {list.map((it) => (
        <Grid size={{ xs: 12 }} key={`clients-${it.code}`}>
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
