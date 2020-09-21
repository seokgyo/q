// Copyright (C) 2019 Alina Inc. All rights reserved.

import {
  add, as, between, check, compare, createIndex, createTable, doUpdateSet, exists,
  extension, insertInto, isNull, join, key, notIn, schema, set, shortNamedFunc, values,
} from './callback';

export default [
  ['ADD CONSTRAINT'],
  ['ADD', { cb: add }],
  ['ALTER COLUMN'],
  ['ALTER TABLE'],
  ['AND', { cb: compare }],
  ['AS', { cb: as }],
  ['ASC'],
  ['BACKUP DATABASE'],
  ['BETWEEN', { cb: between }],
  ['CASCADE'],
  ['CASE'],
  ['CHECK', { cb: check }],
  ['COLUMN'],
  ['CONSTRAINT'],
  ['CREATE EXTENSION', { cb: extension }],
  ['CREATE EXTENSION IF NOT EXISTS', { cb: extension }],
  ['CREATE INDEX IF NOT EXISTS', { cb: createIndex, parameterized: false }],
  ['CREATE INDEX', { cb: createIndex, parameterized: false }],
  ['CREATE SCHEMA IF NOT EXISTS', { cb: schema }],
  ['CREATE SCHEMA', { cb: schema }],
  ['CREATE TABLE IF NOT EXISTS', { cb: createTable, parameterized: false }],
  ['CREATE TABLE', { cb: createTable, parameterized: false }],
  ['CREATE UNIQUE INDEX IF NOT EXISTS', { cb: createIndex, parameterized: false }],
  ['CREATE UNIQUE INDEX', { cb: createIndex, parameterized: false }],
  ['DEFAULT'],
  ['DELETE'],
  ['DESC'],
  ['DISTINCT'],
  ['DO NOTHING'],
  ['DO UPDATE SET', { cb: doUpdateSet }],
  ['DROP COLUMN'],
  ['DROP CONSTRAINT'],
  ['DROP DEFAULT'],
  ['DROP INDEX'],
  ['DROP SCHEMA IF EXISTS', { cb: schema }],
  ['DROP SCHEMA', { cb: schema }],
  ['DROP TABLE IF EXISTS'],
  ['DROP TABLE'],
  ['EXISTS', { cb: exists }],
  ['FOREIGN KEY'],
  ['FOR UPDATE'],
  ['FROM'],
  ['FULL OUTER JOIN', { cb: join }],
  ['GROUP BY'],
  ['HAVING', { cb: compare }],
  ['IF EXISTS'],
  ['IF NOT EXISTS'],
  ['IN', { cb: notIn }],
  ['INNER JOIN', { cb: join }],
  ['INSERT INTO', { cb: insertInto }],
  ['IS NOT NULL', { cb: isNull }],
  ['IS NULL', { cb: isNull }],
  ['JOIN', { cb: join }],
  ['LEFT JOIN', { cb: join }],
  ['LIKE'],
  ['LIMIT'],
  ['NOT BETWEEN', { cb: between }],
  ['NOT EXISTS', { cb: exists }],
  ['NOT IN', { cb: notIn }],
  ['NOT NULL'],
  ['NOT', { cb: compare }],
  ['ON CONFLICT', { cb: shortNamedFunc }],
  ['ON DELETE'],
  ['ON', { cb: compare }],
  ['OR', { cb: compare }],
  ['ORDER BY'],
  ['OUTER JOIN', { cb: join }],
  ['PRIMARY KEY', { cb: shortNamedFunc }],
  ['REFERENCES'],
  ['RETURNING', { arrayAsArgs: true, comma: true }],
  ['RIGHT JOIN', { cb: join }],
  ['SELECT DISTINCT', { comma: true }],
  ['SELECT', { arrayAsArgs: true, comma: true }],
  ['SET', { cb: set }],
  ['SIMILAR TO'],
  ['NOT SIMILAR TO'],
  ['TRUNCATE'],
  ['UNIQUE', { cb: shortNamedFunc }],
  ['UPDATE'],
  ['VALUES', { cb: values }],
  ['WHERE', { cb: compare }],
  ['-', { alias: 'minus' }],
  ['->', { alias: 'key', cb: key }],
  ['->>', { alias: 'keyText', cb: key }],
  ['#>'],
  ['#>>'],
  ['!!'],
  ['!'],
  ['?'],
  ['?&'],
  ['?|'],
  ['@'],
  ['@>', { alias: 'contains' }],
  ['*'],
  ['/'],
  ['&'],
  ['#-'],
  ['#'],
  ['%'],
  ['^'],
  ['+', { alias: 'plus' }],
  ['<@', { alias: 'containedBy' }],
  ['<<'],
  ['>>'],
  ['|'],
  ['|/'],
  ['||', { alias: 'concat' }],
  ['||/'],
  ['~'],
  ['~*'],
  ['!~'],
  ['!~*'],
];