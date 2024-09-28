import type { SchemaObject } from 'ajv'
import { compileSchema } from './src'
import fs from 'node:fs'
import path from 'node:path'

const getAjvStandaloneCode = (schema: SchemaObject, path: string) =>
  compileSchema(path, schema, {
    includeKeywords: true,
    includeFormats: true,
    ajvOptions: {
      code: { esm: false },
    },
  })

const mockSchemas = ['./tests/__mocks__/test.ajv.json']
for (const schemaPath of mockSchemas) {
  const jsFile = schemaPath.replace('.ajv.json', '.ajv.js')

  if (!fs.existsSync(jsFile)) {
    fs.writeFileSync(
      path.join(__dirname, jsFile),
      getAjvStandaloneCode(
        jest.requireActual(schemaPath),
        schemaPath.split('/').at(-1) as string,
      ),
    )
  }

  jest.mock(schemaPath, () => jest.requireActual(jsFile))
}

beforeEach(() => {
  jest.resetModules()
  jest.resetAllMocks()
})
