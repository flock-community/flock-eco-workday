import NonInternalizingClient from '../utils/NonInternalizingClient';
import type { ProjectForm } from '../wirespec/model';

export type Project = {
  id: number;
  code: string;
  name: string;
};

// Request body is the generated wirespec contract; keep the alias for call sites.
export type ProjectRequest = ProjectForm;

const path = '/api/projects';

const nonInternalizingClient = NonInternalizingClient<ProjectRequest, Project>(
  path,
);

export const ProjectClient = {
  ...nonInternalizingClient,
};
