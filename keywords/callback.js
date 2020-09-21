// Copyright (C) 2019 Alina Inc. All rights reserved.

import { flatten } from 'lodash';

import {
  AND, ASSIGN, CLOSE_PAREN, COMPILE, OPEN_PAREN, comma, constant, parens, quoteId,
} from '../util';

const shortColumnName = column => ({ [COMPILE]: () => [quoteId(column.name)] });
const excludedColumnName = column => ({ [COMPILE]: () => [`EXCLUDED.${quoteId(column.name)}`] });

const ops = new Set([
  '!=', '<', '<=', '<>', '=', '>', '>=', '~', '~*', '!~', '!~*', '@>', '<@', '?', '?|', '?&',
  'like', 'not like', 'similar to', 'not similar to',
]);

export const compare = (keyword, args, opts) => {
  const list = opts.tokens.length ? [keyword] : [];
  switch (args.length) {
    case 0:
      return list;
    case 1:
      return list.concat([OPEN_PAREN, args[0], CLOSE_PAREN]);
    case 2:
      return list.concat([
        OPEN_PAREN,
        args[0],
        constant('='),
        args[1],
        CLOSE_PAREN,
      ]);
    case 3: {
      if (!ops.has(args[1])) {
        throw Error('Invalid operator.');
      }
      return list.concat([
        OPEN_PAREN,
        args[0],
        constant(args[1]),
        args[2],
        CLOSE_PAREN,
      ]);
    }
    default:
      throw Error('Invalid sql arguments.');
  }
};

// NOTE: 'in' is reserved.
export const notIn = (keyword, args) => {
  if (args.length !== 2) {
    throw Error('Invalid sql arguments.');
  }
  const array = Array.isArray(args[1]) ? args[1] : [args[1]];
  return [args[0], keyword, ...parens(array)];
};

export const between = (keyword, args) => {
  if (args.length !== 3) {
    throw Error('Invalid sql arguments.');
  }
  return [args[0], keyword, args[1], AND, args[2]];
};

export const exists = (keyword, args) => {
  if (args.length !== 1) {
    throw Error('Invalid sql arguments.');
  }
  return [keyword, OPEN_PAREN, args[0], CLOSE_PAREN];
};

export const isNull = (keyword, args) => {
  if (args.length !== 1) {
    throw Error('Invalid sql arguments.');
  }
  return [args[0], keyword];
};

const valueToConstant = arg => (
  typeof args === 'function' || arg[COMPILE] ? arg : constant(arg.toString())
);

export const check = (...args) => compare(...args).map(valueToConstant);

export const as = (keyword, [alias]) => [keyword, constant(quoteId(alias))];

const options = new Set([
  'check', 'default', 'notNull', 'primaryKey', 'references', 'unique',
]);

const defineColumn = ({ dataType, name, ...opts }) => [
  constant(quoteId(name)),
  constant(typeof dataType === 'function' ? dataType() : dataType),
  (builder) => {
    Object.entries(opts).forEach(([key, value]) => {
      if (options.has(key)) {
        if (value[COMPILE]) {
          builder[key](value);
        } else if (typeof value === 'function') {
          value(builder, constant(quoteId(name)));
        } else if (key === 'default') {
          builder[key](value);
        } else if (value === true) {
          builder[key]();
        } else if (value !== false) {
          // TODO: check if this is supported.
          builder[key](value);
        }
      }
    });
  },
];

export const createTable = (keyword, [table, columns]) => [keyword, table]
  .concat(...flatten(parens(columns.map(c => (typeof c === 'function' ? c : defineColumn(c))))));

export const schema = (keyword, [name]) => [keyword, constant(quoteId(name))];

export const extension = (keyword, [name]) => [keyword, constant(quoteId(name))];

export const insertInto = (keyword, [table, columns]) => (
  [keyword, table].concat(parens(columns.map(shortColumnName)))
);

export const join = (keyword, [table, ...on]) => (
  [keyword, table].concat(on.length ? builder => builder.on(...on) : [])
);

export const set = (keyword, updates) => {
  const assigned = updates.map(([col, val]) => [shortColumnName(col), ASSIGN, val]);
  return [keyword, ...flatten(comma(assigned))];
};

export const values = (keyword, rows) => (
  [keyword, ...flatten(comma(rows.map(row => parens(row))))]
);

export const shortNamedFunc = (keyword, args) => (
  [keyword].concat(args.length ? parens(args.map(shortColumnName)) : [])
);

const methods = new Set(['btree', 'brin', 'gin', 'gist', 'hash', 'spgist']);

export const createIndex = (keyword, [table, columns, name, method]) => {
  const ret = [keyword];
  if (name) {
    ret.push(constant(quoteId(name)));
  }
  ret.push(constant('ON'), table);
  if (method) {
    if (!methods.has(method)) {
      throw new Error('Unsupported indexing method');
    }
    ret.push(constant('USING'), constant(method));
  }
  // FIXME: improve column detection
  const shorten = columns.map(c => (c.name && typeof c === 'object' ? shortColumnName(c) : c));
  ret.push(...parens(shorten));
  return ret;
};

export const add = (keyword, [column]) => [keyword].concat(defineColumn(column));

export const doUpdateSet = (keyword, columns) => {
  const assigned = columns.map(
    col => [shortColumnName(col), ASSIGN, excludedColumnName(col)],
  );
  return [keyword].concat(flatten(comma(assigned)));
};

export const key = (keyword, [k, opt]) => {
  if (opt && opt.constant) {
    return [keyword, constant(k)];
  }
  return [keyword, k];
};
