import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {useRouteMatch} from "react-router-dom"
import {Grid} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import {ConfirmDialog} from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog"
import {PersonService} from "./PersonService"
import {PersonWidget} from "../../components/person-widget"
import {useBreadcrumbs} from "../../components/breadcrumb"
import {Feed} from "./widgets/Feed"
import {usePerson} from "./context/PersonContext"
import {PersonDialog} from "./PersonDialog"

const useStyle = makeStyles(() => ({
  root: {margin: "-8px"},
  marginLeft: {
    marginLeft: "1rem",
  },
  defaultPadding: {
    padding: "1rem",
  },
}))

export const PersonDetails = props => {
  const {history} = props
  const {params, url} = useRouteMatch()
  const [reload, setReload] = useState(false)
  const [person, setPerson] = usePerson()
  const [dialog, setDialog] = useState({edit: false, del: false})
  const [linkList, setLinkList] = useBreadcrumbs()
  const classes = useStyle()

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    PersonService.get(params.personCode).then(person => {
      // hacky way to update the breadcrumbs. It only works if the item updated
      // is actually the last item in the list, otherwise it will remove that item
      // but append it to the end of the list
      const breadcrumbItem = {url, name: `${person.firstname} ${person.lastname}`}
      const newBreadcrumb = linkList.filter(item => item.url !== url)
      setLinkList([...newBreadcrumb, breadcrumbItem])
      setPerson(person)
    })
  }, [reload])

  const handleEditDialog = () => {
    const {edit, del} = dialog
    setDialog({edit: !edit, del})
    setReload(!reload)
  }

  const handleDelDialog = () => {
    const {edit, del} = dialog
    setDialog({edit, del: !del})
  }

  const handleDelete = () => {
    PersonService.delete(person.code)
      .then(() => {
        handleDelDialog()
        // remove link to person from linkList after deleting the person
        setLinkList(linkList.filter(link => link.url !== url))
        history.push("/person")
      })
      .catch(err => console.log(err))
  }

  return (
    // <Grid container> wrapper is defined @PersonFeature
    <div>
      <Grid container item xs={12} spacing={2} className={classes.root}>
        <Grid item xs={12} sm={4}>
          <PersonWidget person={person} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <div>
            <Feed
              title="User Information"
              onEdit={handleEditDialog}
              onDelete={handleDelDialog}
            >
              <ul>
                <li>firstname: {person.firstname}</li>
                <li>lastname: {person.lastname}</li>
                <li>email: {person.email}</li>
              </ul>
            </Feed>
          </div>
        </Grid>
      </Grid>

      <PersonDialog open={dialog.edit} onClose={handleEditDialog} item={person} />
      <ConfirmDialog
        open={dialog.del}
        onConfirm={handleDelete}
        onClose={handleDelDialog}
      >
        Surely you cant be serious? Delete {person.firstname} {person.lastname}
      </ConfirmDialog>
    </div>
  )
}

PersonDetails.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
}
