import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { Field } from 'formik';
import { useState } from 'react';
import { DropzoneArea } from './DropzoneArea';
import type { UploadedFile } from './UploadedFile';

type DropzoneAreaFieldProps = {
  name: string;
  endpoint: string;
};

export function DropzoneAreaField({ name, endpoint }: DropzoneAreaFieldProps) {
  const [upload, setUpload] = useState(false);

  const renderField = ({ field: { value }, form: { setFieldValue } }) => {
    const handleDropFile = (files: File[]) => {
      setUpload(true);
      return Promise.all(
        files.map(async (file: File) => {
          const formData = new FormData();
          formData.append('file', file);
          const opts = {
            method: 'POST',
            body: formData,
          };
          const res = await fetch(endpoint, opts);
          const uuid = await res.json();
          return {
            name: file.name,
            fileReference: uuid,
          } satisfies UploadedFile;
        }),
      ).then((res) => {
        setFieldValue(name, [...value, ...res]);
        setUpload(false);
      });
    };

    const handleDeleteFile = (file) => () => {
      setFieldValue(
        name,
        value.filter((it) => it.file !== file),
      );
    };

    const renderFilesItem = (it: UploadedFile) => {
      return (
        <ListItem
          key={it.fileReference}
          disableGutters
          secondaryAction={
            <>
              <IconButton
                edge="end"
                aria-label="preview"
                component="a"
                href={`${endpoint}/${it.fileReference}/${it.name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenInNewIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={handleDeleteFile(it.fileReference)}
                size="large"
              >
                <DeleteIcon />
              </IconButton>
            </>
          }
        >
          <ListItemAvatar>
            <Avatar>
              <FolderIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <a
                href={`${endpoint}/${it.fileReference}/${it.name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {it.name}
              </a>
            }
          />
        </ListItem>
      );
    };

    const progressStyle = {
      height: 250,
      border: 'dashed',
      borderColor: '#C8C8C8',
      borderWidth: 3,
      backgroundColor: '#F0F0F0',
    };
    const renderProgress = () => (
      <Grid container alignItems="center" style={progressStyle}>
        <Grid size={{ xs: 12 }}>
          <CircularProgress />
        </Grid>
      </Grid>
    );

    const renderEmpty = <Typography>No files found</Typography>;

    return value ? (
      <Grid container spacing={1}>
        <Grid size={{ xs: 6 }}>
          {upload ? (
            renderProgress()
          ) : (
            <DropzoneArea
              maxFileSize={5000000}
              filesLimit={10}
              showPreviewsInDropzone={false}
              acceptedFiles={['image/jpeg', 'image/png', 'application/pdf']}
              onDrop={handleDropFile}
            />
          )}
        </Grid>
        <Grid size={{ xs: 6 }}>
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
    return upload ? 'Uploading files' : null;
  };

  return (
    <Field id={name} name={name} validate={validate}>
      {renderField}
    </Field>
  );
}
