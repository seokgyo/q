# q #
Query builder for postgresql.
Inspired by node-sql[https://github.com/brianc/node-sql], and knex[https://github.com/knex/knex/].

# DB connection #
```
import { connect, end } from 'q';

connect('yo', { database: 'yo' }, true);
end();
```

# Model creation #
```
import { Model, decimal, id, refer, text } from 'q';

class User extends Model {}
User.init('users', [
  id(),
  text('email'),
  text('group'),
], { schema: 't' });

class Order extends Model {}
Order.init('orders', [
  id(),
  text('no'),
  refer(User, { notNull: true }),
  decimal(15,2)('price', { notNull: true }),
  builder => builder.unique(Order.no, Order.userId),
  builder => builder.check(Order.price, '>=', 0),
], { schema: 't' });
```

# Queries
```
import q, { left, length, max } from 'q';

await q().createSchemaIfNotExists('u')(pool);
await User.createTableIfNotExists()(pool);
await Order.createTableIfNotExists();

// insert
const [first, second] = await User
  .insert(
    { email: '1', group: 'g1' },
    { email: '2', group: 'g2' },
    { email: '3', group: 'g1' },
  )
  .returning(User.star());
const [order] = await Order.insert(
  { no: '1', userId: first.id },
  { no: '2', userId: second.id },
).returning(Order.star());

// select
await User.select(User.email)
  .where(User.email, '=', '1');
await User.selectById(1, User.star());

// update
await User.update({ email: 'update' })
  .where(User.id, '=', 1).returning(User.star());
await User.updateById(1, { email: 'yo' }).returning(User.star());

// delete
await Order.deleteById(order.id).returning(Order.star());

// join
await q().select(User.star(), Order.star())
  .from(User).join(Order)
  .on(User.id, '=', Order.userId);
await q().select(User.star(), Order.star())
  .from(User).join(Order, User.id, '=', Order.userId);

// select as
await User.select(User.id.as('userId'), User.email.as('userEmail'));

// join as
const asU = User.as('U');
const asO = Order.as('O');
await q().select(asU.star(), asO.id.as('orderId'), asO.no)
  .from(asU).join(asO, asU.id, '=', asO.userId);

// group by
await User.select(User.group)
  .groupBy(User.group).having().in(User.group, ['g1', 'g2']);

// functions
await q().select(length(left('123456', 3)).as('len'));
await User.select(max(User.id));

// subquery
const subquery = User.select(User.id);
await User.select(User.star()).where().in(User.id, subquery);

await Order.dropTableIfExists();
await User.dropTableIfExists();
await q().dropSchemaIfExists('t');
```

# Transaction
```
import q, { transaction } from 'q';

transaction(async (client) => {
  await User.insert({ email: '1', group: 't' })(client);
  await User.insert({ email: '2', group: 't' })(client);
}));
```
