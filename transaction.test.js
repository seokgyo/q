// Copyright (C) 2019 Alina Inc. All rights reserved.

/* eslint-env jest */

import {
  Model, connect, count, end, id, text, transaction,
} from './index';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class Test extends Model {}
Test.init('transaction_tests', [
  id(),
  text('test', { notNull: true, unique: true }),
]);

const checkCount = async (cnt, client) => {
  expect(await Test.select(count().as('cnt'))(client)).toEqual([{ cnt: cnt.toString() }]);
};

beforeAll(() => connect('test', { database: 'test' }, true));
afterAll(() => end());

describe('transaction', () => {
  beforeAll(() => Test.createTable());
  beforeEach(() => Test.delete());
  afterAll(() => Test.dropTable());

  test('empty', () => expect(transaction(() => {})).resolves.toBeUndefined());

  test('return', () => expect(transaction(() => 'FOO')).resolves.toEqual('FOO'));

  test('commit', async () => {
    await expect(transaction(async (client) => {
      await Test.insert({ test: 'test' })(client);
      await checkCount(1, client);
      await checkCount(0);
    })).resolves.toBeUndefined();
    await checkCount(1);
  });

  test('rollback', async () => {
    await expect(transaction(async (client) => {
      await Test.insert({ test: 'test' })(client);
      await checkCount(1, client);
      await Test.insert({})(client);
    })).rejects.toThrow();
    await checkCount(0);
  });

  test('conflict', async () => {
    const run = async (client) => {
      await Test.insert({ test: 'test' })(client);
      await sleep(100);
    };
    await expect(
      Promise.all([transaction(run), transaction(run)]),
    ).rejects.toThrow();
    await checkCount(1);
  });
});
