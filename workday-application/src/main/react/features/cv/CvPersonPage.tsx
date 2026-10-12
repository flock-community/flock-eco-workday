import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import PrintIcon from '@mui/icons-material/Print';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  GlobalStyles,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import dayjs from 'dayjs';
import {
  type ChangeEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { type Cv, CvClient, type CvRevision } from '../../clients/CvClient';
import type { Person } from '../../clients/PersonClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';
import PersonLayout from '../../components/layouts/PersonLayout';
import { useLoginStatus } from '../../hooks/StatusHook';
import { CvDocument } from './CvDocument';
import type { CvImportState } from './CvEditor';
import { CV_LANGUAGES, cvUrl } from './cvText';

const CV_PRINT_ROOT = 'cv-print-root';
const SAVED_AT = 'DD-MM-YYYY HH:mm';

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
 * The CVs of the current user; an admin picks whose CVs to see, like on the other
 * person pages. A person can have several versions of a CV, each with a name and a
 * history of earlier saves.
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

const languageLabel = (cv: Cv) =>
  CV_LANGUAGES.find((it) => it.value === cv.language)?.label ?? cv.language;

function PersonCv({ person }: { person: Person }) {
  const history = useHistory();
  const location = useLocation();
  const status = useLoginStatus();
  const fileInput = useRef<HTMLInputElement>(null);
  // Kept with the person they belong to, so another person's CVs never show
  const [loaded, setLoaded] = useState<{ personId: string; cvs: Cv[] } | null>(
    null,
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<CvRevision[] | null>(null);
  const [revision, setRevision] = useState<Cv | null>(null);
  const [newMenu, setNewMenu] = useState<HTMLElement | null>(null);
  const [historyMenu, setHistoryMenu] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const me = status?.personId;
  const isMe = me === person.uuid;
  const authorities = status?.authorities ?? [];
  const isAdmin = authorities.includes('CvAuthority.ADMIN');
  // READ and WRITE are about your own CVs; ADMIN covers everybody's
  const canWrite =
    isAdmin || (isMe && authorities.includes('CvAuthority.WRITE'));

  // A link to a CV (?personId=...&cv=...) opens that CV for that person
  const params = new URLSearchParams(location.search);
  const linkedPerson = params.get('personId');
  const linked =
    !linkedPerson || linkedPerson === person.uuid ? params.get('cv') : null;

  useEffect(() => {
    setChosen(null);
    setError(null);
    CvClient.queryByPage(
      { page: 0, size: 100, sort: 'updatedAt,desc' },
      { personId: person.uuid },
    )
      .then((res) => setLoaded({ personId: person.uuid, cvs: res.list }))
      .catch((err) =>
        setError(apiErrorMessage(err, 'The CVs could not be loaded')),
      );
  }, [person.uuid]);

  const cvs = loaded?.personId === person.uuid ? loaded.cvs : null;
  const current =
    cvs?.find((it) => it.code === (chosen ?? linked)) ?? cvs?.[0] ?? null;
  const shown = revision ?? current;

  // Another CV means another history
  // biome-ignore lint/correctness/useExhaustiveDependencies: only reset when the CV changes
  useEffect(() => {
    setRevisions(null);
    setRevision(null);
  }, [current?.code]);

  // The document title becomes the file name when the CV is saved as PDF
  useEffect(() => {
    if (!shown) return;
    const previous = document.title;
    document.title = `CV ${person.fullName} ${shown.name ?? ''}`.trim();
    return () => {
      document.title = previous;
    };
  }, [shown, person.fullName]);

  const newUrl = (params: Record<string, string | undefined> = {}) =>
    cvUrl(person.uuid, me, params, '/cvs/new');

  const openHistory = (event: MouseEvent<HTMLElement>) => {
    const anchor = event.currentTarget;
    if (!current?.code) return;
    CvClient.revisions(current.code)
      .then((list) => {
        setRevisions(list);
        setHistoryMenu(anchor);
      })
      .catch((err) =>
        setError(apiErrorMessage(err, 'The history could not be loaded')),
      );
  };

  const showRevision = (it: CvRevision) => {
    setHistoryMenu(null);
    if (!current?.code) return;
    CvClient.revision(current.code, it.id)
      .then((cv) => setRevision({ ...cv, code: it.id }))
      .catch((err) =>
        setError(apiErrorMessage(err, 'The version could not be loaded')),
      );
  };

  const restoreRevision = () => {
    if (!current?.code || !revision?.code) return;
    setBusy(true);
    CvClient.restore(current.code, revision.code)
      .then((restored) => {
        setLoaded(
          (it) =>
            it && {
              ...it,
              cvs: [
                restored,
                ...it.cvs.filter((cv) => cv.code !== restored.code),
              ],
            },
        );
        setRevision(null);
      })
      .catch((err) =>
        setError(apiErrorMessage(err, 'The version could not be restored')),
      )
      .finally(() => setBusy(false));
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    setBusy(true);
    CvClient.importPdf(file)
      .then((imported) =>
        history.push(newUrl(), {
          imported,
          fileName: file.name,
        } satisfies CvImportState),
      )
      .catch((err) =>
        setError(apiErrorMessage(err, `${file.name} could not be imported`)),
      )
      .finally(() => setBusy(false));
  };

  const newActions = canWrite && (
    <>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={(event) => setNewMenu(event.currentTarget)}
        disabled={busy}
      >
        New version
      </Button>
      <Menu
        anchorEl={newMenu}
        open={Boolean(newMenu)}
        onClose={() => setNewMenu(null)}
      >
        <MenuItem component={RouterLink} to={newUrl()}>
          Empty CV
        </MenuItem>
        {current && (
          <MenuItem
            component={RouterLink}
            to={newUrl({ copyFrom: current.code })}
          >
            Copy of {current.name}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setNewMenu(null);
            fileInput.current?.click();
          }}
        >
          From a PDF…
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <Box sx={{ pb: 6 }}>
      {printStyles}
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

      {cvs != null && current && (
        <Stack
          className="cv-actions"
          direction="row"
          spacing={1}
          useFlexGap
          alignItems="center"
          sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1.5 }}
        >
          <TextField
            select
            size="small"
            label="CV"
            value={current.code}
            onChange={(event) => setChosen(event.target.value)}
            sx={{ minWidth: 260 }}
          >
            {cvs.map((it) => (
              <MenuItem key={it.code} value={it.code}>
                {it.name} · {languageLabel(it)}
              </MenuItem>
            ))}
          </TextField>
          <Button
            startIcon={<HistoryIcon />}
            onClick={openHistory}
            aria-haspopup="menu"
          >
            History
          </Button>
          <Menu
            anchorEl={historyMenu}
            open={Boolean(historyMenu)}
            onClose={() => setHistoryMenu(null)}
          >
            <MenuItem
              selected={!revision}
              onClick={() => {
                setHistoryMenu(null);
                setRevision(null);
              }}
            >
              <ListItemText
                primary="Current version"
                secondary={
                  current.updatedAt
                    ? `Saved ${dayjs(current.updatedAt).format(SAVED_AT)}`
                    : undefined
                }
              />
            </MenuItem>
            {revisions?.map((it) => (
              <MenuItem
                key={it.id}
                selected={revision?.code === it.id}
                onClick={() => showRevision(it)}
              >
                <ListItemText
                  primary={`Saved ${dayjs(it.savedAt).format(SAVED_AT)}`}
                />
              </MenuItem>
            ))}
            {revisions?.length === 0 && (
              <MenuItem disabled>No earlier versions yet</MenuItem>
            )}
          </Menu>
          <Box sx={{ flexGrow: 1 }} />
          {newActions}
          {canWrite && !revision && (
            <Button
              component={RouterLink}
              to={`/cvs/${current.code}/edit`}
              variant="outlined"
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print or save as PDF
          </Button>
        </Stack>
      )}

      {revision && (
        <Alert
          className="cv-actions"
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              {canWrite && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={restoreRevision}
                  disabled={busy}
                >
                  Restore this version
                </Button>
              )}
              <Button
                color="inherit"
                size="small"
                onClick={() => setRevision(null)}
              >
                Back to current
              </Button>
            </Stack>
          }
        >
          You are looking at the version saved{' '}
          {dayjs(revision.updatedAt).format(SAVED_AT)}.
        </Alert>
      )}

      {shown && <CvDocument cv={shown} />}

      {cvs != null && !current && (
        <Card data-testid="cv-empty">
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
              {isMe ? 'You have no CV yet' : `${person.fullName} has no CV yet`}
            </Typography>
            {canWrite ? (
              <>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Write it here, or start from the PDF of an existing CV in the
                  Flock template.
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Button
                    component={RouterLink}
                    to={newUrl()}
                    variant="contained"
                    startIcon={<EditIcon />}
                  >
                    Write CV
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={() => fileInput.current?.click()}
                    disabled={busy}
                  >
                    {busy ? 'Importing…' : 'Import PDF'}
                  </Button>
                </Stack>
              </>
            ) : (
              <Typography color="text.secondary">
                Writing a CV takes the CV write role.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
