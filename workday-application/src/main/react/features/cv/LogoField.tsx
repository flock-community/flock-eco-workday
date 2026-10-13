import AddIcon from '@mui/icons-material/Add';
import { Autocomplete, Box, Button, Stack, TextField } from '@mui/material';
import { Field, type FieldProps } from 'formik';
import { useState } from 'react';
import { type Logo, LogoClient } from '../../clients/LogoClient';
import { LogoDialog } from './LogoDialog';
import { matchLogo, useLogos } from './logos';

type LogoFieldProps = {
  name: string;
  /** The client of the assignment: a logo by that name is suggested. */
  client: string;
  /** Whether the user may add a logo to the shared collection. */
  canAdd: boolean;
};

function LogoImage({ logo, height }: { logo: Logo; height: number }) {
  return (
    <Box
      component="img"
      src={LogoClient.imageUrl(logo)}
      alt=""
      sx={{ height, width: height * 2, objectFit: 'contain', flexShrink: 0 }}
    />
  );
}

/** Picks the logo to show with an assignment from the shared collection. */
export function LogoField({ name, client, canAdd }: LogoFieldProps) {
  const [logos, reload] = useLogos();
  const [adding, setAdding] = useState(false);

  return (
    <Field name={name}>
      {({ field, form }: FieldProps<string>) => {
        const selected = logos?.find((it) => it.id === field.value) ?? null;
        const suggestion = !field.value
          ? matchLogo(client, logos ?? [])
          : undefined;
        const set = (id: string) => form.setFieldValue(name, id);
        return (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
          >
            <Autocomplete
              sx={{ flexGrow: 1 }}
              options={logos ?? []}
              loading={logos == null}
              value={selected}
              getOptionLabel={(it) => it.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_event, logo) => set(logo?.id ?? '')}
              renderOption={({ key, ...props }, logo) => (
                <Box component="li" key={key} {...props} sx={{ gap: 1.5 }}>
                  <LogoImage logo={logo} height={24} />
                  {logo.name}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Logo"
                  placeholder="None"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: selected ? (
                        <LogoImage logo={selected} height={24} />
                      ) : undefined,
                    },
                  }}
                />
              )}
            />
            {suggestion && (
              <Button
                onClick={() => set(suggestion.id)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Use {suggestion.name}
              </Button>
            )}
            {canAdd && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setAdding(true)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add logo
              </Button>
            )}
            <LogoDialog
              open={adding}
              suggestedName={client}
              onClose={() => setAdding(false)}
              onSaved={(logo) => {
                setAdding(false);
                reload().then(() => set(logo.id));
              }}
            />
          </Stack>
        );
      }}
    </Field>
  );
}
