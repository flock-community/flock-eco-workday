import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  type Cv,
  CvClient,
  type CvSync,
  type CvSyncAction,
  type CvSyncItem,
} from '../../clients/CvClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';
import { DIVERGENCE_WARNING, divergence } from './cvDiff';

/** The buttons of an offer of the base, by kind: take it, and keep the copy's. */
const OFFER_ACTIONS: Record<string, [string, string]> = {
  ADDED: ['Add it here too', 'Leave it out'],
  REMOVED: ['Remove it here too', 'Keep it'],
};
const OFFER_DEFAULT: [string, string] = ["Take the base's", 'Keep this one'];

const percent = (share: number) => `${Math.round(share * 100)}%`;

function Value({ label, value }: { label: string; value?: string | null }) {
  return (
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {label}:{' '}
      </Box>
      {value || <em>empty</em>}
    </Typography>
  );
}

/**
 * How a copy stands against its base: how far it drifted, the changes of the base to
 * take or skip, and the fields it tailored, each of which can go back to the base or
 * into the base. Every other field follows the base by itself.
 */
export function CvSyncPanel({
  copy,
  base,
  canWrite,
  onChanged,
}: {
  copy: Cv;
  base: Cv;
  canWrite: boolean;
  /** After an action: the CVs changed, so load them again. */
  onChanged: () => void;
}) {
  const [sync, setSync] = useState<CvSync | null>(null);
  const [showTailored, setShowTailored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: load again when either is saved
  useEffect(() => {
    if (!copy.code) return;
    let live = true;
    CvClient.sync(copy.code)
      .then((it) => live && setSync(it))
      .catch(
        (err) =>
          live && setError(apiErrorMessage(err, 'The base could not be read')),
      );
    return () => {
      live = false;
    };
  }, [copy.code, copy.updatedAt, base.updatedAt]);

  const act = (item: CvSyncItem, action: CvSyncAction) => {
    if (!copy.code) return;
    setBusy(true);
    setError(null);
    CvClient.syncField(copy.code, item.address, action)
      .then(onChanged)
      .catch((err) => setError(apiErrorMessage(err, 'That did not work')))
      .finally(() => setBusy(false));
  };

  const drift = divergence(base, copy);
  const far = drift > DIVERGENCE_WARNING;

  return (
    <Card className="cv-actions" sx={{ mb: 3 }} data-testid="cv-sync">
      <CardContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography
            variant="body2"
            color={far ? 'warning.main' : 'text.secondary'}
            data-testid="cv-divergence"
          >
            {percent(drift)} of this copy differs from the base
            {far
              ? `: more than ${percent(DIVERGENCE_WARNING)}, check whether it still says the same as the base.`
              : '.'}
          </Typography>

          {sync && sync.offers.length > 0 && (
            <Alert severity="info" data-testid="cv-base-changed">
              <AlertTitle>The base changed</AlertTitle>
              {sync.offers.length === 1
                ? '1 change of the base to look at.'
                : `${sync.offers.length} changes of the base to look at.`}{' '}
              Facts you did not change here were taken over already.
            </Alert>
          )}
          {sync?.offers.map((item) => {
            const [take, keep] = OFFER_ACTIONS[item.kind] ?? OFFER_DEFAULT;
            return (
              <Box key={item.address} data-testid="cv-offer">
                <Typography variant="subtitle2">{item.label}</Typography>
                {item.outdated && (
                  <Typography variant="body2" color="warning.main">
                    You tailored this here; the base changed it since.
                  </Typography>
                )}
                {item.kind !== 'ADDED' && item.kind !== 'REMOVED' && (
                  <>
                    <Value label="Base" value={item.base} />
                    <Value label="This copy" value={item.copy} />
                  </>
                )}
                {item.kind === 'REMOVED' && (
                  <Typography variant="body2">
                    The base no longer has it.
                  </Typography>
                )}
                {canWrite && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={busy}
                      onClick={() => act(item, 'ACCEPT')}
                    >
                      {take}
                    </Button>
                    <Button
                      size="small"
                      disabled={busy}
                      onClick={() => act(item, 'SKIP')}
                    >
                      {keep}
                    </Button>
                  </Stack>
                )}
              </Box>
            );
          })}

          {sync && (
            <>
              <Divider />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  {sync.tailored.length === 0
                    ? 'Everything here follows the base.'
                    : `${sync.tailored.length} ${sync.tailored.length === 1 ? 'field' : 'fields'} tailored in this copy; everything else follows the base.`}
                </Typography>
                {sync.tailored.length > 0 && (
                  <Button
                    size="small"
                    onClick={() => setShowTailored(!showTailored)}
                  >
                    {showTailored ? 'Hide' : 'Show'}
                  </Button>
                )}
              </Stack>
              <Collapse in={showTailored} unmountOnExit>
                <Stack spacing={2}>
                  {sync.tailored.map((item) => (
                    <Box key={item.address} data-testid="cv-tailored">
                      <Typography variant="subtitle2">
                        {item.label}
                        {item.kind === 'HIDDEN' && ' (left out of this copy)'}
                        {item.kind === 'COPY_ONLY' && ' (only in this copy)'}
                      </Typography>
                      {(item.kind === 'TEXT' || item.kind === 'FACT') && (
                        <>
                          <Value label="This copy" value={item.copy} />
                          <Value label="Base" value={item.base} />
                        </>
                      )}
                      {canWrite && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={busy}
                            onClick={() => act(item, 'ACCEPT')}
                          >
                            {item.kind === 'COPY_ONLY'
                              ? 'Remove from this copy'
                              : 'Back to the base'}
                          </Button>
                          {item.kind !== 'HIDDEN' && (
                            <Button
                              size="small"
                              disabled={busy}
                              onClick={() => act(item, 'PROMOTE')}
                            >
                              Use in the base
                            </Button>
                          )}
                        </Stack>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Collapse>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
