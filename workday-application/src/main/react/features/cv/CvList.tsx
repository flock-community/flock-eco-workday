import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Alert,
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { DataTable } from '@workday-core/components/DataTable';
import dayjs from 'dayjs';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  CV_PAGE_SIZE,
  type Cv,
  CvClient,
  type CvImport,
} from '../../clients/CvClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';
import { DMY_DATE } from '../../clients/util/DateFormats';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import { CV_LANGUAGES, clientText } from './cvText';

export type CvImportState = {
  imported: CvImport;
  fileName: string;
};

const languageLabel = (cv: Cv) =>
  CV_LANGUAGES.find((it) => it.value === cv.language)?.label ?? cv.language;

/** The latest job on the CV, as a one-line description of it. */
const latest = (cv: Cv) => {
  const [first] = cv.experiences ?? [];
  return first
    ? `${first.role} at ${clientText(first.client, first.employer)}`
    : null;
};

/**
 * The CVs the current user may see: their own, or everybody's for an admin. A CV can
 * be started empty or from a PDF in the Flock CV template.
 */
export function CvList() {
  const history = useHistory();
  const fileInput = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<Cv[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    CvClient.findAllByPage({
      page,
      size: CV_PAGE_SIZE,
      sort: 'person.firstname,asc',
    })
      .then((res) => {
        setList(res.list);
        setCount(res.count);
      })
      .catch((err) =>
        setError(apiErrorMessage(err, 'The CVs could not be loaded')),
      )
      .finally(() => setLoading(false));
  }, [page]);

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    setImporting(true);
    CvClient.importPdf(file)
      .then((imported) =>
        history.push('/cvs/new', {
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
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <TableCard
        title="CVs"
        action={
          <Stack direction="row" spacing={1}>
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              aria-label="CV PDF"
              onChange={handleImport}
            />
            <Button
              startIcon={<UploadFileIcon />}
              onClick={() => fileInput.current?.click()}
              disabled={importing}
            >
              {importing ? 'Importing…' : 'Import PDF'}
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={() => history.push('/cvs/new')}
            >
              Add
            </Button>
          </Stack>
        }
        loading={loading}
      >
        <DataTable
          columns={[
            { header: 'Person' },
            { header: 'Language' },
            { header: 'Latest experience' },
            { header: 'Updated' },
          ]}
          items={list}
          renderRow={(it) => (
            <TableRow
              key={`cvs-${it.code}`}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => history.push(`/cvs/${it.code}`)}
            >
              <TableCell>{it.person?.fullName}</TableCell>
              <TableCell>{languageLabel(it)}</TableCell>
              <TableCell>
                {latest(it) ?? (
                  <Typography variant="body2" color="text.secondary">
                    No experience yet
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {it.updatedAt ? dayjs(it.updatedAt).format(DMY_DATE) : ''}
              </TableCell>
            </TableRow>
          )}
          emptyMessage="No CVs yet. Add one, or import the PDF of an existing CV."
        />
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={CV_PAGE_SIZE}
        changePageCb={setPage}
      />
    </Box>
  );
}
