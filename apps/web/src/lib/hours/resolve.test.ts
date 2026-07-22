import {
  BUSINESS_TIMEZONE,
  DAYS_OF_WEEK,
  type ScheduleInterval,
  type WeeklyScheduleDay,
} from '@grande/content'
import { describe, expect, it } from 'vitest'

import { resolveHours } from './resolve'
import { developmentContentFixture } from '../../../../../packages/content/test/fixtures/development-content'

const weeklySchedule = developmentContentFixture.weeklySchedule
const hoursExceptions = developmentContentFixture.hoursExceptions

function sundaySchedule(intervals: readonly ScheduleInterval[]): WeeklyScheduleDay[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    intervals: day === 'sunday' ? intervals : [],
  }))
}

describe('resolveHours', () => {
  it('treats a regular opening as inclusive and its closing as exclusive', () => {
    const atOpening = resolveHours({
      now: new Date('2030-07-18T15:00:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule,
      hoursExceptions,
    })

    expect(atOpening).toMatchObject({
      status: 'open',
      localDate: '2030-07-18',
      currentInterval: {
        opensAt: '2030-07-18T15:00:00.000Z',
        closesAt: '2030-07-19T01:00:00.000Z',
      },
      nextTransition: {
        at: '2030-07-19T01:00:00.000Z',
        status: 'closed',
      },
      today: {
        date: '2030-07-18',
        source: 'weekly',
        intervals: [
          {
            opensAt: '2030-07-18T15:00:00.000Z',
            closesAt: '2030-07-19T01:00:00.000Z',
          },
        ],
      },
    })
    expect(atOpening.activeException).toBeNull()

    const atClosing = resolveHours({
      now: new Date('2030-07-19T01:00:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule,
      hoursExceptions,
    })

    expect(atClosing).toMatchObject({
      status: 'closed',
      currentInterval: null,
      nextTransition: {
        at: '2030-07-19T15:00:00.000Z',
        status: 'open',
      },
    })
  })

  it('resolves the closed gap and next opening on a split-service day', () => {
    const result = resolveHours({
      now: new Date('2030-07-16T19:00:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule,
      hoursExceptions,
    })

    expect(result).toMatchObject({
      status: 'closed',
      localDate: '2030-07-16',
      currentInterval: null,
      nextTransition: {
        at: '2030-07-16T21:00:00.000Z',
        status: 'open',
      },
      today: {
        date: '2030-07-16',
        source: 'weekly',
        intervals: [
          {
            opensAt: '2030-07-16T15:00:00.000Z',
            closesAt: '2030-07-16T18:00:00.000Z',
          },
          {
            opensAt: '2030-07-16T21:00:00.000Z',
            closesAt: '2030-07-17T01:00:00.000Z',
          },
        ],
      },
    })
  })

  it('keeps an overnight interval open after midnight on the following local date', () => {
    const result = resolveHours({
      now: new Date('2030-07-18T05:30:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule,
      hoursExceptions,
    })

    expect(result).toMatchObject({
      status: 'open',
      localDate: '2030-07-18',
      currentInterval: {
        opensAt: '2030-07-18T02:00:00.000Z',
        closesAt: '2030-07-18T06:00:00.000Z',
      },
      nextTransition: {
        at: '2030-07-18T06:00:00.000Z',
        status: 'closed',
      },
      today: {
        date: '2030-07-18',
        source: 'weekly',
      },
    })
  })

  it('does not attribute a previous-day overnight interval to a new-day closure', () => {
    const thursdayClosure = {
      ...hoursExceptions[0]!,
      id: 'development.hours-exception.thursday-closure',
      startsOn: '2030-07-18',
      endsOn: '2030-07-18',
      publicNote: 'Fictional Thursday closure for overnight attribution testing.',
    }
    const result = resolveHours({
      now: new Date('2030-07-18T05:30:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule,
      hoursExceptions: [thursdayClosure],
    })

    expect(result).toMatchObject({
      status: 'open',
      currentInterval: {
        opensAt: '2030-07-18T02:00:00.000Z',
        closesAt: '2030-07-18T06:00:00.000Z',
      },
      today: {
        date: '2030-07-18',
        source: 'exception',
        intervals: [],
      },
    })
    expect(result.activeException).toBeNull()
  })

  it('replaces weekly hours with a dated closure and finds the next special opening', () => {
    const result = resolveHours({
      now: new Date('2030-07-20T16:00:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule,
      hoursExceptions,
    })

    expect(result).toMatchObject({
      status: 'closed',
      localDate: '2030-07-20',
      currentInterval: null,
      nextTransition: {
        at: '2030-07-21T14:00:00.000Z',
        status: 'open',
      },
      today: {
        date: '2030-07-20',
        source: 'exception',
        intervals: [],
      },
      activeException: {
        id: 'development.hours-exception.future-closure',
        publicNote: 'Fictional one-day closure for schedule testing.',
      },
    })
  })

  it('uses the shortest matching exception range even when it sits inside a closure', () => {
    const result = resolveHours({
      now: new Date('2030-08-02T23:00:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule,
      hoursExceptions,
    })

    expect(result).toMatchObject({
      status: 'open',
      localDate: '2030-08-02',
      currentInterval: {
        opensAt: '2030-08-02T22:00:00.000Z',
        closesAt: '2030-08-03T03:00:00.000Z',
      },
      nextTransition: {
        at: '2030-08-03T03:00:00.000Z',
        status: 'closed',
      },
      today: {
        date: '2030-08-02',
        source: 'exception',
      },
      activeException: {
        id: 'development.hours-exception.specific-override',
        publicNote: 'Fictional single-day override within the ranged closure.',
      },
    })
  })

  it('uses higher priority to break a tie between equally specific exceptions', () => {
    const rangedClosure = hoursExceptions[2]!
    const higherPrioritySpecialHours = {
      ...hoursExceptions[3]!,
      id: 'development.hours-exception.equal-range-higher-priority',
      startsOn: rangedClosure.startsOn,
      endsOn: rangedClosure.endsOn,
      priority: rangedClosure.priority + 1,
      publicNote: 'Fictional equal-range priority winner for schedule testing.',
    }
    const result = resolveHours({
      now: new Date('2030-08-01T23:00:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule,
      hoursExceptions: [rangedClosure, higherPrioritySpecialHours],
    })

    expect(result).toMatchObject({
      status: 'open',
      currentInterval: {
        opensAt: '2030-08-01T22:00:00.000Z',
        closesAt: '2030-08-02T03:00:00.000Z',
      },
      today: {
        source: 'exception',
      },
      activeException: {
        id: 'development.hours-exception.equal-range-higher-priority',
      },
    })
  })

  it('maps a spring-forward interval to the shortened real elapsed time', () => {
    const result = resolveHours({
      now: new Date('2030-03-10T07:30:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule: sundaySchedule([{ opensAt: '01:00', closesAt: '04:00' }]),
      hoursExceptions: [],
    })

    expect(result).toMatchObject({
      status: 'open',
      localDate: '2030-03-10',
      currentInterval: {
        opensAt: '2030-03-10T06:00:00.000Z',
        closesAt: '2030-03-10T08:00:00.000Z',
      },
      nextTransition: {
        at: '2030-03-10T08:00:00.000Z',
        status: 'closed',
      },
    })
  })

  it('keeps a fall-back interval open through both occurrences of the repeated hour', () => {
    const schedule = sundaySchedule([{ opensAt: '00:30', closesAt: '02:30' }])
    const firstOneThirty = resolveHours({
      now: new Date('2030-11-03T05:30:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule: schedule,
      hoursExceptions: [],
    })
    const secondOneThirty = resolveHours({
      now: new Date('2030-11-03T06:30:00.000Z'),
      timeZone: BUSINESS_TIMEZONE,
      weeklySchedule: schedule,
      hoursExceptions: [],
    })

    for (const result of [firstOneThirty, secondOneThirty]) {
      expect(result).toMatchObject({
        status: 'open',
        localDate: '2030-11-03',
        currentInterval: {
          opensAt: '2030-11-03T04:30:00.000Z',
          closesAt: '2030-11-03T07:30:00.000Z',
        },
        nextTransition: {
          at: '2030-11-03T07:30:00.000Z',
          status: 'closed',
        },
      })
    }
  })
})
