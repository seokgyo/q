// Copyright (C) 2019 Alina Inc. All rights reserved.

import { isNil } from 'lodash';
import { Pool } from 'pg';

export const DEFAULT = Symbol('default');

const pools = new Map();

export const connect = (name, config, isDefault) => {
  const get = (key) => {
    if (!pools.has(key)) {
      throw new Error("Can't find default connection");
    }
    return pools.get(key);
  };

  if (isNil(name)) {
    return get(DEFAULT);
  }
  if (isNil(config)) {
    return get(name);
  }
  if (!pools.has(name)) {
    const pool = typeof config === 'object' ? new Pool(config) : get(config);
    pools.set(name, pool);
    if (isDefault) {
      pools.set(DEFAULT, pool);
    }
  }
  return pools.get(name);
};

export const end = () => {
  const all = [];
  pools.forEach((pool, key) => key !== DEFAULT && all.push(pool.end()));
  pools.clear();
  return Promise.all(all);
};
