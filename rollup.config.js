/**
 * @fileoverview Rollup build config
 */

//Imports
import _ from 'lodash';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

//Global build config
const global = {
  input: 'src/index.ts',
  plugins: [
    commonjs(),
    typescript({
      rollupCommonJSResolveHack: true
    }),
    terser()
  ]
};

//CJS
const cjs = _.merge({
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs'
    }
  ],
  external: [
    'buffer',
    'events',
    'util'
  ]
}, global);
cjs.plugins.unshift(resolve({
  preferBuiltins: true
}));

//ES
const es = _.merge({
  output: [
    {
      dir: 'dist/es',
      format: 'es'
    }
  ]
}, global);
es.plugins.unshift(resolve({
  browser: true,
  preferBuiltins: false,
  mainFields: [
    'main'
  ]
}));

//Export
export default [cjs, es];