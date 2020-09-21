// Copyright (C) 2019 Alina Inc. All rights reserved.

/* eslint-env jest */

import { jsonbAgg, jsonbBuildObject } from './functions';
import {
  Model, connect, end, id, int, json, jsonb, lower, text,
} from './index';
import { COMPILE } from './util';

const checkQuery = (q, expected) => expect(q.toQuery()).toEqual(expected);
const checkConstant = (constant, expected) => expect(constant[COMPILE]()).toEqual(expected);

beforeAll(() => connect('test', { database: 'test' }, true));
afterAll(() => end());

describe('Model', () => {
  test('as', () => {
    const alias = 'foo';
    class Test extends Model {}
    Test.init('model_tests', []);

    const Foo = Test.as(alias);
    expect(Foo.alias).toBe(alias);
    expect(Foo.getName()).toBe(`"${alias}"`);
    checkConstant(Foo.star(), [`"${alias}".*`]);
  });

  describe('columns', () => {
    test('get', () => {
      class Test extends Model {}
      Test.init('test', [text('foo'), text('bar')]);
      expect(Test).toHaveProperty('foo');
      expect(Test).toHaveProperty('bar');
    });

    test('conflict', () => {
      class Test extends Model {}
      expect(() => Test.init('test', [text('name')])).toThrow('already exists');
    });

    test('as', () => {
      class Test extends Model {}
      Test.init('test', [text('foo')]);
      checkQuery(Test.foo.as('bar'), {
        text: '"test"."foo" AS "bar"',
        values: [],
      });
      checkQuery(Test.foo.as('yo'), {
        text: '"test"."foo" AS "yo"',
        values: [],
      });
    });

    test('asc / desc', () => {
      class Test extends Model {}
      Test.init('test', [text('foo')]);
      checkQuery(Test.foo.desc(), {
        text: '"test"."foo" DESC',
        values: [],
      });
      checkQuery(Test.foo.asc(), {
        text: '"test"."foo" ASC',
        values: [],
      });
    });

    test('op', () => {
      class Test extends Model {}
      Test.init('test', [json('foo')]);
      checkQuery(Test.foo['->']('bar'), {
        text: '"test"."foo" -> $1',
        values: ['bar'],
      });
      checkQuery(Test.foo.key('bar'), {
        text: '"test"."foo" -> $1',
        values: ['bar'],
      });
    });
  });

  describe('create table', () => {
    test('basic', () => {
      class Test extends Model {}
      Test.init('test', [
        id(),
        text('foo', { notNull: true }),
      ]);
      checkQuery(Test.createTable(), {
        text: 'CREATE TABLE "test" ( "id" serial PRIMARY KEY , "foo" text NOT NULL )',
        values: [],
      });
    });

    test('schema', () => {
      class Test extends Model {}
      Test.init('test', [
        id(),
        text('foo', { notNull: true }),
      ], { schema: 't' });
      checkQuery(Test.createTable(), {
        text: 'CREATE TABLE "t"."test" ( "id" serial PRIMARY KEY , "foo" text NOT NULL )',
        values: [],
      });
    });

    test('constraints', () => {
      class Test extends Model {}
      Test.init('test', [
        id(),
        int('bar'),
        text('foo', { notNull: true }),
        builder => builder.unique(Test.bar, Test.foo),
        builder => builder.check(Test.bar, '>=', 0),
      ], { schema: 't' });
      checkQuery(Test.createTable(), {
        text: 'CREATE TABLE "t"."test" ( '
              + '"id" serial PRIMARY KEY , "bar" int , "foo" text NOT NULL , '
              + 'UNIQUE ( "bar" , "foo" ) , CHECK ( "t"."test"."bar" >= 0 ) )',
        values: [],
      });
    });
  });

  describe('create / drop', () => {
    class Test extends Model {}
    Test.init('test', []);

    test('create table if not exists', () => {
      checkQuery(Test.createTableIfNotExists(), {
        text: 'CREATE TABLE IF NOT EXISTS "test" ( )',
        values: [],
      });
    });

    test('drop table', () => {
      checkQuery(Test.dropTable(), {
        text: 'DROP TABLE "test"',
        values: [],
      });
    });

    test('drop table if exists', () => {
      checkQuery(Test.dropTableIfExists(), {
        text: 'DROP TABLE IF EXISTS "test"',
        values: [],
      });
    });
  });

  describe('index', () => {
    class Test extends Model {}
    Test.init('test', [text('foo'), int('bar')]);

    describe('create index', () => {
      test('single column', async () => {
        checkQuery(Test.createIndex([Test.foo]), {
          text: 'CREATE INDEX ON "test" ( "foo" )',
          values: [],
        });
      });

      test('multi columns', async () => {
        checkQuery(Test.createIndex([Test.foo, Test.bar]), {
          text: 'CREATE INDEX ON "test" ( "foo" , "bar" )',
          values: [],
        });
      });

      test('expression', async () => {
        checkQuery(Test.createIndex([lower(Test.foo)]), {
          text: 'CREATE INDEX ON "test" ( LOWER ( "test"."foo" ) )',
          values: [],
        });
      });

      test('if not exists', async () => {
        checkQuery(Test.createIndexIfNotExists([Test.foo], 'foo_idx'), {
          text: 'CREATE INDEX IF NOT EXISTS "foo_idx" ON "test" ( "foo" )',
          values: [],
        });
      });

      test('unique', async () => {
        checkQuery(Test.createUniqueIndex([Test.foo]), {
          text: 'CREATE UNIQUE INDEX ON "test" ( "foo" )',
          values: [],
        });
      });

      test('where', async () => {
        checkQuery(Test.createIndex([Test.bar]).where(Test.bar, '>', 0), {
          text: 'CREATE INDEX ON "test" ( "bar" ) WHERE ( "test"."bar" > 0 )',
          values: [],
        });
      });
    });
  });

  describe('insert', () => {
    class Test extends Model {}
    Test.init('test', [id(), text('foo')]);

    const obj = { foo: 'bar' };

    beforeAll(() => Test.createTable());
    afterAll(() => Test.dropTable());

    test('single', async () => {
      expect(await Test.insert(obj)).toEqual([]);
    });

    test('single return', async () => {
      const tests = await Test.insert(obj).returning(Test.foo);
      expect(tests).toEqual([obj]);
      tests.forEach(test => expect(test).toBeInstanceOf(Test));
    });

    test('multiple', async () => {
      const tests = await Test.insert(obj, obj, obj).returning(Test.foo);
      expect(tests).toEqual([obj, obj, obj]);
      tests.forEach(test => expect(test).toBeInstanceOf(Test));
    });
  });

  describe('select', () => {
    class Test extends Model {}
    Test.init('test', [id(), text('foo')]);

    const obj = { foo: 'bar' };

    beforeAll(async () => {
      await Test.createTable();
      await Test.insert(Array(10).fill(obj));
    });
    afterAll(() => Test.dropTable());

    test('limit 1', async () => {
      const result = await Test.select(Test.star()).limit(1);
      expect(result.length).toBe(1);
    });

    test('limit 2', async () => {
      const result = await Test.select(Test.star()).limit(2);
      expect(result.length).toBe(2);
    });

    describe('where', () => {
      test('basic', () => {
        checkQuery(Test.select(Test.star()).where(Test.id, '=', 1), {
          text: 'SELECT "test".* FROM "test" WHERE ( "test"."id" = $1 )',
          values: [1],
        });
      });

      test('and', () => {
        checkQuery(Test.select(Test.star()).where(Test.id, '=', 1).and(Test.id, '<>', 2), {
          text: 'SELECT "test".* FROM "test" WHERE ( "test"."id" = $1 ) AND ( "test"."id" <> $2 )',
          values: [1, 2],
        });
      });

      test('or', () => {
        checkQuery(Test.select(Test.star()).where(Test.id, '=', 1).or(Test.id, '<>', 2), {
          text: 'SELECT "test".* FROM "test" WHERE ( "test"."id" = $1 ) OR ( "test"."id" <> $2 )',
          values: [1, 2],
        });
      });
    });
  });

  describe('json', () => {
    class Test extends Model {}
    Test.init('test', [id(), json('foo')]);

    const bar = 'bar';
    const num = 1;
    const obj = { foo: { bar, num } };

    beforeAll(() => Test.createTable());
    afterAll(() => Test.dropTable());

    test('insert', async () => {
      const tests = await Test.insert(obj).returning(Test.foo);
      expect(tests).toEqual([obj]);
      tests.forEach(test => expect(test).toBeInstanceOf(Test));
    });

    test('op', async () => {
      const [test] = await Test.insert(obj).returning(Test.star());
      // key
      expect(
        await Test.selectById(test.id, Test.foo['->'](bar).as(bar)),
      ).toEqual([{ bar }]);
      expect(
        await Test.selectById(test.id, Test.foo['->']('num').as('num')),
      ).toEqual([{ num }]);

      // key text
      expect(
        await Test.selectById(test.id, Test.foo['->>'](bar).as(bar)),
      ).toEqual([{ bar }]);
      expect(
        await Test.selectById(test.id, Test.foo['->>']('num').as('num')),
      ).toEqual([{ num: num.toString() }]);

      // alias
      expect(
        await Test.selectById(test.id, Test.foo.key(bar).as(bar)),
      ).toEqual([{ bar }]);
      expect(
        await Test.selectById(test.id, Test.foo.key('num').as('num')),
      ).toEqual([{ num }]);
    });

    test('array', async () => {
      const array = ['a', 'b', 'c'];
      const [test] = await Test.insert({
        foo: JSON.stringify(array),
      }).returning(Test.star());
      expect(test.foo).toEqual(array);

      // NOTE: can't use a key access due to a bug in node-postgres
      // Test.selectById(test.id, Test.foo.key(0).as('zero'));
      expect(
        await Test.selectById(test.id, Test.foo.key(0, { constant: true }).as('zero')),
      ).toEqual([{ zero: 'a' }]);
    });
  });

  describe('jsonb', () => {
    class Test extends Model {}
    Test.init('test', [id(), jsonb('foo')]);

    const bar = 'bar';
    const num = 1;
    const obj = { foo: { bar, num } };

    beforeAll(() => Test.createTable());
    afterAll(() => Test.dropTable());

    test('contains', async () => {
      const [test] = await Test.insert(obj).returning(Test.star());

      expect(
        await Test.select(Test.star()).where(Test.id, test.id).and(Test.foo['@>']({ bar })),
      ).toEqual([test]);
      expect(
        await Test.select(Test.star()).where(Test.id, test.id).and(Test.foo.contains({ bar })),
      ).toEqual([test]);
      expect(
        await Test.select(Test.star()).where(Test.id, test.id).and(Test.foo, '@>', { bar }),
      ).toEqual([test]);
    });
  });

  describe('jsonAgg', () => {
    class Test extends Model {}
    Test.init('foo', [id(), json('foo')]);

    beforeAll(() => Test.createTable());
    afterAll(() => Test.dropTable());

    const bar = 'bar';
    const num = 1;
    const obj = { foo: { bar, num } };

    test('jsonAgg with key', async () => {
      const [test] = await Test.insert(obj).returning(Test.star());
      const [{ aggObject }] = await Test
        .select(jsonbAgg(Test.star()).key(0, { constant: true }).as('aggObject'))
        .where(Test.id, '=', test.id);
      expect(aggObject).toEqual(test);
    });
  });

  describe('jsonBuildObject', () => {
    class Test extends Model {}
    Test.init('foo', [id(), json('foo')]);

    beforeAll(() => Test.createTable());
    afterAll(() => Test.dropTable());

    const bar = 'bar';
    const num = 1;
    const obj = { foo: { bar, num } };

    test('select with jsonbBuildObject', async () => {
      const [test] = await Test.insert(obj).returning(Test.star());
      const [{ object }] = await Test
        .select(jsonbBuildObject('fooObject', Test.foo).as('object'))
        .where(Test.id, '=', test.id);
      expect(object).toEqual({ fooObject: test.foo });
    });
  });
});
