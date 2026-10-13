import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Avatar, Button, IconButton, Stack, Tooltip } from '@mui/material';
import { Field, type FieldProps } from 'formik';

type PhotoFieldProps = {
  name: string;
};

/** Reads a file as a data URL (`data:image/png;base64,...`), ready to use as an `<img src>`. */
const readAsDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** The person's photo, shown in the header of each of their CVs; removing it sets null. */
export function PhotoField({ name }: PhotoFieldProps) {
  return (
    <Field name={name}>
      {({ field, form }: FieldProps<string | null>) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={field.value || undefined}
            variant="rounded"
            sx={{ width: 56, height: 56 }}
          />
          <Button component="label" startIcon={<AddIcon />}>
            {field.value ? 'Replace photo' : 'Add photo'}
            <input
              hidden
              type="file"
              aria-label="Photo"
              accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) {
                  readAsDataUrl(file).then((url) =>
                    form.setFieldValue(name, url),
                  );
                }
              }}
            />
          </Button>
          {field.value && (
            <Tooltip title="Remove photo">
              <IconButton
                aria-label="Remove photo"
                onClick={() => form.setFieldValue(name, null)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )}
    </Field>
  );
}
