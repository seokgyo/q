// Copyright (C) 2019 Alina Inc. All rights reserved.

import camelCase from 'camelcase';
import pluralize from 'pluralize';

import { currentTimestamp, encode, genRandomBytes, replace } from './functions';

const field = dataType => (name, opts = {}) => Object.assign({ dataType, name }, opts);

export const bigId = () => field('bigserial')('id', { by: true, primaryKey: true });
export const bigint = field('bigint');
export const bigSerial = field('bigserial');
export const bool = field('bool');
export const by = true;
export const cidr = field('cidr');
export const date = field('date');
export const decimal = (p, s = 0) => field(`decimal(${p}, ${s})`);
export const id = () => field('serial')('id', { by: true, primaryKey: true });
export const int = field('int');
export const json = field('json');
export const jsonb = field('jsonb');
export const notNull = true;
export const real = field('real');
export const serial = field('serial');
export const text = field('text');
export const time = field('time');
export const timestamp = field('timestamp');
export const timestampWithTimeZone = field('timestamp with time zone');
export const unique = true;
export const uuid = field('uuid');

export const refer = (model, opts = {}) => {
  const dataType = () => {
    if (!model.id) {
      throw new Error(`Model [${model.name}] should have ID.`);
    }
    switch (model.id.dataType) {
      case 'serial':
        return 'int';
      case 'bigserial':
        return 'bigint';
      default:
        return model.id.dataType;
    }
  };
  const references = (builder) => {
    builder.references(model);
    if (opts.onDelete) {
      builder.onDelete()[opts.onDelete]();
    }
  };
  const name = opts.name || `${camelCase(pluralize.singular(model.tableName))}Id`;
  return field(dataType)(name, Object.assign({
    references,
  }, opts));
};

// FIXME: remove these types when publishing.
export const createdAt = () => timestampWithTimeZone(
  'createdAt', { default: currentTimestamp() },
);
export const updatedAt = () => timestampWithTimeZone(
  'updatedAt', { default: currentTimestamp() },
);
export const ID = () => text('ID', {
  by: true,
  // FIXME: remove single quotes from regex.
  check: (builder, col) => builder.check(col, '~', "'[A-Za-z0-9+-]{8}'"),
  default: replace(encode(genRandomBytes(6), 'base64'), '/', '-'),
  notNull,
  unique,
});
