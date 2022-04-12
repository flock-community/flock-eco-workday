import React from "react";
import Grid from "@material-ui/core/Grid";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { PersonSelector } from "../../components/selector";
import { Box } from "@material-ui/core";
import { usePerson } from "../../hooks/PersonHook";
import Typography from "@material-ui/core/Typography";
import { ExpenseFeature } from "./ExpenseFeature";

export default function ExpensePage() {
  const [person, setPerson] = usePerson();

  const handleChangePerson = (personId) => {
    if (personId) setPerson(personId);
  };

  return (
    <Box>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"ExpenseAuthority.ADMIN"}>
          <Grid item xs={12}>
            <PersonSelector
              value={person?.uuid}
              onChange={handleChangePerson}
              label="Select person"
              embedded={false}
              multiple={false}
              fullWidth
            />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          {person ? (
            <ExpenseFeature person={person} />
          ) : (
            <Typography variant="caption">No person selected</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
