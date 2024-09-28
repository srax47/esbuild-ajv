import path from 'node:path'
import fs from 'node:fs/promises'
import { URL } from 'node:url'
import type { Plugin } from 'esbuild'
import type {
  CodeKeywordDefinition,
  Options as AjvOptions,
  AnySchemaObject,
} from 'ajv'
import Ajv from 'ajv'
import standaloneCode from 'ajv/dist/standalone'
import AjvFormats from 'ajv-formats'
import AjvKeywords from 'ajv-keywords'
import { mergeDeepLeft } from './merge'
import { createBuildCache } from './cache'

export interface Options {
  includeKeywords?: boolean
  includeFormats?: boolean
  extraKeywords?: CodeKeywordDefinition[]
  ajvOptions?: AjvOptions
}

const getAjvInstance = (
  includeKeywords = false,
  includeFormats = false,
  extraKeywords: CodeKeywordDefinition[] = [],
  ajvOptions: AjvOptions = {},
  schema: AnySchemaObject,
) => {
  const options = mergeDeepLeft(
    {
      schemas: [schema],
      $data: true,
      code: {
        source: true,
        optimize: 1,
        esm: true,
        lines: true,
      },
      loadSchema: async (uri: string) =>
        JSON.parse(
          await fs.readFile(
            path.join(process.cwd(), new URL(uri).pathname),
            'utf8',
          ),
        ) as AnySchemaObject,
    },
    ajvOptions,
  )

  let ajv = new Ajv(options)

  if (includeFormats) {
    ajv = AjvFormats(ajv)
  }
  for (const keywordDef of extraKeywords) {
    ajv.addKeyword(keywordDef)
  }
  if (includeKeywords) {
    ajv = AjvKeywords(ajv)
  }

  return ajv
}

const preCompilation = (
  filePath: string,
  fileContent: string | AnySchemaObject,
) => {
  const schema =
    typeof fileContent === 'string'
      ? (JSON.parse(fileContent) as AnySchemaObject)
      : fileContent
  schema.$id = `http://example.com/${path.relative(process.cwd(), filePath)}`
  return schema
}

const postCompilation = (code: string) => {
  const schemaVar = /const schema(.*) =/.exec(code)?.[1]
  if (!schemaVar) return code

  return (
    code +
    (code.includes('export const')
      ? `export const schema = schema${schemaVar}`
      : `exports.schema = schema${schemaVar};`)
  )
}

export const compileSchema = (
  filePath: string,
  fileContent: string | AnySchemaObject,
  options: Options,
) => {
  const schema = preCompilation(filePath, fileContent)

  const ajv = getAjvInstance(
    options.includeKeywords,
    options.includeFormats,
    options.extraKeywords,
    options.ajvOptions,
    schema,
  )

  const code = standaloneCode(ajv, {
    validator: schema.$id,
  })
  return postCompilation(code)
}

export default (options: Options = {}): Plugin => ({
  name: 'ajv-plugin',
  setup(build) {
    const compileWithCache = createBuildCache((filePath, fileContent) => {
      try {
        return compileSchema(filePath, fileContent, options)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Failed to compile schema', err)
        throw err
      }
    })

    build.onResolve(
      { filter: /\.ajv\.json$/i },
      async ({ path: rawPath, resolveDir }) => {
        const schemaPath = path.join(resolveDir, rawPath)
        const newPath = path.join(
          resolveDir,
          rawPath.replace(/\.ajv\.json$/i, '.ajv.js'),
        )

        const schema = await fs.readFile(schemaPath, 'utf8')
        const content = compileWithCache(newPath, schema)
        await fs.writeFile(newPath, content, 'utf8')

        return {
          path: newPath,
          namespace: 'ajv-validator',
        }
      },
    )

    build.onLoad(
      { namespace: 'ajv-validator', filter: /.*/ },
      async ({ path: filePath }) => {
        return {
          contents: await fs.readFile(filePath, 'utf8'),
          loader: 'js' as const,
          resolveDir: path.dirname(filePath),
        }
      },
    )
  },
})
