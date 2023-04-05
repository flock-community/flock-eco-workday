import { AssignmentFeature } from "./AssignmentFeature";
import React from "react";
import PersonLayout from "../../components/layouts/PersonLayout";

export default function AssignmentPage() {
  return (
    <PersonLayout requireAuthority={"AssignmentAuthority.ADMIN"}>
      {(person) => <AssignmentFeature person={person} />}
    </PersonLayout>
  );
}
