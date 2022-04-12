import React from "react";
import PersonPage from "../base/PersonPage";
import { ContractFeature } from "./ContractFeature";

export default function ContractPage() {
  return (
    <PersonPage requireAuthority={"ContractAuthority.ADMIN"}>
      {(person) => <ContractFeature person={person} />}
    </PersonPage>
  );
}
