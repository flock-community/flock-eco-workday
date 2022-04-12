import { AssignmentFeature } from "./AssignmentFeature";
import React from "react";
import { Box } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { PersonSelector } from "../../components/selector";
import Typography from "@material-ui/core/Typography";
import { usePerson } from "../../hooks/PersonHook";

export default function AssignmentPage() {
  const [person, setPerson] = usePerson();

  function handleChangePerson(it) {
    setPerson(it);
  }

  return (
    <Box>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"AssignmentAuthority.ADMIN"}>
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
            <AssignmentFeature person={person} />
          ) : (
            <Typography variant="caption">No person selected</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
