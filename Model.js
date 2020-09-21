// Copyright (C) 2019 Alina Inc. All rights reserved.

import { has, upperFirst } from 'lodash';

import q from './q';
import { COMPILE, constant, quoteId } from './util';

const columnKeywords = new Set([
  'Enum', 'by', 'check', 'dataType', 'default', 'name', 'notNull', 'primaryKey',
  'references', 'unique',
]);

export default class Model {
  constructor(row) {
    Object.assign(this, row);
  }

  static init(tableName, columns, { client, schema } = {}) {
    this.client = client;
    this.columns = columns;
    this.tableName = tableName;
    this.schemaName = schema;
    this.columns.forEach((column) => {
      if (typeof column === 'function') {
        return;
      }
      const { Enum, by, name } = column;
      if (name) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          throw new Error(`${name} property of ${this.tableName} already exists.`);
        }
        const enumKeys = new Set(Object.getOwnPropertyNames(Enum || {}));
        Object.defineProperty(this, name, {
          get() {
            const getName = () => `${this.getName()}.${quoteId(name)}`;
            return new Proxy(column, {
              get: (target, prop) => {
                if (columnKeywords.has(prop)) {
                  return target[prop];
                }
                if (enumKeys.has(prop)) {
                  return Enum[prop];
                }
                return q({ wrap: [getName()] })[prop];
              },
            });
          },
        });
        if (by) {
          this[`deleteBy${upperFirst(name)}`] = param => (
            this.delete().where(this[name], '=', param)
          );
          this[`selectBy${upperFirst(name)}`] = (param, fields) => (
            this.select(fields).where(this[name], '=', param)
          );
          this[`updateBy${upperFirst(name)}`] = (param, obj) => (
            this.update(obj).where(this[name], '=', param)
          );
        }
      }
    });
  }

  static [COMPILE]() {
    if (!this.alias) {
      return [this.getName()];
    }
    return [this.getLegitName(), 'AS', quoteId(this.alias)];
  }

  static as(alias) {
    class AS extends this {}
    AS.alias = alias;
    return AS;
  }

  static createIndex(columns, name, method) {
    return this.q().createIndex(this, columns, name, method);
  }

  static createIndexIfNotExists(columns, name, method) {
    if (!name) {
      throw new Error('index name is required');
    }
    return this.q().createIndexIfNotExists(this, columns, name, method);
  }

  static createUniqueIndex(columns, name, method) {
    return this.q().createUniqueIndex(this, columns, name, method);
  }

  static createUniqueIndexIfNotExists(columns, name, method) {
    if (!name) {
      throw new Error('index name is required');
    }
    return this.q().createUniqueIndexIfNotExists(this, columns, name, method);
  }

  static createTable() {
    return this.q().createTable(this, this.columns);
  }

  static createTableIfNotExists() {
    return this.q().createTableIfNotExists(this, this.columns);
  }

  static createSchema() {
    return this.q().createSchema(this.schemaName);
  }

  static createSchemaIfNotExists() {
    return this.q().createSchemaIfNotExists(this.schemaName);
  }

  static delete() {
    return this.q().delete().from(this);
  }

  static dropTable() {
    return this.q().dropTable(this);
  }

  static dropTableIfExists() {
    return this.q().dropTableIfExists(this);
  }

  static getColumns(names) {
    return (Array.isArray(names) ? names : Object.keys(names)).map((name) => {
      if (!this[name]) {
        throw new Error(`column ${name} does not exist.`);
      }
      return this[name];
    });
  }

  static getName() {
    if (this.alias) {
      return quoteId(this.alias);
    }
    return this.getLegitName();
  }

  static getLegitName() {
    const schemaName = this.schemaName ? [quoteId(this.schemaName)] : [];
    return schemaName.concat(quoteId(this.tableName)).join('.');
  }

  static insert(...rows) {
    if (rows.length === 1 && Array.isArray(rows[0])) {
      [rows] = rows; // eslint-disable-line no-param-reassign
    }
    const columns = this.getColumns(rows[0]);
    const values = rows.map((row) => {
      if (Object.keys(row).length !== columns.length) {
        throw new Error('Please check insert row.');
      }
      return columns.map((col) => {
        if (!has(row, col.name)) {
          throw new Error(`Missing ${col.name}`);
        }
        return row[col.name];
      });
    });
    return this.q().insertInto(this, columns).values(...values);
  }

  static q(instantiate = true) {
    return q({
      client: this.client,
      postProcess: rows => (
        (instantiate ? rows.map(row => new this(row)) : rows)
      ),
    });
  }

  static select(...fields) {
    return this.q().select(...fields).from(this);
  }

  static star() {
    return constant(`${this.getName()}.*`);
  }

  static update(obj) {
    const entries = Object.entries(obj).map(([key, val]) => {
      if (!this[key]) {
        throw new Error(`column ${key} does not exist.`);
      }
      return [this[key], val];
    });
    return this.q().update(this).set(...entries);
  }
}
