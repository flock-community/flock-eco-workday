import React, {useEffect, useState} from "react";
import ProjectListItem from "./ProjectListItem";
import {ProjectClient} from "../../clients/ProjectClient";

export default function ProjectList({ editProject, refresh }) {
  const [projectList, setProjectList] = useState([])

  useEffect(() => {
    // @ts-ignore
    ProjectClient.all().then(res => setProjectList(res))
  }, [refresh])

  function renderItem(item, key) {
    return (
      <ProjectListItem key={key} project={item} editProject={editProject} />
    )
  }
  return (
    <>
      {projectList.map(renderItem)}
    </>
  )
}
