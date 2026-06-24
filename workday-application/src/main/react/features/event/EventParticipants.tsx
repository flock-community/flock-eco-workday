import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import { editDay, type Period } from '../period/Period';

export type Participant = {
  personId: string;
  hours: number;
  // Per-day hours over the event's date range; undefined means the attendee follows the event blueprint.
  days?: number[];
  cost?: number;
  hoursPinned?: boolean;
  costPinned?: boolean;
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

const euro = (value: number) =>
  value.toLocaleString('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  });

const sum = (days: number[]) =>
  days.reduce((acc, h) => acc + (Number(h) || 0), 0);

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

export function initParticipants(
  eventDays:
    | { personId?: string; hours?: number; cost?: number; days?: number[] }[]
    | undefined,
  defaultHours: number,
  type: EventType,
  total: number,
  defaultDays: number[],
): Participant[] {
  if (!eventDays || eventDays.length === 0) return [];
  const moneyBearing = type !== EventType.FLOCK_HACK_DAY;
  const multiDay = defaultDays.length > 1;
  const isOverride = (saved?: number[]) =>
    multiDay && !!saved && !sameDays(saved, defaultDays);
  const shares = splitEvenly(total, eventDays.length);
  return eventDays
    .filter(
      (
        d,
      ): d is {
        personId: string;
        hours?: number;
        cost?: number;
        days?: number[];
      } => Boolean(d.personId),
    )
    .map((d, i) => {
      const days = isOverride(d.days) ? d.days : undefined;
      const hours = days ? sum(days) : (d.hours ?? defaultHours);
      const cost = moneyBearing ? (d.cost ?? 0) : undefined;
      return {
        personId: d.personId,
        hours,
        days,
        hoursPinned: hours !== defaultHours,
        cost,
        costPinned:
          moneyBearing &&
          d.cost != null &&
          Math.round(d.cost * 100) !== Math.round((shares[i] ?? 0) * 100),
      };
    });
}

function reconcile(
  personIds: string[],
  current: Participant[],
  defaultHours: number,
  defaultDays: number[],
  total: number,
  moneyBearing: boolean,
): Participant[] {
  const multiDay = defaultDays.length > 1;
  const byId = new Map(current.map((p) => [p.personId, p]));
  const rows: Participant[] = personIds.map((personId) => {
    const prev = byId.get(personId);
    // Drop a per-person override whose length no longer matches the event range (dates changed).
    const days =
      prev?.days && prev.days.length === defaultDays.length
        ? prev.days
        : undefined;
    const hoursPinned = prev?.hoursPinned ?? false;
    const hours = days
      ? sum(days)
      : multiDay || !hoursPinned
        ? defaultHours
        : (prev?.hours ?? defaultHours);
    return {
      personId,
      days,
      hoursPinned,
      hours,
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
      !!p.hoursPinned === !!b[i].hoursPinned &&
      !!p.costPinned === !!b[i].costPinned &&
      sameDays(p.days, b[i].days),
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
  const moneyBearing = type !== EventType.FLOCK_HACK_DAY;
  const multiDay = defaultDays.length > 1;
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
      defaultHours,
      defaultDays,
      total,
      moneyBearing,
    );
    if (!same(next, current)) setFieldValue('participants', next);
  }, [
    personIdsKey,
    defaultHours,
    defaultDays.length,
    total,
    moneyBearing,
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

  const setHours = (id: string, raw: string) => {
    const value = Number(raw);
    setFieldValue(
      'participants',
      participants.map((p) =>
        p.personId === id
          ? { ...p, hours: Number.isNaN(value) ? 0 : value, hoursPinned: true }
          : p,
      ),
    );
  };

  const setDay = (id: string, date: Dayjs, hours: number) => {
    setFieldValue(
      'participants',
      participants.map((p) => {
        if (p.personId !== id) return p;
        const base: Period = { from, to, days: p.days ?? defaultDays };
        const next = editDay(base, date, hours);
        const days = next.days ?? [];
        return { ...p, days, hours: sum(days), hoursPinned: true };
      }),
    );
  };

  const resetDays = (id: string) => {
    setFieldValue(
      'participants',
      participants.map((p) =>
        p.personId === id
          ? { ...p, days: undefined, hours: defaultHours, hoursPinned: false }
          : p,
      ),
    );
  };

  const setCost = (id: string, raw: string) => {
    const value = Number(raw);
    const pinned = participants.map((p) =>
      p.personId === id
        ? { ...p, cost: Number.isNaN(value) ? 0 : value, costPinned: true }
        : p,
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
      <Stack spacing={1} sx={{ mt: 1 }}>
        {participants.map((p) => {
          const effectiveDays = p.days ?? defaultDays;
          const personHours = multiDay ? sum(effectiveDays) : p.hours;
          const open = expanded.has(p.personId);
          return (
            <Box key={p.personId}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ flex: 1 }} variant="body2">
                  {nameOf(p.personId)}
                </Typography>
                {multiDay ? (
                  <Typography
                    variant="body2"
                    sx={{ width: 70, textAlign: 'right' }}
                  >
                    {formatHours(personHours)}
                  </Typography>
                ) : (
                  <TextField
                    size="small"
                    type="number"
                    label="Hours"
                    value={p.hours}
                    onChange={(e) => setHours(p.personId, e.target.value)}
                    sx={{ width: 110 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">h</InputAdornment>
                      ),
                    }}
                  />
                )}
                {moneyBearing && (
                  <TextField
                    size="small"
                    type="number"
                    label="Cost"
                    value={p.cost ?? 0}
                    onChange={(e) => setCost(p.personId, e.target.value)}
                    sx={{ width: 130 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">€</InputAdornment>
                      ),
                    }}
                  />
                )}
                {multiDay && (
                  <IconButton
                    size="small"
                    onClick={() => toggle(p.personId)}
                    aria-label="hours per day"
                  >
                    {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </Stack>
              {multiDay && (
                <Collapse in={open} unmountOnExit>
                  <Box sx={{ pl: 2, pr: 1, py: 1 }}>
                    <PeriodInput
                      period={{ from, to, days: effectiveDays }}
                      onChange={(date, hours) =>
                        setDay(p.personId, date, hours)
                      }
                    />
                    {p.days && (
                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => resetDays(p.personId)}
                      >
                        Reset to event days
                      </Button>
                    )}
                  </Box>
                </Collapse>
              )}
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
          Shares total {euro(costSum)} of {euro(total)}
          {!balanced && ' — does not match event cost'}
        </Typography>
      )}
    </Box>
  );
}
