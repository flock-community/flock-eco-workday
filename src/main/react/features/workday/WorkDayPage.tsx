import React from "react";
import { WorkDayFeature } from "./WorkDayFeature";
import PersonPage from "../base/PersonPage";

export default function WorkDayPage() {
  return (
    <PersonPage requireAuthority={"WorkDayAuthority.ADMIN"}>
      {(person) => <WorkDayFeature person={person} />}
    </PersonPage>
  );
}
