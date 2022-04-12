import React from "react";
import { HolidayFeature } from "./HolidayFeature";
import PersonPage from "../base/PersonPage";

export default function HolidayPage() {
  return (
    <PersonPage requireAuthority={"HolidayAuthority.ADMIN"}>
      {(person) => <HolidayFeature person={person} />}
    </PersonPage>
  );
}
