import React from "react";
import { SickDayFeature } from "./SickDayFeature";
import PersonPage from "../base/PersonPage";

export default function SickDayPage() {
  return (
    <PersonPage requireAuthority={"SickdayAuthority.ADMIN"}>
      {(person) => <SickDayFeature person={person} />}
    </PersonPage>
  );
}
