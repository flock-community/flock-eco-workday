import { Field } from "formik";
import React, { useState } from "react";
import { DropzoneArea } from "./DropzoneArea";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";

import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import { Typography } from "@mui/material";

type DropzoneAreaFieldProps = {
  name: string;
  endpoint: string;
};

export function DropzoneAreaField({ name, endpoint }: DropzoneAreaFieldProps) {
  const [upload, setUpload] = useState(false);

  const renderField = ({ field: { value }, form: { setFieldValue } }) => {
    const handleDropFile = (files) => {
      setUpload(true);
      return Promise.all(
        files.map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          const opts = {
            method: "POST",
            body: formData,
          };
          return fetch(endpoint, opts)
            .then((res) => res.json())
            .then((uuid) => ({
              name: file.name,
              file: uuid,
            }));
        })
      ).then((res) => {
        setFieldValue(name, [...value, ...res]);
        setUpload(false);
      });
    };

    const handleDeleteFile = (file) => () => {
      setFieldValue(
        name,
        value.filter((it) => it.file !== file)
      );
    };

    const renderFilesItem = (it) => (
      <ListItem
        key={it.file}
        disableGutters
        component="a"
        target="_blank"
        href={`${endpoint}/${it.file}/${it.name}`}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={handleDeleteFile(it.file)}
            size="large"
          >
            <DeleteIcon />
          </IconButton>
        }
      >
        <ListItemAvatar>
          <Avatar>
            <FolderIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={it.name} />
      </ListItem>
    );

    const progressStyle = {
      height: 250,
      border: "dashed",
      borderColor: "#C8C8C8",
      borderWidth: 3,
      backgroundColor: "#F0F0F0",
    };
    const renderProgress = () => (
      <Grid container alignItems="center" style={progressStyle}>
        <Grid item xs={12}>
          <CircularProgress />
        </Grid>
      </Grid>
    );

    const renderEmpty = <Typography>No files found</Typography>;

    return value ? (
      <Grid container spacing={1}>
        <Grid item xs={6}>
          {upload ? (
            renderProgress()
          ) : (
            <DropzoneArea
              maxFileSize={5000000}
              filesLimit={10}
              showPreviewsInDropzone={false}
              acceptedFiles={["image/jpeg", "image/png", "application/pdf"]}
              onDrop={handleDropFile}
            />
          )}
        </Grid>
        <Grid item xs={6}>
          {value.length > 0 ? (
            <List dense>{value.map(renderFilesItem)}</List>
          ) : (
            renderEmpty
          )}
        </Grid>
      </Grid>
    ) : null;
  };

  const validate = () => {
    return upload ? "Uploading files" : null;
  };

  return (
    <Field id={name} name={name} validate={validate}>
      {renderField}
    </Field>
  );
}
