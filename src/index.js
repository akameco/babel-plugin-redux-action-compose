// @flow
import { relative, normalize, dirname, extname } from 'path'
import * as t from 'babel-types'
import flowSyntax from 'babel-plugin-syntax-flow'
import { loadFileSync } from 'babel-file-loader'
import { explodeModule } from 'babel-explode-module'
import { addFlowComment } from 'babel-add-flow-comments'
import upperCamelCase from 'uppercamelcase'
import type { Path, State } from './types'

function hasAction(path: Path) {
  const name = path.get('id').get('name').node
  if (name !== 'Action') {
    return false
  }
  if (!t.isExportNamedDeclaration(path.parentPath)) {
    return false
  }
  return true
}

function isActionFile(path: Path): boolean {
  let isActionFile = false
  path.traverse({
    TypeAlias(path: Path) {
      if (hasAction(path)) {
        isActionFile = true
      }
    },
  })
  return isActionFile
}

function getImportPath(from: string, to: string): string {
  const relativePath = relative(dirname(from), to)
  const fomattedPath =
    extname(relativePath) === '.js'
      ? relativePath.replace('.js', '')
      : relativePath
  if (!/^\.\.?/.test(fomattedPath)) {
    return `./${fomattedPath}`
  }
  return fomattedPath
}

function actionName(path: string) {
  const parentPath = normalize(dirname(path)).split('/')
  return upperCamelCase(parentPath[parentPath.length - 1]) + 'Action'
}

export default () => {
  return {
    inherits: flowSyntax,
    visitor: {
      // eslint-disable-next-line
      Program(path: Path, { file, opts }: State) {
        if (!opts.input) {
          return false
        }

        const { filename: from } = file.opts
        const to = opts.input
        const importPath = getImportPath(from, to)

        try {
          const inputFile = loadFileSync(to)
          if (!isActionFile(inputFile.path)) {
            return false
          }

          // already imported?
          const exploded = explodeModule(path.node)
          const hasAction = exploded.imports.some(v => {
            return v.kind === 'type' && v.source === importPath
          })

          if (hasAction) {
            return false
          }

          for (const item /* : Path */ of path.get('body')) {
            if (t.isImportDeclaration(item)) {
              continue
            }

            const specifiers = [
              t.importSpecifier(
                // ./other/action.js → OtherAction
                t.identifier(actionName(importPath)),
                t.identifier('Action')
              ),
            ]
            const importAction = t.importDeclaration(
              specifiers,
              t.stringLiteral(importPath)
            )
            // $FlowFixMe
            importAction.importKind = 'type'
            item.insertBefore(importAction)
            item.insertBefore(t.noop())
          }
        } catch (err) {
          if (err.code !== 'ENOENT') {
            throw err
          }

          // remove `import type notFound from 'path not found'`
          for (const item of path.get('body')) {
            if (
              t.isImportDeclaration(item) &&
              item.node.source.value === importPath
            ) {
              item.remove()
            }
          }
        }

        if (path.node.body.length > 0) {
          // create `export type Action = A | B | C`
          const exploded = explodeModule(path.node)
          // babelLog(path.node)
          const actions = exploded.imports
            .filter(v => v.kind === 'type')
            .map(v => t.identifier(v.local))

          // remove `type Action`
          path.traverse({
            TypeAlias(path: Path) {
              if (path.node.id.name === 'Action') {
                path.remove()
              }
            },
          })

          if (actions.length === 0) {
            return false
          }

          path.pushContainer(
            'body',
            // export
            t.exportNamedDeclaration(
              // type Action = UnionType
              t.typeAlias(
                t.identifier('Action'),
                null,
                t.unionTypeAnnotation(actions)
              ),
              [],
              null
            )
          )

          // add `// @flow`
          addFlowComment(path)
        }
      },
    },
  }
}
