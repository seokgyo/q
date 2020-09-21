// Copyright (C) 2019 Alina Inc. All rights reserved.

import { flatten } from 'lodash';

import { cast, parens } from '../util';

// eslint-disable-next-line import/prefer-default-export
export const buildObject = (keyword, args) => {
  if (args.length === 0 || args.length % 2 === 1) {
    throw Error('Invalid sql arguments.');
  }
  const casted = args.map((arg, i) => {
    if (i % 2 === 0 && typeof arg === 'string') {
      return cast(arg, 'TEXT');
    }
    return arg;
  });
  return [keyword, ...flatten(parens(casted))];
};
