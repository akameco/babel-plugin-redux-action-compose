// @flow
export type Node = {
  type: string,
  [key: string]: any,
}

export type Path = {
  type: string,
  node: Node,
  get: (path: 'body') => Array<Path>,
  get: (path: string) => Path,
  insertBefore: (path: any) => void,
  [key: string]: any,
}

export type State = {
  file: {
    opts: {
      filename: string,
    },
    ast: {
      comments: Array<*>,
    },
    [key: string]: any,
  },
  opts: {
    inputPath?: string,
  },
  [key: string]: any,
}
