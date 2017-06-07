// @flow
import * as fs from 'fs'
import path from 'path'
import { transformFileSync } from 'babel-core'
import plugin from '../src'

const actionPath = path.resolve(__dirname, 'action')

for (const dir of fs.readdirSync(actionPath)) {
  test(dir, () => {
    const input = path.join(actionPath, dir, 'actions.js')

    const { code } = transformFileSync(input, {
      babelrc: false,
      plugins: [
        [plugin, { inputPath: path.join(actionPath, dir, 'other/actions.js') }],
      ],
    })
    expect(code).toMatchSnapshot(`${dir}`)
  })
}
