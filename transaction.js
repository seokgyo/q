// Copyright (C) 2019 Alina Inc. All rights reserved.

import { connect } from './postgres';

export default async (tx, name) => {
  const client = await connect(name).connect();
  try {
    await client.query('BEGIN');
    const result = await tx(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
