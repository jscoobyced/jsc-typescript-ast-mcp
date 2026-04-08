import path from 'path'
import { getComponentTree } from './ts-morph/componentTree.js'

const rootDir =
  __dirname === 'dist'
    ? path.resolve(__dirname, '../../')
    : __dirname === 'code'
      ? path.resolve(__dirname, '../')
      : __dirname

const testApp = getComponentTree(
  path.resolve(rootDir, 'sample-app/src/App.tsx'),
  5,
  'my-data-id',
)

console.log(JSON.stringify(testApp, null, 2))
