import {
  Alert,
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  type Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import dayjs from 'dayjs';
import { Fragment, type ReactNode, useEffect, useMemo, useState } from 'react';
import { type Cv, CvClient, type CvRevision } from '../../clients/CvClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';
import {
  type ChangeKind,
  type CvDiff,
  diffCv,
  type ExperienceDiff,
  type FieldDiff,
  type SkillDiff,
  type TextDiff,
} from './cvDiff';

const SAVED_AT = 'DD-MM-YYYY HH:mm';
const CURRENT = 'current';

export type DiffMode = 'inline' | 'side-by-side';
type Side = 'before' | 'after';

const MODE_KEY = 'cv-compare-mode';

const storedMode = (): DiffMode => {
  try {
    return localStorage.getItem(MODE_KEY) === 'side-by-side'
      ? 'side-by-side'
      : 'inline';
  } catch {
    return 'inline';
  }
};

/**
 * Shows the changes between two versions of a CV from its history, field by field
 * and section by section: inline, with the removed text struck through and the added
 * text marked, or side by side, the older version left and the newer one right.
 */
export function CvCompare({
  current,
  from: initialFrom,
}: {
  current: Cv;
  /** The id of the earlier version to start from; the latest one by default. */
  from?: string;
}) {
  const [revisions, setRevisions] = useState<CvRevision[] | null>(null);
  const [from, setFrom] = useState<string | null>(initialFrom ?? null);
  const [to, setTo] = useState<string>(CURRENT);
  const [loaded, setLoaded] = useState<Record<string, Cv>>({});
  const [mode, setMode] = useState<DiffMode>(storedMode);
  const [onlyChanges, setOnlyChanges] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const code = current.code;

  useEffect(() => {
    if (!code) return;
    setRevisions(null);
    setLoaded({});
    CvClient.revisions(code)
      .then((list) => {
        setRevisions(list);
        setFrom((it) => it ?? list[0]?.id ?? null);
      })
      .catch((err) =>
        setError(apiErrorMessage(err, 'The history could not be loaded')),
      );
  }, [code]);

  // Load the picked versions that are not loaded yet
  useEffect(() => {
    if (!code) return;
    for (const id of [from, to]) {
      if (!id || id === CURRENT || loaded[id]) continue;
      CvClient.revision(code, id)
        .then((cv) => setLoaded((it) => ({ ...it, [id]: cv })))
        .catch((err) =>
          setError(apiErrorMessage(err, 'The version could not be loaded')),
        );
    }
  }, [code, from, to, loaded]);

  const version = (id: string | null) =>
    id === CURRENT ? current : id ? loaded[id] : undefined;
  const before = version(from);
  const after = version(to);

  const diff = useMemo(
    () => (before && after ? diffCv(before, after) : null),
    [before, after],
  );

  const changeMode = (value: DiffMode | null) => {
    if (!value) return;
    setMode(value);
    try {
      localStorage.setItem(MODE_KEY, value);
    } catch {
      // Then the choice is only remembered on this page
    }
  };

  const options = [
    {
      id: CURRENT,
      label: current.updatedAt
        ? `Current version (saved ${dayjs(current.updatedAt).format(SAVED_AT)})`
        : 'Current version',
    },
    ...(revisions ?? []).map((it) => ({
      id: it.id,
      label: `Saved ${dayjs(it.savedAt).format(SAVED_AT)}`,
    })),
  ];

  const picker = (
    label: string,
    value: string | null,
    onChange: (value: string) => void,
  ) => (
    <TextField
      select
      size="small"
      label={label}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      sx={{ minWidth: 260 }}
    >
      {options.map((it) => (
        <MenuItem key={it.id} value={it.id}>
          {it.label}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Box data-testid="cv-compare">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {revisions == null && !error && <AlignedLoader />}
      {revisions?.length === 0 && (
        <Alert severity="info">
          This CV has no earlier versions yet. Once it has been saved again, you
          can compare the versions here.
        </Alert>
      )}
      {revisions != null && revisions.length > 0 && (
        <>
          <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            alignItems="center"
            sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1.5 }}
          >
            {picker('From', from, setFrom)}
            {picker('To', to, setTo)}
            <Box sx={{ flexGrow: 1 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={onlyChanges}
                  onChange={(event) => setOnlyChanges(event.target.checked)}
                />
              }
              label="Only changes"
            />
            <ToggleButtonGroup
              size="small"
              exclusive
              value={mode}
              onChange={(_, value) => changeMode(value)}
              aria-label="Show the changes"
            >
              <ToggleButton value="inline">Inline</ToggleButton>
              <ToggleButton value="side-by-side">Side by side</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          {!diff && <AlignedLoader />}
          {diff && from === to && (
            <Alert severity="info">Pick two different versions.</Alert>
          )}
          {diff && from !== to && diff.same && (
            <Alert severity="info">These versions are the same.</Alert>
          )}
          {diff && from !== to && !diff.same && (
            <DiffSections
              diff={diff}
              mode={mode}
              onlyChanges={onlyChanges}
              labels={{
                before: options.find((it) => it.id === from)?.label ?? '',
                after: options.find((it) => it.id === to)?.label ?? '',
              }}
            />
          )}
        </>
      )}
    </Box>
  );
}

const highlight = (kind: 'added' | 'removed') => ({
  bgcolor: (theme: Theme) =>
    alpha(
      kind === 'added' ? theme.palette.success.main : theme.palette.error.main,
      0.22,
    ),
  color: 'inherit',
  borderRadius: '3px',
  textDecoration: kind === 'removed' ? 'line-through' : 'none',
  textDecorationColor: (theme: Theme) => theme.palette.error.main,
});

/** The parts of a diff, marked; one side shows only what that version has. */
function DiffText({ diff, side }: { diff: TextDiff; side?: Side }) {
  const parts = diff.parts.filter(
    (it) =>
      !side ||
      it.kind === 'same' ||
      (side === 'before' ? it.kind === 'removed' : it.kind === 'added'),
  );
  if (parts.every((it) => it.text.trim() === '')) {
    return (
      <Typography component="span" color="text.disabled">
        —
      </Typography>
    );
  }
  return (
    <Box
      component="span"
      sx={{
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        // A replaced word reads as two words, not one
        '& del + ins': { ml: '0.25em' },
      }}
    >
      {parts.map((it, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the parts never reorder
        <Fragment key={index}>
          {index > 0 && diff.separator}
          {it.kind === 'same' ? (
            it.text
          ) : (
            <Box
              component={it.kind === 'added' ? 'ins' : 'del'}
              sx={highlight(it.kind)}
            >
              {it.text}
            </Box>
          )}
        </Fragment>
      ))}
    </Box>
  );
}

/** A value inline, or the older and the newer value next to each other. */
function DiffValue({ diff, mode }: { diff: TextDiff; mode: DiffMode }) {
  if (mode === 'inline') return <DiffText diff={diff} />;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: 3,
      }}
    >
      <Box>
        <DiffText diff={diff} side="before" />
      </Box>
      <Box>
        <DiffText diff={diff} side="after" />
      </Box>
    </Box>
  );
}

function FieldRows({
  fields,
  mode,
  onlyChanges,
}: {
  fields: FieldDiff[];
  mode: DiffMode;
  onlyChanges: boolean;
}) {
  const shown = fields.filter(
    (it) =>
      it.diff.changed ||
      (!onlyChanges && it.diff.parts.some((part) => part.text.trim())),
  );
  return (
    <Stack spacing={1.5}>
      {shown.map((it) => (
        <Box key={it.label}>
          <Typography variant="caption" color="text.secondary" component="div">
            {it.label}
          </Typography>
          <DiffValue diff={it.diff} mode={mode} />
        </Box>
      ))}
    </Stack>
  );
}

const KIND_CHIP: Record<
  ChangeKind,
  { label: string; color: 'success' | 'error' | 'warning' | 'default' }
> = {
  added: { label: 'Added', color: 'success' },
  removed: { label: 'Removed', color: 'error' },
  changed: { label: 'Changed', color: 'warning' },
  same: { label: 'Unchanged', color: 'default' },
};

const KindChip = ({ kind }: { kind: ChangeKind }) => (
  <Chip
    size="small"
    variant="outlined"
    label={KIND_CHIP[kind].label}
    color={KIND_CHIP[kind].color}
  />
);

function Section({
  title,
  changed,
  onlyChanges,
  children,
}: {
  title: string;
  changed: boolean;
  onlyChanges: boolean;
  children: ReactNode;
}) {
  return (
    <Card component="section" aria-label={title}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {!changed && <KindChip kind="same" />}
        </Stack>
        {changed || !onlyChanges ? (
          children
        ) : (
          <Typography color="text.secondary">No changes.</Typography>
        )}
      </CardContent>
    </Card>
  );
}

function ExperienceRow({
  experience,
  mode,
  onlyChanges,
}: {
  experience: ExperienceDiff;
  mode: DiffMode;
  onlyChanges: boolean;
}) {
  return (
    <Box
      sx={{
        borderLeft: 3,
        borderColor: (theme) =>
          experience.kind === 'same'
            ? theme.palette.divider
            : theme.palette[
                KIND_CHIP[experience.kind].color as
                  | 'success'
                  | 'error'
                  | 'warning'
              ].main,
        pl: 2,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography fontWeight={600}>{experience.title}</Typography>
        <KindChip kind={experience.kind} />
      </Stack>
      {(experience.kind !== 'same' || !onlyChanges) && (
        <FieldRows
          fields={experience.fields}
          mode={mode}
          onlyChanges={onlyChanges && experience.kind === 'changed'}
        />
      )}
    </Box>
  );
}

const stars = (level: number | null) =>
  level == null ? 'no rating' : '★'.repeat(level) + '☆'.repeat(5 - level);

function SkillRow({ skill, mode }: { skill: SkillDiff; mode: DiffMode }) {
  const level =
    skill.level.before === skill.level.after
      ? {
          changed: false,
          parts: [{ kind: 'same' as const, text: stars(skill.level.after) }],
        }
      : {
          changed: true,
          parts: [
            ...(skill.kind === 'added'
              ? []
              : [
                  { kind: 'removed' as const, text: stars(skill.level.before) },
                ]),
            ...(skill.kind === 'removed'
              ? []
              : [{ kind: 'added' as const, text: stars(skill.level.after) }]),
          ],
        };
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '12rem 1fr' },
        columnGap: 2,
        alignItems: 'baseline',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography
          fontWeight={600}
          sx={
            skill.kind === 'removed'
              ? highlight('removed')
              : skill.kind === 'added'
                ? highlight('added')
                : undefined
          }
        >
          {skill.name}
        </Typography>
      </Stack>
      <Stack spacing={0.5}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Category{' '}
          </Typography>
          <DiffValue diff={skill.category} mode={mode} />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Rating{' '}
          </Typography>
          <DiffValue diff={level} mode={mode} />
        </Box>
      </Stack>
    </Box>
  );
}

function DiffSections({
  diff,
  mode,
  onlyChanges,
  labels,
}: {
  diff: CvDiff;
  mode: DiffMode;
  onlyChanges: boolean;
  labels: { before: string; after: string };
}) {
  const detailsChanged = diff.details.some((it) => it.diff.changed);
  const experiences = onlyChanges
    ? diff.experiences.filter((it) => it.kind !== 'same')
    : diff.experiences;
  const skills = onlyChanges
    ? diff.skills.filter((it) => it.kind !== 'same')
    : diff.skills;
  const text = (title: string, value: TextDiff) => (
    <Section title={title} changed={value.changed} onlyChanges={onlyChanges}>
      <DiffValue diff={value} mode={mode} />
    </Section>
  );

  return (
    <Stack spacing={2}>
      {mode === 'side-by-side' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: 3,
            px: 2,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            py: 1,
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="overline" color="text.secondary">
            {labels.before}
          </Typography>
          <Typography variant="overline" color="text.secondary">
            {labels.after}
          </Typography>
        </Box>
      )}
      <Section
        title="Details"
        changed={detailsChanged}
        onlyChanges={onlyChanges}
      >
        <FieldRows
          fields={diff.details}
          mode={mode}
          onlyChanges={onlyChanges}
        />
      </Section>
      {text('Profile', diff.summary)}
      <Section
        title="Work experience"
        changed={diff.experiences.some((it) => it.kind !== 'same')}
        onlyChanges={onlyChanges}
      >
        <Stack spacing={2.5}>
          {experiences.map((it, index) => (
            <ExperienceRow
              // biome-ignore lint/suspicious/noArrayIndexKey: jobs have no id
              key={index}
              experience={it}
              mode={mode}
              onlyChanges={onlyChanges}
            />
          ))}
        </Stack>
      </Section>
      <Section
        title="Skills"
        changed={diff.skills.some((it) => it.kind !== 'same')}
        onlyChanges={onlyChanges}
      >
        <Stack spacing={1.5}>
          {skills.map((it, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skills have no id
            <SkillRow key={index} skill={it} mode={mode} />
          ))}
        </Stack>
      </Section>
      {text('Education', diff.education)}
      {text('Subjects', diff.subjects)}
      {text('Languages', diff.languages)}
    </Stack>
  );
}
