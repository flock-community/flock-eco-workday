import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { Alert, Box, Button, GlobalStyles, Stack } from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { type Cv, CvClient } from '../../clients/CvClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';
import { CvDocument } from './CvDocument';

export const CV_PRINT_ROOT = 'cv-print-root';

/**
 * When printing, only the CV is left: the app bar, the sidebar and the buttons above
 * the CV go, and the sheet loses its on-screen margins so the page margins apply.
 */
const printStyles = (
  <GlobalStyles
    styles={{
      '@media print': {
        '@page': { size: 'A4', margin: '16mm 18mm' },
        body: { background: 'none !important' },
        [`#index > :not(.${CV_PRINT_ROOT})`]: { display: 'none !important' },
        '#index.content-grid': {
          display: 'block !important',
          paddingLeft: '0 !important',
        },
        [`.${CV_PRINT_ROOT} .cv-actions`]: { display: 'none !important' },
      },
    }}
  />
);

/** One CV as it is sent to clients, with buttons to edit and to print it or save it as PDF. */
export function CvPage() {
  const { code } = useParams<{ code: string }>();
  const [cv, setCv] = useState<Cv | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    CvClient.get(code)
      .then(setCv)
      .catch((err) =>
        setError(apiErrorMessage(err, 'The CV could not be loaded')),
      );
  }, [code]);

  // The document title becomes the file name when the CV is saved as PDF
  useEffect(() => {
    if (!cv) return;
    const previous = document.title;
    document.title =
      `CV ${cv.person?.fullName ?? ''} ${cv.language ?? ''}`.trim();
    return () => {
      document.title = previous;
    };
  }, [cv]);

  return (
    <Box className={CV_PRINT_ROOT} sx={{ pb: 6 }}>
      {printStyles}
      <Stack
        className="cv-actions"
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1 }}
      >
        <Button component={RouterLink} to="/cvs" startIcon={<ArrowBackIcon />}>
          All CVs
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          component={RouterLink}
          to={`/cvs/${code}/edit`}
          variant="outlined"
          startIcon={<EditIcon />}
          disabled={!cv}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          disabled={!cv}
        >
          Print or save as PDF
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {!error && (cv ? <CvDocument cv={cv} /> : <AlignedLoader />)}
    </Box>
  );
}
