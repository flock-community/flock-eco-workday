import React from "react";
import { ExpenseFeature } from "./ExpenseFeature";
import PersonLayout from "../../components/layouts/PersonLayout";

export default function ExpensePage() {
  return (
    <PersonLayout requireAuthority={"ExpenseAuthority.ADMIN"}>
      {(person) => <ExpenseFeature person={person} />}
    </PersonLayout>
  );
}
