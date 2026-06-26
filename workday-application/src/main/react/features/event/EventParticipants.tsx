import AddIcon from '@mui/icons-material/Add';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { EventType } from '../../clients/EventClient';
import { type Person, PersonClient } from '../../clients/PersonClient';
import { PeriodInput } from '../../components/inputs/PeriodInput';
import { currencyFormatter } from '../../utils/Currency';
import { editDay, type Period } from '../period/Period';

export type Participant = {
  personId: string;
  hours: number;
  // Per-day hours that draw on the training budget; undefined means the attendee follows the event blueprint.
  days?: number[];
  // Per-day hours that draw on the hack budget, same date range as days; undefined means none.
  hackDays?: number[];
  cost?: number;
  costPinned?: boolean;
};

type EventDayForm = {
  personId: string;
  hours: number;
  cost: number | null;
  budgetCategory: 'HACK' | 'TRAINING' | null;
  days: number[];
};

type EventDayRaw = {
  personId?: string;
  hours?: number;
  cost?: number;
  budgetCategory?: 'HACK' | 'TRAINING' | null;
  days?: number[];
};

type EventParticipantsProps = {
  personIds: string[];
  participants: Participant[];
  defaultHours: number;
  defaultDays: number[];
  from: Dayjs;
  to: Dayjs;
  total: number;
  type: EventType;
  // Names for attendees that may no longer be active and thus absent from the picker list.
  knownPersons?: { uuid: string; firstname: string; lastname: string }[];
  setFieldValue: (field: string, value: unknown) => void;
};

const isMoneyBearing = (type: EventType) => type !== EventType.FLOCK_HACK_DAY;
const isSplittable = (type: EventType) => type === EventType.CONFERENCE;

const sum = (days: number[]) =>
  days.reduce((acc, h) => acc + (Number(h) || 0), 0);

const zeros = (length: number) => new Array<number>(length).fill(0);

const formatHours = (hours: number) =>
  `${hours.toLocaleString('nl-NL', { maximumFractionDigits: 1 })}h`;

function splitEvenly(totalEuros: number, count: number): number[] {
  if (count <= 0) return [];
  const cents = Math.round(totalEuros * 100);
  const base = Math.floor(cents / count);
  const remainder = cents - base * count;
  return Array.from(
    { length: count },
    (_, i) => (base + (i < remainder ? 1 : 0)) / 100,
  );
}

function redistribute(rows: Participant[], total: number): Participant[] {
  const pinnedSum = rows
    .filter((r) => r.costPinned)
    .reduce((acc, r) => acc + (r.cost ?? 0), 0);
  const unpinned = rows.filter((r) => !r.costPinned);
  const shares = splitEvenly(Math.max(total - pinnedSum, 0), unpinned.length);
  let i = 0;
  return rows.map((r) => (r.costPinned ? r : { ...r, cost: shares[i++] ?? 0 }));
}

// Training and hack each map straight to their own budget row, carrying their per-day shape.
export function toEventDayForms(
  participants: Participant[],
  type: EventType,
  blueprint: number[],
): EventDayForm[] {
  const moneyBearing = isMoneyBearing(type);
  const splittable = isSplittable(type);
  const forms: EventDayForm[] = [];
  for (const p of participants) {
    const training = p.days ?? blueprint;
    const hack = splittable ? (p.hackDays ?? zeros(blueprint.length)) : [];
    const hackHours = sum(hack);
    const trainingHours = sum(training);
    const cost = moneyBearing ? (p.cost ?? 0) : null;
    if (hackHours > 0) {
      forms.push({
        personId: p.personId,
        hours: hackHours,
        cost: null,
        budgetCategory: 'HACK',
        days: hack,
      });
    }
    if (trainingHours > 0 || hackHours <= 0 || (cost ?? 0) > 0) {
      forms.push({
        personId: p.personId,
        hours: trainingHours,
        cost,
        budgetCategory: null,
        days: training,
      });
    }
  }
  return forms;
}

export function initParticipants(
  eventDays: EventDayRaw[] | undefined,
  _defaultHours: number,
  type: EventType,
  total: number,
  defaultDays: number[],
): Participant[] {
  if (!eventDays || eventDays.length === 0) return [];
  const moneyBearing = isMoneyBearing(type);
  const splittable = isSplittable(type);
  const len = defaultDays.length;
  // Trust stored per-day only when it spans the range; else rebuild from scalar hours
  // (subscribe sets hours without days) so a round-trip never zeroes the attendee.
  const perDayHours = (d: EventDayRaw): number[] => {
    if (d.days && d.days.length === len) return d.days;
    const hours = d.hours ?? 0;
    if (len === 0) return [];
    if (len === 1) return [hours];
    if (sum(defaultDays) === hours) return defaultDays;
    return zeros(len).map(() => hours / len);
  };
  const byPerson = new Map<
    string,
    { training: number[]; hack: number[]; cost: number }
  >();
  for (const d of eventDays) {
    if (!d.personId) continue;
    const entry = byPerson.get(d.personId) ?? {
      training: zeros(len),
      hack: zeros(len),
      cost: 0,
    };
    const days = perDayHours(d);
    const isHackBudgetSplit = splittable && d.budgetCategory === 'HACK';
    if (isHackBudgetSplit) {
      days.forEach((h, i) => {
        entry.hack[i] = (entry.hack[i] ?? 0) + h;
      });
    } else {
      days.forEach((h, i) => {
        entry.training[i] = (entry.training[i] ?? 0) + h;
      });
      entry.cost += d.cost ?? 0;
    }
    byPerson.set(d.personId, entry);
  }
  const ids = [...byPerson.keys()];
  const shares = splitEvenly(total, ids.length);
  return ids.map((personId, i) => {
    const entry = byPerson.get(personId) as {
      training: number[];
      hack: number[];
      cost: number;
    };
    const days = sameDays(entry.training, defaultDays)
      ? undefined
      : entry.training;
    const hackHours = sum(entry.hack);
    const cost = moneyBearing ? entry.cost : undefined;
    return {
      personId,
      hours: sum(entry.training) + hackHours,
      days,
      hackDays: hackHours > 0 ? entry.hack : undefined,
      cost,
      costPinned:
        moneyBearing &&
        Math.abs(
          Math.round((cost ?? 0) * 100) - Math.round((shares[i] ?? 0) * 100),
        ) > 1,
    };
  });
}

function reconcile(
  personIds: string[],
  current: Participant[],
  defaultDays: number[],
  total: number,
  moneyBearing: boolean,
  splittable: boolean,
): Participant[] {
  const byId = new Map(current.map((p) => [p.personId, p]));
  const rows: Participant[] = personIds.map((personId) => {
    const prev = byId.get(personId);
    // Drop a per-person override whose length no longer matches the event range (dates changed).
    const days =
      prev?.days && prev.days.length === defaultDays.length
        ? prev.days
        : undefined;
    const hackDays =
      splittable &&
      prev?.hackDays &&
      prev.hackDays.length === defaultDays.length
        ? prev.hackDays
        : undefined;
    return {
      personId,
      days,
      hackDays,
      hours: sum(days ?? defaultDays) + sum(hackDays ?? []),
      costPinned: moneyBearing ? (prev?.costPinned ?? false) : false,
      cost: moneyBearing
        ? prev?.costPinned
          ? prev.cost
          : undefined
        : undefined,
    };
  });
  return moneyBearing ? redistribute(rows, total) : rows;
}

function sameDays(a: number[] | undefined, b: number[] | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return !a && !b;
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function same(a: Participant[], b: Participant[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (p, i) =>
      p.personId === b[i].personId &&
      p.hours === b[i].hours &&
      p.cost === b[i].cost &&
      !!p.costPinned === !!b[i].costPinned &&
      sameDays(p.days, b[i].days) &&
      sameDays(p.hackDays, b[i].hackDays),
  );
}

export function EventParticipants({
  personIds,
  participants,
  defaultHours,
  defaultDays,
  from,
  to,
  total,
  type,
  knownPersons = [],
  setFieldValue,
}: EventParticipantsProps) {
  const moneyBearing = isMoneyBearing(type);
  const splittable = isSplittable(type);
  const [people, setPeople] =
    useState<{ uuid: string; firstname: string; lastname: string }[]>(
      knownPersons,
    );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    PersonClient.queryByPage(
      { page: 0, size: 200, sort: 'firstname' },
      { active: true },
    ).then((res: { list: Person[] }) => {
      setPeople((prev) => {
        const merged = new Map(prev.map((p) => [p.uuid, p]));
        for (const p of res.list) merged.set(p.uuid, p);
        return [...merged.values()];
      });
    });
  }, []);

  const participantsRef = useRef(participants);
  participantsRef.current = participants;
  const personIdsKey = personIds.join(',');

  // biome-ignore lint/correctness/useExhaustiveDependencies: reconcile reads latest participants via ref; retrigger only on structural inputs
  useEffect(() => {
    const current = participantsRef.current;
    const next = reconcile(
      personIds,
      current,
      defaultDays,
      total,
      moneyBearing,
      splittable,
    );
    if (!same(next, current)) setFieldValue('participants', next);
  }, [
    personIdsKey,
    defaultDays,
    total,
    moneyBearing,
    splittable,
    setFieldValue,
  ]);

  const nameOf = (id: string) => {
    const p = people.find((it) => it.uuid === id);
    return p ? `${p.firstname} ${p.lastname}` : id.slice(0, 8);
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setTrainingDay = (id: string, date: Dayjs, hours: number) => {
    setFieldValue(
      'participants',
      participants.map((p) => {
        if (p.personId !== id) return p;
        const base: Period = { from, to, days: p.days ?? defaultDays };
        const days = editDay(base, date, hours).days ?? [];
        return { ...p, days, hours: sum(days) + sum(p.hackDays ?? []) };
      }),
    );
  };

  const setHackDay = (id: string, date: Dayjs, hours: number) => {
    setFieldValue(
      'participants',
      participants.map((p) => {
        if (p.personId !== id) return p;
        const base: Period = {
          from,
          to,
          days: p.hackDays ?? zeros(defaultDays.length),
        };
        const next = editDay(base, date, hours).days ?? [];
        const hackDays = next.every((h) => h === 0) ? undefined : next;
        return {
          ...p,
          hackDays,
          hours: sum(p.days ?? defaultDays) + sum(hackDays ?? []),
        };
      }),
    );
  };

  const resetParticipant = (id: string) => {
    const cleared = participants.map((p) =>
      p.personId === id
        ? {
            ...p,
            days: undefined,
            hackDays: undefined,
            hours: defaultHours,
            costPinned: false,
          }
        : p,
    );
    setFieldValue(
      'participants',
      moneyBearing ? redistribute(cleared, total) : cleared,
    );
  };

  const setCost = (id: string, raw: string) => {
    const value = Number(raw);
    const cost = Number.isNaN(value) ? 0 : Math.max(0, value);
    const pinned = participants.map((p) =>
      p.personId === id ? { ...p, cost, costPinned: true } : p,
    );
    setFieldValue('participants', redistribute(pinned, total));
  };

  const resetSplit = () => {
    const shares = splitEvenly(total, participants.length);
    setFieldValue(
      'participants',
      participants.map((p, i) => ({
        ...p,
        cost: shares[i] ?? 0,
        costPinned: false,
      })),
    );
  };

  if (participants.length === 0) return null;

  const costSum = participants.reduce((acc, p) => acc + (p.cost ?? 0), 0);
  const balanced = Math.round(costSum * 100) === Math.round(total * 100);
  const anyPinned = participants.some((p) => p.costPinned);

  const costField = (p: Participant, weekIndex: number) =>
    weekIndex === 0 ? (
      <TextField
        size="small"
        type="number"
        fullWidth
        value={p.cost ?? 0}
        onChange={(e) => setCost(p.personId, e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start">€</InputAdornment>,
        }}
      />
    ) : null;

  const sectionHeader = (label: string) => (
    <Typography
      variant="subtitle2"
      color="text.secondary"
      sx={{ display: 'block', mb: 0.5, pl: 2 }}
    >
      {label}
    </Typography>
  );

  return (
    <Box sx={{ mt: 1 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
      >
        <Typography variant="subtitle2" color="text.secondary">
          Per attendee
        </Typography>
        {moneyBearing && anyPinned && (
          <Button size="small" onClick={resetSplit}>
            Reset to even split
          </Button>
        )}
      </Stack>
      <Stack spacing={0.5} sx={{ mt: 1 }}>
        {participants.map((p) => {
          const trainingDays = p.days ?? defaultDays;
          const hackDays = p.hackDays ?? zeros(defaultDays.length);
          const trainingHours = sum(trainingDays);
          const hackHours = sum(hackDays);
          const personHours = trainingHours + hackHours;
          const split = splittable && hackHours > 0;
          const open = expanded.has(p.personId);
          const overridden = p.days != null || hackHours > 0 || !!p.costPinned;
          return (
            <Box key={p.personId}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={
                  open
                    ? { borderBottom: 1, borderColor: 'divider', pb: 0.5 }
                    : undefined
                }
              >
                <Typography
                  sx={{ flex: 1, fontWeight: open ? 600 : undefined }}
                  variant="body2"
                >
                  {nameOf(p.personId)}
                </Typography>
                <Typography
                  variant="body2"
                  color={overridden ? 'text.primary' : 'text.secondary'}
                >
                  {split
                    ? `Training ${formatHours(trainingHours)} · Hack ${formatHours(hackHours)}`
                    : formatHours(personHours)}
                  {moneyBearing &&
                    ` · ${currencyFormatter.format(p.cost ?? 0)}`}
                </Typography>
                {open && overridden && (
                  <Button
                    size="small"
                    onClick={() => resetParticipant(p.personId)}
                  >
                    Reset
                  </Button>
                )}
                <IconButton
                  size="small"
                  onClick={() => toggle(p.personId)}
                  aria-label="customize hours and cost"
                >
                  {open ? <ExpandLessIcon /> : <AddIcon />}
                </IconButton>
              </Stack>
              <Collapse in={open} unmountOnExit>
                <Box sx={{ py: 1 }}>
                  {splittable ? (
                    <Stack spacing={1.5}>
                      <Box>
                        {sectionHeader('Training hours')}
                        <PeriodInput
                          period={{ from, to, days: trainingDays }}
                          onChange={(date, hours) =>
                            setTrainingDay(p.personId, date, hours)
                          }
                          weekLabel
                          labelInset={2}
                          hideWeekTotal
                          hidePeriodTotal
                          trailingHeader={moneyBearing ? 'Cost' : undefined}
                          renderTrailing={
                            moneyBearing
                              ? (weekIndex) => costField(p, weekIndex)
                              : undefined
                          }
                        />
                      </Box>
                      <Box>
                        {sectionHeader('Hack hours')}
                        <PeriodInput
                          period={{ from, to, days: hackDays }}
                          onChange={(date, hours) =>
                            setHackDay(p.personId, date, hours)
                          }
                          weekLabel
                          labelInset={2}
                          hideWeekTotal
                          hidePeriodTotal
                        />
                      </Box>
                    </Stack>
                  ) : (
                    <PeriodInput
                      period={{ from, to, days: trainingDays }}
                      onChange={(date, hours) =>
                        setTrainingDay(p.personId, date, hours)
                      }
                      weekLabel
                      labelInset={2}
                      hideWeekTotal
                      hidePeriodTotal
                      trailingHeader={moneyBearing ? 'Cost' : undefined}
                      renderTrailing={
                        moneyBearing
                          ? (weekIndex) => costField(p, weekIndex)
                          : undefined
                      }
                    />
                  )}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Stack>
      {moneyBearing && (
        <Typography
          variant="caption"
          color={balanced ? 'text.secondary' : 'error'}
          sx={{ mt: 1, display: 'block', textAlign: 'right' }}
        >
          Shares total {currencyFormatter.format(costSum)} of{' '}
          {currencyFormatter.format(total)}
          {!balanced && ' — does not match event cost'}
        </Typography>
      )}
    </Box>
  );
}
