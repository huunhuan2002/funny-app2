/* Minification failed. Returning unminified contents.
(9510,42-43): run-time error JS1100: Expected ',': =
(9938,42-43): run-time error JS1100: Expected ',': =
 */
//! moment.js
//! version : 2.18.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

; (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            global.moment = factory()
}(this, (function () {
    'use strict';

    var hookCallback;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        var k;
        for (k in obj) {
            // even if its not own property I'd still call it non-empty
            return false;
        }
        return true;
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            meridiem: null,
            rfc2822: false,
            weekdayMismatch: false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    var some$1 = some;

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some$1.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid(flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor(number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false &&
            (typeof console !== 'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set(config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
            '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var keys$1 = keys;

    var defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L'
    };

    function calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate() {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        ss: '%d seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
    };

    function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({ unit: u, priority: priorities[u] });
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function makeGetSet(unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get(mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1(mom, unit, value) {
        if (mom.isValid()) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    // MOMENTS

    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet(units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1 = /\d/;            //       0 - 9
    var match2 = /\d\d/;          //      00 - 99
    var match3 = /\d{3}/;         //     000 - 999
    var match4 = /\d{4}/;         //    0000 - 9999
    var match6 = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2 = /\d\d?/;         //       0 - 99
    var match3to4 = /\d\d\d\d?/;     //     999 - 9999
    var match5to6 = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3 = /\d{1,3}/;       //       0 - 999
    var match1to4 = /\d{1,4}/;       //       0 - 9999
    var match1to6 = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned = /\d+/;           //       0 - inf
    var matchSigned = /[+-]?\d+/;      //    -inf - inf

    var matchOffset = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


    var regexes = {};

    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken(token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken(token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    var indexOf$1 = indexOf;

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M', match1to2);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths(m, format) {
        if (!m) {
            return isArray(this._months) ? this._months :
                this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort(m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort :
                this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf$1.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf$1.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf$1.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf$1.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth(mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY', 4], 0, 'year');
    addFormatToken(0, ['YYYYY', 5], 0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear() {
        return isLeapYear(this.year());
    }

    function createDate(y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date = new Date(y, m, d, h, M, s, ms);

        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w', match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow: 0, // Sunday is the first day of the week.
        doy: 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek() {
        return this._week.dow;
    }

    function localeFirstDayOfYear() {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd', function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd', function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays(m, format) {
        if (!m) {
            return isArray(this._weekdays) ? this._weekdays :
                this._weekdays['standalone'];
        }
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort(m) {
        return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin(m) {
        return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf$1.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf$1.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf$1.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf$1.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf$1.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf$1.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf$1.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2);
    addRegexToken('h', match1to2);
    addRegexToken('k', match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM(input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    // months
    // week
    // weekdays
    // meridiem
    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
            module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale(name, config) {
        if (config !== null) {
            var parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                    'an existing locale. moment.defineLocale(localeName, ' +
                    'config) should only be used for creating a new locale ' +
                    'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    if (!localeFamilies[config.parentLocale]) {
                        localeFamilies[config.parentLocale] = [];
                    }
                    localeFamilies[config.parentLocale].push({
                        name: name,
                        config: config
                    });
                    return null;
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);


            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, parentConfig = baseConfig;
            // MERGE
            if (locales[name] != null) {
                parentConfig = locales[name]._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale(key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys$1(locales);
    }

    function checkOverflow(m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH] < 0 || a[MONTH] > 11 ? MONTH :
                    a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                        a[HOUR] < 0 || a[HOUR] > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                            a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE :
                                a[SECOND] < 0 || a[SECOND] > 59 ? SECOND :
                                    a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                                        -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var basicRfcRegex = /^((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d?\d\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(?:\d\d)?\d\d\s)(\d\d:\d\d)(\:\d\d)?(\s(?:UT|GMT|[ECMP][SD]T|[A-IK-Za-ik-z]|[+-]\d{4}))$/;

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var string, match, dayFormat,
            dateFormat, timeFormat, tzFormat;
        var timezones = {
            ' GMT': ' +0000',
            ' EDT': ' -0400',
            ' EST': ' -0500',
            ' CDT': ' -0500',
            ' CST': ' -0600',
            ' MDT': ' -0600',
            ' MST': ' -0700',
            ' PDT': ' -0700',
            ' PST': ' -0800'
        };
        var military = 'YXWVUTSRQPONZABCDEFGHIKLM';
        var timezone, timezoneIndex;

        string = config._i
            .replace(/\([^\)]*\)|[\n\t]/g, ' ') // Remove comments and folding whitespace
            .replace(/(\s\s+)/g, ' ') // Replace multiple-spaces with a single space
            .replace(/^\s|\s$/g, ''); // Remove leading and trailing spaces
        match = basicRfcRegex.exec(string);

        if (match) {
            dayFormat = match[1] ? 'ddd' + ((match[1].length === 5) ? ', ' : ' ') : '';
            dateFormat = 'D MMM ' + ((match[2].length > 10) ? 'YYYY ' : 'YY ');
            timeFormat = 'HH:mm' + (match[4] ? ':ss' : '');

            // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
            if (match[1]) { // day of week given
                var momentDate = new Date(match[2]);
                var momentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][momentDate.getDay()];

                if (match[1].substr(0, 3) !== momentDay) {
                    getParsingFlags(config).weekdayMismatch = true;
                    config._isValid = false;
                    return;
                }
            }

            switch (match[5].length) {
                case 2: // military
                    if (timezoneIndex === 0) {
                        timezone = ' +0000';
                    } else {
                        timezoneIndex = military.indexOf(match[5][1].toUpperCase()) - 12;
                        timezone = ((timezoneIndex < 0) ? ' -' : ' +') +
                            (('' + timezoneIndex).replace(/^-?/, '0')).match(/..$/)[0] + '00';
                    }
                    break;
                case 4: // Zone
                    timezone = timezones[match[5]];
                    break;
                default: // UT or +/-9999
                    timezone = timezones[' GMT'];
            }
            match[5] = timezone;
            config._i = match.splice(1).join('');
            tzFormat = ' ZZ';
            config._f = dayFormat + dateFormat + timeFormat + tzFormat;
            configFromStringAndFormat(config);
            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        // Final attempt, use Input Fallback
        hooks.createFromInputFallback(config);
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            var curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () { };

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () { };

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({ nullInput: true });
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
            (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(ordering.indexOf(key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration(obj) {
        return obj instanceof Duration;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset(token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z', matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);

        if (matches === null) {
            return null;
        }

        var chunk = matches[matches.length - 1] || [];
        var parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ?
            0 :
            parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset(m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () { };

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset(input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset() {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            }
            else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime() {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

    function createDuration(input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso(inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = { milliseconds: 0, months: 0 };

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return { milliseconds: 0, months: 0 };
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                    'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
            diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                        diff < 2 ? 'nextDay' :
                            diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1(time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone() {
        return new Moment(this);
    }

    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween(from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff(input, units, asFloat) {
        var that,
            zoneDelta,
            delta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                    units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                        units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                            units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff(a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString() {
        if (!this.isValid()) {
            return null;
        }
        var m = this.clone().utc();
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            return this.toDate().toISOString();
        }
        return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect() {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format(inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from(time, withoutSuffix) {
        if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
                createLocal(time).isValid())) {
            return createDuration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to(time, withoutSuffix) {
        if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
                createLocal(time).isValid())) {
            return createDuration({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale(key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData() {
        return this._locale;
    }

    function startOf(units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
            case 'year':
                this.month(0);
            /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
            /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
            case 'date':
                this.hours(0);
            /* falls through */
            case 'hour':
                this.minutes(0);
            /* falls through */
            case 'minute':
                this.seconds(0);
            /* falls through */
            case 'second':
                this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf(units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }

        // 'date' is an alias for 'day', so it should be considered as such.
        if (units === 'date') {
            units = 'day';
        }

        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function valueOf() {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate() {
        return new Date(this.valueOf());
    }

    function toArray() {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON() {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2() {
        return isValid(this);
    }

    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt() {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy);
    }

    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(this,
            input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter(input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIOROITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D', match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ?
            (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
            locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear(input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m', match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s', match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;

    // Year
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;

    // Week Year
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    proto.quarter = proto.quarters = getSetQuarter;

    // Month
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;

    // Week
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;

    // Hour
    proto.hour = proto.hours = getSetHour;

    // Minute
    proto.minute = proto.minutes = getSetMinute;

    // Second
    proto.second = proto.seconds = getSetSecond;

    // Millisecond
    proto.millisecond = proto.milliseconds = getSetMillisecond;

    // Offset
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;

    // Timezone
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;

    // Deprecations
    proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix(input) {
        return createLocal(input * 1000);
    }

    function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat(string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;

    // Month
    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;

    // Week
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;

    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;

    // Hours
    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1(format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl(format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl(localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths(format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort(format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                        (b === 2) ? 'nd' :
                            (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs() {
        var data = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);

        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);

        return this;
    }

    function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble() {
        var milliseconds = this._milliseconds;
        var days = this._days;
        var months = this._months;
        var data = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
            (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;

        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;

        hours = absFloor(minutes / 60);
        data.hours = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days = days;
        data.months = months;
        data.years = years;

        return this;
    }

    function daysToMonths(days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays(months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as(units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week': return days / 7 + milliseconds / 6048e5;
                case 'day': return days + milliseconds / 864e5;
                case 'hour': return days * 24 + milliseconds / 36e5;
                case 'minute': return days * 1440 + milliseconds / 6e4;
                case 'second': return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1() {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs(alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds = makeAs('s');
    var asMinutes = makeAs('m');
    var asHours = makeAs('h');
    var asDays = makeAs('d');
    var asWeeks = makeAs('w');
    var asMonths = makeAs('M');
    var asYears = makeAs('y');

    function get$2(units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds = makeGetter('seconds');
    var minutes = makeGetter('minutes');
    var hours = makeGetter('hours');
    var days = makeGetter('days');
    var months = makeGetter('months');
    var years = makeGetter('years');

    function weeks() {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        ss: 44,         // a few seconds to seconds
        s: 45,         // seconds to minute
        m: 45,         // minutes to hour
        h: 22,         // hours to day
        d: 26,         // days to month
        M: 11          // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1(posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds = round(duration.as('s'));
        var minutes = round(duration.as('m'));
        var hours = round(duration.as('h'));
        var days = round(duration.as('d'));
        var months = round(duration.as('M'));
        var years = round(duration.as('y'));

        var a = seconds <= thresholds.ss && ['s', seconds] ||
            seconds < thresholds.s && ['ss', seconds] ||
            minutes <= 1 && ['m'] ||
            minutes < thresholds.m && ['mm', minutes] ||
            hours <= 1 && ['h'] ||
            hours < thresholds.h && ['hh', hours] ||
            days <= 1 && ['d'] ||
            days < thresholds.d && ['dd', days] ||
            months <= 1 && ['M'] ||
            months < thresholds.M && ['MM', months] ||
            years <= 1 && ['y'] || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof (roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize(withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000;
        var days = abs$1(this._days);
        var months = abs$1(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;

    // Deprecations
    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    hooks.version = '2.18.1';

    setHookCallback(createLocal);

    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;

    return hooks;

})));;
var ModalType = {
    Success: "success",
    Info: "info",
    Danger: "danger",
    Warning: 'warning'
};

var DefaultLanguage = "vi-VN";

var userAgent = {
    isMobile: function(){
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) == true;
    }
}

var datePeriods = {
    today: [moment().startOf("day"), moment().endOf("day")],
    last_three_days: [moment().add(-3, "day").startOf("day"), moment().endOf("day")],
    last_week: [moment().add(-1, "week").startOf("isoWeek"), moment().add(-1, "week").endOf("isoWeek")],
    last_month: [moment().add(-1, "month").startOf("month"), moment().add(-1, "month").endOf("month")],
};
/*
    ===================================================================
        ::Common method for performing an XML Request or XDomainRequest
    ===================================================================
*/

function DoRequest(options) {
    options = options || {};
    options.onload = options.onload || function () { };
    options.onerror = options.onerror || function () { };
    options.ontimeout = options.ontimeout || function () { };
    options.url = options.url || "";
    options.body = options.body || "";
    options.method = options.method || "GET";
    options.headers = options.headers || {
        "Accept": "application/json"
    };
    options.preventCaching = !!options.preventCaching;
    if (options.preventCaching && !/[\?&]cache_buster/i.test(options.url)) {
        options.url += (options.url.indexOf("?") > -1) ? "&" : "?";
        options.url += "cache_buster=" + (new Date()).getTime();
    }

    if (!options.headers["Content-Type"]) {
        options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {

        // Check header and redirect if logged out
        var loginFlag = this.getResponseHeader('IsMultipleAuth');
     
        if (loginFlag != undefined) {
            window.location = '/' + getLangCookie() + '/account/login?ReturnUrl=' + encodeURIComponent(window.location.pathname) + '&getMessage=' + loginFlag;
        } else {
            // call user callback
            options.onload(this);
        }
    };

    xhr.onerror = options.onerror;
    xhr.ontimeout = options.ontimeout;
    xhr.open(options.method, options.url, true);
    for (var k in options.headers) {
        xhr.setRequestHeader(k, options.headers[k]);
    }
    xhr.send(options.body);

    // Account.refresh();
    return xhr;
}

/*
    ===================================================================
        ::Get messages from API
    ===================================================================
*/

__messageCache = {};

getMessage = function (error, callback) {

    if (__messageCache[error]) {

        //Show modal message here

        if (callback && typeof (callback) === "function") {
            callback();
        }
        return;
    }

    messageend = function (response) {
        //  __messageCache[error] = response.responseText;

        //Show modal message here
        if (callback && typeof (callback) === "function") {
            callback();
        }
    }

    DoRequest({
        url: '/api/message/' + error,
        onload: messageend
    });

};


var parseQueryString = function () {

    var str = window.location.search;
    var objURL = {};

    str.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function ($0, $1, $2, $3) {
            objURL[$1] = $3;
        }
    );
    return objURL;
};


//Check the user's session
Account = (function () {

    var ret = {},
        session,
        sessionTimeout = 1000,
        inactiveTimeout = 72 * 60 * 60 * 1000,
        exclude = /login|register|forgotpassword|resetpassword/gi;

    if (/timer/.test(window.location.search)) {
        inactiveTimeout = window.location.search.split('timer=')[1];
    }

    (check = function () {
        if (exclude.test(window.location)) {

            window.localStorage.removeItem('session-start');

        } else {

            //get the session start time
            var sessionStart = window.localStorage.getItem('session-start');

            //if there is no session start time set one
            //else check to see if the timeout is over the inactiveTimeout variable
            if (!sessionStart) {

                window.localStorage.setItem('session-start', new Date().getTime());

            } else {
                
                var now = new Date().getTime(),
                    diff = Math.floor((now - sessionStart)); // diff in milliseconds

                if (diff >= inactiveTimeout) {
                    logout(true);
                } else {
                    reset();
                }

            }

        }

    })();

    function refresh() {
        if (exclude.test(window.location)) {
            window.localStorage.removeItem('session-start');
        } else {
            window.localStorage.setItem('session-start', new Date().getTime());
        }
    }


    //reset the 
    function reset() {
        //clear the timer
        clearTimeout(session);

        //Check to see if the user is logged out
        session = setTimeout(check, sessionTimeout);

    };

    function logout(serverSide) {
        if (exclude.test(window.location)) {
            window.localStorage.removeItem('session-start');
        } else {
            if (serverSide === true) {
                DoRequest({
                    url: 'account/logout',
                    onload: function (response) {
                        window.location = '/' + getLangCookie() + '/account/login?ReturnUrl=' + encodeURIComponent(window.location.pathname) + '&getMessage=logout';
                    }
                })
            } else {
                window.location = '/' + getLangCookie() + '/account/login?ReturnUrl=' + encodeURIComponent(window.location.pathname) + '&getMessage=logout';
            }
        }
    }


    ret.check = check;
    ret.refresh = refresh;
    ret.logout = logout;

    return ret;

})();


/*
    ===================================================================
        ::Get messages from API
    ===================================================================
*/

__messageCache = {};

getMessage = function (error, callback) {

    if (__messageCache[error]) {

        //Show modal message here
        Modal.dark.on(__messageCache[error]);


        if (callback && typeof (callback) === "function") {
            callback();
        }
        return;
    }

    messageend = function (response) {
         //__messageCache[error] = response.responseText;

         //Show modal message here
         Modal.dark.on(response.responseText, error.type);

        if (callback && typeof (callback) === "function") {
            callback();
        }
    }

    DoRequest({
        url: '/api/message/' + error.data,
        onload: messageend
    });

};

var hasMessage = window.location.search.toLowerCase().split('getmessage=')[1];

if (hasMessage) {
    getMessage({ data: hasMessage, type: ModalType.Danger });
}


function spinner(target, display) {
    if (display) {
        target.addClass("working disabled").append("<span class=\"spinner\"></span>");
    }
    else {
        target.removeClass("working disabled").find(".spinner").remove();
    }
}


var $ = jQuery.noConflict();
$(function ($) {
    /*
        =====================================
            ::Overlay Functionality
        =====================================
    */

    var overlayObj = document.getElementById('overlay');

    Overlay = {
        on: function (callback) {
            $(document.body).addClass('no-scroll');
            $(overlayObj).addClass('open');

            if (callback && typeof (callback) === 'function') {
                callback();
            }
        },

        off: function (callback) {
            $(document.body).removeClass('no-scroll');
            $(overlayObj).removeClass('open');

            if (callback && typeof (callback) === 'function') {
                callback();
            }
        }
    }

    


    /*
        ========================================
            ::Modal Functionality
        ========================================
    */

    var modalDark = document.getElementById('modal-dark'),
        modalLight = document.getElementById('modal-light'),
        modalSession = '';

    Modal = {
        dark: {
            on: function (options,type) {
                Overlay.on();

                if (typeof (options) === 'function') {
                    options = { callback: options };
                } else if (typeof (options) === 'string') {
                    options = JSON.parse(options);
                }else {
                    options = options || {};
                }

                type = type || ModalType.Success;
                var data = options.data || options;

                if (typeof (arguments[1]) === 'function') {
                    options.callback = arguments[1];
                }

                var header = document.querySelector("#modal-dark .header");
                header.classList.remove("failed");
                header.classList.remove("success");

                if (type === ModalType.Success) {
                    header.className += ' success';
                } else if (type === ModalType.Danger) {
                    header.className += ' failed';
                }



                var titleObj = header.querySelector(".heading-lead"),
                    messageObj = document.querySelector("#modal-dark .content"),
                    action = data.actions;


                //empty the modal
                titleObj.innerHTML = '';
                messageObj.innerHTML = '';

                //build the actions
                for (i in action) {
                    var actionItem = document.querySelector('#modal-dark li'),
                        actionButton = document.querySelector('#modal-dark li a');

                    if (action[i].href.length > 0) {
                        actionButton.href = action[i].href;
                    } else {
                        actionButton.href = "javascript:;";
                    }

                    actionButton.innerHTML = action[i].label;

                }

                titleObj.innerHTML = data.title;
                messageObj.innerHTML = data.message;

             
                modalDark.className += ' open';

                if (options.callback && typeof (options.callback)) {
                    options.callback();
                }
            },

            off: function (callback) {

                modalDark.className = modalDark.className.replace(/(?:^|\s)open(?!\S)/g, '');

                if (!modalLight.classList.contains("open")) {
                    Overlay.off();
                } 

                if (callback && typeof (callback) === 'function') {
                    callback();
                }
            },
            manager: function (options, callback) {

                var buttonEvent,
                    buttonClass;



                //check the options and assign the appropriate variable
                if (typeof (options) === 'function') {
                    callback = options;
                } else if (options.event && options.class) {
                    buttonEvent = options.event ? options.event : null;
                    buttonClass = options.class ? options.class : '';
                } else if (options.class) {
                    buttonClass = options.class ? options.class : '';
                } else {
                    options = options || {};
                }

                Modal.dark.off();

                if (callback && typeof (callback) === 'function') {
                    callback();
                }
            }
        },

        light: {
            on: function (options) {
                Overlay.on();
                options = options || {};
                options.qs = options.qs || "";
                options.clear = options.clear || false;

                var templateName = options.url.split('|')[0],
                    templateId = options.url.split('|')[1],
                    modalLightInner = document.getElementById('modal-light-inner');

                modalLightInner.className = 'inner';

                function fnAddClass(x) {
                    modalLightInner.className += ' ' + x;
                }

                if (typeof (options) === "function") {
                    options();

                } else if (!options) {
                    options = options || {};

                } else if (options.classModal && options.event) {
                    fnAddClass(options.classModal);
                    options = options.event;

                } else if (options.event) {
                    options = options.event;

                } else if (options.classModal) {
                    fnAddClass(options.classModal);
                }

                if (options.clear) {
                    modalSession = '';
                }

                if (modalSession === options.url) {

                    modalLight.className = "open";

                    if (options.callback && typeof (options.callback) === "function") {
                        options.callback();
                    }
                } else {
                    modalSession = options.url;

                    modalend = function (response) {
                        if (response) {
                            modalLightInner.innerHTML = response;

                            modalLight.className += " open";

                            $(modalLight).focus();

                            if (options.buttons) {
                                $.each(options.buttons, function (index, button) {
                                    var $button = $("." + button.label, modalLight);

                                    if (!$button.hasOwnProperty("id")) {
                                        $button.prop('id', guid);
                                        $button.data('button', button);
                                    }
                                });
                            }

                            if (options.callback && typeof (options.callback) === "function") {
                                options.callback();
                            }
                        }
                    };

                    $.ajax({
                        url: "/modal/" + templateName + (options.qs ? "?" + options.qs : ""),
                        success: modalend,
                    });
                }
            },
            off: function () {
                modalLight.className = modalLight.className.replace(/(?:^|\s)open(?!\S)/g, '');

                if (!modalDark.classList.contains("open")) {
                    Overlay.off();
                } 
            },
            manager: function (options, callback) {
                var $button = options.button;

                if (typeof (options) === "function") {
                    callback = options;
                } else if (options.button) {
                    var button = $button.data("button");
                    if (typeof button.action === "function") {
                        button.action.call($button);
                    }
                }
                else {
                    options = options || {};
                }
            }
        }
    }

    //clicking the action buttons on the dark modal
    $(document).on('click', '#modal-dark a', function (e) {
        var buttonClass = this.className;
        Modal.dark.manager({ 'event': e, 'class': buttonClass });
    });

    $(document).on('click', '#modal-dark .header .heading-close', function (e) {
        Modal.dark.off();
    });

    $(document).on('click', '#modal-light .header .heading-close', function (e) {
        Modal.light.off();
    });

    $(document).on('click', '#modal-light .actions a', function (e) {
        Modal.light.manager({ 'event': e, 'button': $(this) });
    });


    /*
        ========================================
            ::Guid Functionality
        ========================================
    */

    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    //Click away

    //clickAway = function (e, callback) {

    //    var target = e.target,
    //        targetId = $(target).attr('id') ? $(target).attr('id') : '';

    //    //close the overlay and modals if open
    //    if (/overlay/g.test(targetId)) {
    //        Modal.dark.off();
    //    }

    //    if (callback && typeof (callback) === "function") {
    //        callback();
    //    }
    //}
    //document.onclick = clickAway;


    //$('#childFlag li a').on('click', function (e) {
    //    var dataValue = $(this).data('lang'),
    //        link = '/culture/setculture?culturecode=' + dataValue;

    //    $.post(link, function (results) {
    //        location.reload();
    //    });

    //});

    //$(window).on('beforeunload', function () {
    //    $.ajax({
    //        type: 'GET',
    //        url: '/account/ResetSession',
    //        async: false, //IMPORTANT, the call will be synchronous
    //        data: {}
    //    }).done(function (data) {
    //        alert("sdfsdf");
    //    });
    //});

    //$(window).onbeforeunload(function () {
    
    //});

}(jQuery));

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


 function DateOfBirth(dayElement, monthElement, yearElement) {
    var startYear = 1900;
    var endYear = new Date().getFullYear() - 18;
    var years = "";
    for (var year = endYear; year >= startYear; year--) {
        years += "<option>" + year + "</option>";
    }

    var thismonth = 12;
    var months = "";
    for (var month = 1; month <= thismonth; month++) {
        months += "<option>" + month + "</option>";
    }

    var thisday = 31;
    var days = "";
    for (var day = 1; day <= thisday; day++) {
        days += "<option>" + day + "</option>";
    }

    dayElement.innerHTML = days;
    monthElement.innerHTML = months;
    yearElement.innerHTML = years;
}

function formatNumber(nStr, decSeperate, groupSeperate) {
    nStr += '';
    x = nStr.split(decSeperate);
    x1 = x[0];
    x2 = x.length > 1 && x[1] != '00' ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + groupSeperate + '$2');
    }
    return x1 + x2;
}


//Numbers
function numberOnly(e) {
   // -1 !== $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) || /65|67|86|88/.test(e.keyCode) && (!0 === e.ctrlKey || !0 === e.metaKey) || 35 <= e.keyCode && 40 >= e.keyCode || (e.shiftKey || 48 > e.keyCode || 57 < e.keyCode) && (96 > e.keyCode || 105 < e.keyCode) && e.preventDefault() 
   return true;
}


function keyUpCall(obj) {
    obj.val(function (index, value) {
        value = value.replace(/,/g, '');
        return numberWithCommas(value);
    });
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function keypressNumberOnly(obj, event) {
    var val = obj;
    if ((event.which != 46 || val.val().indexOf('.') != -1) &&
        ((event.which < 48 || event.which > 57) &&
            (event.which != 0 && event.which != 8))) {
        event.preventDefault();
    }
    var text = val.val();
    if ((event.which == 46) && (text.indexOf('.') == -1)) {
        setTimeout(function () {
            if (val.val().substring(val.val().indexOf('.')).length > 10) {
                val.val(val.val().substring(0, val.val().indexOf('.') + 3));
            }
        }, 1);
    }

    if ((text.indexOf('.') != -1) &&
        (text.substring(text.indexOf('.')).length > 2) &&
        (event.which != 0 && event.which != 8) &&
        (val[0].selectionStart >= text.length - 2)) {
        event.preventDefault();
    }

}
/*
    ===================================================================
        ::Load Wallet Balance
    ===================================================================
*/
LoadAllWalletBalance = function ($totalAllWallet, $walletList, $btnRefesh) {
    var loadingCount = 0,
        totalWallet = 0,
        
    spinner = function (target, display) {
        if (target.find(".spinner").is(':visible')) {
            return;
        }
        if (display) {
            //target.closest("li").addClass("overlay-white");
            //target.append('<img src=\"/Content/images/spin.gif\">');
            target.append('<span class="spinme"></span>');
            // target.append('0.0');
        }
        else {
            target.find(".spinner").remove();
           // target.closest("li").removeClass("overlay-white");
        }
    }

    loadWallet = function (target, callback) {
        target.html("");
        spinner(target, true);
        var data = target.data("partnerCode");
        DoRequest({
            method:
            'GET',
            url: '/api/GetWallet?partnerCode=' + data,
            onload: function (response) {
                var res = JSON.parse(response.responseText);
                if (res && res.Data) {
                    if (callback && typeof (callback) == "function") {
                        callback(res.Data);
                    }
                }
                loadingCount++;
                if (loadingCount === totalWallet) {
                    loadingCount = 0;
                    enable($btnRefesh);
                }
            }
        });
    }

    enable = function (el) {
        //el.closest("li").find("i").removeClass("spinner-animated");
       // el.closest("li").removeClass("disabled");
    }

    disable = function (el) {
       // el.closest("li").find("i").addClass("spinner-animated");
       // el.closest("li").addClass("disabled");
    }

    onHandleRefeshMainWallet = function (e) {
        e.preventDefault();
        var $this = $(this);
        disable($this);
        loadAllWallet();
    }
    

    loadAllWallet = function () {
        totalWallet = $walletList.length;
        disable($btnRefesh);

        var total = 0;

        $($walletList).each(function () {
            var $this = $(this);
            if ($this.length !== 0) {
                loadWallet($this, function (data) {
                    if (!data.IsMaintenance) {
                        $this.html(data.Balance);
                        spinner($this, false);

                        var bal = parseFloat(data.Balance.replace(/[^0-9\.]+/g, ""));
                        var isBal = isNaN(bal);
                        if (isBal === false && data.Product !== 'reward') {
                            total = total + bal;
                        }

                        if(userAgent.isMobile()){
                            if(data.Product === 'totalallwallet'){
                                localStorage.setItem(data.Product, formatNumber(total.toFixed(2), '.', ','));
                            } else {
                                localStorage.setItem(data.Product, isNaN(bal) === false ? data.Balance : 0 );
                            }
                        }                        

                        $totalAllWallet.html(formatNumber(total.toFixed(2), '.', ','));
                        
                        // totalWallet
                        $('#totalAllWalletHide').text(Array( $('#totalAllWallet').text().length + 1).join('*'))
                        
                        // reward balance
                        if(data.Product === 'reward') {
                            $('#rewardHide').text(Array(data.Balance.length + 1).join('*'))
                        }
                            
                        // main balance | Deposit | Transfer | Withdraw
                        if(data.Product === 'main') {
                            $('#mainWalletHide').text(Array(data.Balance.length + 1).join('*'))
                        }

                        // new transfer page
                        var $parentRow = $this.parents('.wallet-row-list');
                        if($parentRow.length){
                            if(bal > 0 ){
                                $parentRow.addClass('withBal');
                                $parentRow.find('.wallet-cta .transfer-all').attr('disabled', false);
                            } else {
                                $parentRow.find('.wallet-cta .transfer-all').attr('disabled', true);
                            }
                        }
                        
                    } else {
                        $this.html('N/A');  
                        spinner($this, false);
                        
                        // new transfer page
                        var $parentRow = $this.parents('.wallet-row-list');
                        if($parentRow.length){
                            $parentRow.addClass('maintenance');
                            $parentRow.find('.wallet-cta a').attr('disabled', true);
                        }
                    }
                });
            }
        });
        
    }

    loadAllWallet();
    $btnRefesh.on('click', onHandleRefeshMainWallet);
}


function setTempWallet(){
    if(localStorage.getItem('totalallwallet') !== null){
        var wallet = [
            'main',
            'reward',
            'digitain',
            'btisports',
            'boping',
            'sabacv',
            'tfgaming',
            'sagaming',
            'asiagaming',
            'allbet',
            'weworld',
            'viacasino',
            //'ebetgaming',
            'evolution',
            'pgsoft',
            'simpleplay',
            //'agilebet',
            //'agiledeal',
            //'agilenbg',
            //'agileslot',
            //'cpwlotto',
            //'gdgaming',
            //'betradar',
            //'genesis',
            'totalallwallet'];

        wallet.map(function(w){
            $('*[data-partner-code="'+w+'"]').html(localStorage.getItem(w));
        });
    }

    $('#rfsh').on('click', function(e){
        e.preventDefault();
        window.getBalance();
    });
}



$.fn.serializeIncludeDisabled = function () {
    var disabled = this.find(":input:disabled").removeAttr("disabled");
    var serialized = this.serialize();
    disabled.attr("disabled", "disabled");
    return serialized;
};


function getIPAddress() {
    return $.getJSON("https://jsonip.com").then(function (data) {
        return {
            ip: data.ip
        }
    });
}

$(".logoutJS").click(function () {
    setCookieExMin("title-switch-account", '0', 0);
    setCookieExMin("title-switch-bank", '0', 0);
    setCookieExMin("title-switch-security", '0', 0);
});;
BalanceHeader = (function ($) {
    var mainWallet,
        reward,

        digitain,
        btisports,
        boping,
        sabacv,
        tfgaming,
        saGaming,
        agWallet,
        allbet,
        weworld,
        evolution,
        pgslot,
        simpleplay,
        viacasino,

        //ebetgaming,
        //agileslot,
        //gdGaming,
        //betradar,

        btnRefreshMainWallet,
        totalAllWallet;
      

    function onDocumentReady() {
        mainWallet = $("#mainWalletHeader");
        //mainWallet = $("#mainWalletHeader, #mainWallet");
        reward = $("#reward, #rewardHeader");
        //reward = $("#rewardHeader");

        digitain = $("#digitainHeader");
        btisports = $("#btisportsHeader");
        boping = $("#bopingHeader");
        sabacv = $("#sabacvHeader");
        tfgaming = $("#tfgamingHeader");
        saGaming = $("#sagameHeader");
        agWallet = $("#agWalletHeader");
        allbet = $("#allbetHeader");
        weworld = $("#weworldHeader");
        evolution = $("#evolutionHeader");
        pgslot = $("#pgslotHeader");
        simpleplay = $("#simpleplayHeader");
        viacasino = $("#viacasinoHeader");

        //ebetgaming = $("#ebetgamingHeader");
        //agileslot = $("#agileslotHeader");
        //gdGaming = $("#gdgameHeader");
        //betradar = $("#betradarHeader, #virtualSportsWallet");
        
        btnRefreshMainWallet = $("#walletRefresh, #walletRefreshHeader");
        //btnRefreshMainWallet = $("#walletRefreshHeader");
        totalAllWallet = $("#totalAllWallet, #totalAllWalletHeader");
        //totalAllWallet = $("#totalAllWalletHeader");
        
        var $walletList = [mainWallet, reward, digitain, btisports, boping, sabacv, tfgaming, saGaming, agWallet, allbet, weworld, evolution, pgslot, simpleplay, viacasino, totalAllWallet];

        btnRefreshMainWallet.off();
        LoadAllWalletBalance(totalAllWallet, $walletList, btnRefreshMainWallet);
        
    }


    window.getBalance = function(){
        onDocumentReady();
    }

    $(onDocumentReady);

})(jQuery);
;
// bootstrap 3.6
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1||b[0]>2)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 3")}(jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.6",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a(f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.6",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")?(c.prop("checked")&&(a=!1),b.find(".active").removeClass("active"),this.$element.addClass("active")):"checkbox"==c.prop("type")&&(c.prop("checked")!==this.$element.hasClass("active")&&(a=!1),this.$element.toggleClass("active")),c.prop("checked",this.$element.hasClass("active")),a&&c.trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active")),this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),a(c.target).is('input[type="radio"]')||a(c.target).is('input[type="checkbox"]')||c.preventDefault()}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(b.type))})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=null,this.sliding=null,this.interval=null,this.$active=null,this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.6",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){if(!/input|textarea/i.test(a.target.tagName)){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()}},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c=this.getItemIndex(b),d="prev"==a&&0===c||"next"==a&&c==this.$items.length-1;if(d&&!this.options.wrap)return b;var e="prev"==a?-1:1,f=(c+e)%this.$items.length;return this.$items.eq(f)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));return a>this.$items.length-1||0>a?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i=this;if(f.hasClass("active"))return this.sliding=!1;var j=f[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:h});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(f)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(m)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&/show|hide/.test(b)&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a('[data-toggle="collapse"][href="#'+b.id+'"],[data-toggle="collapse"][data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.6",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":e.data();c.call(f,h)})}(jQuery),+function(a){"use strict";function b(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function c(c){c&&3===c.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=b(d),f={relatedTarget:this};e.hasClass("open")&&(c&&"click"==c.type&&/input|textarea/i.test(c.target.tagName)&&a.contains(e[0],c.target)||(e.trigger(c=a.Event("hide.bs.dropdown",f)),c.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger(a.Event("hidden.bs.dropdown",f)))))}))}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.6",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=b(e),g=f.hasClass("open");if(c(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(a(this)).on("click",c);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger(a.Event("shown.bs.dropdown",h))}return!1}},g.prototype.keydown=function(c){if(/(38|40|27|32)/.test(c.which)&&!/input|textarea/i.test(c.target.tagName)){var d=a(this);if(c.preventDefault(),c.stopPropagation(),!d.is(".disabled, :disabled")){var e=b(d),g=e.hasClass("open");if(!g&&27!=c.which||g&&27==c.which)return 27==c.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.disabled):visible a",i=e.find(".dropdown-menu"+h);if(i.length){var j=i.index(c.target);38==c.which&&j>0&&j--,40==c.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",c).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$dialog=this.$element.find(".modal-dialog"),this.$backdrop=null,this.isShown=null,this.originalBodyPad=null,this.scrollbarWidth=0,this.ignoreBackdropClick=!1,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.6",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.$dialog.on("mousedown.dismiss.bs.modal",function(){d.$element.one("mouseup.dismiss.bs.modal",function(b){a(b.target).is(d.$element)&&(d.ignoreBackdropClick=!0)})}),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),d.adjustDialog(),e&&d.$element[0].offsetWidth,d.$element.addClass("in"),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$dialog.one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"),this.$dialog.off("mousedown.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.resize=function(){this.isShown?a(window).on("resize.bs.modal",a.proxy(this.handleUpdate,this)):a(window).off("resize.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetAdjustments(),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a(document.createElement("div")).addClass("modal-backdrop "+e).appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){return this.ignoreBackdropClick?void(this.ignoreBackdropClick=!1):void(a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus():this.hide()))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.handleUpdate=function(){this.adjustDialog()},c.prototype.adjustDialog=function(){var a=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&a?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!a?this.scrollbarWidth:""})},c.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},c.prototype.checkScrollbar=function(){var a=window.innerWidth;if(!a){var b=document.documentElement.getBoundingClientRect();a=b.right-Math.abs(b.left)}this.bodyIsOverflowing=document.body.clientWidth<a,this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.originalBodyPad=document.body.style.paddingRight||"",this.bodyIsOverflowing&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right",this.originalBodyPad)},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;(e||!/destroy|hide/.test(b))&&(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",a,b)};c.VERSION="3.3.6",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){if(this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(a.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusin"==b.type?"focus":"hover"]=!0),c.tip().hasClass("in")||"in"==c.hoverState?void(c.hoverState="in"):(clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.isInStateTrue=function(){for(var a in this.inState)if(this.inState[a])return!0;return!1},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusout"==b.type?"focus":"hover"]=!1),c.isInStateTrue()?void 0:(clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide())},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.getPosition(this.$viewport);h="bottom"==h&&k.bottom+m>o.bottom?"top":"top"==h&&k.top-m<o.top?"bottom":"right"==h&&k.right+l>o.width?"left":"left"==h&&k.left-l<o.left?"right":h,f.removeClass(n).addClass(h)}var p=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(p,h);var q=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",q).emulateTransitionEnd(c.TRANSITION_DURATION):q()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top+=g,b.left+=h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=a(this.$tip),g=a.Event("hide.bs."+this.type);return this.$element.trigger(g),g.isDefaultPrevented()?void 0:(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this)},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=d?{top:0,left:0}:b.offset(),g={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},h=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,g,h,f)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.right&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){if(!this.$tip&&(this.$tip=a(this.options.template),1!=this.$tip.length))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),b?(c.inState.click=!c.inState.click,c.isInStateTrue()?c.enter(c):c.leave(c)):c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type),a.$tip&&a.$tip.detach(),a.$tip=null,a.$arrow=null,a.$viewport=null})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;(e||!/destroy|hide/.test(b))&&(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.6",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){this.$body=a(document.body),this.$scrollElement=a(a(c).is(document.body)?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",a.proxy(this.process,this)),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.6",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b=this,c="offset",d=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),a.isWindow(this.$scrollElement[0])||(c="position",d=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var b=a(this),e=b.data("target")||b.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[c]().top+d,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){b.offsets.push(this[0]),b.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(void 0===e[a+1]||b<e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");
d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.6",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu").length&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.6",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return c>e?"top":!1;if("bottom"==this.affixed)return null!=c?e+this.unpin<=f.top?!1:"bottom":a-d>=e+g?!1:"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&c>=e?"top":null!=d&&i+j>=a-d?"bottom":!1},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=Math.max(a(document).height(),a(document.body).height());"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);

// jrespond
!function(n,e,t){"use strict";n.jRespond=function(n){var e=[],t=[],i=n,o="",r="",u=0,l=500,d=function(n){var i=n.breakpoint,u=n.enter||void 0;e.push(n),t.push(!1),f(i)&&(void 0!==u&&u.call(null,{entering:o,exiting:r}),t[e.length-1]=!0)},c=function(){for(var n=[],i=[],u=0;u<e.length;u++){var l=e[u].breakpoint,d=e[u].enter||void 0,c=e[u].exit||void 0;"*"===l?(void 0!==d&&n.push(d),void 0!==c&&i.push(c)):f(l)?(void 0===d||t[u]||n.push(d),t[u]=!0):(void 0!==c&&t[u]&&i.push(c),t[u]=!1)}for(var h={entering:o,exiting:r},a=0;a<i.length;a++)i[a].call(null,h);for(var v=0;v<n.length;v++)n[v].call(null,h)},f=function(n){if("object"==typeof n){if(n.join().indexOf(o)>=0)return!0}else{if("*"===n)return!0;if("string"==typeof n&&o===n)return!0}},h=function(){var n="number"!=typeof window.innerWidth?0!==document.documentElement.clientWidth?document.documentElement.clientWidth:document.body.clientWidth:window.innerWidth;n!==u?(l=100,function(n){for(var e=!1,t=0;t<i.length;t++)if(n>=i[t].enter&&n<=i[t].exit){e=!0;break}e&&o!==i[t].label?(r=o,o=i[t].label,c()):e||""===o||(o="",c())}(n)):l=500,u=n,setTimeout(h,l)};return h(),{addFunc:function(n){!function(n){if(void 0===n.length)d(n);else for(var e=0;e<n.length;e++)d(n[e])}(n)},getBreakpoint:function(){return o}}}}(this,this.document);;
var $ = jQuery.noConflict();

$.fn.inlineStyle = function (prop) {
    return this.prop("style")[$.camelCase(prop)];
};

$.fn.doOnce = function (func) {
    this.length && func.apply(this);
    return this;
}

if ($().infinitescroll) {

    $.extend($.infinitescroll.prototype, {
        _setup_portfolioinfiniteitemsloader: function infscr_setup_portfolioinfiniteitemsloader() {
            var opts = this.options,
                instance = this;
            // Bind nextSelector link to retrieve
            $(opts.nextSelector).click(function (e) {
                if (e.which == 1 && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    instance.retrieve();
                }
            });
            // Define loadingStart to never hide pager
            instance.options.loading.start = function (opts) {
                opts.loading.msg
                    .appendTo(opts.loading.selector)
                    .show(opts.loading.speed, function () {
                        instance.beginAjax(opts);
                    });
            }
        },
        _showdonemsg_portfolioinfiniteitemsloader: function infscr_showdonemsg_portfolioinfiniteitemsloader() {
            var opts = this.options,
                instance = this;
            //Do all the usual stuff
            opts.loading.msg
                .find('img')
                .hide()
                .parent()
                .find('div').html(opts.loading.finishedMsg).animate({ opacity: 1 }, 2000, function () {
                    $(this).parent().fadeOut('normal');
                });
            //And also hide the navSelector
            $(opts.navSelector).fadeOut('normal');
            // user provided callback when done
            opts.errorCallback.call($(opts.contentSelector)[0], 'done');
        }
    });

} else {
   // console.log('Infinite Scroll not defined.');
}

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());



function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function () {
        context = this;
        args = arguments;
        timestamp = new Date();
        var later = function () {
            var last = (new Date()) - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        if (!timeout) {
            timeout = setTimeout(later, wait);
        }
        if (callNow) result = func.apply(context, args);
        return result;
    };
}


var requesting = false;

var killRequesting = debounce(function () {
    requesting = false;
}, 100);

function onScrollSliderParallax() {
    if (!requesting) {
        requesting = true;
        requestAnimationFrame(function () {
            SEMICOLON.slider.sliderParallax();
            SEMICOLON.slider.sliderElementsFade();
        });
    }
    killRequesting();
}



var SEMICOLON = SEMICOLON || {};

(function ($) {

    // USE STRICT
    "use strict";

    SEMICOLON.initialize = {

        init: function () {
            SEMICOLON.initialize.responsiveClasses();
           //SEMICOLON.initialize.goToTop();
        },

        responsiveClasses: function () {

            if (typeof jRespond === 'undefined') {
                console.log('responsiveClasses: jRespond not Defined.');
                return true;
            }

            var jRes = jRespond([
                {
                    label: 'smallest',
                    enter: 0,
                    exit: 479
                }, {
                    label: 'handheld',
                    enter: 480,
                    exit: 767
                }, {
                    label: 'tablet',
                    enter: 768,
                    exit: 991
                }, {
                    label: 'laptop',
                    enter: 992,
                    exit: 1199
                }, {
                    label: 'desktop',
                    enter: 1200,
                    exit: 10000
                }
            ]);
            jRes.addFunc([
                {
                    breakpoint: 'desktop',
                    enter: function () { $body.addClass('device-lg'); },
                    exit: function () { $body.removeClass('device-lg'); }
                }, {
                    breakpoint: 'laptop',
                    enter: function () { $body.addClass('device-md'); },
                    exit: function () { $body.removeClass('device-md'); }
                }, {
                    breakpoint: 'tablet',
                    enter: function () { $body.addClass('device-sm'); },
                    exit: function () { $body.removeClass('device-sm'); }
                }, {
                    breakpoint: 'handheld',
                    enter: function () { $body.addClass('device-xs'); },
                    exit: function () { $body.removeClass('device-xs'); }
                }, {
                    breakpoint: 'smallest',
                    enter: function () { $body.addClass('device-xxs'); },
                    exit: function () { $body.removeClass('device-xxs'); }
                }
            ]);
        },

        //goToTop: function () {
        //    var elementScrollSpeed = $goToTopEl.attr('data-speed'),
        //        elementScrollEasing = $goToTopEl.attr('data-easing');

        //    if (!elementScrollSpeed) { elementScrollSpeed = 700; }
        //    if (!elementScrollEasing) { elementScrollEasing = 'easeOutQuad'; }

        //    $goToTopEl.click(function () {
        //        $('body,html').stop(true).animate({
        //            'scrollTop': 0
        //        }, Number(elementScrollSpeed), elementScrollEasing);
        //        return false;
        //    });
        //},

        //goToTopScroll: function () {
        //    var elementMobile = $goToTopEl.attr('data-mobile'),
        //        elementOffset = $goToTopEl.attr('data-offset');

        //    if (!elementOffset) { elementOffset = 450; }

        //    if (elementMobile != 'true' && ($body.hasClass('device-xs') || $body.hasClass('device-xxs'))) { return true; }

        //    if ($window.scrollTop() > Number(elementOffset)) {
        //        $goToTopEl.fadeIn();
        //    } else {
        //        $goToTopEl.fadeOut();
        //    }
        //},


        commonHeight: function (element) {
            var maxHeight = 0;
            element.children('[class*=col-]').each(function () {
                var element = $(this).children();
                if (element.hasClass('max-height')) {
                    maxHeight = element.outerHeight();
                } else {
                    if (element.outerHeight() > maxHeight)
                        maxHeight = element.outerHeight();
                }
            });

            element.children('[class*=col-]').each(function () {
                $(this).height(maxHeight);
            });
        },

        modal: function () {

            if (!$().magnificPopup) {
                console.log('modal: Magnific Popup not Defined.');
                return true;
            }

            var $modal = $('.modal-on-load:not(.customjs)');
            if ($modal.length > 0) {
                $modal.each(function () {
                    var element = $(this),
                        elementTarget = element.attr('data-target'),
                        elementTargetValue = elementTarget.split('#')[1],
                        elementDelay = element.attr('data-delay'),
                        elementTimeout = element.attr('data-timeout'),
                        elementAnimateIn = element.attr('data-animate-in'),
                        elementAnimateOut = element.attr('data-animate-out');

                    if (!element.hasClass('enable-cookie')) { $.removeCookie(elementTargetValue); }

                    if (element.hasClass('enable-cookie')) {
                        var elementCookie = $.cookie(elementTargetValue);

                        if (typeof elementCookie !== 'undefined' && elementCookie == '0') {
                            return true;
                        }
                    }

                    if (!elementDelay) {
                        elementDelay = 1500;
                    } else {
                        elementDelay = Number(elementDelay) + 1500;
                    }

                    var t = setTimeout(function () {
                        $.magnificPopup.open({
                            items: { src: elementTarget },
                            type: 'inline',
                            mainClass: 'mfp-no-margins mfp-fade',
                            closeBtnInside: false,
                            fixedContentPos: true,
                            removalDelay: 500,
                            callbacks: {
                                open: function () {
                                    if (elementAnimateIn != '') {
                                        $(elementTarget).addClass(elementAnimateIn + ' animated');
                                    }
                                },
                                beforeClose: function () {
                                    if (elementAnimateOut != '') {
                                        $(elementTarget).removeClass(elementAnimateIn).addClass(elementAnimateOut);
                                    }
                                },
                                afterClose: function () {
                                    if (elementAnimateIn != '' || elementAnimateOut != '') {
                                        $(elementTarget).removeClass(elementAnimateIn + ' ' + elementAnimateOut + ' animated');
                                    }
                                    if (element.hasClass('enable-cookie')) {
                                        $.cookie(elementTargetValue, '0');
                                    }
                                }
                            }
                        }, 0);
                    }, Number(elementDelay));

                    if (elementTimeout != '') {
                        var to = setTimeout(function () {
                            $.magnificPopup.close();
                        }, Number(elementDelay) + Number(elementTimeout));
                    }
                });
            }
        },

        blogTimelineEntries: function () {
            $('.post-timeline.grid-2').find('.entry').each(function () {
                var position = $(this).inlineStyle('left');
                if (position == '0px') {
                    $(this).removeClass('alt');
                } else {
                    $(this).addClass('alt');
                }
                $(this).find('.entry-timeline').fadeIn();
            });
        },

        topScrollOffset: function () {
            var topOffsetScroll = 0;

            if (($body.hasClass('device-lg') || $body.hasClass('device-md')) && !SEMICOLON.isMobile.any()) {
                if ($header.hasClass('sticky-header')) {
                    if ($pagemenu.hasClass('dots-menu')) { topOffsetScroll = 100; } else { topOffsetScroll = 144; }
                } else {
                    if ($pagemenu.hasClass('dots-menu')) { topOffsetScroll = 140; } else { topOffsetScroll = 184; }
                }

                if (!$pagemenu.length) {
                    if ($header.hasClass('sticky-header')) { topOffsetScroll = 100; } else { topOffsetScroll = 140; }
                }
            } else {
                topOffsetScroll = 40;
            }

            return topOffsetScroll;
        },

        defineColumns: function (element) {
            var column = 4;

            if (element.hasClass('portfolio-full')) {
                if (element.hasClass('portfolio-3')) column = 3;
                else if (element.hasClass('portfolio-5')) column = 5;
                else if (element.hasClass('portfolio-6')) column = 6;
                else column = 4;

                if ($body.hasClass('device-sm') && (column == 4 || column == 5 || column == 6)) {
                    column = 3;
                } else if ($body.hasClass('device-xs') && (column == 3 || column == 4 || column == 5 || column == 6)) {
                    column = 2;
                } else if ($body.hasClass('device-xxs')) {
                    column = 1;
                }
            } else if (element.hasClass('masonry-thumbs')) {

                var lgCol = element.attr('data-lg-col'),
                    mdCol = element.attr('data-md-col'),
                    smCol = element.attr('data-sm-col'),
                    xsCol = element.attr('data-xs-col'),
                    xxsCol = element.attr('data-xxs-col');

                if (element.hasClass('col-2')) column = 2;
                else if (element.hasClass('col-3')) column = 3;
                else if (element.hasClass('col-5')) column = 5;
                else if (element.hasClass('col-6')) column = 6;
                else column = 4;

                if ($body.hasClass('device-lg')) {
                    if (lgCol) { column = Number(lgCol); }
                } else if ($body.hasClass('device-md')) {
                    if (mdCol) { column = Number(mdCol); }
                } else if ($body.hasClass('device-sm')) {
                    if (smCol) { column = Number(smCol); }
                } else if ($body.hasClass('device-xs')) {
                    if (xsCol) { column = Number(xsCol); }
                } else if ($body.hasClass('device-xxs')) {
                    if (xxsCol) { column = Number(xxsCol); }
                }

            }

            return column;
        },

        setFullColumnWidth: function (element) {

            if (!$().isotope) {
                console.log('setFullColumnWidth: Isotope not Defined.');
                return true;
            }

            element.css({ 'width': '' });

            if (element.hasClass('portfolio-full')) {
                var columns = SEMICOLON.initialize.defineColumns(element);
                var containerWidth = element.width();
                if (containerWidth == (Math.floor(containerWidth / columns) * columns)) { containerWidth = containerWidth - 1; }
                var postWidth = Math.floor(containerWidth / columns);
                if ($body.hasClass('device-xxs')) { var deviceSmallest = 1; } else { var deviceSmallest = 0; }
                element.find(".portfolio-item").each(function (index) {
                    if (deviceSmallest == 0 && $(this).hasClass('wide')) { var elementSize = (postWidth * 2); } else { var elementSize = postWidth; }
                    $(this).css({ "width": elementSize + "px" });
                });
            } else if (element.hasClass('masonry-thumbs')) {
                var columns = SEMICOLON.initialize.defineColumns(element),
                    containerWidth = element.innerWidth();

                if (containerWidth == windowWidth) {
                    containerWidth = windowWidth * 1.004;
                    element.css({ 'width': containerWidth + 'px' });
                }

                var postWidth = (containerWidth / columns);

                postWidth = Math.floor(postWidth);

                if ((postWidth * columns) >= containerWidth) { element.css({ 'margin-right': '-1px' }); }

                element.children('a').css({ "width": postWidth + "px" });

                var firstElementWidth = element.find('a:eq(0)').outerWidth();

                element.isotope({
                    masonry: {
                        columnWidth: firstElementWidth
                    }
                });

                var bigImageNumbers = element.attr('data-big');
                if (bigImageNumbers) {
                    bigImageNumbers = bigImageNumbers.split(",");
                    var bigImageNumber = '',
                        bigi = '';
                    for (bigi = 0; bigi < bigImageNumbers.length; bigi++) {
                        bigImageNumber = Number(bigImageNumbers[bigi]) - 1;
                        element.find('a:eq(' + bigImageNumber + ')').css({ width: firstElementWidth * 2 + 'px' });
                    }
                    var t = setTimeout(function () {
                        element.isotope('layout');
                    }, 1000);
                }
            }

        },

        aspectResizer: function () {
            var $aspectResizerEl = $('.aspect-resizer');
            if ($aspectResizerEl.length > 0) {
                $aspectResizerEl.each(function () {
                    var element = $(this),
                        elementW = element.inlineStyle('width'),
                        elementH = element.inlineStyle('height'),
                        elementPW = element.parent().innerWidth();
                });
            }
        },

        stickFooterOnSmall: function () {
            var windowH = $window.height(),
                wrapperH = $wrapper.height();

            if (!$body.hasClass('sticky-footer') && $footer.length > 0 && $wrapper.has('#footer')) {
                if (windowH > wrapperH) {
                    //$footer.css({ 'margin-top': (windowH - wrapperH) });
                }
            }
        }

    };

    SEMICOLON.header = {

        stickyMenu: function (headerOffset) {
            if ($window.scrollTop() > headerOffset) {
                //alert(headerOffset);
                if ($body.hasClass('device-lg') || $body.hasClass('device-md')) {
                    $('body:not(.side-header) #header:not(.no-sticky)').addClass('sticky-header');
                    $(".topNav").addClass("sticky-header");
                    if (!$headerWrap.hasClass('force-not-dark')) { $headerWrap.removeClass('not-dark'); }
                    SEMICOLON.header.stickyMenuClass();
                } else if ($body.hasClass('device-xs') || $body.hasClass('device-xxs') || $body.hasClass('device-sm')) {
                    if ($body.hasClass('sticky-responsive-menu')) {
                        $('#header:not(.no-sticky)').addClass('responsive-sticky-header');
                        SEMICOLON.header.stickyMenuClass();
                    }
                }
            } else {
                SEMICOLON.header.removeStickyness();
            }
        },
        stickyPageMenu: function (pageMenuOffset) {
            if ($window.scrollTop() > pageMenuOffset) {
                if ($body.hasClass('device-lg') || $body.hasClass('device-md')) {
                    $('#page-menu:not(.dots-menu,.no-sticky)').addClass('sticky-page-menu');
                } else if ($body.hasClass('device-xs') || $body.hasClass('device-xxs') || $body.hasClass('device-sm')) {
                    if ($body.hasClass('sticky-responsive-pagemenu')) {
                        $('#page-menu:not(.dots-menu,.no-sticky)').addClass('sticky-page-menu');
                    }
                }
            } else {
                $('#page-menu:not(.dots-menu,.no-sticky)').removeClass('sticky-page-menu');
            }
        },

        removeStickyness: function () {
            if ($header.hasClass('sticky-header')) {
                $('body:not(.side-header) #header:not(.no-sticky)').removeClass('sticky-header');
                $(".topNav").removeClass("sticky-header");
                $header.removeClass().addClass(oldHeaderClasses);
                $headerWrap.removeClass().addClass(oldHeaderWrapClasses);
                if (!$headerWrap.hasClass('force-not-dark')) { $headerWrap.removeClass('not-dark'); }
                SEMICOLON.slider.swiperSliderMenu();
                SEMICOLON.slider.revolutionSliderMenu();
            }
            if ($header.hasClass('responsive-sticky-header')) {
                $('body.sticky-responsive-menu #header').removeClass('responsive-sticky-header');
            }
            if (($body.hasClass('device-xs') || $body.hasClass('device-xxs') || $body.hasClass('device-sm')) && (typeof responsiveMenuClasses === 'undefined')) {
                $header.removeClass().addClass(oldHeaderClasses);
                $headerWrap.removeClass().addClass(oldHeaderWrapClasses);
                if (!$headerWrap.hasClass('force-not-dark')) { $headerWrap.removeClass('not-dark'); }
            }
        },

        onePageCurrentSection: function () {
            var currentOnePageSection = 'home',
                headerHeight = $headerWrap.outerHeight();

            if ($body.hasClass('side-header')) { headerHeight = 0; }

            $pageSectionEl.each(function (index) {
                var h = $(this).offset().top;
                var y = $window.scrollTop();

                var offsetScroll = headerHeight + onePageGlobalOffset;

                if (y + offsetScroll >= h && y < h + $(this).height() && $(this).attr('id') != currentOnePageSection) {
                    currentOnePageSection = $(this).attr('id');
                }
            });

            return currentOnePageSection;
        },

        stickyMenuClass: function () {
            if (stickyMenuClasses) { var newClassesArray = stickyMenuClasses.split(/ +/); } else { var newClassesArray = ''; }
            var noOfNewClasses = newClassesArray.length;

            if (noOfNewClasses > 0) {
                var i = 0;
                for (i = 0; i < noOfNewClasses; i++) {
                    if (newClassesArray[i] == 'not-dark') {
                        $header.removeClass('dark');
                        $headerWrap.addClass('not-dark');
                    } else if (newClassesArray[i] == 'dark') {
                        $headerWrap.removeClass('not-dark force-not-dark');
                        if (!$header.hasClass(newClassesArray[i])) {
                            $header.addClass(newClassesArray[i]);
                        }
                    } else if (!$header.hasClass(newClassesArray[i])) {
                        $header.addClass(newClassesArray[i]);
                    }
                }
            }
        },

        responsiveMenuClass: function () {
            if ($body.hasClass('device-xs') || $body.hasClass('device-xxs') || $body.hasClass('device-sm')) {
                if (responsiveMenuClasses) { var newClassesArray = responsiveMenuClasses.split(/ +/); } else { var newClassesArray = ''; }
                var noOfNewClasses = newClassesArray.length;

                if (noOfNewClasses > 0) {
                    var i = 0;
                    for (i = 0; i < noOfNewClasses; i++) {
                        if (newClassesArray[i] == 'not-dark') {
                            $header.removeClass('dark');
                            $headerWrap.addClass('not-dark');
                        } else if (newClassesArray[i] == 'dark') {
                            $headerWrap.removeClass('not-dark force-not-dark');
                            if (!$header.hasClass(newClassesArray[i])) {
                                $header.addClass(newClassesArray[i]);
                            }
                        } else if (!$header.hasClass(newClassesArray[i])) {
                            $header.addClass(newClassesArray[i]);
                        }
                    }
                }
            }
        }
    };

    SEMICOLON.slider = {

        init: function () {

            SEMICOLON.slider.sliderRun();
            SEMICOLON.slider.sliderParallax();
            SEMICOLON.slider.sliderElementsFade();

        },

        sliderRun: function () {

            if (typeof Swiper === 'undefined') {
                console.log('sliderRun: Swiper not Defined.');
                return true;
            }

            if ($slider.hasClass('customjs')) { return true; }

            if ($slider.hasClass('swiper_wrapper')) {

                var element = $slider.filter('.swiper_wrapper'),
                    elementDirection = element.attr('data-direction'),
                    elementSpeed = element.attr('data-speed'),
                    elementAutoPlay = element.attr('data-autoplay'),
                    elementLoop = element.attr('data-loop'),
                    elementEffect = element.attr('data-effect'),
                    elementGrabCursor = element.attr('data-grab'),
                    slideNumberTotal = element.find('#slide-number-total'),
                    slideNumberCurrent = element.find('#slide-number-current'),
                    sliderVideoAutoPlay = element.attr('data-video-autoplay');

                if (!elementSpeed) { elementSpeed = 300; }
                if (!elementDirection) { elementDirection = 'horizontal'; }
                if (elementAutoPlay) { elementAutoPlay = Number(elementAutoPlay); }
                if (elementLoop == 'true') { elementLoop = true; } else { elementLoop = false; }
                if (!elementEffect) { elementEffect = 'slide'; }
                if (elementGrabCursor == 'false') { elementGrabCursor = false; } else { elementGrabCursor = true; }
                if (sliderVideoAutoPlay == 'false') { sliderVideoAutoPlay = false; } else { sliderVideoAutoPlay = true; }

                if (element.find('.swiper-pagination').length > 0) {
                    var elementPagination = '.swiper-pagination',
                        elementPaginationClickable = true;
                } else {
                    var elementPagination = '',
                        elementPaginationClickable = false;
                }

                var elementNavNext = '#slider-arrow-right',
                    elementNavPrev = '#slider-arrow-left';

                swiperSlider = new Swiper(element.find('.swiper-parent'), {
                    direction: elementDirection,
                    speed: Number(elementSpeed),
                    autoplay: elementAutoPlay,
                    loop: elementLoop,
                    effect: elementEffect,
                    slidesPerView: 1,
                    grabCursor: elementGrabCursor,
                    pagination: elementPagination,
                    paginationClickable: elementPaginationClickable,
                    prevButton: elementNavPrev,
                    nextButton: elementNavNext,
                    onInit: function (swiper) {
                        element.find('.yt-bg-player').removeClass('customjs');
                        $('.swiper-slide-active [data-caption-animate]').each(function () {
                            var $toAnimateElement = $(this),
                                toAnimateDelay = $toAnimateElement.attr('data-caption-delay'),
                                toAnimateDelayTime = 0;
                            if (toAnimateDelay) { toAnimateDelayTime = Number(toAnimateDelay) + 750; } else { toAnimateDelayTime = 750; }
                            if (!$toAnimateElement.hasClass('animated')) {
                                $toAnimateElement.addClass('not-animated');
                                var elementAnimation = $toAnimateElement.attr('data-caption-animate');
                                setTimeout(function () {
                                    $toAnimateElement.removeClass('not-animated').addClass(elementAnimation + ' animated');
                                }, toAnimateDelayTime);
                            }
                        });
                        $('[data-caption-animate]').each(function () {
                            var $toAnimateElement = $(this),
                                elementAnimation = $toAnimateElement.attr('data-caption-animate');
                            if ($toAnimateElement.parents('.swiper-slide').hasClass('swiper-slide-active')) { return true; }
                            $toAnimateElement.removeClass('animated').removeClass(elementAnimation).addClass('not-animated');
                        });
                        SEMICOLON.slider.swiperSliderMenu();
                    },
                    onSlideChangeStart: function (swiper) {
                        if (slideNumberCurrent.length > 0) {
                            if (elementLoop == true) {
                                slideNumberCurrent.html(Number(element.find('.swiper-slide.swiper-slide-active').attr('data-swiper-slide-index')) + 1);
                            } else {
                                slideNumberCurrent.html(swiperSlider.activeIndex + 1);
                            }
                        }
                        $('[data-caption-animate]').each(function () {
                            var $toAnimateElement = $(this),
                                elementAnimation = $toAnimateElement.attr('data-caption-animate');
                            if ($toAnimateElement.parents('.swiper-slide').hasClass('swiper-slide-active')) { return true; }
                            $toAnimateElement.removeClass('animated').removeClass(elementAnimation).addClass('not-animated');
                        });
                        SEMICOLON.slider.swiperSliderMenu();
                    },
                    onSlideChangeEnd: function (swiper) {
                        element.find('.swiper-slide').each(function () {
                            var slideEl = $(this);
                            if (slideEl.find('video').length > 0 && sliderVideoAutoPlay == true) { slideEl.find('video').get(0).pause(); }
                            if (slideEl.find('.yt-bg-player.mb_YTPlayer:not(.customjs)').length > 0) { slideEl.find('.yt-bg-player.mb_YTPlayer:not(.customjs)').YTPPause(); }
                        });
                        element.find('.swiper-slide:not(".swiper-slide-active")').each(function () {
                            var slideEl = $(this);
                            if (slideEl.find('video').length > 0) {
                                if (slideEl.find('video').get(0).currentTime != 0) { slideEl.find('video').get(0).currentTime = 0; }
                            }
                            if (slideEl.find('.yt-bg-player.mb_YTPlayer:not(.customjs)').length > 0) {
                                slideEl.find('.yt-bg-player.mb_YTPlayer:not(.customjs)').YTPGetPlayer().seekTo(slideEl.find('.yt-bg-player.mb_YTPlayer:not(.customjs)').attr('data-start'));
                            }
                        });
                        if (element.find('.swiper-slide.swiper-slide-active').find('video').length > 0 && sliderVideoAutoPlay == true) { element.find('.swiper-slide.swiper-slide-active').find('video').get(0).play(); }
                        if (element.find('.swiper-slide.swiper-slide-active').find('.yt-bg-player.mb_YTPlayer:not(.customjs)').length > 0 && sliderVideoAutoPlay == true) { element.find('.swiper-slide.swiper-slide-active').find('.yt-bg-player.mb_YTPlayer:not(.customjs)').YTPPlay(); }

                        element.find('.swiper-slide.swiper-slide-active [data-caption-animate]').each(function () {
                            var $toAnimateElement = $(this),
                                toAnimateDelay = $toAnimateElement.attr('data-caption-delay'),
                                toAnimateDelayTime = 0;
                            if (toAnimateDelay) { toAnimateDelayTime = Number(toAnimateDelay) + 300; } else { toAnimateDelayTime = 300; }
                            if (!$toAnimateElement.hasClass('animated')) {
                                $toAnimateElement.addClass('not-animated');
                                var elementAnimation = $toAnimateElement.attr('data-caption-animate');
                                setTimeout(function () {
                                    $toAnimateElement.removeClass('not-animated').addClass(elementAnimation + ' animated');
                                }, toAnimateDelayTime);
                            }
                        });
                    }
                });

                if (slideNumberCurrent.length > 0) {
                    if (elementLoop == true) {
                        slideNumberCurrent.html(Number(element.find('.swiper-slide.swiper-slide-active').attr('data-swiper-slide-index')) + 1);
                    } else {
                        slideNumberCurrent.html(swiperSlider.activeIndex + 1);
                    }
                }
                if (slideNumberTotal.length > 0) {
                    slideNumberTotal.html(element.find('.swiper-slide:not(.swiper-slide-duplicate)').length);
                }

            }
        },

        sliderParallaxOffset: function () {
            var sliderParallaxOffsetTop = 0;
            var headerHeight = $header.outerHeight();
            if ($body.hasClass('side-header') || $header.hasClass('transparent-header')) { headerHeight = 0; }
            if ($pageTitle.length > 0) {
                var pageTitleHeight = $pageTitle.outerHeight();
                sliderParallaxOffsetTop = pageTitleHeight + headerHeight;
            } else {
                sliderParallaxOffsetTop = headerHeight;
            }

            if ($slider.next('#header').length > 0) { sliderParallaxOffsetTop = 0; }

            return sliderParallaxOffsetTop;
        },

        sliderParallax: function () {

            if ($sliderParallaxEl.length < 1) { return true; }

            var parallaxOffsetTop = SEMICOLON.slider.sliderParallaxOffset(),
                parallaxElHeight = $sliderParallaxEl.outerHeight();

            if (($body.hasClass('device-lg') || $body.hasClass('device-md')) && !SEMICOLON.isMobile.any()) {
                if ((parallaxElHeight + parallaxOffsetTop + 50) > $window.scrollTop()) {
                    $sliderParallaxEl.addClass('slider-parallax-visible').removeClass('slider-parallax-invisible');
                    if ($window.scrollTop() > parallaxOffsetTop) {
                        if ($sliderParallaxEl.find('.slider-parallax-inner').length > 0) {
                            var tranformAmount = (($window.scrollTop() - parallaxOffsetTop) * -.4).toFixed(0),
                                tranformAmount2 = (($window.scrollTop() - parallaxOffsetTop) * -.15).toFixed(0);
                            $sliderParallaxEl.find('.slider-parallax-inner').css({ 'transform': 'translateY(' + tranformAmount + 'px)' });
                            $('.slider-parallax .slider-caption,.ei-title').css({ 'transform': 'translateY(' + tranformAmount2 + 'px)' });
                        } else {
                            var tranformAmount = (($window.scrollTop() - parallaxOffsetTop) / 1.5).toFixed(0),
                                tranformAmount2 = (($window.scrollTop() - parallaxOffsetTop) / 7).toFixed(0);
                            $sliderParallaxEl.css({ 'transform': 'translateY(' + tranformAmount + 'px)' });
                            $('.slider-parallax .slider-caption,.ei-title').css({ 'transform': 'translateY(' + -tranformAmount2 + 'px)' });
                        }
                    } else {
                        if ($sliderParallaxEl.find('.slider-parallax-inner').length > 0) {
                            $('.slider-parallax-inner,.slider-parallax .slider-caption,.ei-title').css({ 'transform': 'translateY(0px)' });
                        } else {
                            $('.slider-parallax,.slider-parallax .slider-caption,.ei-title').css({ 'transform': 'translateY(0px)' });
                        }
                    }
                } else {
                    $sliderParallaxEl.addClass('slider-parallax-invisible').removeClass('slider-parallax-visible');
                }
                if (requesting) {
                    requestAnimationFrame(function () {
                        SEMICOLON.slider.sliderParallax();
                        SEMICOLON.slider.sliderElementsFade();
                    });
                }
            } else {
                if ($sliderParallaxEl.find('.slider-parallax-inner').length > 0) {
                    $('.slider-parallax-inner,.slider-parallax .slider-caption,.ei-title').css({ 'transform': 'translateY(0px)' });
                } else {
                    $('.slider-parallax,.slider-parallax .slider-caption,.ei-title').css({ 'transform': 'translateY(0px)' });
                }
            }
        },

        sliderElementsFade: function () {

            if ($sliderParallaxEl.length > 0) {
                if (($body.hasClass('device-lg') || $body.hasClass('device-md')) && !SEMICOLON.isMobile.any()) {
                    var parallaxOffsetTop = SEMICOLON.slider.sliderParallaxOffset(),
                        parallaxElHeight = $sliderParallaxEl.outerHeight();
                    if ($slider.length > 0) {
                        if ($header.hasClass('transparent-header') || $('body').hasClass('side-header')) { var tHeaderOffset = 100; } else { var tHeaderOffset = 0; }
                        $sliderParallaxEl.find('#slider-arrow-left,#slider-arrow-right,.vertical-middle:not(.no-fade),.slider-caption,.ei-title,.camera_prev,.camera_next').css({ 'opacity': 1 - ((($window.scrollTop() - tHeaderOffset) * 1.85) / parallaxElHeight) });
                    }
                } else {
                    $sliderParallaxEl.find('#slider-arrow-left,#slider-arrow-right,.vertical-middle:not(.no-fade),.slider-caption,.ei-title,.camera_prev,.camera_next').css({ 'opacity': 1 });
                }
            }
        },

        swiperSliderMenu: function (onWinLoad) {
            onWinLoad = typeof onWinLoad !== 'undefined' ? onWinLoad : false;
            if ($body.hasClass('device-lg') || $body.hasClass('device-md')) {
                var activeSlide = $slider.find('.swiper-slide.swiper-slide-active');
                SEMICOLON.slider.headerSchemeChanger(activeSlide, onWinLoad);
            }
        },

        revolutionSliderMenu: function (onWinLoad) {
            onWinLoad = typeof onWinLoad !== 'undefined' ? onWinLoad : false;
            if ($body.hasClass('device-lg') || $body.hasClass('device-md')) {
                var activeSlide = $slider.find('.active-revslide');
                SEMICOLON.slider.headerSchemeChanger(activeSlide, onWinLoad);
            }
        },

        headerSchemeChanger: function (activeSlide, onWinLoad) {
            if (activeSlide.length > 0) {
                var darkExists = false;
                if (activeSlide.hasClass('dark')) {
                    if (oldHeaderClasses) { var oldClassesArray = oldHeaderClasses.split(/ +/); } else { var oldClassesArray = ''; }
                    var noOfOldClasses = oldClassesArray.length;

                    if (noOfOldClasses > 0) {
                        var i = 0;
                        for (i = 0; i < noOfOldClasses; i++) {
                            if (oldClassesArray[i] == 'dark' && onWinLoad == true) {
                                darkExists = true;
                                break;
                            }
                        }
                    }
                    $('#header.transparent-header:not(.sticky-header,.semi-transparent,.floating-header)').addClass('dark');
                    if (!darkExists) {
                        $('#header.transparent-header.sticky-header,#header.transparent-header.semi-transparent.sticky-header,#header.transparent-header.floating-header.sticky-header').removeClass('dark');
                    }
                    $headerWrap.removeClass('not-dark');
                } else {
                    if ($body.hasClass('dark')) {
                        activeSlide.addClass('not-dark');
                        $('#header.transparent-header:not(.semi-transparent,.floating-header)').removeClass('dark');
                        $('#header.transparent-header:not(.sticky-header,.semi-transparent,.floating-header)').find('#header-wrap').addClass('not-dark');
                    } else {
                        $('#header.transparent-header:not(.semi-transparent,.floating-header)').removeClass('dark');
                        $headerWrap.removeClass('not-dark');
                    }
                }
                if ($header.hasClass('sticky-header')) {
                    SEMICOLON.header.stickyMenuClass();
                }
            }
        },

        owlCaptionInit: function () {
            if ($owlCarouselEl.length > 0) {
                $owlCarouselEl.each(function () {
                    var element = $(this);
                    if (element.find('.owl-dot').length > 0) {
                        element.addClass('with-carousel-dots');
                    }
                });
            }
        }

    };

    SEMICOLON.portfolio = {

        init: function () {

            SEMICOLON.portfolio.ajaxload();

        },

        gridInit: function ($container) {

            if (!$().isotope) {
                console.log('gridInit: Isotope not Defined.');
                return true;
            }

            if ($container.length < 1) { return true; }
            if ($container.hasClass('customjs')) { return true; }

            $container.each(function () {
                var element = $(this),
                    elementTransition = element.attr('data-transition'),
                    elementLayoutMode = element.attr('data-layout'),
                    elementStagger = element.attr('data-stagger');

                if (!elementTransition) { elementTransition = '0.65s'; }
                if (!elementLayoutMode) { elementLayoutMode = 'masonry'; }
                if (!elementStagger) { elementStagger = 0; }

                setTimeout(function () {
                    if (element.hasClass('portfolio')) {
                        element.isotope({
                            layoutMode: elementLayoutMode,
                            transitionDuration: elementTransition,
                            stagger: Number(elementStagger),
                            masonry: {
                                columnWidth: element.find('.portfolio-item:not(.wide)')[0]
                            }
                        });
                    } else {
                        element.isotope({
                            layoutMode: elementLayoutMode,
                            transitionDuration: elementTransition
                        });
                    }
                }, 300);
            });
        },

        filterInit: function () {

            if (!$().isotope) {
                console.log('filterInit: Isotope not Defined.');
                return true;
            }

            if ($portfolioFilter.length < 1) { return true; }
            if ($portfolioFilter.hasClass('customjs')) { return true; }

            $portfolioFilter.each(function () {
                var element = $(this),
                    elementContainer = element.attr('data-container'),
                    elementActiveClass = element.attr('data-active-class'),
                    elementDefaultFilter = element.attr('data-default');

                if (!elementActiveClass) { elementActiveClass = 'activeFilter'; }

                element.find('a').click(function () {
                    element.find('li').removeClass(elementActiveClass);
                    $(this).parent('li').addClass(elementActiveClass);
                    var selector = $(this).attr('data-filter');
                    $(elementContainer).isotope({ filter: selector });
                    return false;
                });

                if (elementDefaultFilter) {
                    element.find('li').removeClass(elementActiveClass);
                    element.find('[data-filter="' + elementDefaultFilter + '"]').parent('li').addClass(elementActiveClass);
                    $(elementContainer).isotope({ filter: elementDefaultFilter });
                }
            });
        },

        shuffleInit: function () {

            if (!$().isotope) {
                console.log('shuffleInit: Isotope not Defined.');
                return true;
            }

            if ($('.portfolio-shuffle').length < 1) { return true; }

            $('.portfolio-shuffle').click(function () {
                var element = $(this),
                    elementContainer = element.attr('data-container');

                $(elementContainer).isotope('shuffle');
            });
        },

        ajaxload: function () {
            $('.portfolio-ajax .portfolio-item a.center-icon').click(function (e) {
                var portPostId = $(this).parents('.portfolio-item').attr('id');
                if (!$(this).parents('.portfolio-item').hasClass('portfolio-active')) {
                    SEMICOLON.portfolio.loadItem(portPostId, prevPostPortId);
                }
                e.preventDefault();
            });
        },

        newNextPrev: function (portPostId) {
            var portNext = SEMICOLON.portfolio.getNextItem(portPostId);
            var portPrev = SEMICOLON.portfolio.getPrevItem(portPostId);
            $('#next-portfolio').attr('data-id', portNext);
            $('#prev-portfolio').attr('data-id', portPrev);
        },

        loadItem: function (portPostId, prevPostPortId, getIt) {
            if (!getIt) { getIt = false; }
            var portNext = SEMICOLON.portfolio.getNextItem(portPostId);
            var portPrev = SEMICOLON.portfolio.getPrevItem(portPostId);
            if (getIt == false) {
                SEMICOLON.portfolio.closeItem();
                $portfolioAjaxLoader.fadeIn();
                var portfolioDataLoader = $('#' + portPostId).attr('data-loader');
                $portfolioDetailsContainer.load(portfolioDataLoader, { portid: portPostId, portnext: portNext, portprev: portPrev },
                    function () {
                        SEMICOLON.portfolio.initializeAjax(portPostId);
                        SEMICOLON.portfolio.openItem();
                        $portfolioItems.removeClass('portfolio-active');
                        $('#' + portPostId).addClass('portfolio-active');
                    });
            }
        },

        closeItem: function () {
            if ($portfolioDetails && $portfolioDetails.height() > 32) {
                $portfolioAjaxLoader.fadeIn();
                $portfolioDetails.find('#portfolio-ajax-single').fadeOut('600', function () {
                    $(this).remove();
                });
                $portfolioDetails.removeClass('portfolio-ajax-opened');
            }
        },

        openItem: function () {
            var noOfImages = $portfolioDetails.find('img').length;
            var noLoaded = 0;

            if (noOfImages > 0) {
                $portfolioDetails.find('img').on('load', function () {
                    noLoaded++;
                    var topOffsetScroll = SEMICOLON.initialize.topScrollOffset();
                    if (noOfImages === noLoaded) {
                        $portfolioDetailsContainer.css({ 'display': 'block' });
                        $portfolioDetails.addClass('portfolio-ajax-opened');
                        $portfolioAjaxLoader.fadeOut();
                        var t = setTimeout(function () {
                            SEMICOLON.widget.loadFlexSlider();
                            $('html,body').stop(true).animate({
                                'scrollTop': $portfolioDetails.offset().top - topOffsetScroll
                            }, 900, 'easeOutQuad');
                        }, 500);
                    }
                });
            } else {
                var topOffsetScroll = SEMICOLON.initialize.topScrollOffset();
                $portfolioDetailsContainer.css({ 'display': 'block' });
                $portfolioDetails.addClass('portfolio-ajax-opened');
                $portfolioAjaxLoader.fadeOut();
                var t = setTimeout(function () {
                    SEMICOLON.widget.loadFlexSlider();
                    $('html,body').stop(true).animate({
                        'scrollTop': $portfolioDetails.offset().top - topOffsetScroll
                    }, 900, 'easeOutQuad');
                }, 500);
            }
        },

        getNextItem: function (portPostId) {
            var portNext = '';
            var hasNext = $('#' + portPostId).next();
            if (hasNext.length != 0) {
                portNext = hasNext.attr('id');
            }
            return portNext;
        },

        getPrevItem: function (portPostId) {
            var portPrev = '';
            var hasPrev = $('#' + portPostId).prev();
            if (hasPrev.length != 0) {
                portPrev = hasPrev.attr('id');
            }
            return portPrev;
        },

        initializeAjax: function (portPostId) {
            prevPostPortId = $('#' + portPostId);

            $('#next-portfolio, #prev-portfolio').click(function () {
                var portPostId = $(this).attr('data-id');
                $portfolioItems.removeClass('portfolio-active');
                $('#' + portPostId).addClass('portfolio-active');
                SEMICOLON.portfolio.loadItem(portPostId, prevPostPortId);
                return false;
            });

            $('#close-portfolio').click(function () {
                $portfolioDetailsContainer.fadeOut('600', function () {
                    $portfolioDetails.find('#portfolio-ajax-single').remove();
                });
                $portfolioDetails.removeClass('portfolio-ajax-opened');
                $portfolioItems.removeClass('portfolio-active');
                return false;
            });
        }

    };

    SEMICOLON.widget = {

        init: function () {
            SEMICOLON.widget.extras();
        },

        parallax: function () {

            if (!$.stellar) {
                console.log('parallax: Stellar not Defined.');
                return true;
            }

            if ($parallaxEl.length > 0 || $parallaxPageTitleEl.length > 0 || $parallaxPortfolioEl.length > 0) {
                if (!SEMICOLON.isMobile.any()) {
                    $.stellar({
                        horizontalScrolling: false,
                        verticalOffset: 150
                    });
                } else {
                    $parallaxEl.addClass('mobile-parallax');
                    $parallaxPageTitleEl.addClass('mobile-parallax');
                    $parallaxPortfolioEl.addClass('mobile-parallax');
                }
            }
        },

        loadFlexSlider: function () {

            if (!$().flexslider) {
                console.log('loadFlexSlider: FlexSlider not Defined.');
                return true;
            }

            var $flexSliderEl = $('.fslider:not(.customjs)').find('.flexslider');
            if ($flexSliderEl.length > 0) {
                $flexSliderEl.each(function () {
                    var $flexsSlider = $(this),
                        flexsAnimation = $flexsSlider.parent('.fslider').attr('data-animation'),
                        flexsEasing = $flexsSlider.parent('.fslider').attr('data-easing'),
                        flexsDirection = $flexsSlider.parent('.fslider').attr('data-direction'),
                        flexsReverse = $flexsSlider.parent('.fslider').attr('data-reverse'),
                        flexsSlideshow = $flexsSlider.parent('.fslider').attr('data-slideshow'),
                        flexsPause = $flexsSlider.parent('.fslider').attr('data-pause'),
                        flexsSpeed = $flexsSlider.parent('.fslider').attr('data-speed'),
                        flexsVideo = $flexsSlider.parent('.fslider').attr('data-video'),
                        flexsPagi = $flexsSlider.parent('.fslider').attr('data-pagi'),
                        flexsArrows = $flexsSlider.parent('.fslider').attr('data-arrows'),
                        flexsThumbs = $flexsSlider.parent('.fslider').attr('data-thumbs'),
                        flexsHover = $flexsSlider.parent('.fslider').attr('data-hover'),
                        flexsSheight = $flexsSlider.parent('.fslider').attr('data-smooth-height'),
                        flexsTouch = $flexsSlider.parent('.fslider').attr('data-touch'),
                        flexsUseCSS = false;

                    if (!flexsAnimation) { flexsAnimation = 'slide'; }
                    if (!flexsEasing || flexsEasing == 'swing') {
                        flexsEasing = 'swing';
                        flexsUseCSS = true;
                    }
                    if (!flexsDirection) { flexsDirection = 'horizontal'; }
                    if (flexsReverse == 'true') { flexsReverse = true; } else { flexsReverse = false; }
                    if (!flexsSlideshow) { flexsSlideshow = true; } else { flexsSlideshow = false; }
                    if (!flexsPause) { flexsPause = 5000; }
                    if (!flexsSpeed) { flexsSpeed = 600; }
                    if (!flexsVideo) { flexsVideo = false; }
                    if (flexsSheight == 'false') { flexsSheight = false; } else { flexsSheight = true; }
                    if (flexsDirection == 'vertical') { flexsSheight = false; }
                    if (flexsPagi == 'false') { flexsPagi = false; } else { flexsPagi = true; }
                    if (flexsThumbs == 'true') { flexsPagi = 'thumbnails'; } else { flexsPagi = flexsPagi; }
                    if (flexsArrows == 'false') { flexsArrows = false; } else { flexsArrows = true; }
                    if (flexsHover == 'false') { flexsHover = false; } else { flexsHover = true; }
                    if (flexsTouch == 'false') { flexsTouch = false; } else { flexsTouch = true; }

                    $flexsSlider.flexslider({
                        selector: ".slider-wrap > .slide",
                        animation: flexsAnimation,
                        easing: flexsEasing,
                        direction: flexsDirection,
                        reverse: flexsReverse,
                        slideshow: flexsSlideshow,
                        slideshowSpeed: Number(flexsPause),
                        animationSpeed: Number(flexsSpeed),
                        pauseOnHover: flexsHover,
                        video: flexsVideo,
                        controlNav: flexsPagi,
                        directionNav: flexsArrows,
                        smoothHeight: flexsSheight,
                        useCSS: flexsUseCSS,
                        touch: flexsTouch,
                        start: function (slider) {
                            slider.parent().removeClass('preloader2');
                            var t = setTimeout(function () { $('.grid-container').isotope('layout'); }, 1200);
                            $('.flex-prev').html('<i class="icon-angle-left"></i>');
                            $('.flex-next').html('<i class="icon-angle-right"></i>');
                        },
                        after: function () {
                            if ($('.grid-container').hasClass('portfolio-full')) {
                                $('.grid-container.portfolio-full').isotope('layout');
                                SEMICOLON.portfolio.portfolioDescMargin();
                            }
                        }
                    });
                });
            }
        },

        runCounter: function (counterElement, counterElementComma) {
            if (counterElementComma == true) {
                counterElement.find('span').countTo({
                    formatter: function (value, options) {
                        value = value.toFixed(options.decimals);
                        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        return value;
                    }
                });
            } else {
                counterElement.find('span').countTo();
            }
        },

        runRoundedSkills: function (element, properties) {
            element.easyPieChart({
                size: Number(properties.roundSkillSize),
                animate: Number(properties.roundSkillSpeed),
                scaleColor: false,
                trackColor: properties.roundSkillTrackColor,
                lineWidth: Number(properties.roundSkillWidth),
                lineCap: 'square',
                barColor: properties.roundSkillColor
            });
        },

        masonryThumbsArrange: function (element) {

            if (!$().isotope) {
                console.log('masonryThumbsArrange: Isotope not Defined.');
                return true;
            }

            SEMICOLON.initialize.setFullColumnWidth(element);
            element.isotope('layout');
        },

        notifications: function (element) {

            if (typeof toastr === 'undefined') {
                console.log('notifications: Toastr not Defined.');
                return true;
            }

            toastr.remove();
            var notifyElement = $(element),
                notifyPosition = notifyElement.attr('data-notify-position'),
                notifyType = notifyElement.attr('data-notify-type'),
                notifyMsg = notifyElement.attr('data-notify-msg'),
                notifyCloseButton = notifyElement.attr('data-notify-close');

            if (!notifyPosition) { notifyPosition = 'toast-top-right'; } else { notifyPosition = 'toast-' + notifyElement.attr('data-notify-position'); }
            if (!notifyMsg) { notifyMsg = 'Please set a message!'; }
            if (notifyCloseButton == 'true') { notifyCloseButton = true; } else { notifyCloseButton = false; }

            toastr.options.positionClass = notifyPosition;
            toastr.options.closeButton = notifyCloseButton;
            toastr.options.closeHtml = '<button><i class="icon-remove"></i></button>';

            if (notifyType == 'warning') {
                toastr.warning(notifyMsg);
            } else if (notifyType == 'error') {
                toastr.error(notifyMsg);
            } else if (notifyType == 'success') {
                toastr.success(notifyMsg);
            } else {
                toastr.info(notifyMsg);
            }

            return false;
        },

        extras: function () {

            if ($().tooltip) {
                $('[data-toggle="tooltip"]').tooltip({ container: 'body' });
            } else {
                console.log('extras: Bootstrap Tooltip not defined.');
            }

            if ($().popover) {
                $('[data-toggle=popover]').popover();
            } else {
                console.log('extras: Bootstrap Popover not defined.');
            }

            $('.style-msg').on('click', '.close', function (e) {
                $(this).parents('.style-msg').slideUp();
                e.preventDefault();
            });

            $('#primary-menu-trigger,#overlay-menu-close').click(function () {
                if ($('#primary-menu').find('ul.mobile-primary-menu').length > 0) {
                    $('#primary-menu > ul.mobile-primary-menu, #primary-menu > div > ul.mobile-primary-menu').toggleClass("show");
                } else {
                    $('#primary-menu > ul, #primary-menu > div > ul').toggleClass("show");
                }
                $body.toggleClass("primary-menu-open");
                return false;
            });
            $('#page-submenu-trigger').click(function () {
                $body.toggleClass('top-search-open', false);
                $pagemenu.toggleClass("pagemenu-active");
                return false;
            });
            $pagemenu.find('nav').click(function (e) {
                $body.toggleClass('top-search-open', false);
                $topCart.toggleClass('top-cart-open', false);
            });
            if (SEMICOLON.isMobile.any()) {
                $body.addClass('device-touch');
            }
        }

    };

    SEMICOLON.isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (SEMICOLON.isMobile.Android() || SEMICOLON.isMobile.BlackBerry() || SEMICOLON.isMobile.iOS() || SEMICOLON.isMobile.Opera() || SEMICOLON.isMobile.Windows());
        }
    };

    SEMICOLON.documentOnResize = {

        init: function () {

            var t = setTimeout(function () {
                if ($body.hasClass('device-lg') || $body.hasClass('device-md')) {
                    $('#primary-menu').find('ul.mobile-primary-menu').removeClass('show');
                }
            }, 500);

            windowWidth = $window.width();

        }

    };

    SEMICOLON.documentOnReady = {

        init: function () {
            SEMICOLON.initialize.init();
            SEMICOLON.widget.init(); //extrass()
            //SEMICOLON.documentOnReady.windowscroll();
        },

        windowscroll: function () {

            var headerOffset = 0,
                headerWrapOffset = 0,
                pageMenuOffset = 0;

            if ($header.length > 0) { headerOffset = $header.offset().top; }
            if ($header.length > 0) { headerWrapOffset = $headerWrap.offset().top; }
            if ($pagemenu.length > 0) {
                if ($header.length > 0 && !$header.hasClass('no-sticky')) {
                    if ($header.hasClass('sticky-style-2') || $header.hasClass('sticky-style-3')) {
                        pageMenuOffset = $pagemenu.offset().top - $headerWrap.outerHeight();
                    } else {
                        pageMenuOffset = $pagemenu.offset().top - $header.outerHeight();
                    }
                } else {
                    pageMenuOffset = $pagemenu.offset().top;
                }
            }

            var headerDefinedOffset = $header.attr('data-sticky-offset');
            if (typeof headerDefinedOffset !== 'undefined') {
                if (headerDefinedOffset == 'full') {
                    headerWrapOffset = $window.height();
                    var headerOffsetNegative = $header.attr('data-sticky-offset-negative');
                    if (typeof headerOffsetNegative !== 'undefined') { headerWrapOffset = headerWrapOffset - headerOffsetNegative - 1; }
                } else {
                    headerWrapOffset = Number(headerDefinedOffset);
                }
            }

            SEMICOLON.header.stickyMenu(headerWrapOffset);

            $window.on('scroll', function () {

                //SEMICOLON.initialize.goToTopScroll();
                $('body.open-header.close-header-on-scroll').removeClass("side-header-open");
                SEMICOLON.header.stickyMenu(headerWrapOffset);

            });

            window.addEventListener('scroll', onScrollSliderParallax, false);
        }

    };

    var $window = $(window),
        $body = $('body'),
        $wrapper = $('#wrapper'),
        $header = $('#header'),
        $headerWrap = $('#header-wrap'),
        // $content = $('#content'),
        $footer = $('#footer'),
        windowWidth = $window.width(),
        oldHeaderClasses = $header.attr('class'),
        oldHeaderWrapClasses = $headerWrap.attr('class'),
        stickyMenuClasses = $header.attr('data-sticky-class'),
        responsiveMenuClasses = $header.attr('data-responsive-class'),
        // defaultLogo = $('#logo').find('.standard-logo'),
        // defaultLogoWidth = defaultLogo.find('img').outerWidth(),
        // retinaLogo = $('#logo').find('.retina-logo'),
        // defaultLogoImg = defaultLogo.find('img').attr('src'),
        // retinaLogoImg = retinaLogo.find('img').attr('src'),
        // defaultDarkLogo = defaultLogo.attr('data-dark-logo'),
        // retinaDarkLogo = retinaLogo.attr('data-dark-logo'),
        // defaultStickyLogo = defaultLogo.attr('data-sticky-logo'),
        // retinaStickyLogo = retinaLogo.attr('data-sticky-logo'),
        // defaultMobileLogo = defaultLogo.attr('data-mobile-logo'),
        // retinaMobileLogo = retinaLogo.attr('data-mobile-logo'),
        $pagemenu = $('#page-menu'),
        // $onePageMenuEl = $('.one-page-menu'),
        onePageGlobalOffset = 0,
        // $portfolio = $('.portfolio'),
        // $shop = $('.shop'),
        // $gridContainer = $('.grid-container'),
        $slider = $('#slider'),
        $sliderParallaxEl = $('.slider-parallax'),
        swiperSlider = '',
        $pageTitle = $('#page-title'),
        $portfolioItems = $('.portfolio-ajax').find('.portfolio-item'),
        $portfolioDetails = $('#portfolio-ajax-wrap'),
        $portfolioDetailsContainer = $('#portfolio-ajax-container'),
        $portfolioAjaxLoader = $('#portfolio-ajax-loader'),
        $portfolioFilter = $('.portfolio-filter,.custom-filter'),
        prevPostPortId = '',
        // $topSearch = $('#top-search'),
        $topCart = $('#top-cart'),
        // $verticalMiddleEl = $('.vertical-middle'),
        // $topSocialEl = $('#top-social').find('li'),
        // $siStickyEl = $('.si-sticky'),
        // $dotsMenuEl = $('.dots-menu'),
        //$goToTopEl = $('#gotoTop'),
        // $fullScreenEl = $('.full-screen'),
        // $commonHeightEl = $('.common-height'),
        // $testimonialsGridEl = $('.testimonials-grid'),
        $pageSectionEl = $('.page-section'),
        $owlCarouselEl = $('.owl-carousel'),
        $parallaxEl = $('.parallax'),
        $parallaxPageTitleEl = $('.page-title-parallax'),
        $parallaxPortfolioEl = $('.portfolio-parallax').find('.portfolio-image');
        // $textRotaterEl = $('.text-rotater'),
        // $cookieNotification = $('#cookie-notification');

    $(document).ready(SEMICOLON.documentOnReady.init);
    $window.on('resize', SEMICOLON.documentOnResize.init);

})(jQuery);;
var ja = jQuery.noConflict();

function setNotifCookie(value, exdays) {
    setCookie('notif', value, exdays);
    //window.location.reload(true);
}
function getNotifCookie() {
    var notifCookie = getCookie('notif');
    if (!notifCookie)
        notifCookie = true;
    return notifCookie;
}

function notificationOff() {
    var notif = getNotifCookie();
    
    if (notif == "false") {
        //console.log(notif);
        ja(".notifCount").removeClass("newNotif");
    }
    else {
         ja(".notifCount").addClass("newNotif");
        ja(".bell").click(function () {
            ja(".notifCount").removeClass("newNotif");
            setNotifCookie(false, 1);
        });
    }
}
jQuery.event.special.touchstart = {
    setup: function (_, ns, handle) {
        this.addEventListener("touchstart", handle, { passive: !ns.includes("noPreventDefault") });
    }
};
ja(document).ready(function () {
    //alert(ja(document).scrollTop());

    notificationOff();

   




	ja('#errorModal h2 span, .btnErrorClose').on('click',function(e){
		e.preventDefault();
		ja('#errorModal').modal('hide');
	});
 

    function t() {
        "" === ja("#aff").val() ? (b = !0, ja("#aff").css("border-color", "#ec0000"), ja(".i.okcross").show(), ja(".i.okcheck").hide()) : (b = !1, ja("#aff").css("border-color", "#028843"), ja(".i.okcheck").show(), ja(".i.okcross").hide())
    } ! function () {
        var a = window.location.href.lastIndexOf("/") + 1,
            s = window.location.href.substr(a).split(".")[0];
        //console.log(s);
        "index" != s && "" != s || "en-US" == s && "index-light" != s || ja("#primary-menu ul > li:nth-child(1)").addClass("selected"),
            "en-US" == s && ja("#primary-menu ul > li:nth-child(1)").addClass("selected"),
            "vi-VN" == s && ja("#primary-menu ul > li:nth-child(1)").addClass("selected"),
            "zh-CN" == s && ja("#primary-menu ul > li:nth-child(1)").addClass("selected"),
            "th-TH" == s && ja("#primary-menu ul > li:nth-child(1)").addClass("selected"),
            "Mobile" == s && ja("#primary-menu ul > li:nth-child(2)").addClass("selected"),
            "Sportsbook" == s && ja("#primary-menu ul > li:nth-child(3)").addClass("selected"),
            "VirtualSports" == s && ja("#primary-menu ul > li:nth-child(4)").addClass("selected"),
            "Esports" == s && ja("#primary-menu ul > li:nth-child(5)").addClass("selected"),

            "CasinoClub" == s && ja("#primary-menu ul > li:nth-child(6)").addClass("selected"),
            "LiveCasino" == s && ja("#primary-menu ul > li:nth-child(6)").addClass("selected"),
            //this is for livecasino nav to active when switch to livecasino
            "LiveCasino#ClubAce" == s && ja("#primary-menu ul > li:nth-child(6)").addClass("selected"),
            "LiveCasino#ClubKing" == s && ja("#primary-menu ul > li:nth-child(6)").addClass("selected"),
            "LiveCasino#ClubQueen" == s && ja("#primary-menu ul > li:nth-child(6)").addClass("selected"),
            "LiveCasino#ClubJack" == s && ja("#primary-menu ul > li:nth-child(6)").addClass("selected"),
            "LiveCasino#ClubTen" == s && ja("#primary-menu ul > li:nth-child(6)").addClass("selected"),
            "LiveCasino#ClubNine" == s && ja("#primary-menu ul > li:nth-child(6)").addClass("selected"),



            "Slots" == s && ja("#primary-menu ul > li:nth-child(7)").addClass("selected"),
            "Games" == s && ja("#primary-menu ul > li:nth-child(8").addClass("selected"),
            "Lottery" == s && ja("#primary-menu ul > li:nth-child(9)").addClass("selected"),
            "Promotions" != s && "promotion_light" != s || ja("#primary-menu ul > li:nth-child(10)").addClass("selected");
    }(), setInterval(function () {
        var a = (new Date).toLocaleString('en-GB', { year: 'numeric', month: 'numeric', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        ja(".time-part").html(a);
    }, 100), ja(".login").on("click", function (a) {
        a.preventDefault(), a.stopPropagation(), ja(this).next(".loginBody:first").is(":hidden"), ja(this).next(".loginBody:first").slideToggle("fast");
    }), ja(document).on("click", function (a) {
        ja(".loginBody").is(":visible") && ja(".loginBody").slideToggle("fast");
        }), ja(".loginBody, #modal-dark ul li a, #modal-dark").on("click", function (a) {
        ja(this).is(":visible") && a.stopPropagation();
    }), ja("ul.tabs li").click(function () {
        var a = ja(this).attr("data-tab");
        if ("" == a) return !1;
        ja("ul.tabs li").removeClass("current"), ja(".tab-content").removeClass("current"), ja(this).addClass("current"), ja("#" + a).addClass("current");
    }),
        ja("#primary-menu ul li .mega-menu-content.style-2 li ul.listv li.listnav").hover(function () {
        ja(this).addClass("active").siblings().removeClass("active"), ja(this).css("color", "red");
        });
    ja('#modal-dark ul li a, .heading-close .white-text').click(function () {
        ja('#overlay, #modal-dark').removeClass('open');
        ja('body').removeClass('no-scroll');
    });
    //login dropdown at header
    //ja(".clicks").parent().mouseenter(function (e) {
    //    e.preventDefault();
    //    if (ja(this).first().hasClass('active')) {
    //        ja(this).first().removeClass('active');
    //    }
    //    else {
    //        ja(this).first().addClass('active');
    //    }
    //    //show
    //    ja(".notes").stop().slideDown('fast');

    //}).mouseleave(function () {
    //    ja(".notes").stop().slideToggle('fast');
    //    //hide
    //    ja(".profileChild").is(":visible") && ja(".profileChild").stop().slideToggle("fast");
    //    ja('.profile').removeClass('active');

    //    ja('.balance').removeClass('active');
    //    ja(".balanceChild").is(":visible") && ja(".balanceChild").stop().slideToggle("fast");
    //});

    //ja(document).on("click", function () {
    //    ja(".notes").is(":visible") && ja(".notes").slideToggle("fast");
    //    ja(".profileChild").is(":visible") && ja(".profileChild").slideToggle("fast");
    //    ja(".balanceChild").is(":visible") && ja(".balanceChild").slideToggle("fast");
    //    ja('.profile').removeClass('active');
    //    ja('.clicks').removeClass('active');
    //    ja('.balance').removeClass('active');

    //});

    //ja(".profileChild, .notes, .balanceChild").on("click", function (e) {
    //    ja(this).is(":visible") && e.stopPropagation();
    //    //ja('.profile').removeClass('active');
    //    //ja('.clicks').removeClass('active');
    //    //ja('.balance').removeClass('active');
    //});


    //ja(".profile").parent().mouseenter(function (e) {
    //    e.preventDefault();
    //    if (ja(this).first().hasClass('active')) {
    //        ja(this).first().removeClass('active');
    //    }
    //    else {
    //        ja(this).first().addClass('active');
    //    }
    //    //show
    //    ja(".profileChild").stop().slideDown('fast');
   
    //}).mouseleave(function (e) {
    //    ja(".profileChild").stop().slideToggle('fast');
    //    ja('.clicks').removeClass('active');
    //    ja(".notes").is(":visible") && ja(".notes").stop().slideToggle("fast");
    //    ja('.balance').removeClass('active');
    //    ja(".balanceChild").is(":visible") && ja(".balanceChild").stop().slideToggle("fast");
    // });

    //ja(".balance").parent().mouseenter(function (e) {
    //    e.preventDefault();
    //    if (ja(this).first().hasClass('active')) {
    //        ja(this).first().removeClass('active');
    //    }
    //    else {
    //        ja(this).first().addClass('active');
    //    }
    //    //show
    //    ja(".balanceChild").stop().slideDown('fast');
    //}).mouseleave(function () {
    //    ja(".balanceChild").stop().slideToggle('fast');

    //    //hide
    //    ja('.clicks').removeClass('active');
    //    ja(".notes").is(":visible") && ja(".notes").stop().slideToggle("fast");

    //    ja(".profileChild").is(":visible") && ja(".profileChild").stop().slideToggle("fast");
    //    ja('.profile').removeClass('active');
    //   });


    ja(".balance #walletRefreshHeader").on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });




    
    //SETTING LANGUAGE ON HTML TAG
    var x = getLangCookie();
    
    var b = document.querySelector("html");
    b.setAttribute("lang", x);
    var bodyColor = getBackgroundCookie();
    if (bodyColor == 'whiteBody') {
        ja("#slider .tp-revslider-mainul .test .slotholder .tp-bgimg.defaultimg").removeAttr('style');
       // alert(bodyColor);
    }

    //if (x == 'vi-VN') {
    //    ja('.footerLinkBlog').attr("href", "https://fb88blog.com/");
    //} else {
    //    ja('.footerLinkBlog').attr("href", "https://fb88blog.com/en/");
    //}


    //var targetOffset = ja("#header").offset().top;
    //if (ja("#btn-Chat").hasClass("homeChat")) {
    //    ja("#btn-Chat").hide();
    //}
    //else { }
    //var jaw = ja(window).scroll(function () {
    //    if (ja("#btn-Chat").hasClass("homeChat")) {
    //        if (jaw.scrollTop() > targetOffset) {
    //            ja("#btn-Chat").show();
    //        } else {
    //            ja("#btn-Chat").hide();
    //        }
    //    }

    //});


    ja('#blogDropdown').on('change', function () {
        var blogOption = ja(this).val();
        //console.log(blogOption);
        ja('.tab-content').hide();
        ja('#' + blogOption).show();
        ja('#tab-2 ul li').removeClass('ui-tabs-active ui-state-active');
        if (blogOption == 'AllNews') {
            ja('#tab-2 ul li:first-child').addClass('ui-tabs-active ui-state-active');
            jQuery(".btnMoreDetails").show();
        }
        else if (blogOption == 'BettingNews') {
            ja('#tab-2 ul li:nth-child(2)').addClass('ui-tabs-active ui-state-active');
            jQuery(".btnMoreDetails").show();
        }
        else if (blogOption == 'SocialNews') {
            ja('#tab-2 ul li:nth-child(3)').addClass('ui-tabs-active ui-state-active');
            jQuery(".btnMoreDetails").show();
        }
        else if (blogOption == 'LocalNews') {
            ja('#tab-2 ul li:nth-child(4)').addClass('ui-tabs-active ui-state-active');
            jQuery(".btnMoreDetails").show();
        }
        else if (blogOption == 'LiveChat') {
            jQuery(".btnMoreDetails").hide();
        }
    });


    /*
        TAB IN MODAL HEADER
    */

    ja('#General').show();
    ja("ul.tabHead li").on('click', function () {
        var tabName = ja(this).attr('data-tab');
        if ("" == tabName) return !1;
        ja("ul.tabHead li").removeClass("active"),
        ja(this).addClass("active"),
        ja('.meHid').hide(),
        ja("#" + tabName).show();
    });

    $('#selectTab').on('change', function () {
        var optTab = $("#selectTab").val();
        $('.meHid').hide();
        $('#' + optTab).show();

        ja("ul.tabHead li").removeClass("active");
        ja("." + optTab).addClass("active");
    });



    ja("#headerModal .modal-body #tabBody").mCustomScrollbar({
        setHeight: 280,
        theme: "minimal-dark"
    });

    $(window).scroll(function () {
        if ($(window).scrollTop() > 200) {
            $('#toTop').show();
        } else {
            $('#toTop').hide();
        }
    });
    $('#toTop').click(function () {
        $('body,html').stop(true).animate({
            'scrollTop': 0
        },800);
    });


    //if (navigator.userAgent.toLowerCase().indexOf("chrome") >= 0) {
    //    $(window).load(function () {
    //        //$('input:-webkit-autofill').each(function () {
    //        //    var text = $(this).val();
    //        //    var name = $(this).attr('name');
    //        //    $(this).after(this.outerHTML).remove();
    //        //    $('input[name=' + name + ']').val(text);
    //        //});
    //        $('input').attr('autocomplete', 'false');
    //    });
    //}
});;
window.Modernizr = function (e, t, n) {
    function r(e) {
        g.cssText = e
    }

    function o(e, t) {
        return r(w.join(e + ";") + (t || ""))
    }

    function a(e, t) {
        return typeof e === t
    }

    function i(e, t) {
        return !!~("" + e).indexOf(t)
    }

    function c(e, t) {
        for (var r in e) {
            var o = e[r];
            if (!i(o, "-") && g[o] !== n) return "pfx" != t || o
        }
        return !1
    }

    function s(e, t, r) {
        for (var o in e) {
            var i = t[e[o]];
            if (i !== n) return !1 === r ? e[o] : a(i, "function") ? i.bind(r || t) : i
        }
        return !1
    }

    function u(e, t, n) {
        var r = e.charAt(0).toUpperCase() + e.slice(1),
            o = (e + " " + x.join(r + " ") + r).split(" ");
        return a(t, "string") || a(t, "undefined") ? c(o, t) : (o = (e + " " + E.join(r + " ") + r).split(" "), s(o, t, n))
    }
    var l, d, f = {},
        m = t.documentElement,
        p = "modernizr",
        h = t.createElement(p),
        g = h.style,
        v = t.createElement("input"),
        b = ":)",
        y = {}.toString,
        w = " -webkit- -moz- -o- -ms- ".split(" "),
        x = "Webkit Moz O ms".split(" "),
        E = "Webkit Moz O ms".toLowerCase().split(" "),
        C = {
            svg: "http://www.w3.org/2000/svg"
        },
        S = {},
        k = {},
        T = {},
        M = [],
        N = M.slice,
        P = function (e, n, r, o) {
            var a, i, c, s, u = t.createElement("div"),
                l = t.body,
                d = l || t.createElement("body");
            if (parseInt(r, 10))
                for (; r--;)(c = t.createElement("div")).id = o ? o[r] : p + (r + 1), u.appendChild(c);
            return a = ["&#173;", '<style id="s', p, '">', e, "</style>"].join(""), u.id = p, (l ? u : d).innerHTML += a, d.appendChild(u), l || (d.style.background = "", d.style.overflow = "hidden", s = m.style.overflow, m.style.overflow = "hidden", m.appendChild(d)), i = n(u, e), l ? u.parentNode.removeChild(u) : (d.parentNode.removeChild(d), m.style.overflow = s), !!i
        },
        j = function (t) {
            var n = e.matchMedia || e.msMatchMedia;
            if (n) return n(t) && n(t).matches || !1;
            var r;
            return P("@media " + t + " { #" + p + " { position: absolute; } }", function (t) {
                r = "absolute" == (e.getComputedStyle ? getComputedStyle(t, null) : t.currentStyle).position
            }), r
        },
        $ = function () {
            function e(e, o) {
                o = o || t.createElement(r[e] || "div");
                var i = (e = "on" + e) in o;
                return i || (o.setAttribute || (o = t.createElement("div")), o.setAttribute && o.removeAttribute && (o.setAttribute(e, ""), i = a(o[e], "function"), a(o[e], "undefined") || (o[e] = n), o.removeAttribute(e))), o = null, i
            }
            var r = {
                select: "input",
                change: "input",
                submit: "form",
                reset: "form",
                error: "img",
                load: "img",
                abort: "img"
            };
            return e
        }(),
        D = {}.hasOwnProperty;
    d = a(D, "undefined") || a(D.call, "undefined") ? function (e, t) {
        return t in e && a(e.constructor.prototype[t], "undefined")
    } : function (e, t) {
        return D.call(e, t)
    }, Function.prototype.bind || (Function.prototype.bind = function (e) {
        var t = this;
        if ("function" != typeof t) throw new TypeError;
        var n = N.call(arguments, 1),
            r = function () {
                if (this instanceof r) {
                    var o = function () { };
                    o.prototype = t.prototype;
                    var a = new o,
                        i = t.apply(a, n.concat(N.call(arguments)));
                    return Object(i) === i ? i : a
                }
                return t.apply(e, n.concat(N.call(arguments)))
            };
        return r
    }), S.flexbox = function () {
        return u("flexWrap")
    }, S.flexboxlegacy = function () {
        return u("boxDirection")
    }, S.canvas = function () {
        var e = t.createElement("canvas");
        return !(!e.getContext || !e.getContext("2d"))
    }, S.canvastext = function () {
        return !(!f.canvas || !a(t.createElement("canvas").getContext("2d").fillText, "function"))
    }, S.webgl = function () {
        return !!e.WebGLRenderingContext
    }, S.touch = function () {
        var n;
        return "ontouchstart" in e || e.DocumentTouch && t instanceof DocumentTouch ? n = !0 : P(["@media (", w.join("touch-enabled),("), p, ")", "{#modernizr{top:9px;position:absolute}}"].join(""), function (e) {
            n = 9 === e.offsetTop
        }), n
    }, S.geolocation = function () {
        return "geolocation" in navigator
    }, S.postmessage = function () {
        return !!e.postMessage
    }, S.websqldatabase = function () {
        return !!e.openDatabase
    }, S.indexedDB = function () {
        return !!u("indexedDB", e)
    }, S.hashchange = function () {
        return $("hashchange", e) && (t.documentMode === n || t.documentMode > 7)
    }, S.history = function () {
        return !(!e.history || !history.pushState)
    }, S.draganddrop = function () {
        var e = t.createElement("div");
        return "draggable" in e || "ondragstart" in e && "ondrop" in e
    }, S.websockets = function () {
        return "WebSocket" in e || "MozWebSocket" in e
    }, S.rgba = function () {
        return r("background-color:rgba(150,255,150,.5)"), i(g.backgroundColor, "rgba")
    }, S.hsla = function () {
        return r("background-color:hsla(120,40%,100%,.5)"), i(g.backgroundColor, "rgba") || i(g.backgroundColor, "hsla")
    }, S.multiplebgs = function () {
        return r("background:url(https://),url(https://),red url(https://)"), /(url\s*\(.*?){3}/.test(g.background)
    }, S.backgroundsize = function () {
        return u("backgroundSize")
    }, S.borderimage = function () {
        return u("borderImage")
    }, S.borderradius = function () {
        return u("borderRadius")
    }, S.boxshadow = function () {
        return u("boxShadow")
    }, S.textshadow = function () {
        return "" === t.createElement("div").style.textShadow
    }, S.opacity = function () {
        return o("opacity:.55"), /^0.55$/.test(g.opacity)
    }, S.cssanimations = function () {
        return u("animationName")
    }, S.csscolumns = function () {
        return u("columnCount")
    }, S.cssgradients = function () {
        var e = "background-image:";
        return r((e + "-webkit- ".split(" ").join("gradient(linear,left top,right bottom,from(#9f9),to(white));" + e) + w.join("linear-gradient(left top,#9f9, white);" + e)).slice(0, -e.length)), i(g.backgroundImage, "gradient")
    }, S.cssreflections = function () {
        return u("boxReflect")
    }, S.csstransforms = function () {
        return !!u("transform")
    }, S.csstransforms3d = function () {
        var e = !!u("perspective");
        return e && "webkitPerspective" in m.style && P("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}", function (t, n) {
            e = 9 === t.offsetLeft && 3 === t.offsetHeight
        }), e
    }, S.csstransitions = function () {
        return u("transition")
    }, S.fontface = function () {
        var e;
        return P('@font-face {font-family:"font";src:url("https://")}', function (n, r) {
            var o = t.getElementById("smodernizr"),
                a = o.sheet || o.styleSheet,
                i = a ? a.cssRules && a.cssRules[0] ? a.cssRules[0].cssText : a.cssText || "" : "";
            e = /src/i.test(i) && 0 === i.indexOf(r.split(" ")[0])
        }), e
    }, S.generatedcontent = function () {
        var e;
        return P(["#", p, "{font:0/0 a}#", p, ':after{content:"', b, '";visibility:hidden;font:3px/1 a}'].join(""), function (t) {
            e = t.offsetHeight >= 3
        }), e
    }, S.video = function () {
        var e = t.createElement("video"),
            n = !1;
        try {
            (n = !!e.canPlayType) && ((n = new Boolean(n)).ogg = e.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ""), n.h264 = e.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ""), n.webm = e.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ""))
        } catch (e) { }
        return n
    }, S.audio = function () {
        var e = t.createElement("audio"),
            n = !1;
        try {
            (n = !!e.canPlayType) && ((n = new Boolean(n)).ogg = e.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), n.mp3 = e.canPlayType("audio/mpeg;").replace(/^no$/, ""), n.wav = e.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""), n.m4a = (e.canPlayType("audio/x-m4a;") || e.canPlayType("audio/aac;")).replace(/^no$/, ""))
        } catch (e) { }
        return n
    }, S.localstorage = function () {
        try {
            return localStorage.setItem(p, p), localStorage.removeItem(p), !0
        } catch (e) {
            return !1
        }
    }, S.sessionstorage = function () {
        try {
            return sessionStorage.setItem(p, p), sessionStorage.removeItem(p), !0
        } catch (e) {
            return !1
        }
    }, S.webworkers = function () {
        return !!e.Worker
    }, S.applicationcache = function () {
        return !!e.applicationCache
    }, S.svg = function () {
        return !!t.createElementNS && !!t.createElementNS(C.svg, "svg").createSVGRect
    }, S.inlinesvg = function () {
        var e = t.createElement("div");
        return e.innerHTML = "<svg/>", (e.firstChild && e.firstChild.namespaceURI) == C.svg
    }, S.smil = function () {
        return !!t.createElementNS && /SVGAnimate/.test(y.call(t.createElementNS(C.svg, "animate")))
    }, S.svgclippaths = function () {
        return !!t.createElementNS && /SVGClipPath/.test(y.call(t.createElementNS(C.svg, "clipPath")))
    };
    for (var q in S) d(S, q) && (l = q.toLowerCase(), f[l] = S[q](), M.push((f[l] ? "" : "no-") + l));
    return f.input || function () {
        f.input = function (n) {
            for (var r = 0, o = n.length; r < o; r++) T[n[r]] = !!(n[r] in v);
            return T.list && (T.list = !(!t.createElement("datalist") || !e.HTMLDataListElement)), T
        }("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")), f.inputtypes = function (e) {
            for (var r, o, a, i = 0, c = e.length; i < c; i++) v.setAttribute("type", o = e[i]), (r = "text" !== v.type) && (v.value = b, v.style.cssText = "position:absolute;visibility:hidden;", /^range$/.test(o) && v.style.WebkitAppearance !== n ? (m.appendChild(v), r = (a = t.defaultView).getComputedStyle && "textfield" !== a.getComputedStyle(v, null).WebkitAppearance && 0 !== v.offsetHeight, m.removeChild(v)) : /^(search|tel)$/.test(o) || (r = /^(url|email)$/.test(o) ? v.checkValidity && !1 === v.checkValidity() : v.value != b)), k[e[i]] = !!r;
            return k
        }("search tel url email datetime date month week time datetime-local number range color".split(" "))
    }(), f.addTest = function (e, t) {
        if ("object" == typeof e)
            for (var r in e) d(e, r) && f.addTest(r, e[r]);
        else {
            if (e = e.toLowerCase(), f[e] !== n) return f;
            t = "function" == typeof t ? t() : t, m.className += " " + (t ? "" : "no-") + e, f[e] = t
        }
        return f
    }, r(""), h = v = null,
        function (e, t) {
            function n(e, t) {
                var n = e.createElement("p"),
                    r = e.getElementsByTagName("head")[0] || e.documentElement;
                return n.innerHTML = "x<style>" + t + "</style>", r.insertBefore(n.lastChild, r.firstChild)
            }

            function r() {
                var e = v.elements;
                return "string" == typeof e ? e.split(" ") : e
            }

            function o(e) {
                var t = g[e[p]];
                return t || (t = {}, h++ , e[p] = h, g[h] = t), t
            }

            function a(e, n, r) {
                if (n || (n = t), l) return n.createElement(e);
                r || (r = o(n));
                var a;
                return a = r.cache[e] ? r.cache[e].cloneNode() : m.test(e) ? (r.cache[e] = r.createElem(e)).cloneNode() : r.createElem(e), !a.canHaveChildren || f.test(e) || a.tagUrn ? a : r.frag.appendChild(a)
            }

            function i(e, n) {
                if (e || (e = t), l) return e.createDocumentFragment();
                for (var a = (n = n || o(e)).frag.cloneNode(), i = 0, c = r(), s = c.length; i < s; i++) a.createElement(c[i]);
                return a
            }

            function c(e, t) {
                t.cache || (t.cache = {}, t.createElem = e.createElement, t.createFrag = e.createDocumentFragment, t.frag = t.createFrag()), e.createElement = function (n) {
                    return v.shivMethods ? a(n, e, t) : t.createElem(n)
                }, e.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + r().join().replace(/[\w\-]+/g, function (e) {
                    return t.createElem(e), t.frag.createElement(e), 'c("' + e + '")'
                }) + ");return n}")(v, t.frag)
            }

            function s(e) {
                e || (e = t);
                var r = o(e);
                return !v.shivCSS || u || r.hasCSS || (r.hasCSS = !!n(e, "article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")), l || c(e, r), e
            }
            var u, l, d = e.html5 || {},
                f = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
                m = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
                p = "_html5shiv",
                h = 0,
                g = {};
            ! function () {
                try {
                    var e = t.createElement("a");
                    e.innerHTML = "<xyz></xyz>", u = "hidden" in e, l = 1 == e.childNodes.length || function () {
                        t.createElement("a");
                        var e = t.createDocumentFragment();
                        return void 0 === e.cloneNode || void 0 === e.createDocumentFragment || void 0 === e.createElement
                    }()
                } catch (e) {
                    u = !0, l = !0
                }
            }();
            var v = {
                elements: d.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",
                version: "3.7.0",
                shivCSS: !1 !== d.shivCSS,
                supportsUnknownElements: l,
                shivMethods: !1 !== d.shivMethods,
                type: "default",
                shivDocument: s,
                createElement: a,
                createDocumentFragment: i
            };
            e.html5 = v, s(t)
        }(this, t), f._version = "2.8.2", f._prefixes = w, f._domPrefixes = E, f._cssomPrefixes = x, f.mq = j, f.hasEvent = $, f.testProp = function (e) {
            return c([e])
        }, f.testAllProps = u, f.testStyles = P, f.prefixed = function (e, t, n) {
            return t ? u(e, t, n) : u(e, "pfx")
        }, m.className = m.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + " js " + M.join(" "), f
}(this, this.document);
var qw = jQuery.noConflict();

qw(document).ready(function () {
  
});;
/*!
 * validate.js 0.11.1
 *
 * (c) 2013-2016 Nicklas Ansman, 2013 Wrapp
 * Validate.js may be freely distributed under the MIT license.
 * For all details and documentation:
 * http://validatejs.org/
 */

(function (exports, module, define) {
    "use strict";

    // The main function that calls the validators specified by the constraints.
    // The options are the following:
    //   - format (string) - An option that controls how the returned value is formatted
    //     * flat - Returns a flat array of just the error messages
    //     * grouped - Returns the messages grouped by attribute (default)
    //     * detailed - Returns an array of the raw validation data
    //   - fullMessages (boolean) - If `true` (default) the attribute name is prepended to the error.
    //
    // Please note that the options are also passed to each validator.
    var validate = function (attributes, constraints, options) {
        options = v.extend({}, v.options, options);

        var results = v.runValidations(attributes, constraints, options)
            , attr
            , validator;

        for (attr in results) {
            for (validator in results[attr]) {
                if (v.isPromise(results[attr][validator])) {
                    throw new Error("Use validate.async if you want support for promises");
                }
            }
        }
        return validate.processValidationResults(results, options);
    };

    var v = validate;

    // Copies over attributes from one or more sources to a single destination.
    // Very much similar to underscore's extend.
    // The first argument is the target object and the remaining arguments will be
    // used as sources.
    v.extend = function (obj) {
        [].slice.call(arguments, 1).forEach(function (source) {
            for (var attr in source) {
                obj[attr] = source[attr];
            }
        });
        return obj;
    };

    v.extend(validate, {
        // This is the version of the library as a semver.
        // The toString function will allow it to be coerced into a string
        version: {
            major: 0,
            minor: 11,
            patch: 1,
            metadata: null,
            toString: function () {
                var version = v.format("%{major}.%{minor}.%{patch}", v.version);
                if (!v.isEmpty(v.version.metadata)) {
                    version += "+" + v.version.metadata;
                }
                return version;
            }
        },

        // Below is the dependencies that are used in validate.js

        // The constructor of the Promise implementation.
        // If you are using Q.js, RSVP or any other A+ compatible implementation
        // override this attribute to be the constructor of that promise.
        // Since jQuery promises aren't A+ compatible they won't work.
        Promise: typeof Promise !== "undefined" ? Promise : /* istanbul ignore next */ null,

        EMPTY_STRING_REGEXP: /^\s*$/,

        // Runs the validators specified by the constraints object.
        // Will return an array of the format:
        //     [{attribute: "<attribute name>", error: "<validation result>"}, ...]
        runValidations: function (attributes, constraints, options) {
            var results = []
                , attr
                , validatorName
                , value
                , validators
                , validator
                , validatorOptions
                , error;

            if (v.isDomElement(attributes) || v.isJqueryElement(attributes)) {
                attributes = v.collectFormValues(attributes);
            }

            // Loops through each constraints, finds the correct validator and run it.
            for (attr in constraints) {
                value = v.getDeepObjectValue(attributes, attr);
                // This allows the constraints for an attribute to be a function.
                // The function will be called with the value, attribute name, the complete dict of
                // attributes as well as the options and constraints passed in.
                // This is useful when you want to have different
                // validations depending on the attribute value.
                validators = v.result(constraints[attr], value, attributes, attr, options, constraints);

                for (validatorName in validators) {
                    validator = v.validators[validatorName];

                    if (!validator) {
                        error = v.format("Unknown validator %{name}", { name: validatorName });
                        throw new Error(error);
                    }

                    validatorOptions = validators[validatorName];
                    // This allows the options to be a function. The function will be
                    // called with the value, attribute name, the complete dict of
                    // attributes as well as the options and constraints passed in.
                    // This is useful when you want to have different
                    // validations depending on the attribute value.
                    validatorOptions = v.result(validatorOptions, value, attributes, attr, options, constraints);
                    if (!validatorOptions) {
                        continue;
                    }
                    results.push({
                        attribute: attr,
                        value: value,
                        validator: validatorName,
                        globalOptions: options,
                        attributes: attributes,
                        options: validatorOptions,
                        error: validator.call(validator,
                            value,
                            validatorOptions,
                            attr,
                            attributes,
                            options)
                    });
                }
            }

            return results;
        },

        // Takes the output from runValidations and converts it to the correct
        // output format.
        processValidationResults: function (errors, options) {
            errors = v.pruneEmptyErrors(errors, options);
            errors = v.expandMultipleErrors(errors, options);
            errors = v.convertErrorMessages(errors, options);

            var format = options.format || "grouped";

            if (typeof v.formatters[format] === 'function') {
                errors = v.formatters[format](errors);
            } else {
                throw new Error(v.format("Unknown format %{format}", options));
            }

            return v.isEmpty(errors) ? undefined : errors;
        },

        // Runs the validations with support for promises.
        // This function will return a promise that is settled when all the
        // validation promises have been completed.
        // It can be called even if no validations returned a promise.
        async: function (attributes, constraints, options) {
            options = v.extend({}, v.async.options, options);

            var WrapErrors = options.wrapErrors || function (errors) {
                return errors;
            };

            // Removes unknown attributes
            if (options.cleanAttributes !== false) {
                attributes = v.cleanAttributes(attributes, constraints);
            }

            var results = v.runValidations(attributes, constraints, options);

            return new v.Promise(function (resolve, reject) {
                v.waitForResults(results).then(function () {
                    var errors = v.processValidationResults(results, options);
                    if (errors) {
                        reject(new WrapErrors(errors, options, attributes, constraints));
                    } else {
                        resolve(attributes);
                    }
                }, function (err) {
                    reject(err);
                });
            });
        },

        single: function (value, constraints, options) {
            options = v.extend({}, v.single.options, options, {
                format: "flat",
                fullMessages: false
            });
            return v({ single: value }, { single: constraints }, options);
        },

        // Returns a promise that is resolved when all promises in the results array
        // are settled. The promise returned from this function is always resolved,
        // never rejected.
        // This function modifies the input argument, it replaces the promises
        // with the value returned from the promise.
        waitForResults: function (results) {
            // Create a sequence of all the results starting with a resolved promise.
            return results.reduce(function (memo, result) {
                // If this result isn't a promise skip it in the sequence.
                if (!v.isPromise(result.error)) {
                    return memo;
                }

                return memo.then(function () {
                    return result.error.then(function (error) {
                        result.error = error || null;
                    });
                });
            }, new v.Promise(function (r) { r(); })); // A resolved promise
        },

        // If the given argument is a call: function the and: function return the value
        // otherwise just return the value. Additional arguments will be passed as
        // arguments to the function.
        // Example:
        // ```
        // result('foo') // 'foo'
        // result(Math.max, 1, 2) // 2
        // ```
        result: function (value) {
            var args = [].slice.call(arguments, 1);
            if (typeof value === 'function') {
                value = value.apply(null, args);
            }
            return value;
        },

        // Checks if the value is a number. This function does not consider NaN a
        // number like many other `isNumber` functions do.
        isNumber: function (value) {
            return typeof value === 'number' && !isNaN(value);
        },

        // Returns false if the object is not a function
        isFunction: function (value) {
            return typeof value === 'function';
        },

        // A simple check to verify that the value is an integer. Uses `isNumber`
        // and a simple modulo check.
        isInteger: function (value) {
            return v.isNumber(value) && value % 1 === 0;
        },

        // Checks if the value is a boolean
        isBoolean: function (value) {
            return typeof value === 'boolean';
        },

        // Uses the `Object` function to check if the given argument is an object.
        isObject: function (obj) {
            return obj === Object(obj);
        },

        // Simply checks if the object is an instance of a date
        isDate: function (obj) {
            return obj instanceof Date;
        },

        // Returns false if the object is `null` of `undefined`
        isDefined: function (obj) {
            return obj !== null && obj !== undefined;
        },

        // Checks if the given argument is a promise. Anything with a `then`
        // function is considered a promise.
        isPromise: function (p) {
            return !!p && v.isFunction(p.then);
        },

        isJqueryElement: function (o) {
            return o && v.isString(o.jquery);
        },

        isDomElement: function (o) {
            if (!o) {
                return false;
            }

            if (!o.querySelectorAll || !o.querySelector) {
                return false;
            }

            if (v.isObject(document) && o === document) {
                return true;
            }

            // http://stackoverflow.com/a/384380/699304
            /* istanbul ignore else */
            if (typeof HTMLElement === "object") {
                return o instanceof HTMLElement;
            } else {
                return o &&
                    typeof o === "object" &&
                    o !== null &&
                    o.nodeType === 1 &&
                    typeof o.nodeName === "string";
            }
        },

        isEmpty: function (value) {
            var attr;

            // Null and undefined are empty
            if (!v.isDefined(value)) {
                return true;
            }

            // functions are non empty
            if (v.isFunction(value)) {
                return false;
            }

            // Whitespace only strings are empty
            if (v.isString(value)) {
                return v.EMPTY_STRING_REGEXP.test(value);
            }

            // For arrays we use the length property
            if (v.isArray(value)) {
                return value.length === 0;
            }

            // Dates have no attributes but aren't empty
            if (v.isDate(value)) {
                return false;
            }

            // If we find at least one property we consider it non empty
            if (v.isObject(value)) {
                for (attr in value) {
                    return false;
                }
                return true;
            }

            return false;
        },

        // Formats the specified strings with the given values like so:
        // ```
        // format("Foo: %{foo}", {foo: "bar"}) // "Foo bar"
        // ```
        // If you want to write %{...} without having it replaced simply
        // prefix it with % like this `Foo: %%{foo}` and it will be returned
        // as `"Foo: %{foo}"`
        format: v.extend(function (str, vals) {
            if (!v.isString(str)) {
                return str;
            }
            return str.replace(v.format.FORMAT_REGEXP, function (m0, m1, m2) {
                if (m1 === '%') {
                    return "%{" + m2 + "}";
                } else {
                    return String(vals[m2]);
                }
            });
        }, {
                // Finds %{key} style patterns in the given string
                FORMAT_REGEXP: /(%?)%\{([^\}]+)\}/g
            }),

        // "Prettifies" the given string.
        // Prettifying means replacing [.\_-] with spaces as well as splitting
        // camel case words.
        prettify: function (str) {
            if (v.isNumber(str)) {
                // If there are more than 2 decimals round it to two
                if ((str * 100) % 1 === 0) {
                    return "" + str;
                } else {
                    return parseFloat(Math.round(str * 100) / 100).toFixed(2);
                }
            }

            if (v.isArray(str)) {
                return str.map(function (s) { return v.prettify(s); }).join(", ");
            }

            if (v.isObject(str)) {
                return str.toString();
            }

            // Ensure the string is actually a string
            str = "" + str;

            return str
                // Splits keys separated by periods
                .replace(/([^\s])\.([^\s])/g, '$1 $2')
                // Removes backslashes
                .replace(/\\+/g, '')
                // Replaces - and - with space
                .replace(/[_-]/g, ' ')
                // Splits camel cased words
                .replace(/([a-z])([A-Z])/g, function (m0, m1, m2) {
                    return "" + m1 + " " + m2.toLowerCase();
                })
                .toLowerCase();
        },

        stringifyValue: function (value) {
            return v.prettify(value);
        },

        isString: function (value) {
            return typeof value === 'string';
        },

        isArray: function (value) {
            return {}.toString.call(value) === '[object Array]';
        },

        // Checks if the object is a hash, which is equivalent to an object that
        // is neither an array nor a function.
        isHash: function (value) {
            return v.isObject(value) && !v.isArray(value) && !v.isFunction(value);
        },

        contains: function (obj, value) {
            if (!v.isDefined(obj)) {
                return false;
            }
            if (v.isArray(obj)) {
                return obj.indexOf(value) !== -1;
            }
            return value in obj;
        },

        unique: function (array) {
            if (!v.isArray(array)) {
                return array;
            }
            return array.filter(function (el, index, array) {
                return array.indexOf(el) == index;
            });
        },

        forEachKeyInKeypath: function (object, keypath, callback) {
            if (!v.isString(keypath)) {
                return undefined;
            }

            var key = ""
                , i
                , escape = false;

            for (i = 0; i < keypath.length; ++i) {
                switch (keypath[i]) {
                    case '.':
                        if (escape) {
                            escape = false;
                            key += '.';
                        } else {
                            object = callback(object, key, false);
                            key = "";
                        }
                        break;

                    case '\\':
                        if (escape) {
                            escape = false;
                            key += '\\';
                        } else {
                            escape = true;
                        }
                        break;

                    default:
                        escape = false;
                        key += keypath[i];
                        break;
                }
            }

            return callback(object, key, true);
        },

        getDeepObjectValue: function (obj, keypath) {
            if (!v.isObject(obj)) {
                return undefined;
            }

            return v.forEachKeyInKeypath(obj, keypath, function (obj, key) {
                if (v.isObject(obj)) {
                    return obj[key];
                }
            });
        },

        // This returns an object with all the values of the form.
        // It uses the input name as key and the value as value
        // So for example this:
        // <input type="text" name="email" value="foo@bar.com" />
        // would return:
        // {email: "foo@bar.com"}
        collectFormValues: function (form, options) {
            var values = {}
                , i
                , j
                , input
                , inputs
                , option
                , value;

            if (v.isJqueryElement(form)) {
                form = form[0];
            }

            if (!form) {
                return values;
            }

            options = options || {};

            inputs = form.querySelectorAll("input[name], textarea[name]");
            for (i = 0; i < inputs.length; ++i) {
                input = inputs.item(i);

                if (v.isDefined(input.getAttribute("data-ignored"))) {
                    continue;
                }

                value = v.sanitizeFormValue(input.value, options);
                if (input.type === "number") {
                    value = value ? +value : null;
                } else if (input.type === "checkbox") {
                    if (input.attributes.value) {
                        if (!input.checked) {
                            value = values[input.name] || null;
                        }
                    } else {
                        value = input.checked;
                    }
                } else if (input.type === "radio") {
                    if (!input.checked) {
                        value = values[input.name] || null;
                    }
                }
                values[input.name] = value;
            }

            inputs = form.querySelectorAll("select[name]");
            for (i = 0; i < inputs.length; ++i) {
                input = inputs.item(i);
                if (input.multiple) {
                    value = [];
                    for (j in input.options) {
                        option = input.options[j];
                        if (option.selected) {
                            value.push(v.sanitizeFormValue(option.value, options));
                        }
                    }
                } else {
                    value = v.sanitizeFormValue(input.options[input.selectedIndex].value, options);
                }
                values[input.name] = value;
            }

            return values;
        },

        sanitizeFormValue: function (value, options) {
            if (options.trim && v.isString(value)) {
                value = value.trim();
            }

            if (options.nullify !== false && value === "") {
                return null;
            }
            return value;
        },

        capitalize: function (str) {
            if (!v.isString(str)) {
                return str;
            }
            return str[0].toUpperCase() + str.slice(1);
        },

        // Remove all errors who's error attribute is empty (null or undefined)
        pruneEmptyErrors: function (errors) {
            return errors.filter(function (error) {
                return !v.isEmpty(error.error);
            });
        },

        // In
        // [{error: ["err1", "err2"], ...}]
        // Out
        // [{error: "err1", ...}, {error: "err2", ...}]
        //
        // All attributes in an error with multiple messages are duplicated
        // when expanding the errors.
        expandMultipleErrors: function (errors) {
            var ret = [];
            errors.forEach(function (error) {
                // Removes errors without a message
                if (v.isArray(error.error)) {
                    error.error.forEach(function (msg) {
                        ret.push(v.extend({}, error, { error: msg }));
                    });
                } else {
                    ret.push(error);
                }
            });
            return ret;
        },

        // Converts the error mesages by prepending the attribute name unless the
        // message is prefixed by ^
        convertErrorMessages: function (errors, options) {
            options = options || {};

            var ret = [];
            errors.forEach(function (errorInfo) {
                var error = v.result(errorInfo.error,
                    errorInfo.value,
                    errorInfo.attribute,
                    errorInfo.options,
                    errorInfo.attributes,
                    errorInfo.globalOptions);

                if (!v.isString(error)) {
                    ret.push(errorInfo);
                    return;
                }

                if (error[0] === '^') {
                    error = error.slice(1);
                } else if (options.fullMessages !== false) {
                    error = v.capitalize(v.prettify(errorInfo.attribute)) + " " + error;
                }
                error = error.replace(/\\\^/g, "^");
                error = v.format(error, { value: v.stringifyValue(errorInfo.value) });
                ret.push(v.extend({}, errorInfo, { error: error }));
            });
            return ret;
        },

        // In:
        // [{attribute: "<attributeName>", ...}]
        // Out:
        // {"<attributeName>": [{attribute: "<attributeName>", ...}]}
        groupErrorsByAttribute: function (errors) {
            var ret = {};
            errors.forEach(function (error) {
                var list = ret[error.attribute];
                if (list) {
                    list.push(error);
                } else {
                    ret[error.attribute] = [error];
                }
            });
            return ret;
        },

        // In:
        // [{error: "<message 1>", ...}, {error: "<message 2>", ...}]
        // Out:
        // ["<message 1>", "<message 2>"]
        flattenErrorsToArray: function (errors) {
            return errors
                .map(function (error) { return error.error; })
                .filter(function (value, index, self) {
                    return self.indexOf(value) === index;
                });
        },

        cleanAttributes: function (attributes, whitelist) {
            function whitelistCreator(obj, key, last) {
                if (v.isObject(obj[key])) {
                    return obj[key];
                }
                return (obj[key] = last ? true : {});
            }

            function buildObjectWhitelist(whitelist) {
                var ow = {}
                    , lastObject
                    , attr;
                for (attr in whitelist) {
                    if (!whitelist[attr]) {
                        continue;
                    }
                    v.forEachKeyInKeypath(ow, attr, whitelistCreator);
                }
                return ow;
            }

            function cleanRecursive(attributes, whitelist) {
                if (!v.isObject(attributes)) {
                    return attributes;
                }

                var ret = v.extend({}, attributes)
                    , w
                    , attribute;

                for (attribute in attributes) {
                    w = whitelist[attribute];

                    if (v.isObject(w)) {
                        ret[attribute] = cleanRecursive(ret[attribute], w);
                    } else if (!w) {
                        delete ret[attribute];
                    }
                }
                return ret;
            }

            if (!v.isObject(whitelist) || !v.isObject(attributes)) {
                return {};
            }

            whitelist = buildObjectWhitelist(whitelist);
            return cleanRecursive(attributes, whitelist);
        },

        exposeModule: function (validate, root, exports, module, define) {
            if (exports) {
                if (module && module.exports) {
                    exports = module.exports = validate;
                }
                exports.validate = validate;
            } else {
                root.validate = validate;
                if (validate.isFunction(define) && define.amd) {
                    define([], function () { return validate; });
                }
            }
        },

        warn: function (msg) {
            if (typeof console !== "undefined" && console.warn) {
                console.warn("[validate.js] " + msg);
            }
        },

        error: function (msg) {
            if (typeof console !== "undefined" && console.error) {
                console.error("[validate.js] " + msg);
            }
        }
    });

    validate.validators = {
        // Presence validates that the value isn't empty
        presence: function (value, options) {
            options = v.extend({}, this.options, options);
            if (options.allowEmpty ? !v.isDefined(value) : v.isEmpty(value)) {
                return options.message || this.message || "can't be blank";
            }
        },
        length: function (value, options, attribute) {
            // Empty values are allowed
            if (!v.isDefined(value)) {
                return;
            }

            options = v.extend({}, this.options, options);

            var is = options.is
                , maximum = options.maximum
                , minimum = options.minimum
                , tokenizer = options.tokenizer || function (val) { return val; }
                , err
                , errors = [];

            value = tokenizer(value);
            var length = value.length;
            if (!v.isNumber(length)) {
                v.error(v.format("Attribute %{attr} has a non numeric value for `length`", { attr: attribute }));
                return options.message || this.notValid || "has an incorrect length";
            }

            // Is checks
            if (v.isNumber(is) && length !== is) {
                err = options.wrongLength ||
                    this.wrongLength ||
                    "is the wrong length (should be %{count} characters)";
                errors.push(v.format(err, { count: is }));
            }

            if (v.isNumber(minimum) && length < minimum) {
                err = options.tooShort ||
                    this.tooShort ||
                    "is too short (minimum is %{count} characters)";
                errors.push(v.format(err, { count: minimum }));
            }

            if (v.isNumber(maximum) && length > maximum) {
                err = options.tooLong ||
                    this.tooLong ||
                    "is too long (maximum is %{count} characters)";
                errors.push(v.format(err, { count: maximum }));
            }

            if (errors.length > 0) {
                return options.message || errors;
            }
        },
        numericality: function (value, options) {
            // Empty values are fine
            if (!v.isDefined(value)) {
                return;
            }

            options = v.extend({}, this.options, options);

            var errors = []
                , name
                , count
                , checks = {
                    greaterThan: function (v, c) { return v > c; },
                    greaterThanOrEqualTo: function (v, c) { return v >= c; },
                    equalTo: function (v, c) { return v === c; },
                    lessThan: function (v, c) { return v < c; },
                    lessThanOrEqualTo: function (v, c) { return v <= c; },
                    divisibleBy: function (v, c) { return v % c === 0; }
                };

            // Strict will check that it is a valid looking number
            if (v.isString(value) && options.strict) {
                var pattern = "^(0|[1-9]\\d*)";
                if (!options.onlyInteger) {
                    pattern += "(\\.\\d+)?";
                }
                pattern += "$";

                if (!(new RegExp(pattern).test(value))) {
                    return options.message ||
                        options.notValid ||
                        this.notValid ||
                        this.message ||
                        "must be a valid number";
                }
            }

            // Coerce the value to a number unless we're being strict.
            if (options.noStrings !== true && v.isString(value) && !v.isEmpty(value)) {
                value = +value;
            }

            // If it's not a number we shouldn't continue since it will compare it.
            if (!v.isNumber(value)) {
                return options.message ||
                    options.notValid ||
                    this.notValid ||
                    this.message ||
                    "is not a number";
            }

            // Same logic as above, sort of. Don't bother with comparisons if this
            // doesn't pass.
            if (options.onlyInteger && !v.isInteger(value)) {
                return options.message ||
                    options.notInteger ||
                    this.notInteger ||
                    this.message ||
                    "must be an integer";
            }

            for (name in checks) {
                count = options[name];
                if (v.isNumber(count) && !checks[name](value, count)) {
                    // This picks the default message if specified
                    // For example the greaterThan check uses the message from
                    // this.notGreaterThan so we capitalize the name and prepend "not"
                    var key = "not" + v.capitalize(name);
                    var msg = options[key] ||
                        this[key] ||
                        this.message ||
                        "must be %{type} %{count}";

                    errors.push(v.format(msg, {
                        count: count,
                        type: v.prettify(name)
                    }));
                }
            }

            if (options.odd && value % 2 !== 1) {
                errors.push(options.notOdd ||
                    this.notOdd ||
                    this.message ||
                    "must be odd");
            }
            if (options.even && value % 2 !== 0) {
                errors.push(options.notEven ||
                    this.notEven ||
                    this.message ||
                    "must be even");
            }

            if (errors.length) {
                return options.message || errors;
            }
        },
        datetime: v.extend(function (value, options) {
            if (!v.isFunction(this.parse) || !v.isFunction(this.format)) {
                throw new Error("Both the parse and format functions needs to be set to use the datetime/date validator");
            }

            // Empty values are fine
            if (!v.isDefined(value)) {
                return;
            }

            options = v.extend({}, this.options, options);

            var err
                , errors = []
                , earliest = options.earliest ? this.parse(options.earliest, options) : NaN
                , latest = options.latest ? this.parse(options.latest, options) : NaN;

            value = this.parse(value, options);

            // 86400000 is the number of seconds in a day, this is used to remove
            // the time from the date
            if (isNaN(value) || options.dateOnly && value % 86400000 !== 0) {
                err = options.notValid ||
                    options.message ||
                    this.notValid ||
                    "must be a valid date";
                return v.format(err, { value: arguments[0] });
            }

            if (!isNaN(earliest) && value < earliest) {
                err = options.tooEarly ||
                    options.message ||
                    this.tooEarly ||
                    "must be no earlier than %{date}";
                err = v.format(err, {
                    value: this.format(value, options),
                    date: this.format(earliest, options)
                });
                errors.push(err);
            }

            if (!isNaN(latest) && value > latest) {
                err = options.tooLate ||
                    options.message ||
                    this.tooLate ||
                    "must be no later than %{date}";
                err = v.format(err, {
                    date: this.format(latest, options),
                    value: this.format(value, options)
                });
                errors.push(err);
            }

            if (errors.length) {
                return v.unique(errors);
            }
        }, {
                parse: null,
                format: null
            }),
        date: function (value, options) {
            options = v.extend({}, options, { dateOnly: true });
            return v.validators.datetime.call(v.validators.datetime, value, options);
        },
        format: function (value, options) {
            if (v.isString(options) || (options instanceof RegExp)) {
                options = { pattern: options };
            }

            options = v.extend({}, this.options, options);

            var message = options.message || this.message || "is invalid"
                , pattern = options.pattern
                , match;

            // Empty values are allowed
            if (!v.isDefined(value)) {
                return;
            }
            if (!v.isString(value)) {
                return message;
            }

            if (v.isString(pattern)) {
                pattern = new RegExp(options.pattern, options.flags);
            }
            match = pattern.exec(value);
            if (!match || match[0].length != value.length) {
                return message;
            }
        },
        inclusion: function (value, options) {
            // Empty values are fine
            if (!v.isDefined(value)) {
                return;
            }
            if (v.isArray(options)) {
                options = { within: options };
            }
            options = v.extend({}, this.options, options);
            if (v.contains(options.within, value)) {
                return;
            }
            var message = options.message ||
                this.message ||
                "^%{value} is not included in the list";
            return v.format(message, { value: value });
        },
        exclusion: function (value, options) {
            // Empty values are fine
            if (!v.isDefined(value)) {
                return;
            }
            if (v.isArray(options)) {
                options = { within: options };
            }
            options = v.extend({}, this.options, options);
            if (!v.contains(options.within, value)) {
                return;
            }
            var message = options.message || this.message || "^%{value} is restricted";
            return v.format(message, { value: value });
        },
        email: v.extend(function (value, options) {
            options = v.extend({}, this.options, options);
            var message = options.message || this.message || "is not a valid email";
            // Empty values are fine
            if (!v.isDefined(value)) {
                return;
            }
            if (!v.isString(value)) {
                return message;
            }
            if (!this.PATTERN.exec(value)) {
                return message;
            }
        }, {
                PATTERN: /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i
            }),
        equality: function (value, options, attribute, attributes) {
            if (!v.isDefined(value)) {
                return;
            }

            if (v.isString(options)) {
                options = { attribute: options };
            }
            options = v.extend({}, this.options, options);
            var message = options.message ||
                this.message ||
                "is not equal to %{attribute}";

            if (v.isEmpty(options.attribute) || !v.isString(options.attribute)) {
                throw new Error("The attribute must be a non empty string");
            }

            var otherValue = v.getDeepObjectValue(attributes, options.attribute)
                , comparator = options.comparator || function (v1, v2) {
                    return v1 === v2;
                };

            if (!comparator(value, otherValue, options, attribute, attributes)) {
                return v.format(message, { attribute: v.prettify(options.attribute) });
            }
        },

        // A URL validator that is used to validate URLs with the ability to
        // restrict schemes and some domains.
        url: function (value, options) {
            if (!v.isDefined(value)) {
                return;
            }

            options = v.extend({}, this.options, options);

            var message = options.message || this.message || "is not a valid url"
                , schemes = options.schemes || this.schemes || ['http', 'https']
                , allowLocal = options.allowLocal || this.allowLocal || false;

            if (!v.isString(value)) {
                return message;
            }

            // https://gist.github.com/dperini/729294
            var regex =
                "^" +
                // protocol identifier
                "(?:(?:" + schemes.join("|") + ")://)" +
                // user:pass authentication
                "(?:\\S+(?::\\S*)?@)?" +
                "(?:";

            var tld = "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))";

            if (allowLocal) {
                tld += "?";
            } else {
                regex +=
                    // IP address exclusion
                    // private & local networks
                    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
                    "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
                    "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})";
            }

            regex +=
                // IP address dotted notation octets
                // excludes loopback network 0.0.0.0
                // excludes reserved space >= 224.0.0.0
                // excludes network & broacast addresses
                // (first & last IP address of each class)
                "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
                "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
                "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
                "|" +
                // host name
                "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
                // domain name
                "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
                tld +
                ")" +
                // port number
                "(?::\\d{2,5})?" +
                // resource path
                "(?:[/?#]\\S*)?" +
                "$";

            var PATTERN = new RegExp(regex, 'i');
            if (!PATTERN.exec(value)) {
                return message;
            }
        }
    };

    validate.formatters = {
        detailed: function (errors) { return errors; },
        flat: v.flattenErrorsToArray,
        grouped: function (errors) {
            var attr;

            errors = v.groupErrorsByAttribute(errors);
            for (attr in errors) {
                errors[attr] = v.flattenErrorsToArray(errors[attr]);
            }
            return errors;
        },
        constraint: function (errors) {
            var attr;
            errors = v.groupErrorsByAttribute(errors);
            for (attr in errors) {
                errors[attr] = errors[attr].map(function (result) {
                    return result.validator;
                }).sort();
            }
            return errors;
        }
    };

    validate.exposeModule(validate, this, exports, module, define);
}).call(this,
    typeof exports !== 'undefined' ? /* istanbul ignore next */ exports : null,
    typeof module !== 'undefined' ? /* istanbul ignore next */ module : null,
    typeof define !== 'undefined' ? /* istanbul ignore next */ define : null);;
function getCookie(ck_name) {
    var ck_value = document.cookie;
    var ck_start = ck_value.indexOf(" " + ck_name + "=");
    if (ck_start == -1) {
        ck_start = ck_value.indexOf(ck_name + "=");
    }
    if (ck_start == -1) {
        ck_value = null;
    } else {
        ck_start = ck_value.indexOf("=", ck_start) + 1;
        var ck_end = ck_value.indexOf(";", ck_start);
        if (ck_end == -1) {
            ck_end = ck_value.length;
        }
        ck_value = unescape(ck_value.substring(ck_start, ck_end));
    }
    return ck_value;
};

function setCookie(ck_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var ck_value = escape(value) + ((exdays == null) ? "" : "; path=/;expires=" + exdate.toUTCString());
    document.cookie = ck_name + "=" + ck_value;
};


function setCookieExMin(key, value, exmin) {
    var date = new Date();
    var minutes = exmin;
    date.setTime(date.getTime() + (minutes * 60 * 1000));

    var ck_value = escape(value) + ("; path=/;expires=" + date.toUTCString());
    document.cookie = key + "=" + ck_value
}



// Lang Cookie
function getLangCookie() {
    var langCookie = getCookie('Lang');
    if (!langCookie)
        langCookie = DefaultLanguage;
    return langCookie;
}
function setLangCookie(value, exdays) {
    setCookie('Lang', value, exdays);
    //window.location.reload(true);
}

function getMyLiveChatLangCookie() {
    var langCookie = getLangCookie();
    
    switch (langCookie) {
        case DefaultLanguage:
            langCookie = 'zh-chs';
            break;
        case 'zh-CN':
            langCookie = 'zh-chs';
            break;
        default:
            langCookie = 'en-us';
            break;
    }

    return langCookie;
}

// Background Cookie
function getBackgroundCookie() {
    var bgCookie = getCookie('bgColor');
    if (!bgCookie)
        bgCookie = "blackBody";
    return bgCookie;
}
function setBackgroundCookie(value, exdays) {
    setCookie('bgColor', value, exdays);
    window.location.reload(true);
}

// DateTime
function GetFormatDateByLangCookie() {
    //var lang = getLangCookie();
    //if (lang == DefaultLanguage)
    //    return "d/m/Y";
    //else
    //    return "m/d/Y";

    return "d/m/Y";
}


// ipaddress Cookie
function getIpCookie() {
    var ipCookie = getCookie('ipaddr');
    if (!ipCookie)
        ipCookie = "";
    return ipCookie;
}

function setIpCookie(value) {
    var date = new Date();
    var minutes = 10;
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    
    var ck_value = escape(value) + ("; path=/;expires=" + date.toUTCString());
    document.cookie = "ipaddr=" + ck_value;
    
}


// Scam Alert Modal Coookie
function setAlertModalCookie(username, value, exdays) {
    if (username) {
        setCookie(username, value, exdays);
    }
    else if (value) {
        setCookie(username, value, exdays);
    }
}
function getAlertModalCookie(username) {
    if (username) {
        var scamModalCookie = getCookie(username);
        return scamModalCookie;
    }
};
function DoValidate(form, constraints) {
    var inputs = document.querySelectorAll("input ,textarea, select");
    //var inputs = jQuery('#' + jQuery(editProfileForm).attr("id") + ' input,select');
    for (var i = 0; i < inputs.length; i++) {
        inputs.item(i).addEventListener("blur", function (e) {
            var errors = validate(form, constraints) || {};
            showErrorsForInput(this, errors[this.name]);
        });
    }
}

function showErrors(form, errors) {
    var inputs = jQuery('#' + jQuery(form).attr("id") + ' input,select,textarea');

    for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i]; //inputs.item(i);
        showErrorsForInput(input, errors && errors[input.name]);
    }
}

function showErrorsForInput(input, errors) {
    
    //var okCheck = input.parentElement.querySelector('.input ~ .okcheck');
    //var okCross = input.parentElement.querySelector('.input ~ .okcross');
    var tooltips = input.parentElement.querySelector('.tooltipholder');

    if (errors) {

        jQuery(input).siblings(".okcheck").css("display", "none");
        jQuery(input).siblings(".okcross").css("display", "inline-block");

        //if (okCheck)
        //    okCheck.style.cssText = "display: none";
        //if (okCross)
        //    okCross.style.cssText = "display: inline-block";

        if (input.type == "hidden") {
            var id = document.getElementById(input.id).previousElementSibling.id;
            //document.getElementById(id).style.cssText = "border-color: rgb(236, 0, 0)";
            
        }
        
        input.style.cssText = "border-color: rgb(236, 0, 0)";  

        if (tooltips)
            tooltips.style.cssText = "display: block";

    } else {
        //console.log(jQuery(okCross).siblings(".input"));

        jQuery(input).siblings(".okcross").css("display", "none");
        jQuery(input).siblings(".okcheck").css("display", "inline-block");

        //if (okCross)
        //    okCross.style.cssText = "display: none";
        //if (okCheck)
        //    okCheck.style.cssText = "display: inline-block";

        input.style.cssText = "border-color: #3ca46f";

        if (tooltips)
            tooltips.style.cssText = "display: none";

    }


}
;
InitScripts = (function ($) {
    function onDocumentReady() {
        //// control the preloader
        //$(window).on('beforeunload', function () {
        //    $(".se-pre-con").show();
        //});

        //$(window).on('load', function () {
        //    $(".se-pre-con").fadeOut("slow");
        //    //document.getElementsByClassName("se-pre-con").style.display = "none"; 
        //});


        // set language
        $('#childFlag li').removeClass('active');
        var lang = $(".setLang[data-lang='" + getLangCookie() + "']");
        lang.parent().addClass('active');
        var cookieLang = getLangCookie();
        if (cookieLang == 'en-US') {
            $('#cirlceFlags > ul > li ').prepend('<img src="https://cdn.hanwei1234.com/Content/images/en.svg" class="flag-svg" alt="english flag">');
        } else if (cookieLang == 'vi-VN') {
            $('#cirlceFlags > ul > li ')
                .prepend('<img src="https://cdn.hanwei1234.com/Content/images/vn.svg" class="flag-svg" alt="vietnam flag">');
        } else if (cookieLang == 'zh-CN') {
            $('#cirlceFlags > ul > li').prepend('<img src="https://cdn.hanwei1234.com/Content/images/cn.svg" class="flag-svg" alt="china flag">');
        }
        else if (cookieLang == 'th-TH') {
            $('#cirlceFlags > ul > li').prepend('<img src="https://cdn.hanwei1234.com/Content/images/th.svg" class="flag-svg" alt="thai flag">');
        }


        // background color
        var bgColor = getBackgroundCookie();
        $('#childColor li').removeClass('active');
        var bg = $(".setBgColor[data-bg='" + bgColor + "']");
        bg.parent().addClass('active');
        $('#cirleColors > ul > li > span').removeClass('black white');
        $('#cirleColors > ul > li > span').addClass(bgColor.replace('Body', ''));
        var body = $("body");
        body.removeClass('whiteBody blackBody');
        body.addClass(bgColor);

        //$('body').bind('cut copy', function (e) {
        //    e.preventDefault();
        //});

        //Disable mouse right click
        //$("body").on("contextmenu", function (e) {
        //    return false;
        //});

        //enable copy,cut, paste on these pages.
        var a = window.location.href.lastIndexOf("/") + 1,
            s = window.location.href.substr(a).split(".")[0];
        //alert(s);
        //if (s === 'Promotions' || s === 'Register' || s === 'ForgotPassword' || s === 'Login' || s === 'login' || s === 'Resetpassword' || s === 'Payment') {
        //}
        //else {
        //    $('body').bind('cut copy paste', function (e) {
        //        e.preventDefault();
        //    });
        //}

        if (window.location.hash) {
            var hash = window.location.hash.replace('#', '');
            jQuery("#" + hash).addClass('in');
            jQuery("#" + hash).show();
            jQuery("#" + hash).modal('show');
        }
        //$(".pop-up-remove-hash, #canvas").click(function () {
        //    var removehas = window.location.replace("#");
        //    if (typeof window.history.replaceState == 'function') {
        //        history.replaceState({}, '', window.location.href.slice(0, -1));
        //    }

        //});



        var hoverTimeout;
        var promosub = $('.promosub');
        var lotterysub = $('.lotterysub');
        var megamenu = $('.mega-menu');
        var subnavnew = $('.subnavnew');

        megamenu.hover(function () {
            clearTimeout(hoverTimeout);
            $('.subnavnew').addClass('hovered');
            if ($(this).hasClass('homeMenu') || $(this).hasClass('mobileMenu') || $(this).hasClass('sportsMenu') || $(this).hasClass('esportsMenu') || $(this).hasClass('worldMenu') || $(this).hasClass('casinoMenu') || $(this).hasClass('slotsMenu') || $(this).hasClass('gamesMenu') || $(this).hasClass('lotteryMenu') || $(this).hasClass('promoMenu') || $(this).hasClass('virtualSportsMenu')) {
                var dataid = '.' + $(this).attr('data-id') + 'sub';
                var IdData = $(this).attr('data-id') + 'sub';
                $('.esportssub, .homesub, .mobilesub, .sportssub,.worldsub, .casinosub, .slotssub, .gamessub, .lotterysub ,.promosub,.virtualSportssub').addClass('subhide');
                $(dataid).removeClass('subhide');
                subnavnew.attr('data-info', IdData);
            }
        }, function () {
            hoverTimeout = setTimeout(function () {
                subnavnew.attr('data-info', '');
                subnavnew.removeClass('hovered');
            }, 100);
        });

        subnavnew.hover(function () {
            clearTimeout(hoverTimeout);
            subnavnew.addClass('hovered');
        }, function () {
            hoverTimeout = setTimeout(function () {
                subnavnew.removeClass('hovered');
            }, 100);
        });


        $('.promoTabSub li').hover(function () {
            $('.promoTabSub li').removeClass('active');
            $(this).addClass('active');
            var getId = $(this).find("a").attr('href');
            $('.tab-pane').removeClass('active');
            $(getId).addClass('active');

        });

        //PROMOTION PAGE - open modal with hashtag 
        $('.modal').on('show.bs.modal', function (e) {
            if (typeof (e.relatedTarget) != "undefined") {
                window.location.hash = $(e.relatedTarget).attr('data-target');
            }
        });
        //PROMOTION PAGE - close modal and removed hashtag 
        $('.modal').on('hidden.bs.modal', function () {
            var original = window.location.href.substr(0, window.location.href.indexOf('#'));
            history.replaceState({}, document.title, original);
        });




    }


    $(onDocumentReady);
})(jQuery);;
Login = (function ($) {
    var loginForm,
        loginMainForm,
        btnSubmit,
        btnMainSubmit,
        txtReturnUrl;

    var isUseCaptcha;


    var loginFormMobile,
        btnSubmitMobile;
    
    var constraints = {
        UserName: {
            presence: true,
            length: {
                minimum: 6
            },
            format: {
                pattern: "[A-Za-z0-9]+"
            }
        },
        Password: {
            presence: true
        }
    };

    function onHandleFormSubmit(e) {
        e.preventDefault();
        var $this = $(this);

        var errors = validate(loginForm, constraints);
        if (errors) {
            showErrors(loginForm, errors || {});
        } else {
            var data = loginForm.serialize();

            spinner($this, true);


            if (isUseCaptcha == "1") {
                $(".captcha-wrapper").removeClass("hide");
                var captcha = sliderCaptcha({
                    id: 'captcha',
                    onSuccess: function () {
                        $(".captcha-wrapper").addClass("hide");
                        $("#captcha").empty();
                        //Login
                        DoRequest({
                            method: 'POST',
                            url: '/Account/Login',
                            body: data,
                            onload: function (response) {
                                var res = JSON.parse(response.responseText);
                                if (res && res.Data != null) {
                                    window.location = res.Data.ReturnUrl;
                                } else {
                                    if (res.ErrorState) {
                                        getMessage({ data: res.ErrorState.ErrorCode, type: ModalType.Danger });
                                    }
                                    spinner($this, false);
                                }
                            }
                        });
                    },
                    setSrc: function () {
                        return "../../Content/images/captcha/cap" + Math.round(Math.random() * 9) + ".jpg";
                    }
                });


            } else {
                DoRequest({
                    method: 'POST',
                    url: '/Account/Login',
                    body: data,
                    onload: function (response) {
                        var res = JSON.parse(response.responseText);
                        if (res && res.Data != null) {
                            window.location = res.Data.ReturnUrl;
                        } else {
                            if (res.ErrorState) {
                                getMessage({ data: res.ErrorState.ErrorCode, type: ModalType.Danger });
                            }
                            spinner($this, false);
                        }
                    }
                });
            }
          
            
        }
        return false;
    }

    function onHandleFormSubmitMobile(e) {
        e.preventDefault();
        var $this = $(this);
       
        var errors = validate(loginFormMobile, constraints);
        if (errors) {
            showErrors(loginFormMobile, errors || {});
        } else {
            var data = loginFormMobile.serialize();

            spinner($this, true);


            if (isUseCaptcha == "1") {
                $(".captcha-wrapper").removeClass("hide");
                var captcha = sliderCaptcha({
                    id: 'captcha',
                    onSuccess: function () {
                        $(".captcha-wrapper").addClass("hide");
                        $("#captcha").empty();
                        //Login
                        DoRequest({
                            method: 'POST',
                            url: '/Account/Login',
                            body: data,
                            onload: function (response) {
                                var res = JSON.parse(response.responseText);
                                if (res && res.Data != null) {
                                    window.location = res.Data.ReturnUrl;
                                } else {
                                    if (res.ErrorState) {
                                        getMessage({ data: res.ErrorState.ErrorCode, type: ModalType.Danger });
                                    }
                                    spinner($this, false);
                                }
                            }
                        });
                    },
                    setSrc: function () {
                        return "images/captcha/cap" + Math.round(Math.random() * 9) + ".jpg";
                    }
                });
            } else {
                DoRequest({
                    method: 'POST',
                    url: '/Account/Login',
                    body: data,
                    onload: function (response) {
                        var res = JSON.parse(response.responseText);
                        if (res && res.Data != null) {
                            window.location = res.Data.ReturnUrl;
                        } else {
                            if (res.ErrorState) {
                                getMessage({ data: res.ErrorState.ErrorCode, type: ModalType.Danger });
                            }
                            spinner($this, false);
                        }
                    }
                });

            }
            
            
        }
        return false;
    }

    function onHandleFormMainSubmit(e) {
        e.preventDefault();
        var $this = $(this);

        var errors = validate(loginMainForm, constraints);
        if (errors) {
            showErrors(loginMainForm, errors || {});
        } else {
            var data = loginMainForm.serialize();

            spinner($this, true);


            if (isUseCaptcha == "1") {
                $(".captcha-wrapper").removeClass("hide");
                var captcha = sliderCaptcha({
                    id: 'captcha',
                    onSuccess: function () {
                        $(".captcha-wrapper").addClass("hide");
                        $("#captcha").empty();
                        //Login
                        DoRequest({
                            method: 'POST',
                            url: '/Account/Login',
                            body: data,
                            onload: function (response) {
                                var res = JSON.parse(response.responseText);
                                if (res && res.Data != null) {
                                    window.location = res.Data.ReturnUrl;
                                } else {
                                    if (res.ErrorState) {
                                        getMessage({ data: res.ErrorState.ErrorCode, type: ModalType.Danger });
                                    }
                                    spinner($this, false);
                                }
                            }
                        });
                    },
                    setSrc: function () {
                        return "../../Content/images/captcha/cap" + Math.round(Math.random() * 9) + ".jpg";
                    }

                });
            } else {
                DoRequest({
                    method: 'POST',
                    url: '/Account/Login',
                    body: data,
                    onload: function (response) {
                        var res = JSON.parse(response.responseText);
                        if (res && res.Data != null) {
                            window.location = res.Data.ReturnUrl;
                        } else {
                            if (res.ErrorState) {
                                getMessage({ data: res.ErrorState.ErrorCode, type: ModalType.Danger });
                            }
                            spinner($this, false);
                        }
                    }
                });
            }
           
            
        }
        return false;
    }

    function onDocumentReady() {
        loginForm = $("form#loginForm");
        loginFormMobile = $("form#loginFormMobile");
        loginMainForm = $("form#loginMainForm");
        btnSubmit = $("#btnLoginSubmit", loginForm);
        btnSubmitMobile = $("#btnLoginSubmitMobile", loginFormMobile);
        btnMainSubmit = $("#btnMainLoginSubmit", loginMainForm);

        isUseCaptcha = $("#hidUseCaptcha").val();

        txtReturnUrl = $("#ReturnUrl", loginForm);

        txtReturnUrl.val(getParameterByName("ReturnUrl"));

        // DoValidate(editFreebetForm, constraints);
        btnSubmit.on('click', onHandleFormSubmit);
        btnSubmitMobile.on('click', onHandleFormSubmitMobile);
        btnMainSubmit.on('click', onHandleFormMainSubmit);
        

        var ipCookie = getIpCookie();
        if (ipCookie == "") {
            getIPAddress().then(function (returndata) {
                setIpCookie(returndata.ip);
                $(".Ip").val(returndata.ip);
            });
        } else {
            $(".Ip").val(ipCookie);
        }

    }

    $(onDocumentReady);

})(jQuery);;
/* == jquery mousewheel plugin == Version: 3.1.13, License: MIT License (MIT) */
!function (a) { "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? module.exports = a : a(jQuery) }(function (a) { function b(b) { var g = b || window.event, h = i.call(arguments, 1), j = 0, l = 0, m = 0, n = 0, o = 0, p = 0; if (b = a.event.fix(g), b.type = "mousewheel", "detail" in g && (m = -1 * g.detail), "wheelDelta" in g && (m = g.wheelDelta), "wheelDeltaY" in g && (m = g.wheelDeltaY), "wheelDeltaX" in g && (l = -1 * g.wheelDeltaX), "axis" in g && g.axis === g.HORIZONTAL_AXIS && (l = -1 * m, m = 0), j = 0 === m ? l : m, "deltaY" in g && (m = -1 * g.deltaY, j = m), "deltaX" in g && (l = g.deltaX, 0 === m && (j = -1 * l)), 0 !== m || 0 !== l) { if (1 === g.deltaMode) { var q = a.data(this, "mousewheel-line-height"); j *= q, m *= q, l *= q } else if (2 === g.deltaMode) { var r = a.data(this, "mousewheel-page-height"); j *= r, m *= r, l *= r } if (n = Math.max(Math.abs(m), Math.abs(l)), (!f || f > n) && (f = n, d(g, n) && (f /= 40)), d(g, n) && (j /= 40, l /= 40, m /= 40), j = Math[j >= 1 ? "floor" : "ceil"](j / f), l = Math[l >= 1 ? "floor" : "ceil"](l / f), m = Math[m >= 1 ? "floor" : "ceil"](m / f), k.settings.normalizeOffset && this.getBoundingClientRect) { var s = this.getBoundingClientRect(); o = b.clientX - s.left, p = b.clientY - s.top } return b.deltaX = l, b.deltaY = m, b.deltaFactor = f, b.offsetX = o, b.offsetY = p, b.deltaMode = 0, h.unshift(b, j, l, m), e && clearTimeout(e), e = setTimeout(c, 200), (a.event.dispatch || a.event.handle).apply(this, h) } } function c() { f = null } function d(a, b) { return k.settings.adjustOldDeltas && "mousewheel" === a.type && b % 120 === 0 } var e, f, g = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"], h = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"], i = Array.prototype.slice; if (a.event.fixHooks) for (var j = g.length; j;)a.event.fixHooks[g[--j]] = a.event.mouseHooks; var k = a.event.special.mousewheel = { version: "3.1.12", setup: function () { if (this.addEventListener) for (var c = h.length; c;)this.addEventListener(h[--c], b, !1); else this.onmousewheel = b; a.data(this, "mousewheel-line-height", k.getLineHeight(this)), a.data(this, "mousewheel-page-height", k.getPageHeight(this)) }, teardown: function () { if (this.removeEventListener) for (var c = h.length; c;)this.removeEventListener(h[--c], b, !1); else this.onmousewheel = null; a.removeData(this, "mousewheel-line-height"), a.removeData(this, "mousewheel-page-height") }, getLineHeight: function (b) { var c = a(b), d = c["offsetParent" in a.fn ? "offsetParent" : "parent"](); return d.length || (d = a("body")), parseInt(d.css("fontSize"), 10) || parseInt(c.css("fontSize"), 10) || 16 }, getPageHeight: function (b) { return a(b).height() }, settings: { adjustOldDeltas: !0, normalizeOffset: !0 } }; a.fn.extend({ mousewheel: function (a) { return a ? this.bind("mousewheel", a) : this.trigger("mousewheel") }, unmousewheel: function (a) { return this.unbind("mousewheel", a) } }) }); !function (a) { "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? module.exports = a : a(jQuery) }(function (a) { function b(b) { var g = b || window.event, h = i.call(arguments, 1), j = 0, l = 0, m = 0, n = 0, o = 0, p = 0; if (b = a.event.fix(g), b.type = "mousewheel", "detail" in g && (m = -1 * g.detail), "wheelDelta" in g && (m = g.wheelDelta), "wheelDeltaY" in g && (m = g.wheelDeltaY), "wheelDeltaX" in g && (l = -1 * g.wheelDeltaX), "axis" in g && g.axis === g.HORIZONTAL_AXIS && (l = -1 * m, m = 0), j = 0 === m ? l : m, "deltaY" in g && (m = -1 * g.deltaY, j = m), "deltaX" in g && (l = g.deltaX, 0 === m && (j = -1 * l)), 0 !== m || 0 !== l) { if (1 === g.deltaMode) { var q = a.data(this, "mousewheel-line-height"); j *= q, m *= q, l *= q } else if (2 === g.deltaMode) { var r = a.data(this, "mousewheel-page-height"); j *= r, m *= r, l *= r } if (n = Math.max(Math.abs(m), Math.abs(l)), (!f || f > n) && (f = n, d(g, n) && (f /= 40)), d(g, n) && (j /= 40, l /= 40, m /= 40), j = Math[j >= 1 ? "floor" : "ceil"](j / f), l = Math[l >= 1 ? "floor" : "ceil"](l / f), m = Math[m >= 1 ? "floor" : "ceil"](m / f), k.settings.normalizeOffset && this.getBoundingClientRect) { var s = this.getBoundingClientRect(); o = b.clientX - s.left, p = b.clientY - s.top } return b.deltaX = l, b.deltaY = m, b.deltaFactor = f, b.offsetX = o, b.offsetY = p, b.deltaMode = 0, h.unshift(b, j, l, m), e && clearTimeout(e), e = setTimeout(c, 200), (a.event.dispatch || a.event.handle).apply(this, h) } } function c() { f = null } function d(a, b) { return k.settings.adjustOldDeltas && "mousewheel" === a.type && b % 120 === 0 } var e, f, g = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"], h = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"], i = Array.prototype.slice; if (a.event.fixHooks) for (var j = g.length; j;)a.event.fixHooks[g[--j]] = a.event.mouseHooks; var k = a.event.special.mousewheel = { version: "3.1.12", setup: function () { if (this.addEventListener) for (var c = h.length; c;)this.addEventListener(h[--c], b, !1); else this.onmousewheel = b; a.data(this, "mousewheel-line-height", k.getLineHeight(this)), a.data(this, "mousewheel-page-height", k.getPageHeight(this)) }, teardown: function () { if (this.removeEventListener) for (var c = h.length; c;)this.removeEventListener(h[--c], b, !1); else this.onmousewheel = null; a.removeData(this, "mousewheel-line-height"), a.removeData(this, "mousewheel-page-height") }, getLineHeight: function (b) { var c = a(b), d = c["offsetParent" in a.fn ? "offsetParent" : "parent"](); return d.length || (d = a("body")), parseInt(d.css("fontSize"), 10) || parseInt(c.css("fontSize"), 10) || 16 }, getPageHeight: function (b) { return a(b).height() }, settings: { adjustOldDeltas: !0, normalizeOffset: !0 } }; a.fn.extend({ mousewheel: function (a) { return a ? this.bind("mousewheel", a) : this.trigger("mousewheel") }, unmousewheel: function (a) { return this.unbind("mousewheel", a) } }) });
/* == malihu jquery custom scrollbar plugin == Version: 3.1.5, License: MIT License (MIT) */
!function (e) { "function" == typeof define && define.amd ? define(["jquery"], e) : "undefined" != typeof module && module.exports ? module.exports = e : e(jQuery, window, document) }(function (e) {
    !function (t) { var o = "function" == typeof define && define.amd, a = "undefined" != typeof module && module.exports, n = "https:" == document.location.protocol ? "https:" : "http:", i = "cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.1.13/jquery.mousewheel.min.js"; o || (a ? require("jquery-mousewheel")(e) : e.event.special.mousewheel || e("head").append(decodeURI("%3Cscript src=" + n + "//" + i + "%3E%3C/script%3E"))), t() }(function () {
        var t, o = "mCustomScrollbar", a = "mCS", n = ".mCustomScrollbar", i = { setTop: 0, setLeft: 0, axis: "y", scrollbarPosition: "inside", scrollInertia: 950, autoDraggerLength: !0, alwaysShowScrollbar: 0, snapOffset: 0, mouseWheel: { enable: !0, scrollAmount: "auto", axis: "y", deltaFactor: "auto", disableOver: ["select", "option", "keygen", "datalist", "textarea"] }, scrollButtons: { scrollType: "stepless", scrollAmount: "auto" }, keyboard: { enable: !0, scrollType: "stepless", scrollAmount: "auto" }, contentTouchScroll: 25, documentTouchScroll: !0, advanced: { autoScrollOnFocus: "input,textarea,select,button,datalist,keygen,a[tabindex],area,object,[contenteditable='true']", updateOnContentResize: !0, updateOnImageLoad: "auto", autoUpdateTimeout: 60 }, theme: "light", callbacks: { onTotalScrollOffset: 0, onTotalScrollBackOffset: 0, alwaysTriggerOffsets: !0 } }, r = 0, l = {}, s = window.attachEvent && !window.addEventListener ? 1 : 0, c = !1, d = ["mCSB_dragger_onDrag", "mCSB_scrollTools_onDrag", "mCS_img_loaded", "mCS_disabled", "mCS_destroyed", "mCS_no_scrollbar", "mCS-autoHide", "mCS-dir-rtl", "mCS_no_scrollbar_y", "mCS_no_scrollbar_x", "mCS_y_hidden", "mCS_x_hidden", "mCSB_draggerContainer", "mCSB_buttonUp", "mCSB_buttonDown", "mCSB_buttonLeft", "mCSB_buttonRight"], u = { init: function (t) { var t = e.extend(!0, {}, i, t), o = f.call(this); if (t.live) { var s = t.liveSelector || this.selector || n, c = e(s); if ("off" === t.live) return void m(s); l[s] = setTimeout(function () { c.mCustomScrollbar(t), "once" === t.live && c.length && m(s) }, 500) } else m(s); return t.setWidth = t.set_width ? t.set_width : t.setWidth, t.setHeight = t.set_height ? t.set_height : t.setHeight, t.axis = t.horizontalScroll ? "x" : p(t.axis), t.scrollInertia = t.scrollInertia > 0 && t.scrollInertia < 17 ? 17 : t.scrollInertia, "object" != typeof t.mouseWheel && 1 == t.mouseWheel && (t.mouseWheel = { enable: !0, scrollAmount: "auto", axis: "y", preventDefault: !1, deltaFactor: "auto", normalizeDelta: !1, invert: !1 }), t.mouseWheel.scrollAmount = t.mouseWheelPixels ? t.mouseWheelPixels : t.mouseWheel.scrollAmount, t.mouseWheel.normalizeDelta = t.advanced.normalizeMouseWheelDelta ? t.advanced.normalizeMouseWheelDelta : t.mouseWheel.normalizeDelta, t.scrollButtons.scrollType = g(t.scrollButtons.scrollType), h(t), e(o).each(function () { var o = e(this); if (!o.data(a)) { o.data(a, { idx: ++r, opt: t, scrollRatio: { y: null, x: null }, overflowed: null, contentReset: { y: null, x: null }, bindEvents: !1, tweenRunning: !1, sequential: {}, langDir: o.css("direction"), cbOffsets: null, trigger: null, poll: { size: { o: 0, n: 0 }, img: { o: 0, n: 0 }, change: { o: 0, n: 0 } } }); var n = o.data(a), i = n.opt, l = o.data("mcs-axis"), s = o.data("mcs-scrollbar-position"), c = o.data("mcs-theme"); l && (i.axis = l), s && (i.scrollbarPosition = s), c && (i.theme = c, h(i)), v.call(this), n && i.callbacks.onCreate && "function" == typeof i.callbacks.onCreate && i.callbacks.onCreate.call(this), e("#mCSB_" + n.idx + "_container img:not(." + d[2] + ")").addClass(d[2]), u.update.call(null, o) } }) }, update: function (t, o) { var n = t || f.call(this); return e(n).each(function () { var t = e(this); if (t.data(a)) { var n = t.data(a), i = n.opt, r = e("#mCSB_" + n.idx + "_container"), l = e("#mCSB_" + n.idx), s = [e("#mCSB_" + n.idx + "_dragger_vertical"), e("#mCSB_" + n.idx + "_dragger_horizontal")]; if (!r.length) return; n.tweenRunning && Q(t), o && n && i.callbacks.onBeforeUpdate && "function" == typeof i.callbacks.onBeforeUpdate && i.callbacks.onBeforeUpdate.call(this), t.hasClass(d[3]) && t.removeClass(d[3]), t.hasClass(d[4]) && t.removeClass(d[4]), l.css("max-height", "none"), l.height() !== t.height() && l.css("max-height", t.height()), _.call(this), "y" === i.axis || i.advanced.autoExpandHorizontalScroll || r.css("width", x(r)), n.overflowed = y.call(this), M.call(this), i.autoDraggerLength && S.call(this), b.call(this), T.call(this); var c = [Math.abs(r[0].offsetTop), Math.abs(r[0].offsetLeft)]; "x" !== i.axis && (n.overflowed[0] ? s[0].height() > s[0].parent().height() ? B.call(this) : (G(t, c[0].toString(), { dir: "y", dur: 0, overwrite: "none" }), n.contentReset.y = null) : (B.call(this), "y" === i.axis ? k.call(this) : "yx" === i.axis && n.overflowed[1] && G(t, c[1].toString(), { dir: "x", dur: 0, overwrite: "none" }))), "y" !== i.axis && (n.overflowed[1] ? s[1].width() > s[1].parent().width() ? B.call(this) : (G(t, c[1].toString(), { dir: "x", dur: 0, overwrite: "none" }), n.contentReset.x = null) : (B.call(this), "x" === i.axis ? k.call(this) : "yx" === i.axis && n.overflowed[0] && G(t, c[0].toString(), { dir: "y", dur: 0, overwrite: "none" }))), o && n && (2 === o && i.callbacks.onImageLoad && "function" == typeof i.callbacks.onImageLoad ? i.callbacks.onImageLoad.call(this) : 3 === o && i.callbacks.onSelectorChange && "function" == typeof i.callbacks.onSelectorChange ? i.callbacks.onSelectorChange.call(this) : i.callbacks.onUpdate && "function" == typeof i.callbacks.onUpdate && i.callbacks.onUpdate.call(this)), N.call(this) } }) }, scrollTo: function (t, o) { if ("undefined" != typeof t && null != t) { var n = f.call(this); return e(n).each(function () { var n = e(this); if (n.data(a)) { var i = n.data(a), r = i.opt, l = { trigger: "external", scrollInertia: r.scrollInertia, scrollEasing: "mcsEaseInOut", moveDragger: !1, timeout: 60, callbacks: !0, onStart: !0, onUpdate: !0, onComplete: !0 }, s = e.extend(!0, {}, l, o), c = Y.call(this, t), d = s.scrollInertia > 0 && s.scrollInertia < 17 ? 17 : s.scrollInertia; c[0] = X.call(this, c[0], "y"), c[1] = X.call(this, c[1], "x"), s.moveDragger && (c[0] *= i.scrollRatio.y, c[1] *= i.scrollRatio.x), s.dur = ne() ? 0 : d, setTimeout(function () { null !== c[0] && "undefined" != typeof c[0] && "x" !== r.axis && i.overflowed[0] && (s.dir = "y", s.overwrite = "all", G(n, c[0].toString(), s)), null !== c[1] && "undefined" != typeof c[1] && "y" !== r.axis && i.overflowed[1] && (s.dir = "x", s.overwrite = "none", G(n, c[1].toString(), s)) }, s.timeout) } }) } }, stop: function () { var t = f.call(this); return e(t).each(function () { var t = e(this); t.data(a) && Q(t) }) }, disable: function (t) { var o = f.call(this); return e(o).each(function () { var o = e(this); if (o.data(a)) { o.data(a); N.call(this, "remove"), k.call(this), t && B.call(this), M.call(this, !0), o.addClass(d[3]) } }) }, destroy: function () { var t = f.call(this); return e(t).each(function () { var n = e(this); if (n.data(a)) { var i = n.data(a), r = i.opt, l = e("#mCSB_" + i.idx), s = e("#mCSB_" + i.idx + "_container"), c = e(".mCSB_" + i.idx + "_scrollbar"); r.live && m(r.liveSelector || e(t).selector), N.call(this, "remove"), k.call(this), B.call(this), n.removeData(a), $(this, "mcs"), c.remove(), s.find("img." + d[2]).removeClass(d[2]), l.replaceWith(s.contents()), n.removeClass(o + " _" + a + "_" + i.idx + " " + d[6] + " " + d[7] + " " + d[5] + " " + d[3]).addClass(d[4]) } }) } }, f = function () { return "object" != typeof e(this) || e(this).length < 1 ? n : this }, h = function (t) { var o = ["rounded", "rounded-dark", "rounded-dots", "rounded-dots-dark"], a = ["rounded-dots", "rounded-dots-dark", "3d", "3d-dark", "3d-thick", "3d-thick-dark", "inset", "inset-dark", "inset-2", "inset-2-dark", "inset-3", "inset-3-dark"], n = ["minimal", "minimal-dark"], i = ["minimal", "minimal-dark"], r = ["minimal", "minimal-dark"]; t.autoDraggerLength = e.inArray(t.theme, o) > -1 ? !1 : t.autoDraggerLength, t.autoExpandScrollbar = e.inArray(t.theme, a) > -1 ? !1 : t.autoExpandScrollbar, t.scrollButtons.enable = e.inArray(t.theme, n) > -1 ? !1 : t.scrollButtons.enable, t.autoHideScrollbar = e.inArray(t.theme, i) > -1 ? !0 : t.autoHideScrollbar, t.scrollbarPosition = e.inArray(t.theme, r) > -1 ? "outside" : t.scrollbarPosition }, m = function (e) { l[e] && (clearTimeout(l[e]), $(l, e)) }, p = function (e) { return "yx" === e || "xy" === e || "auto" === e ? "yx" : "x" === e || "horizontal" === e ? "x" : "y" }, g = function (e) { return "stepped" === e || "pixels" === e || "step" === e || "click" === e ? "stepped" : "stepless" }, v = function () { var t = e(this), n = t.data(a), i = n.opt, r = i.autoExpandScrollbar ? " " + d[1] + "_expand" : "", l = ["<div id='mCSB_" + n.idx + "_scrollbar_vertical' class='mCSB_scrollTools mCSB_" + n.idx + "_scrollbar mCS-" + i.theme + " mCSB_scrollTools_vertical" + r + "'><div class='" + d[12] + "'><div id='mCSB_" + n.idx + "_dragger_vertical' class='mCSB_dragger' style='position:absolute;'><div class='mCSB_dragger_bar' /></div><div class='mCSB_draggerRail' /></div></div>", "<div id='mCSB_" + n.idx + "_scrollbar_horizontal' class='mCSB_scrollTools mCSB_" + n.idx + "_scrollbar mCS-" + i.theme + " mCSB_scrollTools_horizontal" + r + "'><div class='" + d[12] + "'><div id='mCSB_" + n.idx + "_dragger_horizontal' class='mCSB_dragger' style='position:absolute;'><div class='mCSB_dragger_bar' /></div><div class='mCSB_draggerRail' /></div></div>"], s = "yx" === i.axis ? "mCSB_vertical_horizontal" : "x" === i.axis ? "mCSB_horizontal" : "mCSB_vertical", c = "yx" === i.axis ? l[0] + l[1] : "x" === i.axis ? l[1] : l[0], u = "yx" === i.axis ? "<div id='mCSB_" + n.idx + "_container_wrapper' class='mCSB_container_wrapper' />" : "", f = i.autoHideScrollbar ? " " + d[6] : "", h = "x" !== i.axis && "rtl" === n.langDir ? " " + d[7] : ""; i.setWidth && t.css("width", i.setWidth), i.setHeight && t.css("height", i.setHeight), i.setLeft = "y" !== i.axis && "rtl" === n.langDir ? "989999px" : i.setLeft, t.addClass(o + " _" + a + "_" + n.idx + f + h).wrapInner("<div id='mCSB_" + n.idx + "' class='mCustomScrollBox mCS-" + i.theme + " " + s + "'><div id='mCSB_" + n.idx + "_container' class='mCSB_container' style='position:relative; top:" + i.setTop + "; left:" + i.setLeft + ";' dir='" + n.langDir + "' /></div>"); var m = e("#mCSB_" + n.idx), p = e("#mCSB_" + n.idx + "_container"); "y" === i.axis || i.advanced.autoExpandHorizontalScroll || p.css("width", x(p)), "outside" === i.scrollbarPosition ? ("static" === t.css("position") && t.css("position", "relative"), t.css("overflow", "visible"), m.addClass("mCSB_outside").after(c)) : (m.addClass("mCSB_inside").append(c), p.wrap(u)), w.call(this); var g = [e("#mCSB_" + n.idx + "_dragger_vertical"), e("#mCSB_" + n.idx + "_dragger_horizontal")]; g[0].css("min-height", g[0].height()), g[1].css("min-width", g[1].width()) }, x = function (t) { var o = [t[0].scrollWidth, Math.max.apply(Math, t.children().map(function () { return e(this).outerWidth(!0) }).get())], a = t.parent().width(); return o[0] > a ? o[0] : o[1] > a ? o[1] : "100%" }, _ = function () { var t = e(this), o = t.data(a), n = o.opt, i = e("#mCSB_" + o.idx + "_container"); if (n.advanced.autoExpandHorizontalScroll && "y" !== n.axis) { i.css({ width: "auto", "min-width": 0, "overflow-x": "scroll" }); var r = Math.ceil(i[0].scrollWidth); 3 === n.advanced.autoExpandHorizontalScroll || 2 !== n.advanced.autoExpandHorizontalScroll && r > i.parent().width() ? i.css({ width: r, "min-width": "100%", "overflow-x": "inherit" }) : i.css({ "overflow-x": "inherit", position: "absolute" }).wrap("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />").css({ width: Math.ceil(i[0].getBoundingClientRect().right + .4) - Math.floor(i[0].getBoundingClientRect().left), "min-width": "100%", position: "relative" }).unwrap() } }, w = function () { var t = e(this), o = t.data(a), n = o.opt, i = e(".mCSB_" + o.idx + "_scrollbar:first"), r = oe(n.scrollButtons.tabindex) ? "tabindex='" + n.scrollButtons.tabindex + "'" : "", l = ["<a href='#' class='" + d[13] + "' " + r + " />", "<a href='#' class='" + d[14] + "' " + r + " />", "<a href='#' class='" + d[15] + "' " + r + " />", "<a href='#' class='" + d[16] + "' " + r + " />"], s = ["x" === n.axis ? l[2] : l[0], "x" === n.axis ? l[3] : l[1], l[2], l[3]]; n.scrollButtons.enable && i.prepend(s[0]).append(s[1]).next(".mCSB_scrollTools").prepend(s[2]).append(s[3]) }, S = function () { var t = e(this), o = t.data(a), n = e("#mCSB_" + o.idx), i = e("#mCSB_" + o.idx + "_container"), r = [e("#mCSB_" + o.idx + "_dragger_vertical"), e("#mCSB_" + o.idx + "_dragger_horizontal")], l = [n.height() / i.outerHeight(!1), n.width() / i.outerWidth(!1)], c = [parseInt(r[0].css("min-height")), Math.round(l[0] * r[0].parent().height()), parseInt(r[1].css("min-width")), Math.round(l[1] * r[1].parent().width())], d = s && c[1] < c[0] ? c[0] : c[1], u = s && c[3] < c[2] ? c[2] : c[3]; r[0].css({ height: d, "max-height": r[0].parent().height() - 10 }).find(".mCSB_dragger_bar").css({ "line-height": c[0] + "px" }), r[1].css({ width: u, "max-width": r[1].parent().width() - 10 }) }, b = function () { var t = e(this), o = t.data(a), n = e("#mCSB_" + o.idx), i = e("#mCSB_" + o.idx + "_container"), r = [e("#mCSB_" + o.idx + "_dragger_vertical"), e("#mCSB_" + o.idx + "_dragger_horizontal")], l = [i.outerHeight(!1) - n.height(), i.outerWidth(!1) - n.width()], s = [l[0] / (r[0].parent().height() - r[0].height()), l[1] / (r[1].parent().width() - r[1].width())]; o.scrollRatio = { y: s[0], x: s[1] } }, C = function (e, t, o) { var a = o ? d[0] + "_expanded" : "", n = e.closest(".mCSB_scrollTools"); "active" === t ? (e.toggleClass(d[0] + " " + a), n.toggleClass(d[1]), e[0]._draggable = e[0]._draggable ? 0 : 1) : e[0]._draggable || ("hide" === t ? (e.removeClass(d[0]), n.removeClass(d[1])) : (e.addClass(d[0]), n.addClass(d[1]))) }, y = function () { var t = e(this), o = t.data(a), n = e("#mCSB_" + o.idx), i = e("#mCSB_" + o.idx + "_container"), r = null == o.overflowed ? i.height() : i.outerHeight(!1), l = null == o.overflowed ? i.width() : i.outerWidth(!1), s = i[0].scrollHeight, c = i[0].scrollWidth; return s > r && (r = s), c > l && (l = c), [r > n.height(), l > n.width()] }, B = function () { var t = e(this), o = t.data(a), n = o.opt, i = e("#mCSB_" + o.idx), r = e("#mCSB_" + o.idx + "_container"), l = [e("#mCSB_" + o.idx + "_dragger_vertical"), e("#mCSB_" + o.idx + "_dragger_horizontal")]; if (Q(t), ("x" !== n.axis && !o.overflowed[0] || "y" === n.axis && o.overflowed[0]) && (l[0].add(r).css("top", 0), G(t, "_resetY")), "y" !== n.axis && !o.overflowed[1] || "x" === n.axis && o.overflowed[1]) { var s = dx = 0; "rtl" === o.langDir && (s = i.width() - r.outerWidth(!1), dx = Math.abs(s / o.scrollRatio.x)), r.css("left", s), l[1].css("left", dx), G(t, "_resetX") } }, T = function () { function t() { r = setTimeout(function () { e.event.special.mousewheel ? (clearTimeout(r), W.call(o[0])) : t() }, 100) } var o = e(this), n = o.data(a), i = n.opt; if (!n.bindEvents) { if (I.call(this), i.contentTouchScroll && D.call(this), E.call(this), i.mouseWheel.enable) { var r; t() } P.call(this), U.call(this), i.advanced.autoScrollOnFocus && H.call(this), i.scrollButtons.enable && F.call(this), i.keyboard.enable && q.call(this), n.bindEvents = !0 } }, k = function () { var t = e(this), o = t.data(a), n = o.opt, i = a + "_" + o.idx, r = ".mCSB_" + o.idx + "_scrollbar", l = e("#mCSB_" + o.idx + ",#mCSB_" + o.idx + "_container,#mCSB_" + o.idx + "_container_wrapper," + r + " ." + d[12] + ",#mCSB_" + o.idx + "_dragger_vertical,#mCSB_" + o.idx + "_dragger_horizontal," + r + ">a"), s = e("#mCSB_" + o.idx + "_container"); n.advanced.releaseDraggableSelectors && l.add(e(n.advanced.releaseDraggableSelectors)), n.advanced.extraDraggableSelectors && l.add(e(n.advanced.extraDraggableSelectors)), o.bindEvents && (e(document).add(e(!A() || top.document)).unbind("." + i), l.each(function () { e(this).unbind("." + i) }), clearTimeout(t[0]._focusTimeout), $(t[0], "_focusTimeout"), clearTimeout(o.sequential.step), $(o.sequential, "step"), clearTimeout(s[0].onCompleteTimeout), $(s[0], "onCompleteTimeout"), o.bindEvents = !1) }, M = function (t) { var o = e(this), n = o.data(a), i = n.opt, r = e("#mCSB_" + n.idx + "_container_wrapper"), l = r.length ? r : e("#mCSB_" + n.idx + "_container"), s = [e("#mCSB_" + n.idx + "_scrollbar_vertical"), e("#mCSB_" + n.idx + "_scrollbar_horizontal")], c = [s[0].find(".mCSB_dragger"), s[1].find(".mCSB_dragger")]; "x" !== i.axis && (n.overflowed[0] && !t ? (s[0].add(c[0]).add(s[0].children("a")).css("display", "block"), l.removeClass(d[8] + " " + d[10])) : (i.alwaysShowScrollbar ? (2 !== i.alwaysShowScrollbar && c[0].css("display", "none"), l.removeClass(d[10])) : (s[0].css("display", "none"), l.addClass(d[10])), l.addClass(d[8]))), "y" !== i.axis && (n.overflowed[1] && !t ? (s[1].add(c[1]).add(s[1].children("a")).css("display", "block"), l.removeClass(d[9] + " " + d[11])) : (i.alwaysShowScrollbar ? (2 !== i.alwaysShowScrollbar && c[1].css("display", "none"), l.removeClass(d[11])) : (s[1].css("display", "none"), l.addClass(d[11])), l.addClass(d[9]))), n.overflowed[0] || n.overflowed[1] ? o.removeClass(d[5]) : o.addClass(d[5]) }, O = function (t) { var o = t.type, a = t.target.ownerDocument !== document && null !== frameElement ? [e(frameElement).offset().top, e(frameElement).offset().left] : null, n = A() && t.target.ownerDocument !== top.document && null !== frameElement ? [e(t.view.frameElement).offset().top, e(t.view.frameElement).offset().left] : [0, 0]; switch (o) { case "pointerdown": case "MSPointerDown": case "pointermove": case "MSPointerMove": case "pointerup": case "MSPointerUp": return a ? [t.originalEvent.pageY - a[0] + n[0], t.originalEvent.pageX - a[1] + n[1], !1] : [t.originalEvent.pageY, t.originalEvent.pageX, !1]; case "touchstart": case "touchmove": case "touchend": var i = t.originalEvent.touches[0] || t.originalEvent.changedTouches[0], r = t.originalEvent.touches.length || t.originalEvent.changedTouches.length; return t.target.ownerDocument !== document ? [i.screenY, i.screenX, r > 1] : [i.pageY, i.pageX, r > 1]; default: return a ? [t.pageY - a[0] + n[0], t.pageX - a[1] + n[1], !1] : [t.pageY, t.pageX, !1] } }, I = function () { function t(e, t, a, n) { if (h[0].idleTimer = d.scrollInertia < 233 ? 250 : 0, o.attr("id") === f[1]) var i = "x", s = (o[0].offsetLeft - t + n) * l.scrollRatio.x; else var i = "y", s = (o[0].offsetTop - e + a) * l.scrollRatio.y; G(r, s.toString(), { dir: i, drag: !0 }) } var o, n, i, r = e(this), l = r.data(a), d = l.opt, u = a + "_" + l.idx, f = ["mCSB_" + l.idx + "_dragger_vertical", "mCSB_" + l.idx + "_dragger_horizontal"], h = e("#mCSB_" + l.idx + "_container"), m = e("#" + f[0] + ",#" + f[1]), p = d.advanced.releaseDraggableSelectors ? m.add(e(d.advanced.releaseDraggableSelectors)) : m, g = d.advanced.extraDraggableSelectors ? e(!A() || top.document).add(e(d.advanced.extraDraggableSelectors)) : e(!A() || top.document); m.bind("contextmenu." + u, function (e) { e.preventDefault() }).bind("mousedown." + u + " touchstart." + u + " pointerdown." + u + " MSPointerDown." + u, function (t) { if (t.stopImmediatePropagation(), t.preventDefault(), ee(t)) { c = !0, s && (document.onselectstart = function () { return !1 }), L.call(h, !1), Q(r), o = e(this); var a = o.offset(), l = O(t)[0] - a.top, u = O(t)[1] - a.left, f = o.height() + a.top, m = o.width() + a.left; f > l && l > 0 && m > u && u > 0 && (n = l, i = u), C(o, "active", d.autoExpandScrollbar) } }).bind("touchmove." + u, function (e) { e.stopImmediatePropagation(), e.preventDefault(); var a = o.offset(), r = O(e)[0] - a.top, l = O(e)[1] - a.left; t(n, i, r, l) }), e(document).add(g).bind("mousemove." + u + " pointermove." + u + " MSPointerMove." + u, function (e) { if (o) { var a = o.offset(), r = O(e)[0] - a.top, l = O(e)[1] - a.left; if (n === r && i === l) return; t(n, i, r, l) } }).add(p).bind("mouseup." + u + " touchend." + u + " pointerup." + u + " MSPointerUp." + u, function () { o && (C(o, "active", d.autoExpandScrollbar), o = null), c = !1, s && (document.onselectstart = null), L.call(h, !0) }) }, D = function () { function o(e) { if (!te(e) || c || O(e)[2]) return void (t = 0); t = 1, b = 0, C = 0, d = 1, y.removeClass("mCS_touch_action"); var o = I.offset(); u = O(e)[0] - o.top, f = O(e)[1] - o.left, z = [O(e)[0], O(e)[1]] } function n(e) { if (te(e) && !c && !O(e)[2] && (T.documentTouchScroll || e.preventDefault(), e.stopImmediatePropagation(), (!C || b) && d)) { g = K(); var t = M.offset(), o = O(e)[0] - t.top, a = O(e)[1] - t.left, n = "mcsLinearOut"; if (E.push(o), W.push(a), z[2] = Math.abs(O(e)[0] - z[0]), z[3] = Math.abs(O(e)[1] - z[1]), B.overflowed[0]) var i = D[0].parent().height() - D[0].height(), r = u - o > 0 && o - u > -(i * B.scrollRatio.y) && (2 * z[3] < z[2] || "yx" === T.axis); if (B.overflowed[1]) var l = D[1].parent().width() - D[1].width(), h = f - a > 0 && a - f > -(l * B.scrollRatio.x) && (2 * z[2] < z[3] || "yx" === T.axis); r || h ? (U || e.preventDefault(), b = 1) : (C = 1, y.addClass("mCS_touch_action")), U && e.preventDefault(), w = "yx" === T.axis ? [u - o, f - a] : "x" === T.axis ? [null, f - a] : [u - o, null], I[0].idleTimer = 250, B.overflowed[0] && s(w[0], R, n, "y", "all", !0), B.overflowed[1] && s(w[1], R, n, "x", L, !0) } } function i(e) { if (!te(e) || c || O(e)[2]) return void (t = 0); t = 1, e.stopImmediatePropagation(), Q(y), p = K(); var o = M.offset(); h = O(e)[0] - o.top, m = O(e)[1] - o.left, E = [], W = [] } function r(e) { if (te(e) && !c && !O(e)[2]) { d = 0, e.stopImmediatePropagation(), b = 0, C = 0, v = K(); var t = M.offset(), o = O(e)[0] - t.top, a = O(e)[1] - t.left; if (!(v - g > 30)) { _ = 1e3 / (v - p); var n = "mcsEaseOut", i = 2.5 > _, r = i ? [E[E.length - 2], W[W.length - 2]] : [0, 0]; x = i ? [o - r[0], a - r[1]] : [o - h, a - m]; var u = [Math.abs(x[0]), Math.abs(x[1])]; _ = i ? [Math.abs(x[0] / 4), Math.abs(x[1] / 4)] : [_, _]; var f = [Math.abs(I[0].offsetTop) - x[0] * l(u[0] / _[0], _[0]), Math.abs(I[0].offsetLeft) - x[1] * l(u[1] / _[1], _[1])]; w = "yx" === T.axis ? [f[0], f[1]] : "x" === T.axis ? [null, f[1]] : [f[0], null], S = [4 * u[0] + T.scrollInertia, 4 * u[1] + T.scrollInertia]; var y = parseInt(T.contentTouchScroll) || 0; w[0] = u[0] > y ? w[0] : 0, w[1] = u[1] > y ? w[1] : 0, B.overflowed[0] && s(w[0], S[0], n, "y", L, !1), B.overflowed[1] && s(w[1], S[1], n, "x", L, !1) } } } function l(e, t) { var o = [1.5 * t, 2 * t, t / 1.5, t / 2]; return e > 90 ? t > 4 ? o[0] : o[3] : e > 60 ? t > 3 ? o[3] : o[2] : e > 30 ? t > 8 ? o[1] : t > 6 ? o[0] : t > 4 ? t : o[2] : t > 8 ? t : o[3] } function s(e, t, o, a, n, i) { e && G(y, e.toString(), { dur: t, scrollEasing: o, dir: a, overwrite: n, drag: i }) } var d, u, f, h, m, p, g, v, x, _, w, S, b, C, y = e(this), B = y.data(a), T = B.opt, k = a + "_" + B.idx, M = e("#mCSB_" + B.idx), I = e("#mCSB_" + B.idx + "_container"), D = [e("#mCSB_" + B.idx + "_dragger_vertical"), e("#mCSB_" + B.idx + "_dragger_horizontal")], E = [], W = [], R = 0, L = "yx" === T.axis ? "none" : "all", z = [], P = I.find("iframe"), H = ["touchstart." + k + " pointerdown." + k + " MSPointerDown." + k, "touchmove." + k + " pointermove." + k + " MSPointerMove." + k, "touchend." + k + " pointerup." + k + " MSPointerUp." + k], U = void 0 !== document.body.style.touchAction && "" !== document.body.style.touchAction; I.bind(H[0], function (e) { o(e) }).bind(H[1], function (e) { n(e) }), M.bind(H[0], function (e) { i(e) }).bind(H[2], function (e) { r(e) }), P.length && P.each(function () { e(this).bind("load", function () { A(this) && e(this.contentDocument || this.contentWindow.document).bind(H[0], function (e) { o(e), i(e) }).bind(H[1], function (e) { n(e) }).bind(H[2], function (e) { r(e) }) }) }) }, E = function () { function o() { return window.getSelection ? window.getSelection().toString() : document.selection && "Control" != document.selection.type ? document.selection.createRange().text : 0 } function n(e, t, o) { d.type = o && i ? "stepped" : "stepless", d.scrollAmount = 10, j(r, e, t, "mcsLinearOut", o ? 60 : null) } var i, r = e(this), l = r.data(a), s = l.opt, d = l.sequential, u = a + "_" + l.idx, f = e("#mCSB_" + l.idx + "_container"), h = f.parent(); f.bind("mousedown." + u, function () { t || i || (i = 1, c = !0) }).add(document).bind("mousemove." + u, function (e) { if (!t && i && o()) { var a = f.offset(), r = O(e)[0] - a.top + f[0].offsetTop, c = O(e)[1] - a.left + f[0].offsetLeft; r > 0 && r < h.height() && c > 0 && c < h.width() ? d.step && n("off", null, "stepped") : ("x" !== s.axis && l.overflowed[0] && (0 > r ? n("on", 38) : r > h.height() && n("on", 40)), "y" !== s.axis && l.overflowed[1] && (0 > c ? n("on", 37) : c > h.width() && n("on", 39))) } }).bind("mouseup." + u + " dragend." + u, function () { t || (i && (i = 0, n("off", null)), c = !1) }) }, W = function () { function t(t, a) { if (Q(o), !z(o, t.target)) { var r = "auto" !== i.mouseWheel.deltaFactor ? parseInt(i.mouseWheel.deltaFactor) : s && t.deltaFactor < 100 ? 100 : t.deltaFactor || 100, d = i.scrollInertia; if ("x" === i.axis || "x" === i.mouseWheel.axis) var u = "x", f = [Math.round(r * n.scrollRatio.x), parseInt(i.mouseWheel.scrollAmount)], h = "auto" !== i.mouseWheel.scrollAmount ? f[1] : f[0] >= l.width() ? .9 * l.width() : f[0], m = Math.abs(e("#mCSB_" + n.idx + "_container")[0].offsetLeft), p = c[1][0].offsetLeft, g = c[1].parent().width() - c[1].width(), v = "y" === i.mouseWheel.axis ? t.deltaY || a : t.deltaX; else var u = "y", f = [Math.round(r * n.scrollRatio.y), parseInt(i.mouseWheel.scrollAmount)], h = "auto" !== i.mouseWheel.scrollAmount ? f[1] : f[0] >= l.height() ? .9 * l.height() : f[0], m = Math.abs(e("#mCSB_" + n.idx + "_container")[0].offsetTop), p = c[0][0].offsetTop, g = c[0].parent().height() - c[0].height(), v = t.deltaY || a; "y" === u && !n.overflowed[0] || "x" === u && !n.overflowed[1] || ((i.mouseWheel.invert || t.webkitDirectionInvertedFromDevice) && (v = -v), i.mouseWheel.normalizeDelta && (v = 0 > v ? -1 : 1), (v > 0 && 0 !== p || 0 > v && p !== g || i.mouseWheel.preventDefault) && (t.stopImmediatePropagation(), t.preventDefault()), t.deltaFactor < 5 && !i.mouseWheel.normalizeDelta && (h = t.deltaFactor, d = 17), G(o, (m - v * h).toString(), { dir: u, dur: d })) } } if (e(this).data(a)) { var o = e(this), n = o.data(a), i = n.opt, r = a + "_" + n.idx, l = e("#mCSB_" + n.idx), c = [e("#mCSB_" + n.idx + "_dragger_vertical"), e("#mCSB_" + n.idx + "_dragger_horizontal")], d = e("#mCSB_" + n.idx + "_container").find("iframe"); d.length && d.each(function () { e(this).bind("load", function () { A(this) && e(this.contentDocument || this.contentWindow.document).bind("mousewheel." + r, function (e, o) { t(e, o) }) }) }), l.bind("mousewheel." + r, function (e, o) { t(e, o) }) } }, R = new Object, A = function (t) { var o = !1, a = !1, n = null; if (void 0 === t ? a = "#empty" : void 0 !== e(t).attr("id") && (a = e(t).attr("id")), a !== !1 && void 0 !== R[a]) return R[a]; if (t) { try { var i = t.contentDocument || t.contentWindow.document; n = i.body.innerHTML } catch (r) { } o = null !== n } else { try { var i = top.document; n = i.body.innerHTML } catch (r) { } o = null !== n } return a !== !1 && (R[a] = o), o }, L = function (e) { var t = this.find("iframe"); if (t.length) { var o = e ? "auto" : "none"; t.css("pointer-events", o) } }, z = function (t, o) { var n = o.nodeName.toLowerCase(), i = t.data(a).opt.mouseWheel.disableOver, r = ["select", "textarea"]; return e.inArray(n, i) > -1 && !(e.inArray(n, r) > -1 && !e(o).is(":focus")) }, P = function () { var t, o = e(this), n = o.data(a), i = a + "_" + n.idx, r = e("#mCSB_" + n.idx + "_container"), l = r.parent(), s = e(".mCSB_" + n.idx + "_scrollbar ." + d[12]); s.bind("mousedown." + i + " touchstart." + i + " pointerdown." + i + " MSPointerDown." + i, function (o) { c = !0, e(o.target).hasClass("mCSB_dragger") || (t = 1) }).bind("touchend." + i + " pointerup." + i + " MSPointerUp." + i, function () { c = !1 }).bind("click." + i, function (a) { if (t && (t = 0, e(a.target).hasClass(d[12]) || e(a.target).hasClass("mCSB_draggerRail"))) { Q(o); var i = e(this), s = i.find(".mCSB_dragger"); if (i.parent(".mCSB_scrollTools_horizontal").length > 0) { if (!n.overflowed[1]) return; var c = "x", u = a.pageX > s.offset().left ? -1 : 1, f = Math.abs(r[0].offsetLeft) - u * (.9 * l.width()) } else { if (!n.overflowed[0]) return; var c = "y", u = a.pageY > s.offset().top ? -1 : 1, f = Math.abs(r[0].offsetTop) - u * (.9 * l.height()) } G(o, f.toString(), { dir: c, scrollEasing: "mcsEaseInOut" }) } }) }, H = function () { var t = e(this), o = t.data(a), n = o.opt, i = a + "_" + o.idx, r = e("#mCSB_" + o.idx + "_container"), l = r.parent(); r.bind("focusin." + i, function () { var o = e(document.activeElement), a = r.find(".mCustomScrollBox").length, i = 0; o.is(n.advanced.autoScrollOnFocus) && (Q(t), clearTimeout(t[0]._focusTimeout), t[0]._focusTimer = a ? (i + 17) * a : 0, t[0]._focusTimeout = setTimeout(function () { var e = [ae(o)[0], ae(o)[1]], a = [r[0].offsetTop, r[0].offsetLeft], s = [a[0] + e[0] >= 0 && a[0] + e[0] < l.height() - o.outerHeight(!1), a[1] + e[1] >= 0 && a[0] + e[1] < l.width() - o.outerWidth(!1)], c = "yx" !== n.axis || s[0] || s[1] ? "all" : "none"; "x" === n.axis || s[0] || G(t, e[0].toString(), { dir: "y", scrollEasing: "mcsEaseInOut", overwrite: c, dur: i }), "y" === n.axis || s[1] || G(t, e[1].toString(), { dir: "x", scrollEasing: "mcsEaseInOut", overwrite: c, dur: i }) }, t[0]._focusTimer)) }) }, U = function () { var t = e(this), o = t.data(a), n = a + "_" + o.idx, i = e("#mCSB_" + o.idx + "_container").parent(); i.bind("scroll." + n, function () { 0 === i.scrollTop() && 0 === i.scrollLeft() || e(".mCSB_" + o.idx + "_scrollbar").css("visibility", "hidden") }) }, F = function () { var t = e(this), o = t.data(a), n = o.opt, i = o.sequential, r = a + "_" + o.idx, l = ".mCSB_" + o.idx + "_scrollbar", s = e(l + ">a"); s.bind("contextmenu." + r, function (e) { e.preventDefault() }).bind("mousedown." + r + " touchstart." + r + " pointerdown." + r + " MSPointerDown." + r + " mouseup." + r + " touchend." + r + " pointerup." + r + " MSPointerUp." + r + " mouseout." + r + " pointerout." + r + " MSPointerOut." + r + " click." + r, function (a) { function r(e, o) { i.scrollAmount = n.scrollButtons.scrollAmount, j(t, e, o) } if (a.preventDefault(), ee(a)) { var l = e(this).attr("class"); switch (i.type = n.scrollButtons.scrollType, a.type) { case "mousedown": case "touchstart": case "pointerdown": case "MSPointerDown": if ("stepped" === i.type) return; c = !0, o.tweenRunning = !1, r("on", l); break; case "mouseup": case "touchend": case "pointerup": case "MSPointerUp": case "mouseout": case "pointerout": case "MSPointerOut": if ("stepped" === i.type) return; c = !1, i.dir && r("off", l); break; case "click": if ("stepped" !== i.type || o.tweenRunning) return; r("on", l) } } }) }, q = function () { function t(t) { function a(e, t) { r.type = i.keyboard.scrollType, r.scrollAmount = i.keyboard.scrollAmount, "stepped" === r.type && n.tweenRunning || j(o, e, t) } switch (t.type) { case "blur": n.tweenRunning && r.dir && a("off", null); break; case "keydown": case "keyup": var l = t.keyCode ? t.keyCode : t.which, s = "on"; if ("x" !== i.axis && (38 === l || 40 === l) || "y" !== i.axis && (37 === l || 39 === l)) { if ((38 === l || 40 === l) && !n.overflowed[0] || (37 === l || 39 === l) && !n.overflowed[1]) return; "keyup" === t.type && (s = "off"), e(document.activeElement).is(u) || (t.preventDefault(), t.stopImmediatePropagation(), a(s, l)) } else if (33 === l || 34 === l) { if ((n.overflowed[0] || n.overflowed[1]) && (t.preventDefault(), t.stopImmediatePropagation()), "keyup" === t.type) { Q(o); var f = 34 === l ? -1 : 1; if ("x" === i.axis || "yx" === i.axis && n.overflowed[1] && !n.overflowed[0]) var h = "x", m = Math.abs(c[0].offsetLeft) - f * (.9 * d.width()); else var h = "y", m = Math.abs(c[0].offsetTop) - f * (.9 * d.height()); G(o, m.toString(), { dir: h, scrollEasing: "mcsEaseInOut" }) } } else if ((35 === l || 36 === l) && !e(document.activeElement).is(u) && ((n.overflowed[0] || n.overflowed[1]) && (t.preventDefault(), t.stopImmediatePropagation()), "keyup" === t.type)) { if ("x" === i.axis || "yx" === i.axis && n.overflowed[1] && !n.overflowed[0]) var h = "x", m = 35 === l ? Math.abs(d.width() - c.outerWidth(!1)) : 0; else var h = "y", m = 35 === l ? Math.abs(d.height() - c.outerHeight(!1)) : 0; G(o, m.toString(), { dir: h, scrollEasing: "mcsEaseInOut" }) } } } var o = e(this), n = o.data(a), i = n.opt, r = n.sequential, l = a + "_" + n.idx, s = e("#mCSB_" + n.idx), c = e("#mCSB_" + n.idx + "_container"), d = c.parent(), u = "input,textarea,select,datalist,keygen,[contenteditable='true']", f = c.find("iframe"), h = ["blur." + l + " keydown." + l + " keyup." + l]; f.length && f.each(function () { e(this).bind("load", function () { A(this) && e(this.contentDocument || this.contentWindow.document).bind(h[0], function (e) { t(e) }) }) }), s.attr("tabindex", "0").bind(h[0], function (e) { t(e) }) }, j = function (t, o, n, i, r) { function l(e) { u.snapAmount && (f.scrollAmount = u.snapAmount instanceof Array ? "x" === f.dir[0] ? u.snapAmount[1] : u.snapAmount[0] : u.snapAmount); var o = "stepped" !== f.type, a = r ? r : e ? o ? p / 1.5 : g : 1e3 / 60, n = e ? o ? 7.5 : 40 : 2.5, s = [Math.abs(h[0].offsetTop), Math.abs(h[0].offsetLeft)], d = [c.scrollRatio.y > 10 ? 10 : c.scrollRatio.y, c.scrollRatio.x > 10 ? 10 : c.scrollRatio.x], m = "x" === f.dir[0] ? s[1] + f.dir[1] * (d[1] * n) : s[0] + f.dir[1] * (d[0] * n), v = "x" === f.dir[0] ? s[1] + f.dir[1] * parseInt(f.scrollAmount) : s[0] + f.dir[1] * parseInt(f.scrollAmount), x = "auto" !== f.scrollAmount ? v : m, _ = i ? i : e ? o ? "mcsLinearOut" : "mcsEaseInOut" : "mcsLinear", w = !!e; return e && 17 > a && (x = "x" === f.dir[0] ? s[1] : s[0]), G(t, x.toString(), { dir: f.dir[0], scrollEasing: _, dur: a, onComplete: w }), e ? void (f.dir = !1) : (clearTimeout(f.step), void (f.step = setTimeout(function () { l() }, a))) } function s() { clearTimeout(f.step), $(f, "step"), Q(t) } var c = t.data(a), u = c.opt, f = c.sequential, h = e("#mCSB_" + c.idx + "_container"), m = "stepped" === f.type, p = u.scrollInertia < 26 ? 26 : u.scrollInertia, g = u.scrollInertia < 1 ? 17 : u.scrollInertia; switch (o) { case "on": if (f.dir = [n === d[16] || n === d[15] || 39 === n || 37 === n ? "x" : "y", n === d[13] || n === d[15] || 38 === n || 37 === n ? -1 : 1], Q(t), oe(n) && "stepped" === f.type) return; l(m); break; case "off": s(), (m || c.tweenRunning && f.dir) && l(!0) } }, Y = function (t) { var o = e(this).data(a).opt, n = []; return "function" == typeof t && (t = t()), t instanceof Array ? n = t.length > 1 ? [t[0], t[1]] : "x" === o.axis ? [null, t[0]] : [t[0], null] : (n[0] = t.y ? t.y : t.x || "x" === o.axis ? null : t, n[1] = t.x ? t.x : t.y || "y" === o.axis ? null : t), "function" == typeof n[0] && (n[0] = n[0]()), "function" == typeof n[1] && (n[1] = n[1]()), n }, X = function (t, o) { if (null != t && "undefined" != typeof t) { var n = e(this), i = n.data(a), r = i.opt, l = e("#mCSB_" + i.idx + "_container"), s = l.parent(), c = typeof t; o || (o = "x" === r.axis ? "x" : "y"); var d = "x" === o ? l.outerWidth(!1) - s.width() : l.outerHeight(!1) - s.height(), f = "x" === o ? l[0].offsetLeft : l[0].offsetTop, h = "x" === o ? "left" : "top"; switch (c) { case "function": return t(); case "object": var m = t.jquery ? t : e(t); if (!m.length) return; return "x" === o ? ae(m)[1] : ae(m)[0]; case "string": case "number": if (oe(t)) return Math.abs(t); if (-1 !== t.indexOf("%")) return Math.abs(d * parseInt(t) / 100); if (-1 !== t.indexOf("-=")) return Math.abs(f - parseInt(t.split("-=")[1])); if (-1 !== t.indexOf("+=")) { var p = f + parseInt(t.split("+=")[1]); return p >= 0 ? 0 : Math.abs(p) } if (-1 !== t.indexOf("px") && oe(t.split("px")[0])) return Math.abs(t.split("px")[0]); if ("top" === t || "left" === t) return 0; if ("bottom" === t) return Math.abs(s.height() - l.outerHeight(!1)); if ("right" === t) return Math.abs(s.width() - l.outerWidth(!1)); if ("first" === t || "last" === t) { var m = l.find(":" + t); return "x" === o ? ae(m)[1] : ae(m)[0] } return e(t).length ? "x" === o ? ae(e(t))[1] : ae(e(t))[0] : (l.css(h, t), void u.update.call(null, n[0])) } } }, N = function (t) {
            function o() { return clearTimeout(f[0].autoUpdate), 0 === l.parents("html").length ? void (l = null) : void (f[0].autoUpdate = setTimeout(function () { return c.advanced.updateOnSelectorChange && (s.poll.change.n = i(), s.poll.change.n !== s.poll.change.o) ? (s.poll.change.o = s.poll.change.n, void r(3)) : c.advanced.updateOnContentResize && (s.poll.size.n = l[0].scrollHeight + l[0].scrollWidth + f[0].offsetHeight + l[0].offsetHeight + l[0].offsetWidth, s.poll.size.n !== s.poll.size.o) ? (s.poll.size.o = s.poll.size.n, void r(1)) : !c.advanced.updateOnImageLoad || "auto" === c.advanced.updateOnImageLoad && "y" === c.axis || (s.poll.img.n = f.find("img").length, s.poll.img.n === s.poll.img.o) ? void ((c.advanced.updateOnSelectorChange || c.advanced.updateOnContentResize || c.advanced.updateOnImageLoad) && o()) : (s.poll.img.o = s.poll.img.n, void f.find("img").each(function () { n(this) })) }, c.advanced.autoUpdateTimeout)) } function n(t) {
                function o(e, t) {
                    return function () {
                        return t.apply(e, arguments)
                    }
                } function a() { this.onload = null, e(t).addClass(d[2]), r(2) } if (e(t).hasClass(d[2])) return void r(); var n = new Image; n.onload = o(n, a), n.src = t.src
            } function i() { c.advanced.updateOnSelectorChange === !0 && (c.advanced.updateOnSelectorChange = "*"); var e = 0, t = f.find(c.advanced.updateOnSelectorChange); return c.advanced.updateOnSelectorChange && t.length > 0 && t.each(function () { e += this.offsetHeight + this.offsetWidth }), e } function r(e) { clearTimeout(f[0].autoUpdate), u.update.call(null, l[0], e) } var l = e(this), s = l.data(a), c = s.opt, f = e("#mCSB_" + s.idx + "_container"); return t ? (clearTimeout(f[0].autoUpdate), void $(f[0], "autoUpdate")) : void o()
        }, V = function (e, t, o) { return Math.round(e / t) * t - o }, Q = function (t) { var o = t.data(a), n = e("#mCSB_" + o.idx + "_container,#mCSB_" + o.idx + "_container_wrapper,#mCSB_" + o.idx + "_dragger_vertical,#mCSB_" + o.idx + "_dragger_horizontal"); n.each(function () { Z.call(this) }) }, G = function (t, o, n) { function i(e) { return s && c.callbacks[e] && "function" == typeof c.callbacks[e] } function r() { return [c.callbacks.alwaysTriggerOffsets || w >= S[0] + y, c.callbacks.alwaysTriggerOffsets || -B >= w] } function l() { var e = [h[0].offsetTop, h[0].offsetLeft], o = [x[0].offsetTop, x[0].offsetLeft], a = [h.outerHeight(!1), h.outerWidth(!1)], i = [f.height(), f.width()]; t[0].mcs = { content: h, top: e[0], left: e[1], draggerTop: o[0], draggerLeft: o[1], topPct: Math.round(100 * Math.abs(e[0]) / (Math.abs(a[0]) - i[0])), leftPct: Math.round(100 * Math.abs(e[1]) / (Math.abs(a[1]) - i[1])), direction: n.dir } } var s = t.data(a), c = s.opt, d = { trigger: "internal", dir: "y", scrollEasing: "mcsEaseOut", drag: !1, dur: c.scrollInertia, overwrite: "all", callbacks: !0, onStart: !0, onUpdate: !0, onComplete: !0 }, n = e.extend(d, n), u = [n.dur, n.drag ? 0 : n.dur], f = e("#mCSB_" + s.idx), h = e("#mCSB_" + s.idx + "_container"), m = h.parent(), p = c.callbacks.onTotalScrollOffset ? Y.call(t, c.callbacks.onTotalScrollOffset) : [0, 0], g = c.callbacks.onTotalScrollBackOffset ? Y.call(t, c.callbacks.onTotalScrollBackOffset) : [0, 0]; if (s.trigger = n.trigger, 0 === m.scrollTop() && 0 === m.scrollLeft() || (e(".mCSB_" + s.idx + "_scrollbar").css("visibility", "visible"), m.scrollTop(0).scrollLeft(0)), "_resetY" !== o || s.contentReset.y || (i("onOverflowYNone") && c.callbacks.onOverflowYNone.call(t[0]), s.contentReset.y = 1), "_resetX" !== o || s.contentReset.x || (i("onOverflowXNone") && c.callbacks.onOverflowXNone.call(t[0]), s.contentReset.x = 1), "_resetY" !== o && "_resetX" !== o) { if (!s.contentReset.y && t[0].mcs || !s.overflowed[0] || (i("onOverflowY") && c.callbacks.onOverflowY.call(t[0]), s.contentReset.x = null), !s.contentReset.x && t[0].mcs || !s.overflowed[1] || (i("onOverflowX") && c.callbacks.onOverflowX.call(t[0]), s.contentReset.x = null), c.snapAmount) { var v = c.snapAmount instanceof Array ? "x" === n.dir ? c.snapAmount[1] : c.snapAmount[0] : c.snapAmount; o = V(o, v, c.snapOffset) } switch (n.dir) { case "x": var x = e("#mCSB_" + s.idx + "_dragger_horizontal"), _ = "left", w = h[0].offsetLeft, S = [f.width() - h.outerWidth(!1), x.parent().width() - x.width()], b = [o, 0 === o ? 0 : o / s.scrollRatio.x], y = p[1], B = g[1], T = y > 0 ? y / s.scrollRatio.x : 0, k = B > 0 ? B / s.scrollRatio.x : 0; break; case "y": var x = e("#mCSB_" + s.idx + "_dragger_vertical"), _ = "top", w = h[0].offsetTop, S = [f.height() - h.outerHeight(!1), x.parent().height() - x.height()], b = [o, 0 === o ? 0 : o / s.scrollRatio.y], y = p[0], B = g[0], T = y > 0 ? y / s.scrollRatio.y : 0, k = B > 0 ? B / s.scrollRatio.y : 0 }b[1] < 0 || 0 === b[0] && 0 === b[1] ? b = [0, 0] : b[1] >= S[1] ? b = [S[0], S[1]] : b[0] = -b[0], t[0].mcs || (l(), i("onInit") && c.callbacks.onInit.call(t[0])), clearTimeout(h[0].onCompleteTimeout), J(x[0], _, Math.round(b[1]), u[1], n.scrollEasing), !s.tweenRunning && (0 === w && b[0] >= 0 || w === S[0] && b[0] <= S[0]) || J(h[0], _, Math.round(b[0]), u[0], n.scrollEasing, n.overwrite, { onStart: function () { n.callbacks && n.onStart && !s.tweenRunning && (i("onScrollStart") && (l(), c.callbacks.onScrollStart.call(t[0])), s.tweenRunning = !0, C(x), s.cbOffsets = r()) }, onUpdate: function () { n.callbacks && n.onUpdate && i("whileScrolling") && (l(), c.callbacks.whileScrolling.call(t[0])) }, onComplete: function () { if (n.callbacks && n.onComplete) { "yx" === c.axis && clearTimeout(h[0].onCompleteTimeout); var e = h[0].idleTimer || 0; h[0].onCompleteTimeout = setTimeout(function () { i("onScroll") && (l(), c.callbacks.onScroll.call(t[0])), i("onTotalScroll") && b[1] >= S[1] - T && s.cbOffsets[0] && (l(), c.callbacks.onTotalScroll.call(t[0])), i("onTotalScrollBack") && b[1] <= k && s.cbOffsets[1] && (l(), c.callbacks.onTotalScrollBack.call(t[0])), s.tweenRunning = !1, h[0].idleTimer = 0, C(x, "hide") }, e) } } }) } }, J = function (e, t, o, a, n, i, r) { function l() { S.stop || (x || m.call(), x = K() - v, s(), x >= S.time && (S.time = x > S.time ? x + f - (x - S.time) : x + f - 1, S.time < x + 1 && (S.time = x + 1)), S.time < a ? S.id = h(l) : g.call()) } function s() { a > 0 ? (S.currVal = u(S.time, _, b, a, n), w[t] = Math.round(S.currVal) + "px") : w[t] = o + "px", p.call() } function c() { f = 1e3 / 60, S.time = x + f, h = window.requestAnimationFrame ? window.requestAnimationFrame : function (e) { return s(), setTimeout(e, .01) }, S.id = h(l) } function d() { null != S.id && (window.requestAnimationFrame ? window.cancelAnimationFrame(S.id) : clearTimeout(S.id), S.id = null) } function u(e, t, o, a, n) { switch (n) { case "linear": case "mcsLinear": return o * e / a + t; case "mcsLinearOut": return e /= a, e-- , o * Math.sqrt(1 - e * e) + t; case "easeInOutSmooth": return e /= a / 2, 1 > e ? o / 2 * e * e + t : (e-- , -o / 2 * (e * (e - 2) - 1) + t); case "easeInOutStrong": return e /= a / 2, 1 > e ? o / 2 * Math.pow(2, 10 * (e - 1)) + t : (e-- , o / 2 * (-Math.pow(2, -10 * e) + 2) + t); case "easeInOut": case "mcsEaseInOut": return e /= a / 2, 1 > e ? o / 2 * e * e * e + t : (e -= 2, o / 2 * (e * e * e + 2) + t); case "easeOutSmooth": return e /= a, e-- , -o * (e * e * e * e - 1) + t; case "easeOutStrong": return o * (-Math.pow(2, -10 * e / a) + 1) + t; case "easeOut": case "mcsEaseOut": default: var i = (e /= a) * e, r = i * e; return t + o * (.499999999999997 * r * i + -2.5 * i * i + 5.5 * r + -6.5 * i + 4 * e) } } e._mTween || (e._mTween = { top: {}, left: {} }); var f, h, r = r || {}, m = r.onStart || function () { }, p = r.onUpdate || function () { }, g = r.onComplete || function () { }, v = K(), x = 0, _ = e.offsetTop, w = e.style, S = e._mTween[t]; "left" === t && (_ = e.offsetLeft); var b = o - _; S.stop = 0, "none" !== i && d(), c() }, K = function () { return window.performance && window.performance.now ? window.performance.now() : window.performance && window.performance.webkitNow ? window.performance.webkitNow() : Date.now ? Date.now() : (new Date).getTime() }, Z = function () { var e = this; e._mTween || (e._mTween = { top: {}, left: {} }); for (var t = ["top", "left"], o = 0; o < t.length; o++) { var a = t[o]; e._mTween[a].id && (window.requestAnimationFrame ? window.cancelAnimationFrame(e._mTween[a].id) : clearTimeout(e._mTween[a].id), e._mTween[a].id = null, e._mTween[a].stop = 1) } }, $ = function (e, t) { try { delete e[t] } catch (o) { e[t] = null } }, ee = function (e) { return !(e.which && 1 !== e.which) }, te = function (e) { var t = e.originalEvent.pointerType; return !(t && "touch" !== t && 2 !== t) }, oe = function (e) { return !isNaN(parseFloat(e)) && isFinite(e) }, ae = function (e) { var t = e.parents(".mCSB_container"); return [e.offset().top - t.offset().top, e.offset().left - t.offset().left] }, ne = function () { function e() { var e = ["webkit", "moz", "ms", "o"]; if ("hidden" in document) return "hidden"; for (var t = 0; t < e.length; t++)if (e[t] + "Hidden" in document) return e[t] + "Hidden"; return null } var t = e(); return t ? document[t] : !1 }; e.fn[o] = function (t) { return u[t] ? u[t].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof t && t ? void e.error("Method " + t + " does not exist") : u.init.apply(this, arguments) }, e[o] = function (t) { return u[t] ? u[t].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof t && t ? void e.error("Method " + t + " does not exist") : u.init.apply(this, arguments) }, e[o].defaults = i, window[o] = !0, e(window).bind("load", function () { e(n)[o](), e.extend(e.expr[":"], { mcsInView: e.expr[":"].mcsInView || function (t) { var o, a, n = e(t), i = n.parents(".mCSB_container"); if (i.length) return o = i.parent(), a = [i[0].offsetTop, i[0].offsetLeft], a[0] + ae(n)[0] >= 0 && a[0] + ae(n)[0] < o.height() - n.outerHeight(!1) && a[1] + ae(n)[1] >= 0 && a[1] + ae(n)[1] < o.width() - n.outerWidth(!1) }, mcsInSight: e.expr[":"].mcsInSight || function (t, o, a) { var n, i, r, l, s = e(t), c = s.parents(".mCSB_container"), d = "exact" === a[3] ? [[1, 0], [1, 0]] : [[.9, .1], [.6, .4]]; if (c.length) return n = [s.outerHeight(!1), s.outerWidth(!1)], r = [c[0].offsetTop + ae(s)[0], c[0].offsetLeft + ae(s)[1]], i = [c.parent()[0].offsetHeight, c.parent()[0].offsetWidth], l = [n[0] < i[0] ? d[0] : d[1], n[1] < i[1] ? d[0] : d[1]], r[0] - i[0] * l[0][0] < 0 && r[0] + n[0] - i[0] * l[0][1] >= 0 && r[1] - i[1] * l[1][0] < 0 && r[1] + n[1] - i[1] * l[1][1] >= 0 }, mcsOverflow: e.expr[":"].mcsOverflow || function (t) { var o = e(t).data(a); if (o) return o.overflowed[0] || o.overflowed[1] } }) })
    })
});;
(function (r) {
    r.fn.qrcode = function (h) {
        var s; function u(a) { this.mode = s; this.data = a } function o(a, c) { this.typeNumber = a; this.errorCorrectLevel = c; this.modules = null; this.moduleCount = 0; this.dataCache = null; this.dataList = [] } function q(a, c) { if (void 0 == a.length) throw Error(a.length + "/" + c); for (var d = 0; d < a.length && 0 == a[d];)d++; this.num = Array(a.length - d + c); for (var b = 0; b < a.length - d; b++)this.num[b] = a[b + d] } function p(a, c) { this.totalCount = a; this.dataCount = c } function t() { this.buffer = []; this.length = 0 } u.prototype = {
            getLength: function () { return this.data.length },
            write: function (a) { for (var c = 0; c < this.data.length; c++)a.put(this.data.charCodeAt(c), 8) }
        }; o.prototype = {
            addData: function (a) { this.dataList.push(new u(a)); this.dataCache = null }, isDark: function (a, c) { if (0 > a || this.moduleCount <= a || 0 > c || this.moduleCount <= c) throw Error(a + "," + c); return this.modules[a][c] }, getModuleCount: function () { return this.moduleCount }, make: function () {
                if (1 > this.typeNumber) {
                    for (var a = 1, a = 1; 40 > a; a++) {
                        for (var c = p.getRSBlocks(a, this.errorCorrectLevel), d = new t, b = 0, e = 0; e < c.length; e++)b += c[e].dataCount;
                        for (e = 0; e < this.dataList.length; e++)c = this.dataList[e], d.put(c.mode, 4), d.put(c.getLength(), j.getLengthInBits(c.mode, a)), c.write(d); if (d.getLengthInBits() <= 8 * b) break
                    } this.typeNumber = a
                } this.makeImpl(!1, this.getBestMaskPattern())
            }, makeImpl: function (a, c) {
            this.moduleCount = 4 * this.typeNumber + 17; this.modules = Array(this.moduleCount); for (var d = 0; d < this.moduleCount; d++) { this.modules[d] = Array(this.moduleCount); for (var b = 0; b < this.moduleCount; b++)this.modules[d][b] = null } this.setupPositionProbePattern(0, 0); this.setupPositionProbePattern(this.moduleCount -
                7, 0); this.setupPositionProbePattern(0, this.moduleCount - 7); this.setupPositionAdjustPattern(); this.setupTimingPattern(); this.setupTypeInfo(a, c); 7 <= this.typeNumber && this.setupTypeNumber(a); null == this.dataCache && (this.dataCache = o.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)); this.mapData(this.dataCache, c)
            }, setupPositionProbePattern: function (a, c) {
                for (var d = -1; 7 >= d; d++)if (!(-1 >= a + d || this.moduleCount <= a + d)) for (var b = -1; 7 >= b; b++)-1 >= c + b || this.moduleCount <= c + b || (this.modules[a + d][c + b] =
                    0 <= d && 6 >= d && (0 == b || 6 == b) || 0 <= b && 6 >= b && (0 == d || 6 == d) || 2 <= d && 4 >= d && 2 <= b && 4 >= b ? !0 : !1)
            }, getBestMaskPattern: function () { for (var a = 0, c = 0, d = 0; 8 > d; d++) { this.makeImpl(!0, d); var b = j.getLostPoint(this); if (0 == d || a > b) a = b, c = d } return c }, createMovieClip: function (a, c, d) { a = a.createEmptyMovieClip(c, d); this.make(); for (c = 0; c < this.modules.length; c++)for (var d = 1 * c, b = 0; b < this.modules[c].length; b++) { var e = 1 * b; this.modules[c][b] && (a.beginFill(0, 100), a.moveTo(e, d), a.lineTo(e + 1, d), a.lineTo(e + 1, d + 1), a.lineTo(e, d + 1), a.endFill()) } return a },
            setupTimingPattern: function () { for (var a = 8; a < this.moduleCount - 8; a++)null == this.modules[a][6] && (this.modules[a][6] = 0 == a % 2); for (a = 8; a < this.moduleCount - 8; a++)null == this.modules[6][a] && (this.modules[6][a] = 0 == a % 2) }, setupPositionAdjustPattern: function () { for (var a = j.getPatternPosition(this.typeNumber), c = 0; c < a.length; c++)for (var d = 0; d < a.length; d++) { var b = a[c], e = a[d]; if (null == this.modules[b][e]) for (var f = -2; 2 >= f; f++)for (var i = -2; 2 >= i; i++)this.modules[b + f][e + i] = -2 == f || 2 == f || -2 == i || 2 == i || 0 == f && 0 == i ? !0 : !1 } }, setupTypeNumber: function (a) {
                for (var c =
                    j.getBCHTypeNumber(this.typeNumber), d = 0; 18 > d; d++) { var b = !a && 1 == (c >> d & 1); this.modules[Math.floor(d / 3)][d % 3 + this.moduleCount - 8 - 3] = b } for (d = 0; 18 > d; d++)b = !a && 1 == (c >> d & 1), this.modules[d % 3 + this.moduleCount - 8 - 3][Math.floor(d / 3)] = b
            }, setupTypeInfo: function (a, c) {
                for (var d = j.getBCHTypeInfo(this.errorCorrectLevel << 3 | c), b = 0; 15 > b; b++) { var e = !a && 1 == (d >> b & 1); 6 > b ? this.modules[b][8] = e : 8 > b ? this.modules[b + 1][8] = e : this.modules[this.moduleCount - 15 + b][8] = e } for (b = 0; 15 > b; b++)e = !a && 1 == (d >> b & 1), 8 > b ? this.modules[8][this.moduleCount -
                    b - 1] = e : 9 > b ? this.modules[8][15 - b - 1 + 1] = e : this.modules[8][15 - b - 1] = e; this.modules[this.moduleCount - 8][8] = !a
            }, mapData: function (a, c) { for (var d = -1, b = this.moduleCount - 1, e = 7, f = 0, i = this.moduleCount - 1; 0 < i; i -= 2)for (6 == i && i--; ;) { for (var g = 0; 2 > g; g++)if (null == this.modules[b][i - g]) { var n = !1; f < a.length && (n = 1 == (a[f] >>> e & 1)); j.getMask(c, b, i - g) && (n = !n); this.modules[b][i - g] = n; e--; -1 == e && (f++ , e = 7) } b += d; if (0 > b || this.moduleCount <= b) { b -= d; d = -d; break } } }
        }; o.PAD0 = 236; o.PAD1 = 17; o.createData = function (a, c, d) {
            for (var c = p.getRSBlocks(a,
                c), b = new t, e = 0; e < d.length; e++) { var f = d[e]; b.put(f.mode, 4); b.put(f.getLength(), j.getLengthInBits(f.mode, a)); f.write(b) } for (e = a = 0; e < c.length; e++)a += c[e].dataCount; if (b.getLengthInBits() > 8 * a) throw Error("code length overflow. (" + b.getLengthInBits() + ">" + 8 * a + ")"); for (b.getLengthInBits() + 4 <= 8 * a && b.put(0, 4); 0 != b.getLengthInBits() % 8;)b.putBit(!1); for (; !(b.getLengthInBits() >= 8 * a);) { b.put(o.PAD0, 8); if (b.getLengthInBits() >= 8 * a) break; b.put(o.PAD1, 8) } return o.createBytes(b, c)
        }; o.createBytes = function (a, c) {
            for (var d =
                0, b = 0, e = 0, f = Array(c.length), i = Array(c.length), g = 0; g < c.length; g++) { var n = c[g].dataCount, h = c[g].totalCount - n, b = Math.max(b, n), e = Math.max(e, h); f[g] = Array(n); for (var k = 0; k < f[g].length; k++)f[g][k] = 255 & a.buffer[k + d]; d += n; k = j.getErrorCorrectPolynomial(h); n = (new q(f[g], k.getLength() - 1)).mod(k); i[g] = Array(k.getLength() - 1); for (k = 0; k < i[g].length; k++)h = k + n.getLength() - i[g].length, i[g][k] = 0 <= h ? n.get(h) : 0 } for (k = g = 0; k < c.length; k++)g += c[k].totalCount; d = Array(g); for (k = n = 0; k < b; k++)for (g = 0; g < c.length; g++)k < f[g].length &&
                    (d[n++] = f[g][k]); for (k = 0; k < e; k++)for (g = 0; g < c.length; g++)k < i[g].length && (d[n++] = i[g][k]); return d
        }; s = 4; for (var j = {
            PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52,
                78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], G15: 1335, G18: 7973, G15_MASK: 21522, getBCHTypeInfo: function (a) { for (var c = a << 10; 0 <= j.getBCHDigit(c) - j.getBCHDigit(j.G15);)c ^= j.G15 << j.getBCHDigit(c) - j.getBCHDigit(j.G15); return (a << 10 | c) ^ j.G15_MASK }, getBCHTypeNumber: function (a) {
                    for (var c = a << 12; 0 <= j.getBCHDigit(c) -
                        j.getBCHDigit(j.G18);)c ^= j.G18 << j.getBCHDigit(c) - j.getBCHDigit(j.G18); return a << 12 | c
                }, getBCHDigit: function (a) { for (var c = 0; 0 != a;)c++ , a >>>= 1; return c }, getPatternPosition: function (a) { return j.PATTERN_POSITION_TABLE[a - 1] }, getMask: function (a, c, d) {
                    switch (a) {
                        case 0: return 0 == (c + d) % 2; case 1: return 0 == c % 2; case 2: return 0 == d % 3; case 3: return 0 == (c + d) % 3; case 4: return 0 == (Math.floor(c / 2) + Math.floor(d / 3)) % 2; case 5: return 0 == c * d % 2 + c * d % 3; case 6: return 0 == (c * d % 2 + c * d % 3) % 2; case 7: return 0 == (c * d % 3 + (c + d) % 2) % 2; default: throw Error("bad maskPattern:" +
                            a);
                    }
                }, getErrorCorrectPolynomial: function (a) { for (var c = new q([1], 0), d = 0; d < a; d++)c = c.multiply(new q([1, l.gexp(d)], 0)); return c }, getLengthInBits: function (a, c) {
                    if (1 <= c && 10 > c) switch (a) { case 1: return 10; case 2: return 9; case s: return 8; case 8: return 8; default: throw Error("mode:" + a); } else if (27 > c) switch (a) { case 1: return 12; case 2: return 11; case s: return 16; case 8: return 10; default: throw Error("mode:" + a); } else if (41 > c) switch (a) {
                        case 1: return 14; case 2: return 13; case s: return 16; case 8: return 12; default: throw Error("mode:" +
                            a);
                    } else throw Error("type:" + c);
                }, getLostPoint: function (a) {
                    for (var c = a.getModuleCount(), d = 0, b = 0; b < c; b++)for (var e = 0; e < c; e++) { for (var f = 0, i = a.isDark(b, e), g = -1; 1 >= g; g++)if (!(0 > b + g || c <= b + g)) for (var h = -1; 1 >= h; h++)0 > e + h || c <= e + h || 0 == g && 0 == h || i == a.isDark(b + g, e + h) && f++; 5 < f && (d += 3 + f - 5) } for (b = 0; b < c - 1; b++)for (e = 0; e < c - 1; e++)if (f = 0, a.isDark(b, e) && f++ , a.isDark(b + 1, e) && f++ , a.isDark(b, e + 1) && f++ , a.isDark(b + 1, e + 1) && f++ , 0 == f || 4 == f) d += 3; for (b = 0; b < c; b++)for (e = 0; e < c - 6; e++)a.isDark(b, e) && !a.isDark(b, e + 1) && a.isDark(b, e +
                        2) && a.isDark(b, e + 3) && a.isDark(b, e + 4) && !a.isDark(b, e + 5) && a.isDark(b, e + 6) && (d += 40); for (e = 0; e < c; e++)for (b = 0; b < c - 6; b++)a.isDark(b, e) && !a.isDark(b + 1, e) && a.isDark(b + 2, e) && a.isDark(b + 3, e) && a.isDark(b + 4, e) && !a.isDark(b + 5, e) && a.isDark(b + 6, e) && (d += 40); for (e = f = 0; e < c; e++)for (b = 0; b < c; b++)a.isDark(b, e) && f++; a = Math.abs(100 * f / c / c - 50) / 5; return d + 10 * a
                }
        }, l = {
            glog: function (a) { if (1 > a) throw Error("glog(" + a + ")"); return l.LOG_TABLE[a] }, gexp: function (a) { for (; 0 > a;)a += 255; for (; 256 <= a;)a -= 255; return l.EXP_TABLE[a] }, EXP_TABLE: Array(256),
            LOG_TABLE: Array(256)
        }, m = 0; 8 > m; m++)l.EXP_TABLE[m] = 1 << m; for (m = 8; 256 > m; m++)l.EXP_TABLE[m] = l.EXP_TABLE[m - 4] ^ l.EXP_TABLE[m - 5] ^ l.EXP_TABLE[m - 6] ^ l.EXP_TABLE[m - 8]; for (m = 0; 255 > m; m++)l.LOG_TABLE[l.EXP_TABLE[m]] = m; q.prototype = {
            get: function (a) { return this.num[a] }, getLength: function () { return this.num.length }, multiply: function (a) { for (var c = Array(this.getLength() + a.getLength() - 1), d = 0; d < this.getLength(); d++)for (var b = 0; b < a.getLength(); b++)c[d + b] ^= l.gexp(l.glog(this.get(d)) + l.glog(a.get(b))); return new q(c, 0) }, mod: function (a) {
                if (0 >
                    this.getLength() - a.getLength()) return this; for (var c = l.glog(this.get(0)) - l.glog(a.get(0)), d = Array(this.getLength()), b = 0; b < this.getLength(); b++)d[b] = this.get(b); for (b = 0; b < a.getLength(); b++)d[b] ^= l.gexp(l.glog(a.get(b)) + c); return (new q(d, 0)).mod(a)
            }
        }; p.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27],
        [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146,
            116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15,
            43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45,
            3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19,
            55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10,
            45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]]; p.getRSBlocks = function (a, c) { var d = p.getRsBlockTable(a, c); if (void 0 == d) throw Error("bad rs block @ typeNumber:" + a + "/errorCorrectLevel:" + c); for (var b = d.length / 3, e = [], f = 0; f < b; f++)for (var h = d[3 * f + 0], g = d[3 * f + 1], j = d[3 * f + 2], l = 0; l < h; l++)e.push(new p(g, j)); return e }; p.getRsBlockTable = function (a, c) {
                switch (c) {
                    case 1: return p.RS_BLOCK_TABLE[4 * (a - 1) + 0]; case 0: return p.RS_BLOCK_TABLE[4 * (a - 1) + 1]; case 3: return p.RS_BLOCK_TABLE[4 *
                        (a - 1) + 2]; case 2: return p.RS_BLOCK_TABLE[4 * (a - 1) + 3]
                }
            }; t.prototype = { get: function (a) { return 1 == (this.buffer[Math.floor(a / 8)] >>> 7 - a % 8 & 1) }, put: function (a, c) { for (var d = 0; d < c; d++)this.putBit(1 == (a >>> c - d - 1 & 1)) }, getLengthInBits: function () { return this.length }, putBit: function (a) { var c = Math.floor(this.length / 8); this.buffer.length <= c && this.buffer.push(0); a && (this.buffer[c] |= 128 >>> this.length % 8); this.length++ } }; "string" === typeof h && (h = { text: h }); h = r.extend({}, {
                render: "canvas", width: 256, height: 256, typeNumber: -1,
                correctLevel: 2, background: "#ffffff", foreground: "#000000"
            }, h); return this.each(function () {
                var a; if ("canvas" == h.render) {
                    a = new o(h.typeNumber, h.correctLevel); a.addData(h.text); a.make(); var c = document.createElement("canvas"); c.width = h.width; c.height = h.height; for (var d = c.getContext("2d"), b = h.width / a.getModuleCount(), e = h.height / a.getModuleCount(), f = 0; f < a.getModuleCount(); f++)for (var i = 0; i < a.getModuleCount(); i++) {
                    d.fillStyle = a.isDark(f, i) ? h.foreground : h.background; var g = Math.ceil((i + 1) * b) - Math.floor(i * b),
                        j = Math.ceil((f + 1) * b) - Math.floor(f * b); d.fillRect(Math.round(i * b), Math.round(f * e), g, j)
                    }
                } else {
                    a = new o(h.typeNumber, h.correctLevel); a.addData(h.text); a.make(); c = r("<table></table>").css("width", h.width + "px").css("height", h.height + "px").css("border", "0px").css("border-collapse", "collapse").css("background-color", h.background); d = h.width / a.getModuleCount(); b = h.height / a.getModuleCount(); for (e = 0; e < a.getModuleCount(); e++) {
                        f = r("<tr></tr>").css("height", b + "px").appendTo(c); for (i = 0; i < a.getModuleCount(); i++)r("<td></td>").css("width",
                            d + "px").css("background-color", a.isDark(e, i) ? h.foreground : h.background).appendTo(f)
                    }
                } a = c; jQuery(a).appendTo(this)
            })
    }
})(jQuery);;
/*
    =====================================
        ::LIVE CHAT POP UP CENTER
    =====================================
*/
function PopupCenter(url, title, w, h) {
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
    width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left );
    // Puts focus on the newWindow  
    if (window.focus) {
        newWindow.focus();
    }
} 



var livechat;
function loadLiveChat(action) {
    try {
        livechat.close();
    } catch (e) {
    }
    livechat = window.open(action,'','width=640,height=400');
}

var lc;
function loadChat(action) {
    try {
        lc.close();
    } catch (e) {
    }
    lc = window.open(action);
}


var account, address, changepass, bankdetail, verifyEmail, verifyPhone, announcement, vipAccess, rewardAccess, selfExclusion, accountDeactivation;
function loadProfile(action, ext, target = "_blank") {
    switch (ext) {
    case 'account':
        try {
            account.close();
        } catch (e) {
        }
        account = window.open(action, target);
        break;
    case 'address':
        try {
            address.close();
        } catch (e) {
        }
        address = window.open(action, target);
        break;
    case 'changepassword':
        try {
            changepass.close();
        } catch (e) {
        }
        changepass = window.open(action, target);
        break;
    case 'bankdetail':
        try {
            bankdetail.close();
        } catch (e) {
        }
        bankdetail = window.open(action, target);
            break;
    case 'verifyEmail':
        try {
            verifyEmail.close();
        } catch (e) {
        }
        verifyEmail = window.open(action, target);
        break;
    case 'verifyPhone':
        try {
            verifyPhone.close();
        } catch (e) {
        }
        verifyPhone = window.open(action, target);
        break;
    case 'announcement':
        try {
            announcement.close();
        } catch (e) { }
        announcement = window.open(action, target);
        break;
    case 'vipAccess':
        try {
            vipAccess.close();
        } catch (e) { }
        vipAccess = window.open(action, target);
        break;
    case 'rewardAccess':
        try {
            rewardAccess.close();
        } catch (e) { }
        rewardAccess = window.open(action, target);
        break;
    case 'selfExclusion':
        try {
            selfExclusion.close();
        } catch (e) { }
        selfExclusion = window.open(action, target);
        break;
    case 'accountDeactivation':
        try {
            accountDeactivation.close();
        } catch (e) { }
        accountDeactivation = window.open(action, target);
        break;
    }
}

var clubace, clubking, clubqueen, clubjack, clubten, clubnine, clubeight;
function loadLiveCasino(action, ext) {
    switch (ext) {
        case 'ace':
            try {
                clubace.close();
            }
            catch (e) { }
            clubace = window.open(action);
            break;
        case 'king':
            try {
                clubking.close();
            }
            catch (e) { }
            clubking = window.open(action);
            break;
        case 'queen':
            try {
                clubqueen.close();
            }
            catch (e) { }
            clubqueen = window.open(action);
            break;
        case 'jack':
            try {
                clubjack.close();
            }
            catch (e) { }
            clubjack = window.open(action);
            break;
        case 'ten':
            try {
                clubten.close();
            }
            catch (e) { }
            clubten = window.open(action);
            break;
        case 'nine':
            try {
                clubnine.close();
            }
            catch (e) { }
            clubnine = window.open(action);
            break;
        case 'eight':
            try {
                clubeight.close();
            }
            catch (e) { }
            clubeight = window.open(action);
            break;
    }
}

var sport, virsport, sportx, virsportx, esportx, mobilesport, sport5, sport247, esports, sabacv, sport3;
function loadSport(action, ext) {
    switch (ext) {
        case 'sport':
            try {
                sport.close();
            } catch (e) {
                //
            }
            sport = window.open(action);
            break;

        case 'virsport':
            try {
                virsport.close();
            } catch (e) {
                //
            }
            virsport = window.open(action);
            break;

        case 'sportx':
            try {
                sportx.close();
            } catch (e) {
                //
            }
            sportx = window.open(action);
            break;

        case 'virsportx':
            try {
                virsportx.close();
            } catch (e) {
                //
            }
            virsportx = window.open(action);
            break;
        case 'esportx':
            try {
                esportx.close();
            } catch (e) {
                //
            }
            esportx = window.open(action);
            break;
        case 'sport5':
        case 'sport365':
            try {
                sport5.close();
            } catch (e) {
                //
            }
            sport5 = window.open(action);
            break;
        case 'sport247':
            try {
                sport247.close();
            } catch (e) {
                //
            }
            sport247 = window.open(action);
            break;
        case 'esports':
            try {
                esports.close();
            } catch (e) {
                //
            }
            esports = window.open(action);
            break;

        case 'mobilesport':
            try {
                mobilesport.close();
            } catch (e) {
                //
            }
            mobilesport = window.open(action + "#qrsports");
            break;
        case 'sabacv':
            try {
                sabacv.close();
            } catch (e) {
                //
            }
            sabacv = window.open(action);
            break;
        case 'sport3':
            try {
                sport3.close();
            } catch (e) {
                //
            }
            sport3 = window.open(action);
            break;
    }
}

var clubkoi, pgslots, kingslots, jackslots, queenslots, tenslots, apslots;
function loadSlots(action, ext) {
    switch (ext) {
        case 'koi':
            try {
                clubkoi.close();
            } catch (e) {}
            clubkoi = window.open(action);
            break;
        case 'king':
            try {
                kingslots.close();
            } catch (e) {}
            kingslots = window.open(action);
            break;
        case 'queen':
            try {
                queenslots.close();
            } catch (e) { }
            queenslots = window.open(action);
            break;
        case 'jack':
            try {
                jackslots.close();
            } catch (e) { }
            jackslots = window.open(action);
            break;
        case 'ten':
            try {
                tenslots.close();
            } catch (e) { }
            tenslots = window.open(action);
            break;
        case 'pg':
            try {
                pgslots.close();
            } catch (e) { }
            pgslots = window.open(action);
            break;
        case 'ap':
            try {
               apslots.close();
            } catch (e) { }
            apslots = window.open(action);
            break;
    }
}

var airfighter, airfighterplay, fishermen, fishermenplay, fishingking, fishingkingplay, liardice, liardiceplay, saba;
function loadGames(action, ext) {
    switch (ext) {
        case 'af':
            try {
                airfighter.close();
            } catch (e) { }
            airfighter = window.open(action);
            break;
        case 'afp':
            try {
                airfighterplay.close();
            } catch (e) { }
            airfighterplay = window.open(action);
            break;
        case 'afpfun':
            try {
                airfighterplay.close();
            } catch (e) { }
            airfighterplay = window.open(action);
            break;
        case 'fg':
            try {
                fishermen.close();
            } catch (e) { }
            fishermen = window.open(action);
            break;
        case 'fgp':
            try {
                fishermenplay.close();
            } catch (e) { }
            fishermenplay = window.open(action);
            break;
        case 'fgpfun':
            try {
                fishermenplay.close();
            } catch (e) { }
            fishermenplay = window.open(action + "?launch=1");
            break;
        case 'fk':
            try {
                fishingking.close();
            } catch (e) { }
            fishingking = window.open(action);
            break;
        case 'fkp':
            try {
                fishingkingplay.close();
            } catch (e) { }
            fishingkingplay = window.open(action);
            break;
        case 'ld':
            try {
                liardice.close();
            } catch (e) { }
            liardice = window.open(action);
            break;
        case 'ldp':
            try {
                liardiceplay.close();
            } catch (e) { }
            liardiceplay = window.open(action);
            break;
        case 'ldpfun':
            try {
                liardiceplay.close();
            } catch (e) { }
            liardiceplay = window.open(action + "?launch=1");
            break;
        case 'saba':
            try {
                saba.close();
            } catch (e) { }
            saba = window.open(action);
            break;
    }
}

var keno, ilotto, sicbo, pk10, sevenstar, lucky5, sealottery, superlottery;
function loadLottery(action, ext) {
    switch (ext) {
        case 'keno':
            try {
                keno.close();
            } catch (e) {}
            keno = window.open(action);
            break;
        case 'iLotto':
            try {
                ilotto.close();
            } catch (e) {}
            ilotto = window.open(action);
            break;
        case 'sicbo':
            try {
                sicbo.close();
            } catch (e) { }
            sicbo = window.open(action);
            break;
        case 'p3':
            try {
                pk10.close();
            } catch (e) { }
            p3 = window.open(action);
            break;
        case 'numbergame':
            try {
                sportx.close();
            } catch (e) { }
            numbergame = window.open(action);
            break;
        case 'lucky5':
            try {
                sportx.close();
            } catch (e) { }
            lucky5 = window.open(action);
            break;
        case 'sealottery':
            try {
                sportx.close();
            } catch (e) { }
            sealottery = window.open(action);
            break;
        case 'superlottery':
            try {
                sportx.close();
            } catch (e) { }
            superlottery = window.open(action);
            break;
        case 'sevenstar':
            try {
                sportx.close();
            } catch (e) { }
            sevenstar = window.open(action);
            break;

            
            
            
            





    }
}

var deposit, transfer, withdraw, history, reward, historyVir;
function loadPayment(action, ext, target = '_blank') {
    switch (ext) {
    case 'deposit':
        try {
            deposit.close();
        } catch (e) {
        }
        deposit = window.open(action, target);
        break;
    case 'transfer':
        try {
            transfer.close();
        } catch (e) {
        }
        transfer = window.open(action, target);
        break;
    case 'withdraw':
        try {
            withdraw.close();
        } catch (e) {
        }
        withdraw = window.open(action, target);
        break;
    case 'history':
        try {
            history.close();
        } catch (e) {
        }
        history = window.open(action, target);
        break;
    case 'reward':
        try {
            reward.close();
        } catch (e) {
        }
        reward = window.open(action, target);
        break;
    case 'historyVirtual':
        try {
            historyVir.close();
        } catch (e) {
        }
        historyVir = window.open(action, target);
        break;

    }
};
/**
 * Number.isInteger() polyfill
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 */
if (!Number.isInteger) {
    Number.isInteger = function isInteger(nVal) {
        return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
    };
}
/**
 * It converts a numeric value to words.
 * @class
 * @public
 * @constructor
* @param {String} localeName
*/
var T2W = function (localeName) {
    var type = localeName, translator;

    // error if the constructor doesn't exist
    if (typeof T2W[type] !== "function") {
        throw {
            name: "Error",
            message: "Locale with name '" + type + "' doesn't exist."
        };
    }

    translator = new T2W[type]();
    translator._tokenLength = T2W[type].TOKEN_LENGTH | T2W.DEFAULT_TOKEN_LENGTH;

    // Extends
    // Copy prototype methods from T2W to translator object
    for (var key in T2W.prototype) {
        if (T2W.prototype.hasOwnProperty(key)) {
            if (translator[key] !== 'function') {
                T2W[type].prototype[key] = T2W.prototype[key];
            }
        }
    }

    return translator;
};

/**
* Numeral system
* @constant
 * @type {number}
    */
T2W.RADIX = 10;

/**
 * Default token length
 * @constant
* @type {number}
 */
T2W.DEFAULT_TOKEN_LENGTH = 1;


/**
 * Single index
 * @constant
* @type {number}
 */
T2W.SINGLE_INDEX = 0;

/**
 * Ten index
 * @constant
* @type {number}
 */
T2W.TEN_INDEX = 1;

/**
 * Hundred index
 * @constant
* @type {number}
 */
T2W.HUNDRED_INDEX = 2;

/**
 * Translate number to words
 * @public
* @param {integer} value
* @return{string}
 * @example
 * this.toWords( 1234 )
 * // one thousand two hundred thirty four
 */
T2W.prototype.toWords = function (number) {

    if (typeof this.translate != 'function') {
        throw {
            name: "Error",
            message: "The function 'translate' is not implemented."
        };
    }

    return this.translate(this.tokenize(number, this._tokenLength));
};

/**
* Split number to tokens
 * @param {number} number
 * @param {number} tokenLength - count of numbers in one token
 * @return {Array}
    * @example
    * this.tokenize( 1234, 1 ); // [4,3,2,1]
    * this.tokenize( 1234, 2 ); // [34,12]
    * this.tokenize( 1234, 3 ); // [234,1]
    */
T2W.prototype.tokenize = function (number, tokenLength) {

    if (!Number.isInteger(number)) {
        throw {
            name: "NumberFormatExceprion",
            message: "'" + number + "' is not Integer."
        };
    }

    if (number === 0) {
        return [0];
    }

    var tokens = [];
    var base = Math.pow(T2W.RADIX, tokenLength);
    while (number) {
        tokens.push(number % base);
        number = parseInt(number / base, T2W.RADIX);
    }
    return tokens;
};




/**
* en_US locale
* @constructor
*/
T2W.EN_US = function () { };

/**
 * Translator dictionary
 * @constant
* @type {Object}
*/
T2W.EN_US.DICTIONARY = {
    zero: "zero",
    ones: ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"],
    teens: ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"],
    tens: ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"],
    hundred: "hundred",
    radix: ["", "thousand", "million"],
    delimiters: ["-", "and"]
};

/**
 * Token length
 * @constant
 * @type {number}
    */
T2W.EN_US.TOKEN_LENGTH = 3;

/**
 * Max numbers for this locale
 * @constant
* @type {number}
 */
T2W.EN_US.MAX_NUMBERS = 9;

/**
 * Translate numbers to words
 * @public
* @param {array} numbers
* @param {number} index
* @return {string}
 */
T2W.EN_US.prototype.translate = function (numbers) {

    // Check max value	
    if (numbers.length * T2W.EN_US.TOKEN_LENGTH > T2W.EN_US.MAX_NUMBERS) {
        throw {
            name: "Error",
            message: "The length of numbers is longer than the maximum value(" + T2W.EN_US.MAX_NUMBERS + ")."
        };
    }

    // Deal with zero value
    if (numbers[T2W.SINGLE_INDEX] === 0 && numbers.length === 1) {
        return T2W.EN_US.DICTIONARY.zero;
    }

    var words = [];
    for (var idx = 0, max = numbers.length; idx < max; idx++) {
        words.unshift(this._getTrio(this.tokenize(numbers[idx], 1), idx, max));
    }

    return words.join("");
};

/**
 * Converts first three numbers to words.
 * @private
 * It solves exceptions in the English language.
 * @param {Array} numbers
 * @param {number} index
 * @param {number} max - length of tokens
 * @return {string}
    */
T2W.EN_US.prototype._getTrio = function (numbers, index, max) {
    var hundred = '';
    var ten = '';
    var single = '';
    var radix = this._getRadix(numbers, index);

    if (numbers[T2W.HUNDRED_INDEX]) {
        hundred = numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX]
            ? this._getOnes(numbers[T2W.HUNDRED_INDEX]) + " " + T2W.EN_US.DICTIONARY.hundred + ' ' + T2W.EN_US.DICTIONARY.delimiters[1] + ' '
            : this._getOnes(numbers[T2W.HUNDRED_INDEX]) + " " + T2W.EN_US.DICTIONARY.hundred;
    }

    if (numbers[T2W.TEN_INDEX]) {
        ten = this._getTeens(numbers[T2W.SINGLE_INDEX]);
    }

    if (numbers[T2W.TEN_INDEX] >= 2) {
        ten = numbers[T2W.SINGLE_INDEX]
            ? this._getTens(numbers[T2W.TEN_INDEX]) + T2W.EN_US.DICTIONARY.delimiters[0] + this._getOnes(numbers[T2W.SINGLE_INDEX])
            : this._getTens(numbers[T2W.TEN_INDEX]);
    }

    if (!numbers[T2W.TEN_INDEX]) {
        single = this._getOnes(numbers[T2W.SINGLE_INDEX]);
    }

    if (index + 1 < max && (numbers[T2W.HUNDRED_INDEX] || numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX])) {
        hundred = ' ' + hundred;
    }

    if (index === 0 && index + 1 < max && !numbers[T2W.HUNDRED_INDEX] && (numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX])) {
        hundred = ' ' + T2W.EN_US.DICTIONARY.delimiters[1] + ' ';
    }

    return hundred + ten + single + radix;
};

/**
 * Get ones
 * helper method to access the dictionary
 * @private
 * @param {number} number
 * @param {number} index
 * @return {string}
    */
T2W.EN_US.prototype._getOnes = function (number) {
    return T2W.EN_US.DICTIONARY.ones[number];
};

/**
 * Get tens
 * helper method to access the dictionary
 * @private
 * @param {number} number
 * @return {string}
    */
T2W.EN_US.prototype._getTens = function (number) {
    return T2W.EN_US.DICTIONARY.tens[number];
};

/**
 * Get teens
 * helper method to access the dictionary
 * @private
 * @param {number} number
 * @return {string}
    */
T2W.EN_US.prototype._getTeens = function (number) {
    return T2W.EN_US.DICTIONARY.teens[number];
};

/**
 * Get radix
 * convert radix to words
 * @private
 * @param {Array} numbers
 * @param {number} index
 * @return {string}
    */
T2W.EN_US.prototype._getRadix = function (numbers, index) {
    var radix = '';
    if (index > 0 && (numbers[T2W.HUNDRED_INDEX] || numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX])) {
        radix = ' ' + T2W.EN_US.DICTIONARY.radix[index];
    }

    return radix;
};

/**
 * id_ID locale
 * @constructor
 */
T2W.ID_ID = function () { };

/**
 * Translator dictionary
 * @constant
* @type {Object}
*/
T2W.ID_ID.DICTIONARY = {
    zero: "nol",
    ones: ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"],
    teens: ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"],
    tens: ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh", "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"],
    hundred: "ratus",
    radix: ["", "ribu", "juta"],
    delimiters: [" ", '']
};

/**
 * Token length
 * @constant
 * @type {number}
    */
T2W.ID_ID.TOKEN_LENGTH = 3;

/**
 * Max numbers for this locale
 * @constant
* @type {number}
 */
T2W.ID_ID.MAX_NUMBERS = 9;

/**
 * Translate numbers to words
 * @public
* @param {array} numbers
* @param {number} index
* @return {string}
 */
T2W.ID_ID.prototype.translate = function (numbers) {

    // Check max value	
    if (numbers.length * T2W.ID_ID.TOKEN_LENGTH > T2W.ID_ID.MAX_NUMBERS) {
        throw {
            name: "Error",
            message: "The length of numbers is longer than the maximum value(" + T2W.ID_ID.MAX_NUMBERS + ")."
        };
    }

    // Deal with zero value
    if (numbers[T2W.SINGLE_INDEX] === 0 && numbers.length === 1) {
        return T2W.ID_ID.DICTIONARY.zero;
    }

    var words = [];
    for (var idx = 0, max = numbers.length; idx < max; idx++) {
        words.unshift(this._getTrio(this.tokenize(numbers[idx], 1), idx, max));
    }

    return words.join("");
};

/**
 * Converts first three numbers to words.
 * @private
 * It solves exceptions in the English language.
 * @param {Array} numbers
 * @param {number} index
 * @param {number} max - length of tokens
 * @return {string}
    */
T2W.ID_ID.prototype._getTrio = function (numbers, index, max) {
    var hundred = '';
    var ten = '';
    var single = '';
    var radix = this._getRadix(numbers, index);

    if (numbers[T2W.HUNDRED_INDEX]) {
        hundredPrefix = numbers[T2W.HUNDRED_INDEX] > 1 ? this._getOnes(numbers[T2W.HUNDRED_INDEX]) + " " : "se"

        hundred = numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX]
            ? hundredPrefix + T2W.ID_ID.DICTIONARY.hundred + ' '
            : hundredPrefix + T2W.ID_ID.DICTIONARY.hundred;
    }

    if (numbers[T2W.TEN_INDEX]) {
        ten = this._getTeens(numbers[T2W.SINGLE_INDEX]);
    }

    if (numbers[T2W.TEN_INDEX] >= 2) {
        ten = numbers[T2W.SINGLE_INDEX]
            ? this._getTens(numbers[T2W.TEN_INDEX]) + T2W.ID_ID.DICTIONARY.delimiters[0] + this._getOnes(numbers[T2W.SINGLE_INDEX])
            : this._getTens(numbers[T2W.TEN_INDEX]);
    }

    if (!numbers[T2W.TEN_INDEX]) {
        if (index == max - 1 && max == 2) {
            if (numbers[T2W.SINGLE_INDEX] == 1) {
                single = 'se';
                radix = radix.replace(' ', '');
            }
            else single = this._getOnes(numbers[T2W.SINGLE_INDEX]);
        } else {
            single = this._getOnes(numbers[T2W.SINGLE_INDEX]);
        }
    }

    if (index + 1 < max && (numbers[T2W.HUNDRED_INDEX] || numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX])) {
        hundred = ' ' + hundred;
    }

    if (index === 0 && index + 1 < max && !numbers[T2W.HUNDRED_INDEX] && (numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX])) {
        hundred = ' ';
    }

    return hundred + ten + single + radix;
};

/**
 * Get ones
 * helper method to access the dictionary
 * @private
 * @param {number} number
 * @param {number} index
 * @return {string}
    */
T2W.ID_ID.prototype._getOnes = function (number) {
    return T2W.ID_ID.DICTIONARY.ones[number];
};

/**
 * Get tens
 * helper method to access the dictionary
 * @private
 * @param {number} number
 * @return {string}
    */
T2W.ID_ID.prototype._getTens = function (number) {
    return T2W.ID_ID.DICTIONARY.tens[number];
};

/**
 * Get teens
 * helper method to access the dictionary
 * @private
 * @param {number} number
 * @return {string}
    */
T2W.ID_ID.prototype._getTeens = function (number) {
    return T2W.ID_ID.DICTIONARY.teens[number];
};

/**
 * Get radix
 * convert radix to words
 * @private
 * @param {Array} numbers
 * @param {number} index
 * @return {string}
    */
T2W.ID_ID.prototype._getRadix = function (numbers, index) {
    var radix = '';
    if (index > 0 && (numbers[T2W.HUNDRED_INDEX] || numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX])) {
        radix = ' ' + T2W.ID_ID.DICTIONARY.radix[index];
    }

    return radix;
};



/**
 * vi_VN locale
 * @constructor
 */
T2W.VI_VN = function () { };

/**
 * Translator dictionary
 * @constant
* @type {Object}
*/
T2W.VI_VN.DICTIONARY = {
    zero: "không",
    ones: ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"],
    teens: ["mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười năm", "mười sáu", "mười bảy", "mười tám", "mười chín"],
    tens: ["", "", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"],
    hundred: "trăm",
    radix: ["", "nghìn", "triệu"],
    delimiters: [" ", ""]
};

/**
 * Token length
 * @constant
 * @type {number}
    */
T2W.VI_VN.TOKEN_LENGTH = 3;

/**
 * Max numbers for this locale
 * @constant
* @type {number}
 */
T2W.VI_VN.MAX_NUMBERS = 9;

/**
 * Translate numbers to words
 * @public
* @param {array} numbers
* @param {number} index
* @return {string}
 */
T2W.VI_VN.prototype.translate = function (numbers) {

    // Check max value	
    if (numbers.length * T2W.VI_VN.TOKEN_LENGTH > T2W.VI_VN.MAX_NUMBERS) {
        throw {
            name: "Error",
            message: "The length of numbers is longer than the maximum value(" + T2W.VI_VN.MAX_NUMBERS + ")."
        };
    }

    // Deal with zero value
    if (numbers[T2W.SINGLE_INDEX] === 0 && numbers.length === 1) {
        return T2W.VI_VN.DICTIONARY.zero;
    }

    var words = [];
    for (var idx = 0, max = numbers.length; idx < max; idx++) {
        words.unshift(this._getTrio(this.tokenize(numbers[idx], 1), idx, max));
    }

    return words.join("");
};

/**
 * Converts first three numbers to words.
 * @private
 * It solves exceptions in the English language.
 * @param {Array} numbers
 * @param {number} index
 * @param {number} max - length of tokens
 * @return {string}
    */
T2W.VI_VN.prototype._getTrio = function (numbers, index, max) {
    var hundred = '';
    var ten = '';
    var single = '';
    var radix = this._getRadix(numbers, index);

    if (numbers[T2W.HUNDRED_INDEX]) {
        hundred = numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX]
            ? this._getOnes(numbers[T2W.HUNDRED_INDEX]) + " " + T2W.VI_VN.DICTIONARY.hundred + ' ' + T2W.VI_VN.DICTIONARY.delimiters[1] + ' '
            : this._getOnes(numbers[T2W.HUNDRED_INDEX]) + " " + T2W.VI_VN.DICTIONARY.hundred;
    }

    if (numbers[T2W.TEN_INDEX]) {
        ten = this._getTeens(numbers[T2W.SINGLE_INDEX]);
    }

    if (numbers[T2W.TEN_INDEX] >= 2) {
        ten = numbers[T2W.SINGLE_INDEX]
            ? this._getTens(numbers[T2W.TEN_INDEX]) + T2W.VI_VN.DICTIONARY.delimiters[0] + this._getOnes(numbers[T2W.SINGLE_INDEX])
            : this._getTens(numbers[T2W.TEN_INDEX]);
    }

    if (!numbers[T2W.TEN_INDEX]) {
        single = this._getOnes(numbers[T2W.SINGLE_INDEX]);
    }

    if (index + 1 < max && (numbers[T2W.HUNDRED_INDEX] || numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX])) {
        hundred = ' ' + hundred;
    }

    if (index === 0 && index + 1 < max && !numbers[T2W.HUNDRED_INDEX] && (numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX])) {
        hundred = ' ' + T2W.VI_VN.DICTIONARY.delimiters[1] + ' ';
    }

    return hundred + ten + single + radix;
};

/**
 * Get ones
 * helper method to access the dictionary
 * @private
 * @param {number} number
 * @param {number} index
 * @return {string}
    */
T2W.VI_VN.prototype._getOnes = function (number) {
    return T2W.VI_VN.DICTIONARY.ones[number];
};

/**
 * Get tens
 * helper method to access the dictionary
 * @private
 * @param {number} number
 * @return {string}
    */
T2W.VI_VN.prototype._getTens = function (number) {
    return T2W.VI_VN.DICTIONARY.tens[number];
};

/**
 * Get teens
 * helper method to access the dictionary
 * @private
 * @param {number} number
 * @return {string}
    */
T2W.VI_VN.prototype._getTeens = function (number) {
    return T2W.VI_VN.DICTIONARY.teens[number];
};

/**
 * Get radix
 * convert radix to words
 * @private
 * @param {Array} numbers
 * @param {number} index
 * @return {string}
    */
T2W.VI_VN.prototype._getRadix = function (numbers, index) {
    var radix = '';
    if (index > 0 && (numbers[T2W.HUNDRED_INDEX] || numbers[T2W.TEN_INDEX] || numbers[T2W.SINGLE_INDEX])) {
        radix = ' ' + T2W.VI_VN.DICTIONARY.radix[index];
    }

    return radix;
};


// Node exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = T2W;
}

;
/*! jQuery UI - v1.13.2 - 2022-07-14
* http://jqueryui.com
* Includes: widget.js, position.js, data.js, disable-selection.js, effect.js, effects/effect-blind.js, effects/effect-bounce.js, effects/effect-clip.js, effects/effect-drop.js, effects/effect-explode.js, effects/effect-fade.js, effects/effect-fold.js, effects/effect-highlight.js, effects/effect-puff.js, effects/effect-pulsate.js, effects/effect-scale.js, effects/effect-shake.js, effects/effect-size.js, effects/effect-slide.js, effects/effect-transfer.js, focusable.js, form-reset-mixin.js, jquery-patch.js, keycode.js, labels.js, scroll-parent.js, tabbable.js, unique-id.js, widgets/accordion.js, widgets/autocomplete.js, widgets/button.js, widgets/checkboxradio.js, widgets/controlgroup.js, widgets/datepicker.js, widgets/dialog.js, widgets/draggable.js, widgets/droppable.js, widgets/menu.js, widgets/mouse.js, widgets/progressbar.js, widgets/resizable.js, widgets/selectable.js, widgets/selectmenu.js, widgets/slider.js, widgets/sortable.js, widgets/spinner.js, widgets/tabs.js, widgets/tooltip.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

!function (t) { "use strict"; "function" == typeof define && define.amd ? define(["jquery"], t) : t(jQuery) }(function (V) { "use strict"; V.ui = V.ui || {}; V.ui.version = "1.13.2"; var n, i = 0, a = Array.prototype.hasOwnProperty, r = Array.prototype.slice; V.cleanData = (n = V.cleanData, function (t) { for (var e, i, s = 0; null != (i = t[s]); s++)(e = V._data(i, "events")) && e.remove && V(i).triggerHandler("remove"); n(t) }), V.widget = function (t, i, e) { var s, n, o, a = {}, r = t.split(".")[0], l = r + "-" + (t = t.split(".")[1]); return e || (e = i, i = V.Widget), Array.isArray(e) && (e = V.extend.apply(null, [{}].concat(e))), V.expr.pseudos[l.toLowerCase()] = function (t) { return !!V.data(t, l) }, V[r] = V[r] || {}, s = V[r][t], n = V[r][t] = function (t, e) { if (!this || !this._createWidget) return new n(t, e); arguments.length && this._createWidget(t, e) }, V.extend(n, s, { version: e.version, _proto: V.extend({}, e), _childConstructors: [] }), (o = new i).options = V.widget.extend({}, o.options), V.each(e, function (e, s) { function n() { return i.prototype[e].apply(this, arguments) } function o(t) { return i.prototype[e].apply(this, t) } a[e] = "function" == typeof s ? function () { var t, e = this._super, i = this._superApply; return this._super = n, this._superApply = o, t = s.apply(this, arguments), this._super = e, this._superApply = i, t } : s }), n.prototype = V.widget.extend(o, { widgetEventPrefix: s && o.widgetEventPrefix || t }, a, { constructor: n, namespace: r, widgetName: t, widgetFullName: l }), s ? (V.each(s._childConstructors, function (t, e) { var i = e.prototype; V.widget(i.namespace + "." + i.widgetName, n, e._proto) }), delete s._childConstructors) : i._childConstructors.push(n), V.widget.bridge(t, n), n }, V.widget.extend = function (t) { for (var e, i, s = r.call(arguments, 1), n = 0, o = s.length; n < o; n++)for (e in s[n]) i = s[n][e], a.call(s[n], e) && void 0 !== i && (V.isPlainObject(i) ? t[e] = V.isPlainObject(t[e]) ? V.widget.extend({}, t[e], i) : V.widget.extend({}, i) : t[e] = i); return t }, V.widget.bridge = function (o, e) { var a = e.prototype.widgetFullName || o; V.fn[o] = function (i) { var t = "string" == typeof i, s = r.call(arguments, 1), n = this; return t ? this.length || "instance" !== i ? this.each(function () { var t, e = V.data(this, a); return "instance" === i ? (n = e, !1) : e ? "function" != typeof e[i] || "_" === i.charAt(0) ? V.error("no such method '" + i + "' for " + o + " widget instance") : (t = e[i].apply(e, s)) !== e && void 0 !== t ? (n = t && t.jquery ? n.pushStack(t.get()) : t, !1) : void 0 : V.error("cannot call methods on " + o + " prior to initialization; attempted to call method '" + i + "'") }) : n = void 0 : (s.length && (i = V.widget.extend.apply(null, [i].concat(s))), this.each(function () { var t = V.data(this, a); t ? (t.option(i || {}), t._init && t._init()) : V.data(this, a, new e(i, this)) })), n } }, V.Widget = function () { }, V.Widget._childConstructors = [], V.Widget.prototype = { widgetName: "widget", widgetEventPrefix: "", defaultElement: "<div>", options: { classes: {}, disabled: !1, create: null }, _createWidget: function (t, e) { e = V(e || this.defaultElement || this)[0], this.element = V(e), this.uuid = i++ , this.eventNamespace = "." + this.widgetName + this.uuid, this.bindings = V(), this.hoverable = V(), this.focusable = V(), this.classesElementLookup = {}, e !== this && (V.data(e, this.widgetFullName, this), this._on(!0, this.element, { remove: function (t) { t.target === e && this.destroy() } }), this.document = V(e.style ? e.ownerDocument : e.document || e), this.window = V(this.document[0].defaultView || this.document[0].parentWindow)), this.options = V.widget.extend({}, this.options, this._getCreateOptions(), t), this._create(), this.options.disabled && this._setOptionDisabled(this.options.disabled), this._trigger("create", null, this._getCreateEventData()), this._init() }, _getCreateOptions: function () { return {} }, _getCreateEventData: V.noop, _create: V.noop, _init: V.noop, destroy: function () { var i = this; this._destroy(), V.each(this.classesElementLookup, function (t, e) { i._removeClass(e, t) }), this.element.off(this.eventNamespace).removeData(this.widgetFullName), this.widget().off(this.eventNamespace).removeAttr("aria-disabled"), this.bindings.off(this.eventNamespace) }, _destroy: V.noop, widget: function () { return this.element }, option: function (t, e) { var i, s, n, o = t; if (0 === arguments.length) return V.widget.extend({}, this.options); if ("string" == typeof t) if (o = {}, t = (i = t.split(".")).shift(), i.length) { for (s = o[t] = V.widget.extend({}, this.options[t]), n = 0; n < i.length - 1; n++)s[i[n]] = s[i[n]] || {}, s = s[i[n]]; if (t = i.pop(), 1 === arguments.length) return void 0 === s[t] ? null : s[t]; s[t] = e } else { if (1 === arguments.length) return void 0 === this.options[t] ? null : this.options[t]; o[t] = e } return this._setOptions(o), this }, _setOptions: function (t) { for (var e in t) this._setOption(e, t[e]); return this }, _setOption: function (t, e) { return "classes" === t && this._setOptionClasses(e), this.options[t] = e, "disabled" === t && this._setOptionDisabled(e), this }, _setOptionClasses: function (t) { var e, i, s; for (e in t) s = this.classesElementLookup[e], t[e] !== this.options.classes[e] && s && s.length && (i = V(s.get()), this._removeClass(s, e), i.addClass(this._classes({ element: i, keys: e, classes: t, add: !0 }))) }, _setOptionDisabled: function (t) { this._toggleClass(this.widget(), this.widgetFullName + "-disabled", null, !!t), t && (this._removeClass(this.hoverable, null, "ui-state-hover"), this._removeClass(this.focusable, null, "ui-state-focus")) }, enable: function () { return this._setOptions({ disabled: !1 }) }, disable: function () { return this._setOptions({ disabled: !0 }) }, _classes: function (n) { var o = [], a = this; function t(t, e) { for (var i, s = 0; s < t.length; s++)i = a.classesElementLookup[t[s]] || V(), i = n.add ? (function () { var i = []; n.element.each(function (t, e) { V.map(a.classesElementLookup, function (t) { return t }).some(function (t) { return t.is(e) }) || i.push(e) }), a._on(V(i), { remove: "_untrackClassesElement" }) }(), V(V.uniqueSort(i.get().concat(n.element.get())))) : V(i.not(n.element).get()), a.classesElementLookup[t[s]] = i, o.push(t[s]), e && n.classes[t[s]] && o.push(n.classes[t[s]]) } return (n = V.extend({ element: this.element, classes: this.options.classes || {} }, n)).keys && t(n.keys.match(/\S+/g) || [], !0), n.extra && t(n.extra.match(/\S+/g) || []), o.join(" ") }, _untrackClassesElement: function (i) { var s = this; V.each(s.classesElementLookup, function (t, e) { -1 !== V.inArray(i.target, e) && (s.classesElementLookup[t] = V(e.not(i.target).get())) }), this._off(V(i.target)) }, _removeClass: function (t, e, i) { return this._toggleClass(t, e, i, !1) }, _addClass: function (t, e, i) { return this._toggleClass(t, e, i, !0) }, _toggleClass: function (t, e, i, s) { var n = "string" == typeof t || null === t, i = { extra: n ? e : i, keys: n ? t : e, element: n ? this.element : t, add: s = "boolean" == typeof s ? s : i }; return i.element.toggleClass(this._classes(i), s), this }, _on: function (n, o, t) { var a, r = this; "boolean" != typeof n && (t = o, o = n, n = !1), t ? (o = a = V(o), this.bindings = this.bindings.add(o)) : (t = o, o = this.element, a = this.widget()), V.each(t, function (t, e) { function i() { if (n || !0 !== r.options.disabled && !V(this).hasClass("ui-state-disabled")) return ("string" == typeof e ? r[e] : e).apply(r, arguments) } "string" != typeof e && (i.guid = e.guid = e.guid || i.guid || V.guid++); var s = t.match(/^([\w:-]*)\s*(.*)$/), t = s[1] + r.eventNamespace, s = s[2]; s ? a.on(t, s, i) : o.on(t, i) }) }, _off: function (t, e) { e = (e || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace, t.off(e), this.bindings = V(this.bindings.not(t).get()), this.focusable = V(this.focusable.not(t).get()), this.hoverable = V(this.hoverable.not(t).get()) }, _delay: function (t, e) { var i = this; return setTimeout(function () { return ("string" == typeof t ? i[t] : t).apply(i, arguments) }, e || 0) }, _hoverable: function (t) { this.hoverable = this.hoverable.add(t), this._on(t, { mouseenter: function (t) { this._addClass(V(t.currentTarget), null, "ui-state-hover") }, mouseleave: function (t) { this._removeClass(V(t.currentTarget), null, "ui-state-hover") } }) }, _focusable: function (t) { this.focusable = this.focusable.add(t), this._on(t, { focusin: function (t) { this._addClass(V(t.currentTarget), null, "ui-state-focus") }, focusout: function (t) { this._removeClass(V(t.currentTarget), null, "ui-state-focus") } }) }, _trigger: function (t, e, i) { var s, n, o = this.options[t]; if (i = i || {}, (e = V.Event(e)).type = (t === this.widgetEventPrefix ? t : this.widgetEventPrefix + t).toLowerCase(), e.target = this.element[0], n = e.originalEvent) for (s in n) s in e || (e[s] = n[s]); return this.element.trigger(e, i), !("function" == typeof o && !1 === o.apply(this.element[0], [e].concat(i)) || e.isDefaultPrevented()) } }, V.each({ show: "fadeIn", hide: "fadeOut" }, function (o, a) { V.Widget.prototype["_" + o] = function (e, t, i) { var s, n = (t = "string" == typeof t ? { effect: t } : t) ? !0 !== t && "number" != typeof t && t.effect || a : o; "number" == typeof (t = t || {}) ? t = { duration: t } : !0 === t && (t = {}), s = !V.isEmptyObject(t), t.complete = i, t.delay && e.delay(t.delay), s && V.effects && V.effects.effect[n] ? e[o](t) : n !== o && e[n] ? e[n](t.duration, t.easing, i) : e.queue(function (t) { V(this)[o](), i && i.call(e[0]), t() }) } }); var s, x, k, o, l, h, c, u, C; V.widget; function D(t, e, i) { return [parseFloat(t[0]) * (u.test(t[0]) ? e / 100 : 1), parseFloat(t[1]) * (u.test(t[1]) ? i / 100 : 1)] } function I(t, e) { return parseInt(V.css(t, e), 10) || 0 } function T(t) { return null != t && t === t.window } x = Math.max, k = Math.abs, o = /left|center|right/, l = /top|center|bottom/, h = /[\+\-]\d+(\.[\d]+)?%?/, c = /^\w+/, u = /%$/, C = V.fn.position, V.position = { scrollbarWidth: function () { if (void 0 !== s) return s; var t, e = V("<div style='display:block;position:absolute;width:200px;height:200px;overflow:hidden;'><div style='height:300px;width:auto;'></div></div>"), i = e.children()[0]; return V("body").append(e), t = i.offsetWidth, e.css("overflow", "scroll"), t === (i = i.offsetWidth) && (i = e[0].clientWidth), e.remove(), s = t - i }, getScrollInfo: function (t) { var e = t.isWindow || t.isDocument ? "" : t.element.css("overflow-x"), i = t.isWindow || t.isDocument ? "" : t.element.css("overflow-y"), e = "scroll" === e || "auto" === e && t.width < t.element[0].scrollWidth; return { width: "scroll" === i || "auto" === i && t.height < t.element[0].scrollHeight ? V.position.scrollbarWidth() : 0, height: e ? V.position.scrollbarWidth() : 0 } }, getWithinInfo: function (t) { var e = V(t || window), i = T(e[0]), s = !!e[0] && 9 === e[0].nodeType; return { element: e, isWindow: i, isDocument: s, offset: !i && !s ? V(t).offset() : { left: 0, top: 0 }, scrollLeft: e.scrollLeft(), scrollTop: e.scrollTop(), width: e.outerWidth(), height: e.outerHeight() } } }, V.fn.position = function (u) { if (!u || !u.of) return C.apply(this, arguments); var d, p, f, g, m, t, _ = "string" == typeof (u = V.extend({}, u)).of ? V(document).find(u.of) : V(u.of), v = V.position.getWithinInfo(u.within), b = V.position.getScrollInfo(v), y = (u.collision || "flip").split(" "), w = {}, e = 9 === (t = (e = _)[0]).nodeType ? { width: e.width(), height: e.height(), offset: { top: 0, left: 0 } } : T(t) ? { width: e.width(), height: e.height(), offset: { top: e.scrollTop(), left: e.scrollLeft() } } : t.preventDefault ? { width: 0, height: 0, offset: { top: t.pageY, left: t.pageX } } : { width: e.outerWidth(), height: e.outerHeight(), offset: e.offset() }; return _[0].preventDefault && (u.at = "left top"), p = e.width, f = e.height, m = V.extend({}, g = e.offset), V.each(["my", "at"], function () { var t, e, i = (u[this] || "").split(" "); (i = 1 === i.length ? o.test(i[0]) ? i.concat(["center"]) : l.test(i[0]) ? ["center"].concat(i) : ["center", "center"] : i)[0] = o.test(i[0]) ? i[0] : "center", i[1] = l.test(i[1]) ? i[1] : "center", t = h.exec(i[0]), e = h.exec(i[1]), w[this] = [t ? t[0] : 0, e ? e[0] : 0], u[this] = [c.exec(i[0])[0], c.exec(i[1])[0]] }), 1 === y.length && (y[1] = y[0]), "right" === u.at[0] ? m.left += p : "center" === u.at[0] && (m.left += p / 2), "bottom" === u.at[1] ? m.top += f : "center" === u.at[1] && (m.top += f / 2), d = D(w.at, p, f), m.left += d[0], m.top += d[1], this.each(function () { var i, t, a = V(this), r = a.outerWidth(), l = a.outerHeight(), e = I(this, "marginLeft"), s = I(this, "marginTop"), n = r + e + I(this, "marginRight") + b.width, o = l + s + I(this, "marginBottom") + b.height, h = V.extend({}, m), c = D(w.my, a.outerWidth(), a.outerHeight()); "right" === u.my[0] ? h.left -= r : "center" === u.my[0] && (h.left -= r / 2), "bottom" === u.my[1] ? h.top -= l : "center" === u.my[1] && (h.top -= l / 2), h.left += c[0], h.top += c[1], i = { marginLeft: e, marginTop: s }, V.each(["left", "top"], function (t, e) { V.ui.position[y[t]] && V.ui.position[y[t]][e](h, { targetWidth: p, targetHeight: f, elemWidth: r, elemHeight: l, collisionPosition: i, collisionWidth: n, collisionHeight: o, offset: [d[0] + c[0], d[1] + c[1]], my: u.my, at: u.at, within: v, elem: a }) }), u.using && (t = function (t) { var e = g.left - h.left, i = e + p - r, s = g.top - h.top, n = s + f - l, o = { target: { element: _, left: g.left, top: g.top, width: p, height: f }, element: { element: a, left: h.left, top: h.top, width: r, height: l }, horizontal: i < 0 ? "left" : 0 < e ? "right" : "center", vertical: n < 0 ? "top" : 0 < s ? "bottom" : "middle" }; p < r && k(e + i) < p && (o.horizontal = "center"), f < l && k(s + n) < f && (o.vertical = "middle"), x(k(e), k(i)) > x(k(s), k(n)) ? o.important = "horizontal" : o.important = "vertical", u.using.call(this, t, o) }), a.offset(V.extend(h, { using: t })) }) }, V.ui.position = { fit: { left: function (t, e) { var i = e.within, s = i.isWindow ? i.scrollLeft : i.offset.left, n = i.width, o = t.left - e.collisionPosition.marginLeft, a = s - o, r = o + e.collisionWidth - n - s; e.collisionWidth > n ? 0 < a && r <= 0 ? (i = t.left + a + e.collisionWidth - n - s, t.left += a - i) : t.left = !(0 < r && a <= 0) && r < a ? s + n - e.collisionWidth : s : 0 < a ? t.left += a : 0 < r ? t.left -= r : t.left = x(t.left - o, t.left) }, top: function (t, e) { var i = e.within, s = i.isWindow ? i.scrollTop : i.offset.top, n = e.within.height, o = t.top - e.collisionPosition.marginTop, a = s - o, r = o + e.collisionHeight - n - s; e.collisionHeight > n ? 0 < a && r <= 0 ? (i = t.top + a + e.collisionHeight - n - s, t.top += a - i) : t.top = !(0 < r && a <= 0) && r < a ? s + n - e.collisionHeight : s : 0 < a ? t.top += a : 0 < r ? t.top -= r : t.top = x(t.top - o, t.top) } }, flip: { left: function (t, e) { var i = e.within, s = i.offset.left + i.scrollLeft, n = i.width, o = i.isWindow ? i.scrollLeft : i.offset.left, a = t.left - e.collisionPosition.marginLeft, r = a - o, l = a + e.collisionWidth - n - o, h = "left" === e.my[0] ? -e.elemWidth : "right" === e.my[0] ? e.elemWidth : 0, i = "left" === e.at[0] ? e.targetWidth : "right" === e.at[0] ? -e.targetWidth : 0, a = -2 * e.offset[0]; r < 0 ? ((s = t.left + h + i + a + e.collisionWidth - n - s) < 0 || s < k(r)) && (t.left += h + i + a) : 0 < l && (0 < (o = t.left - e.collisionPosition.marginLeft + h + i + a - o) || k(o) < l) && (t.left += h + i + a) }, top: function (t, e) { var i = e.within, s = i.offset.top + i.scrollTop, n = i.height, o = i.isWindow ? i.scrollTop : i.offset.top, a = t.top - e.collisionPosition.marginTop, r = a - o, l = a + e.collisionHeight - n - o, h = "top" === e.my[1] ? -e.elemHeight : "bottom" === e.my[1] ? e.elemHeight : 0, i = "top" === e.at[1] ? e.targetHeight : "bottom" === e.at[1] ? -e.targetHeight : 0, a = -2 * e.offset[1]; r < 0 ? ((s = t.top + h + i + a + e.collisionHeight - n - s) < 0 || s < k(r)) && (t.top += h + i + a) : 0 < l && (0 < (o = t.top - e.collisionPosition.marginTop + h + i + a - o) || k(o) < l) && (t.top += h + i + a) } }, flipfit: { left: function () { V.ui.position.flip.left.apply(this, arguments), V.ui.position.fit.left.apply(this, arguments) }, top: function () { V.ui.position.flip.top.apply(this, arguments), V.ui.position.fit.top.apply(this, arguments) } } }; V.ui.position, V.extend(V.expr.pseudos, { data: V.expr.createPseudo ? V.expr.createPseudo(function (e) { return function (t) { return !!V.data(t, e) } }) : function (t, e, i) { return !!V.data(t, i[3]) } }), V.fn.extend({ disableSelection: (t = "onselectstart" in document.createElement("div") ? "selectstart" : "mousedown", function () { return this.on(t + ".ui-disableSelection", function (t) { t.preventDefault() }) }), enableSelection: function () { return this.off(".ui-disableSelection") } }); var t, d = V, p = {}, e = p.toString, f = /^([\-+])=\s*(\d+\.?\d*)/, g = [{ re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/, parse: function (t) { return [t[1], t[2], t[3], t[4]] } }, { re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/, parse: function (t) { return [2.55 * t[1], 2.55 * t[2], 2.55 * t[3], t[4]] } }, { re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?/, parse: function (t) { return [parseInt(t[1], 16), parseInt(t[2], 16), parseInt(t[3], 16), t[4] ? (parseInt(t[4], 16) / 255).toFixed(2) : 1] } }, { re: /#([a-f0-9])([a-f0-9])([a-f0-9])([a-f0-9])?/, parse: function (t) { return [parseInt(t[1] + t[1], 16), parseInt(t[2] + t[2], 16), parseInt(t[3] + t[3], 16), t[4] ? (parseInt(t[4] + t[4], 16) / 255).toFixed(2) : 1] } }, { re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/, space: "hsla", parse: function (t) { return [t[1], t[2] / 100, t[3] / 100, t[4]] } }], m = d.Color = function (t, e, i, s) { return new d.Color.fn.parse(t, e, i, s) }, _ = { rgba: { props: { red: { idx: 0, type: "byte" }, green: { idx: 1, type: "byte" }, blue: { idx: 2, type: "byte" } } }, hsla: { props: { hue: { idx: 0, type: "degrees" }, saturation: { idx: 1, type: "percent" }, lightness: { idx: 2, type: "percent" } } } }, v = { byte: { floor: !0, max: 255 }, percent: { max: 1 }, degrees: { mod: 360, floor: !0 } }, b = m.support = {}, y = d("<p>")[0], w = d.each; function P(t) { return null == t ? t + "" : "object" == typeof t ? p[e.call(t)] || "object" : typeof t } function M(t, e, i) { var s = v[e.type] || {}; return null == t ? i || !e.def ? null : e.def : (t = s.floor ? ~~t : parseFloat(t), isNaN(t) ? e.def : s.mod ? (t + s.mod) % s.mod : Math.min(s.max, Math.max(0, t))) } function S(s) { var n = m(), o = n._rgba = []; return s = s.toLowerCase(), w(g, function (t, e) { var i = e.re.exec(s), i = i && e.parse(i), e = e.space || "rgba"; if (i) return i = n[e](i), n[_[e].cache] = i[_[e].cache], o = n._rgba = i._rgba, !1 }), o.length ? ("0,0,0,0" === o.join() && d.extend(o, B.transparent), n) : B[s] } function H(t, e, i) { return 6 * (i = (i + 1) % 1) < 1 ? t + (e - t) * i * 6 : 2 * i < 1 ? e : 3 * i < 2 ? t + (e - t) * (2 / 3 - i) * 6 : t } y.style.cssText = "background-color:rgba(1,1,1,.5)", b.rgba = -1 < y.style.backgroundColor.indexOf("rgba"), w(_, function (t, e) { e.cache = "_" + t, e.props.alpha = { idx: 3, type: "percent", def: 1 } }), d.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function (t, e) { p["[object " + e + "]"] = e.toLowerCase() }), (m.fn = d.extend(m.prototype, { parse: function (n, t, e, i) { if (void 0 === n) return this._rgba = [null, null, null, null], this; (n.jquery || n.nodeType) && (n = d(n).css(t), t = void 0); var o = this, s = P(n), a = this._rgba = []; return void 0 !== t && (n = [n, t, e, i], s = "array"), "string" === s ? this.parse(S(n) || B._default) : "array" === s ? (w(_.rgba.props, function (t, e) { a[e.idx] = M(n[e.idx], e) }), this) : "object" === s ? (w(_, n instanceof m ? function (t, e) { n[e.cache] && (o[e.cache] = n[e.cache].slice()) } : function (t, i) { var s = i.cache; w(i.props, function (t, e) { if (!o[s] && i.to) { if ("alpha" === t || null == n[t]) return; o[s] = i.to(o._rgba) } o[s][e.idx] = M(n[t], e, !0) }), o[s] && d.inArray(null, o[s].slice(0, 3)) < 0 && (null == o[s][3] && (o[s][3] = 1), i.from && (o._rgba = i.from(o[s]))) }), this) : void 0 }, is: function (t) { var n = m(t), o = !0, a = this; return w(_, function (t, e) { var i, s = n[e.cache]; return s && (i = a[e.cache] || e.to && e.to(a._rgba) || [], w(e.props, function (t, e) { if (null != s[e.idx]) return o = s[e.idx] === i[e.idx] })), o }), o }, _space: function () { var i = [], s = this; return w(_, function (t, e) { s[e.cache] && i.push(t) }), i.pop() }, transition: function (t, a) { var e = (h = m(t))._space(), i = _[e], t = 0 === this.alpha() ? m("transparent") : this, r = t[i.cache] || i.to(t._rgba), l = r.slice(), h = h[i.cache]; return w(i.props, function (t, e) { var i = e.idx, s = r[i], n = h[i], o = v[e.type] || {}; null !== n && (null === s ? l[i] = n : (o.mod && (n - s > o.mod / 2 ? s += o.mod : s - n > o.mod / 2 && (s -= o.mod)), l[i] = M((n - s) * a + s, e))) }), this[e](l) }, blend: function (t) { if (1 === this._rgba[3]) return this; var e = this._rgba.slice(), i = e.pop(), s = m(t)._rgba; return m(d.map(e, function (t, e) { return (1 - i) * s[e] + i * t })) }, toRgbaString: function () { var t = "rgba(", e = d.map(this._rgba, function (t, e) { return null != t ? t : 2 < e ? 1 : 0 }); return 1 === e[3] && (e.pop(), t = "rgb("), t + e.join() + ")" }, toHslaString: function () { var t = "hsla(", e = d.map(this.hsla(), function (t, e) { return null == t && (t = 2 < e ? 1 : 0), t = e && e < 3 ? Math.round(100 * t) + "%" : t }); return 1 === e[3] && (e.pop(), t = "hsl("), t + e.join() + ")" }, toHexString: function (t) { var e = this._rgba.slice(), i = e.pop(); return t && e.push(~~(255 * i)), "#" + d.map(e, function (t) { return 1 === (t = (t || 0).toString(16)).length ? "0" + t : t }).join("") }, toString: function () { return 0 === this._rgba[3] ? "transparent" : this.toRgbaString() } })).parse.prototype = m.fn, _.hsla.to = function (t) { if (null == t[0] || null == t[1] || null == t[2]) return [null, null, null, t[3]]; var e = t[0] / 255, i = t[1] / 255, s = t[2] / 255, n = t[3], o = Math.max(e, i, s), a = Math.min(e, i, s), r = o - a, l = o + a, t = .5 * l, i = a === o ? 0 : e === o ? 60 * (i - s) / r + 360 : i === o ? 60 * (s - e) / r + 120 : 60 * (e - i) / r + 240, l = 0 == r ? 0 : t <= .5 ? r / l : r / (2 - l); return [Math.round(i) % 360, l, t, null == n ? 1 : n] }, _.hsla.from = function (t) { if (null == t[0] || null == t[1] || null == t[2]) return [null, null, null, t[3]]; var e = t[0] / 360, i = t[1], s = t[2], t = t[3], i = s <= .5 ? s * (1 + i) : s + i - s * i, s = 2 * s - i; return [Math.round(255 * H(s, i, e + 1 / 3)), Math.round(255 * H(s, i, e)), Math.round(255 * H(s, i, e - 1 / 3)), t] }, w(_, function (l, t) { var e = t.props, o = t.cache, a = t.to, r = t.from; m.fn[l] = function (t) { if (a && !this[o] && (this[o] = a(this._rgba)), void 0 === t) return this[o].slice(); var i = P(t), s = "array" === i || "object" === i ? t : arguments, n = this[o].slice(); return w(e, function (t, e) { t = s["object" === i ? t : e.idx]; null == t && (t = n[e.idx]), n[e.idx] = M(t, e) }), r ? ((t = m(r(n)))[o] = n, t) : m(n) }, w(e, function (a, r) { m.fn[a] || (m.fn[a] = function (t) { var e, i = P(t), s = "alpha" === a ? this._hsla ? "hsla" : "rgba" : l, n = this[s](), o = n[r.idx]; return "undefined" === i ? o : ("function" === i && (i = P(t = t.call(this, o))), null == t && r.empty ? this : ("string" === i && (e = f.exec(t)) && (t = o + parseFloat(e[2]) * ("+" === e[1] ? 1 : -1)), n[r.idx] = t, this[s](n))) }) }) }), (m.hook = function (t) { t = t.split(" "); w(t, function (t, o) { d.cssHooks[o] = { set: function (t, e) { var i, s, n = ""; if ("transparent" !== e && ("string" !== P(e) || (i = S(e)))) { if (e = m(i || e), !b.rgba && 1 !== e._rgba[3]) { for (s = "backgroundColor" === o ? t.parentNode : t; ("" === n || "transparent" === n) && s && s.style;)try { n = d.css(s, "backgroundColor"), s = s.parentNode } catch (t) { } e = e.blend(n && "transparent" !== n ? n : "_default") } e = e.toRgbaString() } try { t.style[o] = e } catch (t) { } } }, d.fx.step[o] = function (t) { t.colorInit || (t.start = m(t.elem, o), t.end = m(t.end), t.colorInit = !0), d.cssHooks[o].set(t.elem, t.start.transition(t.end, t.pos)) } }) })("backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor"), d.cssHooks.borderColor = { expand: function (i) { var s = {}; return w(["Top", "Right", "Bottom", "Left"], function (t, e) { s["border" + e + "Color"] = i }), s } }; var z, A, O, N, E, W, F, L, R, Y, B = d.Color.names = { aqua: "#00ffff", black: "#000000", blue: "#0000ff", fuchsia: "#ff00ff", gray: "#808080", green: "#008000", lime: "#00ff00", maroon: "#800000", navy: "#000080", olive: "#808000", purple: "#800080", red: "#ff0000", silver: "#c0c0c0", teal: "#008080", white: "#ffffff", yellow: "#ffff00", transparent: [null, null, null, 0], _default: "#ffffff" }, j = "ui-effects-", q = "ui-effects-style", K = "ui-effects-animated"; function U(t) { var e, i, s = t.ownerDocument.defaultView ? t.ownerDocument.defaultView.getComputedStyle(t, null) : t.currentStyle, n = {}; if (s && s.length && s[0] && s[s[0]]) for (i = s.length; i--;)"string" == typeof s[e = s[i]] && (n[e.replace(/-([\da-z])/gi, function (t, e) { return e.toUpperCase() })] = s[e]); else for (e in s) "string" == typeof s[e] && (n[e] = s[e]); return n } function X(t, e, i, s) { return t = { effect: t = V.isPlainObject(t) ? (e = t).effect : t }, "function" == typeof (e = null == e ? {} : e) && (s = e, i = null, e = {}), "number" != typeof e && !V.fx.speeds[e] || (s = i, i = e, e = {}), "function" == typeof i && (s = i, i = null), e && V.extend(t, e), i = i || e.duration, t.duration = V.fx.off ? 0 : "number" == typeof i ? i : i in V.fx.speeds ? V.fx.speeds[i] : V.fx.speeds._default, t.complete = s || e.complete, t } function $(t) { return !t || "number" == typeof t || V.fx.speeds[t] || ("string" == typeof t && !V.effects.effect[t] || ("function" == typeof t || "object" == typeof t && !t.effect)) } function G(t, e) { var i = e.outerWidth(), e = e.outerHeight(), t = /^rect\((-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto)\)$/.exec(t) || ["", 0, i, e, 0]; return { top: parseFloat(t[1]) || 0, right: "auto" === t[2] ? i : parseFloat(t[2]), bottom: "auto" === t[3] ? e : parseFloat(t[3]), left: parseFloat(t[4]) || 0 } } V.effects = { effect: {} }, N = ["add", "remove", "toggle"], E = { border: 1, borderBottom: 1, borderColor: 1, borderLeft: 1, borderRight: 1, borderTop: 1, borderWidth: 1, margin: 1, padding: 1 }, V.each(["borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle"], function (t, e) { V.fx.step[e] = function (t) { ("none" !== t.end && !t.setAttr || 1 === t.pos && !t.setAttr) && (d.style(t.elem, e, t.end), t.setAttr = !0) } }), V.fn.addBack || (V.fn.addBack = function (t) { return this.add(null == t ? this.prevObject : this.prevObject.filter(t)) }), V.effects.animateClass = function (n, t, e, i) { var o = V.speed(t, e, i); return this.queue(function () { var i = V(this), t = i.attr("class") || "", e = (e = o.children ? i.find("*").addBack() : i).map(function () { return { el: V(this), start: U(this) } }), s = function () { V.each(N, function (t, e) { n[e] && i[e + "Class"](n[e]) }) }; s(), e = e.map(function () { return this.end = U(this.el[0]), this.diff = function (t, e) { var i, s, n = {}; for (i in e) s = e[i], t[i] !== s && (E[i] || !V.fx.step[i] && isNaN(parseFloat(s)) || (n[i] = s)); return n }(this.start, this.end), this }), i.attr("class", t), e = e.map(function () { var t = this, e = V.Deferred(), i = V.extend({}, o, { queue: !1, complete: function () { e.resolve(t) } }); return this.el.animate(this.diff, i), e.promise() }), V.when.apply(V, e.get()).done(function () { s(), V.each(arguments, function () { var e = this.el; V.each(this.diff, function (t) { e.css(t, "") }) }), o.complete.call(i[0]) }) }) }, V.fn.extend({ addClass: (O = V.fn.addClass, function (t, e, i, s) { return e ? V.effects.animateClass.call(this, { add: t }, e, i, s) : O.apply(this, arguments) }), removeClass: (A = V.fn.removeClass, function (t, e, i, s) { return 1 < arguments.length ? V.effects.animateClass.call(this, { remove: t }, e, i, s) : A.apply(this, arguments) }), toggleClass: (z = V.fn.toggleClass, function (t, e, i, s, n) { return "boolean" == typeof e || void 0 === e ? i ? V.effects.animateClass.call(this, e ? { add: t } : { remove: t }, i, s, n) : z.apply(this, arguments) : V.effects.animateClass.call(this, { toggle: t }, e, i, s) }), switchClass: function (t, e, i, s, n) { return V.effects.animateClass.call(this, { add: e, remove: t }, i, s, n) } }), V.expr && V.expr.pseudos && V.expr.pseudos.animated && (V.expr.pseudos.animated = (W = V.expr.pseudos.animated, function (t) { return !!V(t).data(K) || W(t) })), !1 !== V.uiBackCompat && V.extend(V.effects, { save: function (t, e) { for (var i = 0, s = e.length; i < s; i++)null !== e[i] && t.data(j + e[i], t[0].style[e[i]]) }, restore: function (t, e) { for (var i, s = 0, n = e.length; s < n; s++)null !== e[s] && (i = t.data(j + e[s]), t.css(e[s], i)) }, setMode: function (t, e) { return e = "toggle" === e ? t.is(":hidden") ? "show" : "hide" : e }, createWrapper: function (i) { if (i.parent().is(".ui-effects-wrapper")) return i.parent(); var s = { width: i.outerWidth(!0), height: i.outerHeight(!0), float: i.css("float") }, t = V("<div></div>").addClass("ui-effects-wrapper").css({ fontSize: "100%", background: "transparent", border: "none", margin: 0, padding: 0 }), e = { width: i.width(), height: i.height() }, n = document.activeElement; try { n.id } catch (t) { n = document.body } return i.wrap(t), i[0] !== n && !V.contains(i[0], n) || V(n).trigger("focus"), t = i.parent(), "static" === i.css("position") ? (t.css({ position: "relative" }), i.css({ position: "relative" })) : (V.extend(s, { position: i.css("position"), zIndex: i.css("z-index") }), V.each(["top", "left", "bottom", "right"], function (t, e) { s[e] = i.css(e), isNaN(parseInt(s[e], 10)) && (s[e] = "auto") }), i.css({ position: "relative", top: 0, left: 0, right: "auto", bottom: "auto" })), i.css(e), t.css(s).show() }, removeWrapper: function (t) { var e = document.activeElement; return t.parent().is(".ui-effects-wrapper") && (t.parent().replaceWith(t), t[0] !== e && !V.contains(t[0], e) || V(e).trigger("focus")), t } }), V.extend(V.effects, { version: "1.13.2", define: function (t, e, i) { return i || (i = e, e = "effect"), V.effects.effect[t] = i, V.effects.effect[t].mode = e, i }, scaledDimensions: function (t, e, i) { if (0 === e) return { height: 0, width: 0, outerHeight: 0, outerWidth: 0 }; var s = "horizontal" !== i ? (e || 100) / 100 : 1, e = "vertical" !== i ? (e || 100) / 100 : 1; return { height: t.height() * e, width: t.width() * s, outerHeight: t.outerHeight() * e, outerWidth: t.outerWidth() * s } }, clipToBox: function (t) { return { width: t.clip.right - t.clip.left, height: t.clip.bottom - t.clip.top, left: t.clip.left, top: t.clip.top } }, unshift: function (t, e, i) { var s = t.queue(); 1 < e && s.splice.apply(s, [1, 0].concat(s.splice(e, i))), t.dequeue() }, saveStyle: function (t) { t.data(q, t[0].style.cssText) }, restoreStyle: function (t) { t[0].style.cssText = t.data(q) || "", t.removeData(q) }, mode: function (t, e) { t = t.is(":hidden"); return "toggle" === e && (e = t ? "show" : "hide"), e = (t ? "hide" === e : "show" === e) ? "none" : e }, getBaseline: function (t, e) { var i, s; switch (t[0]) { case "top": i = 0; break; case "middle": i = .5; break; case "bottom": i = 1; break; default: i = t[0] / e.height }switch (t[1]) { case "left": s = 0; break; case "center": s = .5; break; case "right": s = 1; break; default: s = t[1] / e.width }return { x: s, y: i } }, createPlaceholder: function (t) { var e, i = t.css("position"), s = t.position(); return t.css({ marginTop: t.css("marginTop"), marginBottom: t.css("marginBottom"), marginLeft: t.css("marginLeft"), marginRight: t.css("marginRight") }).outerWidth(t.outerWidth()).outerHeight(t.outerHeight()), /^(static|relative)/.test(i) && (i = "absolute", e = V("<" + t[0].nodeName + ">").insertAfter(t).css({ display: /^(inline|ruby)/.test(t.css("display")) ? "inline-block" : "block", visibility: "hidden", marginTop: t.css("marginTop"), marginBottom: t.css("marginBottom"), marginLeft: t.css("marginLeft"), marginRight: t.css("marginRight"), float: t.css("float") }).outerWidth(t.outerWidth()).outerHeight(t.outerHeight()).addClass("ui-effects-placeholder"), t.data(j + "placeholder", e)), t.css({ position: i, left: s.left, top: s.top }), e }, removePlaceholder: function (t) { var e = j + "placeholder", i = t.data(e); i && (i.remove(), t.removeData(e)) }, cleanUp: function (t) { V.effects.restoreStyle(t), V.effects.removePlaceholder(t) }, setTransition: function (s, t, n, o) { return o = o || {}, V.each(t, function (t, e) { var i = s.cssUnit(e); 0 < i[0] && (o[e] = i[0] * n + i[1]) }), o } }), V.fn.extend({ effect: function () { function t(t) { var e = V(this), i = V.effects.mode(e, r) || o; e.data(K, !0), l.push(i), o && ("show" === i || i === o && "hide" === i) && e.show(), o && "none" === i || V.effects.saveStyle(e), "function" == typeof t && t() } var s = X.apply(this, arguments), n = V.effects.effect[s.effect], o = n.mode, e = s.queue, i = e || "fx", a = s.complete, r = s.mode, l = []; return V.fx.off || !n ? r ? this[r](s.duration, a) : this.each(function () { a && a.call(this) }) : !1 === e ? this.each(t).each(h) : this.queue(i, t).queue(i, h); function h(t) { var e = V(this); function i() { "function" == typeof a && a.call(e[0]), "function" == typeof t && t() } s.mode = l.shift(), !1 === V.uiBackCompat || o ? "none" === s.mode ? (e[r](), i()) : n.call(e[0], s, function () { e.removeData(K), V.effects.cleanUp(e), "hide" === s.mode && e.hide(), i() }) : (e.is(":hidden") ? "hide" === r : "show" === r) ? (e[r](), i()) : n.call(e[0], s, i) } }, show: (R = V.fn.show, function (t) { if ($(t)) return R.apply(this, arguments); t = X.apply(this, arguments); return t.mode = "show", this.effect.call(this, t) }), hide: (L = V.fn.hide, function (t) { if ($(t)) return L.apply(this, arguments); t = X.apply(this, arguments); return t.mode = "hide", this.effect.call(this, t) }), toggle: (F = V.fn.toggle, function (t) { if ($(t) || "boolean" == typeof t) return F.apply(this, arguments); t = X.apply(this, arguments); return t.mode = "toggle", this.effect.call(this, t) }), cssUnit: function (t) { var i = this.css(t), s = []; return V.each(["em", "px", "%", "pt"], function (t, e) { 0 < i.indexOf(e) && (s = [parseFloat(i), e]) }), s }, cssClip: function (t) { return t ? this.css("clip", "rect(" + t.top + "px " + t.right + "px " + t.bottom + "px " + t.left + "px)") : G(this.css("clip"), this) }, transfer: function (t, e) { var i = V(this), s = V(t.to), n = "fixed" === s.css("position"), o = V("body"), a = n ? o.scrollTop() : 0, r = n ? o.scrollLeft() : 0, o = s.offset(), o = { top: o.top - a, left: o.left - r, height: s.innerHeight(), width: s.innerWidth() }, s = i.offset(), l = V("<div class='ui-effects-transfer'></div>"); l.appendTo("body").addClass(t.className).css({ top: s.top - a, left: s.left - r, height: i.innerHeight(), width: i.innerWidth(), position: n ? "fixed" : "absolute" }).animate(o, t.duration, t.easing, function () { l.remove(), "function" == typeof e && e() }) } }), V.fx.step.clip = function (t) { t.clipInit || (t.start = V(t.elem).cssClip(), "string" == typeof t.end && (t.end = G(t.end, t.elem)), t.clipInit = !0), V(t.elem).cssClip({ top: t.pos * (t.end.top - t.start.top) + t.start.top, right: t.pos * (t.end.right - t.start.right) + t.start.right, bottom: t.pos * (t.end.bottom - t.start.bottom) + t.start.bottom, left: t.pos * (t.end.left - t.start.left) + t.start.left }) }, Y = {}, V.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (e, t) { Y[t] = function (t) { return Math.pow(t, e + 2) } }), V.extend(Y, { Sine: function (t) { return 1 - Math.cos(t * Math.PI / 2) }, Circ: function (t) { return 1 - Math.sqrt(1 - t * t) }, Elastic: function (t) { return 0 === t || 1 === t ? t : -Math.pow(2, 8 * (t - 1)) * Math.sin((80 * (t - 1) - 7.5) * Math.PI / 15) }, Back: function (t) { return t * t * (3 * t - 2) }, Bounce: function (t) { for (var e, i = 4; t < ((e = Math.pow(2, --i)) - 1) / 11;); return 1 / Math.pow(4, 3 - i) - 7.5625 * Math.pow((3 * e - 2) / 22 - t, 2) } }), V.each(Y, function (t, e) { V.easing["easeIn" + t] = e, V.easing["easeOut" + t] = function (t) { return 1 - e(1 - t) }, V.easing["easeInOut" + t] = function (t) { return t < .5 ? e(2 * t) / 2 : 1 - e(-2 * t + 2) / 2 } }); y = V.effects, V.effects.define("blind", "hide", function (t, e) { var i = { up: ["bottom", "top"], vertical: ["bottom", "top"], down: ["top", "bottom"], left: ["right", "left"], horizontal: ["right", "left"], right: ["left", "right"] }, s = V(this), n = t.direction || "up", o = s.cssClip(), a = { clip: V.extend({}, o) }, r = V.effects.createPlaceholder(s); a.clip[i[n][0]] = a.clip[i[n][1]], "show" === t.mode && (s.cssClip(a.clip), r && r.css(V.effects.clipToBox(a)), a.clip = o), r && r.animate(V.effects.clipToBox(a), t.duration, t.easing), s.animate(a, { queue: !1, duration: t.duration, easing: t.easing, complete: e }) }), V.effects.define("bounce", function (t, e) { var i, s, n = V(this), o = t.mode, a = "hide" === o, r = "show" === o, l = t.direction || "up", h = t.distance, c = t.times || 5, o = 2 * c + (r || a ? 1 : 0), u = t.duration / o, d = t.easing, p = "up" === l || "down" === l ? "top" : "left", f = "up" === l || "left" === l, g = 0, t = n.queue().length; for (V.effects.createPlaceholder(n), l = n.css(p), h = h || n["top" == p ? "outerHeight" : "outerWidth"]() / 3, r && ((s = { opacity: 1 })[p] = l, n.css("opacity", 0).css(p, f ? 2 * -h : 2 * h).animate(s, u, d)), a && (h /= Math.pow(2, c - 1)), (s = {})[p] = l; g < c; g++)(i = {})[p] = (f ? "-=" : "+=") + h, n.animate(i, u, d).animate(s, u, d), h = a ? 2 * h : h / 2; a && ((i = { opacity: 0 })[p] = (f ? "-=" : "+=") + h, n.animate(i, u, d)), n.queue(e), V.effects.unshift(n, t, 1 + o) }), V.effects.define("clip", "hide", function (t, e) { var i = {}, s = V(this), n = t.direction || "vertical", o = "both" === n, a = o || "horizontal" === n, o = o || "vertical" === n, n = s.cssClip(); i.clip = { top: o ? (n.bottom - n.top) / 2 : n.top, right: a ? (n.right - n.left) / 2 : n.right, bottom: o ? (n.bottom - n.top) / 2 : n.bottom, left: a ? (n.right - n.left) / 2 : n.left }, V.effects.createPlaceholder(s), "show" === t.mode && (s.cssClip(i.clip), i.clip = n), s.animate(i, { queue: !1, duration: t.duration, easing: t.easing, complete: e }) }), V.effects.define("drop", "hide", function (t, e) { var i = V(this), s = "show" === t.mode, n = t.direction || "left", o = "up" === n || "down" === n ? "top" : "left", a = "up" === n || "left" === n ? "-=" : "+=", r = "+=" == a ? "-=" : "+=", l = { opacity: 0 }; V.effects.createPlaceholder(i), n = t.distance || i["top" == o ? "outerHeight" : "outerWidth"](!0) / 2, l[o] = a + n, s && (i.css(l), l[o] = r + n, l.opacity = 1), i.animate(l, { queue: !1, duration: t.duration, easing: t.easing, complete: e }) }), V.effects.define("explode", "hide", function (t, e) { var i, s, n, o, a, r, l = t.pieces ? Math.round(Math.sqrt(t.pieces)) : 3, h = l, c = V(this), u = "show" === t.mode, d = c.show().css("visibility", "hidden").offset(), p = Math.ceil(c.outerWidth() / h), f = Math.ceil(c.outerHeight() / l), g = []; function m() { g.push(this), g.length === l * h && (c.css({ visibility: "visible" }), V(g).remove(), e()) } for (i = 0; i < l; i++)for (o = d.top + i * f, r = i - (l - 1) / 2, s = 0; s < h; s++)n = d.left + s * p, a = s - (h - 1) / 2, c.clone().appendTo("body").wrap("<div></div>").css({ position: "absolute", visibility: "visible", left: -s * p, top: -i * f }).parent().addClass("ui-effects-explode").css({ position: "absolute", overflow: "hidden", width: p, height: f, left: n + (u ? a * p : 0), top: o + (u ? r * f : 0), opacity: u ? 0 : 1 }).animate({ left: n + (u ? 0 : a * p), top: o + (u ? 0 : r * f), opacity: u ? 1 : 0 }, t.duration || 500, t.easing, m) }), V.effects.define("fade", "toggle", function (t, e) { var i = "show" === t.mode; V(this).css("opacity", i ? 0 : 1).animate({ opacity: i ? 1 : 0 }, { queue: !1, duration: t.duration, easing: t.easing, complete: e }) }), V.effects.define("fold", "hide", function (e, t) { var i = V(this), s = e.mode, n = "show" === s, o = "hide" === s, a = e.size || 15, r = /([0-9]+)%/.exec(a), l = !!e.horizFirst ? ["right", "bottom"] : ["bottom", "right"], h = e.duration / 2, c = V.effects.createPlaceholder(i), u = i.cssClip(), d = { clip: V.extend({}, u) }, p = { clip: V.extend({}, u) }, f = [u[l[0]], u[l[1]]], s = i.queue().length; r && (a = parseInt(r[1], 10) / 100 * f[o ? 0 : 1]), d.clip[l[0]] = a, p.clip[l[0]] = a, p.clip[l[1]] = 0, n && (i.cssClip(p.clip), c && c.css(V.effects.clipToBox(p)), p.clip = u), i.queue(function (t) { c && c.animate(V.effects.clipToBox(d), h, e.easing).animate(V.effects.clipToBox(p), h, e.easing), t() }).animate(d, h, e.easing).animate(p, h, e.easing).queue(t), V.effects.unshift(i, s, 4) }), V.effects.define("highlight", "show", function (t, e) { var i = V(this), s = { backgroundColor: i.css("backgroundColor") }; "hide" === t.mode && (s.opacity = 0), V.effects.saveStyle(i), i.css({ backgroundImage: "none", backgroundColor: t.color || "#ffff99" }).animate(s, { queue: !1, duration: t.duration, easing: t.easing, complete: e }) }), V.effects.define("size", function (s, e) { var n, i = V(this), t = ["fontSize"], o = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"], a = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"], r = s.mode, l = "effect" !== r, h = s.scale || "both", c = s.origin || ["middle", "center"], u = i.css("position"), d = i.position(), p = V.effects.scaledDimensions(i), f = s.from || p, g = s.to || V.effects.scaledDimensions(i, 0); V.effects.createPlaceholder(i), "show" === r && (r = f, f = g, g = r), n = { from: { y: f.height / p.height, x: f.width / p.width }, to: { y: g.height / p.height, x: g.width / p.width } }, "box" !== h && "both" !== h || (n.from.y !== n.to.y && (f = V.effects.setTransition(i, o, n.from.y, f), g = V.effects.setTransition(i, o, n.to.y, g)), n.from.x !== n.to.x && (f = V.effects.setTransition(i, a, n.from.x, f), g = V.effects.setTransition(i, a, n.to.x, g))), "content" !== h && "both" !== h || n.from.y !== n.to.y && (f = V.effects.setTransition(i, t, n.from.y, f), g = V.effects.setTransition(i, t, n.to.y, g)), c && (c = V.effects.getBaseline(c, p), f.top = (p.outerHeight - f.outerHeight) * c.y + d.top, f.left = (p.outerWidth - f.outerWidth) * c.x + d.left, g.top = (p.outerHeight - g.outerHeight) * c.y + d.top, g.left = (p.outerWidth - g.outerWidth) * c.x + d.left), delete f.outerHeight, delete f.outerWidth, i.css(f), "content" !== h && "both" !== h || (o = o.concat(["marginTop", "marginBottom"]).concat(t), a = a.concat(["marginLeft", "marginRight"]), i.find("*[width]").each(function () { var t = V(this), e = V.effects.scaledDimensions(t), i = { height: e.height * n.from.y, width: e.width * n.from.x, outerHeight: e.outerHeight * n.from.y, outerWidth: e.outerWidth * n.from.x }, e = { height: e.height * n.to.y, width: e.width * n.to.x, outerHeight: e.height * n.to.y, outerWidth: e.width * n.to.x }; n.from.y !== n.to.y && (i = V.effects.setTransition(t, o, n.from.y, i), e = V.effects.setTransition(t, o, n.to.y, e)), n.from.x !== n.to.x && (i = V.effects.setTransition(t, a, n.from.x, i), e = V.effects.setTransition(t, a, n.to.x, e)), l && V.effects.saveStyle(t), t.css(i), t.animate(e, s.duration, s.easing, function () { l && V.effects.restoreStyle(t) }) })), i.animate(g, { queue: !1, duration: s.duration, easing: s.easing, complete: function () { var t = i.offset(); 0 === g.opacity && i.css("opacity", f.opacity), l || (i.css("position", "static" === u ? "relative" : u).offset(t), V.effects.saveStyle(i)), e() } }) }), V.effects.define("scale", function (t, e) { var i = V(this), s = t.mode, s = parseInt(t.percent, 10) || (0 === parseInt(t.percent, 10) || "effect" !== s ? 0 : 100), s = V.extend(!0, { from: V.effects.scaledDimensions(i), to: V.effects.scaledDimensions(i, s, t.direction || "both"), origin: t.origin || ["middle", "center"] }, t); t.fade && (s.from.opacity = 1, s.to.opacity = 0), V.effects.effect.size.call(this, s, e) }), V.effects.define("puff", "hide", function (t, e) { t = V.extend(!0, {}, t, { fade: !0, percent: parseInt(t.percent, 10) || 150 }); V.effects.effect.scale.call(this, t, e) }), V.effects.define("pulsate", "show", function (t, e) { var i = V(this), s = t.mode, n = "show" === s, o = 2 * (t.times || 5) + (n || "hide" === s ? 1 : 0), a = t.duration / o, r = 0, l = 1, s = i.queue().length; for (!n && i.is(":visible") || (i.css("opacity", 0).show(), r = 1); l < o; l++)i.animate({ opacity: r }, a, t.easing), r = 1 - r; i.animate({ opacity: r }, a, t.easing), i.queue(e), V.effects.unshift(i, s, 1 + o) }), V.effects.define("shake", function (t, e) { var i = 1, s = V(this), n = t.direction || "left", o = t.distance || 20, a = t.times || 3, r = 2 * a + 1, l = Math.round(t.duration / r), h = "up" === n || "down" === n ? "top" : "left", c = "up" === n || "left" === n, u = {}, d = {}, p = {}, n = s.queue().length; for (V.effects.createPlaceholder(s), u[h] = (c ? "-=" : "+=") + o, d[h] = (c ? "+=" : "-=") + 2 * o, p[h] = (c ? "-=" : "+=") + 2 * o, s.animate(u, l, t.easing); i < a; i++)s.animate(d, l, t.easing).animate(p, l, t.easing); s.animate(d, l, t.easing).animate(u, l / 2, t.easing).queue(e), V.effects.unshift(s, n, 1 + r) }), V.effects.define("slide", "show", function (t, e) { var i, s, n = V(this), o = { up: ["bottom", "top"], down: ["top", "bottom"], left: ["right", "left"], right: ["left", "right"] }, a = t.mode, r = t.direction || "left", l = "up" === r || "down" === r ? "top" : "left", h = "up" === r || "left" === r, c = t.distance || n["top" == l ? "outerHeight" : "outerWidth"](!0), u = {}; V.effects.createPlaceholder(n), i = n.cssClip(), s = n.position()[l], u[l] = (h ? -1 : 1) * c + s, u.clip = n.cssClip(), u.clip[o[r][1]] = u.clip[o[r][0]], "show" === a && (n.cssClip(u.clip), n.css(l, u[l]), u.clip = i, u[l] = s), n.animate(u, { queue: !1, duration: t.duration, easing: t.easing, complete: e }) }), y = !1 !== V.uiBackCompat ? V.effects.define("transfer", function (t, e) { V(this).transfer(t, e) }) : y; V.ui.focusable = function (t, e) { var i, s, n, o, a = t.nodeName.toLowerCase(); return "area" === a ? (s = (i = t.parentNode).name, !(!t.href || !s || "map" !== i.nodeName.toLowerCase()) && (0 < (s = V("img[usemap='#" + s + "']")).length && s.is(":visible"))) : (/^(input|select|textarea|button|object)$/.test(a) ? (n = !t.disabled) && (o = V(t).closest("fieldset")[0]) && (n = !o.disabled) : n = "a" === a && t.href || e, n && V(t).is(":visible") && function (t) { var e = t.css("visibility"); for (; "inherit" === e;)t = t.parent(), e = t.css("visibility"); return "visible" === e }(V(t))) }, V.extend(V.expr.pseudos, { focusable: function (t) { return V.ui.focusable(t, null != V.attr(t, "tabindex")) } }); var Q, J; V.ui.focusable, V.fn._form = function () { return "string" == typeof this[0].form ? this.closest("form") : V(this[0].form) }, V.ui.formResetMixin = { _formResetHandler: function () { var e = V(this); setTimeout(function () { var t = e.data("ui-form-reset-instances"); V.each(t, function () { this.refresh() }) }) }, _bindFormResetHandler: function () { var t; this.form = this.element._form(), this.form.length && ((t = this.form.data("ui-form-reset-instances") || []).length || this.form.on("reset.ui-form-reset", this._formResetHandler), t.push(this), this.form.data("ui-form-reset-instances", t)) }, _unbindFormResetHandler: function () { var t; this.form.length && ((t = this.form.data("ui-form-reset-instances")).splice(V.inArray(this, t), 1), t.length ? this.form.data("ui-form-reset-instances", t) : this.form.removeData("ui-form-reset-instances").off("reset.ui-form-reset")) } }; V.expr.pseudos || (V.expr.pseudos = V.expr[":"]), V.uniqueSort || (V.uniqueSort = V.unique), V.escapeSelector || (Q = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g, J = function (t, e) { return e ? "\0" === t ? "�" : t.slice(0, -1) + "\\" + t.charCodeAt(t.length - 1).toString(16) + " " : "\\" + t }, V.escapeSelector = function (t) { return (t + "").replace(Q, J) }), V.fn.even && V.fn.odd || V.fn.extend({ even: function () { return this.filter(function (t) { return t % 2 == 0 }) }, odd: function () { return this.filter(function (t) { return t % 2 == 1 }) } }); var Z; V.ui.keyCode = { BACKSPACE: 8, COMMA: 188, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, LEFT: 37, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SPACE: 32, TAB: 9, UP: 38 }, V.fn.labels = function () { var t, e, i; return this.length ? this[0].labels && this[0].labels.length ? this.pushStack(this[0].labels) : (e = this.eq(0).parents("label"), (t = this.attr("id")) && (i = (i = this.eq(0).parents().last()).add((i.length ? i : this).siblings()), t = "label[for='" + V.escapeSelector(t) + "']", e = e.add(i.find(t).addBack(t))), this.pushStack(e)) : this.pushStack([]) }, V.fn.scrollParent = function (t) { var e = this.css("position"), i = "absolute" === e, s = t ? /(auto|scroll|hidden)/ : /(auto|scroll)/, t = this.parents().filter(function () { var t = V(this); return (!i || "static" !== t.css("position")) && s.test(t.css("overflow") + t.css("overflow-y") + t.css("overflow-x")) }).eq(0); return "fixed" !== e && t.length ? t : V(this[0].ownerDocument || document) }, V.extend(V.expr.pseudos, { tabbable: function (t) { var e = V.attr(t, "tabindex"), i = null != e; return (!i || 0 <= e) && V.ui.focusable(t, i) } }), V.fn.extend({ uniqueId: (Z = 0, function () { return this.each(function () { this.id || (this.id = "ui-id-" + ++Z) }) }), removeUniqueId: function () { return this.each(function () { /^ui-id-\d+$/.test(this.id) && V(this).removeAttr("id") }) } }), V.widget("ui.accordion", { version: "1.13.2", options: { active: 0, animate: {}, classes: { "ui-accordion-header": "ui-corner-top", "ui-accordion-header-collapsed": "ui-corner-all", "ui-accordion-content": "ui-corner-bottom" }, collapsible: !1, event: "click", header: function (t) { return t.find("> li > :first-child").add(t.find("> :not(li)").even()) }, heightStyle: "auto", icons: { activeHeader: "ui-icon-triangle-1-s", header: "ui-icon-triangle-1-e" }, activate: null, beforeActivate: null }, hideProps: { borderTopWidth: "hide", borderBottomWidth: "hide", paddingTop: "hide", paddingBottom: "hide", height: "hide" }, showProps: { borderTopWidth: "show", borderBottomWidth: "show", paddingTop: "show", paddingBottom: "show", height: "show" }, _create: function () { var t = this.options; this.prevShow = this.prevHide = V(), this._addClass("ui-accordion", "ui-widget ui-helper-reset"), this.element.attr("role", "tablist"), t.collapsible || !1 !== t.active && null != t.active || (t.active = 0), this._processPanels(), t.active < 0 && (t.active += this.headers.length), this._refresh() }, _getCreateEventData: function () { return { header: this.active, panel: this.active.length ? this.active.next() : V() } }, _createIcons: function () { var t, e = this.options.icons; e && (t = V("<span>"), this._addClass(t, "ui-accordion-header-icon", "ui-icon " + e.header), t.prependTo(this.headers), t = this.active.children(".ui-accordion-header-icon"), this._removeClass(t, e.header)._addClass(t, null, e.activeHeader)._addClass(this.headers, "ui-accordion-icons")) }, _destroyIcons: function () { this._removeClass(this.headers, "ui-accordion-icons"), this.headers.children(".ui-accordion-header-icon").remove() }, _destroy: function () { var t; this.element.removeAttr("role"), this.headers.removeAttr("role aria-expanded aria-selected aria-controls tabIndex").removeUniqueId(), this._destroyIcons(), t = this.headers.next().css("display", "").removeAttr("role aria-hidden aria-labelledby").removeUniqueId(), "content" !== this.options.heightStyle && t.css("height", "") }, _setOption: function (t, e) { "active" !== t ? ("event" === t && (this.options.event && this._off(this.headers, this.options.event), this._setupEvents(e)), this._super(t, e), "collapsible" !== t || e || !1 !== this.options.active || this._activate(0), "icons" === t && (this._destroyIcons(), e && this._createIcons())) : this._activate(e) }, _setOptionDisabled: function (t) { this._super(t), this.element.attr("aria-disabled", t), this._toggleClass(null, "ui-state-disabled", !!t), this._toggleClass(this.headers.add(this.headers.next()), null, "ui-state-disabled", !!t) }, _keydown: function (t) { if (!t.altKey && !t.ctrlKey) { var e = V.ui.keyCode, i = this.headers.length, s = this.headers.index(t.target), n = !1; switch (t.keyCode) { case e.RIGHT: case e.DOWN: n = this.headers[(s + 1) % i]; break; case e.LEFT: case e.UP: n = this.headers[(s - 1 + i) % i]; break; case e.SPACE: case e.ENTER: this._eventHandler(t); break; case e.HOME: n = this.headers[0]; break; case e.END: n = this.headers[i - 1] }n && (V(t.target).attr("tabIndex", -1), V(n).attr("tabIndex", 0), V(n).trigger("focus"), t.preventDefault()) } }, _panelKeyDown: function (t) { t.keyCode === V.ui.keyCode.UP && t.ctrlKey && V(t.currentTarget).prev().trigger("focus") }, refresh: function () { var t = this.options; this._processPanels(), !1 === t.active && !0 === t.collapsible || !this.headers.length ? (t.active = !1, this.active = V()) : !1 === t.active ? this._activate(0) : this.active.length && !V.contains(this.element[0], this.active[0]) ? this.headers.length === this.headers.find(".ui-state-disabled").length ? (t.active = !1, this.active = V()) : this._activate(Math.max(0, t.active - 1)) : t.active = this.headers.index(this.active), this._destroyIcons(), this._refresh() }, _processPanels: function () { var t = this.headers, e = this.panels; "function" == typeof this.options.header ? this.headers = this.options.header(this.element) : this.headers = this.element.find(this.options.header), this._addClass(this.headers, "ui-accordion-header ui-accordion-header-collapsed", "ui-state-default"), this.panels = this.headers.next().filter(":not(.ui-accordion-content-active)").hide(), this._addClass(this.panels, "ui-accordion-content", "ui-helper-reset ui-widget-content"), e && (this._off(t.not(this.headers)), this._off(e.not(this.panels))) }, _refresh: function () { var i, t = this.options, e = t.heightStyle, s = this.element.parent(); this.active = this._findActive(t.active), this._addClass(this.active, "ui-accordion-header-active", "ui-state-active")._removeClass(this.active, "ui-accordion-header-collapsed"), this._addClass(this.active.next(), "ui-accordion-content-active"), this.active.next().show(), this.headers.attr("role", "tab").each(function () { var t = V(this), e = t.uniqueId().attr("id"), i = t.next(), s = i.uniqueId().attr("id"); t.attr("aria-controls", s), i.attr("aria-labelledby", e) }).next().attr("role", "tabpanel"), this.headers.not(this.active).attr({ "aria-selected": "false", "aria-expanded": "false", tabIndex: -1 }).next().attr({ "aria-hidden": "true" }).hide(), this.active.length ? this.active.attr({ "aria-selected": "true", "aria-expanded": "true", tabIndex: 0 }).next().attr({ "aria-hidden": "false" }) : this.headers.eq(0).attr("tabIndex", 0), this._createIcons(), this._setupEvents(t.event), "fill" === e ? (i = s.height(), this.element.siblings(":visible").each(function () { var t = V(this), e = t.css("position"); "absolute" !== e && "fixed" !== e && (i -= t.outerHeight(!0)) }), this.headers.each(function () { i -= V(this).outerHeight(!0) }), this.headers.next().each(function () { V(this).height(Math.max(0, i - V(this).innerHeight() + V(this).height())) }).css("overflow", "auto")) : "auto" === e && (i = 0, this.headers.next().each(function () { var t = V(this).is(":visible"); t || V(this).show(), i = Math.max(i, V(this).css("height", "").height()), t || V(this).hide() }).height(i)) }, _activate: function (t) { t = this._findActive(t)[0]; t !== this.active[0] && (t = t || this.active[0], this._eventHandler({ target: t, currentTarget: t, preventDefault: V.noop })) }, _findActive: function (t) { return "number" == typeof t ? this.headers.eq(t) : V() }, _setupEvents: function (t) { var i = { keydown: "_keydown" }; t && V.each(t.split(" "), function (t, e) { i[e] = "_eventHandler" }), this._off(this.headers.add(this.headers.next())), this._on(this.headers, i), this._on(this.headers.next(), { keydown: "_panelKeyDown" }), this._hoverable(this.headers), this._focusable(this.headers) }, _eventHandler: function (t) { var e = this.options, i = this.active, s = V(t.currentTarget), n = s[0] === i[0], o = n && e.collapsible, a = o ? V() : s.next(), r = i.next(), a = { oldHeader: i, oldPanel: r, newHeader: o ? V() : s, newPanel: a }; t.preventDefault(), n && !e.collapsible || !1 === this._trigger("beforeActivate", t, a) || (e.active = !o && this.headers.index(s), this.active = n ? V() : s, this._toggle(a), this._removeClass(i, "ui-accordion-header-active", "ui-state-active"), e.icons && (i = i.children(".ui-accordion-header-icon"), this._removeClass(i, null, e.icons.activeHeader)._addClass(i, null, e.icons.header)), n || (this._removeClass(s, "ui-accordion-header-collapsed")._addClass(s, "ui-accordion-header-active", "ui-state-active"), e.icons && (n = s.children(".ui-accordion-header-icon"), this._removeClass(n, null, e.icons.header)._addClass(n, null, e.icons.activeHeader)), this._addClass(s.next(), "ui-accordion-content-active"))) }, _toggle: function (t) { var e = t.newPanel, i = this.prevShow.length ? this.prevShow : t.oldPanel; this.prevShow.add(this.prevHide).stop(!0, !0), this.prevShow = e, this.prevHide = i, this.options.animate ? this._animate(e, i, t) : (i.hide(), e.show(), this._toggleComplete(t)), i.attr({ "aria-hidden": "true" }), i.prev().attr({ "aria-selected": "false", "aria-expanded": "false" }), e.length && i.length ? i.prev().attr({ tabIndex: -1, "aria-expanded": "false" }) : e.length && this.headers.filter(function () { return 0 === parseInt(V(this).attr("tabIndex"), 10) }).attr("tabIndex", -1), e.attr("aria-hidden", "false").prev().attr({ "aria-selected": "true", "aria-expanded": "true", tabIndex: 0 }) }, _animate: function (t, i, e) { var s, n, o, a = this, r = 0, l = t.css("box-sizing"), h = t.length && (!i.length || t.index() < i.index()), c = this.options.animate || {}, u = h && c.down || c, h = function () { a._toggleComplete(e) }; return n = (n = "string" == typeof u ? u : n) || u.easing || c.easing, o = (o = "number" == typeof u ? u : o) || u.duration || c.duration, i.length ? t.length ? (s = t.show().outerHeight(), i.animate(this.hideProps, { duration: o, easing: n, step: function (t, e) { e.now = Math.round(t) } }), void t.hide().animate(this.showProps, { duration: o, easing: n, complete: h, step: function (t, e) { e.now = Math.round(t), "height" !== e.prop ? "content-box" === l && (r += e.now) : "content" !== a.options.heightStyle && (e.now = Math.round(s - i.outerHeight() - r), r = 0) } })) : i.animate(this.hideProps, o, n, h) : t.animate(this.showProps, o, n, h) }, _toggleComplete: function (t) { var e = t.oldPanel, i = e.prev(); this._removeClass(e, "ui-accordion-content-active"), this._removeClass(i, "ui-accordion-header-active")._addClass(i, "ui-accordion-header-collapsed"), e.length && (e.parent()[0].className = e.parent()[0].className), this._trigger("activate", null, t) } }), V.ui.safeActiveElement = function (e) { var i; try { i = e.activeElement } catch (t) { i = e.body } return i = !(i = i || e.body).nodeName ? e.body : i }, V.widget("ui.menu", { version: "1.13.2", defaultElement: "<ul>", delay: 300, options: { icons: { submenu: "ui-icon-caret-1-e" }, items: "> *", menus: "ul", position: { my: "left top", at: "right top" }, role: "menu", blur: null, focus: null, select: null }, _create: function () { this.activeMenu = this.element, this.mouseHandled = !1, this.lastMousePosition = { x: null, y: null }, this.element.uniqueId().attr({ role: this.options.role, tabIndex: 0 }), this._addClass("ui-menu", "ui-widget ui-widget-content"), this._on({ "mousedown .ui-menu-item": function (t) { t.preventDefault(), this._activateItem(t) }, "click .ui-menu-item": function (t) { var e = V(t.target), i = V(V.ui.safeActiveElement(this.document[0])); !this.mouseHandled && e.not(".ui-state-disabled").length && (this.select(t), t.isPropagationStopped() || (this.mouseHandled = !0), e.has(".ui-menu").length ? this.expand(t) : !this.element.is(":focus") && i.closest(".ui-menu").length && (this.element.trigger("focus", [!0]), this.active && 1 === this.active.parents(".ui-menu").length && clearTimeout(this.timer))) }, "mouseenter .ui-menu-item": "_activateItem", "mousemove .ui-menu-item": "_activateItem", mouseleave: "collapseAll", "mouseleave .ui-menu": "collapseAll", focus: function (t, e) { var i = this.active || this._menuItems().first(); e || this.focus(t, i) }, blur: function (t) { this._delay(function () { V.contains(this.element[0], V.ui.safeActiveElement(this.document[0])) || this.collapseAll(t) }) }, keydown: "_keydown" }), this.refresh(), this._on(this.document, { click: function (t) { this._closeOnDocumentClick(t) && this.collapseAll(t, !0), this.mouseHandled = !1 } }) }, _activateItem: function (t) { var e, i; this.previousFilter || t.clientX === this.lastMousePosition.x && t.clientY === this.lastMousePosition.y || (this.lastMousePosition = { x: t.clientX, y: t.clientY }, e = V(t.target).closest(".ui-menu-item"), i = V(t.currentTarget), e[0] === i[0] && (i.is(".ui-state-active") || (this._removeClass(i.siblings().children(".ui-state-active"), null, "ui-state-active"), this.focus(t, i)))) }, _destroy: function () { var t = this.element.find(".ui-menu-item").removeAttr("role aria-disabled").children(".ui-menu-item-wrapper").removeUniqueId().removeAttr("tabIndex role aria-haspopup"); this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeAttr("role aria-labelledby aria-expanded aria-hidden aria-disabled tabIndex").removeUniqueId().show(), t.children().each(function () { var t = V(this); t.data("ui-menu-submenu-caret") && t.remove() }) }, _keydown: function (t) { var e, i, s, n = !0; switch (t.keyCode) { case V.ui.keyCode.PAGE_UP: this.previousPage(t); break; case V.ui.keyCode.PAGE_DOWN: this.nextPage(t); break; case V.ui.keyCode.HOME: this._move("first", "first", t); break; case V.ui.keyCode.END: this._move("last", "last", t); break; case V.ui.keyCode.UP: this.previous(t); break; case V.ui.keyCode.DOWN: this.next(t); break; case V.ui.keyCode.LEFT: this.collapse(t); break; case V.ui.keyCode.RIGHT: this.active && !this.active.is(".ui-state-disabled") && this.expand(t); break; case V.ui.keyCode.ENTER: case V.ui.keyCode.SPACE: this._activate(t); break; case V.ui.keyCode.ESCAPE: this.collapse(t); break; default: e = this.previousFilter || "", s = n = !1, i = 96 <= t.keyCode && t.keyCode <= 105 ? (t.keyCode - 96).toString() : String.fromCharCode(t.keyCode), clearTimeout(this.filterTimer), i === e ? s = !0 : i = e + i, e = this._filterMenuItems(i), (e = s && -1 !== e.index(this.active.next()) ? this.active.nextAll(".ui-menu-item") : e).length || (i = String.fromCharCode(t.keyCode), e = this._filterMenuItems(i)), e.length ? (this.focus(t, e), this.previousFilter = i, this.filterTimer = this._delay(function () { delete this.previousFilter }, 1e3)) : delete this.previousFilter }n && t.preventDefault() }, _activate: function (t) { this.active && !this.active.is(".ui-state-disabled") && (this.active.children("[aria-haspopup='true']").length ? this.expand(t) : this.select(t)) }, refresh: function () { var t, e, s = this, n = this.options.icons.submenu, i = this.element.find(this.options.menus); this._toggleClass("ui-menu-icons", null, !!this.element.find(".ui-icon").length), e = i.filter(":not(.ui-menu)").hide().attr({ role: this.options.role, "aria-hidden": "true", "aria-expanded": "false" }).each(function () { var t = V(this), e = t.prev(), i = V("<span>").data("ui-menu-submenu-caret", !0); s._addClass(i, "ui-menu-icon", "ui-icon " + n), e.attr("aria-haspopup", "true").prepend(i), t.attr("aria-labelledby", e.attr("id")) }), this._addClass(e, "ui-menu", "ui-widget ui-widget-content ui-front"), (t = i.add(this.element).find(this.options.items)).not(".ui-menu-item").each(function () { var t = V(this); s._isDivider(t) && s._addClass(t, "ui-menu-divider", "ui-widget-content") }), i = (e = t.not(".ui-menu-item, .ui-menu-divider")).children().not(".ui-menu").uniqueId().attr({ tabIndex: -1, role: this._itemRole() }), this._addClass(e, "ui-menu-item")._addClass(i, "ui-menu-item-wrapper"), t.filter(".ui-state-disabled").attr("aria-disabled", "true"), this.active && !V.contains(this.element[0], this.active[0]) && this.blur() }, _itemRole: function () { return { menu: "menuitem", listbox: "option" }[this.options.role] }, _setOption: function (t, e) { var i; "icons" === t && (i = this.element.find(".ui-menu-icon"), this._removeClass(i, null, this.options.icons.submenu)._addClass(i, null, e.submenu)), this._super(t, e) }, _setOptionDisabled: function (t) { this._super(t), this.element.attr("aria-disabled", String(t)), this._toggleClass(null, "ui-state-disabled", !!t) }, focus: function (t, e) { var i; this.blur(t, t && "focus" === t.type), this._scrollIntoView(e), this.active = e.first(), i = this.active.children(".ui-menu-item-wrapper"), this._addClass(i, null, "ui-state-active"), this.options.role && this.element.attr("aria-activedescendant", i.attr("id")), i = this.active.parent().closest(".ui-menu-item").children(".ui-menu-item-wrapper"), this._addClass(i, null, "ui-state-active"), t && "keydown" === t.type ? this._close() : this.timer = this._delay(function () { this._close() }, this.delay), (i = e.children(".ui-menu")).length && t && /^mouse/.test(t.type) && this._startOpening(i), this.activeMenu = e.parent(), this._trigger("focus", t, { item: e }) }, _scrollIntoView: function (t) { var e, i, s; this._hasScroll() && (i = parseFloat(V.css(this.activeMenu[0], "borderTopWidth")) || 0, s = parseFloat(V.css(this.activeMenu[0], "paddingTop")) || 0, e = t.offset().top - this.activeMenu.offset().top - i - s, i = this.activeMenu.scrollTop(), s = this.activeMenu.height(), t = t.outerHeight(), e < 0 ? this.activeMenu.scrollTop(i + e) : s < e + t && this.activeMenu.scrollTop(i + e - s + t)) }, blur: function (t, e) { e || clearTimeout(this.timer), this.active && (this._removeClass(this.active.children(".ui-menu-item-wrapper"), null, "ui-state-active"), this._trigger("blur", t, { item: this.active }), this.active = null) }, _startOpening: function (t) { clearTimeout(this.timer), "true" === t.attr("aria-hidden") && (this.timer = this._delay(function () { this._close(), this._open(t) }, this.delay)) }, _open: function (t) { var e = V.extend({ of: this.active }, this.options.position); clearTimeout(this.timer), this.element.find(".ui-menu").not(t.parents(".ui-menu")).hide().attr("aria-hidden", "true"), t.show().removeAttr("aria-hidden").attr("aria-expanded", "true").position(e) }, collapseAll: function (e, i) { clearTimeout(this.timer), this.timer = this._delay(function () { var t = i ? this.element : V(e && e.target).closest(this.element.find(".ui-menu")); t.length || (t = this.element), this._close(t), this.blur(e), this._removeClass(t.find(".ui-state-active"), null, "ui-state-active"), this.activeMenu = t }, i ? 0 : this.delay) }, _close: function (t) { (t = t || (this.active ? this.active.parent() : this.element)).find(".ui-menu").hide().attr("aria-hidden", "true").attr("aria-expanded", "false") }, _closeOnDocumentClick: function (t) { return !V(t.target).closest(".ui-menu").length }, _isDivider: function (t) { return !/[^\-\u2014\u2013\s]/.test(t.text()) }, collapse: function (t) { var e = this.active && this.active.parent().closest(".ui-menu-item", this.element); e && e.length && (this._close(), this.focus(t, e)) }, expand: function (t) { var e = this.active && this._menuItems(this.active.children(".ui-menu")).first(); e && e.length && (this._open(e.parent()), this._delay(function () { this.focus(t, e) })) }, next: function (t) { this._move("next", "first", t) }, previous: function (t) { this._move("prev", "last", t) }, isFirstItem: function () { return this.active && !this.active.prevAll(".ui-menu-item").length }, isLastItem: function () { return this.active && !this.active.nextAll(".ui-menu-item").length }, _menuItems: function (t) { return (t || this.element).find(this.options.items).filter(".ui-menu-item") }, _move: function (t, e, i) { var s; (s = this.active ? "first" === t || "last" === t ? this.active["first" === t ? "prevAll" : "nextAll"](".ui-menu-item").last() : this.active[t + "All"](".ui-menu-item").first() : s) && s.length && this.active || (s = this._menuItems(this.activeMenu)[e]()), this.focus(i, s) }, nextPage: function (t) { var e, i, s; this.active ? this.isLastItem() || (this._hasScroll() ? (i = this.active.offset().top, s = this.element.innerHeight(), 0 === V.fn.jquery.indexOf("3.2.") && (s += this.element[0].offsetHeight - this.element.outerHeight()), this.active.nextAll(".ui-menu-item").each(function () { return (e = V(this)).offset().top - i - s < 0 }), this.focus(t, e)) : this.focus(t, this._menuItems(this.activeMenu)[this.active ? "last" : "first"]())) : this.next(t) }, previousPage: function (t) { var e, i, s; this.active ? this.isFirstItem() || (this._hasScroll() ? (i = this.active.offset().top, s = this.element.innerHeight(), 0 === V.fn.jquery.indexOf("3.2.") && (s += this.element[0].offsetHeight - this.element.outerHeight()), this.active.prevAll(".ui-menu-item").each(function () { return 0 < (e = V(this)).offset().top - i + s }), this.focus(t, e)) : this.focus(t, this._menuItems(this.activeMenu).first())) : this.next(t) }, _hasScroll: function () { return this.element.outerHeight() < this.element.prop("scrollHeight") }, select: function (t) { this.active = this.active || V(t.target).closest(".ui-menu-item"); var e = { item: this.active }; this.active.has(".ui-menu").length || this.collapseAll(t, !0), this._trigger("select", t, e) }, _filterMenuItems: function (t) { var t = t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), e = new RegExp("^" + t, "i"); return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function () { return e.test(String.prototype.trim.call(V(this).children(".ui-menu-item-wrapper").text())) }) } }); V.widget("ui.autocomplete", { version: "1.13.2", defaultElement: "<input>", options: { appendTo: null, autoFocus: !1, delay: 300, minLength: 1, position: { my: "left top", at: "left bottom", collision: "none" }, source: null, change: null, close: null, focus: null, open: null, response: null, search: null, select: null }, requestIndex: 0, pending: 0, liveRegionTimer: null, _create: function () { var i, s, n, t = this.element[0].nodeName.toLowerCase(), e = "textarea" === t, t = "input" === t; this.isMultiLine = e || !t && this._isContentEditable(this.element), this.valueMethod = this.element[e || t ? "val" : "text"], this.isNewMenu = !0, this._addClass("ui-autocomplete-input"), this.element.attr("autocomplete", "off"), this._on(this.element, { keydown: function (t) { if (this.element.prop("readOnly")) s = n = i = !0; else { s = n = i = !1; var e = V.ui.keyCode; switch (t.keyCode) { case e.PAGE_UP: i = !0, this._move("previousPage", t); break; case e.PAGE_DOWN: i = !0, this._move("nextPage", t); break; case e.UP: i = !0, this._keyEvent("previous", t); break; case e.DOWN: i = !0, this._keyEvent("next", t); break; case e.ENTER: this.menu.active && (i = !0, t.preventDefault(), this.menu.select(t)); break; case e.TAB: this.menu.active && this.menu.select(t); break; case e.ESCAPE: this.menu.element.is(":visible") && (this.isMultiLine || this._value(this.term), this.close(t), t.preventDefault()); break; default: s = !0, this._searchTimeout(t) } } }, keypress: function (t) { if (i) return i = !1, void (this.isMultiLine && !this.menu.element.is(":visible") || t.preventDefault()); if (!s) { var e = V.ui.keyCode; switch (t.keyCode) { case e.PAGE_UP: this._move("previousPage", t); break; case e.PAGE_DOWN: this._move("nextPage", t); break; case e.UP: this._keyEvent("previous", t); break; case e.DOWN: this._keyEvent("next", t) } } }, input: function (t) { if (n) return n = !1, void t.preventDefault(); this._searchTimeout(t) }, focus: function () { this.selectedItem = null, this.previous = this._value() }, blur: function (t) { clearTimeout(this.searching), this.close(t), this._change(t) } }), this._initSource(), this.menu = V("<ul>").appendTo(this._appendTo()).menu({ role: null }).hide().attr({ unselectable: "on" }).menu("instance"), this._addClass(this.menu.element, "ui-autocomplete", "ui-front"), this._on(this.menu.element, { mousedown: function (t) { t.preventDefault() }, menufocus: function (t, e) { var i, s; if (this.isNewMenu && (this.isNewMenu = !1, t.originalEvent && /^mouse/.test(t.originalEvent.type))) return this.menu.blur(), void this.document.one("mousemove", function () { V(t.target).trigger(t.originalEvent) }); s = e.item.data("ui-autocomplete-item"), !1 !== this._trigger("focus", t, { item: s }) && t.originalEvent && /^key/.test(t.originalEvent.type) && this._value(s.value), (i = e.item.attr("aria-label") || s.value) && String.prototype.trim.call(i).length && (clearTimeout(this.liveRegionTimer), this.liveRegionTimer = this._delay(function () { this.liveRegion.html(V("<div>").text(i)) }, 100)) }, menuselect: function (t, e) { var i = e.item.data("ui-autocomplete-item"), s = this.previous; this.element[0] !== V.ui.safeActiveElement(this.document[0]) && (this.element.trigger("focus"), this.previous = s, this._delay(function () { this.previous = s, this.selectedItem = i })), !1 !== this._trigger("select", t, { item: i }) && this._value(i.value), this.term = this._value(), this.close(t), this.selectedItem = i } }), this.liveRegion = V("<div>", { role: "status", "aria-live": "assertive", "aria-relevant": "additions" }).appendTo(this.document[0].body), this._addClass(this.liveRegion, null, "ui-helper-hidden-accessible"), this._on(this.window, { beforeunload: function () { this.element.removeAttr("autocomplete") } }) }, _destroy: function () { clearTimeout(this.searching), this.element.removeAttr("autocomplete"), this.menu.element.remove(), this.liveRegion.remove() }, _setOption: function (t, e) { this._super(t, e), "source" === t && this._initSource(), "appendTo" === t && this.menu.element.appendTo(this._appendTo()), "disabled" === t && e && this.xhr && this.xhr.abort() }, _isEventTargetInWidget: function (t) { var e = this.menu.element[0]; return t.target === this.element[0] || t.target === e || V.contains(e, t.target) }, _closeOnClickOutside: function (t) { this._isEventTargetInWidget(t) || this.close() }, _appendTo: function () { var t = this.options.appendTo; return t = !(t = !(t = t && (t.jquery || t.nodeType ? V(t) : this.document.find(t).eq(0))) || !t[0] ? this.element.closest(".ui-front, dialog") : t).length ? this.document[0].body : t }, _initSource: function () { var i, s, n = this; Array.isArray(this.options.source) ? (i = this.options.source, this.source = function (t, e) { e(V.ui.autocomplete.filter(i, t.term)) }) : "string" == typeof this.options.source ? (s = this.options.source, this.source = function (t, e) { n.xhr && n.xhr.abort(), n.xhr = V.ajax({ url: s, data: t, dataType: "json", success: function (t) { e(t) }, error: function () { e([]) } }) }) : this.source = this.options.source }, _searchTimeout: function (s) { clearTimeout(this.searching), this.searching = this._delay(function () { var t = this.term === this._value(), e = this.menu.element.is(":visible"), i = s.altKey || s.ctrlKey || s.metaKey || s.shiftKey; t && (e || i) || (this.selectedItem = null, this.search(null, s)) }, this.options.delay) }, search: function (t, e) { return t = null != t ? t : this._value(), this.term = this._value(), t.length < this.options.minLength ? this.close(e) : !1 !== this._trigger("search", e) ? this._search(t) : void 0 }, _search: function (t) { this.pending++ , this._addClass("ui-autocomplete-loading"), this.cancelSearch = !1, this.source({ term: t }, this._response()) }, _response: function () { var e = ++this.requestIndex; return function (t) { e === this.requestIndex && this.__response(t), this.pending-- , this.pending || this._removeClass("ui-autocomplete-loading") }.bind(this) }, __response: function (t) { t = t && this._normalize(t), this._trigger("response", null, { content: t }), !this.options.disabled && t && t.length && !this.cancelSearch ? (this._suggest(t), this._trigger("open")) : this._close() }, close: function (t) { this.cancelSearch = !0, this._close(t) }, _close: function (t) { this._off(this.document, "mousedown"), this.menu.element.is(":visible") && (this.menu.element.hide(), this.menu.blur(), this.isNewMenu = !0, this._trigger("close", t)) }, _change: function (t) { this.previous !== this._value() && this._trigger("change", t, { item: this.selectedItem }) }, _normalize: function (t) { return t.length && t[0].label && t[0].value ? t : V.map(t, function (t) { return "string" == typeof t ? { label: t, value: t } : V.extend({}, t, { label: t.label || t.value, value: t.value || t.label }) }) }, _suggest: function (t) { var e = this.menu.element.empty(); this._renderMenu(e, t), this.isNewMenu = !0, this.menu.refresh(), e.show(), this._resizeMenu(), e.position(V.extend({ of: this.element }, this.options.position)), this.options.autoFocus && this.menu.next(), this._on(this.document, { mousedown: "_closeOnClickOutside" }) }, _resizeMenu: function () { var t = this.menu.element; t.outerWidth(Math.max(t.width("").outerWidth() + 1, this.element.outerWidth())) }, _renderMenu: function (i, t) { var s = this; V.each(t, function (t, e) { s._renderItemData(i, e) }) }, _renderItemData: function (t, e) { return this._renderItem(t, e).data("ui-autocomplete-item", e) }, _renderItem: function (t, e) { return V("<li>").append(V("<div>").text(e.label)).appendTo(t) }, _move: function (t, e) { if (this.menu.element.is(":visible")) return this.menu.isFirstItem() && /^previous/.test(t) || this.menu.isLastItem() && /^next/.test(t) ? (this.isMultiLine || this._value(this.term), void this.menu.blur()) : void this.menu[t](e); this.search(null, e) }, widget: function () { return this.menu.element }, _value: function () { return this.valueMethod.apply(this.element, arguments) }, _keyEvent: function (t, e) { this.isMultiLine && !this.menu.element.is(":visible") || (this._move(t, e), e.preventDefault()) }, _isContentEditable: function (t) { if (!t.length) return !1; var e = t.prop("contentEditable"); return "inherit" === e ? this._isContentEditable(t.parent()) : "true" === e } }), V.extend(V.ui.autocomplete, { escapeRegex: function (t) { return t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&") }, filter: function (t, e) { var i = new RegExp(V.ui.autocomplete.escapeRegex(e), "i"); return V.grep(t, function (t) { return i.test(t.label || t.value || t) }) } }), V.widget("ui.autocomplete", V.ui.autocomplete, { options: { messages: { noResults: "No search results.", results: function (t) { return t + (1 < t ? " results are" : " result is") + " available, use up and down arrow keys to navigate." } } }, __response: function (t) { var e; this._superApply(arguments), this.options.disabled || this.cancelSearch || (e = t && t.length ? this.options.messages.results(t.length) : this.options.messages.noResults, clearTimeout(this.liveRegionTimer), this.liveRegionTimer = this._delay(function () { this.liveRegion.html(V("<div>").text(e)) }, 100)) } }); V.ui.autocomplete; var tt = /ui-corner-([a-z]){2,6}/g; V.widget("ui.controlgroup", { version: "1.13.2", defaultElement: "<div>", options: { direction: "horizontal", disabled: null, onlyVisible: !0, items: { button: "input[type=button], input[type=submit], input[type=reset], button, a", controlgroupLabel: ".ui-controlgroup-label", checkboxradio: "input[type='checkbox'], input[type='radio']", selectmenu: "select", spinner: ".ui-spinner-input" } }, _create: function () { this._enhance() }, _enhance: function () { this.element.attr("role", "toolbar"), this.refresh() }, _destroy: function () { this._callChildMethod("destroy"), this.childWidgets.removeData("ui-controlgroup-data"), this.element.removeAttr("role"), this.options.items.controlgroupLabel && this.element.find(this.options.items.controlgroupLabel).find(".ui-controlgroup-label-contents").contents().unwrap() }, _initWidgets: function () { var o = this, a = []; V.each(this.options.items, function (s, t) { var e, n = {}; if (t) return "controlgroupLabel" === s ? ((e = o.element.find(t)).each(function () { var t = V(this); t.children(".ui-controlgroup-label-contents").length || t.contents().wrapAll("<span class='ui-controlgroup-label-contents'></span>") }), o._addClass(e, null, "ui-widget ui-widget-content ui-state-default"), void (a = a.concat(e.get()))) : void (V.fn[s] && (n = o["_" + s + "Options"] ? o["_" + s + "Options"]("middle") : { classes: {} }, o.element.find(t).each(function () { var t = V(this), e = t[s]("instance"), i = V.widget.extend({}, n); "button" === s && t.parent(".ui-spinner").length || ((e = e || t[s]()[s]("instance")) && (i.classes = o._resolveClassesValues(i.classes, e)), t[s](i), i = t[s]("widget"), V.data(i[0], "ui-controlgroup-data", e || t[s]("instance")), a.push(i[0])) }))) }), this.childWidgets = V(V.uniqueSort(a)), this._addClass(this.childWidgets, "ui-controlgroup-item") }, _callChildMethod: function (e) { this.childWidgets.each(function () { var t = V(this).data("ui-controlgroup-data"); t && t[e] && t[e]() }) }, _updateCornerClass: function (t, e) { e = this._buildSimpleOptions(e, "label").classes.label; this._removeClass(t, null, "ui-corner-top ui-corner-bottom ui-corner-left ui-corner-right ui-corner-all"), this._addClass(t, null, e) }, _buildSimpleOptions: function (t, e) { var i = "vertical" === this.options.direction, s = { classes: {} }; return s.classes[e] = { middle: "", first: "ui-corner-" + (i ? "top" : "left"), last: "ui-corner-" + (i ? "bottom" : "right"), only: "ui-corner-all" }[t], s }, _spinnerOptions: function (t) { t = this._buildSimpleOptions(t, "ui-spinner"); return t.classes["ui-spinner-up"] = "", t.classes["ui-spinner-down"] = "", t }, _buttonOptions: function (t) { return this._buildSimpleOptions(t, "ui-button") }, _checkboxradioOptions: function (t) { return this._buildSimpleOptions(t, "ui-checkboxradio-label") }, _selectmenuOptions: function (t) { var e = "vertical" === this.options.direction; return { width: e && "auto", classes: { middle: { "ui-selectmenu-button-open": "", "ui-selectmenu-button-closed": "" }, first: { "ui-selectmenu-button-open": "ui-corner-" + (e ? "top" : "tl"), "ui-selectmenu-button-closed": "ui-corner-" + (e ? "top" : "left") }, last: { "ui-selectmenu-button-open": e ? "" : "ui-corner-tr", "ui-selectmenu-button-closed": "ui-corner-" + (e ? "bottom" : "right") }, only: { "ui-selectmenu-button-open": "ui-corner-top", "ui-selectmenu-button-closed": "ui-corner-all" } }[t] } }, _resolveClassesValues: function (i, s) { var n = {}; return V.each(i, function (t) { var e = s.options.classes[t] || "", e = String.prototype.trim.call(e.replace(tt, "")); n[t] = (e + " " + i[t]).replace(/\s+/g, " ") }), n }, _setOption: function (t, e) { "direction" === t && this._removeClass("ui-controlgroup-" + this.options.direction), this._super(t, e), "disabled" !== t ? this.refresh() : this._callChildMethod(e ? "disable" : "enable") }, refresh: function () { var n, o = this; this._addClass("ui-controlgroup ui-controlgroup-" + this.options.direction), "horizontal" === this.options.direction && this._addClass(null, "ui-helper-clearfix"), this._initWidgets(), n = this.childWidgets, (n = this.options.onlyVisible ? n.filter(":visible") : n).length && (V.each(["first", "last"], function (t, e) { var i, s = n[e]().data("ui-controlgroup-data"); s && o["_" + s.widgetName + "Options"] ? ((i = o["_" + s.widgetName + "Options"](1 === n.length ? "only" : e)).classes = o._resolveClassesValues(i.classes, s), s.element[s.widgetName](i)) : o._updateCornerClass(n[e](), e) }), this._callChildMethod("refresh")) } }); V.widget("ui.checkboxradio", [V.ui.formResetMixin, { version: "1.13.2", options: { disabled: null, label: null, icon: !0, classes: { "ui-checkboxradio-label": "ui-corner-all", "ui-checkboxradio-icon": "ui-corner-all" } }, _getCreateOptions: function () { var t, e = this._super() || {}; return this._readType(), t = this.element.labels(), this.label = V(t[t.length - 1]), this.label.length || V.error("No label found for checkboxradio widget"), this.originalLabel = "", (t = this.label.contents().not(this.element[0])).length && (this.originalLabel += t.clone().wrapAll("<div></div>").parent().html()), this.originalLabel && (e.label = this.originalLabel), null != (t = this.element[0].disabled) && (e.disabled = t), e }, _create: function () { var t = this.element[0].checked; this._bindFormResetHandler(), null == this.options.disabled && (this.options.disabled = this.element[0].disabled), this._setOption("disabled", this.options.disabled), this._addClass("ui-checkboxradio", "ui-helper-hidden-accessible"), this._addClass(this.label, "ui-checkboxradio-label", "ui-button ui-widget"), "radio" === this.type && this._addClass(this.label, "ui-checkboxradio-radio-label"), this.options.label && this.options.label !== this.originalLabel ? this._updateLabel() : this.originalLabel && (this.options.label = this.originalLabel), this._enhance(), t && this._addClass(this.label, "ui-checkboxradio-checked", "ui-state-active"), this._on({ change: "_toggleClasses", focus: function () { this._addClass(this.label, null, "ui-state-focus ui-visual-focus") }, blur: function () { this._removeClass(this.label, null, "ui-state-focus ui-visual-focus") } }) }, _readType: function () { var t = this.element[0].nodeName.toLowerCase(); this.type = this.element[0].type, "input" === t && /radio|checkbox/.test(this.type) || V.error("Can't create checkboxradio on element.nodeName=" + t + " and element.type=" + this.type) }, _enhance: function () { this._updateIcon(this.element[0].checked) }, widget: function () { return this.label }, _getRadioGroup: function () { var t = this.element[0].name, e = "input[name='" + V.escapeSelector(t) + "']"; return t ? (this.form.length ? V(this.form[0].elements).filter(e) : V(e).filter(function () { return 0 === V(this)._form().length })).not(this.element) : V([]) }, _toggleClasses: function () { var t = this.element[0].checked; this._toggleClass(this.label, "ui-checkboxradio-checked", "ui-state-active", t), this.options.icon && "checkbox" === this.type && this._toggleClass(this.icon, null, "ui-icon-check ui-state-checked", t)._toggleClass(this.icon, null, "ui-icon-blank", !t), "radio" === this.type && this._getRadioGroup().each(function () { var t = V(this).checkboxradio("instance"); t && t._removeClass(t.label, "ui-checkboxradio-checked", "ui-state-active") }) }, _destroy: function () { this._unbindFormResetHandler(), this.icon && (this.icon.remove(), this.iconSpace.remove()) }, _setOption: function (t, e) { if ("label" !== t || e) { if (this._super(t, e), "disabled" === t) return this._toggleClass(this.label, null, "ui-state-disabled", e), void (this.element[0].disabled = e); this.refresh() } }, _updateIcon: function (t) { var e = "ui-icon ui-icon-background "; this.options.icon ? (this.icon || (this.icon = V("<span>"), this.iconSpace = V("<span> </span>"), this._addClass(this.iconSpace, "ui-checkboxradio-icon-space")), "checkbox" === this.type ? (e += t ? "ui-icon-check ui-state-checked" : "ui-icon-blank", this._removeClass(this.icon, null, t ? "ui-icon-blank" : "ui-icon-check")) : e += "ui-icon-blank", this._addClass(this.icon, "ui-checkboxradio-icon", e), t || this._removeClass(this.icon, null, "ui-icon-check ui-state-checked"), this.icon.prependTo(this.label).after(this.iconSpace)) : void 0 !== this.icon && (this.icon.remove(), this.iconSpace.remove(), delete this.icon) }, _updateLabel: function () { var t = this.label.contents().not(this.element[0]); this.icon && (t = t.not(this.icon[0])), (t = this.iconSpace ? t.not(this.iconSpace[0]) : t).remove(), this.label.append(this.options.label) }, refresh: function () { var t = this.element[0].checked, e = this.element[0].disabled; this._updateIcon(t), this._toggleClass(this.label, "ui-checkboxradio-checked", "ui-state-active", t), null !== this.options.label && this._updateLabel(), e !== this.options.disabled && this._setOptions({ disabled: e }) } }]); var et; V.ui.checkboxradio; V.widget("ui.button", { version: "1.13.2", defaultElement: "<button>", options: { classes: { "ui-button": "ui-corner-all" }, disabled: null, icon: null, iconPosition: "beginning", label: null, showLabel: !0 }, _getCreateOptions: function () { var t, e = this._super() || {}; return this.isInput = this.element.is("input"), null != (t = this.element[0].disabled) && (e.disabled = t), this.originalLabel = this.isInput ? this.element.val() : this.element.html(), this.originalLabel && (e.label = this.originalLabel), e }, _create: function () { !this.option.showLabel & !this.options.icon && (this.options.showLabel = !0), null == this.options.disabled && (this.options.disabled = this.element[0].disabled || !1), this.hasTitle = !!this.element.attr("title"), this.options.label && this.options.label !== this.originalLabel && (this.isInput ? this.element.val(this.options.label) : this.element.html(this.options.label)), this._addClass("ui-button", "ui-widget"), this._setOption("disabled", this.options.disabled), this._enhance(), this.element.is("a") && this._on({ keyup: function (t) { t.keyCode === V.ui.keyCode.SPACE && (t.preventDefault(), this.element[0].click ? this.element[0].click() : this.element.trigger("click")) } }) }, _enhance: function () { this.element.is("button") || this.element.attr("role", "button"), this.options.icon && (this._updateIcon("icon", this.options.icon), this._updateTooltip()) }, _updateTooltip: function () { this.title = this.element.attr("title"), this.options.showLabel || this.title || this.element.attr("title", this.options.label) }, _updateIcon: function (t, e) { var i = "iconPosition" !== t, s = i ? this.options.iconPosition : e, t = "top" === s || "bottom" === s; this.icon ? i && this._removeClass(this.icon, null, this.options.icon) : (this.icon = V("<span>"), this._addClass(this.icon, "ui-button-icon", "ui-icon"), this.options.showLabel || this._addClass("ui-button-icon-only")), i && this._addClass(this.icon, null, e), this._attachIcon(s), t ? (this._addClass(this.icon, null, "ui-widget-icon-block"), this.iconSpace && this.iconSpace.remove()) : (this.iconSpace || (this.iconSpace = V("<span> </span>"), this._addClass(this.iconSpace, "ui-button-icon-space")), this._removeClass(this.icon, null, "ui-wiget-icon-block"), this._attachIconSpace(s)) }, _destroy: function () { this.element.removeAttr("role"), this.icon && this.icon.remove(), this.iconSpace && this.iconSpace.remove(), this.hasTitle || this.element.removeAttr("title") }, _attachIconSpace: function (t) { this.icon[/^(?:end|bottom)/.test(t) ? "before" : "after"](this.iconSpace) }, _attachIcon: function (t) { this.element[/^(?:end|bottom)/.test(t) ? "append" : "prepend"](this.icon) }, _setOptions: function (t) { var e = (void 0 === t.showLabel ? this.options : t).showLabel, i = (void 0 === t.icon ? this.options : t).icon; e || i || (t.showLabel = !0), this._super(t) }, _setOption: function (t, e) { "icon" === t && (e ? this._updateIcon(t, e) : this.icon && (this.icon.remove(), this.iconSpace && this.iconSpace.remove())), "iconPosition" === t && this._updateIcon(t, e), "showLabel" === t && (this._toggleClass("ui-button-icon-only", null, !e), this._updateTooltip()), "label" === t && (this.isInput ? this.element.val(e) : (this.element.html(e), this.icon && (this._attachIcon(this.options.iconPosition), this._attachIconSpace(this.options.iconPosition)))), this._super(t, e), "disabled" === t && (this._toggleClass(null, "ui-state-disabled", e), (this.element[0].disabled = e) && this.element.trigger("blur")) }, refresh: function () { var t = this.element.is("input, button") ? this.element[0].disabled : this.element.hasClass("ui-button-disabled"); t !== this.options.disabled && this._setOptions({ disabled: t }), this._updateTooltip() } }), !1 !== V.uiBackCompat && (V.widget("ui.button", V.ui.button, { options: { text: !0, icons: { primary: null, secondary: null } }, _create: function () { this.options.showLabel && !this.options.text && (this.options.showLabel = this.options.text), !this.options.showLabel && this.options.text && (this.options.text = this.options.showLabel), this.options.icon || !this.options.icons.primary && !this.options.icons.secondary ? this.options.icon && (this.options.icons.primary = this.options.icon) : this.options.icons.primary ? this.options.icon = this.options.icons.primary : (this.options.icon = this.options.icons.secondary, this.options.iconPosition = "end"), this._super() }, _setOption: function (t, e) { "text" !== t ? ("showLabel" === t && (this.options.text = e), "icon" === t && (this.options.icons.primary = e), "icons" === t && (e.primary ? (this._super("icon", e.primary), this._super("iconPosition", "beginning")) : e.secondary && (this._super("icon", e.secondary), this._super("iconPosition", "end"))), this._superApply(arguments)) : this._super("showLabel", e) } }), V.fn.button = (et = V.fn.button, function (i) { var t = "string" == typeof i, s = Array.prototype.slice.call(arguments, 1), n = this; return t ? this.length || "instance" !== i ? this.each(function () { var t = V(this).attr("type"), e = V.data(this, "ui-" + ("checkbox" !== t && "radio" !== t ? "button" : "checkboxradio")); return "instance" === i ? (n = e, !1) : e ? "function" != typeof e[i] || "_" === i.charAt(0) ? V.error("no such method '" + i + "' for button widget instance") : (t = e[i].apply(e, s)) !== e && void 0 !== t ? (n = t && t.jquery ? n.pushStack(t.get()) : t, !1) : void 0 : V.error("cannot call methods on button prior to initialization; attempted to call method '" + i + "'") }) : n = void 0 : (s.length && (i = V.widget.extend.apply(null, [i].concat(s))), this.each(function () { var t = V(this).attr("type"), e = "checkbox" !== t && "radio" !== t ? "button" : "checkboxradio", t = V.data(this, "ui-" + e); t ? (t.option(i || {}), t._init && t._init()) : "button" != e ? V(this).checkboxradio(V.extend({ icon: !1 }, i)) : et.call(V(this), i) })), n }), V.fn.buttonset = function () { return V.ui.controlgroup || V.error("Controlgroup widget missing"), "option" === arguments[0] && "items" === arguments[1] && arguments[2] ? this.controlgroup.apply(this, [arguments[0], "items.button", arguments[2]]) : "option" === arguments[0] && "items" === arguments[1] ? this.controlgroup.apply(this, [arguments[0], "items.button"]) : ("object" == typeof arguments[0] && arguments[0].items && (arguments[0].items = { button: arguments[0].items }), this.controlgroup.apply(this, arguments)) }); var it; V.ui.button; function st() { this._curInst = null, this._keyEvent = !1, this._disabledInputs = [], this._datepickerShowing = !1, this._inDialog = !1, this._mainDivId = "ui-datepicker-div", this._inlineClass = "ui-datepicker-inline", this._appendClass = "ui-datepicker-append", this._triggerClass = "ui-datepicker-trigger", this._dialogClass = "ui-datepicker-dialog", this._disableClass = "ui-datepicker-disabled", this._unselectableClass = "ui-datepicker-unselectable", this._currentClass = "ui-datepicker-current-day", this._dayOverClass = "ui-datepicker-days-cell-over", this.regional = [], this.regional[""] = { closeText: "Done", prevText: "Prev", nextText: "Next", currentText: "Today", monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], weekHeader: "Wk", dateFormat: "mm/dd/yy", firstDay: 0, isRTL: !1, showMonthAfterYear: !1, yearSuffix: "", selectMonthLabel: "Select month", selectYearLabel: "Select year" }, this._defaults = { showOn: "focus", showAnim: "fadeIn", showOptions: {}, defaultDate: null, appendText: "", buttonText: "...", buttonImage: "", buttonImageOnly: !1, hideIfNoPrevNext: !1, navigationAsDateFormat: !1, gotoCurrent: !1, changeMonth: !1, changeYear: !1, yearRange: "c-10:c+10", showOtherMonths: !1, selectOtherMonths: !1, showWeek: !1, calculateWeek: this.iso8601Week, shortYearCutoff: "+10", minDate: null, maxDate: null, duration: "fast", beforeShowDay: null, beforeShow: null, onSelect: null, onChangeMonthYear: null, onClose: null, onUpdateDatepicker: null, numberOfMonths: 1, showCurrentAtPos: 0, stepMonths: 1, stepBigMonths: 12, altField: "", altFormat: "", constrainInput: !0, showButtonPanel: !1, autoSize: !1, disabled: !1 }, V.extend(this._defaults, this.regional[""]), this.regional.en = V.extend(!0, {}, this.regional[""]), this.regional["en-US"] = V.extend(!0, {}, this.regional.en), this.dpDiv = nt(V("<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")) } function nt(t) { var e = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a"; return t.on("mouseout", e, function () { V(this).removeClass("ui-state-hover"), -1 !== this.className.indexOf("ui-datepicker-prev") && V(this).removeClass("ui-datepicker-prev-hover"), -1 !== this.className.indexOf("ui-datepicker-next") && V(this).removeClass("ui-datepicker-next-hover") }).on("mouseover", e, ot) } function ot() { V.datepicker._isDisabledDatepicker((it.inline ? it.dpDiv.parent() : it.input)[0]) || (V(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"), V(this).addClass("ui-state-hover"), -1 !== this.className.indexOf("ui-datepicker-prev") && V(this).addClass("ui-datepicker-prev-hover"), -1 !== this.className.indexOf("ui-datepicker-next") && V(this).addClass("ui-datepicker-next-hover")) } function at(t, e) { for (var i in V.extend(t, e), e) null == e[i] && (t[i] = e[i]); return t } V.extend(V.ui, { datepicker: { version: "1.13.2" } }), V.extend(st.prototype, { markerClassName: "hasDatepicker", maxRows: 4, _widgetDatepicker: function () { return this.dpDiv }, setDefaults: function (t) { return at(this._defaults, t || {}), this }, _attachDatepicker: function (t, e) { var i, s = t.nodeName.toLowerCase(), n = "div" === s || "span" === s; t.id || (this.uuid += 1, t.id = "dp" + this.uuid), (i = this._newInst(V(t), n)).settings = V.extend({}, e || {}), "input" === s ? this._connectDatepicker(t, i) : n && this._inlineDatepicker(t, i) }, _newInst: function (t, e) { return { id: t[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1"), input: t, selectedDay: 0, selectedMonth: 0, selectedYear: 0, drawMonth: 0, drawYear: 0, inline: e, dpDiv: e ? nt(V("<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")) : this.dpDiv } }, _connectDatepicker: function (t, e) { var i = V(t); e.append = V([]), e.trigger = V([]), i.hasClass(this.markerClassName) || (this._attachments(i, e), i.addClass(this.markerClassName).on("keydown", this._doKeyDown).on("keypress", this._doKeyPress).on("keyup", this._doKeyUp), this._autoSize(e), V.data(t, "datepicker", e), e.settings.disabled && this._disableDatepicker(t)) }, _attachments: function (t, e) { var i, s = this._get(e, "appendText"), n = this._get(e, "isRTL"); e.append && e.append.remove(), s && (e.append = V("<span>").addClass(this._appendClass).text(s), t[n ? "before" : "after"](e.append)), t.off("focus", this._showDatepicker), e.trigger && e.trigger.remove(), "focus" !== (i = this._get(e, "showOn")) && "both" !== i || t.on("focus", this._showDatepicker), "button" !== i && "both" !== i || (s = this._get(e, "buttonText"), i = this._get(e, "buttonImage"), this._get(e, "buttonImageOnly") ? e.trigger = V("<img>").addClass(this._triggerClass).attr({ src: i, alt: s, title: s }) : (e.trigger = V("<button type='button'>").addClass(this._triggerClass), i ? e.trigger.html(V("<img>").attr({ src: i, alt: s, title: s })) : e.trigger.text(s)), t[n ? "before" : "after"](e.trigger), e.trigger.on("click", function () { return V.datepicker._datepickerShowing && V.datepicker._lastInput === t[0] ? V.datepicker._hideDatepicker() : (V.datepicker._datepickerShowing && V.datepicker._lastInput !== t[0] && V.datepicker._hideDatepicker(), V.datepicker._showDatepicker(t[0])), !1 })) }, _autoSize: function (t) { var e, i, s, n, o, a; this._get(t, "autoSize") && !t.inline && (o = new Date(2009, 11, 20), (a = this._get(t, "dateFormat")).match(/[DM]/) && (e = function (t) { for (n = s = i = 0; n < t.length; n++)t[n].length > i && (i = t[n].length, s = n); return s }, o.setMonth(e(this._get(t, a.match(/MM/) ? "monthNames" : "monthNamesShort"))), o.setDate(e(this._get(t, a.match(/DD/) ? "dayNames" : "dayNamesShort")) + 20 - o.getDay())), t.input.attr("size", this._formatDate(t, o).length)) }, _inlineDatepicker: function (t, e) { var i = V(t); i.hasClass(this.markerClassName) || (i.addClass(this.markerClassName).append(e.dpDiv), V.data(t, "datepicker", e), this._setDate(e, this._getDefaultDate(e), !0), this._updateDatepicker(e), this._updateAlternate(e), e.settings.disabled && this._disableDatepicker(t), e.dpDiv.css("display", "block")) }, _dialogDatepicker: function (t, e, i, s, n) { var o, a = this._dialogInst; return a || (this.uuid += 1, o = "dp" + this.uuid, this._dialogInput = V("<input type='text' id='" + o + "' style='position: absolute; top: -100px; width: 0px;'/>"), this._dialogInput.on("keydown", this._doKeyDown), V("body").append(this._dialogInput), (a = this._dialogInst = this._newInst(this._dialogInput, !1)).settings = {}, V.data(this._dialogInput[0], "datepicker", a)), at(a.settings, s || {}), e = e && e.constructor === Date ? this._formatDate(a, e) : e, this._dialogInput.val(e), this._pos = n ? n.length ? n : [n.pageX, n.pageY] : null, this._pos || (o = document.documentElement.clientWidth, s = document.documentElement.clientHeight, e = document.documentElement.scrollLeft || document.body.scrollLeft, n = document.documentElement.scrollTop || document.body.scrollTop, this._pos = [o / 2 - 100 + e, s / 2 - 150 + n]), this._dialogInput.css("left", this._pos[0] + 20 + "px").css("top", this._pos[1] + "px"), a.settings.onSelect = i, this._inDialog = !0, this.dpDiv.addClass(this._dialogClass), this._showDatepicker(this._dialogInput[0]), V.blockUI && V.blockUI(this.dpDiv), V.data(this._dialogInput[0], "datepicker", a), this }, _destroyDatepicker: function (t) { var e, i = V(t), s = V.data(t, "datepicker"); i.hasClass(this.markerClassName) && (e = t.nodeName.toLowerCase(), V.removeData(t, "datepicker"), "input" === e ? (s.append.remove(), s.trigger.remove(), i.removeClass(this.markerClassName).off("focus", this._showDatepicker).off("keydown", this._doKeyDown).off("keypress", this._doKeyPress).off("keyup", this._doKeyUp)) : "div" !== e && "span" !== e || i.removeClass(this.markerClassName).empty(), it === s && (it = null, this._curInst = null)) }, _enableDatepicker: function (e) { var t, i = V(e), s = V.data(e, "datepicker"); i.hasClass(this.markerClassName) && ("input" === (t = e.nodeName.toLowerCase()) ? (e.disabled = !1, s.trigger.filter("button").each(function () { this.disabled = !1 }).end().filter("img").css({ opacity: "1.0", cursor: "" })) : "div" !== t && "span" !== t || ((i = i.children("." + this._inlineClass)).children().removeClass("ui-state-disabled"), i.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !1)), this._disabledInputs = V.map(this._disabledInputs, function (t) { return t === e ? null : t })) }, _disableDatepicker: function (e) { var t, i = V(e), s = V.data(e, "datepicker"); i.hasClass(this.markerClassName) && ("input" === (t = e.nodeName.toLowerCase()) ? (e.disabled = !0, s.trigger.filter("button").each(function () { this.disabled = !0 }).end().filter("img").css({ opacity: "0.5", cursor: "default" })) : "div" !== t && "span" !== t || ((i = i.children("." + this._inlineClass)).children().addClass("ui-state-disabled"), i.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !0)), this._disabledInputs = V.map(this._disabledInputs, function (t) { return t === e ? null : t }), this._disabledInputs[this._disabledInputs.length] = e) }, _isDisabledDatepicker: function (t) { if (!t) return !1; for (var e = 0; e < this._disabledInputs.length; e++)if (this._disabledInputs[e] === t) return !0; return !1 }, _getInst: function (t) { try { return V.data(t, "datepicker") } catch (t) { throw "Missing instance data for this datepicker" } }, _optionDatepicker: function (t, e, i) { var s, n, o = this._getInst(t); if (2 === arguments.length && "string" == typeof e) return "defaults" === e ? V.extend({}, V.datepicker._defaults) : o ? "all" === e ? V.extend({}, o.settings) : this._get(o, e) : null; s = e || {}, "string" == typeof e && ((s = {})[e] = i), o && (this._curInst === o && this._hideDatepicker(), n = this._getDateDatepicker(t, !0), e = this._getMinMaxDate(o, "min"), i = this._getMinMaxDate(o, "max"), at(o.settings, s), null !== e && void 0 !== s.dateFormat && void 0 === s.minDate && (o.settings.minDate = this._formatDate(o, e)), null !== i && void 0 !== s.dateFormat && void 0 === s.maxDate && (o.settings.maxDate = this._formatDate(o, i)), "disabled" in s && (s.disabled ? this._disableDatepicker(t) : this._enableDatepicker(t)), this._attachments(V(t), o), this._autoSize(o), this._setDate(o, n), this._updateAlternate(o), this._updateDatepicker(o)) }, _changeDatepicker: function (t, e, i) { this._optionDatepicker(t, e, i) }, _refreshDatepicker: function (t) { t = this._getInst(t); t && this._updateDatepicker(t) }, _setDateDatepicker: function (t, e) { t = this._getInst(t); t && (this._setDate(t, e), this._updateDatepicker(t), this._updateAlternate(t)) }, _getDateDatepicker: function (t, e) { t = this._getInst(t); return t && !t.inline && this._setDateFromField(t, e), t ? this._getDate(t) : null }, _doKeyDown: function (t) { var e, i, s = V.datepicker._getInst(t.target), n = !0, o = s.dpDiv.is(".ui-datepicker-rtl"); if (s._keyEvent = !0, V.datepicker._datepickerShowing) switch (t.keyCode) { case 9: V.datepicker._hideDatepicker(), n = !1; break; case 13: return (i = V("td." + V.datepicker._dayOverClass + ":not(." + V.datepicker._currentClass + ")", s.dpDiv))[0] && V.datepicker._selectDay(t.target, s.selectedMonth, s.selectedYear, i[0]), (e = V.datepicker._get(s, "onSelect")) ? (i = V.datepicker._formatDate(s), e.apply(s.input ? s.input[0] : null, [i, s])) : V.datepicker._hideDatepicker(), !1; case 27: V.datepicker._hideDatepicker(); break; case 33: V.datepicker._adjustDate(t.target, t.ctrlKey ? -V.datepicker._get(s, "stepBigMonths") : -V.datepicker._get(s, "stepMonths"), "M"); break; case 34: V.datepicker._adjustDate(t.target, t.ctrlKey ? +V.datepicker._get(s, "stepBigMonths") : +V.datepicker._get(s, "stepMonths"), "M"); break; case 35: (t.ctrlKey || t.metaKey) && V.datepicker._clearDate(t.target), n = t.ctrlKey || t.metaKey; break; case 36: (t.ctrlKey || t.metaKey) && V.datepicker._gotoToday(t.target), n = t.ctrlKey || t.metaKey; break; case 37: (t.ctrlKey || t.metaKey) && V.datepicker._adjustDate(t.target, o ? 1 : -1, "D"), n = t.ctrlKey || t.metaKey, t.originalEvent.altKey && V.datepicker._adjustDate(t.target, t.ctrlKey ? -V.datepicker._get(s, "stepBigMonths") : -V.datepicker._get(s, "stepMonths"), "M"); break; case 38: (t.ctrlKey || t.metaKey) && V.datepicker._adjustDate(t.target, -7, "D"), n = t.ctrlKey || t.metaKey; break; case 39: (t.ctrlKey || t.metaKey) && V.datepicker._adjustDate(t.target, o ? -1 : 1, "D"), n = t.ctrlKey || t.metaKey, t.originalEvent.altKey && V.datepicker._adjustDate(t.target, t.ctrlKey ? +V.datepicker._get(s, "stepBigMonths") : +V.datepicker._get(s, "stepMonths"), "M"); break; case 40: (t.ctrlKey || t.metaKey) && V.datepicker._adjustDate(t.target, 7, "D"), n = t.ctrlKey || t.metaKey; break; default: n = !1 } else 36 === t.keyCode && t.ctrlKey ? V.datepicker._showDatepicker(this) : n = !1; n && (t.preventDefault(), t.stopPropagation()) }, _doKeyPress: function (t) { var e, i = V.datepicker._getInst(t.target); if (V.datepicker._get(i, "constrainInput")) return e = V.datepicker._possibleChars(V.datepicker._get(i, "dateFormat")), i = String.fromCharCode(null == t.charCode ? t.keyCode : t.charCode), t.ctrlKey || t.metaKey || i < " " || !e || -1 < e.indexOf(i) }, _doKeyUp: function (t) { t = V.datepicker._getInst(t.target); if (t.input.val() !== t.lastVal) try { V.datepicker.parseDate(V.datepicker._get(t, "dateFormat"), t.input ? t.input.val() : null, V.datepicker._getFormatConfig(t)) && (V.datepicker._setDateFromField(t), V.datepicker._updateAlternate(t), V.datepicker._updateDatepicker(t)) } catch (t) { } return !0 }, _showDatepicker: function (t) { var e, i, s, n; "input" !== (t = t.target || t).nodeName.toLowerCase() && (t = V("input", t.parentNode)[0]), V.datepicker._isDisabledDatepicker(t) || V.datepicker._lastInput === t || (n = V.datepicker._getInst(t), V.datepicker._curInst && V.datepicker._curInst !== n && (V.datepicker._curInst.dpDiv.stop(!0, !0), n && V.datepicker._datepickerShowing && V.datepicker._hideDatepicker(V.datepicker._curInst.input[0])), !1 !== (i = (s = V.datepicker._get(n, "beforeShow")) ? s.apply(t, [t, n]) : {}) && (at(n.settings, i), n.lastVal = null, V.datepicker._lastInput = t, V.datepicker._setDateFromField(n), V.datepicker._inDialog && (t.value = ""), V.datepicker._pos || (V.datepicker._pos = V.datepicker._findPos(t), V.datepicker._pos[1] += t.offsetHeight), e = !1, V(t).parents().each(function () { return !(e |= "fixed" === V(this).css("position")) }), s = { left: V.datepicker._pos[0], top: V.datepicker._pos[1] }, V.datepicker._pos = null, n.dpDiv.empty(), n.dpDiv.css({ position: "absolute", display: "block", top: "-1000px" }), V.datepicker._updateDatepicker(n), s = V.datepicker._checkOffset(n, s, e), n.dpDiv.css({ position: V.datepicker._inDialog && V.blockUI ? "static" : e ? "fixed" : "absolute", display: "none", left: s.left + "px", top: s.top + "px" }), n.inline || (i = V.datepicker._get(n, "showAnim"), s = V.datepicker._get(n, "duration"), n.dpDiv.css("z-index", function (t) { for (var e, i; t.length && t[0] !== document;) { if (("absolute" === (e = t.css("position")) || "relative" === e || "fixed" === e) && (i = parseInt(t.css("zIndex"), 10), !isNaN(i) && 0 !== i)) return i; t = t.parent() } return 0 }(V(t)) + 1), V.datepicker._datepickerShowing = !0, V.effects && V.effects.effect[i] ? n.dpDiv.show(i, V.datepicker._get(n, "showOptions"), s) : n.dpDiv[i || "show"](i ? s : null), V.datepicker._shouldFocusInput(n) && n.input.trigger("focus"), V.datepicker._curInst = n))) }, _updateDatepicker: function (t) { this.maxRows = 4, (it = t).dpDiv.empty().append(this._generateHTML(t)), this._attachHandlers(t); var e, i = this._getNumberOfMonths(t), s = i[1], n = t.dpDiv.find("." + this._dayOverClass + " a"), o = V.datepicker._get(t, "onUpdateDatepicker"); 0 < n.length && ot.apply(n.get(0)), t.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""), 1 < s && t.dpDiv.addClass("ui-datepicker-multi-" + s).css("width", 17 * s + "em"), t.dpDiv[(1 !== i[0] || 1 !== i[1] ? "add" : "remove") + "Class"]("ui-datepicker-multi"), t.dpDiv[(this._get(t, "isRTL") ? "add" : "remove") + "Class"]("ui-datepicker-rtl"), t === V.datepicker._curInst && V.datepicker._datepickerShowing && V.datepicker._shouldFocusInput(t) && t.input.trigger("focus"), t.yearshtml && (e = t.yearshtml, setTimeout(function () { e === t.yearshtml && t.yearshtml && t.dpDiv.find("select.ui-datepicker-year").first().replaceWith(t.yearshtml), e = t.yearshtml = null }, 0)), o && o.apply(t.input ? t.input[0] : null, [t]) }, _shouldFocusInput: function (t) { return t.input && t.input.is(":visible") && !t.input.is(":disabled") && !t.input.is(":focus") }, _checkOffset: function (t, e, i) { var s = t.dpDiv.outerWidth(), n = t.dpDiv.outerHeight(), o = t.input ? t.input.outerWidth() : 0, a = t.input ? t.input.outerHeight() : 0, r = document.documentElement.clientWidth + (i ? 0 : V(document).scrollLeft()), l = document.documentElement.clientHeight + (i ? 0 : V(document).scrollTop()); return e.left -= this._get(t, "isRTL") ? s - o : 0, e.left -= i && e.left === t.input.offset().left ? V(document).scrollLeft() : 0, e.top -= i && e.top === t.input.offset().top + a ? V(document).scrollTop() : 0, e.left -= Math.min(e.left, e.left + s > r && s < r ? Math.abs(e.left + s - r) : 0), e.top -= Math.min(e.top, e.top + n > l && n < l ? Math.abs(n + a) : 0), e }, _findPos: function (t) { for (var e = this._getInst(t), i = this._get(e, "isRTL"); t && ("hidden" === t.type || 1 !== t.nodeType || V.expr.pseudos.hidden(t));)t = t[i ? "previousSibling" : "nextSibling"]; return [(e = V(t).offset()).left, e.top] }, _hideDatepicker: function (t) { var e, i, s = this._curInst; !s || t && s !== V.data(t, "datepicker") || this._datepickerShowing && (e = this._get(s, "showAnim"), i = this._get(s, "duration"), t = function () { V.datepicker._tidyDialog(s) }, V.effects && (V.effects.effect[e] || V.effects[e]) ? s.dpDiv.hide(e, V.datepicker._get(s, "showOptions"), i, t) : s.dpDiv["slideDown" === e ? "slideUp" : "fadeIn" === e ? "fadeOut" : "hide"](e ? i : null, t), e || t(), this._datepickerShowing = !1, (t = this._get(s, "onClose")) && t.apply(s.input ? s.input[0] : null, [s.input ? s.input.val() : "", s]), this._lastInput = null, this._inDialog && (this._dialogInput.css({ position: "absolute", left: "0", top: "-100px" }), V.blockUI && (V.unblockUI(), V("body").append(this.dpDiv))), this._inDialog = !1) }, _tidyDialog: function (t) { t.dpDiv.removeClass(this._dialogClass).off(".ui-datepicker-calendar") }, _checkExternalClick: function (t) { var e; V.datepicker._curInst && (e = V(t.target), t = V.datepicker._getInst(e[0]), (e[0].id === V.datepicker._mainDivId || 0 !== e.parents("#" + V.datepicker._mainDivId).length || e.hasClass(V.datepicker.markerClassName) || e.closest("." + V.datepicker._triggerClass).length || !V.datepicker._datepickerShowing || V.datepicker._inDialog && V.blockUI) && (!e.hasClass(V.datepicker.markerClassName) || V.datepicker._curInst === t) || V.datepicker._hideDatepicker()) }, _adjustDate: function (t, e, i) { var s = V(t), t = this._getInst(s[0]); this._isDisabledDatepicker(s[0]) || (this._adjustInstDate(t, e, i), this._updateDatepicker(t)) }, _gotoToday: function (t) { var e = V(t), i = this._getInst(e[0]); this._get(i, "gotoCurrent") && i.currentDay ? (i.selectedDay = i.currentDay, i.drawMonth = i.selectedMonth = i.currentMonth, i.drawYear = i.selectedYear = i.currentYear) : (t = new Date, i.selectedDay = t.getDate(), i.drawMonth = i.selectedMonth = t.getMonth(), i.drawYear = i.selectedYear = t.getFullYear()), this._notifyChange(i), this._adjustDate(e) }, _selectMonthYear: function (t, e, i) { var s = V(t), t = this._getInst(s[0]); t["selected" + ("M" === i ? "Month" : "Year")] = t["draw" + ("M" === i ? "Month" : "Year")] = parseInt(e.options[e.selectedIndex].value, 10), this._notifyChange(t), this._adjustDate(s) }, _selectDay: function (t, e, i, s) { var n = V(t); V(s).hasClass(this._unselectableClass) || this._isDisabledDatepicker(n[0]) || ((n = this._getInst(n[0])).selectedDay = n.currentDay = parseInt(V("a", s).attr("data-date")), n.selectedMonth = n.currentMonth = e, n.selectedYear = n.currentYear = i, this._selectDate(t, this._formatDate(n, n.currentDay, n.currentMonth, n.currentYear))) }, _clearDate: function (t) { t = V(t); this._selectDate(t, "") }, _selectDate: function (t, e) { var i = V(t), t = this._getInst(i[0]); e = null != e ? e : this._formatDate(t), t.input && t.input.val(e), this._updateAlternate(t), (i = this._get(t, "onSelect")) ? i.apply(t.input ? t.input[0] : null, [e, t]) : t.input && t.input.trigger("change"), t.inline ? this._updateDatepicker(t) : (this._hideDatepicker(), this._lastInput = t.input[0], "object" != typeof t.input[0] && t.input.trigger("focus"), this._lastInput = null) }, _updateAlternate: function (t) { var e, i, s = this._get(t, "altField"); s && (e = this._get(t, "altFormat") || this._get(t, "dateFormat"), i = this._getDate(t), t = this.formatDate(e, i, this._getFormatConfig(t)), V(document).find(s).val(t)) }, noWeekends: function (t) { t = t.getDay(); return [0 < t && t < 6, ""] }, iso8601Week: function (t) { var e = new Date(t.getTime()); return e.setDate(e.getDate() + 4 - (e.getDay() || 7)), t = e.getTime(), e.setMonth(0), e.setDate(1), Math.floor(Math.round((t - e) / 864e5) / 7) + 1 }, parseDate: function (e, n, t) { if (null == e || null == n) throw "Invalid arguments"; if ("" === (n = "object" == typeof n ? n.toString() : n + "")) return null; for (var i, s, o, a = 0, r = (t ? t.shortYearCutoff : null) || this._defaults.shortYearCutoff, r = "string" != typeof r ? r : (new Date).getFullYear() % 100 + parseInt(r, 10), l = (t ? t.dayNamesShort : null) || this._defaults.dayNamesShort, h = (t ? t.dayNames : null) || this._defaults.dayNames, c = (t ? t.monthNamesShort : null) || this._defaults.monthNamesShort, u = (t ? t.monthNames : null) || this._defaults.monthNames, d = -1, p = -1, f = -1, g = -1, m = !1, _ = function (t) { t = w + 1 < e.length && e.charAt(w + 1) === t; return t && w++ , t }, v = function (t) { var e = _(t), e = "@" === t ? 14 : "!" === t ? 20 : "y" === t && e ? 4 : "o" === t ? 3 : 2, e = new RegExp("^\\d{" + ("y" === t ? e : 1) + "," + e + "}"), e = n.substring(a).match(e); if (!e) throw "Missing number at position " + a; return a += e[0].length, parseInt(e[0], 10) }, b = function (t, e, i) { var s = -1, e = V.map(_(t) ? i : e, function (t, e) { return [[e, t]] }).sort(function (t, e) { return -(t[1].length - e[1].length) }); if (V.each(e, function (t, e) { var i = e[1]; if (n.substr(a, i.length).toLowerCase() === i.toLowerCase()) return s = e[0], a += i.length, !1 }), -1 !== s) return s + 1; throw "Unknown name at position " + a }, y = function () { if (n.charAt(a) !== e.charAt(w)) throw "Unexpected literal at position " + a; a++ }, w = 0; w < e.length; w++)if (m) "'" !== e.charAt(w) || _("'") ? y() : m = !1; else switch (e.charAt(w)) { case "d": f = v("d"); break; case "D": b("D", l, h); break; case "o": g = v("o"); break; case "m": p = v("m"); break; case "M": p = b("M", c, u); break; case "y": d = v("y"); break; case "@": d = (o = new Date(v("@"))).getFullYear(), p = o.getMonth() + 1, f = o.getDate(); break; case "!": d = (o = new Date((v("!") - this._ticksTo1970) / 1e4)).getFullYear(), p = o.getMonth() + 1, f = o.getDate(); break; case "'": _("'") ? y() : m = !0; break; default: y() }if (a < n.length && (s = n.substr(a), !/^\s+/.test(s))) throw "Extra/unparsed characters found in date: " + s; if (-1 === d ? d = (new Date).getFullYear() : d < 100 && (d += (new Date).getFullYear() - (new Date).getFullYear() % 100 + (d <= r ? 0 : -100)), -1 < g) for (p = 1, f = g; ;) { if (f <= (i = this._getDaysInMonth(d, p - 1))) break; p++ , f -= i } if ((o = this._daylightSavingAdjust(new Date(d, p - 1, f))).getFullYear() !== d || o.getMonth() + 1 !== p || o.getDate() !== f) throw "Invalid date"; return o }, ATOM: "yy-mm-dd", COOKIE: "D, dd M yy", ISO_8601: "yy-mm-dd", RFC_822: "D, d M y", RFC_850: "DD, dd-M-y", RFC_1036: "D, d M y", RFC_1123: "D, d M yy", RFC_2822: "D, d M yy", RSS: "D, d M y", TICKS: "!", TIMESTAMP: "@", W3C: "yy-mm-dd", _ticksTo1970: 24 * (718685 + Math.floor(492.5) - Math.floor(19.7) + Math.floor(4.925)) * 60 * 60 * 1e7, formatDate: function (e, t, i) { if (!t) return ""; function s(t, e, i) { var s = "" + e; if (c(t)) for (; s.length < i;)s = "0" + s; return s } function n(t, e, i, s) { return (c(t) ? s : i)[e] } var o, a = (i ? i.dayNamesShort : null) || this._defaults.dayNamesShort, r = (i ? i.dayNames : null) || this._defaults.dayNames, l = (i ? i.monthNamesShort : null) || this._defaults.monthNamesShort, h = (i ? i.monthNames : null) || this._defaults.monthNames, c = function (t) { t = o + 1 < e.length && e.charAt(o + 1) === t; return t && o++ , t }, u = "", d = !1; if (t) for (o = 0; o < e.length; o++)if (d) "'" !== e.charAt(o) || c("'") ? u += e.charAt(o) : d = !1; else switch (e.charAt(o)) { case "d": u += s("d", t.getDate(), 2); break; case "D": u += n("D", t.getDay(), a, r); break; case "o": u += s("o", Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() - new Date(t.getFullYear(), 0, 0).getTime()) / 864e5), 3); break; case "m": u += s("m", t.getMonth() + 1, 2); break; case "M": u += n("M", t.getMonth(), l, h); break; case "y": u += c("y") ? t.getFullYear() : (t.getFullYear() % 100 < 10 ? "0" : "") + t.getFullYear() % 100; break; case "@": u += t.getTime(); break; case "!": u += 1e4 * t.getTime() + this._ticksTo1970; break; case "'": c("'") ? u += "'" : d = !0; break; default: u += e.charAt(o) }return u }, _possibleChars: function (e) { for (var t = "", i = !1, s = function (t) { t = n + 1 < e.length && e.charAt(n + 1) === t; return t && n++ , t }, n = 0; n < e.length; n++)if (i) "'" !== e.charAt(n) || s("'") ? t += e.charAt(n) : i = !1; else switch (e.charAt(n)) { case "d": case "m": case "y": case "@": t += "0123456789"; break; case "D": case "M": return null; case "'": s("'") ? t += "'" : i = !0; break; default: t += e.charAt(n) }return t }, _get: function (t, e) { return (void 0 !== t.settings[e] ? t.settings : this._defaults)[e] }, _setDateFromField: function (t, e) { if (t.input.val() !== t.lastVal) { var i = this._get(t, "dateFormat"), s = t.lastVal = t.input ? t.input.val() : null, n = this._getDefaultDate(t), o = n, a = this._getFormatConfig(t); try { o = this.parseDate(i, s, a) || n } catch (t) { s = e ? "" : s } t.selectedDay = o.getDate(), t.drawMonth = t.selectedMonth = o.getMonth(), t.drawYear = t.selectedYear = o.getFullYear(), t.currentDay = s ? o.getDate() : 0, t.currentMonth = s ? o.getMonth() : 0, t.currentYear = s ? o.getFullYear() : 0, this._adjustInstDate(t) } }, _getDefaultDate: function (t) { return this._restrictMinMax(t, this._determineDate(t, this._get(t, "defaultDate"), new Date)) }, _determineDate: function (r, t, e) { var i, s, t = null == t || "" === t ? e : "string" == typeof t ? function (t) { try { return V.datepicker.parseDate(V.datepicker._get(r, "dateFormat"), t, V.datepicker._getFormatConfig(r)) } catch (t) { } for (var e = (t.toLowerCase().match(/^c/) ? V.datepicker._getDate(r) : null) || new Date, i = e.getFullYear(), s = e.getMonth(), n = e.getDate(), o = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g, a = o.exec(t); a;) { switch (a[2] || "d") { case "d": case "D": n += parseInt(a[1], 10); break; case "w": case "W": n += 7 * parseInt(a[1], 10); break; case "m": case "M": s += parseInt(a[1], 10), n = Math.min(n, V.datepicker._getDaysInMonth(i, s)); break; case "y": case "Y": i += parseInt(a[1], 10), n = Math.min(n, V.datepicker._getDaysInMonth(i, s)) }a = o.exec(t) } return new Date(i, s, n) }(t) : "number" == typeof t ? isNaN(t) ? e : (i = t, (s = new Date).setDate(s.getDate() + i), s) : new Date(t.getTime()); return (t = t && "Invalid Date" === t.toString() ? e : t) && (t.setHours(0), t.setMinutes(0), t.setSeconds(0), t.setMilliseconds(0)), this._daylightSavingAdjust(t) }, _daylightSavingAdjust: function (t) { return t ? (t.setHours(12 < t.getHours() ? t.getHours() + 2 : 0), t) : null }, _setDate: function (t, e, i) { var s = !e, n = t.selectedMonth, o = t.selectedYear, e = this._restrictMinMax(t, this._determineDate(t, e, new Date)); t.selectedDay = t.currentDay = e.getDate(), t.drawMonth = t.selectedMonth = t.currentMonth = e.getMonth(), t.drawYear = t.selectedYear = t.currentYear = e.getFullYear(), n === t.selectedMonth && o === t.selectedYear || i || this._notifyChange(t), this._adjustInstDate(t), t.input && t.input.val(s ? "" : this._formatDate(t)) }, _getDate: function (t) { return !t.currentYear || t.input && "" === t.input.val() ? null : this._daylightSavingAdjust(new Date(t.currentYear, t.currentMonth, t.currentDay)) }, _attachHandlers: function (t) { var e = this._get(t, "stepMonths"), i = "#" + t.id.replace(/\\\\/g, "\\"); t.dpDiv.find("[data-handler]").map(function () { var t = { prev: function () { V.datepicker._adjustDate(i, -e, "M") }, next: function () { V.datepicker._adjustDate(i, +e, "M") }, hide: function () { V.datepicker._hideDatepicker() }, today: function () { V.datepicker._gotoToday(i) }, selectDay: function () { return V.datepicker._selectDay(i, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this), !1 }, selectMonth: function () { return V.datepicker._selectMonthYear(i, this, "M"), !1 }, selectYear: function () { return V.datepicker._selectMonthYear(i, this, "Y"), !1 } }; V(this).on(this.getAttribute("data-event"), t[this.getAttribute("data-handler")]) }) }, _generateHTML: function (t) { var e, i, s, n, o, a, r, l, h, c, u, d, p, f, g, m, _, v, b, y, w, x, k, C, D, I, T, P, M, S, H, z, A = new Date, O = this._daylightSavingAdjust(new Date(A.getFullYear(), A.getMonth(), A.getDate())), N = this._get(t, "isRTL"), E = this._get(t, "showButtonPanel"), W = this._get(t, "hideIfNoPrevNext"), F = this._get(t, "navigationAsDateFormat"), L = this._getNumberOfMonths(t), R = this._get(t, "showCurrentAtPos"), A = this._get(t, "stepMonths"), Y = 1 !== L[0] || 1 !== L[1], B = this._daylightSavingAdjust(t.currentDay ? new Date(t.currentYear, t.currentMonth, t.currentDay) : new Date(9999, 9, 9)), j = this._getMinMaxDate(t, "min"), q = this._getMinMaxDate(t, "max"), K = t.drawMonth - R, U = t.drawYear; if (K < 0 && (K += 12, U--), q) for (e = this._daylightSavingAdjust(new Date(q.getFullYear(), q.getMonth() - L[0] * L[1] + 1, q.getDate())), e = j && e < j ? j : e; this._daylightSavingAdjust(new Date(U, K, 1)) > e;)--K < 0 && (K = 11, U--); for (t.drawMonth = K, t.drawYear = U, R = this._get(t, "prevText"), R = F ? this.formatDate(R, this._daylightSavingAdjust(new Date(U, K - A, 1)), this._getFormatConfig(t)) : R, i = this._canAdjustMonth(t, -1, U, K) ? V("<a>").attr({ class: "ui-datepicker-prev ui-corner-all", "data-handler": "prev", "data-event": "click", title: R }).append(V("<span>").addClass("ui-icon ui-icon-circle-triangle-" + (N ? "e" : "w")).text(R))[0].outerHTML : W ? "" : V("<a>").attr({ class: "ui-datepicker-prev ui-corner-all ui-state-disabled", title: R }).append(V("<span>").addClass("ui-icon ui-icon-circle-triangle-" + (N ? "e" : "w")).text(R))[0].outerHTML, R = this._get(t, "nextText"), R = F ? this.formatDate(R, this._daylightSavingAdjust(new Date(U, K + A, 1)), this._getFormatConfig(t)) : R, s = this._canAdjustMonth(t, 1, U, K) ? V("<a>").attr({ class: "ui-datepicker-next ui-corner-all", "data-handler": "next", "data-event": "click", title: R }).append(V("<span>").addClass("ui-icon ui-icon-circle-triangle-" + (N ? "w" : "e")).text(R))[0].outerHTML : W ? "" : V("<a>").attr({ class: "ui-datepicker-next ui-corner-all ui-state-disabled", title: R }).append(V("<span>").attr("class", "ui-icon ui-icon-circle-triangle-" + (N ? "w" : "e")).text(R))[0].outerHTML, A = this._get(t, "currentText"), W = this._get(t, "gotoCurrent") && t.currentDay ? B : O, A = F ? this.formatDate(A, W, this._getFormatConfig(t)) : A, R = "", t.inline || (R = V("<button>").attr({ type: "button", class: "ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all", "data-handler": "hide", "data-event": "click" }).text(this._get(t, "closeText"))[0].outerHTML), F = "", E && (F = V("<div class='ui-datepicker-buttonpane ui-widget-content'>").append(N ? R : "").append(this._isInRange(t, W) ? V("<button>").attr({ type: "button", class: "ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all", "data-handler": "today", "data-event": "click" }).text(A) : "").append(N ? "" : R)[0].outerHTML), n = parseInt(this._get(t, "firstDay"), 10), n = isNaN(n) ? 0 : n, o = this._get(t, "showWeek"), a = this._get(t, "dayNames"), r = this._get(t, "dayNamesMin"), l = this._get(t, "monthNames"), h = this._get(t, "monthNamesShort"), c = this._get(t, "beforeShowDay"), u = this._get(t, "showOtherMonths"), d = this._get(t, "selectOtherMonths"), p = this._getDefaultDate(t), f = "", m = 0; m < L[0]; m++) { for (_ = "", this.maxRows = 4, v = 0; v < L[1]; v++) { if (b = this._daylightSavingAdjust(new Date(U, K, t.selectedDay)), y = " ui-corner-all", w = "", Y) { if (w += "<div class='ui-datepicker-group", 1 < L[1]) switch (v) { case 0: w += " ui-datepicker-group-first", y = " ui-corner-" + (N ? "right" : "left"); break; case L[1] - 1: w += " ui-datepicker-group-last", y = " ui-corner-" + (N ? "left" : "right"); break; default: w += " ui-datepicker-group-middle", y = "" }w += "'>" } for (w += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + y + "'>" + (/all|left/.test(y) && 0 === m ? N ? s : i : "") + (/all|right/.test(y) && 0 === m ? N ? i : s : "") + this._generateMonthYearHeader(t, K, U, j, q, 0 < m || 0 < v, l, h) + "</div><table class='ui-datepicker-calendar'><thead><tr>", x = o ? "<th class='ui-datepicker-week-col'>" + this._get(t, "weekHeader") + "</th>" : "", g = 0; g < 7; g++)x += "<th scope='col'" + (5 <= (g + n + 6) % 7 ? " class='ui-datepicker-week-end'" : "") + "><span title='" + a[k = (g + n) % 7] + "'>" + r[k] + "</span></th>"; for (w += x + "</tr></thead><tbody>", D = this._getDaysInMonth(U, K), U === t.selectedYear && K === t.selectedMonth && (t.selectedDay = Math.min(t.selectedDay, D)), C = (this._getFirstDayOfMonth(U, K) - n + 7) % 7, D = Math.ceil((C + D) / 7), I = Y && this.maxRows > D ? this.maxRows : D, this.maxRows = I, T = this._daylightSavingAdjust(new Date(U, K, 1 - C)), P = 0; P < I; P++) { for (w += "<tr>", M = o ? "<td class='ui-datepicker-week-col'>" + this._get(t, "calculateWeek")(T) + "</td>" : "", g = 0; g < 7; g++)S = c ? c.apply(t.input ? t.input[0] : null, [T]) : [!0, ""], z = (H = T.getMonth() !== K) && !d || !S[0] || j && T < j || q && q < T, M += "<td class='" + (5 <= (g + n + 6) % 7 ? " ui-datepicker-week-end" : "") + (H ? " ui-datepicker-other-month" : "") + (T.getTime() === b.getTime() && K === t.selectedMonth && t._keyEvent || p.getTime() === T.getTime() && p.getTime() === b.getTime() ? " " + this._dayOverClass : "") + (z ? " " + this._unselectableClass + " ui-state-disabled" : "") + (H && !u ? "" : " " + S[1] + (T.getTime() === B.getTime() ? " " + this._currentClass : "") + (T.getTime() === O.getTime() ? " ui-datepicker-today" : "")) + "'" + (H && !u || !S[2] ? "" : " title='" + S[2].replace(/'/g, "&#39;") + "'") + (z ? "" : " data-handler='selectDay' data-event='click' data-month='" + T.getMonth() + "' data-year='" + T.getFullYear() + "'") + ">" + (H && !u ? "&#xa0;" : z ? "<span class='ui-state-default'>" + T.getDate() + "</span>" : "<a class='ui-state-default" + (T.getTime() === O.getTime() ? " ui-state-highlight" : "") + (T.getTime() === B.getTime() ? " ui-state-active" : "") + (H ? " ui-priority-secondary" : "") + "' href='#' aria-current='" + (T.getTime() === B.getTime() ? "true" : "false") + "' data-date='" + T.getDate() + "'>" + T.getDate() + "</a>") + "</td>", T.setDate(T.getDate() + 1), T = this._daylightSavingAdjust(T); w += M + "</tr>" } 11 < ++K && (K = 0, U++), _ += w += "</tbody></table>" + (Y ? "</div>" + (0 < L[0] && v === L[1] - 1 ? "<div class='ui-datepicker-row-break'></div>" : "") : "") } f += _ } return f += F, t._keyEvent = !1, f }, _generateMonthYearHeader: function (t, e, i, s, n, o, a, r) { var l, h, c, u, d, p, f = this._get(t, "changeMonth"), g = this._get(t, "changeYear"), m = this._get(t, "showMonthAfterYear"), _ = this._get(t, "selectMonthLabel"), v = this._get(t, "selectYearLabel"), b = "<div class='ui-datepicker-title'>", y = ""; if (o || !f) y += "<span class='ui-datepicker-month'>" + a[e] + "</span>"; else { for (l = s && s.getFullYear() === i, h = n && n.getFullYear() === i, y += "<select class='ui-datepicker-month' aria-label='" + _ + "' data-handler='selectMonth' data-event='change'>", c = 0; c < 12; c++)(!l || c >= s.getMonth()) && (!h || c <= n.getMonth()) && (y += "<option value='" + c + "'" + (c === e ? " selected='selected'" : "") + ">" + r[c] + "</option>"); y += "</select>" } if (m || (b += y + (!o && f && g ? "" : "&#xa0;")), !t.yearshtml) if (t.yearshtml = "", o || !g) b += "<span class='ui-datepicker-year'>" + i + "</span>"; else { for (a = this._get(t, "yearRange").split(":"), u = (new Date).getFullYear(), d = (_ = function (t) { t = t.match(/c[+\-].*/) ? i + parseInt(t.substring(1), 10) : t.match(/[+\-].*/) ? u + parseInt(t, 10) : parseInt(t, 10); return isNaN(t) ? u : t })(a[0]), p = Math.max(d, _(a[1] || "")), d = s ? Math.max(d, s.getFullYear()) : d, p = n ? Math.min(p, n.getFullYear()) : p, t.yearshtml += "<select class='ui-datepicker-year' aria-label='" + v + "' data-handler='selectYear' data-event='change'>"; d <= p; d++)t.yearshtml += "<option value='" + d + "'" + (d === i ? " selected='selected'" : "") + ">" + d + "</option>"; t.yearshtml += "</select>", b += t.yearshtml, t.yearshtml = null } return b += this._get(t, "yearSuffix"), m && (b += (!o && f && g ? "" : "&#xa0;") + y), b += "</div>" }, _adjustInstDate: function (t, e, i) { var s = t.selectedYear + ("Y" === i ? e : 0), n = t.selectedMonth + ("M" === i ? e : 0), e = Math.min(t.selectedDay, this._getDaysInMonth(s, n)) + ("D" === i ? e : 0), e = this._restrictMinMax(t, this._daylightSavingAdjust(new Date(s, n, e))); t.selectedDay = e.getDate(), t.drawMonth = t.selectedMonth = e.getMonth(), t.drawYear = t.selectedYear = e.getFullYear(), "M" !== i && "Y" !== i || this._notifyChange(t) }, _restrictMinMax: function (t, e) { var i = this._getMinMaxDate(t, "min"), t = this._getMinMaxDate(t, "max"), e = i && e < i ? i : e; return t && t < e ? t : e }, _notifyChange: function (t) { var e = this._get(t, "onChangeMonthYear"); e && e.apply(t.input ? t.input[0] : null, [t.selectedYear, t.selectedMonth + 1, t]) }, _getNumberOfMonths: function (t) { t = this._get(t, "numberOfMonths"); return null == t ? [1, 1] : "number" == typeof t ? [1, t] : t }, _getMinMaxDate: function (t, e) { return this._determineDate(t, this._get(t, e + "Date"), null) }, _getDaysInMonth: function (t, e) { return 32 - this._daylightSavingAdjust(new Date(t, e, 32)).getDate() }, _getFirstDayOfMonth: function (t, e) { return new Date(t, e, 1).getDay() }, _canAdjustMonth: function (t, e, i, s) { var n = this._getNumberOfMonths(t), n = this._daylightSavingAdjust(new Date(i, s + (e < 0 ? e : n[0] * n[1]), 1)); return e < 0 && n.setDate(this._getDaysInMonth(n.getFullYear(), n.getMonth())), this._isInRange(t, n) }, _isInRange: function (t, e) { var i = this._getMinMaxDate(t, "min"), s = this._getMinMaxDate(t, "max"), n = null, o = null, a = this._get(t, "yearRange"); return a && (t = a.split(":"), a = (new Date).getFullYear(), n = parseInt(t[0], 10), o = parseInt(t[1], 10), t[0].match(/[+\-].*/) && (n += a), t[1].match(/[+\-].*/) && (o += a)), (!i || e.getTime() >= i.getTime()) && (!s || e.getTime() <= s.getTime()) && (!n || e.getFullYear() >= n) && (!o || e.getFullYear() <= o) }, _getFormatConfig: function (t) { var e = this._get(t, "shortYearCutoff"); return { shortYearCutoff: e = "string" != typeof e ? e : (new Date).getFullYear() % 100 + parseInt(e, 10), dayNamesShort: this._get(t, "dayNamesShort"), dayNames: this._get(t, "dayNames"), monthNamesShort: this._get(t, "monthNamesShort"), monthNames: this._get(t, "monthNames") } }, _formatDate: function (t, e, i, s) { e || (t.currentDay = t.selectedDay, t.currentMonth = t.selectedMonth, t.currentYear = t.selectedYear); e = e ? "object" == typeof e ? e : this._daylightSavingAdjust(new Date(s, i, e)) : this._daylightSavingAdjust(new Date(t.currentYear, t.currentMonth, t.currentDay)); return this.formatDate(this._get(t, "dateFormat"), e, this._getFormatConfig(t)) } }), V.fn.datepicker = function (t) { if (!this.length) return this; V.datepicker.initialized || (V(document).on("mousedown", V.datepicker._checkExternalClick), V.datepicker.initialized = !0), 0 === V("#" + V.datepicker._mainDivId).length && V("body").append(V.datepicker.dpDiv); var e = Array.prototype.slice.call(arguments, 1); return "string" == typeof t && ("isDisabled" === t || "getDate" === t || "widget" === t) || "option" === t && 2 === arguments.length && "string" == typeof arguments[1] ? V.datepicker["_" + t + "Datepicker"].apply(V.datepicker, [this[0]].concat(e)) : this.each(function () { "string" == typeof t ? V.datepicker["_" + t + "Datepicker"].apply(V.datepicker, [this].concat(e)) : V.datepicker._attachDatepicker(this, t) }) }, V.datepicker = new st, V.datepicker.initialized = !1, V.datepicker.uuid = (new Date).getTime(), V.datepicker.version = "1.13.2"; V.datepicker, V.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()); var rt = !1; V(document).on("mouseup", function () { rt = !1 }); V.widget("ui.mouse", { version: "1.13.2", options: { cancel: "input, textarea, button, select, option", distance: 1, delay: 0 }, _mouseInit: function () { var e = this; this.element.on("mousedown." + this.widgetName, function (t) { return e._mouseDown(t) }).on("click." + this.widgetName, function (t) { if (!0 === V.data(t.target, e.widgetName + ".preventClickEvent")) return V.removeData(t.target, e.widgetName + ".preventClickEvent"), t.stopImmediatePropagation(), !1 }), this.started = !1 }, _mouseDestroy: function () { this.element.off("." + this.widgetName), this._mouseMoveDelegate && this.document.off("mousemove." + this.widgetName, this._mouseMoveDelegate).off("mouseup." + this.widgetName, this._mouseUpDelegate) }, _mouseDown: function (t) { if (!rt) { this._mouseMoved = !1, this._mouseStarted && this._mouseUp(t), this._mouseDownEvent = t; var e = this, i = 1 === t.which, s = !("string" != typeof this.options.cancel || !t.target.nodeName) && V(t.target).closest(this.options.cancel).length; return i && !s && this._mouseCapture(t) ? (this.mouseDelayMet = !this.options.delay, this.mouseDelayMet || (this._mouseDelayTimer = setTimeout(function () { e.mouseDelayMet = !0 }, this.options.delay)), this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = !1 !== this._mouseStart(t), !this._mouseStarted) ? (t.preventDefault(), !0) : (!0 === V.data(t.target, this.widgetName + ".preventClickEvent") && V.removeData(t.target, this.widgetName + ".preventClickEvent"), this._mouseMoveDelegate = function (t) { return e._mouseMove(t) }, this._mouseUpDelegate = function (t) { return e._mouseUp(t) }, this.document.on("mousemove." + this.widgetName, this._mouseMoveDelegate).on("mouseup." + this.widgetName, this._mouseUpDelegate), t.preventDefault(), rt = !0)) : !0 } }, _mouseMove: function (t) { if (this._mouseMoved) { if (V.ui.ie && (!document.documentMode || document.documentMode < 9) && !t.button) return this._mouseUp(t); if (!t.which) if (t.originalEvent.altKey || t.originalEvent.ctrlKey || t.originalEvent.metaKey || t.originalEvent.shiftKey) this.ignoreMissingWhich = !0; else if (!this.ignoreMissingWhich) return this._mouseUp(t) } return (t.which || t.button) && (this._mouseMoved = !0), this._mouseStarted ? (this._mouseDrag(t), t.preventDefault()) : (this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = !1 !== this._mouseStart(this._mouseDownEvent, t), this._mouseStarted ? this._mouseDrag(t) : this._mouseUp(t)), !this._mouseStarted) }, _mouseUp: function (t) { this.document.off("mousemove." + this.widgetName, this._mouseMoveDelegate).off("mouseup." + this.widgetName, this._mouseUpDelegate), this._mouseStarted && (this._mouseStarted = !1, t.target === this._mouseDownEvent.target && V.data(t.target, this.widgetName + ".preventClickEvent", !0), this._mouseStop(t)), this._mouseDelayTimer && (clearTimeout(this._mouseDelayTimer), delete this._mouseDelayTimer), this.ignoreMissingWhich = !1, rt = !1, t.preventDefault() }, _mouseDistanceMet: function (t) { return Math.max(Math.abs(this._mouseDownEvent.pageX - t.pageX), Math.abs(this._mouseDownEvent.pageY - t.pageY)) >= this.options.distance }, _mouseDelayMet: function () { return this.mouseDelayMet }, _mouseStart: function () { }, _mouseDrag: function () { }, _mouseStop: function () { }, _mouseCapture: function () { return !0 } }), V.ui.plugin = { add: function (t, e, i) { var s, n = V.ui[t].prototype; for (s in i) n.plugins[s] = n.plugins[s] || [], n.plugins[s].push([e, i[s]]) }, call: function (t, e, i, s) { var n, o = t.plugins[e]; if (o && (s || t.element[0].parentNode && 11 !== t.element[0].parentNode.nodeType)) for (n = 0; n < o.length; n++)t.options[o[n][0]] && o[n][1].apply(t.element, i) } }, V.ui.safeBlur = function (t) { t && "body" !== t.nodeName.toLowerCase() && V(t).trigger("blur") }; V.widget("ui.draggable", V.ui.mouse, { version: "1.13.2", widgetEventPrefix: "drag", options: { addClasses: !0, appendTo: "parent", axis: !1, connectToSortable: !1, containment: !1, cursor: "auto", cursorAt: !1, grid: !1, handle: !1, helper: "original", iframeFix: !1, opacity: !1, refreshPositions: !1, revert: !1, revertDuration: 500, scope: "default", scroll: !0, scrollSensitivity: 20, scrollSpeed: 20, snap: !1, snapMode: "both", snapTolerance: 20, stack: !1, zIndex: !1, drag: null, start: null, stop: null }, _create: function () { "original" === this.options.helper && this._setPositionRelative(), this.options.addClasses && this._addClass("ui-draggable"), this._setHandleClassName(), this._mouseInit() }, _setOption: function (t, e) { this._super(t, e), "handle" === t && (this._removeHandleClassName(), this._setHandleClassName()) }, _destroy: function () { (this.helper || this.element).is(".ui-draggable-dragging") ? this.destroyOnClear = !0 : (this._removeHandleClassName(), this._mouseDestroy()) }, _mouseCapture: function (t) { var e = this.options; return !(this.helper || e.disabled || 0 < V(t.target).closest(".ui-resizable-handle").length) && (this.handle = this._getHandle(t), !!this.handle && (this._blurActiveElement(t), this._blockFrames(!0 === e.iframeFix ? "iframe" : e.iframeFix), !0)) }, _blockFrames: function (t) { this.iframeBlocks = this.document.find(t).map(function () { var t = V(this); return V("<div>").css("position", "absolute").appendTo(t.parent()).outerWidth(t.outerWidth()).outerHeight(t.outerHeight()).offset(t.offset())[0] }) }, _unblockFrames: function () { this.iframeBlocks && (this.iframeBlocks.remove(), delete this.iframeBlocks) }, _blurActiveElement: function (t) { var e = V.ui.safeActiveElement(this.document[0]); V(t.target).closest(e).length || V.ui.safeBlur(e) }, _mouseStart: function (t) { var e = this.options; return this.helper = this._createHelper(t), this._addClass(this.helper, "ui-draggable-dragging"), this._cacheHelperProportions(), V.ui.ddmanager && (V.ui.ddmanager.current = this), this._cacheMargins(), this.cssPosition = this.helper.css("position"), this.scrollParent = this.helper.scrollParent(!0), this.offsetParent = this.helper.offsetParent(), this.hasFixedAncestor = 0 < this.helper.parents().filter(function () { return "fixed" === V(this).css("position") }).length, this.positionAbs = this.element.offset(), this._refreshOffsets(t), this.originalPosition = this.position = this._generatePosition(t, !1), this.originalPageX = t.pageX, this.originalPageY = t.pageY, e.cursorAt && this._adjustOffsetFromHelper(e.cursorAt), this._setContainment(), !1 === this._trigger("start", t) ? (this._clear(), !1) : (this._cacheHelperProportions(), V.ui.ddmanager && !e.dropBehaviour && V.ui.ddmanager.prepareOffsets(this, t), this._mouseDrag(t, !0), V.ui.ddmanager && V.ui.ddmanager.dragStart(this, t), !0) }, _refreshOffsets: function (t) { this.offset = { top: this.positionAbs.top - this.margins.top, left: this.positionAbs.left - this.margins.left, scroll: !1, parent: this._getParentOffset(), relative: this._getRelativeOffset() }, this.offset.click = { left: t.pageX - this.offset.left, top: t.pageY - this.offset.top } }, _mouseDrag: function (t, e) { if (this.hasFixedAncestor && (this.offset.parent = this._getParentOffset()), this.position = this._generatePosition(t, !0), this.positionAbs = this._convertPositionTo("absolute"), !e) { e = this._uiHash(); if (!1 === this._trigger("drag", t, e)) return this._mouseUp(new V.Event("mouseup", t)), !1; this.position = e.position } return this.helper[0].style.left = this.position.left + "px", this.helper[0].style.top = this.position.top + "px", V.ui.ddmanager && V.ui.ddmanager.drag(this, t), !1 }, _mouseStop: function (t) { var e = this, i = !1; return V.ui.ddmanager && !this.options.dropBehaviour && (i = V.ui.ddmanager.drop(this, t)), this.dropped && (i = this.dropped, this.dropped = !1), "invalid" === this.options.revert && !i || "valid" === this.options.revert && i || !0 === this.options.revert || "function" == typeof this.options.revert && this.options.revert.call(this.element, i) ? V(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function () { !1 !== e._trigger("stop", t) && e._clear() }) : !1 !== this._trigger("stop", t) && this._clear(), !1 }, _mouseUp: function (t) { return this._unblockFrames(), V.ui.ddmanager && V.ui.ddmanager.dragStop(this, t), this.handleElement.is(t.target) && this.element.trigger("focus"), V.ui.mouse.prototype._mouseUp.call(this, t) }, cancel: function () { return this.helper.is(".ui-draggable-dragging") ? this._mouseUp(new V.Event("mouseup", { target: this.element[0] })) : this._clear(), this }, _getHandle: function (t) { return !this.options.handle || !!V(t.target).closest(this.element.find(this.options.handle)).length }, _setHandleClassName: function () { this.handleElement = this.options.handle ? this.element.find(this.options.handle) : this.element, this._addClass(this.handleElement, "ui-draggable-handle") }, _removeHandleClassName: function () { this._removeClass(this.handleElement, "ui-draggable-handle") }, _createHelper: function (t) { var e = this.options, i = "function" == typeof e.helper, t = i ? V(e.helper.apply(this.element[0], [t])) : "clone" === e.helper ? this.element.clone().removeAttr("id") : this.element; return t.parents("body").length || t.appendTo("parent" === e.appendTo ? this.element[0].parentNode : e.appendTo), i && t[0] === this.element[0] && this._setPositionRelative(), t[0] === this.element[0] || /(fixed|absolute)/.test(t.css("position")) || t.css("position", "absolute"), t }, _setPositionRelative: function () { /^(?:r|a|f)/.test(this.element.css("position")) || (this.element[0].style.position = "relative") }, _adjustOffsetFromHelper: function (t) { "string" == typeof t && (t = t.split(" ")), "left" in (t = Array.isArray(t) ? { left: +t[0], top: +t[1] || 0 } : t) && (this.offset.click.left = t.left + this.margins.left), "right" in t && (this.offset.click.left = this.helperProportions.width - t.right + this.margins.left), "top" in t && (this.offset.click.top = t.top + this.margins.top), "bottom" in t && (this.offset.click.top = this.helperProportions.height - t.bottom + this.margins.top) }, _isRootNode: function (t) { return /(html|body)/i.test(t.tagName) || t === this.document[0] }, _getParentOffset: function () { var t = this.offsetParent.offset(), e = this.document[0]; return "absolute" === this.cssPosition && this.scrollParent[0] !== e && V.contains(this.scrollParent[0], this.offsetParent[0]) && (t.left += this.scrollParent.scrollLeft(), t.top += this.scrollParent.scrollTop()), { top: (t = this._isRootNode(this.offsetParent[0]) ? { top: 0, left: 0 } : t).top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0), left: t.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0) } }, _getRelativeOffset: function () { if ("relative" !== this.cssPosition) return { top: 0, left: 0 }; var t = this.element.position(), e = this._isRootNode(this.scrollParent[0]); return { top: t.top - (parseInt(this.helper.css("top"), 10) || 0) + (e ? 0 : this.scrollParent.scrollTop()), left: t.left - (parseInt(this.helper.css("left"), 10) || 0) + (e ? 0 : this.scrollParent.scrollLeft()) } }, _cacheMargins: function () { this.margins = { left: parseInt(this.element.css("marginLeft"), 10) || 0, top: parseInt(this.element.css("marginTop"), 10) || 0, right: parseInt(this.element.css("marginRight"), 10) || 0, bottom: parseInt(this.element.css("marginBottom"), 10) || 0 } }, _cacheHelperProportions: function () { this.helperProportions = { width: this.helper.outerWidth(), height: this.helper.outerHeight() } }, _setContainment: function () { var t, e, i, s = this.options, n = this.document[0]; this.relativeContainer = null, s.containment ? "window" !== s.containment ? "document" !== s.containment ? s.containment.constructor !== Array ? ("parent" === s.containment && (s.containment = this.helper[0].parentNode), (i = (e = V(s.containment))[0]) && (t = /(scroll|auto)/.test(e.css("overflow")), this.containment = [(parseInt(e.css("borderLeftWidth"), 10) || 0) + (parseInt(e.css("paddingLeft"), 10) || 0), (parseInt(e.css("borderTopWidth"), 10) || 0) + (parseInt(e.css("paddingTop"), 10) || 0), (t ? Math.max(i.scrollWidth, i.offsetWidth) : i.offsetWidth) - (parseInt(e.css("borderRightWidth"), 10) || 0) - (parseInt(e.css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right, (t ? Math.max(i.scrollHeight, i.offsetHeight) : i.offsetHeight) - (parseInt(e.css("borderBottomWidth"), 10) || 0) - (parseInt(e.css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom], this.relativeContainer = e)) : this.containment = s.containment : this.containment = [0, 0, V(n).width() - this.helperProportions.width - this.margins.left, (V(n).height() || n.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top] : this.containment = [V(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left, V(window).scrollTop() - this.offset.relative.top - this.offset.parent.top, V(window).scrollLeft() + V(window).width() - this.helperProportions.width - this.margins.left, V(window).scrollTop() + (V(window).height() || n.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top] : this.containment = null }, _convertPositionTo: function (t, e) { e = e || this.position; var i = "absolute" === t ? 1 : -1, t = this._isRootNode(this.scrollParent[0]); return { top: e.top + this.offset.relative.top * i + this.offset.parent.top * i - ("fixed" === this.cssPosition ? -this.offset.scroll.top : t ? 0 : this.offset.scroll.top) * i, left: e.left + this.offset.relative.left * i + this.offset.parent.left * i - ("fixed" === this.cssPosition ? -this.offset.scroll.left : t ? 0 : this.offset.scroll.left) * i } }, _generatePosition: function (t, e) { var i, s = this.options, n = this._isRootNode(this.scrollParent[0]), o = t.pageX, a = t.pageY; return n && this.offset.scroll || (this.offset.scroll = { top: this.scrollParent.scrollTop(), left: this.scrollParent.scrollLeft() }), e && (this.containment && (i = this.relativeContainer ? (i = this.relativeContainer.offset(), [this.containment[0] + i.left, this.containment[1] + i.top, this.containment[2] + i.left, this.containment[3] + i.top]) : this.containment, t.pageX - this.offset.click.left < i[0] && (o = i[0] + this.offset.click.left), t.pageY - this.offset.click.top < i[1] && (a = i[1] + this.offset.click.top), t.pageX - this.offset.click.left > i[2] && (o = i[2] + this.offset.click.left), t.pageY - this.offset.click.top > i[3] && (a = i[3] + this.offset.click.top)), s.grid && (t = s.grid[1] ? this.originalPageY + Math.round((a - this.originalPageY) / s.grid[1]) * s.grid[1] : this.originalPageY, a = !i || t - this.offset.click.top >= i[1] || t - this.offset.click.top > i[3] ? t : t - this.offset.click.top >= i[1] ? t - s.grid[1] : t + s.grid[1], t = s.grid[0] ? this.originalPageX + Math.round((o - this.originalPageX) / s.grid[0]) * s.grid[0] : this.originalPageX, o = !i || t - this.offset.click.left >= i[0] || t - this.offset.click.left > i[2] ? t : t - this.offset.click.left >= i[0] ? t - s.grid[0] : t + s.grid[0]), "y" === s.axis && (o = this.originalPageX), "x" === s.axis && (a = this.originalPageY)), { top: a - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.offset.scroll.top : n ? 0 : this.offset.scroll.top), left: o - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.offset.scroll.left : n ? 0 : this.offset.scroll.left) } }, _clear: function () { this._removeClass(this.helper, "ui-draggable-dragging"), this.helper[0] === this.element[0] || this.cancelHelperRemoval || this.helper.remove(), this.helper = null, this.cancelHelperRemoval = !1, this.destroyOnClear && this.destroy() }, _trigger: function (t, e, i) { return i = i || this._uiHash(), V.ui.plugin.call(this, t, [e, i, this], !0), /^(drag|start|stop)/.test(t) && (this.positionAbs = this._convertPositionTo("absolute"), i.offset = this.positionAbs), V.Widget.prototype._trigger.call(this, t, e, i) }, plugins: {}, _uiHash: function () { return { helper: this.helper, position: this.position, originalPosition: this.originalPosition, offset: this.positionAbs } } }), V.ui.plugin.add("draggable", "connectToSortable", { start: function (e, t, i) { var s = V.extend({}, t, { item: i.element }); i.sortables = [], V(i.options.connectToSortable).each(function () { var t = V(this).sortable("instance"); t && !t.options.disabled && (i.sortables.push(t), t.refreshPositions(), t._trigger("activate", e, s)) }) }, stop: function (e, t, i) { var s = V.extend({}, t, { item: i.element }); i.cancelHelperRemoval = !1, V.each(i.sortables, function () { var t = this; t.isOver ? (t.isOver = 0, i.cancelHelperRemoval = !0, t.cancelHelperRemoval = !1, t._storedCSS = { position: t.placeholder.css("position"), top: t.placeholder.css("top"), left: t.placeholder.css("left") }, t._mouseStop(e), t.options.helper = t.options._helper) : (t.cancelHelperRemoval = !0, t._trigger("deactivate", e, s)) }) }, drag: function (i, s, n) { V.each(n.sortables, function () { var t = !1, e = this; e.positionAbs = n.positionAbs, e.helperProportions = n.helperProportions, e.offset.click = n.offset.click, e._intersectsWith(e.containerCache) && (t = !0, V.each(n.sortables, function () { return this.positionAbs = n.positionAbs, this.helperProportions = n.helperProportions, this.offset.click = n.offset.click, t = this !== e && this._intersectsWith(this.containerCache) && V.contains(e.element[0], this.element[0]) ? !1 : t })), t ? (e.isOver || (e.isOver = 1, n._parent = s.helper.parent(), e.currentItem = s.helper.appendTo(e.element).data("ui-sortable-item", !0), e.options._helper = e.options.helper, e.options.helper = function () { return s.helper[0] }, i.target = e.currentItem[0], e._mouseCapture(i, !0), e._mouseStart(i, !0, !0), e.offset.click.top = n.offset.click.top, e.offset.click.left = n.offset.click.left, e.offset.parent.left -= n.offset.parent.left - e.offset.parent.left, e.offset.parent.top -= n.offset.parent.top - e.offset.parent.top, n._trigger("toSortable", i), n.dropped = e.element, V.each(n.sortables, function () { this.refreshPositions() }), n.currentItem = n.element, e.fromOutside = n), e.currentItem && (e._mouseDrag(i), s.position = e.position)) : e.isOver && (e.isOver = 0, e.cancelHelperRemoval = !0, e.options._revert = e.options.revert, e.options.revert = !1, e._trigger("out", i, e._uiHash(e)), e._mouseStop(i, !0), e.options.revert = e.options._revert, e.options.helper = e.options._helper, e.placeholder && e.placeholder.remove(), s.helper.appendTo(n._parent), n._refreshOffsets(i), s.position = n._generatePosition(i, !0), n._trigger("fromSortable", i), n.dropped = !1, V.each(n.sortables, function () { this.refreshPositions() })) }) } }), V.ui.plugin.add("draggable", "cursor", { start: function (t, e, i) { var s = V("body"), i = i.options; s.css("cursor") && (i._cursor = s.css("cursor")), s.css("cursor", i.cursor) }, stop: function (t, e, i) { i = i.options; i._cursor && V("body").css("cursor", i._cursor) } }), V.ui.plugin.add("draggable", "opacity", { start: function (t, e, i) { e = V(e.helper), i = i.options; e.css("opacity") && (i._opacity = e.css("opacity")), e.css("opacity", i.opacity) }, stop: function (t, e, i) { i = i.options; i._opacity && V(e.helper).css("opacity", i._opacity) } }), V.ui.plugin.add("draggable", "scroll", { start: function (t, e, i) { i.scrollParentNotHidden || (i.scrollParentNotHidden = i.helper.scrollParent(!1)), i.scrollParentNotHidden[0] !== i.document[0] && "HTML" !== i.scrollParentNotHidden[0].tagName && (i.overflowOffset = i.scrollParentNotHidden.offset()) }, drag: function (t, e, i) { var s = i.options, n = !1, o = i.scrollParentNotHidden[0], a = i.document[0]; o !== a && "HTML" !== o.tagName ? (s.axis && "x" === s.axis || (i.overflowOffset.top + o.offsetHeight - t.pageY < s.scrollSensitivity ? o.scrollTop = n = o.scrollTop + s.scrollSpeed : t.pageY - i.overflowOffset.top < s.scrollSensitivity && (o.scrollTop = n = o.scrollTop - s.scrollSpeed)), s.axis && "y" === s.axis || (i.overflowOffset.left + o.offsetWidth - t.pageX < s.scrollSensitivity ? o.scrollLeft = n = o.scrollLeft + s.scrollSpeed : t.pageX - i.overflowOffset.left < s.scrollSensitivity && (o.scrollLeft = n = o.scrollLeft - s.scrollSpeed))) : (s.axis && "x" === s.axis || (t.pageY - V(a).scrollTop() < s.scrollSensitivity ? n = V(a).scrollTop(V(a).scrollTop() - s.scrollSpeed) : V(window).height() - (t.pageY - V(a).scrollTop()) < s.scrollSensitivity && (n = V(a).scrollTop(V(a).scrollTop() + s.scrollSpeed))), s.axis && "y" === s.axis || (t.pageX - V(a).scrollLeft() < s.scrollSensitivity ? n = V(a).scrollLeft(V(a).scrollLeft() - s.scrollSpeed) : V(window).width() - (t.pageX - V(a).scrollLeft()) < s.scrollSensitivity && (n = V(a).scrollLeft(V(a).scrollLeft() + s.scrollSpeed)))), !1 !== n && V.ui.ddmanager && !s.dropBehaviour && V.ui.ddmanager.prepareOffsets(i, t) } }), V.ui.plugin.add("draggable", "snap", { start: function (t, e, i) { var s = i.options; i.snapElements = [], V(s.snap.constructor !== String ? s.snap.items || ":data(ui-draggable)" : s.snap).each(function () { var t = V(this), e = t.offset(); this !== i.element[0] && i.snapElements.push({ item: this, width: t.outerWidth(), height: t.outerHeight(), top: e.top, left: e.left }) }) }, drag: function (t, e, i) { for (var s, n, o, a, r, l, h, c, u, d = i.options, p = d.snapTolerance, f = e.offset.left, g = f + i.helperProportions.width, m = e.offset.top, _ = m + i.helperProportions.height, v = i.snapElements.length - 1; 0 <= v; v--)l = (r = i.snapElements[v].left - i.margins.left) + i.snapElements[v].width, c = (h = i.snapElements[v].top - i.margins.top) + i.snapElements[v].height, g < r - p || l + p < f || _ < h - p || c + p < m || !V.contains(i.snapElements[v].item.ownerDocument, i.snapElements[v].item) ? (i.snapElements[v].snapping && i.options.snap.release && i.options.snap.release.call(i.element, t, V.extend(i._uiHash(), { snapItem: i.snapElements[v].item })), i.snapElements[v].snapping = !1) : ("inner" !== d.snapMode && (s = Math.abs(h - _) <= p, n = Math.abs(c - m) <= p, o = Math.abs(r - g) <= p, a = Math.abs(l - f) <= p, s && (e.position.top = i._convertPositionTo("relative", { top: h - i.helperProportions.height, left: 0 }).top), n && (e.position.top = i._convertPositionTo("relative", { top: c, left: 0 }).top), o && (e.position.left = i._convertPositionTo("relative", { top: 0, left: r - i.helperProportions.width }).left), a && (e.position.left = i._convertPositionTo("relative", { top: 0, left: l }).left)), u = s || n || o || a, "outer" !== d.snapMode && (s = Math.abs(h - m) <= p, n = Math.abs(c - _) <= p, o = Math.abs(r - f) <= p, a = Math.abs(l - g) <= p, s && (e.position.top = i._convertPositionTo("relative", { top: h, left: 0 }).top), n && (e.position.top = i._convertPositionTo("relative", { top: c - i.helperProportions.height, left: 0 }).top), o && (e.position.left = i._convertPositionTo("relative", { top: 0, left: r }).left), a && (e.position.left = i._convertPositionTo("relative", { top: 0, left: l - i.helperProportions.width }).left)), !i.snapElements[v].snapping && (s || n || o || a || u) && i.options.snap.snap && i.options.snap.snap.call(i.element, t, V.extend(i._uiHash(), { snapItem: i.snapElements[v].item })), i.snapElements[v].snapping = s || n || o || a || u) } }), V.ui.plugin.add("draggable", "stack", { start: function (t, e, i) { var s, i = i.options, i = V.makeArray(V(i.stack)).sort(function (t, e) { return (parseInt(V(t).css("zIndex"), 10) || 0) - (parseInt(V(e).css("zIndex"), 10) || 0) }); i.length && (s = parseInt(V(i[0]).css("zIndex"), 10) || 0, V(i).each(function (t) { V(this).css("zIndex", s + t) }), this.css("zIndex", s + i.length)) } }), V.ui.plugin.add("draggable", "zIndex", { start: function (t, e, i) { e = V(e.helper), i = i.options; e.css("zIndex") && (i._zIndex = e.css("zIndex")), e.css("zIndex", i.zIndex) }, stop: function (t, e, i) { i = i.options; i._zIndex && V(e.helper).css("zIndex", i._zIndex) } }); V.ui.draggable; V.widget("ui.resizable", V.ui.mouse, { version: "1.13.2", widgetEventPrefix: "resize", options: { alsoResize: !1, animate: !1, animateDuration: "slow", animateEasing: "swing", aspectRatio: !1, autoHide: !1, classes: { "ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se" }, containment: !1, ghost: !1, grid: !1, handles: "e,s,se", helper: !1, maxHeight: null, maxWidth: null, minHeight: 10, minWidth: 10, zIndex: 90, resize: null, start: null, stop: null }, _num: function (t) { return parseFloat(t) || 0 }, _isNumber: function (t) { return !isNaN(parseFloat(t)) }, _hasScroll: function (t, e) { if ("hidden" === V(t).css("overflow")) return !1; var i = e && "left" === e ? "scrollLeft" : "scrollTop", e = !1; if (0 < t[i]) return !0; try { t[i] = 1, e = 0 < t[i], t[i] = 0 } catch (t) { } return e }, _create: function () { var t, e = this.options, i = this; this._addClass("ui-resizable"), V.extend(this, { _aspectRatio: !!e.aspectRatio, aspectRatio: e.aspectRatio, originalElement: this.element, _proportionallyResizeElements: [], _helper: e.helper || e.ghost || e.animate ? e.helper || "ui-resizable-helper" : null }), this.element[0].nodeName.match(/^(canvas|textarea|input|select|button|img)$/i) && (this.element.wrap(V("<div class='ui-wrapper'></div>").css({ overflow: "hidden", position: this.element.css("position"), width: this.element.outerWidth(), height: this.element.outerHeight(), top: this.element.css("top"), left: this.element.css("left") })), this.element = this.element.parent().data("ui-resizable", this.element.resizable("instance")), this.elementIsWrapper = !0, t = { marginTop: this.originalElement.css("marginTop"), marginRight: this.originalElement.css("marginRight"), marginBottom: this.originalElement.css("marginBottom"), marginLeft: this.originalElement.css("marginLeft") }, this.element.css(t), this.originalElement.css("margin", 0), this.originalResizeStyle = this.originalElement.css("resize"), this.originalElement.css("resize", "none"), this._proportionallyResizeElements.push(this.originalElement.css({ position: "static", zoom: 1, display: "block" })), this.originalElement.css(t), this._proportionallyResize()), this._setupHandles(), e.autoHide && V(this.element).on("mouseenter", function () { e.disabled || (i._removeClass("ui-resizable-autohide"), i._handles.show()) }).on("mouseleave", function () { e.disabled || i.resizing || (i._addClass("ui-resizable-autohide"), i._handles.hide()) }), this._mouseInit() }, _destroy: function () { this._mouseDestroy(), this._addedHandles.remove(); function t(t) { V(t).removeData("resizable").removeData("ui-resizable").off(".resizable") } var e; return this.elementIsWrapper && (t(this.element), e = this.element, this.originalElement.css({ position: e.css("position"), width: e.outerWidth(), height: e.outerHeight(), top: e.css("top"), left: e.css("left") }).insertAfter(e), e.remove()), this.originalElement.css("resize", this.originalResizeStyle), t(this.originalElement), this }, _setOption: function (t, e) { switch (this._super(t, e), t) { case "handles": this._removeHandles(), this._setupHandles(); break; case "aspectRatio": this._aspectRatio = !!e } }, _setupHandles: function () { var t, e, i, s, n, o = this.options, a = this; if (this.handles = o.handles || (V(".ui-resizable-handle", this.element).length ? { n: ".ui-resizable-n", e: ".ui-resizable-e", s: ".ui-resizable-s", w: ".ui-resizable-w", se: ".ui-resizable-se", sw: ".ui-resizable-sw", ne: ".ui-resizable-ne", nw: ".ui-resizable-nw" } : "e,s,se"), this._handles = V(), this._addedHandles = V(), this.handles.constructor === String) for ("all" === this.handles && (this.handles = "n,e,s,w,se,sw,ne,nw"), i = this.handles.split(","), this.handles = {}, e = 0; e < i.length; e++)s = "ui-resizable-" + (t = String.prototype.trim.call(i[e])), n = V("<div>"), this._addClass(n, "ui-resizable-handle " + s), n.css({ zIndex: o.zIndex }), this.handles[t] = ".ui-resizable-" + t, this.element.children(this.handles[t]).length || (this.element.append(n), this._addedHandles = this._addedHandles.add(n)); this._renderAxis = function (t) { var e, i, s; for (e in t = t || this.element, this.handles) this.handles[e].constructor === String ? this.handles[e] = this.element.children(this.handles[e]).first().show() : (this.handles[e].jquery || this.handles[e].nodeType) && (this.handles[e] = V(this.handles[e]), this._on(this.handles[e], { mousedown: a._mouseDown })), this.elementIsWrapper && this.originalElement[0].nodeName.match(/^(textarea|input|select|button)$/i) && (i = V(this.handles[e], this.element), s = /sw|ne|nw|se|n|s/.test(e) ? i.outerHeight() : i.outerWidth(), i = ["padding", /ne|nw|n/.test(e) ? "Top" : /se|sw|s/.test(e) ? "Bottom" : /^e$/.test(e) ? "Right" : "Left"].join(""), t.css(i, s), this._proportionallyResize()), this._handles = this._handles.add(this.handles[e]) }, this._renderAxis(this.element), this._handles = this._handles.add(this.element.find(".ui-resizable-handle")), this._handles.disableSelection(), this._handles.on("mouseover", function () { a.resizing || (this.className && (n = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)), a.axis = n && n[1] ? n[1] : "se") }), o.autoHide && (this._handles.hide(), this._addClass("ui-resizable-autohide")) }, _removeHandles: function () { this._addedHandles.remove() }, _mouseCapture: function (t) { var e, i, s = !1; for (e in this.handles) (i = V(this.handles[e])[0]) !== t.target && !V.contains(i, t.target) || (s = !0); return !this.options.disabled && s }, _mouseStart: function (t) { var e, i, s = this.options, n = this.element; return this.resizing = !0, this._renderProxy(), e = this._num(this.helper.css("left")), i = this._num(this.helper.css("top")), s.containment && (e += V(s.containment).scrollLeft() || 0, i += V(s.containment).scrollTop() || 0), this.offset = this.helper.offset(), this.position = { left: e, top: i }, this.size = this._helper ? { width: this.helper.width(), height: this.helper.height() } : { width: n.width(), height: n.height() }, this.originalSize = this._helper ? { width: n.outerWidth(), height: n.outerHeight() } : { width: n.width(), height: n.height() }, this.sizeDiff = { width: n.outerWidth() - n.width(), height: n.outerHeight() - n.height() }, this.originalPosition = { left: e, top: i }, this.originalMousePosition = { left: t.pageX, top: t.pageY }, this.aspectRatio = "number" == typeof s.aspectRatio ? s.aspectRatio : this.originalSize.width / this.originalSize.height || 1, s = V(".ui-resizable-" + this.axis).css("cursor"), V("body").css("cursor", "auto" === s ? this.axis + "-resize" : s), this._addClass("ui-resizable-resizing"), this._propagate("start", t), !0 }, _mouseDrag: function (t) { var e = this.originalMousePosition, i = this.axis, s = t.pageX - e.left || 0, e = t.pageY - e.top || 0, i = this._change[i]; return this._updatePrevProperties(), i && (e = i.apply(this, [t, s, e]), this._updateVirtualBoundaries(t.shiftKey), (this._aspectRatio || t.shiftKey) && (e = this._updateRatio(e, t)), e = this._respectSize(e, t), this._updateCache(e), this._propagate("resize", t), e = this._applyChanges(), !this._helper && this._proportionallyResizeElements.length && this._proportionallyResize(), V.isEmptyObject(e) || (this._updatePrevProperties(), this._trigger("resize", t, this.ui()), this._applyChanges())), !1 }, _mouseStop: function (t) { this.resizing = !1; var e, i, s, n = this.options, o = this; return this._helper && (s = (e = (i = this._proportionallyResizeElements).length && /textarea/i.test(i[0].nodeName)) && this._hasScroll(i[0], "left") ? 0 : o.sizeDiff.height, i = e ? 0 : o.sizeDiff.width, e = { width: o.helper.width() - i, height: o.helper.height() - s }, i = parseFloat(o.element.css("left")) + (o.position.left - o.originalPosition.left) || null, s = parseFloat(o.element.css("top")) + (o.position.top - o.originalPosition.top) || null, n.animate || this.element.css(V.extend(e, { top: s, left: i })), o.helper.height(o.size.height), o.helper.width(o.size.width), this._helper && !n.animate && this._proportionallyResize()), V("body").css("cursor", "auto"), this._removeClass("ui-resizable-resizing"), this._propagate("stop", t), this._helper && this.helper.remove(), !1 }, _updatePrevProperties: function () { this.prevPosition = { top: this.position.top, left: this.position.left }, this.prevSize = { width: this.size.width, height: this.size.height } }, _applyChanges: function () { var t = {}; return this.position.top !== this.prevPosition.top && (t.top = this.position.top + "px"), this.position.left !== this.prevPosition.left && (t.left = this.position.left + "px"), this.size.width !== this.prevSize.width && (t.width = this.size.width + "px"), this.size.height !== this.prevSize.height && (t.height = this.size.height + "px"), this.helper.css(t), t }, _updateVirtualBoundaries: function (t) { var e, i, s = this.options, n = { minWidth: this._isNumber(s.minWidth) ? s.minWidth : 0, maxWidth: this._isNumber(s.maxWidth) ? s.maxWidth : 1 / 0, minHeight: this._isNumber(s.minHeight) ? s.minHeight : 0, maxHeight: this._isNumber(s.maxHeight) ? s.maxHeight : 1 / 0 }; (this._aspectRatio || t) && (e = n.minHeight * this.aspectRatio, i = n.minWidth / this.aspectRatio, s = n.maxHeight * this.aspectRatio, t = n.maxWidth / this.aspectRatio, e > n.minWidth && (n.minWidth = e), i > n.minHeight && (n.minHeight = i), s < n.maxWidth && (n.maxWidth = s), t < n.maxHeight && (n.maxHeight = t)), this._vBoundaries = n }, _updateCache: function (t) { this.offset = this.helper.offset(), this._isNumber(t.left) && (this.position.left = t.left), this._isNumber(t.top) && (this.position.top = t.top), this._isNumber(t.height) && (this.size.height = t.height), this._isNumber(t.width) && (this.size.width = t.width) }, _updateRatio: function (t) { var e = this.position, i = this.size, s = this.axis; return this._isNumber(t.height) ? t.width = t.height * this.aspectRatio : this._isNumber(t.width) && (t.height = t.width / this.aspectRatio), "sw" === s && (t.left = e.left + (i.width - t.width), t.top = null), "nw" === s && (t.top = e.top + (i.height - t.height), t.left = e.left + (i.width - t.width)), t }, _respectSize: function (t) { var e = this._vBoundaries, i = this.axis, s = this._isNumber(t.width) && e.maxWidth && e.maxWidth < t.width, n = this._isNumber(t.height) && e.maxHeight && e.maxHeight < t.height, o = this._isNumber(t.width) && e.minWidth && e.minWidth > t.width, a = this._isNumber(t.height) && e.minHeight && e.minHeight > t.height, r = this.originalPosition.left + this.originalSize.width, l = this.originalPosition.top + this.originalSize.height, h = /sw|nw|w/.test(i), i = /nw|ne|n/.test(i); return o && (t.width = e.minWidth), a && (t.height = e.minHeight), s && (t.width = e.maxWidth), n && (t.height = e.maxHeight), o && h && (t.left = r - e.minWidth), s && h && (t.left = r - e.maxWidth), a && i && (t.top = l - e.minHeight), n && i && (t.top = l - e.maxHeight), t.width || t.height || t.left || !t.top ? t.width || t.height || t.top || !t.left || (t.left = null) : t.top = null, t }, _getPaddingPlusBorderDimensions: function (t) { for (var e = 0, i = [], s = [t.css("borderTopWidth"), t.css("borderRightWidth"), t.css("borderBottomWidth"), t.css("borderLeftWidth")], n = [t.css("paddingTop"), t.css("paddingRight"), t.css("paddingBottom"), t.css("paddingLeft")]; e < 4; e++)i[e] = parseFloat(s[e]) || 0, i[e] += parseFloat(n[e]) || 0; return { height: i[0] + i[2], width: i[1] + i[3] } }, _proportionallyResize: function () { if (this._proportionallyResizeElements.length) for (var t, e = 0, i = this.helper || this.element; e < this._proportionallyResizeElements.length; e++)t = this._proportionallyResizeElements[e], this.outerDimensions || (this.outerDimensions = this._getPaddingPlusBorderDimensions(t)), t.css({ height: i.height() - this.outerDimensions.height || 0, width: i.width() - this.outerDimensions.width || 0 }) }, _renderProxy: function () { var t = this.element, e = this.options; this.elementOffset = t.offset(), this._helper ? (this.helper = this.helper || V("<div></div>").css({ overflow: "hidden" }), this._addClass(this.helper, this._helper), this.helper.css({ width: this.element.outerWidth(), height: this.element.outerHeight(), position: "absolute", left: this.elementOffset.left + "px", top: this.elementOffset.top + "px", zIndex: ++e.zIndex }), this.helper.appendTo("body").disableSelection()) : this.helper = this.element }, _change: { e: function (t, e) { return { width: this.originalSize.width + e } }, w: function (t, e) { var i = this.originalSize; return { left: this.originalPosition.left + e, width: i.width - e } }, n: function (t, e, i) { var s = this.originalSize; return { top: this.originalPosition.top + i, height: s.height - i } }, s: function (t, e, i) { return { height: this.originalSize.height + i } }, se: function (t, e, i) { return V.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [t, e, i])) }, sw: function (t, e, i) { return V.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [t, e, i])) }, ne: function (t, e, i) { return V.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [t, e, i])) }, nw: function (t, e, i) { return V.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [t, e, i])) } }, _propagate: function (t, e) { V.ui.plugin.call(this, t, [e, this.ui()]), "resize" !== t && this._trigger(t, e, this.ui()) }, plugins: {}, ui: function () { return { originalElement: this.originalElement, element: this.element, helper: this.helper, position: this.position, size: this.size, originalSize: this.originalSize, originalPosition: this.originalPosition } } }), V.ui.plugin.add("resizable", "animate", { stop: function (e) { var i = V(this).resizable("instance"), t = i.options, s = i._proportionallyResizeElements, n = s.length && /textarea/i.test(s[0].nodeName), o = n && i._hasScroll(s[0], "left") ? 0 : i.sizeDiff.height, a = n ? 0 : i.sizeDiff.width, n = { width: i.size.width - a, height: i.size.height - o }, a = parseFloat(i.element.css("left")) + (i.position.left - i.originalPosition.left) || null, o = parseFloat(i.element.css("top")) + (i.position.top - i.originalPosition.top) || null; i.element.animate(V.extend(n, o && a ? { top: o, left: a } : {}), { duration: t.animateDuration, easing: t.animateEasing, step: function () { var t = { width: parseFloat(i.element.css("width")), height: parseFloat(i.element.css("height")), top: parseFloat(i.element.css("top")), left: parseFloat(i.element.css("left")) }; s && s.length && V(s[0]).css({ width: t.width, height: t.height }), i._updateCache(t), i._propagate("resize", e) } }) } }), V.ui.plugin.add("resizable", "containment", { start: function () { var i, s, n = V(this).resizable("instance"), t = n.options, e = n.element, o = t.containment, a = o instanceof V ? o.get(0) : /parent/.test(o) ? e.parent().get(0) : o; a && (n.containerElement = V(a), /document/.test(o) || o === document ? (n.containerOffset = { left: 0, top: 0 }, n.containerPosition = { left: 0, top: 0 }, n.parentData = { element: V(document), left: 0, top: 0, width: V(document).width(), height: V(document).height() || document.body.parentNode.scrollHeight }) : (i = V(a), s = [], V(["Top", "Right", "Left", "Bottom"]).each(function (t, e) { s[t] = n._num(i.css("padding" + e)) }), n.containerOffset = i.offset(), n.containerPosition = i.position(), n.containerSize = { height: i.innerHeight() - s[3], width: i.innerWidth() - s[1] }, t = n.containerOffset, e = n.containerSize.height, o = n.containerSize.width, o = n._hasScroll(a, "left") ? a.scrollWidth : o, e = n._hasScroll(a) ? a.scrollHeight : e, n.parentData = { element: a, left: t.left, top: t.top, width: o, height: e })) }, resize: function (t) { var e = V(this).resizable("instance"), i = e.options, s = e.containerOffset, n = e.position, o = e._aspectRatio || t.shiftKey, a = { top: 0, left: 0 }, r = e.containerElement, t = !0; r[0] !== document && /static/.test(r.css("position")) && (a = s), n.left < (e._helper ? s.left : 0) && (e.size.width = e.size.width + (e._helper ? e.position.left - s.left : e.position.left - a.left), o && (e.size.height = e.size.width / e.aspectRatio, t = !1), e.position.left = i.helper ? s.left : 0), n.top < (e._helper ? s.top : 0) && (e.size.height = e.size.height + (e._helper ? e.position.top - s.top : e.position.top), o && (e.size.width = e.size.height * e.aspectRatio, t = !1), e.position.top = e._helper ? s.top : 0), i = e.containerElement.get(0) === e.element.parent().get(0), n = /relative|absolute/.test(e.containerElement.css("position")), i && n ? (e.offset.left = e.parentData.left + e.position.left, e.offset.top = e.parentData.top + e.position.top) : (e.offset.left = e.element.offset().left, e.offset.top = e.element.offset().top), n = Math.abs(e.sizeDiff.width + (e._helper ? e.offset.left - a.left : e.offset.left - s.left)), s = Math.abs(e.sizeDiff.height + (e._helper ? e.offset.top - a.top : e.offset.top - s.top)), n + e.size.width >= e.parentData.width && (e.size.width = e.parentData.width - n, o && (e.size.height = e.size.width / e.aspectRatio, t = !1)), s + e.size.height >= e.parentData.height && (e.size.height = e.parentData.height - s, o && (e.size.width = e.size.height * e.aspectRatio, t = !1)), t || (e.position.left = e.prevPosition.left, e.position.top = e.prevPosition.top, e.size.width = e.prevSize.width, e.size.height = e.prevSize.height) }, stop: function () { var t = V(this).resizable("instance"), e = t.options, i = t.containerOffset, s = t.containerPosition, n = t.containerElement, o = V(t.helper), a = o.offset(), r = o.outerWidth() - t.sizeDiff.width, o = o.outerHeight() - t.sizeDiff.height; t._helper && !e.animate && /relative/.test(n.css("position")) && V(this).css({ left: a.left - s.left - i.left, width: r, height: o }), t._helper && !e.animate && /static/.test(n.css("position")) && V(this).css({ left: a.left - s.left - i.left, width: r, height: o }) } }), V.ui.plugin.add("resizable", "alsoResize", { start: function () { var t = V(this).resizable("instance").options; V(t.alsoResize).each(function () { var t = V(this); t.data("ui-resizable-alsoresize", { width: parseFloat(t.width()), height: parseFloat(t.height()), left: parseFloat(t.css("left")), top: parseFloat(t.css("top")) }) }) }, resize: function (t, i) { var e = V(this).resizable("instance"), s = e.options, n = e.originalSize, o = e.originalPosition, a = { height: e.size.height - n.height || 0, width: e.size.width - n.width || 0, top: e.position.top - o.top || 0, left: e.position.left - o.left || 0 }; V(s.alsoResize).each(function () { var t = V(this), s = V(this).data("ui-resizable-alsoresize"), n = {}, e = t.parents(i.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"]; V.each(e, function (t, e) { var i = (s[e] || 0) + (a[e] || 0); i && 0 <= i && (n[e] = i || null) }), t.css(n) }) }, stop: function () { V(this).removeData("ui-resizable-alsoresize") } }), V.ui.plugin.add("resizable", "ghost", { start: function () { var t = V(this).resizable("instance"), e = t.size; t.ghost = t.originalElement.clone(), t.ghost.css({ opacity: .25, display: "block", position: "relative", height: e.height, width: e.width, margin: 0, left: 0, top: 0 }), t._addClass(t.ghost, "ui-resizable-ghost"), !1 !== V.uiBackCompat && "string" == typeof t.options.ghost && t.ghost.addClass(this.options.ghost), t.ghost.appendTo(t.helper) }, resize: function () { var t = V(this).resizable("instance"); t.ghost && t.ghost.css({ position: "relative", height: t.size.height, width: t.size.width }) }, stop: function () { var t = V(this).resizable("instance"); t.ghost && t.helper && t.helper.get(0).removeChild(t.ghost.get(0)) } }), V.ui.plugin.add("resizable", "grid", { resize: function () { var t, e = V(this).resizable("instance"), i = e.options, s = e.size, n = e.originalSize, o = e.originalPosition, a = e.axis, r = "number" == typeof i.grid ? [i.grid, i.grid] : i.grid, l = r[0] || 1, h = r[1] || 1, c = Math.round((s.width - n.width) / l) * l, u = Math.round((s.height - n.height) / h) * h, d = n.width + c, p = n.height + u, f = i.maxWidth && i.maxWidth < d, g = i.maxHeight && i.maxHeight < p, m = i.minWidth && i.minWidth > d, s = i.minHeight && i.minHeight > p; i.grid = r, m && (d += l), s && (p += h), f && (d -= l), g && (p -= h), /^(se|s|e)$/.test(a) ? (e.size.width = d, e.size.height = p) : /^(ne)$/.test(a) ? (e.size.width = d, e.size.height = p, e.position.top = o.top - u) : /^(sw)$/.test(a) ? (e.size.width = d, e.size.height = p, e.position.left = o.left - c) : ((p - h <= 0 || d - l <= 0) && (t = e._getPaddingPlusBorderDimensions(this)), 0 < p - h ? (e.size.height = p, e.position.top = o.top - u) : (p = h - t.height, e.size.height = p, e.position.top = o.top + n.height - p), 0 < d - l ? (e.size.width = d, e.position.left = o.left - c) : (d = l - t.width, e.size.width = d, e.position.left = o.left + n.width - d)) } }); V.ui.resizable; V.widget("ui.dialog", { version: "1.13.2", options: { appendTo: "body", autoOpen: !0, buttons: [], classes: { "ui-dialog": "ui-corner-all", "ui-dialog-titlebar": "ui-corner-all" }, closeOnEscape: !0, closeText: "Close", draggable: !0, hide: null, height: "auto", maxHeight: null, maxWidth: null, minHeight: 150, minWidth: 150, modal: !1, position: { my: "center", at: "center", of: window, collision: "fit", using: function (t) { var e = V(this).css(t).offset().top; e < 0 && V(this).css("top", t.top - e) } }, resizable: !0, show: null, title: null, width: 300, beforeClose: null, close: null, drag: null, dragStart: null, dragStop: null, focus: null, open: null, resize: null, resizeStart: null, resizeStop: null }, sizeRelatedOptions: { buttons: !0, height: !0, maxHeight: !0, maxWidth: !0, minHeight: !0, minWidth: !0, width: !0 }, resizableRelatedOptions: { maxHeight: !0, maxWidth: !0, minHeight: !0, minWidth: !0 }, _create: function () { this.originalCss = { display: this.element[0].style.display, width: this.element[0].style.width, minHeight: this.element[0].style.minHeight, maxHeight: this.element[0].style.maxHeight, height: this.element[0].style.height }, this.originalPosition = { parent: this.element.parent(), index: this.element.parent().children().index(this.element) }, this.originalTitle = this.element.attr("title"), null == this.options.title && null != this.originalTitle && (this.options.title = this.originalTitle), this.options.disabled && (this.options.disabled = !1), this._createWrapper(), this.element.show().removeAttr("title").appendTo(this.uiDialog), this._addClass("ui-dialog-content", "ui-widget-content"), this._createTitlebar(), this._createButtonPane(), this.options.draggable && V.fn.draggable && this._makeDraggable(), this.options.resizable && V.fn.resizable && this._makeResizable(), this._isOpen = !1, this._trackFocus() }, _init: function () { this.options.autoOpen && this.open() }, _appendTo: function () { var t = this.options.appendTo; return t && (t.jquery || t.nodeType) ? V(t) : this.document.find(t || "body").eq(0) }, _destroy: function () { var t, e = this.originalPosition; this._untrackInstance(), this._destroyOverlay(), this.element.removeUniqueId().css(this.originalCss).detach(), this.uiDialog.remove(), this.originalTitle && this.element.attr("title", this.originalTitle), (t = e.parent.children().eq(e.index)).length && t[0] !== this.element[0] ? t.before(this.element) : e.parent.append(this.element) }, widget: function () { return this.uiDialog }, disable: V.noop, enable: V.noop, close: function (t) { var e = this; this._isOpen && !1 !== this._trigger("beforeClose", t) && (this._isOpen = !1, this._focusedElement = null, this._destroyOverlay(), this._untrackInstance(), this.opener.filter(":focusable").trigger("focus").length || V.ui.safeBlur(V.ui.safeActiveElement(this.document[0])), this._hide(this.uiDialog, this.options.hide, function () { e._trigger("close", t) })) }, isOpen: function () { return this._isOpen }, moveToTop: function () { this._moveToTop() }, _moveToTop: function (t, e) { var i = !1, s = this.uiDialog.siblings(".ui-front:visible").map(function () { return +V(this).css("z-index") }).get(), s = Math.max.apply(null, s); return s >= +this.uiDialog.css("z-index") && (this.uiDialog.css("z-index", s + 1), i = !0), i && !e && this._trigger("focus", t), i }, open: function () { var t = this; this._isOpen ? this._moveToTop() && this._focusTabbable() : (this._isOpen = !0, this.opener = V(V.ui.safeActiveElement(this.document[0])), this._size(), this._position(), this._createOverlay(), this._moveToTop(null, !0), this.overlay && this.overlay.css("z-index", this.uiDialog.css("z-index") - 1), this._show(this.uiDialog, this.options.show, function () { t._focusTabbable(), t._trigger("focus") }), this._makeFocusTarget(), this._trigger("open")) }, _focusTabbable: function () { var t = this._focusedElement; (t = !(t = !(t = !(t = !(t = t || this.element.find("[autofocus]")).length ? this.element.find(":tabbable") : t).length ? this.uiDialogButtonPane.find(":tabbable") : t).length ? this.uiDialogTitlebarClose.filter(":tabbable") : t).length ? this.uiDialog : t).eq(0).trigger("focus") }, _restoreTabbableFocus: function () { var t = V.ui.safeActiveElement(this.document[0]); this.uiDialog[0] === t || V.contains(this.uiDialog[0], t) || this._focusTabbable() }, _keepFocus: function (t) { t.preventDefault(), this._restoreTabbableFocus(), this._delay(this._restoreTabbableFocus) }, _createWrapper: function () { this.uiDialog = V("<div>").hide().attr({ tabIndex: -1, role: "dialog" }).appendTo(this._appendTo()), this._addClass(this.uiDialog, "ui-dialog", "ui-widget ui-widget-content ui-front"), this._on(this.uiDialog, { keydown: function (t) { if (this.options.closeOnEscape && !t.isDefaultPrevented() && t.keyCode && t.keyCode === V.ui.keyCode.ESCAPE) return t.preventDefault(), void this.close(t); var e, i, s; t.keyCode !== V.ui.keyCode.TAB || t.isDefaultPrevented() || (e = this.uiDialog.find(":tabbable"), i = e.first(), s = e.last(), t.target !== s[0] && t.target !== this.uiDialog[0] || t.shiftKey ? t.target !== i[0] && t.target !== this.uiDialog[0] || !t.shiftKey || (this._delay(function () { s.trigger("focus") }), t.preventDefault()) : (this._delay(function () { i.trigger("focus") }), t.preventDefault())) }, mousedown: function (t) { this._moveToTop(t) && this._focusTabbable() } }), this.element.find("[aria-describedby]").length || this.uiDialog.attr({ "aria-describedby": this.element.uniqueId().attr("id") }) }, _createTitlebar: function () { var t; this.uiDialogTitlebar = V("<div>"), this._addClass(this.uiDialogTitlebar, "ui-dialog-titlebar", "ui-widget-header ui-helper-clearfix"), this._on(this.uiDialogTitlebar, { mousedown: function (t) { V(t.target).closest(".ui-dialog-titlebar-close") || this.uiDialog.trigger("focus") } }), this.uiDialogTitlebarClose = V("<button type='button'></button>").button({ label: V("<a>").text(this.options.closeText).html(), icon: "ui-icon-closethick", showLabel: !1 }).appendTo(this.uiDialogTitlebar), this._addClass(this.uiDialogTitlebarClose, "ui-dialog-titlebar-close"), this._on(this.uiDialogTitlebarClose, { click: function (t) { t.preventDefault(), this.close(t) } }), t = V("<span>").uniqueId().prependTo(this.uiDialogTitlebar), this._addClass(t, "ui-dialog-title"), this._title(t), this.uiDialogTitlebar.prependTo(this.uiDialog), this.uiDialog.attr({ "aria-labelledby": t.attr("id") }) }, _title: function (t) { this.options.title ? t.text(this.options.title) : t.html("&#160;") }, _createButtonPane: function () { this.uiDialogButtonPane = V("<div>"), this._addClass(this.uiDialogButtonPane, "ui-dialog-buttonpane", "ui-widget-content ui-helper-clearfix"), this.uiButtonSet = V("<div>").appendTo(this.uiDialogButtonPane), this._addClass(this.uiButtonSet, "ui-dialog-buttonset"), this._createButtons() }, _createButtons: function () { var s = this, t = this.options.buttons; this.uiDialogButtonPane.remove(), this.uiButtonSet.empty(), V.isEmptyObject(t) || Array.isArray(t) && !t.length ? this._removeClass(this.uiDialog, "ui-dialog-buttons") : (V.each(t, function (t, e) { var i; e = V.extend({ type: "button" }, e = "function" == typeof e ? { click: e, text: t } : e), i = e.click, t = { icon: e.icon, iconPosition: e.iconPosition, showLabel: e.showLabel, icons: e.icons, text: e.text }, delete e.click, delete e.icon, delete e.iconPosition, delete e.showLabel, delete e.icons, "boolean" == typeof e.text && delete e.text, V("<button></button>", e).button(t).appendTo(s.uiButtonSet).on("click", function () { i.apply(s.element[0], arguments) }) }), this._addClass(this.uiDialog, "ui-dialog-buttons"), this.uiDialogButtonPane.appendTo(this.uiDialog)) }, _makeDraggable: function () { var n = this, o = this.options; function a(t) { return { position: t.position, offset: t.offset } } this.uiDialog.draggable({ cancel: ".ui-dialog-content, .ui-dialog-titlebar-close", handle: ".ui-dialog-titlebar", containment: "document", start: function (t, e) { n._addClass(V(this), "ui-dialog-dragging"), n._blockFrames(), n._trigger("dragStart", t, a(e)) }, drag: function (t, e) { n._trigger("drag", t, a(e)) }, stop: function (t, e) { var i = e.offset.left - n.document.scrollLeft(), s = e.offset.top - n.document.scrollTop(); o.position = { my: "left top", at: "left" + (0 <= i ? "+" : "") + i + " top" + (0 <= s ? "+" : "") + s, of: n.window }, n._removeClass(V(this), "ui-dialog-dragging"), n._unblockFrames(), n._trigger("dragStop", t, a(e)) } }) }, _makeResizable: function () { var n = this, o = this.options, t = o.resizable, e = this.uiDialog.css("position"), t = "string" == typeof t ? t : "n,e,s,w,se,sw,ne,nw"; function a(t) { return { originalPosition: t.originalPosition, originalSize: t.originalSize, position: t.position, size: t.size } } this.uiDialog.resizable({ cancel: ".ui-dialog-content", containment: "document", alsoResize: this.element, maxWidth: o.maxWidth, maxHeight: o.maxHeight, minWidth: o.minWidth, minHeight: this._minHeight(), handles: t, start: function (t, e) { n._addClass(V(this), "ui-dialog-resizing"), n._blockFrames(), n._trigger("resizeStart", t, a(e)) }, resize: function (t, e) { n._trigger("resize", t, a(e)) }, stop: function (t, e) { var i = n.uiDialog.offset(), s = i.left - n.document.scrollLeft(), i = i.top - n.document.scrollTop(); o.height = n.uiDialog.height(), o.width = n.uiDialog.width(), o.position = { my: "left top", at: "left" + (0 <= s ? "+" : "") + s + " top" + (0 <= i ? "+" : "") + i, of: n.window }, n._removeClass(V(this), "ui-dialog-resizing"), n._unblockFrames(), n._trigger("resizeStop", t, a(e)) } }).css("position", e) }, _trackFocus: function () { this._on(this.widget(), { focusin: function (t) { this._makeFocusTarget(), this._focusedElement = V(t.target) } }) }, _makeFocusTarget: function () { this._untrackInstance(), this._trackingInstances().unshift(this) }, _untrackInstance: function () { var t = this._trackingInstances(), e = V.inArray(this, t); -1 !== e && t.splice(e, 1) }, _trackingInstances: function () { var t = this.document.data("ui-dialog-instances"); return t || this.document.data("ui-dialog-instances", t = []), t }, _minHeight: function () { var t = this.options; return "auto" === t.height ? t.minHeight : Math.min(t.minHeight, t.height) }, _position: function () { var t = this.uiDialog.is(":visible"); t || this.uiDialog.show(), this.uiDialog.position(this.options.position), t || this.uiDialog.hide() }, _setOptions: function (t) { var i = this, s = !1, n = {}; V.each(t, function (t, e) { i._setOption(t, e), t in i.sizeRelatedOptions && (s = !0), t in i.resizableRelatedOptions && (n[t] = e) }), s && (this._size(), this._position()), this.uiDialog.is(":data(ui-resizable)") && this.uiDialog.resizable("option", n) }, _setOption: function (t, e) { var i, s = this.uiDialog; "disabled" !== t && (this._super(t, e), "appendTo" === t && this.uiDialog.appendTo(this._appendTo()), "buttons" === t && this._createButtons(), "closeText" === t && this.uiDialogTitlebarClose.button({ label: V("<a>").text("" + this.options.closeText).html() }), "draggable" === t && ((i = s.is(":data(ui-draggable)")) && !e && s.draggable("destroy"), !i && e && this._makeDraggable()), "position" === t && this._position(), "resizable" === t && ((i = s.is(":data(ui-resizable)")) && !e && s.resizable("destroy"), i && "string" == typeof e && s.resizable("option", "handles", e), i || !1 === e || this._makeResizable()), "title" === t && this._title(this.uiDialogTitlebar.find(".ui-dialog-title"))) }, _size: function () { var t, e, i, s = this.options; this.element.show().css({ width: "auto", minHeight: 0, maxHeight: "none", height: 0 }), s.minWidth > s.width && (s.width = s.minWidth), t = this.uiDialog.css({ height: "auto", width: s.width }).outerHeight(), e = Math.max(0, s.minHeight - t), i = "number" == typeof s.maxHeight ? Math.max(0, s.maxHeight - t) : "none", "auto" === s.height ? this.element.css({ minHeight: e, maxHeight: i, height: "auto" }) : this.element.height(Math.max(0, s.height - t)), this.uiDialog.is(":data(ui-resizable)") && this.uiDialog.resizable("option", "minHeight", this._minHeight()) }, _blockFrames: function () { this.iframeBlocks = this.document.find("iframe").map(function () { var t = V(this); return V("<div>").css({ position: "absolute", width: t.outerWidth(), height: t.outerHeight() }).appendTo(t.parent()).offset(t.offset())[0] }) }, _unblockFrames: function () { this.iframeBlocks && (this.iframeBlocks.remove(), delete this.iframeBlocks) }, _allowInteraction: function (t) { return !!V(t.target).closest(".ui-dialog").length || !!V(t.target).closest(".ui-datepicker").length }, _createOverlay: function () { var i, s; this.options.modal && (i = V.fn.jquery.substring(0, 4), s = !0, this._delay(function () { s = !1 }), this.document.data("ui-dialog-overlays") || this.document.on("focusin.ui-dialog", function (t) { var e; s || ((e = this._trackingInstances()[0])._allowInteraction(t) || (t.preventDefault(), e._focusTabbable(), "3.4." !== i && "3.5." !== i || e._delay(e._restoreTabbableFocus))) }.bind(this)), this.overlay = V("<div>").appendTo(this._appendTo()), this._addClass(this.overlay, null, "ui-widget-overlay ui-front"), this._on(this.overlay, { mousedown: "_keepFocus" }), this.document.data("ui-dialog-overlays", (this.document.data("ui-dialog-overlays") || 0) + 1)) }, _destroyOverlay: function () { var t; this.options.modal && this.overlay && ((t = this.document.data("ui-dialog-overlays") - 1) ? this.document.data("ui-dialog-overlays", t) : (this.document.off("focusin.ui-dialog"), this.document.removeData("ui-dialog-overlays")), this.overlay.remove(), this.overlay = null) } }), !1 !== V.uiBackCompat && V.widget("ui.dialog", V.ui.dialog, { options: { dialogClass: "" }, _createWrapper: function () { this._super(), this.uiDialog.addClass(this.options.dialogClass) }, _setOption: function (t, e) { "dialogClass" === t && this.uiDialog.removeClass(this.options.dialogClass).addClass(e), this._superApply(arguments) } }); V.ui.dialog; function lt(t, e, i) { return e <= t && t < e + i } V.widget("ui.droppable", { version: "1.13.2", widgetEventPrefix: "drop", options: { accept: "*", addClasses: !0, greedy: !1, scope: "default", tolerance: "intersect", activate: null, deactivate: null, drop: null, out: null, over: null }, _create: function () { var t, e = this.options, i = e.accept; this.isover = !1, this.isout = !0, this.accept = "function" == typeof i ? i : function (t) { return t.is(i) }, this.proportions = function () { if (!arguments.length) return t = t || { width: this.element[0].offsetWidth, height: this.element[0].offsetHeight }; t = arguments[0] }, this._addToManager(e.scope), e.addClasses && this._addClass("ui-droppable") }, _addToManager: function (t) { V.ui.ddmanager.droppables[t] = V.ui.ddmanager.droppables[t] || [], V.ui.ddmanager.droppables[t].push(this) }, _splice: function (t) { for (var e = 0; e < t.length; e++)t[e] === this && t.splice(e, 1) }, _destroy: function () { var t = V.ui.ddmanager.droppables[this.options.scope]; this._splice(t) }, _setOption: function (t, e) { var i; "accept" === t ? this.accept = "function" == typeof e ? e : function (t) { return t.is(e) } : "scope" === t && (i = V.ui.ddmanager.droppables[this.options.scope], this._splice(i), this._addToManager(e)), this._super(t, e) }, _activate: function (t) { var e = V.ui.ddmanager.current; this._addActiveClass(), e && this._trigger("activate", t, this.ui(e)) }, _deactivate: function (t) { var e = V.ui.ddmanager.current; this._removeActiveClass(), e && this._trigger("deactivate", t, this.ui(e)) }, _over: function (t) { var e = V.ui.ddmanager.current; e && (e.currentItem || e.element)[0] !== this.element[0] && this.accept.call(this.element[0], e.currentItem || e.element) && (this._addHoverClass(), this._trigger("over", t, this.ui(e))) }, _out: function (t) { var e = V.ui.ddmanager.current; e && (e.currentItem || e.element)[0] !== this.element[0] && this.accept.call(this.element[0], e.currentItem || e.element) && (this._removeHoverClass(), this._trigger("out", t, this.ui(e))) }, _drop: function (e, t) { var i = t || V.ui.ddmanager.current, s = !1; return !(!i || (i.currentItem || i.element)[0] === this.element[0]) && (this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function () { var t = V(this).droppable("instance"); if (t.options.greedy && !t.options.disabled && t.options.scope === i.options.scope && t.accept.call(t.element[0], i.currentItem || i.element) && V.ui.intersect(i, V.extend(t, { offset: t.element.offset() }), t.options.tolerance, e)) return !(s = !0) }), !s && (!!this.accept.call(this.element[0], i.currentItem || i.element) && (this._removeActiveClass(), this._removeHoverClass(), this._trigger("drop", e, this.ui(i)), this.element))) }, ui: function (t) { return { draggable: t.currentItem || t.element, helper: t.helper, position: t.position, offset: t.positionAbs } }, _addHoverClass: function () { this._addClass("ui-droppable-hover") }, _removeHoverClass: function () { this._removeClass("ui-droppable-hover") }, _addActiveClass: function () { this._addClass("ui-droppable-active") }, _removeActiveClass: function () { this._removeClass("ui-droppable-active") } }), V.ui.intersect = function (t, e, i, s) { if (!e.offset) return !1; var n = (t.positionAbs || t.position.absolute).left + t.margins.left, o = (t.positionAbs || t.position.absolute).top + t.margins.top, a = n + t.helperProportions.width, r = o + t.helperProportions.height, l = e.offset.left, h = e.offset.top, c = l + e.proportions().width, u = h + e.proportions().height; switch (i) { case "fit": return l <= n && a <= c && h <= o && r <= u; case "intersect": return l < n + t.helperProportions.width / 2 && a - t.helperProportions.width / 2 < c && h < o + t.helperProportions.height / 2 && r - t.helperProportions.height / 2 < u; case "pointer": return lt(s.pageY, h, e.proportions().height) && lt(s.pageX, l, e.proportions().width); case "touch": return (h <= o && o <= u || h <= r && r <= u || o < h && u < r) && (l <= n && n <= c || l <= a && a <= c || n < l && c < a); default: return !1 } }, !(V.ui.ddmanager = { current: null, droppables: { default: [] }, prepareOffsets: function (t, e) { var i, s, n = V.ui.ddmanager.droppables[t.options.scope] || [], o = e ? e.type : null, a = (t.currentItem || t.element).find(":data(ui-droppable)").addBack(); t: for (i = 0; i < n.length; i++)if (!(n[i].options.disabled || t && !n[i].accept.call(n[i].element[0], t.currentItem || t.element))) { for (s = 0; s < a.length; s++)if (a[s] === n[i].element[0]) { n[i].proportions().height = 0; continue t } n[i].visible = "none" !== n[i].element.css("display"), n[i].visible && ("mousedown" === o && n[i]._activate.call(n[i], e), n[i].offset = n[i].element.offset(), n[i].proportions({ width: n[i].element[0].offsetWidth, height: n[i].element[0].offsetHeight })) } }, drop: function (t, e) { var i = !1; return V.each((V.ui.ddmanager.droppables[t.options.scope] || []).slice(), function () { this.options && (!this.options.disabled && this.visible && V.ui.intersect(t, this, this.options.tolerance, e) && (i = this._drop.call(this, e) || i), !this.options.disabled && this.visible && this.accept.call(this.element[0], t.currentItem || t.element) && (this.isout = !0, this.isover = !1, this._deactivate.call(this, e))) }), i }, dragStart: function (t, e) { t.element.parentsUntil("body").on("scroll.droppable", function () { t.options.refreshPositions || V.ui.ddmanager.prepareOffsets(t, e) }) }, drag: function (n, o) { n.options.refreshPositions && V.ui.ddmanager.prepareOffsets(n, o), V.each(V.ui.ddmanager.droppables[n.options.scope] || [], function () { var t, e, i, s; this.options.disabled || this.greedyChild || !this.visible || (s = !(i = V.ui.intersect(n, this, this.options.tolerance, o)) && this.isover ? "isout" : i && !this.isover ? "isover" : null) && (this.options.greedy && (e = this.options.scope, (i = this.element.parents(":data(ui-droppable)").filter(function () { return V(this).droppable("instance").options.scope === e })).length && ((t = V(i[0]).droppable("instance")).greedyChild = "isover" === s)), t && "isover" === s && (t.isover = !1, t.isout = !0, t._out.call(t, o)), this[s] = !0, this["isout" === s ? "isover" : "isout"] = !1, this["isover" === s ? "_over" : "_out"].call(this, o), t && "isout" === s && (t.isout = !1, t.isover = !0, t._over.call(t, o))) }) }, dragStop: function (t, e) { t.element.parentsUntil("body").off("scroll.droppable"), t.options.refreshPositions || V.ui.ddmanager.prepareOffsets(t, e) } }) !== V.uiBackCompat && V.widget("ui.droppable", V.ui.droppable, { options: { hoverClass: !1, activeClass: !1 }, _addActiveClass: function () { this._super(), this.options.activeClass && this.element.addClass(this.options.activeClass) }, _removeActiveClass: function () { this._super(), this.options.activeClass && this.element.removeClass(this.options.activeClass) }, _addHoverClass: function () { this._super(), this.options.hoverClass && this.element.addClass(this.options.hoverClass) }, _removeHoverClass: function () { this._super(), this.options.hoverClass && this.element.removeClass(this.options.hoverClass) } }); V.ui.droppable, V.widget("ui.progressbar", { version: "1.13.2", options: { classes: { "ui-progressbar": "ui-corner-all", "ui-progressbar-value": "ui-corner-left", "ui-progressbar-complete": "ui-corner-right" }, max: 100, value: 0, change: null, complete: null }, min: 0, _create: function () { this.oldValue = this.options.value = this._constrainedValue(), this.element.attr({ role: "progressbar", "aria-valuemin": this.min }), this._addClass("ui-progressbar", "ui-widget ui-widget-content"), this.valueDiv = V("<div>").appendTo(this.element), this._addClass(this.valueDiv, "ui-progressbar-value", "ui-widget-header"), this._refreshValue() }, _destroy: function () { this.element.removeAttr("role aria-valuemin aria-valuemax aria-valuenow"), this.valueDiv.remove() }, value: function (t) { if (void 0 === t) return this.options.value; this.options.value = this._constrainedValue(t), this._refreshValue() }, _constrainedValue: function (t) { return void 0 === t && (t = this.options.value), this.indeterminate = !1 === t, "number" != typeof t && (t = 0), !this.indeterminate && Math.min(this.options.max, Math.max(this.min, t)) }, _setOptions: function (t) { var e = t.value; delete t.value, this._super(t), this.options.value = this._constrainedValue(e), this._refreshValue() }, _setOption: function (t, e) { "max" === t && (e = Math.max(this.min, e)), this._super(t, e) }, _setOptionDisabled: function (t) { this._super(t), this.element.attr("aria-disabled", t), this._toggleClass(null, "ui-state-disabled", !!t) }, _percentage: function () { return this.indeterminate ? 100 : 100 * (this.options.value - this.min) / (this.options.max - this.min) }, _refreshValue: function () { var t = this.options.value, e = this._percentage(); this.valueDiv.toggle(this.indeterminate || t > this.min).width(e.toFixed(0) + "%"), this._toggleClass(this.valueDiv, "ui-progressbar-complete", null, t === this.options.max)._toggleClass("ui-progressbar-indeterminate", null, this.indeterminate), this.indeterminate ? (this.element.removeAttr("aria-valuenow"), this.overlayDiv || (this.overlayDiv = V("<div>").appendTo(this.valueDiv), this._addClass(this.overlayDiv, "ui-progressbar-overlay"))) : (this.element.attr({ "aria-valuemax": this.options.max, "aria-valuenow": t }), this.overlayDiv && (this.overlayDiv.remove(), this.overlayDiv = null)), this.oldValue !== t && (this.oldValue = t, this._trigger("change")), t === this.options.max && this._trigger("complete") } }), V.widget("ui.selectable", V.ui.mouse, { version: "1.13.2", options: { appendTo: "body", autoRefresh: !0, distance: 0, filter: "*", tolerance: "touch", selected: null, selecting: null, start: null, stop: null, unselected: null, unselecting: null }, _create: function () { var i = this; this._addClass("ui-selectable"), this.dragged = !1, this.refresh = function () { i.elementPos = V(i.element[0]).offset(), i.selectees = V(i.options.filter, i.element[0]), i._addClass(i.selectees, "ui-selectee"), i.selectees.each(function () { var t = V(this), e = t.offset(), e = { left: e.left - i.elementPos.left, top: e.top - i.elementPos.top }; V.data(this, "selectable-item", { element: this, $element: t, left: e.left, top: e.top, right: e.left + t.outerWidth(), bottom: e.top + t.outerHeight(), startselected: !1, selected: t.hasClass("ui-selected"), selecting: t.hasClass("ui-selecting"), unselecting: t.hasClass("ui-unselecting") }) }) }, this.refresh(), this._mouseInit(), this.helper = V("<div>"), this._addClass(this.helper, "ui-selectable-helper") }, _destroy: function () { this.selectees.removeData("selectable-item"), this._mouseDestroy() }, _mouseStart: function (i) { var s = this, t = this.options; this.opos = [i.pageX, i.pageY], this.elementPos = V(this.element[0]).offset(), this.options.disabled || (this.selectees = V(t.filter, this.element[0]), this._trigger("start", i), V(t.appendTo).append(this.helper), this.helper.css({ left: i.pageX, top: i.pageY, width: 0, height: 0 }), t.autoRefresh && this.refresh(), this.selectees.filter(".ui-selected").each(function () { var t = V.data(this, "selectable-item"); t.startselected = !0, i.metaKey || i.ctrlKey || (s._removeClass(t.$element, "ui-selected"), t.selected = !1, s._addClass(t.$element, "ui-unselecting"), t.unselecting = !0, s._trigger("unselecting", i, { unselecting: t.element })) }), V(i.target).parents().addBack().each(function () { var t, e = V.data(this, "selectable-item"); if (e) return t = !i.metaKey && !i.ctrlKey || !e.$element.hasClass("ui-selected"), s._removeClass(e.$element, t ? "ui-unselecting" : "ui-selected")._addClass(e.$element, t ? "ui-selecting" : "ui-unselecting"), e.unselecting = !t, e.selecting = t, (e.selected = t) ? s._trigger("selecting", i, { selecting: e.element }) : s._trigger("unselecting", i, { unselecting: e.element }), !1 })) }, _mouseDrag: function (s) { if (this.dragged = !0, !this.options.disabled) { var t, n = this, o = this.options, a = this.opos[0], r = this.opos[1], l = s.pageX, h = s.pageY; return l < a && (t = l, l = a, a = t), h < r && (t = h, h = r, r = t), this.helper.css({ left: a, top: r, width: l - a, height: h - r }), this.selectees.each(function () { var t = V.data(this, "selectable-item"), e = !1, i = {}; t && t.element !== n.element[0] && (i.left = t.left + n.elementPos.left, i.right = t.right + n.elementPos.left, i.top = t.top + n.elementPos.top, i.bottom = t.bottom + n.elementPos.top, "touch" === o.tolerance ? e = !(i.left > l || i.right < a || i.top > h || i.bottom < r) : "fit" === o.tolerance && (e = i.left > a && i.right < l && i.top > r && i.bottom < h), e ? (t.selected && (n._removeClass(t.$element, "ui-selected"), t.selected = !1), t.unselecting && (n._removeClass(t.$element, "ui-unselecting"), t.unselecting = !1), t.selecting || (n._addClass(t.$element, "ui-selecting"), t.selecting = !0, n._trigger("selecting", s, { selecting: t.element }))) : (t.selecting && ((s.metaKey || s.ctrlKey) && t.startselected ? (n._removeClass(t.$element, "ui-selecting"), t.selecting = !1, n._addClass(t.$element, "ui-selected"), t.selected = !0) : (n._removeClass(t.$element, "ui-selecting"), t.selecting = !1, t.startselected && (n._addClass(t.$element, "ui-unselecting"), t.unselecting = !0), n._trigger("unselecting", s, { unselecting: t.element }))), t.selected && (s.metaKey || s.ctrlKey || t.startselected || (n._removeClass(t.$element, "ui-selected"), t.selected = !1, n._addClass(t.$element, "ui-unselecting"), t.unselecting = !0, n._trigger("unselecting", s, { unselecting: t.element }))))) }), !1 } }, _mouseStop: function (e) { var i = this; return this.dragged = !1, V(".ui-unselecting", this.element[0]).each(function () { var t = V.data(this, "selectable-item"); i._removeClass(t.$element, "ui-unselecting"), t.unselecting = !1, t.startselected = !1, i._trigger("unselected", e, { unselected: t.element }) }), V(".ui-selecting", this.element[0]).each(function () { var t = V.data(this, "selectable-item"); i._removeClass(t.$element, "ui-selecting")._addClass(t.$element, "ui-selected"), t.selecting = !1, t.selected = !0, t.startselected = !0, i._trigger("selected", e, { selected: t.element }) }), this._trigger("stop", e), this.helper.remove(), !1 } }), V.widget("ui.selectmenu", [V.ui.formResetMixin, { version: "1.13.2", defaultElement: "<select>", options: { appendTo: null, classes: { "ui-selectmenu-button-open": "ui-corner-top", "ui-selectmenu-button-closed": "ui-corner-all" }, disabled: null, icons: { button: "ui-icon-triangle-1-s" }, position: { my: "left top", at: "left bottom", collision: "none" }, width: !1, change: null, close: null, focus: null, open: null, select: null }, _create: function () { var t = this.element.uniqueId().attr("id"); this.ids = { element: t, button: t + "-button", menu: t + "-menu" }, this._drawButton(), this._drawMenu(), this._bindFormResetHandler(), this._rendered = !1, this.menuItems = V() }, _drawButton: function () { var t, e = this, i = this._parseOption(this.element.find("option:selected"), this.element[0].selectedIndex); this.labels = this.element.labels().attr("for", this.ids.button), this._on(this.labels, { click: function (t) { this.button.trigger("focus"), t.preventDefault() } }), this.element.hide(), this.button = V("<span>", { tabindex: this.options.disabled ? -1 : 0, id: this.ids.button, role: "combobox", "aria-expanded": "false", "aria-autocomplete": "list", "aria-owns": this.ids.menu, "aria-haspopup": "true", title: this.element.attr("title") }).insertAfter(this.element), this._addClass(this.button, "ui-selectmenu-button ui-selectmenu-button-closed", "ui-button ui-widget"), t = V("<span>").appendTo(this.button), this._addClass(t, "ui-selectmenu-icon", "ui-icon " + this.options.icons.button), this.buttonItem = this._renderButtonItem(i).appendTo(this.button), !1 !== this.options.width && this._resizeButton(), this._on(this.button, this._buttonEvents), this.button.one("focusin", function () { e._rendered || e._refreshMenu() }) }, _drawMenu: function () { var i = this; this.menu = V("<ul>", { "aria-hidden": "true", "aria-labelledby": this.ids.button, id: this.ids.menu }), this.menuWrap = V("<div>").append(this.menu), this._addClass(this.menuWrap, "ui-selectmenu-menu", "ui-front"), this.menuWrap.appendTo(this._appendTo()), this.menuInstance = this.menu.menu({ classes: { "ui-menu": "ui-corner-bottom" }, role: "listbox", select: function (t, e) { t.preventDefault(), i._setSelection(), i._select(e.item.data("ui-selectmenu-item"), t) }, focus: function (t, e) { e = e.item.data("ui-selectmenu-item"); null != i.focusIndex && e.index !== i.focusIndex && (i._trigger("focus", t, { item: e }), i.isOpen || i._select(e, t)), i.focusIndex = e.index, i.button.attr("aria-activedescendant", i.menuItems.eq(e.index).attr("id")) } }).menu("instance"), this.menuInstance._off(this.menu, "mouseleave"), this.menuInstance._closeOnDocumentClick = function () { return !1 }, this.menuInstance._isDivider = function () { return !1 } }, refresh: function () { this._refreshMenu(), this.buttonItem.replaceWith(this.buttonItem = this._renderButtonItem(this._getSelectedItem().data("ui-selectmenu-item") || {})), null === this.options.width && this._resizeButton() }, _refreshMenu: function () { var t = this.element.find("option"); this.menu.empty(), this._parseOptions(t), this._renderMenu(this.menu, this.items), this.menuInstance.refresh(), this.menuItems = this.menu.find("li").not(".ui-selectmenu-optgroup").find(".ui-menu-item-wrapper"), this._rendered = !0, t.length && (t = this._getSelectedItem(), this.menuInstance.focus(null, t), this._setAria(t.data("ui-selectmenu-item")), this._setOption("disabled", this.element.prop("disabled"))) }, open: function (t) { this.options.disabled || (this._rendered ? (this._removeClass(this.menu.find(".ui-state-active"), null, "ui-state-active"), this.menuInstance.focus(null, this._getSelectedItem())) : this._refreshMenu(), this.menuItems.length && (this.isOpen = !0, this._toggleAttr(), this._resizeMenu(), this._position(), this._on(this.document, this._documentClick), this._trigger("open", t))) }, _position: function () { this.menuWrap.position(V.extend({ of: this.button }, this.options.position)) }, close: function (t) { this.isOpen && (this.isOpen = !1, this._toggleAttr(), this.range = null, this._off(this.document), this._trigger("close", t)) }, widget: function () { return this.button }, menuWidget: function () { return this.menu }, _renderButtonItem: function (t) { var e = V("<span>"); return this._setText(e, t.label), this._addClass(e, "ui-selectmenu-text"), e }, _renderMenu: function (s, t) { var n = this, o = ""; V.each(t, function (t, e) { var i; e.optgroup !== o && (i = V("<li>", { text: e.optgroup }), n._addClass(i, "ui-selectmenu-optgroup", "ui-menu-divider" + (e.element.parent("optgroup").prop("disabled") ? " ui-state-disabled" : "")), i.appendTo(s), o = e.optgroup), n._renderItemData(s, e) }) }, _renderItemData: function (t, e) { return this._renderItem(t, e).data("ui-selectmenu-item", e) }, _renderItem: function (t, e) { var i = V("<li>"), s = V("<div>", { title: e.element.attr("title") }); return e.disabled && this._addClass(i, null, "ui-state-disabled"), this._setText(s, e.label), i.append(s).appendTo(t) }, _setText: function (t, e) { e ? t.text(e) : t.html("&#160;") }, _move: function (t, e) { var i, s = ".ui-menu-item"; this.isOpen ? i = this.menuItems.eq(this.focusIndex).parent("li") : (i = this.menuItems.eq(this.element[0].selectedIndex).parent("li"), s += ":not(.ui-state-disabled)"), (s = "first" === t || "last" === t ? i["first" === t ? "prevAll" : "nextAll"](s).eq(-1) : i[t + "All"](s).eq(0)).length && this.menuInstance.focus(e, s) }, _getSelectedItem: function () { return this.menuItems.eq(this.element[0].selectedIndex).parent("li") }, _toggle: function (t) { this[this.isOpen ? "close" : "open"](t) }, _setSelection: function () { var t; this.range && (window.getSelection ? ((t = window.getSelection()).removeAllRanges(), t.addRange(this.range)) : this.range.select(), this.button.trigger("focus")) }, _documentClick: { mousedown: function (t) { this.isOpen && (V(t.target).closest(".ui-selectmenu-menu, #" + V.escapeSelector(this.ids.button)).length || this.close(t)) } }, _buttonEvents: { mousedown: function () { var t; window.getSelection ? (t = window.getSelection()).rangeCount && (this.range = t.getRangeAt(0)) : this.range = document.selection.createRange() }, click: function (t) { this._setSelection(), this._toggle(t) }, keydown: function (t) { var e = !0; switch (t.keyCode) { case V.ui.keyCode.TAB: case V.ui.keyCode.ESCAPE: this.close(t), e = !1; break; case V.ui.keyCode.ENTER: this.isOpen && this._selectFocusedItem(t); break; case V.ui.keyCode.UP: t.altKey ? this._toggle(t) : this._move("prev", t); break; case V.ui.keyCode.DOWN: t.altKey ? this._toggle(t) : this._move("next", t); break; case V.ui.keyCode.SPACE: this.isOpen ? this._selectFocusedItem(t) : this._toggle(t); break; case V.ui.keyCode.LEFT: this._move("prev", t); break; case V.ui.keyCode.RIGHT: this._move("next", t); break; case V.ui.keyCode.HOME: case V.ui.keyCode.PAGE_UP: this._move("first", t); break; case V.ui.keyCode.END: case V.ui.keyCode.PAGE_DOWN: this._move("last", t); break; default: this.menu.trigger(t), e = !1 }e && t.preventDefault() } }, _selectFocusedItem: function (t) { var e = this.menuItems.eq(this.focusIndex).parent("li"); e.hasClass("ui-state-disabled") || this._select(e.data("ui-selectmenu-item"), t) }, _select: function (t, e) { var i = this.element[0].selectedIndex; this.element[0].selectedIndex = t.index, this.buttonItem.replaceWith(this.buttonItem = this._renderButtonItem(t)), this._setAria(t), this._trigger("select", e, { item: t }), t.index !== i && this._trigger("change", e, { item: t }), this.close(e) }, _setAria: function (t) { t = this.menuItems.eq(t.index).attr("id"); this.button.attr({ "aria-labelledby": t, "aria-activedescendant": t }), this.menu.attr("aria-activedescendant", t) }, _setOption: function (t, e) { var i; "icons" === t && (i = this.button.find("span.ui-icon"), this._removeClass(i, null, this.options.icons.button)._addClass(i, null, e.button)), this._super(t, e), "appendTo" === t && this.menuWrap.appendTo(this._appendTo()), "width" === t && this._resizeButton() }, _setOptionDisabled: function (t) { this._super(t), this.menuInstance.option("disabled", t), this.button.attr("aria-disabled", t), this._toggleClass(this.button, null, "ui-state-disabled", t), this.element.prop("disabled", t), t ? (this.button.attr("tabindex", -1), this.close()) : this.button.attr("tabindex", 0) }, _appendTo: function () { var t = this.options.appendTo; return t = !(t = !(t = t && (t.jquery || t.nodeType ? V(t) : this.document.find(t).eq(0))) || !t[0] ? this.element.closest(".ui-front, dialog") : t).length ? this.document[0].body : t }, _toggleAttr: function () { this.button.attr("aria-expanded", this.isOpen), this._removeClass(this.button, "ui-selectmenu-button-" + (this.isOpen ? "closed" : "open"))._addClass(this.button, "ui-selectmenu-button-" + (this.isOpen ? "open" : "closed"))._toggleClass(this.menuWrap, "ui-selectmenu-open", null, this.isOpen), this.menu.attr("aria-hidden", !this.isOpen) }, _resizeButton: function () { var t = this.options.width; !1 !== t ? (null === t && (t = this.element.show().outerWidth(), this.element.hide()), this.button.outerWidth(t)) : this.button.css("width", "") }, _resizeMenu: function () { this.menu.outerWidth(Math.max(this.button.outerWidth(), this.menu.width("").outerWidth() + 1)) }, _getCreateOptions: function () { var t = this._super(); return t.disabled = this.element.prop("disabled"), t }, _parseOptions: function (t) { var i = this, s = []; t.each(function (t, e) { e.hidden || s.push(i._parseOption(V(e), t)) }), this.items = s }, _parseOption: function (t, e) { var i = t.parent("optgroup"); return { element: t, index: e, value: t.val(), label: t.text(), optgroup: i.attr("label") || "", disabled: i.prop("disabled") || t.prop("disabled") } }, _destroy: function () { this._unbindFormResetHandler(), this.menuWrap.remove(), this.button.remove(), this.element.show(), this.element.removeUniqueId(), this.labels.attr("for", this.ids.element) } }]), V.widget("ui.slider", V.ui.mouse, { version: "1.13.2", widgetEventPrefix: "slide", options: { animate: !1, classes: { "ui-slider": "ui-corner-all", "ui-slider-handle": "ui-corner-all", "ui-slider-range": "ui-corner-all ui-widget-header" }, distance: 0, max: 100, min: 0, orientation: "horizontal", range: !1, step: 1, value: 0, values: null, change: null, slide: null, start: null, stop: null }, numPages: 5, _create: function () { this._keySliding = !1, this._mouseSliding = !1, this._animateOff = !0, this._handleIndex = null, this._detectOrientation(), this._mouseInit(), this._calculateNewMax(), this._addClass("ui-slider ui-slider-" + this.orientation, "ui-widget ui-widget-content"), this._refresh(), this._animateOff = !1 }, _refresh: function () { this._createRange(), this._createHandles(), this._setupEvents(), this._refreshValue() }, _createHandles: function () { var t, e = this.options, i = this.element.find(".ui-slider-handle"), s = [], n = e.values && e.values.length || 1; for (i.length > n && (i.slice(n).remove(), i = i.slice(0, n)), t = i.length; t < n; t++)s.push("<span tabindex='0'></span>"); this.handles = i.add(V(s.join("")).appendTo(this.element)), this._addClass(this.handles, "ui-slider-handle", "ui-state-default"), this.handle = this.handles.eq(0), this.handles.each(function (t) { V(this).data("ui-slider-handle-index", t).attr("tabIndex", 0) }) }, _createRange: function () { var t = this.options; t.range ? (!0 === t.range && (t.values ? t.values.length && 2 !== t.values.length ? t.values = [t.values[0], t.values[0]] : Array.isArray(t.values) && (t.values = t.values.slice(0)) : t.values = [this._valueMin(), this._valueMin()]), this.range && this.range.length ? (this._removeClass(this.range, "ui-slider-range-min ui-slider-range-max"), this.range.css({ left: "", bottom: "" })) : (this.range = V("<div>").appendTo(this.element), this._addClass(this.range, "ui-slider-range")), "min" !== t.range && "max" !== t.range || this._addClass(this.range, "ui-slider-range-" + t.range)) : (this.range && this.range.remove(), this.range = null) }, _setupEvents: function () { this._off(this.handles), this._on(this.handles, this._handleEvents), this._hoverable(this.handles), this._focusable(this.handles) }, _destroy: function () { this.handles.remove(), this.range && this.range.remove(), this._mouseDestroy() }, _mouseCapture: function (t) { var i, s, n, o, e, a, r = this, l = this.options; return !l.disabled && (this.elementSize = { width: this.element.outerWidth(), height: this.element.outerHeight() }, this.elementOffset = this.element.offset(), a = { x: t.pageX, y: t.pageY }, i = this._normValueFromMouse(a), s = this._valueMax() - this._valueMin() + 1, this.handles.each(function (t) { var e = Math.abs(i - r.values(t)); (e < s || s === e && (t === r._lastChangedValue || r.values(t) === l.min)) && (s = e, n = V(this), o = t) }), !1 !== this._start(t, o) && (this._mouseSliding = !0, this._handleIndex = o, this._addClass(n, null, "ui-state-active"), n.trigger("focus"), e = n.offset(), a = !V(t.target).parents().addBack().is(".ui-slider-handle"), this._clickOffset = a ? { left: 0, top: 0 } : { left: t.pageX - e.left - n.width() / 2, top: t.pageY - e.top - n.height() / 2 - (parseInt(n.css("borderTopWidth"), 10) || 0) - (parseInt(n.css("borderBottomWidth"), 10) || 0) + (parseInt(n.css("marginTop"), 10) || 0) }, this.handles.hasClass("ui-state-hover") || this._slide(t, o, i), this._animateOff = !0)) }, _mouseStart: function () { return !0 }, _mouseDrag: function (t) { var e = { x: t.pageX, y: t.pageY }, e = this._normValueFromMouse(e); return this._slide(t, this._handleIndex, e), !1 }, _mouseStop: function (t) { return this._removeClass(this.handles, null, "ui-state-active"), this._mouseSliding = !1, this._stop(t, this._handleIndex), this._change(t, this._handleIndex), this._handleIndex = null, this._clickOffset = null, this._animateOff = !1 }, _detectOrientation: function () { this.orientation = "vertical" === this.options.orientation ? "vertical" : "horizontal" }, _normValueFromMouse: function (t) { var e, t = "horizontal" === this.orientation ? (e = this.elementSize.width, t.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0)) : (e = this.elementSize.height, t.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0)), t = t / e; return (t = 1 < t ? 1 : t) < 0 && (t = 0), "vertical" === this.orientation && (t = 1 - t), e = this._valueMax() - this._valueMin(), e = this._valueMin() + t * e, this._trimAlignValue(e) }, _uiHash: function (t, e, i) { var s = { handle: this.handles[t], handleIndex: t, value: void 0 !== e ? e : this.value() }; return this._hasMultipleValues() && (s.value = void 0 !== e ? e : this.values(t), s.values = i || this.values()), s }, _hasMultipleValues: function () { return this.options.values && this.options.values.length }, _start: function (t, e) { return this._trigger("start", t, this._uiHash(e)) }, _slide: function (t, e, i) { var s, n = this.value(), o = this.values(); this._hasMultipleValues() && (s = this.values(e ? 0 : 1), n = this.values(e), 2 === this.options.values.length && !0 === this.options.range && (i = 0 === e ? Math.min(s, i) : Math.max(s, i)), o[e] = i), i !== n && !1 !== this._trigger("slide", t, this._uiHash(e, i, o)) && (this._hasMultipleValues() ? this.values(e, i) : this.value(i)) }, _stop: function (t, e) { this._trigger("stop", t, this._uiHash(e)) }, _change: function (t, e) { this._keySliding || this._mouseSliding || (this._lastChangedValue = e, this._trigger("change", t, this._uiHash(e))) }, value: function (t) { return arguments.length ? (this.options.value = this._trimAlignValue(t), this._refreshValue(), void this._change(null, 0)) : this._value() }, values: function (t, e) { var i, s, n; if (1 < arguments.length) return this.options.values[t] = this._trimAlignValue(e), this._refreshValue(), void this._change(null, t); if (!arguments.length) return this._values(); if (!Array.isArray(t)) return this._hasMultipleValues() ? this._values(t) : this.value(); for (i = this.options.values, s = t, n = 0; n < i.length; n += 1)i[n] = this._trimAlignValue(s[n]), this._change(null, n); this._refreshValue() }, _setOption: function (t, e) { var i, s = 0; switch ("range" === t && !0 === this.options.range && ("min" === e ? (this.options.value = this._values(0), this.options.values = null) : "max" === e && (this.options.value = this._values(this.options.values.length - 1), this.options.values = null)), Array.isArray(this.options.values) && (s = this.options.values.length), this._super(t, e), t) { case "orientation": this._detectOrientation(), this._removeClass("ui-slider-horizontal ui-slider-vertical")._addClass("ui-slider-" + this.orientation), this._refreshValue(), this.options.range && this._refreshRange(e), this.handles.css("horizontal" === e ? "bottom" : "left", ""); break; case "value": this._animateOff = !0, this._refreshValue(), this._change(null, 0), this._animateOff = !1; break; case "values": for (this._animateOff = !0, this._refreshValue(), i = s - 1; 0 <= i; i--)this._change(null, i); this._animateOff = !1; break; case "step": case "min": case "max": this._animateOff = !0, this._calculateNewMax(), this._refreshValue(), this._animateOff = !1; break; case "range": this._animateOff = !0, this._refresh(), this._animateOff = !1 } }, _setOptionDisabled: function (t) { this._super(t), this._toggleClass(null, "ui-state-disabled", !!t) }, _value: function () { var t = this.options.value; return t = this._trimAlignValue(t) }, _values: function (t) { var e, i; if (arguments.length) return t = this.options.values[t], t = this._trimAlignValue(t); if (this._hasMultipleValues()) { for (e = this.options.values.slice(), i = 0; i < e.length; i += 1)e[i] = this._trimAlignValue(e[i]); return e } return [] }, _trimAlignValue: function (t) { if (t <= this._valueMin()) return this._valueMin(); if (t >= this._valueMax()) return this._valueMax(); var e = 0 < this.options.step ? this.options.step : 1, i = (t - this._valueMin()) % e, t = t - i; return 2 * Math.abs(i) >= e && (t += 0 < i ? e : -e), parseFloat(t.toFixed(5)) }, _calculateNewMax: function () { var t = this.options.max, e = this._valueMin(), i = this.options.step; (t = Math.round((t - e) / i) * i + e) > this.options.max && (t -= i), this.max = parseFloat(t.toFixed(this._precision())) }, _precision: function () { var t = this._precisionOf(this.options.step); return t = null !== this.options.min ? Math.max(t, this._precisionOf(this.options.min)) : t }, _precisionOf: function (t) { var e = t.toString(), t = e.indexOf("."); return -1 === t ? 0 : e.length - t - 1 }, _valueMin: function () { return this.options.min }, _valueMax: function () { return this.max }, _refreshRange: function (t) { "vertical" === t && this.range.css({ width: "", left: "" }), "horizontal" === t && this.range.css({ height: "", bottom: "" }) }, _refreshValue: function () { var e, i, t, s, n, o = this.options.range, a = this.options, r = this, l = !this._animateOff && a.animate, h = {}; this._hasMultipleValues() ? this.handles.each(function (t) { i = (r.values(t) - r._valueMin()) / (r._valueMax() - r._valueMin()) * 100, h["horizontal" === r.orientation ? "left" : "bottom"] = i + "%", V(this).stop(1, 1)[l ? "animate" : "css"](h, a.animate), !0 === r.options.range && ("horizontal" === r.orientation ? (0 === t && r.range.stop(1, 1)[l ? "animate" : "css"]({ left: i + "%" }, a.animate), 1 === t && r.range[l ? "animate" : "css"]({ width: i - e + "%" }, { queue: !1, duration: a.animate })) : (0 === t && r.range.stop(1, 1)[l ? "animate" : "css"]({ bottom: i + "%" }, a.animate), 1 === t && r.range[l ? "animate" : "css"]({ height: i - e + "%" }, { queue: !1, duration: a.animate }))), e = i }) : (t = this.value(), s = this._valueMin(), n = this._valueMax(), i = n !== s ? (t - s) / (n - s) * 100 : 0, h["horizontal" === this.orientation ? "left" : "bottom"] = i + "%", this.handle.stop(1, 1)[l ? "animate" : "css"](h, a.animate), "min" === o && "horizontal" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({ width: i + "%" }, a.animate), "max" === o && "horizontal" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({ width: 100 - i + "%" }, a.animate), "min" === o && "vertical" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({ height: i + "%" }, a.animate), "max" === o && "vertical" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({ height: 100 - i + "%" }, a.animate)) }, _handleEvents: { keydown: function (t) { var e, i, s, n = V(t.target).data("ui-slider-handle-index"); switch (t.keyCode) { case V.ui.keyCode.HOME: case V.ui.keyCode.END: case V.ui.keyCode.PAGE_UP: case V.ui.keyCode.PAGE_DOWN: case V.ui.keyCode.UP: case V.ui.keyCode.RIGHT: case V.ui.keyCode.DOWN: case V.ui.keyCode.LEFT: if (t.preventDefault(), !this._keySliding && (this._keySliding = !0, this._addClass(V(t.target), null, "ui-state-active"), !1 === this._start(t, n))) return }switch (s = this.options.step, e = i = this._hasMultipleValues() ? this.values(n) : this.value(), t.keyCode) { case V.ui.keyCode.HOME: i = this._valueMin(); break; case V.ui.keyCode.END: i = this._valueMax(); break; case V.ui.keyCode.PAGE_UP: i = this._trimAlignValue(e + (this._valueMax() - this._valueMin()) / this.numPages); break; case V.ui.keyCode.PAGE_DOWN: i = this._trimAlignValue(e - (this._valueMax() - this._valueMin()) / this.numPages); break; case V.ui.keyCode.UP: case V.ui.keyCode.RIGHT: if (e === this._valueMax()) return; i = this._trimAlignValue(e + s); break; case V.ui.keyCode.DOWN: case V.ui.keyCode.LEFT: if (e === this._valueMin()) return; i = this._trimAlignValue(e - s) }this._slide(t, n, i) }, keyup: function (t) { var e = V(t.target).data("ui-slider-handle-index"); this._keySliding && (this._keySliding = !1, this._stop(t, e), this._change(t, e), this._removeClass(V(t.target), null, "ui-state-active")) } } }), V.widget("ui.sortable", V.ui.mouse, { version: "1.13.2", widgetEventPrefix: "sort", ready: !1, options: { appendTo: "parent", axis: !1, connectWith: !1, containment: !1, cursor: "auto", cursorAt: !1, dropOnEmpty: !0, forcePlaceholderSize: !1, forceHelperSize: !1, grid: !1, handle: !1, helper: "original", items: "> *", opacity: !1, placeholder: !1, revert: !1, scroll: !0, scrollSensitivity: 20, scrollSpeed: 20, scope: "default", tolerance: "intersect", zIndex: 1e3, activate: null, beforeStop: null, change: null, deactivate: null, out: null, over: null, receive: null, remove: null, sort: null, start: null, stop: null, update: null }, _isOverAxis: function (t, e, i) { return e <= t && t < e + i }, _isFloating: function (t) { return /left|right/.test(t.css("float")) || /inline|table-cell/.test(t.css("display")) }, _create: function () { this.containerCache = {}, this._addClass("ui-sortable"), this.refresh(), this.offset = this.element.offset(), this._mouseInit(), this._setHandleClassName(), this.ready = !0 }, _setOption: function (t, e) { this._super(t, e), "handle" === t && this._setHandleClassName() }, _setHandleClassName: function () { var t = this; this._removeClass(this.element.find(".ui-sortable-handle"), "ui-sortable-handle"), V.each(this.items, function () { t._addClass(this.instance.options.handle ? this.item.find(this.instance.options.handle) : this.item, "ui-sortable-handle") }) }, _destroy: function () { this._mouseDestroy(); for (var t = this.items.length - 1; 0 <= t; t--)this.items[t].item.removeData(this.widgetName + "-item"); return this }, _mouseCapture: function (t, e) { var i = null, s = !1, n = this; return !this.reverting && (!this.options.disabled && "static" !== this.options.type && (this._refreshItems(t), V(t.target).parents().each(function () { if (V.data(this, n.widgetName + "-item") === n) return i = V(this), !1 }), !!(i = V.data(t.target, n.widgetName + "-item") === n ? V(t.target) : i) && (!(this.options.handle && !e && (V(this.options.handle, i).find("*").addBack().each(function () { this === t.target && (s = !0) }), !s)) && (this.currentItem = i, this._removeCurrentsFromItems(), !0)))) }, _mouseStart: function (t, e, i) { var s, n, o = this.options; if ((this.currentContainer = this).refreshPositions(), this.appendTo = V("parent" !== o.appendTo ? o.appendTo : this.currentItem.parent()), this.helper = this._createHelper(t), this._cacheHelperProportions(), this._cacheMargins(), this.offset = this.currentItem.offset(), this.offset = { top: this.offset.top - this.margins.top, left: this.offset.left - this.margins.left }, V.extend(this.offset, { click: { left: t.pageX - this.offset.left, top: t.pageY - this.offset.top }, relative: this._getRelativeOffset() }), this.helper.css("position", "absolute"), this.cssPosition = this.helper.css("position"), o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt), this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] }, this.helper[0] !== this.currentItem[0] && this.currentItem.hide(), this._createPlaceholder(), this.scrollParent = this.placeholder.scrollParent(), V.extend(this.offset, { parent: this._getParentOffset() }), o.containment && this._setContainment(), o.cursor && "auto" !== o.cursor && (n = this.document.find("body"), this.storedCursor = n.css("cursor"), n.css("cursor", o.cursor), this.storedStylesheet = V("<style>*{ cursor: " + o.cursor + " !important; }</style>").appendTo(n)), o.zIndex && (this.helper.css("zIndex") && (this._storedZIndex = this.helper.css("zIndex")), this.helper.css("zIndex", o.zIndex)), o.opacity && (this.helper.css("opacity") && (this._storedOpacity = this.helper.css("opacity")), this.helper.css("opacity", o.opacity)), this.scrollParent[0] !== this.document[0] && "HTML" !== this.scrollParent[0].tagName && (this.overflowOffset = this.scrollParent.offset()), this._trigger("start", t, this._uiHash()), this._preserveHelperProportions || this._cacheHelperProportions(), !i) for (s = this.containers.length - 1; 0 <= s; s--)this.containers[s]._trigger("activate", t, this._uiHash(this)); return V.ui.ddmanager && (V.ui.ddmanager.current = this), V.ui.ddmanager && !o.dropBehaviour && V.ui.ddmanager.prepareOffsets(this, t), this.dragging = !0, this._addClass(this.helper, "ui-sortable-helper"), this.helper.parent().is(this.appendTo) || (this.helper.detach().appendTo(this.appendTo), this.offset.parent = this._getParentOffset()), this.position = this.originalPosition = this._generatePosition(t), this.originalPageX = t.pageX, this.originalPageY = t.pageY, this.lastPositionAbs = this.positionAbs = this._convertPositionTo("absolute"), this._mouseDrag(t), !0 }, _scroll: function (t) { var e = this.options, i = !1; return this.scrollParent[0] !== this.document[0] && "HTML" !== this.scrollParent[0].tagName ? (this.overflowOffset.top + this.scrollParent[0].offsetHeight - t.pageY < e.scrollSensitivity ? this.scrollParent[0].scrollTop = i = this.scrollParent[0].scrollTop + e.scrollSpeed : t.pageY - this.overflowOffset.top < e.scrollSensitivity && (this.scrollParent[0].scrollTop = i = this.scrollParent[0].scrollTop - e.scrollSpeed), this.overflowOffset.left + this.scrollParent[0].offsetWidth - t.pageX < e.scrollSensitivity ? this.scrollParent[0].scrollLeft = i = this.scrollParent[0].scrollLeft + e.scrollSpeed : t.pageX - this.overflowOffset.left < e.scrollSensitivity && (this.scrollParent[0].scrollLeft = i = this.scrollParent[0].scrollLeft - e.scrollSpeed)) : (t.pageY - this.document.scrollTop() < e.scrollSensitivity ? i = this.document.scrollTop(this.document.scrollTop() - e.scrollSpeed) : this.window.height() - (t.pageY - this.document.scrollTop()) < e.scrollSensitivity && (i = this.document.scrollTop(this.document.scrollTop() + e.scrollSpeed)), t.pageX - this.document.scrollLeft() < e.scrollSensitivity ? i = this.document.scrollLeft(this.document.scrollLeft() - e.scrollSpeed) : this.window.width() - (t.pageX - this.document.scrollLeft()) < e.scrollSensitivity && (i = this.document.scrollLeft(this.document.scrollLeft() + e.scrollSpeed))), i }, _mouseDrag: function (t) { var e, i, s, n, o = this.options; for (this.position = this._generatePosition(t), this.positionAbs = this._convertPositionTo("absolute"), this.options.axis && "y" === this.options.axis || (this.helper[0].style.left = this.position.left + "px"), this.options.axis && "x" === this.options.axis || (this.helper[0].style.top = this.position.top + "px"), o.scroll && !1 !== this._scroll(t) && (this._refreshItemPositions(!0), V.ui.ddmanager && !o.dropBehaviour && V.ui.ddmanager.prepareOffsets(this, t)), this.dragDirection = { vertical: this._getDragVerticalDirection(), horizontal: this._getDragHorizontalDirection() }, e = this.items.length - 1; 0 <= e; e--)if (s = (i = this.items[e]).item[0], (n = this._intersectsWithPointer(i)) && i.instance === this.currentContainer && !(s === this.currentItem[0] || this.placeholder[1 === n ? "next" : "prev"]()[0] === s || V.contains(this.placeholder[0], s) || "semi-dynamic" === this.options.type && V.contains(this.element[0], s))) { if (this.direction = 1 === n ? "down" : "up", "pointer" !== this.options.tolerance && !this._intersectsWithSides(i)) break; this._rearrange(t, i), this._trigger("change", t, this._uiHash()); break } return this._contactContainers(t), V.ui.ddmanager && V.ui.ddmanager.drag(this, t), this._trigger("sort", t, this._uiHash()), this.lastPositionAbs = this.positionAbs, !1 }, _mouseStop: function (t, e) { var i, s, n, o; if (t) return V.ui.ddmanager && !this.options.dropBehaviour && V.ui.ddmanager.drop(this, t), this.options.revert ? (s = (i = this).placeholder.offset(), o = {}, (n = this.options.axis) && "x" !== n || (o.left = s.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollLeft)), n && "y" !== n || (o.top = s.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollTop)), this.reverting = !0, V(this.helper).animate(o, parseInt(this.options.revert, 10) || 500, function () { i._clear(t) })) : this._clear(t, e), !1 }, cancel: function () { if (this.dragging) { this._mouseUp(new V.Event("mouseup", { target: null })), "original" === this.options.helper ? (this.currentItem.css(this._storedCSS), this._removeClass(this.currentItem, "ui-sortable-helper")) : this.currentItem.show(); for (var t = this.containers.length - 1; 0 <= t; t--)this.containers[t]._trigger("deactivate", null, this._uiHash(this)), this.containers[t].containerCache.over && (this.containers[t]._trigger("out", null, this._uiHash(this)), this.containers[t].containerCache.over = 0) } return this.placeholder && (this.placeholder[0].parentNode && this.placeholder[0].parentNode.removeChild(this.placeholder[0]), "original" !== this.options.helper && this.helper && this.helper[0].parentNode && this.helper.remove(), V.extend(this, { helper: null, dragging: !1, reverting: !1, _noFinalSort: null }), this.domPosition.prev ? V(this.domPosition.prev).after(this.currentItem) : V(this.domPosition.parent).prepend(this.currentItem)), this }, serialize: function (e) { var t = this._getItemsAsjQuery(e && e.connected), i = []; return e = e || {}, V(t).each(function () { var t = (V(e.item || this).attr(e.attribute || "id") || "").match(e.expression || /(.+)[\-=_](.+)/); t && i.push((e.key || t[1] + "[]") + "=" + (e.key && e.expression ? t[1] : t[2])) }), !i.length && e.key && i.push(e.key + "="), i.join("&") }, toArray: function (t) { var e = this._getItemsAsjQuery(t && t.connected), i = []; return t = t || {}, e.each(function () { i.push(V(t.item || this).attr(t.attribute || "id") || "") }), i }, _intersectsWith: function (t) { var e = this.positionAbs.left, i = e + this.helperProportions.width, s = this.positionAbs.top, n = s + this.helperProportions.height, o = t.left, a = o + t.width, r = t.top, l = r + t.height, h = this.offset.click.top, c = this.offset.click.left, h = "x" === this.options.axis || r < s + h && s + h < l, c = "y" === this.options.axis || o < e + c && e + c < a; return "pointer" === this.options.tolerance || this.options.forcePointerForContainers || "pointer" !== this.options.tolerance && this.helperProportions[this.floating ? "width" : "height"] > t[this.floating ? "width" : "height"] ? h && c : o < e + this.helperProportions.width / 2 && i - this.helperProportions.width / 2 < a && r < s + this.helperProportions.height / 2 && n - this.helperProportions.height / 2 < l }, _intersectsWithPointer: function (t) { var e = "x" === this.options.axis || this._isOverAxis(this.positionAbs.top + this.offset.click.top, t.top, t.height), t = "y" === this.options.axis || this._isOverAxis(this.positionAbs.left + this.offset.click.left, t.left, t.width); return !(!e || !t) && (e = this.dragDirection.vertical, t = this.dragDirection.horizontal, this.floating ? "right" === t || "down" === e ? 2 : 1 : e && ("down" === e ? 2 : 1)) }, _intersectsWithSides: function (t) { var e = this._isOverAxis(this.positionAbs.top + this.offset.click.top, t.top + t.height / 2, t.height), i = this._isOverAxis(this.positionAbs.left + this.offset.click.left, t.left + t.width / 2, t.width), s = this.dragDirection.vertical, t = this.dragDirection.horizontal; return this.floating && t ? "right" === t && i || "left" === t && !i : s && ("down" === s && e || "up" === s && !e) }, _getDragVerticalDirection: function () { var t = this.positionAbs.top - this.lastPositionAbs.top; return 0 != t && (0 < t ? "down" : "up") }, _getDragHorizontalDirection: function () { var t = this.positionAbs.left - this.lastPositionAbs.left; return 0 != t && (0 < t ? "right" : "left") }, refresh: function (t) { return this._refreshItems(t), this._setHandleClassName(), this.refreshPositions(), this }, _connectWith: function () { var t = this.options; return t.connectWith.constructor === String ? [t.connectWith] : t.connectWith }, _getItemsAsjQuery: function (t) { var e, i, s, n, o = [], a = [], r = this._connectWith(); if (r && t) for (e = r.length - 1; 0 <= e; e--)for (i = (s = V(r[e], this.document[0])).length - 1; 0 <= i; i--)(n = V.data(s[i], this.widgetFullName)) && n !== this && !n.options.disabled && a.push(["function" == typeof n.options.items ? n.options.items.call(n.element) : V(n.options.items, n.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), n]); function l() { o.push(this) } for (a.push(["function" == typeof this.options.items ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : V(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]), e = a.length - 1; 0 <= e; e--)a[e][0].each(l); return V(o) }, _removeCurrentsFromItems: function () { var i = this.currentItem.find(":data(" + this.widgetName + "-item)"); this.items = V.grep(this.items, function (t) { for (var e = 0; e < i.length; e++)if (i[e] === t.item[0]) return !1; return !0 }) }, _refreshItems: function (t) { this.items = [], this.containers = [this]; var e, i, s, n, o, a, r, l, h = this.items, c = [["function" == typeof this.options.items ? this.options.items.call(this.element[0], t, { item: this.currentItem }) : V(this.options.items, this.element), this]], u = this._connectWith(); if (u && this.ready) for (e = u.length - 1; 0 <= e; e--)for (i = (s = V(u[e], this.document[0])).length - 1; 0 <= i; i--)(n = V.data(s[i], this.widgetFullName)) && n !== this && !n.options.disabled && (c.push(["function" == typeof n.options.items ? n.options.items.call(n.element[0], t, { item: this.currentItem }) : V(n.options.items, n.element), n]), this.containers.push(n)); for (e = c.length - 1; 0 <= e; e--)for (o = c[e][1], l = (a = c[e][i = 0]).length; i < l; i++)(r = V(a[i])).data(this.widgetName + "-item", o), h.push({ item: r, instance: o, width: 0, height: 0, left: 0, top: 0 }) }, _refreshItemPositions: function (t) { for (var e, i, s = this.items.length - 1; 0 <= s; s--)e = this.items[s], this.currentContainer && e.instance !== this.currentContainer && e.item[0] !== this.currentItem[0] || (i = this.options.toleranceElement ? V(this.options.toleranceElement, e.item) : e.item, t || (e.width = i.outerWidth(), e.height = i.outerHeight()), i = i.offset(), e.left = i.left, e.top = i.top) }, refreshPositions: function (t) { var e, i; if (this.floating = !!this.items.length && ("x" === this.options.axis || this._isFloating(this.items[0].item)), this.offsetParent && this.helper && (this.offset.parent = this._getParentOffset()), this._refreshItemPositions(t), this.options.custom && this.options.custom.refreshContainers) this.options.custom.refreshContainers.call(this); else for (e = this.containers.length - 1; 0 <= e; e--)i = this.containers[e].element.offset(), this.containers[e].containerCache.left = i.left, this.containers[e].containerCache.top = i.top, this.containers[e].containerCache.width = this.containers[e].element.outerWidth(), this.containers[e].containerCache.height = this.containers[e].element.outerHeight(); return this }, _createPlaceholder: function (i) { var s, n, o = (i = i || this).options; o.placeholder && o.placeholder.constructor !== String || (s = o.placeholder, n = i.currentItem[0].nodeName.toLowerCase(), o.placeholder = { element: function () { var t = V("<" + n + ">", i.document[0]); return i._addClass(t, "ui-sortable-placeholder", s || i.currentItem[0].className)._removeClass(t, "ui-sortable-helper"), "tbody" === n ? i._createTrPlaceholder(i.currentItem.find("tr").eq(0), V("<tr>", i.document[0]).appendTo(t)) : "tr" === n ? i._createTrPlaceholder(i.currentItem, t) : "img" === n && t.attr("src", i.currentItem.attr("src")), s || t.css("visibility", "hidden"), t }, update: function (t, e) { s && !o.forcePlaceholderSize || (e.height() && (!o.forcePlaceholderSize || "tbody" !== n && "tr" !== n) || e.height(i.currentItem.innerHeight() - parseInt(i.currentItem.css("paddingTop") || 0, 10) - parseInt(i.currentItem.css("paddingBottom") || 0, 10)), e.width() || e.width(i.currentItem.innerWidth() - parseInt(i.currentItem.css("paddingLeft") || 0, 10) - parseInt(i.currentItem.css("paddingRight") || 0, 10))) } }), i.placeholder = V(o.placeholder.element.call(i.element, i.currentItem)), i.currentItem.after(i.placeholder), o.placeholder.update(i, i.placeholder) }, _createTrPlaceholder: function (t, e) { var i = this; t.children().each(function () { V("<td>&#160;</td>", i.document[0]).attr("colspan", V(this).attr("colspan") || 1).appendTo(e) }) }, _contactContainers: function (t) { for (var e, i, s, n, o, a, r, l, h, c = null, u = null, d = this.containers.length - 1; 0 <= d; d--)V.contains(this.currentItem[0], this.containers[d].element[0]) || (this._intersectsWith(this.containers[d].containerCache) ? c && V.contains(this.containers[d].element[0], c.element[0]) || (c = this.containers[d], u = d) : this.containers[d].containerCache.over && (this.containers[d]._trigger("out", t, this._uiHash(this)), this.containers[d].containerCache.over = 0)); if (c) if (1 === this.containers.length) this.containers[u].containerCache.over || (this.containers[u]._trigger("over", t, this._uiHash(this)), this.containers[u].containerCache.over = 1); else { for (i = 1e4, s = null, n = (l = c.floating || this._isFloating(this.currentItem)) ? "left" : "top", o = l ? "width" : "height", h = l ? "pageX" : "pageY", e = this.items.length - 1; 0 <= e; e--)V.contains(this.containers[u].element[0], this.items[e].item[0]) && this.items[e].item[0] !== this.currentItem[0] && (a = this.items[e].item.offset()[n], r = !1, t[h] - a > this.items[e][o] / 2 && (r = !0), Math.abs(t[h] - a) < i && (i = Math.abs(t[h] - a), s = this.items[e], this.direction = r ? "up" : "down")); (s || this.options.dropOnEmpty) && (this.currentContainer !== this.containers[u] ? (s ? this._rearrange(t, s, null, !0) : this._rearrange(t, null, this.containers[u].element, !0), this._trigger("change", t, this._uiHash()), this.containers[u]._trigger("change", t, this._uiHash(this)), this.currentContainer = this.containers[u], this.options.placeholder.update(this.currentContainer, this.placeholder), this.scrollParent = this.placeholder.scrollParent(), this.scrollParent[0] !== this.document[0] && "HTML" !== this.scrollParent[0].tagName && (this.overflowOffset = this.scrollParent.offset()), this.containers[u]._trigger("over", t, this._uiHash(this)), this.containers[u].containerCache.over = 1) : this.currentContainer.containerCache.over || (this.containers[u]._trigger("over", t, this._uiHash()), this.currentContainer.containerCache.over = 1)) } }, _createHelper: function (t) { var e = this.options, t = "function" == typeof e.helper ? V(e.helper.apply(this.element[0], [t, this.currentItem])) : "clone" === e.helper ? this.currentItem.clone() : this.currentItem; return t.parents("body").length || this.appendTo[0].appendChild(t[0]), t[0] === this.currentItem[0] && (this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") }), t[0].style.width && !e.forceHelperSize || t.width(this.currentItem.width()), t[0].style.height && !e.forceHelperSize || t.height(this.currentItem.height()), t }, _adjustOffsetFromHelper: function (t) { "string" == typeof t && (t = t.split(" ")), "left" in (t = Array.isArray(t) ? { left: +t[0], top: +t[1] || 0 } : t) && (this.offset.click.left = t.left + this.margins.left), "right" in t && (this.offset.click.left = this.helperProportions.width - t.right + this.margins.left), "top" in t && (this.offset.click.top = t.top + this.margins.top), "bottom" in t && (this.offset.click.top = this.helperProportions.height - t.bottom + this.margins.top) }, _getParentOffset: function () { this.offsetParent = this.helper.offsetParent(); var t = this.offsetParent.offset(); return "absolute" === this.cssPosition && this.scrollParent[0] !== this.document[0] && V.contains(this.scrollParent[0], this.offsetParent[0]) && (t.left += this.scrollParent.scrollLeft(), t.top += this.scrollParent.scrollTop()), { top: (t = this.offsetParent[0] === this.document[0].body || this.offsetParent[0].tagName && "html" === this.offsetParent[0].tagName.toLowerCase() && V.ui.ie ? { top: 0, left: 0 } : t).top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0), left: t.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0) } }, _getRelativeOffset: function () { if ("relative" !== this.cssPosition) return { top: 0, left: 0 }; var t = this.currentItem.position(); return { top: t.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(), left: t.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft() } }, _cacheMargins: function () { this.margins = { left: parseInt(this.currentItem.css("marginLeft"), 10) || 0, top: parseInt(this.currentItem.css("marginTop"), 10) || 0 } }, _cacheHelperProportions: function () { this.helperProportions = { width: this.helper.outerWidth(), height: this.helper.outerHeight() } }, _setContainment: function () { var t, e, i = this.options; "parent" === i.containment && (i.containment = this.helper[0].parentNode), "document" !== i.containment && "window" !== i.containment || (this.containment = [0 - this.offset.relative.left - this.offset.parent.left, 0 - this.offset.relative.top - this.offset.parent.top, "document" === i.containment ? this.document.width() : this.window.width() - this.helperProportions.width - this.margins.left, ("document" === i.containment ? this.document.height() || document.body.parentNode.scrollHeight : this.window.height() || this.document[0].body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top]), /^(document|window|parent)$/.test(i.containment) || (t = V(i.containment)[0], e = V(i.containment).offset(), i = "hidden" !== V(t).css("overflow"), this.containment = [e.left + (parseInt(V(t).css("borderLeftWidth"), 10) || 0) + (parseInt(V(t).css("paddingLeft"), 10) || 0) - this.margins.left, e.top + (parseInt(V(t).css("borderTopWidth"), 10) || 0) + (parseInt(V(t).css("paddingTop"), 10) || 0) - this.margins.top, e.left + (i ? Math.max(t.scrollWidth, t.offsetWidth) : t.offsetWidth) - (parseInt(V(t).css("borderLeftWidth"), 10) || 0) - (parseInt(V(t).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, e.top + (i ? Math.max(t.scrollHeight, t.offsetHeight) : t.offsetHeight) - (parseInt(V(t).css("borderTopWidth"), 10) || 0) - (parseInt(V(t).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top]) }, _convertPositionTo: function (t, e) { e = e || this.position; var i = "absolute" === t ? 1 : -1, s = "absolute" !== this.cssPosition || this.scrollParent[0] !== this.document[0] && V.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent, t = /(html|body)/i.test(s[0].tagName); return { top: e.top + this.offset.relative.top * i + this.offset.parent.top * i - ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : t ? 0 : s.scrollTop()) * i, left: e.left + this.offset.relative.left * i + this.offset.parent.left * i - ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : t ? 0 : s.scrollLeft()) * i } }, _generatePosition: function (t) { var e = this.options, i = t.pageX, s = t.pageY, n = "absolute" !== this.cssPosition || this.scrollParent[0] !== this.document[0] && V.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent, o = /(html|body)/i.test(n[0].tagName); return "relative" !== this.cssPosition || this.scrollParent[0] !== this.document[0] && this.scrollParent[0] !== this.offsetParent[0] || (this.offset.relative = this._getRelativeOffset()), this.originalPosition && (this.containment && (t.pageX - this.offset.click.left < this.containment[0] && (i = this.containment[0] + this.offset.click.left), t.pageY - this.offset.click.top < this.containment[1] && (s = this.containment[1] + this.offset.click.top), t.pageX - this.offset.click.left > this.containment[2] && (i = this.containment[2] + this.offset.click.left), t.pageY - this.offset.click.top > this.containment[3] && (s = this.containment[3] + this.offset.click.top)), e.grid && (t = this.originalPageY + Math.round((s - this.originalPageY) / e.grid[1]) * e.grid[1], s = !this.containment || t - this.offset.click.top >= this.containment[1] && t - this.offset.click.top <= this.containment[3] ? t : t - this.offset.click.top >= this.containment[1] ? t - e.grid[1] : t + e.grid[1], t = this.originalPageX + Math.round((i - this.originalPageX) / e.grid[0]) * e.grid[0], i = !this.containment || t - this.offset.click.left >= this.containment[0] && t - this.offset.click.left <= this.containment[2] ? t : t - this.offset.click.left >= this.containment[0] ? t - e.grid[0] : t + e.grid[0])), { top: s - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : o ? 0 : n.scrollTop()), left: i - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : o ? 0 : n.scrollLeft()) } }, _rearrange: function (t, e, i, s) { i ? i[0].appendChild(this.placeholder[0]) : e.item[0].parentNode.insertBefore(this.placeholder[0], "down" === this.direction ? e.item[0] : e.item[0].nextSibling), this.counter = this.counter ? ++this.counter : 1; var n = this.counter; this._delay(function () { n === this.counter && this.refreshPositions(!s) }) }, _clear: function (t, e) { this.reverting = !1; var i, s = []; if (!this._noFinalSort && this.currentItem.parent().length && this.placeholder.before(this.currentItem), this._noFinalSort = null, this.helper[0] === this.currentItem[0]) { for (i in this._storedCSS) "auto" !== this._storedCSS[i] && "static" !== this._storedCSS[i] || (this._storedCSS[i] = ""); this.currentItem.css(this._storedCSS), this._removeClass(this.currentItem, "ui-sortable-helper") } else this.currentItem.show(); function n(e, i, s) { return function (t) { s._trigger(e, t, i._uiHash(i)) } } for (this.fromOutside && !e && s.push(function (t) { this._trigger("receive", t, this._uiHash(this.fromOutside)) }), !this.fromOutside && this.domPosition.prev === this.currentItem.prev().not(".ui-sortable-helper")[0] && this.domPosition.parent === this.currentItem.parent()[0] || e || s.push(function (t) { this._trigger("update", t, this._uiHash()) }), this !== this.currentContainer && (e || (s.push(function (t) { this._trigger("remove", t, this._uiHash()) }), s.push(function (e) { return function (t) { e._trigger("receive", t, this._uiHash(this)) } }.call(this, this.currentContainer)), s.push(function (e) { return function (t) { e._trigger("update", t, this._uiHash(this)) } }.call(this, this.currentContainer)))), i = this.containers.length - 1; 0 <= i; i--)e || s.push(n("deactivate", this, this.containers[i])), this.containers[i].containerCache.over && (s.push(n("out", this, this.containers[i])), this.containers[i].containerCache.over = 0); if (this.storedCursor && (this.document.find("body").css("cursor", this.storedCursor), this.storedStylesheet.remove()), this._storedOpacity && this.helper.css("opacity", this._storedOpacity), this._storedZIndex && this.helper.css("zIndex", "auto" === this._storedZIndex ? "" : this._storedZIndex), this.dragging = !1, e || this._trigger("beforeStop", t, this._uiHash()), this.placeholder[0].parentNode.removeChild(this.placeholder[0]), this.cancelHelperRemoval || (this.helper[0] !== this.currentItem[0] && this.helper.remove(), this.helper = null), !e) { for (i = 0; i < s.length; i++)s[i].call(this, t); this._trigger("stop", t, this._uiHash()) } return this.fromOutside = !1, !this.cancelHelperRemoval }, _trigger: function () { !1 === V.Widget.prototype._trigger.apply(this, arguments) && this.cancel() }, _uiHash: function (t) { var e = t || this; return { helper: e.helper, placeholder: e.placeholder || V([]), position: e.position, originalPosition: e.originalPosition, offset: e.positionAbs, item: e.currentItem, sender: t ? t.element : null } } }); function ht(e) { return function () { var t = this.element.val(); e.apply(this, arguments), this._refresh(), t !== this.element.val() && this._trigger("change") } } V.widget("ui.spinner", { version: "1.13.2", defaultElement: "<input>", widgetEventPrefix: "spin", options: { classes: { "ui-spinner": "ui-corner-all", "ui-spinner-down": "ui-corner-br", "ui-spinner-up": "ui-corner-tr" }, culture: null, icons: { down: "ui-icon-triangle-1-s", up: "ui-icon-triangle-1-n" }, incremental: !0, max: null, min: null, numberFormat: null, page: 10, step: 1, change: null, spin: null, start: null, stop: null }, _create: function () { this._setOption("max", this.options.max), this._setOption("min", this.options.min), this._setOption("step", this.options.step), "" !== this.value() && this._value(this.element.val(), !0), this._draw(), this._on(this._events), this._refresh(), this._on(this.window, { beforeunload: function () { this.element.removeAttr("autocomplete") } }) }, _getCreateOptions: function () { var s = this._super(), n = this.element; return V.each(["min", "max", "step"], function (t, e) { var i = n.attr(e); null != i && i.length && (s[e] = i) }), s }, _events: { keydown: function (t) { this._start(t) && this._keydown(t) && t.preventDefault() }, keyup: "_stop", focus: function () { this.previous = this.element.val() }, blur: function (t) { this.cancelBlur ? delete this.cancelBlur : (this._stop(), this._refresh(), this.previous !== this.element.val() && this._trigger("change", t)) }, mousewheel: function (t, e) { var i = V.ui.safeActiveElement(this.document[0]); if (this.element[0] === i && e) { if (!this.spinning && !this._start(t)) return !1; this._spin((0 < e ? 1 : -1) * this.options.step, t), clearTimeout(this.mousewheelTimer), this.mousewheelTimer = this._delay(function () { this.spinning && this._stop(t) }, 100), t.preventDefault() } }, "mousedown .ui-spinner-button": function (t) { var e; function i() { this.element[0] === V.ui.safeActiveElement(this.document[0]) || (this.element.trigger("focus"), this.previous = e, this._delay(function () { this.previous = e })) } e = this.element[0] === V.ui.safeActiveElement(this.document[0]) ? this.previous : this.element.val(), t.preventDefault(), i.call(this), this.cancelBlur = !0, this._delay(function () { delete this.cancelBlur, i.call(this) }), !1 !== this._start(t) && this._repeat(null, V(t.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, t) }, "mouseup .ui-spinner-button": "_stop", "mouseenter .ui-spinner-button": function (t) { if (V(t.currentTarget).hasClass("ui-state-active")) return !1 !== this._start(t) && void this._repeat(null, V(t.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, t) }, "mouseleave .ui-spinner-button": "_stop" }, _enhance: function () { this.uiSpinner = this.element.attr("autocomplete", "off").wrap("<span>").parent().append("<a></a><a></a>") }, _draw: function () { this._enhance(), this._addClass(this.uiSpinner, "ui-spinner", "ui-widget ui-widget-content"), this._addClass("ui-spinner-input"), this.element.attr("role", "spinbutton"), this.buttons = this.uiSpinner.children("a").attr("tabIndex", -1).attr("aria-hidden", !0).button({ classes: { "ui-button": "" } }), this._removeClass(this.buttons, "ui-corner-all"), this._addClass(this.buttons.first(), "ui-spinner-button ui-spinner-up"), this._addClass(this.buttons.last(), "ui-spinner-button ui-spinner-down"), this.buttons.first().button({ icon: this.options.icons.up, showLabel: !1 }), this.buttons.last().button({ icon: this.options.icons.down, showLabel: !1 }), this.buttons.height() > Math.ceil(.5 * this.uiSpinner.height()) && 0 < this.uiSpinner.height() && this.uiSpinner.height(this.uiSpinner.height()) }, _keydown: function (t) { var e = this.options, i = V.ui.keyCode; switch (t.keyCode) { case i.UP: return this._repeat(null, 1, t), !0; case i.DOWN: return this._repeat(null, -1, t), !0; case i.PAGE_UP: return this._repeat(null, e.page, t), !0; case i.PAGE_DOWN: return this._repeat(null, -e.page, t), !0 }return !1 }, _start: function (t) { return !(!this.spinning && !1 === this._trigger("start", t)) && (this.counter || (this.counter = 1), this.spinning = !0) }, _repeat: function (t, e, i) { t = t || 500, clearTimeout(this.timer), this.timer = this._delay(function () { this._repeat(40, e, i) }, t), this._spin(e * this.options.step, i) }, _spin: function (t, e) { var i = this.value() || 0; this.counter || (this.counter = 1), i = this._adjustValue(i + t * this._increment(this.counter)), this.spinning && !1 === this._trigger("spin", e, { value: i }) || (this._value(i), this.counter++) }, _increment: function (t) { var e = this.options.incremental; return e ? "function" == typeof e ? e(t) : Math.floor(t * t * t / 5e4 - t * t / 500 + 17 * t / 200 + 1) : 1 }, _precision: function () { var t = this._precisionOf(this.options.step); return t = null !== this.options.min ? Math.max(t, this._precisionOf(this.options.min)) : t }, _precisionOf: function (t) { var e = t.toString(), t = e.indexOf("."); return -1 === t ? 0 : e.length - t - 1 }, _adjustValue: function (t) { var e = this.options, i = null !== e.min ? e.min : 0, s = t - i; return t = i + Math.round(s / e.step) * e.step, t = parseFloat(t.toFixed(this._precision())), null !== e.max && t > e.max ? e.max : null !== e.min && t < e.min ? e.min : t }, _stop: function (t) { this.spinning && (clearTimeout(this.timer), clearTimeout(this.mousewheelTimer), this.counter = 0, this.spinning = !1, this._trigger("stop", t)) }, _setOption: function (t, e) { var i; if ("culture" === t || "numberFormat" === t) return i = this._parse(this.element.val()), this.options[t] = e, void this.element.val(this._format(i)); "max" !== t && "min" !== t && "step" !== t || "string" == typeof e && (e = this._parse(e)), "icons" === t && (i = this.buttons.first().find(".ui-icon"), this._removeClass(i, null, this.options.icons.up), this._addClass(i, null, e.up), i = this.buttons.last().find(".ui-icon"), this._removeClass(i, null, this.options.icons.down), this._addClass(i, null, e.down)), this._super(t, e) }, _setOptionDisabled: function (t) { this._super(t), this._toggleClass(this.uiSpinner, null, "ui-state-disabled", !!t), this.element.prop("disabled", !!t), this.buttons.button(t ? "disable" : "enable") }, _setOptions: ht(function (t) { this._super(t) }), _parse: function (t) { return "" === (t = "string" == typeof t && "" !== t ? window.Globalize && this.options.numberFormat ? Globalize.parseFloat(t, 10, this.options.culture) : +t : t) || isNaN(t) ? null : t }, _format: function (t) { return "" === t ? "" : window.Globalize && this.options.numberFormat ? Globalize.format(t, this.options.numberFormat, this.options.culture) : t }, _refresh: function () { this.element.attr({ "aria-valuemin": this.options.min, "aria-valuemax": this.options.max, "aria-valuenow": this._parse(this.element.val()) }) }, isValid: function () { var t = this.value(); return null !== t && t === this._adjustValue(t) }, _value: function (t, e) { var i; "" !== t && null !== (i = this._parse(t)) && (e || (i = this._adjustValue(i)), t = this._format(i)), this.element.val(t), this._refresh() }, _destroy: function () { this.element.prop("disabled", !1).removeAttr("autocomplete role aria-valuemin aria-valuemax aria-valuenow"), this.uiSpinner.replaceWith(this.element) }, stepUp: ht(function (t) { this._stepUp(t) }), _stepUp: function (t) { this._start() && (this._spin((t || 1) * this.options.step), this._stop()) }, stepDown: ht(function (t) { this._stepDown(t) }), _stepDown: function (t) { this._start() && (this._spin((t || 1) * -this.options.step), this._stop()) }, pageUp: ht(function (t) { this._stepUp((t || 1) * this.options.page) }), pageDown: ht(function (t) { this._stepDown((t || 1) * this.options.page) }), value: function (t) { if (!arguments.length) return this._parse(this.element.val()); ht(this._value).call(this, t) }, widget: function () { return this.uiSpinner } }), !1 !== V.uiBackCompat && V.widget("ui.spinner", V.ui.spinner, { _enhance: function () { this.uiSpinner = this.element.attr("autocomplete", "off").wrap(this._uiSpinnerHtml()).parent().append(this._buttonHtml()) }, _uiSpinnerHtml: function () { return "<span>" }, _buttonHtml: function () { return "<a></a><a></a>" } }); var ct; V.ui.spinner; V.widget("ui.tabs", { version: "1.13.2", delay: 300, options: { active: null, classes: { "ui-tabs": "ui-corner-all", "ui-tabs-nav": "ui-corner-all", "ui-tabs-panel": "ui-corner-bottom", "ui-tabs-tab": "ui-corner-top" }, collapsible: !1, event: "click", heightStyle: "content", hide: null, show: null, activate: null, beforeActivate: null, beforeLoad: null, load: null }, _isLocal: (ct = /#.*$/, function (t) { var e = t.href.replace(ct, ""), i = location.href.replace(ct, ""); try { e = decodeURIComponent(e) } catch (t) { } try { i = decodeURIComponent(i) } catch (t) { } return 1 < t.hash.length && e === i }), _create: function () { var e = this, t = this.options; this.running = !1, this._addClass("ui-tabs", "ui-widget ui-widget-content"), this._toggleClass("ui-tabs-collapsible", null, t.collapsible), this._processTabs(), t.active = this._initialActive(), Array.isArray(t.disabled) && (t.disabled = V.uniqueSort(t.disabled.concat(V.map(this.tabs.filter(".ui-state-disabled"), function (t) { return e.tabs.index(t) }))).sort()), !1 !== this.options.active && this.anchors.length ? this.active = this._findActive(t.active) : this.active = V(), this._refresh(), this.active.length && this.load(t.active) }, _initialActive: function () { var i = this.options.active, t = this.options.collapsible, s = location.hash.substring(1); return null === i && (s && this.tabs.each(function (t, e) { if (V(e).attr("aria-controls") === s) return i = t, !1 }), null !== (i = null === i ? this.tabs.index(this.tabs.filter(".ui-tabs-active")) : i) && -1 !== i || (i = !!this.tabs.length && 0)), !1 !== i && -1 === (i = this.tabs.index(this.tabs.eq(i))) && (i = !t && 0), i = !t && !1 === i && this.anchors.length ? 0 : i }, _getCreateEventData: function () { return { tab: this.active, panel: this.active.length ? this._getPanelForTab(this.active) : V() } }, _tabKeydown: function (t) { var e = V(V.ui.safeActiveElement(this.document[0])).closest("li"), i = this.tabs.index(e), s = !0; if (!this._handlePageNav(t)) { switch (t.keyCode) { case V.ui.keyCode.RIGHT: case V.ui.keyCode.DOWN: i++; break; case V.ui.keyCode.UP: case V.ui.keyCode.LEFT: s = !1, i--; break; case V.ui.keyCode.END: i = this.anchors.length - 1; break; case V.ui.keyCode.HOME: i = 0; break; case V.ui.keyCode.SPACE: return t.preventDefault(), clearTimeout(this.activating), void this._activate(i); case V.ui.keyCode.ENTER: return t.preventDefault(), clearTimeout(this.activating), void this._activate(i !== this.options.active && i); default: return }t.preventDefault(), clearTimeout(this.activating), i = this._focusNextTab(i, s), t.ctrlKey || t.metaKey || (e.attr("aria-selected", "false"), this.tabs.eq(i).attr("aria-selected", "true"), this.activating = this._delay(function () { this.option("active", i) }, this.delay)) } }, _panelKeydown: function (t) { this._handlePageNav(t) || t.ctrlKey && t.keyCode === V.ui.keyCode.UP && (t.preventDefault(), this.active.trigger("focus")) }, _handlePageNav: function (t) { return t.altKey && t.keyCode === V.ui.keyCode.PAGE_UP ? (this._activate(this._focusNextTab(this.options.active - 1, !1)), !0) : t.altKey && t.keyCode === V.ui.keyCode.PAGE_DOWN ? (this._activate(this._focusNextTab(this.options.active + 1, !0)), !0) : void 0 }, _findNextTab: function (t, e) { var i = this.tabs.length - 1; for (; -1 !== V.inArray(t = (t = i < t ? 0 : t) < 0 ? i : t, this.options.disabled);)t = e ? t + 1 : t - 1; return t }, _focusNextTab: function (t, e) { return t = this._findNextTab(t, e), this.tabs.eq(t).trigger("focus"), t }, _setOption: function (t, e) { "active" !== t ? (this._super(t, e), "collapsible" === t && (this._toggleClass("ui-tabs-collapsible", null, e), e || !1 !== this.options.active || this._activate(0)), "event" === t && this._setupEvents(e), "heightStyle" === t && this._setupHeightStyle(e)) : this._activate(e) }, _sanitizeSelector: function (t) { return t ? t.replace(/[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&") : "" }, refresh: function () { var t = this.options, e = this.tablist.children(":has(a[href])"); t.disabled = V.map(e.filter(".ui-state-disabled"), function (t) { return e.index(t) }), this._processTabs(), !1 !== t.active && this.anchors.length ? this.active.length && !V.contains(this.tablist[0], this.active[0]) ? this.tabs.length === t.disabled.length ? (t.active = !1, this.active = V()) : this._activate(this._findNextTab(Math.max(0, t.active - 1), !1)) : t.active = this.tabs.index(this.active) : (t.active = !1, this.active = V()), this._refresh() }, _refresh: function () { this._setOptionDisabled(this.options.disabled), this._setupEvents(this.options.event), this._setupHeightStyle(this.options.heightStyle), this.tabs.not(this.active).attr({ "aria-selected": "false", "aria-expanded": "false", tabIndex: -1 }), this.panels.not(this._getPanelForTab(this.active)).hide().attr({ "aria-hidden": "true" }), this.active.length ? (this.active.attr({ "aria-selected": "true", "aria-expanded": "true", tabIndex: 0 }), this._addClass(this.active, "ui-tabs-active", "ui-state-active"), this._getPanelForTab(this.active).show().attr({ "aria-hidden": "false" })) : this.tabs.eq(0).attr("tabIndex", 0) }, _processTabs: function () { var l = this, t = this.tabs, e = this.anchors, i = this.panels; this.tablist = this._getList().attr("role", "tablist"), this._addClass(this.tablist, "ui-tabs-nav", "ui-helper-reset ui-helper-clearfix ui-widget-header"), this.tablist.on("mousedown" + this.eventNamespace, "> li", function (t) { V(this).is(".ui-state-disabled") && t.preventDefault() }).on("focus" + this.eventNamespace, ".ui-tabs-anchor", function () { V(this).closest("li").is(".ui-state-disabled") && this.blur() }), this.tabs = this.tablist.find("> li:has(a[href])").attr({ role: "tab", tabIndex: -1 }), this._addClass(this.tabs, "ui-tabs-tab", "ui-state-default"), this.anchors = this.tabs.map(function () { return V("a", this)[0] }).attr({ tabIndex: -1 }), this._addClass(this.anchors, "ui-tabs-anchor"), this.panels = V(), this.anchors.each(function (t, e) { var i, s, n, o = V(e).uniqueId().attr("id"), a = V(e).closest("li"), r = a.attr("aria-controls"); l._isLocal(e) ? (n = (i = e.hash).substring(1), s = l.element.find(l._sanitizeSelector(i))) : (n = a.attr("aria-controls") || V({}).uniqueId()[0].id, (s = l.element.find(i = "#" + n)).length || (s = l._createPanel(n)).insertAfter(l.panels[t - 1] || l.tablist), s.attr("aria-live", "polite")), s.length && (l.panels = l.panels.add(s)), r && a.data("ui-tabs-aria-controls", r), a.attr({ "aria-controls": n, "aria-labelledby": o }), s.attr("aria-labelledby", o) }), this.panels.attr("role", "tabpanel"), this._addClass(this.panels, "ui-tabs-panel", "ui-widget-content"), t && (this._off(t.not(this.tabs)), this._off(e.not(this.anchors)), this._off(i.not(this.panels))) }, _getList: function () { return this.tablist || this.element.find("ol, ul").eq(0) }, _createPanel: function (t) { return V("<div>").attr("id", t).data("ui-tabs-destroy", !0) }, _setOptionDisabled: function (t) { var e, i; for (Array.isArray(t) && (t.length ? t.length === this.anchors.length && (t = !0) : t = !1), i = 0; e = this.tabs[i]; i++)e = V(e), !0 === t || -1 !== V.inArray(i, t) ? (e.attr("aria-disabled", "true"), this._addClass(e, null, "ui-state-disabled")) : (e.removeAttr("aria-disabled"), this._removeClass(e, null, "ui-state-disabled")); this.options.disabled = t, this._toggleClass(this.widget(), this.widgetFullName + "-disabled", null, !0 === t) }, _setupEvents: function (t) { var i = {}; t && V.each(t.split(" "), function (t, e) { i[e] = "_eventHandler" }), this._off(this.anchors.add(this.tabs).add(this.panels)), this._on(!0, this.anchors, { click: function (t) { t.preventDefault() } }), this._on(this.anchors, i), this._on(this.tabs, { keydown: "_tabKeydown" }), this._on(this.panels, { keydown: "_panelKeydown" }), this._focusable(this.tabs), this._hoverable(this.tabs) }, _setupHeightStyle: function (t) { var i, e = this.element.parent(); "fill" === t ? (i = e.height(), i -= this.element.outerHeight() - this.element.height(), this.element.siblings(":visible").each(function () { var t = V(this), e = t.css("position"); "absolute" !== e && "fixed" !== e && (i -= t.outerHeight(!0)) }), this.element.children().not(this.panels).each(function () { i -= V(this).outerHeight(!0) }), this.panels.each(function () { V(this).height(Math.max(0, i - V(this).innerHeight() + V(this).height())) }).css("overflow", "auto")) : "auto" === t && (i = 0, this.panels.each(function () { i = Math.max(i, V(this).height("").height()) }).height(i)) }, _eventHandler: function (t) { var e = this.options, i = this.active, s = V(t.currentTarget).closest("li"), n = s[0] === i[0], o = n && e.collapsible, a = o ? V() : this._getPanelForTab(s), r = i.length ? this._getPanelForTab(i) : V(), i = { oldTab: i, oldPanel: r, newTab: o ? V() : s, newPanel: a }; t.preventDefault(), s.hasClass("ui-state-disabled") || s.hasClass("ui-tabs-loading") || this.running || n && !e.collapsible || !1 === this._trigger("beforeActivate", t, i) || (e.active = !o && this.tabs.index(s), this.active = n ? V() : s, this.xhr && this.xhr.abort(), r.length || a.length || V.error("jQuery UI Tabs: Mismatching fragment identifier."), a.length && this.load(this.tabs.index(s), t), this._toggle(t, i)) }, _toggle: function (t, e) { var i = this, s = e.newPanel, n = e.oldPanel; function o() { i.running = !1, i._trigger("activate", t, e) } function a() { i._addClass(e.newTab.closest("li"), "ui-tabs-active", "ui-state-active"), s.length && i.options.show ? i._show(s, i.options.show, o) : (s.show(), o()) } this.running = !0, n.length && this.options.hide ? this._hide(n, this.options.hide, function () { i._removeClass(e.oldTab.closest("li"), "ui-tabs-active", "ui-state-active"), a() }) : (this._removeClass(e.oldTab.closest("li"), "ui-tabs-active", "ui-state-active"), n.hide(), a()), n.attr("aria-hidden", "true"), e.oldTab.attr({ "aria-selected": "false", "aria-expanded": "false" }), s.length && n.length ? e.oldTab.attr("tabIndex", -1) : s.length && this.tabs.filter(function () { return 0 === V(this).attr("tabIndex") }).attr("tabIndex", -1), s.attr("aria-hidden", "false"), e.newTab.attr({ "aria-selected": "true", "aria-expanded": "true", tabIndex: 0 }) }, _activate: function (t) { var t = this._findActive(t); t[0] !== this.active[0] && (t = (t = !t.length ? this.active : t).find(".ui-tabs-anchor")[0], this._eventHandler({ target: t, currentTarget: t, preventDefault: V.noop })) }, _findActive: function (t) { return !1 === t ? V() : this.tabs.eq(t) }, _getIndex: function (t) { return t = "string" == typeof t ? this.anchors.index(this.anchors.filter("[href$='" + V.escapeSelector(t) + "']")) : t }, _destroy: function () { this.xhr && this.xhr.abort(), this.tablist.removeAttr("role").off(this.eventNamespace), this.anchors.removeAttr("role tabIndex").removeUniqueId(), this.tabs.add(this.panels).each(function () { V.data(this, "ui-tabs-destroy") ? V(this).remove() : V(this).removeAttr("role tabIndex aria-live aria-busy aria-selected aria-labelledby aria-hidden aria-expanded") }), this.tabs.each(function () { var t = V(this), e = t.data("ui-tabs-aria-controls"); e ? t.attr("aria-controls", e).removeData("ui-tabs-aria-controls") : t.removeAttr("aria-controls") }), this.panels.show(), "content" !== this.options.heightStyle && this.panels.css("height", "") }, enable: function (i) { var t = this.options.disabled; !1 !== t && (t = void 0 !== i && (i = this._getIndex(i), Array.isArray(t) ? V.map(t, function (t) { return t !== i ? t : null }) : V.map(this.tabs, function (t, e) { return e !== i ? e : null })), this._setOptionDisabled(t)) }, disable: function (t) { var e = this.options.disabled; if (!0 !== e) { if (void 0 === t) e = !0; else { if (t = this._getIndex(t), -1 !== V.inArray(t, e)) return; e = Array.isArray(e) ? V.merge([t], e).sort() : [t] } this._setOptionDisabled(e) } }, load: function (t, s) { t = this._getIndex(t); function n(t, e) { "abort" === e && o.panels.stop(!1, !0), o._removeClass(i, "ui-tabs-loading"), a.removeAttr("aria-busy"), t === o.xhr && delete o.xhr } var o = this, i = this.tabs.eq(t), t = i.find(".ui-tabs-anchor"), a = this._getPanelForTab(i), r = { tab: i, panel: a }; this._isLocal(t[0]) || (this.xhr = V.ajax(this._ajaxSettings(t, s, r)), this.xhr && "canceled" !== this.xhr.statusText && (this._addClass(i, "ui-tabs-loading"), a.attr("aria-busy", "true"), this.xhr.done(function (t, e, i) { setTimeout(function () { a.html(t), o._trigger("load", s, r), n(i, e) }, 1) }).fail(function (t, e) { setTimeout(function () { n(t, e) }, 1) }))) }, _ajaxSettings: function (t, i, s) { var n = this; return { url: t.attr("href").replace(/#.*$/, ""), beforeSend: function (t, e) { return n._trigger("beforeLoad", i, V.extend({ jqXHR: t, ajaxSettings: e }, s)) } } }, _getPanelForTab: function (t) { t = V(t).attr("aria-controls"); return this.element.find(this._sanitizeSelector("#" + t)) } }), !1 !== V.uiBackCompat && V.widget("ui.tabs", V.ui.tabs, { _processTabs: function () { this._superApply(arguments), this._addClass(this.tabs, "ui-tab") } }); V.ui.tabs; V.widget("ui.tooltip", { version: "1.13.2", options: { classes: { "ui-tooltip": "ui-corner-all ui-widget-shadow" }, content: function () { var t = V(this).attr("title"); return V("<a>").text(t).html() }, hide: !0, items: "[title]:not([disabled])", position: { my: "left top+15", at: "left bottom", collision: "flipfit flip" }, show: !0, track: !1, close: null, open: null }, _addDescribedBy: function (t, e) { var i = (t.attr("aria-describedby") || "").split(/\s+/); i.push(e), t.data("ui-tooltip-id", e).attr("aria-describedby", String.prototype.trim.call(i.join(" "))) }, _removeDescribedBy: function (t) { var e = t.data("ui-tooltip-id"), i = (t.attr("aria-describedby") || "").split(/\s+/), e = V.inArray(e, i); -1 !== e && i.splice(e, 1), t.removeData("ui-tooltip-id"), (i = String.prototype.trim.call(i.join(" "))) ? t.attr("aria-describedby", i) : t.removeAttr("aria-describedby") }, _create: function () { this._on({ mouseover: "open", focusin: "open" }), this.tooltips = {}, this.parents = {}, this.liveRegion = V("<div>").attr({ role: "log", "aria-live": "assertive", "aria-relevant": "additions" }).appendTo(this.document[0].body), this._addClass(this.liveRegion, null, "ui-helper-hidden-accessible"), this.disabledTitles = V([]) }, _setOption: function (t, e) { var i = this; this._super(t, e), "content" === t && V.each(this.tooltips, function (t, e) { i._updateContent(e.element) }) }, _setOptionDisabled: function (t) { this[t ? "_disable" : "_enable"]() }, _disable: function () { var s = this; V.each(this.tooltips, function (t, e) { var i = V.Event("blur"); i.target = i.currentTarget = e.element[0], s.close(i, !0) }), this.disabledTitles = this.disabledTitles.add(this.element.find(this.options.items).addBack().filter(function () { var t = V(this); if (t.is("[title]")) return t.data("ui-tooltip-title", t.attr("title")).removeAttr("title") })) }, _enable: function () { this.disabledTitles.each(function () { var t = V(this); t.data("ui-tooltip-title") && t.attr("title", t.data("ui-tooltip-title")) }), this.disabledTitles = V([]) }, open: function (t) { var i = this, e = V(t ? t.target : this.element).closest(this.options.items); e.length && !e.data("ui-tooltip-id") && (e.attr("title") && e.data("ui-tooltip-title", e.attr("title")), e.data("ui-tooltip-open", !0), t && "mouseover" === t.type && e.parents().each(function () { var t, e = V(this); e.data("ui-tooltip-open") && ((t = V.Event("blur")).target = t.currentTarget = this, i.close(t, !0)), e.attr("title") && (e.uniqueId(), i.parents[this.id] = { element: this, title: e.attr("title") }, e.attr("title", "")) }), this._registerCloseHandlers(t, e), this._updateContent(e, t)) }, _updateContent: function (e, i) { var t = this.options.content, s = this, n = i ? i.type : null; if ("string" == typeof t || t.nodeType || t.jquery) return this._open(i, e, t); (t = t.call(e[0], function (t) { s._delay(function () { e.data("ui-tooltip-open") && (i && (i.type = n), this._open(i, e, t)) }) })) && this._open(i, e, t) }, _open: function (t, e, i) { var s, n, o, a = V.extend({}, this.options.position); function r(t) { a.of = t, n.is(":hidden") || n.position(a) } i && ((s = this._find(e)) ? s.tooltip.find(".ui-tooltip-content").html(i) : (e.is("[title]") && (t && "mouseover" === t.type ? e.attr("title", "") : e.removeAttr("title")), s = this._tooltip(e), n = s.tooltip, this._addDescribedBy(e, n.attr("id")), n.find(".ui-tooltip-content").html(i), this.liveRegion.children().hide(), (i = V("<div>").html(n.find(".ui-tooltip-content").html())).removeAttr("name").find("[name]").removeAttr("name"), i.removeAttr("id").find("[id]").removeAttr("id"), i.appendTo(this.liveRegion), this.options.track && t && /^mouse/.test(t.type) ? (this._on(this.document, { mousemove: r }), r(t)) : n.position(V.extend({ of: e }, this.options.position)), n.hide(), this._show(n, this.options.show), this.options.track && this.options.show && this.options.show.delay && (o = this.delayedShow = setInterval(function () { n.is(":visible") && (r(a.of), clearInterval(o)) }, 13)), this._trigger("open", t, { tooltip: n }))) }, _registerCloseHandlers: function (t, e) { var i = { keyup: function (t) { t.keyCode === V.ui.keyCode.ESCAPE && ((t = V.Event(t)).currentTarget = e[0], this.close(t, !0)) } }; e[0] !== this.element[0] && (i.remove = function () { var t = this._find(e); t && this._removeTooltip(t.tooltip) }), t && "mouseover" !== t.type || (i.mouseleave = "close"), t && "focusin" !== t.type || (i.focusout = "close"), this._on(!0, e, i) }, close: function (t) { var e, i = this, s = V(t ? t.currentTarget : this.element), n = this._find(s); n ? (e = n.tooltip, n.closing || (clearInterval(this.delayedShow), s.data("ui-tooltip-title") && !s.attr("title") && s.attr("title", s.data("ui-tooltip-title")), this._removeDescribedBy(s), n.hiding = !0, e.stop(!0), this._hide(e, this.options.hide, function () { i._removeTooltip(V(this)) }), s.removeData("ui-tooltip-open"), this._off(s, "mouseleave focusout keyup"), s[0] !== this.element[0] && this._off(s, "remove"), this._off(this.document, "mousemove"), t && "mouseleave" === t.type && V.each(this.parents, function (t, e) { V(e.element).attr("title", e.title), delete i.parents[t] }), n.closing = !0, this._trigger("close", t, { tooltip: e }), n.hiding || (n.closing = !1))) : s.removeData("ui-tooltip-open") }, _tooltip: function (t) { var e = V("<div>").attr("role", "tooltip"), i = V("<div>").appendTo(e), s = e.uniqueId().attr("id"); return this._addClass(i, "ui-tooltip-content"), this._addClass(e, "ui-tooltip", "ui-widget ui-widget-content"), e.appendTo(this._appendTo(t)), this.tooltips[s] = { element: t, tooltip: e } }, _find: function (t) { t = t.data("ui-tooltip-id"); return t ? this.tooltips[t] : null }, _removeTooltip: function (t) { clearInterval(this.delayedShow), t.remove(), delete this.tooltips[t.attr("id")] }, _appendTo: function (t) { t = t.closest(".ui-front, dialog"); return t = !t.length ? this.document[0].body : t }, _destroy: function () { var s = this; V.each(this.tooltips, function (t, e) { var i = V.Event("blur"), e = e.element; i.target = i.currentTarget = e[0], s.close(i, !0), V("#" + t).remove(), e.data("ui-tooltip-title") && (e.attr("title") || e.attr("title", e.data("ui-tooltip-title")), e.removeData("ui-tooltip-title")) }), this.liveRegion.remove() } }), !1 !== V.uiBackCompat && V.widget("ui.tooltip", V.ui.tooltip, { options: { tooltipClass: null }, _tooltip: function () { var t = this._superApply(arguments); return this.options.tooltipClass && t.tooltip.addClass(this.options.tooltipClass), t } }); V.ui.tooltip });;
