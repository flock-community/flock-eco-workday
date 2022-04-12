import React from "react";
import { SickDayFeature } from "./SickDayFeature";
import PersonLayout from "../../components/layouts/PersonLayout";

export default function SickDayPage() {
  return (
    <PersonLayout requireAuthority={"SickdayAuthority.ADMIN"}>
      {(person) => <SickDayFeature person={person} />}
    </PersonLayout>
  );
}
