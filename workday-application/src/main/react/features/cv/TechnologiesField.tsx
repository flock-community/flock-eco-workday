import { Autocomplete, Chip, TextField } from '@mui/material';
import { Field, type FieldProps, getIn } from 'formik';
import { useState } from 'react';

type TechnologiesFieldProps = {
  name: string;
  /** Technologies to suggest, typically the ones on the rest of the CV. */
  suggestions: string[];
};

/** Splits typed or pasted text into technologies: "Kotlin, React" is two. */
export const toTechnologies = (values: string[]): string[] => [
  ...new Set(
    values
      .flatMap((it) => it.split(','))
      .map((it) => it.trim())
      .filter((it) => it !== ''),
  ),
];

/**
 * The technologies of an experience, one chip each. Enter, a comma or leaving the
 * field adds what was typed; technologies used elsewhere on the CV are suggested.
 */
export function TechnologiesField({
  name,
  suggestions,
}: TechnologiesFieldProps) {
  const [input, setInput] = useState('');

  return (
    <Field name={name}>
      {({ field, form }: FieldProps<string[]>) => {
        const value = field.value ?? [];
        const error = getIn(form.touched, name) && getIn(form.errors, name);
        const set = (next: string[]) =>
          form.setFieldValue(name, toTechnologies(next));
        return (
          <Autocomplete
            multiple
            freeSolo
            autoSelect
            filterSelectedOptions
            options={suggestions.filter((it) => !value.includes(it))}
            value={value}
            inputValue={input}
            onInputChange={(_event, text, reason) => {
              // A typed comma ends the technology
              if (reason === 'input' && text.includes(',')) {
                set([...value, text]);
                setInput('');
              } else {
                setInput(text);
              }
            }}
            onChange={(_event, next) => set(next as string[])}
            onBlur={() => form.setFieldTouched(name, true)}
            disabled={form.isSubmitting}
            renderValue={(selected, getItemProps) =>
              selected.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return (
                  <Chip key={key} label={option} size="small" {...itemProps} />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Technologies"
                placeholder={
                  value.length === 0 ? 'Kotlin, React, ...' : undefined
                }
                error={Boolean(error)}
                helperText={
                  (typeof error === 'string' && error) ||
                  'Press enter or type a comma after each technology'
                }
              />
            )}
          />
        );
      }}
    </Field>
  );
}
