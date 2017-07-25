# babel-plugin-redux-action-compose [![Build Status](https://travis-ci.org/akameco/babel-plugin-redux-action-compose.svg?branch=master)](https://travis-ci.org/akameco/babel-plugin-redux-action-compose)

> compose Action type


## Install

```
$ npm install babel-plugin-redux-action-compose
```

## Example

### In:

action.js

```js
// @flow
import type { Action as Other2Action } from './other2/actions'

export type Action = Other2Action
```

other/action.js

```js
// @flow
export type Action = { +type: 'A_TYPE' }
```

### Out:

```js
// @flow
import type { Action as Other2Action } from './other2/actions';

import type { Action as OtherAction } from './other/actions';

export type Action = Other2Action | OtherAction;
```

## Usage

.babelrc

```js
{
  "plugins": [
    ["redux-action-compose", {input: 'othre/action.js'}]
  ]
}
```

## License

MIT © [akameco](https://akameco.github.io)
