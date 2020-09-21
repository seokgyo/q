// Copyright (C) 2019 Alina Inc. All rights reserved.

import camelCase from 'camelcase';

import keywords from './keywords';
import { connect } from './postgres';
import {
  COMPILE, VALUE, comma, constant, parens,
} from './util';

const keywordsMap = keywords.reduce((acc, [keyword, opts = {}]) => {
  const key = keyword.match(/^[a-zA-Z ]+$/g) ? camelCase(keyword) : keyword;
  if (acc[key]) {
    throw new Error(`Keyword Conflict: ${keyword}`);
  }
  acc[key] = [keyword, opts];
  if (opts.alias) {
    acc[opts.alias] = [keyword, opts];
  }
  return acc;
}, {});

export default (option) => {
  const options = Object.assign({}, option);
  const tokens = options.wrap ? options.wrap : [];

  const handler = ([keyword, opts = {}]) => (...args) => {
    const list = [];
    if (opts.parameterized === false) {
      options.parameterized = false;
    }
    if (opts.arrayAsArgs && args.length === 1 && Array.isArray(args[0])) {
      [args] = args; // eslint-disable-line no-param-reassign
    }
    if (opts.cb) {
      list.push(...opts.cb(constant(keyword), args, { tokens }));
    } else {
      list.push(constant(keyword));
      if (opts.func) {
        let newArgs = args;
        if (args.length === 0 && opts.default) {
          newArgs = args.concat(opts.default);
        }
        list.push(...parens(newArgs));
      } else if (opts.comma) {
        list.push(...comma(args));
      } else {
        list.push(...args);
      }
    }
    list.forEach((item) => {
      if (item && item[COMPILE]) {
        tokens.push(...item[COMPILE]());
      } else if (typeof item === 'function') {
        // eslint-disable-next-line no-use-before-define
        item(proxy);
      } else {
        tokens.push({ [VALUE]: item });
      }
    });
    return proxy; // eslint-disable-line no-use-before-define
  };

  const postProcess = options.postProcess || (rows => rows);

  function builder(client) {
    return (client || connect(options.client)).query(builder.toQuery())
      .then(({ rows }) => postProcess(rows));
  }
  builder[COMPILE] = () => tokens;
  builder.function = (name, opts = {}) => handler(
    [name, Object.assign({ func: true }, opts)],
  );
  builder.then = (resolve, reject) => builder().then(resolve, reject);
  builder.toQuery = () => {
    const text = [];
    const values = [];
    let index = 0;
    tokens.forEach((token) => {
      if (typeof token === 'string') {
        text.push(token);
      } else if (Object.prototype.hasOwnProperty.call(token, VALUE)) {
        if (options.parameterized === false) {
          if (typeof token[VALUE] === 'string') {
            text.push(`'${token[VALUE]}'`);
          } else {
            text.push(token[VALUE]);
          }
        } else {
          index += 1;
          text.push(`$${index}`);
          values.push(token[VALUE]);
        }
      } else {
        throw new Error('Unexpected query token.');
      }
    });
    return {
      text: text.join(' '),
      values,
    };
  };

  const proxy = new Proxy(builder, {
    get: (target, prop) => {
      if (!target[prop] && typeof prop === 'string' && prop !== 'inspect') {
        if (!keywordsMap[prop]) {
          throw new Error(`${prop} is not yet supported.`);
        }
        // eslint-disable-next-line no-param-reassign
        target[prop] = handler(keywordsMap[prop]);
      }
      return target[prop];
    },
  });
  return proxy;
};
