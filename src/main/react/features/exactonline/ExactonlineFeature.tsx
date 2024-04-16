import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { CardHeader, Container } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import { ExactonlineClient } from "../../clients/ExactonlineClient";
import { ExactonlineListInvoices } from "./ExactonlineListInvoices";
import { Status } from "../../wirespec/Models";

const useStyles = makeStyles({
  root: {
    padding: 20,
  },
});

/**
 * @return {null}
 */
export function ExactonlineFeature() {
  const classes = useStyles();

  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    ExactonlineClient.status().then((it) => setStatus(it));
  }, []);

  if (!status) return null;

  if (status && !status.active) {
    const href = ExactonlineClient.authorizeUrl;
    return (
      <Container className={classes.root}>
        <Card>
          <CardContent>
            <Button
              variant="contained"
              color="primary"
              component="a"
              href={href}
            >
              Exact online login
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }
  return (
    <Container className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="User" />
            <CardContent>
              <Typography>Name: {status.user.fullName}</Typography>
              <Typography>Email: {status.user.email}</Typography>
              <Typography>
                Administration: {status.division.description} (
                {status.division.code}){" "}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Invoices" />
            <ExactonlineListInvoices />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

ExactonlineFeature.propTypes = {};
