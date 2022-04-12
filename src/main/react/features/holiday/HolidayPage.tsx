import React from "react";
import { HolidayFeature } from "./HolidayFeature";
import PersonLayout from "../../components/layouts/PersonLayout";

export default function HolidayPage() {
  return (
    <PersonLayout requireAuthority={"HolidayAuthority.ADMIN"}>
      {(person) => <HolidayFeature person={person} />}
    </PersonLayout>
  );
}
