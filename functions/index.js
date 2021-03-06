// Copyright (C) 2019 Alina Inc. All rights reserved.

import q from '../q';
import { star } from '../util';
import { buildObject } from './callback';

const func = (keyword, opts) => (...args) => q().function(keyword, opts)(...args);

export const abs = func('abs');
export const age = func('AGE');
export const arrayAgg = func('ARRAY_AGG');
export const arrayToJson = func('ARRAY_TO_JSON');
export const ascii = func('ASCII');
export const avg = func('AVG');
export const bitAnd = func('BIT_AND');
export const bitLength = func('BIT_LENGTH');
export const bitOr = func('BIT_OR');
export const boolAnd = func('BOOL_AND');
export const boolOr = func('BOOL_OR');
export const btrim = func('BTRIM');
export const cbrt = func('cbrt');
export const ceil = func('ceil');
export const ceiling = func('ceiling');
export const characterLength = func('CHARACTER_LENGTH');
export const charLength = func('CHAR_LENGTH');
export const chr = func('CHR');
export const concat = func('CONCAT');
export const concatWs = func('CONCAT_WS');
export const convert = func('CONVERT');
export const convertFrom = func('CONVERT_FROM');
export const convertTo = func('CONVERT_TO');
export const count = func('COUNT', { default: star });
export const currentDate = func('CURRENT_DATE', { func: false });
export const currentTime = func('CURRENT_TIME', { func: false });
export const currentTimestamp = func('CURRENT_TIMESTAMP', { func: false });
export const datePart = func('DATE_PART');
export const dateTrunc = func('DATE_TRUNC');
export const decode = func('DECODE');
export const degrees = func('degrees');
export const distinct = func('DISTINCT');
export const div = func('div');
export const encode = func('ENCODE');
export const every = func('EVERY');
export const exp = func('exp');
export const extract = func('EXTRACT');
export const floor = func('floor');
export const format = func('FORMAT');
export const genRandomBytes = func('gen_random_bytes');
export const initcap = func('INITCAP');
export const isfinite = func('ISFINITE');
export const jsonAgg = func('JSON_AGG');
export const jsonArrayElements = func('json_array_elements');
export const jsonArrayElementsText = func('json_array_elements_text');
export const jsonArrayLength = func('json_array_length');
export const jsonbAgg = func('JSONB_AGG');
export const jsonbArrayElements = func('jsonb_array_elements');
export const jsonbArrayElementsText = func('jsonb_array_elements_text');
export const jsonbArrayLength = func('jsonb_array_length');
export const jsonbBuildArray = func('JSONB_BUILD_ARRAY');
export const jsonbBuildObject = func('JSONB_BUILD_OBJECT', { cb: buildObject });
export const jsonbEach = func('jsonb_each');
export const jsonbEachText = func('jsonb_each_text');
export const jsonbExtractPath = func('jsonb_extract_path');
export const jsonbExtractPathText = func('jsonb_extract_path_text');
export const jsonbInsert = func('jsonb_insert');
export const jsonbObject = func('JSONB_OBJECT');
export const jsonbObjectAgg = func('JSONB_OBJECT_AGG');
export const jsonbObjectKeys = func('jsonb_object_keys');
export const jsonbPopulateRecord = func('jsonb_populate_record');
export const jsonbPopulateRecordset = func('jsonb_populate_recordset');
export const jsonbPretty = func('jsonb_pretty');
export const jsonbSet = func('jsonb_set');
export const jsonbStripNulls = func('jsonb_strip_nulls');
export const jsonbToRecord = func('jsonb_to_record');
export const jsonbToRecordset = func('jsonb_to_recordset');
export const jsonbTypeof = func('jsonb_typeof');
export const jsonBuildArray = func('JSON_BUILD_ARRAY');
export const jsonBuildObject = func('JSON_BUILD_OBJECT', { cb: buildObject });
export const jsonEach = func('json_each');
export const jsonEachText = func('json_each_text');
export const jsonExtractPath = func('json_extract_path');
export const jsonExtractPathText = func('json_extract_path_text');
export const jsonObject = func('JSON_OBJECT');
export const jsonObjectAgg = func('JSON_OBJECT_AGG');
export const jsonObjectKeys = func('json_object_keys');
export const jsonPopulateRecord = func('json_populate_record');
export const jsonPopulateRecordset = func('json_populate_recordset');
export const jsonStripNulls = func('json_strip_nulls');
export const jsonToRecord = func('json_to_record');
export const jsonToRecordset = func('json_to_recordset');
export const jsonTypeof = func('json_typeof');
export const justifyDays = func('JUSTITY_DAYS');
export const justifyHours = func('JUSTIFY_HOURS');
export const left = func('LEFT');
export const length = func('LENGTH');
export const ln = func('ln');
export const localtime = func('LOCALTIME', { func: false });
export const localtimestamp = func('LOCALTIMESTAMP', { func: false });
export const log = func('log');
export const lower = func('LOWER');
export const lpad = func('LPAD');
export const ltrim = func('LTRIM');
export const max = func('MAX');
export const md5 = func('MD5');
export const min = func('MIN');
export const mod = func('mod');
export const now = func('NOW');
export const octetLength = func('OCTET_LENGTH');
export const overlay = func('OVERLAY');
export const pgClientEncoding = func('PG_CLIENT_ENCODING');
export const pi = func('pi');
export const power = func('power');
export const quoteIdent = func('QUOTE_IDENT');
export const quoteLiteral = func('QUOTE_LITERAL');
export const quoteNullable = func('QUOTE_NULLABLE');
export const radians = func('radians');
export const regexpMatches = func('REGEXP_MATCHES');
export const regexpReplace = func('REGEXP_REPLACE');
export const regexpSplitToArray = func('REGEXP_SPLIT_TO_ARRAY');
export const regexpSplitToTable = func('REGEXP_SPLIT_TO_TABLE');
export const repeat = func('REPEAT');
export const replace = func('REPLACE');
export const reverse = func('REVERSE');
export const right = func('RIGHT');
export const round = func('round');
export const rowToJson = func('ROW_TO_JSON');
export const rpad = func('RPAD');
export const rtrim = func('RTRIM');
export const sign = func('sign');
export const splitPart = func('SPLIT_PART');
export const sqrt = func('sqrt');
export const stringAgg = func('STRING_AGG');
export const strpos = func('STRPOS');
export const substr = func('SUBSTR');
export const sum = func('SUM');
export const timeofday = func('TIMEOFDAY');
export const toAscii = func('TO_ASCII');
export const toHex = func('TO_HEX');
export const toJson = func('TO_JSON');
export const toJsonb = func('TO_JSONB');
export const translate = func('TRANSLATE');
export const trunc = func('trunc');
export const widthBucket = func('width_bucket');
export const xmlagg = func('XMLAGG');
