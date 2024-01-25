import React from "react";
import { SickDayFeature } from "./SickDayFeature";
import PersonLayout from "../../components/layouts/PersonLayout";
import { Person } from "../../clients/PersonClient";

export default function SickDayPage() {
  return (
    <PersonLayout requireAuthority={"SickdayAuthority.ADMIN"}>
      {(person: Person) => <SickDayFeature person={person} />}
    </PersonLayout>
  );
}
