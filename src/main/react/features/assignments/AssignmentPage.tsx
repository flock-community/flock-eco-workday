import { AssignmentFeature } from "./AssignmentFeature";
import React from "react";
import PersonLayout from "../../components/layouts/PersonLayout";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";

export default function AssignmentPage() {
  return (
    <PersonLayout requireAuthority={"AssignmentAuthority.ADMIN"}>
      {(person) => <AssignmentFeature person={person}
                                      disableEdit={
                                        !UserAuthorityUtil.hasAuthority("AssignmentAuthority.WRITE")
                                      }/>}
    </PersonLayout>
  );
}
