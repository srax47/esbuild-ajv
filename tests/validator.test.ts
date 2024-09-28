import type { SchemaObject, ValidateFunction } from 'ajv'
import * as testValidation from './__mocks__/test.ajv.json'

describe('validator', () => {
  let validator: ValidateFunction
  let schema: SchemaObject

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;({ validator, schema } = testValidation as any)
  })

  test('should add schema to the validator', () => {
    const payload = {
      startTime: '2018-11-13T20:20:39+00:00',
      endTime: '2018-11-13T21:20:39+00:00',
    }

    expect(schema).toEqual({
      $id: 'http://example.com/test.ajv.json',
      type: 'object',
      properties: {
        startTime: {
          type: 'string',
          format: 'iso-date-time',
          formatExclusiveMaximum: { $data: '1/endTime' },
        },
        endTime: {
          type: 'string',
          format: 'iso-date-time',
        },
      },
    })
    expect(validator(payload)).toEqual(true)
    expect(validator.errors).toEqual(null)
  })
})
