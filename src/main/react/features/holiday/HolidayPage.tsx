import React from "react";
import { LeaveDayFeature } from "./LeaveDayFeature";
import PersonLayout from "../../components/layouts/PersonLayout";

export default function HolidayPage() {
  return (
    <PersonLayout requireAuthority={"LeaveDayAuthority.ADMIN"}>
      {(person) => <LeaveDayFeature person={person} />}
    </PersonLayout>
  );
}
