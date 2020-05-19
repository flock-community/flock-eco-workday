import {Field} from "formik"
import React, {useState} from "react"
import PropTypes from "prop-types"
import {DropzoneArea} from "material-ui-dropzone"

import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"

import FolderIcon from "@material-ui/icons/Folder"
import DeleteIcon from "@material-ui/icons/Delete"
import Avatar from "@material-ui/core/Avatar"
import IconButton from "@material-ui/core/IconButton"
import Grid from "@material-ui/core/Grid"

export function DropzoneAreaField({name, onChange}) {

  const [upload, setUpload] = useState(false)

  const renderField = ({field: {value}, form: {errors, setFieldValue}}) => {
    const handleDropFile = files => {
      setUpload(true)
      return Promise.all(
        files.map(file => {
          const formData = new FormData()
          formData.append("file", file)
          const opts = {
            method: "POST",
            body: formData,
          }
          return fetch("/api/workdays/sheets", opts)
            .then(res => res.json())
            .then(uuid =>
              setFieldValue(name, [
                ...value,
                {
                  name: file.name,
                  file: uuid,
                },
              ])
            )
        })
      ).then(() => setUpload(false))
    }

    const handleDeleteFile = file => () => {
      setFieldValue(name, value.filter(it => it.file !== file))
    }

    const renderFilesItem = it => (
      <ListItem key={it.file} disableGutters>
        <ListItemAvatar>
          <Avatar>
            <FolderIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={it.name} />
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={handleDeleteFile(it.file)}
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )

    return value ? (
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <DropzoneArea
            filesLimit={10}
            showPreviewsInDropzone={false}
            acceptedFiles={["image/jpeg", "image/png", "application/pdf"]}
            onDrop={handleDropFile}
          />
          {errors[name] && errors[name]}
        </Grid>
        <Grid item xs={6}>
          <List dense>{value.map(renderFilesItem)}</List>
        </Grid>
      </Grid>
    ) : null
  }

  const validate = () => {
    return upload ? "Uploading files" : null
  }

  return (
    <>
      <Field id={name} name={name} render={renderField} validate={validate} />
    </>
  )
}

DropzoneAreaField.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
}
