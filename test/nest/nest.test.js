// @flow
import path from 'path'
import { transformFileSync } from 'babel-core'
import plugin from '../../src'

test('nest snapshot', () => {
  const input = path.join(__dirname, 'actions.js')

  const { code } = transformFileSync(input, {
    babelrc: false,
    plugins: [
      [plugin, { input: path.join(__dirname, 'other/sub/actions.js') }],
    ],
  })
  expect(code).toMatchSnapshot()
})
