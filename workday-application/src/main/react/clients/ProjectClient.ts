import NonInternalizingClient from "../utils/NonInternalizingClient";

export type Project = {
  id: number;
  code: string;
  name: string;
};

export type ProjectRequest = {
  id?: number;
  code?: string;
  name: string;
};

const path = "/api/projects";

const nonInternalizingClient = NonInternalizingClient<ProjectRequest, Project>(
  path
);

export const ProjectClient = {
  ...nonInternalizingClient,
};
