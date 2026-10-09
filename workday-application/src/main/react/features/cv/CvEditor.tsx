import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Rating,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { Field, FieldArray, Form, Formik, type FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { type Cv, CvClient } from '../../clients/CvClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';
import { MonthPickerField } from '../../components/fields/MonthPickerField';
import { PersonSelectorField } from '../../components/fields/PersonSelectorField';
import { useLoginStatus } from '../../hooks/StatusHook';
import type { CvImportState } from './CvList';
import { CV_LANGUAGES } from './cvText';
import {
  CV_FORM_SCHEMA,
  type CvFormValues,
  emptyExperience,
  emptySkill,
  fromCvImport,
  toCvFormValues,
  toCvRequest,
} from './schema';

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card component="section">
      <CardContent>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ mt: subtitle ? 0 : 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

/**
 * Writes a CV: personal details, profile text and working experience. A new CV can
 * start from a PDF import (passed in the location state by the CV list).
 */
export function CvEditor() {
  const { code } = useParams<{ code?: string }>();
  const history = useHistory();
  const location = useLocation<CvImportState | undefined>();
  const status = useLoginStatus();
  const isAdmin = status?.authorities?.includes('CvAuthority.ADMIN') ?? false;
  const imported = code ? undefined : location.state;

  const [cv, setCv] = useState<Cv | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setError(null);
    if (code) {
      CvClient.get(code)
        .then(setCv)
        .catch((err) =>
          setError(apiErrorMessage(err, 'The CV could not be loaded')),
        );
    }
  }, [code]);

  const initialValues = useMemo<CvFormValues>(() => {
    const defaults = CV_FORM_SCHEMA.getDefault() as CvFormValues;
    if (cv) return toCvFormValues(cv);
    if (imported) {
      const values = fromCvImport(imported.imported);
      return { ...values, personId: values.personId || status?.personId || '' };
    }
    return { ...defaults, personId: status?.personId ?? '' };
  }, [cv, imported, status?.personId]);

  const handleSubmit = (
    values: CvFormValues,
    { setSubmitting }: FormikHelpers<CvFormValues>,
  ) => {
    setError(null);
    const body = toCvRequest(values);
    const request = code ? CvClient.put(code, body) : CvClient.post(body);
    request
      .then((saved) => history.push(`/cvs/${saved.code}`))
      .catch((err) => {
        setError(apiErrorMessage(err, 'The CV could not be saved'));
        setSubmitting(false);
      });
  };

  const handleDelete = () => {
    if (!code) return;
    CvClient.delete(code)
      .then(() => history.push('/cvs'))
      .catch((err) => {
        setDeleteOpen(false);
        setError(apiErrorMessage(err, 'The CV could not be deleted'));
      });
  };

  if (code && !cv) {
    return error ? <Alert severity="error">{error}</Alert> : <AlignedLoader />;
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        {code ? `CV of ${cv?.person?.fullName ?? ''}` : 'New CV'}
      </Typography>
      {imported && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Read from {imported.fileName}
          {imported.imported.name ? ` (${imported.imported.name})` : ''}. Check
          the details below; nothing is stored until you save. The skills are
          not read from the PDF (their stars are images), so add those below.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={CV_FORM_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting }) => (
          <Form>
            <Stack spacing={3}>
              <Section
                title="Details"
                subtitle="Name, e-mail and date of birth come from the person"
              >
                <Grid container spacing={2}>
                  {isAdmin && (
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <PersonSelectorField
                        name="personId"
                        label="Person"
                        fullWidth
                      />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, sm: isAdmin ? 4 : 12 }}>
                    <Field
                      component={TextField}
                      select
                      name="language"
                      label="Language"
                      fullWidth
                    >
                      {CV_LANGUAGES.map((it) => (
                        <MenuItem key={it.value} value={it.value}>
                          {it.label}
                        </MenuItem>
                      ))}
                    </Field>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      component={TextField}
                      name="place"
                      label="Place"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      component={TextField}
                      name="phone"
                      label="Phone"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Section>

              <Section
                title="Profile"
                subtitle="Who you are as an engineer. Separate paragraphs with an empty line."
              >
                <Field
                  component={TextField}
                  name="summary"
                  label="Profile"
                  multiline
                  minRows={6}
                  fullWidth
                />
              </Section>

              <FieldArray name="experiences">
                {({ unshift, remove }) => (
                  <Section
                    title="Working experience"
                    subtitle="Every assignment or job. The CV lists them newest first and counts the months for you."
                  >
                    <Stack spacing={2}>
                      <Box>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => unshift(emptyExperience())}
                        >
                          Add experience
                        </Button>
                      </Box>
                      {values.experiences.map((_, index) => {
                        const prefix = `experiences.${index}`;
                        return (
                          <Card
                            // biome-ignore lint/suspicious/noArrayIndexKey: experiences have no identity until saved
                            key={index}
                            variant="outlined"
                            data-testid="cv-experience"
                          >
                            <CardContent>
                              <Stack
                                direction="row"
                                alignItems="center"
                                sx={{ mb: 2 }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  sx={{ flexGrow: 1 }}
                                >
                                  {values.experiences[index].client ||
                                    values.experiences[index].role ||
                                    'New experience'}
                                </Typography>
                                <Tooltip title="Remove experience">
                                  <IconButton
                                    aria-label="Remove experience"
                                    onClick={() => remove(index)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <MonthPickerField
                                    name={`${prefix}.from`}
                                    label="From"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <MonthPickerField
                                    name={`${prefix}.to`}
                                    label="To"
                                    helperText="Leave empty while this is the current job"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                  <Field
                                    component={TextField}
                                    name={`${prefix}.role`}
                                    label="Role"
                                    fullWidth
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                  <Field
                                    component={TextField}
                                    name={`${prefix}.client`}
                                    label="Client"
                                    fullWidth
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                  <Field
                                    component={TextField}
                                    name={`${prefix}.employer`}
                                    label="Via"
                                    helperText="The employer, e.g. Flock"
                                    fullWidth
                                  />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                  <Field
                                    component={TextField}
                                    name={`${prefix}.technologies`}
                                    label="Technologies"
                                    helperText="Comma separated"
                                    fullWidth
                                  />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                  <Field
                                    component={TextField}
                                    name={`${prefix}.description`}
                                    label="Description"
                                    multiline
                                    minRows={4}
                                    fullWidth
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  </Section>
                )}
              </FieldArray>

              <FieldArray name="skills">
                {({ push, remove }) => (
                  <Section
                    title="Skills"
                    subtitle="Grouped by category on the CV, rated from 1 to 5 stars"
                  >
                    <Stack spacing={2}>
                      {values.skills.map((_, index) => {
                        const prefix = `skills.${index}`;
                        return (
                          <Stack
                            // biome-ignore lint/suspicious/noArrayIndexKey: skills have no identity until saved
                            key={index}
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            alignItems={{ sm: 'center' }}
                            data-testid="cv-skill"
                          >
                            <Field
                              component={TextField}
                              name={`${prefix}.category`}
                              label="Category"
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <Field
                              component={TextField}
                              name={`${prefix}.name`}
                              label="Skill"
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <Field name={`${prefix}.level`}>
                              {({ field, form }) => (
                                <Rating
                                  name={field.name}
                                  value={field.value}
                                  onChange={(_event, value) =>
                                    form.setFieldValue(field.name, value)
                                  }
                                  aria-label={`Level of ${values.skills[index].name || 'skill'}`}
                                />
                              )}
                            </Field>
                            <Tooltip title="Remove skill">
                              <IconButton
                                aria-label="Remove skill"
                                onClick={() => remove(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        );
                      })}
                      <Box>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() =>
                            push(
                              emptySkill(
                                values.skills[values.skills.length - 1]
                                  ?.category ?? '',
                              ),
                            )
                          }
                        >
                          Add skill
                        </Button>
                      </Box>
                    </Stack>
                  </Section>
                )}
              </FieldArray>

              <Section
                title="Education, subjects and languages"
                subtitle="One entry per line"
              >
                <Stack spacing={2}>
                  <Field
                    component={TextField}
                    name="education"
                    label="Education"
                    multiline
                    minRows={2}
                    fullWidth
                  />
                  <Field
                    component={TextField}
                    name="subjects"
                    label="Subjects"
                    multiline
                    minRows={2}
                    fullWidth
                  />
                  <Field
                    component={TextField}
                    name="languages"
                    label="Languages"
                    multiline
                    minRows={2}
                    fullWidth
                  />
                </Stack>
              </Section>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: 'wrap', rowGap: 1 }}
              >
                {code && (
                  <Button color="error" onClick={() => setDeleteOpen(true)}>
                    Delete
                  </Button>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  onClick={() => history.push(code ? `/cvs/${code}` : '/cvs')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
      <ConfirmDialog
        open={deleteOpen}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      >
        <Typography>
          Are you sure you would like to delete this CV of{' '}
          {cv?.person?.fullName}?
        </Typography>
      </ConfirmDialog>
    </Box>
  );
}
