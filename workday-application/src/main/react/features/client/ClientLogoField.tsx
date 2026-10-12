import BusinessIcon from '@mui/icons-material/Business';
import { Avatar, Box, Button, Stack, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { Field, type FieldProps } from 'formik';
import { type ChangeEvent, useState } from 'react';
import {
  CLIENT_LOGO_ENDPOINT,
  clientLogoUrl,
} from '../../clients/ClientClient';
import type { ClientLogo } from '../../wirespec/model';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 2_000_000;

type ClientLogoFieldProps = {
  name: string;
};

export function ClientLogoField({ name }: ClientLogoFieldProps) {
  const [upload, setUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const renderField = ({
    field: { value },
    form: { setFieldValue },
  }: FieldProps<ClientLogo | undefined>) => {
    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError('Logo must be a png, jpeg, gif or webp image');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError('Logo must be smaller than 2 MB');
        return;
      }
      setUpload(true);
      setUploadError(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(CLIENT_LOGO_ENDPOINT, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          throw new Error(`Upload failed for ${file.name}: ${res.status}`);
        }
        const uuid = await res.json();
        setFieldValue(name, { name: file.name, file: uuid } as ClientLogo);
      } catch (e) {
        console.error(e);
        setUploadError('Logo failed to upload. Please try again.');
      } finally {
        setUpload(false);
      }
    };

    const handleRemove = () => setFieldValue(name, undefined);

    return (
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            variant="rounded"
            src={value ? clientLogoUrl(value) : undefined}
            alt="Client logo"
            sx={{ width: 64, height: 64 }}
            slotProps={{ img: { sx: { objectFit: 'contain' } } }}
          >
            {upload ? <CircularProgress size={24} /> : <BusinessIcon />}
          </Avatar>
          <Button component="label" variant="outlined" disabled={upload}>
            {value ? 'Change logo' : 'Upload logo'}
            <input
              hidden
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleChange}
            />
          </Button>
          {value && (
            <Button onClick={handleRemove} disabled={upload}>
              Remove
            </Button>
          )}
        </Stack>
        {uploadError && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {uploadError}
          </Typography>
        )}
      </Box>
    );
  };

  const validate = () => (upload ? 'Uploading logo' : undefined);

  return (
    <Field name={name} validate={validate}>
      {renderField}
    </Field>
  );
}
