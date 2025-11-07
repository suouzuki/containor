/**
 * Utility functions for type checking.
 */
const is = {
    /**
     * Checks if a value is a string.
     * @param {*} v - The value to check.
     * @returns {boolean} True if the value is a string, false otherwise.
     * @example
     * is.string('hello'); // true
     * is.string(123);     // false
     */
  string: (v: unknown): v is string => typeof v === 'string' || v instanceof String,
   /**
     * Checks if a value is a finite number.
     * @param {*} v - The value to check.
     * @returns {boolean} True if the value is a finite number, false otherwise.
     * @example
     * is.number(123);       // true
     * is.number(Infinity);  // false
     */
  number: (v: unknown): v is number => typeof v === 'number' && isFinite(v as number),
   /**
     * Checks if a value is a function.
     * @param {*} v - The value to check.
     * @returns {boolean} True if the value is a function, false otherwise.
     * @example
     * is.function(() => {}); // true
     * is.function(123);     // false
     */
  function: (v: unknown): v is Function => typeof v === 'function' || v instanceof Function,
  /**
     * Checks if a value is undefined.
     * @param {*} v - The value to check.
     * @returns {boolean} True if the value is undefined, false otherwise.
     * @example
     * is.undefined(undefined); // true
     * is.undefined(null);      // false
     */
  undefined: (v: unknown): v is undefined => typeof v === 'undefined',
  /**
     * Checks if a value is null.
     * @param {*} v - The value to check.
     * @returns {boolean} True if the value is null, false otherwise.
     * @example
     * is.null(null);  // true
     * is.null(0);     // false
     */
  null: (v: unknown): v is null => v === null,
  /**
     * Checks if a value is an array.
     * @param {*} v - The value to check.
     * @returns {boolean} True if the value is an array, false otherwise.
     * @example
     * is.array([1,2,3]); // true
     * is.array('abc');   // false
     */
  array: (v: unknown): v is Array<unknown> => Array.isArray(v),
   /**
     * Checks if a value is a plain object (i.e., created by {} or new Object()).
     * @param {*} v - The value to check.
     * @returns {boolean} True if the value is a plain object, false otherwise.
     * @example
     * is.plainObject({});        // true
     * is.plainObject(new Date()); // false
     */
  plainObject: (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object' && (v as any).constructor === Object,
  /**
     * Checks if a value is a Map.
     * @param {*} v - The value to check.
     * @returns {boolean} True if the value is a Map, false otherwise.
     * @example
     * is.map(new Map());  // true
     * is.map({});         // false
     */
  map: (v: unknown): v is Map<unknown, unknown> => v instanceof Map,
}

export default is;
