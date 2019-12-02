import React, {useEffect, useState} from "react"
import {useRouteMatch} from "react-router-dom"
import {Grid} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import {PersonService} from "./PersonService"
import {PersonWidget} from "./widgets/PersonWidget"
import {useBreadcrumbs} from "../../components/breadcrumb"

const useStyle = makeStyles(() => ({
  root: {margin: "-8px"},
  marginLeft: {
    marginLeft: "1rem",
  },
  defaultPadding: {
    padding: "1rem",
  },
}))

export const PersonDetails = () => {
  const {params, url} = useRouteMatch()
  const [person, setPerson] = useState({})
  const [linkList, setLinkList] = useBreadcrumbs()
  const classes = useStyle()

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    PersonService.getById(params.personId).then(person => {
      const breadcrumbItem = {url, name: `${person.firstname} ${person.lastname}`}
      setLinkList([...linkList, breadcrumbItem])
      setPerson(person)
    })
  }, [])

  return (
    // <Grid container> wrapper is defined @PersonFeature
    <Grid item xs={12} sm={6}>
      <PersonWidget person={person} />
    </Grid>
  )
}

PersonDetails.propTypes = {}
