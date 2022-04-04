import moment from "moment";
import {ExtractJSON, ResourceClient} from "../utils/ResourceClient";
import {PageableClient} from "../utils/PageableClient";
import {addError} from "../hooks/ErrorHook";
import {Client} from "./ClientClient";
import {Person} from "./PersonClient";
import {Project} from "./ProjectClient";

export type Assignment = {
  id: number;
  code: string;

  role?: string;
  from: moment.Moment;
  to?: moment.Moment;
  hourlyRate: number;
  hoursPerWeek: number;

  client: Client;
  person: Person;
  project?: Project
}

type AssignmentDto = {
  id: number;
  code: string;

  role?: string;
  from: string;
  to?: string;
  hourlyRate: number;
  hoursPerWeek: number;

  client: Client;
  person: Person;
  project?: Project
}

export type AssignmentFormDto = {
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

const internalize = (it: AssignmentDto): Assignment => ({
  ...it,
  from: moment(it.from, "YYYY-MM-DD"),
  to: it.to ? moment(it.to, "YYYY-MM-DD"): undefined,
});

const resourceClient = ResourceClient<string, AssignmentFormDto, Assignment, AssignmentDto>(path, internalize);
const pageableClient = PageableClient<Assignment, AssignmentDto>(path, internalize);

export const findByCode = (code: string) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/${code}`, opts)
    .then(json => ExtractJSON<AssignmentDto>(json))
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
    .then(json => ExtractJSON<AssignmentDto[]>(json))
    .then((data) => data ? data.map(internalize) : null)
    .catch((e) => addError(e.message));
}

function findAllByProject(project) {
  return fetch(`${path}?projectCode=${project.code}`)
    .then(json => ExtractJSON<AssignmentDto[]>(json))
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
