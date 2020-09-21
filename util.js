// Copyright (C) 2019 Alina Inc. All rights reserved.

export const COMPILE = Symbol('compile');
export const VALUE = Symbol('value');

export const constant = val => ({ [COMPILE]: () => [val.toString()] });

export const AND = constant('AND');
export const ASSIGN = constant('=');
export const CLOSE_PAREN = constant(')');
export const OPEN_PAREN = constant('(');

export const star = constant('*');

export const cast = (arg, to) => [arg, constant('::'), constant(to)];

export const comma = (args) => {
  const list = [];
  args.forEach((val, index) => {
    list.push(val);
    if (index !== args.length - 1) {
      list.push(constant(','));
    }
  });
  return list;
};

export const parens = args => [OPEN_PAREN, ...comma(args), CLOSE_PAREN];

// Comment from https://www.postgresql.org/docs/9.3/sql-syntax-lexical.html
// Quoted identifiers can contain any character,
// except the character with code zero.
// (To include a double quote, write two double quotes.)
// This allows constructing table or column names that would otherwise not be possible,
// such as ones containing spaces or ampersands. The length limitation still applies.
export const quoteId = id => `"${id.replace('"', '""')}"`;
