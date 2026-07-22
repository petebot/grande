import {
  DAYS_OF_WEEK,
  type BusinessTimezone,
  type HoursException,
  type ScheduleInterval,
  type WeeklyScheduleDay,
} from '@grande/content'

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * MINUTE_MS
const NEXT_TRANSITION_SEARCH_DAYS = 14

export interface ResolvedInterval {
  readonly opensAt: string
  readonly closesAt: string
}

export interface ResolvedDaySchedule {
  readonly date: string
  readonly source: 'weekly' | 'exception'
  readonly intervals: readonly ResolvedInterval[]
}

export interface ActiveHoursException {
  readonly id: string
  readonly publicNote?: string
}

export interface HoursTransition {
  readonly at: string
  readonly status: 'open' | 'closed'
}

export interface ResolvedHours {
  readonly status: 'open' | 'closed'
  readonly localDate: string
  readonly currentInterval: ResolvedInterval | null
  readonly nextTransition: HoursTransition | null
  readonly today: ResolvedDaySchedule
  readonly activeException: ActiveHoursException | null
}

export interface ResolveHoursInput {
  readonly now: Date
  readonly timeZone: BusinessTimezone
  readonly weeklySchedule: readonly WeeklyScheduleDay[]
  readonly hoursExceptions: readonly HoursException[]
}

interface LocalDateTime {
  readonly year: number
  readonly month: number
  readonly day: number
  readonly hour: number
  readonly minute: number
}

interface InternalInterval {
  readonly opensAt: number
  readonly closesAt: number
  readonly exception: ActiveHoursException | null
}

interface InternalDaySchedule {
  readonly publicValue: ResolvedDaySchedule
  readonly intervals: readonly InternalInterval[]
  readonly exception: ActiveHoursException | null
}

function dateTimeFormatter(timeZone: BusinessTimezone): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  })
}

function localDateTime(date: Date, formatter: Intl.DateTimeFormat): LocalDateTime {
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  )

  return {
    year: parts.year!,
    month: parts.month!,
    day: parts.day!,
    hour: parts.hour!,
    minute: parts.minute!,
  }
}

function isoLocalDate({ year, month, day }: LocalDateTime): string {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`
}

function parseLocalDate(date: string): [year: number, month: number, day: number] {
  const [year, month, day] = date.split('-').map(Number)

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid normalized local date: ${date}`)
  }

  return [year, month, day]
}

function parseLocalTime(time: string): [hour: number, minute: number] {
  const [hour, minute] = time.split(':').map(Number)

  if (hour === undefined || minute === undefined) {
    throw new Error(`Invalid normalized local time: ${time}`)
  }

  return [hour, minute]
}

function addLocalDays(date: string, days: number): string {
  const [year, month, day] = parseLocalDate(date)

  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

function addLocalMinutes(date: string, time: string, minutes: number): [string, string] {
  const [year, month, day] = parseLocalDate(date)
  const [hour, minute] = parseLocalTime(time)
  const shifted = new Date(Date.UTC(year, month - 1, day, hour, minute + minutes))

  return [shifted.toISOString().slice(0, 10), shifted.toISOString().slice(11, 16)]
}

function possibleInstants(date: string, time: string, formatter: Intl.DateTimeFormat): number[] {
  const [year, month, day] = parseLocalDate(date)
  const [hour, minute] = parseLocalTime(time)
  const nominal = Date.UTC(year, month - 1, day, hour, minute)
  const matches: number[] = []

  // Modern civil time-zone offsets occur in 15-minute increments. Searching the
  // complete offset range also discovers both instants during a repeated DST hour.
  for (let offsetMinutes = -14 * 60; offsetMinutes <= 14 * 60; offsetMinutes += 15) {
    const candidate = nominal + offsetMinutes * MINUTE_MS
    const local = localDateTime(new Date(candidate), formatter)

    if (
      local.year === year &&
      local.month === month &&
      local.day === day &&
      local.hour === hour &&
      local.minute === minute
    ) {
      matches.push(candidate)
    }
  }

  return matches
}

function localBoundaryInstant(
  date: string,
  time: string,
  edge: 'opening' | 'closing',
  formatter: Intl.DateTimeFormat,
): number {
  let candidates = possibleInstants(date, time, formatter)

  // A recurring wall-clock boundary can land inside the skipped spring-forward
  // hour. Move it to the first real local minute so the resolver never invents
  // an impossible instant or claims service before the clock resumes.
  for (let shiftedMinutes = 1; candidates.length === 0 && shiftedMinutes <= 180; shiftedMinutes++) {
    const [shiftedDate, shiftedTime] = addLocalMinutes(date, time, shiftedMinutes)
    candidates = possibleInstants(shiftedDate, shiftedTime, formatter)
  }

  if (candidates.length === 0) {
    throw new Error(`Unable to resolve local schedule boundary ${date} ${time}`)
  }

  return edge === 'opening' ? Math.min(...candidates) : Math.max(...candidates)
}

function dayOfWeek(date: string): WeeklyScheduleDay['day'] {
  const [year, month, day] = parseLocalDate(date)
  const sundayFirstIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay()

  return DAYS_OF_WEEK[(sundayFirstIndex + 6) % 7]!
}

function dateSpanDays(exception: HoursException): number {
  const [startYear, startMonth, startDay] = parseLocalDate(exception.startsOn)
  const [endYear, endMonth, endDay] = parseLocalDate(exception.endsOn)

  return (
    (Date.UTC(endYear, endMonth - 1, endDay) - Date.UTC(startYear, startMonth - 1, startDay)) /
    DAY_MS
  )
}

function exceptionForDate(
  date: string,
  hoursExceptions: readonly HoursException[],
): HoursException | undefined {
  return hoursExceptions
    .filter(({ startsOn, endsOn }) => startsOn <= date && endsOn >= date)
    .sort(
      (left, right) =>
        dateSpanDays(left) - dateSpanDays(right) ||
        right.priority - left.priority ||
        left.id.localeCompare(right.id),
    )[0]
}

function exceptionSummary(exception: HoursException | undefined): ActiveHoursException | null {
  if (!exception) return null

  return {
    id: exception.id,
    ...(exception.publicNote ? { publicNote: exception.publicNote } : {}),
  }
}

function intervalsForDate(
  date: string,
  weeklySchedule: readonly WeeklyScheduleDay[],
  hoursExceptions: readonly HoursException[],
): {
  intervals: readonly ScheduleInterval[]
  source: ResolvedDaySchedule['source']
  exception: HoursException | undefined
} {
  const exception = exceptionForDate(date, hoursExceptions)

  if (exception) {
    return {
      exception,
      intervals: exception.intervals,
      source: 'exception',
    }
  }

  return {
    exception: undefined,
    intervals: weeklySchedule.find(({ day }) => day === dayOfWeek(date))?.intervals ?? [],
    source: 'weekly',
  }
}

function resolveDaySchedule(
  date: string,
  weeklySchedule: readonly WeeklyScheduleDay[],
  hoursExceptions: readonly HoursException[],
  formatter: Intl.DateTimeFormat,
): InternalDaySchedule {
  const selected = intervalsForDate(date, weeklySchedule, hoursExceptions)
  const exception = exceptionSummary(selected.exception)
  const intervals = selected.intervals.map(({ opensAt, closesAt }) => {
    const closingDate = closesAt < opensAt ? addLocalDays(date, 1) : date

    return {
      opensAt: localBoundaryInstant(date, opensAt, 'opening', formatter),
      closesAt: localBoundaryInstant(closingDate, closesAt, 'closing', formatter),
      exception,
    }
  })

  return {
    exception,
    intervals,
    publicValue: {
      date,
      source: selected.source,
      intervals: intervals.map(({ opensAt, closesAt }) => ({
        opensAt: new Date(opensAt).toISOString(),
        closesAt: new Date(closesAt).toISOString(),
      })),
    },
  }
}

function mergeIntervals(intervals: readonly InternalInterval[]): InternalInterval[] {
  const sorted = [...intervals].sort(
    (left, right) => left.opensAt - right.opensAt || left.closesAt - right.closesAt,
  )
  const merged: InternalInterval[] = []

  for (const interval of sorted) {
    const previous = merged.at(-1)

    if (!previous || interval.opensAt > previous.closesAt) {
      merged.push(interval)
      continue
    }

    merged[merged.length - 1] = {
      opensAt: previous.opensAt,
      closesAt: Math.max(previous.closesAt, interval.closesAt),
      exception: previous.exception ?? interval.exception,
    }
  }

  return merged
}

export function resolveHours({
  now,
  timeZone,
  weeklySchedule,
  hoursExceptions,
}: ResolveHoursInput): ResolvedHours {
  if (Number.isNaN(now.getTime())) {
    throw new Error('Hours resolution requires a valid instant')
  }

  const formatter = dateTimeFormatter(timeZone)
  const localDate = isoLocalDate(localDateTime(now, formatter))
  const resolvedDays = Array.from({ length: NEXT_TRANSITION_SEARCH_DAYS + 2 }, (_, index) =>
    addLocalDays(localDate, index - 1),
  ).map((date) => resolveDaySchedule(date, weeklySchedule, hoursExceptions, formatter))
  const today = resolvedDays[1]!
  const intervals = mergeIntervals(
    resolvedDays.flatMap(({ intervals: dayIntervals }) => dayIntervals),
  )
  const nowMs = now.getTime()
  const current = intervals.find(({ opensAt, closesAt }) => opensAt <= nowMs && closesAt > nowMs)

  if (current) {
    return {
      activeException: current.exception,
      currentInterval: {
        opensAt: new Date(current.opensAt).toISOString(),
        closesAt: new Date(current.closesAt).toISOString(),
      },
      localDate,
      nextTransition: {
        at: new Date(current.closesAt).toISOString(),
        status: 'closed',
      },
      status: 'open',
      today: today.publicValue,
    }
  }

  const nextOpening = intervals.find(({ opensAt }) => opensAt > nowMs)

  return {
    activeException: today.exception,
    currentInterval: null,
    localDate,
    nextTransition: nextOpening
      ? {
          at: new Date(nextOpening.opensAt).toISOString(),
          status: 'open',
        }
      : null,
    status: 'closed',
    today: today.publicValue,
  }
}
