import React from "react";
import { ExpenseFeature } from "./ExpenseFeature";
import PersonPage from "../base/PersonPage";

export default function ExpensePage() {
  return (
    <PersonPage requireAuthority={"ExpenseAuthority.ADMIN"}>
      {(person) => <ExpenseFeature person={person} />}
    </PersonPage>
  );
}
