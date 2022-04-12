import { AssignmentFeature } from "./AssignmentFeature";
import React from "react";
import { Box } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { PersonSelector } from "../../components/selector";
import Typography from "@material-ui/core/Typography";
import { usePerson } from "../../hooks/PersonHook";
import PersonLayout from "../../components/layouts/PersonLayout";
import { PersonFeature } from "../person/PersonFeature";

export default function AssignmentPage() {
  return (
    <PersonLayout requireAuthority={"AssignmentAuthority.ADMIN"}>
      {(person) => <AssignmentFeature person={person} />}
    </PersonLayout>
  );
}
