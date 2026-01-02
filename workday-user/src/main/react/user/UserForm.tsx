import { Button } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import { Field, FieldArray, Form, Formik } from 'formik';
import { Checkbox, TextField } from 'formik-mui';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import UserClient from './UserClient';

export const USER_FORM_ID = 'user-form-id';

const defaultAuthorities = [
  'WorkDayAuthority.READ',
  'WorkDayAuthority.WRITE',
  'SickdayAuthority.READ',
  'SickdayAuthority.WRITE',
  'EventAuthority.SUBSCRIBE',
  'AssignmentAuthority.READ',
  'ExpenseAuthority.READ',
  'ExpenseAuthority.WRITE',
  'LeaveDayAuthority.READ',
  'LeaveDayAuthority.WRITE',
];

const init = {
  name: '',
  email: '',
  authorities: [],
};

/**
 * @return {null}
 */
export function UserForm({ value, onSummit, ...props }) {
  const [state, setState] = useState(init);
  const [authorities, setAuthorities] = useState<string[] | undefined>(null);

  useEffect(() => {
    if (!props.authorities) {
      UserClient.findAllAuthorities().then(setAuthorities);
    } else {
      setAuthorities(props.authorities);
    }
  }, [props.authorities]);

  useEffect(() => {
    if (value && authorities) {
      setState({
        ...init,
        ...value,
        authorities: authorities.map((it) => value.authorities.includes(it)),
      });
    } else {
      console.log({
        ...init,
        authorities: !authorities ? [] : authorities.map(() => false),
      });
      setState({
        ...init,
        authorities: !authorities ? [] : authorities.map(() => false),
      });
    }
  }, [value, authorities]);

  const handleSubmit = (value) => {
    onSummit?.({
      ...value,
      authorities: authorities
        .map((it, index) => (value.authorities[index] ? it : null))
        .filter((it) => it !== null),
    });
  };

  const validation = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .required('Email is required')
      .email('Enter a valid email'),
    authorities: Yup.array(),
  });

  const handelSetDefaultAuthorities = () => {
    const selectedAuthorities = authorities.map((it) =>
      defaultAuthorities.includes(it),
    );
    console.log(state);
    setState({ ...state, authorities: selectedAuthorities });
  };

  if (!authorities || authorities.length !== state.authorities.length)
    return null;

  return (
    <Formik
      onSubmit={handleSubmit}
      enableReinitialize
      initialValues={state}
      validationSchema={validation}
    >
      <Form id={USER_FORM_ID}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Field fullWidth name="name" label="Name" component={TextField} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Field fullWidth name="email" label="Email" component={TextField} />
          </Grid>

          <Grid size={{ xs: 12 }} textAlign="right">
            <Button onClick={() => handelSetDefaultAuthorities()}>
              Set default authorities
            </Button>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FieldArray
              name="authorities"
              render={(_arrayHelpers) => (
                <FormControl component="fieldset">
                  <FormLabel component="legend">Authorities</FormLabel>
                  <FormGroup>
                    {authorities.map((value, i) => (
                      <FormControlLabel
                        key={`user-form-authorities-${value}`}
                        control={
                          <Field
                            name={`authorities[${i}]`}
                            component={Checkbox}
                            type="checkbox"
                          />
                        }
                        label={value}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
}
