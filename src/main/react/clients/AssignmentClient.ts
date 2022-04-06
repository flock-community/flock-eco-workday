import moment from "moment";
import {ExtractJSON, ResourceClient} from "../utils/ResourceClient";
import {PageableClient} from "../utils/PageableClient";
import {addError} from "../hooks/ErrorHook";
import {Client} from "./ClientClient";
import {Person} from "./PersonClient";
import {Project} from "./ProjectClient";

// The type we use in the frontend
export type Assignment = {
  id: number;
  code: string;

  role?: string;
  from: moment.Moment;
  to: moment.Moment | null;
  hourlyRate: number;
  hoursPerWeek: number;

  totalHours?: number;
  totalCosts?: number;

  client: Client;
  person: Person;
  project?: Project
}

// The type we receive from the backend
type AssignmentRaw = {
  id: number;
  code: string;

  role?: string;
  from: string;
  to?: string;
  hourlyRate: number;
  hoursPerWeek: number;

  totalHours?: number;
  totalCosts?: number;

  client: Client;
  person: Person;
  project?: Project
}

// The type we send to the backend
export type AssignmentRequest = {
  role?: string;
  from: string;
  to?: string
  hourlyRate: number;
  hoursPerWeek: number;

  clientCode: string;
  personId: string;
  projectCode?: string;
}

const path = "/api/assignments";

const internalize = (it: AssignmentRaw): Assignment => ({
  ...it,
  from: moment(it.from, "YYYY-MM-DD"),
  to: it.to ? moment(it.to, "YYYY-MM-DD"): null,
});

const resourceClient = ResourceClient<string, AssignmentRequest, Assignment, AssignmentRaw>(path, internalize);
const pageableClient = PageableClient<Assignment, AssignmentRaw>(path, internalize);

export const findByCode = (code: string) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/${code}`, opts)
    .then(json => ExtractJSON<AssignmentRaw>(json))
    .then(data => {
      if (data != null) {
        return data
      } else {
        throw Error("Could not find project")
      }})
    .then(data => internalize(data))
    .catch((e) => addError(e.message));
};

function findAllByPersonId(personId) {
  return fetch(`${path}?personId=${personId}`)
    .then(json => ExtractJSON<AssignmentRaw[]>(json))
    .then((data) => data ? data.map(internalize) : null)
    .catch((e) => addError(e.message));
}

function findAllByProject(project) {
  return fetch(`${path}?projectCode=${project.code}`)
    .then(json => ExtractJSON<AssignmentRaw[]>(json))
    .then((data) => data ? data.map(internalize): null)
    .catch((e) => addError(e.message));
}

export const AssignmentClient = {
  ...resourceClient,
  ...pageableClient,
  findByCode,
  findAllByPersonId,
  findAllByProject,
};
