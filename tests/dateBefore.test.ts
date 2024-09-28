import type { ValidateFunction } from 'ajv'
import * as testValidation from './__mocks__/test.ajv.json'

describe('validate iso-date-time comparison', () => {
  let validator: ValidateFunction

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;({ validator } = testValidation as any)
  })

  test('should pass if start date is before end date', () => {
    const payload = {
      startTime: '2018-11-13T20:20:39+00:00',
      endTime: '2018-11-13T21:20:39+00:00',
    }

    expect(validator(payload)).toEqual(true)
    expect(validator.errors).toEqual(null)
  })

  test('should fail if start date is after end date', () => {
    const payload = {
      startTime: '2018-11-13T22:20:39+00:00',
      endTime: '2018-11-13T21:20:39+00:00',
    }

    expect(validator(payload)).toEqual(false)
    expect(validator.errors).toEqual([
      {
        instancePath: '/startTime',
        schemaPath: '#/properties/startTime/formatExclusiveMaximum',
        keyword: 'formatExclusiveMaximum',
        params: { comparison: '<', limit: '2018-11-13T21:20:39+00:00' },
        message: 'should be < 2018-11-13T21:20:39+00:00',
      },
    ])
  })

  test('should fail if start date equal end date', () => {
    const payload = {
      startTime: '2018-11-13T22:20:39+00:00',
      endTime: '2018-11-13T22:20:39+00:00',
    }

    expect(validator(payload)).toEqual(false)
    expect(validator.errors).toEqual([
      {
        instancePath: '/startTime',
        schemaPath: '#/properties/startTime/formatExclusiveMaximum',
        keyword: 'formatExclusiveMaximum',
        params: { comparison: '<', limit: '2018-11-13T22:20:39+00:00' },
        message: 'should be < 2018-11-13T22:20:39+00:00',
      },
    ])
  })
})
