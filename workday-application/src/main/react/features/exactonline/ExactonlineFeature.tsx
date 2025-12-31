import React, { useEffect, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { CardHeader, Container } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import { ExactonlineClient } from "../../clients/ExactonlineClient";
import { ExactonlineListInvoices } from "./ExactonlineListInvoices";

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
        <Grid size={{ xs: 12 }}>
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
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title="Invoices" />
            <ExactonlineListInvoices />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
