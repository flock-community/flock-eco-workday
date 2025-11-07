import React from "react";
import { WorkDayFeature } from "./WorkDayFeature";
import PersonLayout from "../../components/layouts/PersonLayout";

export default function WorkDayPage() {
  return (
    <PersonLayout requireAuthority={"WorkDayAuthority.ADMIN"}>
      {(person) => <WorkDayFeature person={person} />}
    </PersonLayout>
  );
}
