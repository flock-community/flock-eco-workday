import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  GlobalStyles,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { type Cv, CvClient } from '../../clients/CvClient';
import type { Person } from '../../clients/PersonClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';
import PersonLayout from '../../components/layouts/PersonLayout';
import { useLoginStatus } from '../../hooks/StatusHook';
import type { CvLanguage } from '../../wirespec/model';
import { CvDocument } from './CvDocument';
import type { CvImportState } from './CvEditor';
import { CV_LANGUAGES, cvUrl } from './cvText';

const CV_PRINT_ROOT = 'cv-print-root';

/**
 * When printing, only the CV is left: the app bar, the sidebar, the person selector
 * and the buttons above the CV go, and the sheet loses its on-screen margins so the
 * page margins apply.
 */
const printStyles = (
  <GlobalStyles
    styles={{
      '@media print': {
        '@page': { size: 'A4', margin: '16mm 18mm' },
        body: { background: 'none !important' },
        [`#index > :not(.${CV_PRINT_ROOT})`]: { display: 'none !important' },
        [`#index.content-grid, .${CV_PRINT_ROOT}.content-grid`]: {
          display: 'block !important',
          padding: '0 !important',
        },
        [`.${CV_PRINT_ROOT} > :not(.flow), .${CV_PRINT_ROOT} .cv-actions`]: {
          display: 'none !important',
        },
      },
    }}
  />
);

/**
 * The CV of the current user; an admin picks whose CV to see, like on the other
 * person pages. A person has a CV per language, Dutch and English.
 */
export function CvPersonPage() {
  return (
    <PersonLayout
      requireAuthority="CvAuthority.ADMIN"
      className={CV_PRINT_ROOT}
    >
      {(person: Person) => <PersonCv person={person} />}
    </PersonLayout>
  );
}

function PersonCv({ person }: { person: Person }) {
  const history = useHistory();
  const location = useLocation();
  const status = useLoginStatus();
  const fileInput = useRef<HTMLInputElement>(null);
  // Kept with the person they belong to, so another person's CVs never show
  const [loaded, setLoaded] = useState<{ personId: string; cvs: Cv[] } | null>(
    null,
  );
  const [chosen, setChosen] = useState<CvLanguage | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A link to a CV (?personId=...&language=EN) opens that language for that person
  const params = new URLSearchParams(location.search);
  const linkedPerson = params.get('personId');
  const linked =
    !linkedPerson || linkedPerson === person.uuid
      ? (params.get('language') as CvLanguage | null)
      : null;

  useEffect(() => {
    setChosen(null);
    setError(null);
    CvClient.queryByPage(
      { page: 0, size: CV_LANGUAGES.length, sort: 'language,desc' },
      { personId: person.uuid },
    )
      .then((res) => setLoaded({ personId: person.uuid, cvs: res.list }))
      .catch((err) =>
        setError(apiErrorMessage(err, 'The CV could not be loaded')),
      );
  }, [person.uuid]);

  const cvs = loaded?.personId === person.uuid ? loaded.cvs : null;
  const language: CvLanguage =
    chosen ?? linked ?? cvs?.[0]?.language ?? CV_LANGUAGES[0].value;
  const cv = cvs?.find((it) => it.language === language);
  const languageLabel =
    CV_LANGUAGES.find((it) => it.value === language)?.label ?? language;
  const isMe = status?.personId === person.uuid;

  // The document title becomes the file name when the CV is saved as PDF
  useEffect(() => {
    if (!cv) return;
    const previous = document.title;
    document.title = `CV ${person.fullName} ${language}`;
    return () => {
      document.title = previous;
    };
  }, [cv, person.fullName, language]);

  const newCvUrl = cvUrl(person.uuid, language, status?.personId, '/cvs/new');

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    setImporting(true);
    CvClient.importPdf(file)
      .then((imported) =>
        history.push(newCvUrl, {
          imported,
          fileName: file.name,
        } satisfies CvImportState),
      )
      .catch((err) =>
        setError(apiErrorMessage(err, `${file.name} could not be imported`)),
      )
      .finally(() => setImporting(false));
  };

  return (
    <Box sx={{ pb: 6 }}>
      {printStyles}
      <Stack
        className="cv-actions"
        direction="row"
        spacing={1}
        useFlexGap
        alignItems="center"
        sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1 }}
      >
        <Tabs
          value={language}
          onChange={(_event, value: CvLanguage) => setChosen(value)}
          aria-label="Language of the CV"
        >
          {CV_LANGUAGES.map((it) => (
            <Tab key={it.value} value={it.value} label={it.label} />
          ))}
        </Tabs>
        <Box sx={{ flexGrow: 1 }} />
        {cv && (
          <>
            <Button
              component={RouterLink}
              to={`/cvs/${cv.code}/edit`}
              variant="outlined"
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print or save as PDF
            </Button>
          </>
        )}
      </Stack>
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        aria-label="CV PDF"
        onChange={handleImport}
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {cvs == null && !error && <AlignedLoader />}
      {cv && <CvDocument cv={cv} />}
      {cvs != null && !cv && (
        <Card data-testid="cv-empty">
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
              {isMe
                ? `You have no ${languageLabel} CV yet`
                : `${person.fullName} has no ${languageLabel} CV yet`}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Write it here, or start from the PDF of an existing CV in the
              Flock template.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                component={RouterLink}
                to={newCvUrl}
                variant="contained"
                startIcon={<EditIcon />}
              >
                Write CV
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInput.current?.click()}
                disabled={importing}
              >
                {importing ? 'Importing…' : 'Import PDF'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
