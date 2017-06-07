// @flow
import { transform } from 'babel-core'
import plugin from '../src'

export default function transformCode(
  input /* : string */,
  opts /* : ?Object */ = {}
) {
  const { code } = transform(input, {
    plugins: [[plugin, opts]],
  })
  return code
}
