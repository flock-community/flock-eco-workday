import {ExtractJSON, ResourceClient} from "../utils/ResourceClient";
import {PageableClient} from "../utils/PageableClient";
import {addError} from "../hooks/ErrorHook";

export type Project = {
  id: number;
  code: string;
  name: string;
};

// TODO: Naming
export type ProjectFormDto = {
  id?: number;
  code?: string;
  name: string;
}

const path = "/api/projects";

const resourceClient = ResourceClient<string, ProjectFormDto, Project, Project>(path);
const pageableClient = PageableClient<Project, Project>(path);

const findByCode = (code: string) => fetch(`${path}/${code}`)
  .then(json => ExtractJSON<Project>(json))
  .catch(e => addError(e));

export const ProjectClient = {
  ...resourceClient,
  ...pageableClient,
  findByCode
};
