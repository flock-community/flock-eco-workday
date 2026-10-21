import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tooltip,
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

type Action = { label: string; hint: string };

/** The buttons of an offer of the base, by kind: take it, and keep the copy's. */
const OFFER_ACTIONS: Record<string, [Action, Action]> = {
  ADDED: [
    {
      label: 'Add it here too',
      hint: 'Add what the base added to this copy as well. It then follows the base.',
    },
    {
      label: 'Leave it out',
      hint: 'Keep it out of this copy. It is not offered again.',
    },
  ],
  REMOVED: [
    {
      label: 'Remove it here too',
      hint: 'The base removed it; remove it from this copy as well.',
    },
    {
      label: 'Keep it',
      hint: 'Keep it in this copy only. It is not offered again.',
    },
  ],
};
const OFFER_DEFAULT: [Action, Action] = [
  {
    label: "Take the base's",
    hint: "Replace this copy's version with the base's. The field then follows the base again.",
  },
  {
    label: 'Keep this one',
    hint: "Keep this copy's version. It stays tailored, and this change of the base is not offered again.",
  },
];

/** The buttons of a field the copy tailored, by kind: back to the base, and into the base. */
const BACK_TO_BASE: Record<string, Action> = {
  COPY_ONLY: {
    label: 'Remove from this copy',
    hint: 'Only this copy has it; remove it from this copy.',
  },
  HIDDEN: {
    label: 'Back to the base',
    hint: 'Put what this copy left out back in. It then follows the base again.',
  },
};
const BACK_TO_BASE_DEFAULT: Action = {
  label: 'Back to the base',
  hint: "Undo the tailoring: this copy gets the base's version again and follows the base from then on.",
};
const USE_IN_BASE: Action = {
  label: 'Use in the base',
  hint: "Put this copy's version in the base, so it is no longer tailored. The base's other copies get it too: facts at once, texts as an offer.",
};

/** A small button explaining itself when hovered. */
function SyncButton({
  action,
  primary,
  disabled,
  onClick,
}: {
  action: Action;
  primary?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip title={action.hint} arrow describeChild>
      {/* A span, so the explanation shows on a disabled button too */}
      <span>
        <Button
          size="small"
          variant={primary ? 'outlined' : undefined}
          disabled={disabled}
          onClick={onClick}
        >
          {action.label}
        </Button>
      </span>
    </Tooltip>
  );
}

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

/** How [copy] stands against its [base], loaded again whenever either is saved. */
export function useCvSync(copy?: Cv | null, base?: Cv | null) {
  const [sync, setSync] = useState<CvSync | null>(null);
  const [error, setError] = useState<string | null>(null);
  const code = copy && base && !copy.base ? copy.code : undefined;

  // biome-ignore lint/correctness/useExhaustiveDependencies: load again when either is saved
  useEffect(() => {
    setSync(null);
    setError(null);
    if (!code) return;
    let live = true;
    CvClient.sync(code)
      .then((it) => live && setSync(it))
      .catch(
        (err) =>
          live && setError(apiErrorMessage(err, 'The base could not be read')),
      );
    return () => {
      live = false;
    };
  }, [code, copy?.updatedAt, base?.updatedAt]);

  return { sync, error, setError };
}

/**
 * In a few words how far a copy drifted from its base and how much it tailored;
 * clicked, it opens or closes the details below.
 */
export function CvSyncChip({
  copy,
  base,
  sync,
  open,
  onToggle,
}: {
  copy: Cv;
  base: Cv;
  sync: CvSync | null;
  open: boolean;
  onToggle: () => void;
}) {
  const drift = divergence(base, copy);
  const tailored = sync?.tailored.length;
  return (
    <Tooltip title={open ? 'Hide the details' : 'Show what this copy tailored'}>
      <Chip
        size="small"
        variant="outlined"
        color={drift > DIVERGENCE_WARNING ? 'warning' : 'default'}
        data-testid="cv-divergence"
        label={`${percent(drift)} different${tailored == null ? '' : ` · ${tailored} tailored`}`}
        onClick={onToggle}
        aria-expanded={open}
        icon={
          <ExpandMoreIcon
            fontSize="small"
            sx={{
              transform: open ? 'rotate(180deg)' : undefined,
              transition: 'transform 160ms ease',
            }}
          />
        }
      />
    </Tooltip>
  );
}

/**
 * The changes of the base for a copy to take or skip and, when [details] are open, how
 * far it drifted and the fields it tailored, each of which can go back to the base or
 * into the base. Every other field follows the base by itself.
 */
export function CvSyncPanel({
  copy,
  base,
  sync,
  error,
  setError,
  canWrite,
  details,
  onChanged,
}: {
  copy: Cv;
  base: Cv;
  sync: CvSync | null;
  error: string | null;
  setError: (error: string | null) => void;
  canWrite: boolean;
  /** Whether to show how far the copy drifted and what it tailored; changes of the base always show. */
  details: boolean;
  /** After an action: the CVs changed, so load them again. */
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

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

  // Without the details, the panel is only there when the base changed
  if (!details && !error && !sync?.offers.length) return null;

  return (
    <Card
      className="cv-actions"
      variant="outlined"
      sx={{ mb: 3 }}
      data-testid="cv-sync"
    >
      <CardContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {details && far && (
            <Alert severity="warning">
              {percent(drift)} of this copy differs from the base, more than{' '}
              {percent(DIVERGENCE_WARNING)}: check whether it still says the
              same as the base.
            </Alert>
          )}

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
                    <SyncButton
                      action={take}
                      primary
                      disabled={busy}
                      onClick={() => act(item, 'ACCEPT')}
                    />
                    <SyncButton
                      action={keep}
                      disabled={busy}
                      onClick={() => act(item, 'SKIP')}
                    />
                  </Stack>
                )}
              </Box>
            );
          })}

          {sync && details && (
            <>
              {sync.offers.length > 0 && <Divider />}
              <Typography variant="body2" color="text.secondary">
                {sync.tailored.length === 0
                  ? 'Everything here follows the base.'
                  : 'Tailored in this copy; everything else follows the base:'}
              </Typography>
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
                        <SyncButton
                          action={
                            BACK_TO_BASE[item.kind] ?? BACK_TO_BASE_DEFAULT
                          }
                          primary
                          disabled={busy}
                          onClick={() => act(item, 'ACCEPT')}
                        />
                        {item.kind !== 'HIDDEN' && (
                          <SyncButton
                            action={USE_IN_BASE}
                            disabled={busy}
                            onClick={() => act(item, 'PROMOTE')}
                          />
                        )}
                      </Stack>
                    )}
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
