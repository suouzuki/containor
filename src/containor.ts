import ContainorArray from './containorArray.js'
import is from './is.js'
import util from "util";

type Entry<K, V> = [K, V]

/**
 * A Containor is an enhanced data structure based on Map, designed to actively manage and organize stored elements.
 * It not only holds values but also provides smarter control and manipulation capabilities.
 * @example
 * const myContainor = new Containor();
 * myContainor.set('key1', 'value1');
 * myContainor.set('key2', 'value2');
 * console.log(myContainor.get('key1')); // 'value1'
 * console.log(myContainor.has('key2')); // true
 */
export default class Containor<K = any, V = any> extends Map<K, V> {
    static ContainorArray: any;
    /**
     * Creates a new containor.
     * @param {Object} value - The initial containor data.
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2' });
     */
    constructor(value?: Record<string, V> | Map<K, V> | [K, V][]) {
        super()
        if (!value) return this
        this.addMap(('containor' in (value as any)) ? (value as any).containor : value)
        return this
    }

    /**
    * Gets the length of the containor (number of key-value pairs).
    * @returns {number}
    * @example
    * const myContainor = new containor({ key1: 'value1', key2: 'value2' });
    * console.log(myContainor.length); // 2
    */
    get length(): number {
        return super.size
    }

    /**
     * Ensures that a key exists in the containor, setting its value using a generator function.
     * @param {string} key - The key to ensure.
     * @param {Function} valueGenerator - The generator function for the value.
     * @param {boolean} [setDefault=false] - If `true`, sets the value using the set(Map.prototype.set) default.
     * @returns {Object|null} The updated containor.
     * @example
     * const myContainor = new containor();
     * myContainor.ensure('newKey', () => 'defaultValue');
     */
    ensure(
        key: K,
        valueGenerator: (key: K, containor: this) => V,
        setDefault = false
    ): V | null {
        if (this.has(key)) return this.get(key)!
        if (!is.function(valueGenerator)) throw new Error('Value generator must be a function.')
        const generator = valueGenerator(key, this)
        if (setDefault) return this._set(key, generator).get(key)!
        return this.set(key, generator).get(key)!
    }

    /**
     * Returns the first key-value pair(s) from the containor.
     * @param {number} [amount] - The number of key-value pairs to return. If omitted or 0, returns the first pair.
     * @returns {Containor|{ key: any, value: any }|undefined} A new Containor instance containing the first key-value pair(s), or a single pair object.
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2' });
     * const first = myContainor.first(); // { key: "key1", value: "value1" }
     * const firstTwo = myContainor.first(2); // Containor { key1: "value1", key2: "value2" }
     */
    first(amount?: number): Containor<K, V> | { key: K; value: V } | undefined {
        const entries = [...super.entries()]
        if (!is.number(amount) || amount <= 0) amount = 1
        amount = Math.min(this.size, amount)
        const selected = entries.slice(0, amount)
        if (amount <= 1)
            return amount === 1 ? { key: selected[0][0], value: selected[0][1] } : undefined
        return Containor.from(selected)
    }

    /**
     * Returns the first key(s) from the containor.
     * @param {number} [amount] - The number of keys to return. If omitted or 0, returns the first key.
     * @returns {ContainorArray} A new ContainorArray containing the first key(s).
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2', key3: 'value3' });
     * const firstKey = myContainor.firstKeys(); // ContainorArray ["key1"]
     * const firstTwoKeys = myContainor.firstKeys(2); // ContainorArray ["key1", "key2"]
     */
    firstKeys(amount?: number): ContainorArray<K> {
        const keys = [...super.keys()]
        if (!is.number(amount) || amount <= 0) amount = 1
        amount = Math.min(this.size, amount)
        return ContainorArray.from(keys.slice(0, amount))
    }

    /**
     * Returns the first value(s) from the containor.
     * @param {number} [amount] - The number of values to return. If omitted or 0, returns the first value.
     * @returns {ContainorArray} A new ContainorArray containing the first value(s).
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2', key3: 'value3' });
     * const firstValue = myContainor.firstValues(); // ContainorArray ["value1"]
     * const firstTwoValues = myContainor.firstValues(2); // ContainorArray ["value1", "value2"]
     */
    firstValues(amount?: number): ContainorArray<V> {
        const values = [...super.values()]
        if (!is.number(amount) || amount <= 0) amount = 1
        amount = Math.min(this.size, amount)
        return ContainorArray.from(values.slice(0, amount))
    }

    /**
     * Returns the last key-value pair(s) from the containor.
     * @param {number} [amount] - The number of key-value pairs to return. If omitted or 0, returns the last pair.
     * @returns {Containor|{ key: any, value: any }|undefined} A new Containor instance containing the last key-value pair(s), or a single pair object.
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2' });
     * const last = myContainor.last(); // { key: "key2", value: "value2" }
     * const lastTwo = myContainor.last(2); // Containor { key1: "value1", key2: "value2" }
     */
    last(amount?: number): Containor<K, V> | { key: K; value: V } | undefined {
        const entries = [...super.entries()]
        if (!is.number(amount) || amount <= 0) amount = 1
        amount = Math.min(this.size, amount)
        const selected = entries.slice(-amount)
        if (amount <= 1)
            return amount === 1 ? { key: selected[0][0], value: selected[0][1] } : undefined
        return Containor.from(selected)
    }

    /**
     * Returns the last key(s) from the containor.
     * @param {number} [amount] - The number of keys to return. If omitted or 0, returns the last key.
     * @returns {ContainorArray} A new ContainorArray containing the last key(s).
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2', key3: 'value3' });
     * const lastKey = myContainor.lastKeys(); // ContainorArray ["key3"]
     * const lastTwoKeys = myContainor.lastKeys(2); // ContainorArray ["key2", "key3"]
     */
    lastKeys(amount?: number): ContainorArray<K> {
        const keys = [...super.keys()]
        if (!is.number(amount) || amount <= 0) amount = 1
        amount = Math.min(this.size, amount)
        return ContainorArray.from(keys.slice(-amount))
    }

    /**
     * Returns the last key(s) from the containor.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice|Array.prototype.slice}
     * @param {number} [amount] - The number of keys to return. If omitted or 0, returns the last key.
     * @returns {ContainorArray} A new ContainorArray containing the last key(s).
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2', key3: 'value3' });
     * const lastKey = myContainor.lastKeys(); // ContainorArray ["key3"]
     * const lastTwoKeys = myContainor.lastKeys(2); // ContainorArray ["key2", "key3"]
     */
    lastValues(amount?: number): ContainorArray<V> {
        const values = [...super.values()]
        if (!is.number(amount) || amount <= 0) amount = 1
        amount = Math.min(this.size, amount)
        return ContainorArray.from(values.slice(-amount))
    }

    /**
     * Returns the key-value pair at a specified index.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at|Array.prototype.at}
     * @param {number} index - The index of the pair to retrieve.
     * @returns {{ key: any, value: any }|undefined} An object containing the key-value pair at the specified index.
     * @example
     * const myContainor = new containor({ hello: 'hi', world: 'love', suouzuki: 'rich' });
     * const pairAtIndex = myContainor.at(2); // { key: "world", value: "love" }
     * const lastPair = myContainor.at(-1);   // { key: "suouzuki", value: "rich" }
     */
    at(index: number): { key: K; value: V } | undefined {
        if (!is.number(index)) throw new Error('Index must be a number.')
        index = Math.min(this.size - 1, Math.floor(index))
        index = Math.max(-this.size, index)
        const entries = [...super.entries()]
        const at = entries.at(index)
        if (!at) return undefined
        return { key: at[0], value: at[1] }
    }

    /**
     * Returns a random key-value pair(s) from the containor.
     * @param {number} [amount] - The number of key-value pairs to return. If omitted, returns a random pair.
     * @returns {{ key: any, value: any }|Containor} A single random key-value pair or a Containor with multiple random pairs.
     * @example
     * const myContainor = new containor({ hello: 'hi', world: 'love', suouzuki: 'rich' });
     * 
     * // Returns one random key-value pair
     * const randomPair = myContainor.random();
     * // Example output: { key: "world", value: "love" }
     * 
     * // Returns multiple random key-value pairs (up to the given amount)
     * const randomPairs = myContainor.random(2);
     * // Example output:  Containor (2) {
     * //   hello: "hi",
     * //   suouzuki: "rich" 
     * // }
     */
    random(amount?: number): Containor<K, V> | { key: K; value: V } {
        const entries = [...super.entries()]
        if (!is.number(amount)) {
            const random = entries[Math.floor(Math.random() * entries.length)]
            return { key: random[0], value: random[1] }
        }
        return Containor.from({ length: Math.min(amount, entries.length) }, () => {
            const randomNumber = Math.floor(Math.random() * entries.length)
            const random = entries[randomNumber]
            const rt = { key: random[0], value: random[1] }
            entries.splice(randomNumber, 1)
            return rt
        })
    }

    /**
     * Finds and returns the first key-value pair in the containor that satisfies the provided condition.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find|Array.prototype.find}
     * @param {Function} func - A function executed for each element, receiving `(value, key, containor)` as arguments.
     * @param {*} [arg] - Optional value to bind as `this` inside the provided function.
     * @returns {{ key: any, value: any }|undefined} The first matching key-value pair, or `undefined` if no match is found.
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2', key3: 'value3' });
     * const pair = myContainor.find((value, key) => value === 'value2'); // { key: "key2", value: "value2" }
     */
    find(
        func: (value: V, key: K, containor: this) => boolean,
        arg?: any
    ): { key: K; value: V } | undefined {
        if (!is.function(func)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(arg)) func = func.bind(arg)
        for (const [key, value] of super.entries())
            if (func(value, key, this)) return { key, value }
        return undefined
    }

    /**
     * Filters and returns a new containor with key-value pairs that satisfy the provided condition.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter|Array.prototype.filter}
     * @param {Function} func - A function executed for each pair, receiving `(value, key, containor)` as arguments.
     * @param {*} [arg] - Optional value to bind as `this` inside the provided function.
     * @returns {Containor} A new containor instance containing only the filtered key-value pairs.
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2', key3: 'value3', suouzuki: 'rich' });
     * const filteredContainor = myContainor.filter((value, key) => value.startsWith('value'));
     */
    filter(func: (value: V, key: K, containor: this) => boolean, arg?: any): Containor<K, V> {
        if (!is.function(func)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(arg)) func = func.bind(arg)
        const results = new Containor<K, V>()
        for (const [key, value] of super.entries())
            if (func(value, key, this)) results.set(key, value)
        return results
    }

    /**
     * Splits the containor into two new containors based on a provided condition.
     * @param {Function} func - A function executed for each pair, receiving `(value, key, containor)` as arguments. If it returns `true`, the pair goes to the first containor; otherwise, to the second.
     * @param {*} [arg] - Optional value to bind as `this` inside the provided function.
     * @returns {[Containor, Containor]} An array containing two Containor instances: the first with elements that passed the condition, and the second with those that did not.
     * @example
     * const myContainor = new containor({ key1: 'value1', key2: 'value2', key3: 'value3', suouzuki: 'rich' });
     * const [matching, nonMatching] = myContainor.partition((value, key) => value.startsWith('value'));
     */
    partition(
        func: (value: V, key: K, containor: this) => boolean,
        arg?: any
    ): ContainorArray<Containor<K, V>> {
        if (!is.function(func)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(arg)) func = func.bind(arg)
        const results = new ContainorArray(new Containor<K, V>(), new Containor<K, V>())
        for (const [key, value] of super.entries())
            if (func(value, key, this)) results[0].set(key, value)
            else results[1].set(key, value)
        return results
    }

    /**
     * Maps each key-value pair in the containor using a provided mapping function and returns a new ContainorArray.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map|Array.prototype.map}
     * @param {Function} func - The mapping function applied to each pair. Receives `(value, key, containor)` as parameters and returns the new value.
     * @param {*} [arg] - Optional value to bind as `this` inside the mapping function.
     * @returns {ContainorArray} A new ContainorArray containing the transformed values.
     * @throws {Error} If the provided argument is not a function.
     * @example
     * const myContainor = new containor({ a: 1, b: 2, c: 3 });
     * const doubled = myContainor.map((value, key) => value * 2);
     * // Result: ContainorArray [2, 4, 6]
     *
     * const upper = myContainor.map((value, key) => `${key}:${value}`.toUpperCase());
     * // Result: ContainorArray ['A:1', 'B:2', 'C:3']
     */
    map<R>(func: (value: V, key: K, containor: this) => R, arg?: any): ContainorArray<R> {
        if (!is.function(func)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(arg)) func = func.bind(arg)
        const entries = super.entries()
        return ContainorArray.from({ length: this.length }, () => {
            const [key, value] = entries.next().value as [K, V]
            return func(value, key, this)
        })
    }

    /**
     * Tests whether at least one key-value pair in the containor satisfies the provided condition.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some|Array.prototype.some}
     * @param {Function} func - A function executed for each pair, receiving `(value, key, containor)` as arguments.
     * @param {*} [arg] - Optional value to bind as `this` inside the provided function.
     * @returns {boolean} `true` if at least one pair satisfies the condition, otherwise `false`.
     * @example
     * const myContainor = new containor({ key1: 1, key2: 2, key3: 3, suouzuki: 22 });
     * const hasEvenNumber = myContainor.some((value, key) => value > 20); // true
     */
    some(func: (value: V, key: K, containor: this) => boolean, arg?: any): boolean {
        if (!is.function(func)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(arg)) func = func.bind(arg)
        for (const [key, value] of super.entries()) if (func(value, key, this)) return true
        return false
    }

    /**
     * Tests whether all key-value pairs in the containor satisfy the provided condition.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every|Array.prototype.every}
     * @param {Function} func - A function executed for each pair, receiving `(value, key, containor)` as arguments.
     * @param {*} [arg] - Optional value to bind as `this` inside the provided function.
     * @returns {boolean} - `true` if all pairs satisfy the condition, otherwise `false`.
     * @example
     * const myContainor = new containor({ key1: 1, key2: 2, key3: 3, suouzuki: 22 });
     * const allPositive = myContainor.every((value, key) => value > 20); // false
     */
    every(func: (value: V, key: K, containor: this) => boolean, arg?: any): boolean {
        if (!is.function(func)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(arg)) func = func.bind(arg)
        for (const [key, value] of super.entries()) if (!func(value, key, this)) return false
        return true
    }

    /**
     * Sorts the containor based on a provided comparison function applied to its values.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort|Array.prototype.sort}
     * @param {Function} func - The comparison function that defines the sort order.
     * Receives two values `(a, b)` and should return a number:
     * - Negative if `a` should come before `b`
     * - Positive if `a` should come after `b`
     * - Zero if they are considered equal
     * @param {*} [arg] - Optional value to bind as `this` inside the comparison function.
     * @returns {Containor} - The same containor instance, sorted in place.
     * @example
     * const myContainor = new containor({ a: 'banana', b: 'apple', c: 'cherry' });
     * const sortedContainor = myContainor.sort((a, b) => a.localeCompare(b));
     * // Result: Containor { b: 'apple', a: 'banana', c: 'cherry' }
     */
    sort(
        func: (a: V, b: V, keyA: K, keyB: K) => number,
        arg?: any
    ): Containor<K, V> {
        if (!is.function(func)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(arg)) func = func.bind(arg)
        const entries = [...super.entries()]
        entries.sort((a, b) => func(a[1], b[1], a[0], b[0]))
        super.clear()
        for (const [k, v] of entries) super.set(k, v)
        return this
    }

    /**
     * Returns a shallow copy of a portion of the containor’s entries, as a new Containor.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice|Array.prototype.slice}
     * @param {number} start - The zero-based index at which to start extraction.
     * @param {number} [end] - The index before which to end extraction (exclusive). If omitted, extracts through the end of the containor.
     * @returns {Containor} - A new Containor containing the extracted key-value pairs.
     * @example
     * const myContainor = new containor({ a: 1, b: 2, c: 3, d: 4 });
     * const sliced = myContainor.slice(1, 3);
     * // Result: Containor { b: 2, c: 3 }
     */
    slice(start: number, end?: number): Containor<K, V> {
        const entries = [...super.entries()]
        return Containor.from(entries.slice(start, end))
    }

    /**
     * Removes or replaces existing key-value pairs in the containor and/or adds new pairs.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice|Array.prototype.splice}
     * @param {number} start - The index at which to start changing the containor.
     * @param {number} [deleteCount=this.size - start] - The number of elements to remove.
     * @param {...[any, any]} [items] - Optional new key-value pairs to insert, each as a `[key, value]` array.
     * @returns {Containor} A new Containor containing the removed pairs.
     * @example
     * const myContainor = new containor({ a: 1, b: 2, c: 3, d: 4 });
     * const removed = myContainor.splice(1, 2, ['x', 10], ['y', 20]);
     * // removed -> Containor { b: 2, c: 3 }
     * // myContainor -> Containor { a: 1, x: 10, y: 20, d: 4 }
     */
    splice(start: number, deleteCount?: number, ...items: Entry<K, V>[]): Containor<K, V> {
        const entries = [...super.entries()]
        if (!is.number(start)) start = 0
        if (start < 0) start = this.size + start
        if (start < 0) start = 0
        if (start > this.size) start = this.size
        if (is.undefined(deleteCount) || deleteCount > this.size - start)
            deleteCount = this.size - start

        const removedEntries = entries.splice(start, deleteCount, ...items)
        super.clear()
        for (const [key, value] of entries) super.set(key, value)
        return Containor.from(removedEntries)
    }

    /**
     * Executes a provided function once for each key-value pair in the containor.
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach|Array.prototype.forEach}
     * @param {Function} func - Function to execute for each pair, receiving `(value, key, containor, index)` as arguments.
     * @param {*} [arg] - Optional value to bind as `this` inside the provided function.
     * @returns {void}
     * @example
     * const myContainor = new containor({ a: 1, b: 2, c: 3 });
     * myContainor.forEach((value, key) => console.log(key, value));
     * // Output:
     * // a 1
     * // b 2
     * // c 3
     */
    forEach(func: (value: V, key: K, containor: this, index: number) => void, arg?: any): void;
    override forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    override forEach(func: any, arg?: any): void {
        if (!is.function(func)) throw new Error('Provided argument is not a function.');
        if (!is.undefined(arg)) func = func.bind(arg);
        let index = 0;
        for (const [key, value] of super.entries()) func(value, key, this, index++);
    }

    /**
     * Adds or merges key-value pairs from another collection into the containor.
     * Supports Map, Object, Array of entries, or another Containor.
     * @param {Map|Object|Array|Containor} mapCombine - The source of key-value pairs to add or merge.
     * @param {Function} [func] - Optional transform function called for each value before adding.  
     * Receives parameters `(incomingValue, existingValue, key, thisContainor)`.
     * @returns {Containor} The updated containor instance.
     * @example
     * const myContainor = new containor({ a: 1, b: 2 });
     * myContainor.addMap({ c: 3, d: 4 });
     * // Result: Containor { a: 1, b: 2, c: 3, d: 4 }
     * @example
     * myContainor.addMap(new Map([['b', 10], ['e', 5]]), (v, old) => (old ?? 0) + v);
     * // Result: Containor { a: 1, b: 12, c: 3, d: 4, e: 5 }
     */
    addMap(
        mapCombine: Map<K, V> | Record<string, V> | [K, V][] | Containor<K, V>,
        func?: (incomingValue: V, existingValue: V | null | undefined, key: K, c: this) => V
    ): this {
        const transform = is.function(func)
            ? func
            : (v: V) => v

        if (is.map(mapCombine) || is.array(mapCombine) || is.plainObject(mapCombine)) {
            if (is.map(mapCombine) || mapCombine instanceof Containor) {
                for (const [key, value] of (mapCombine as Map<K, V>).entries())
                    this.set(key, transform(value, this.get(key), key, this))
            } else if (is.array(mapCombine)) {
                for (const entry of mapCombine as [K, V][]) {
                    if (!is.array(entry) || entry.length < 2) continue
                    const [key, value] = entry
                    this.set(key, transform(value, this.get(key), key, this))
                }
            } else if (is.plainObject(mapCombine)) {
                for (const [key, value] of Object.entries(mapCombine))
                    this.set(key as any, transform(value as V, this.get(key as any), key as any, this))
            }
        }
        return this
    }

    /**
     * Internally sets a key-value pair in the containor using `Map.prototype.set`.
     * Primarily used for internal operations that modify the containor.
     * @param {*} key - The key to associate the value with.
     * @param {*} value - The value to store.
     * @returns {Containor} The updated containor instance.
     * @example
     * this._set('name', 'Suouzuki'); // Internally sets the key-value pair
     */
    _set(key: K, value: V): this {
        super.set(key, value)
        return this
    }

    /**
     * Sets a key-value pair in the containor.
     * If the provided key is an object, array, or map, its entries are added instead.
     * @param {*} key - The key to associate the value with, or a map-like object to merge.
     * @param {*} [value] - The value to store (ignored if `key` is a map-like object).
     * @returns {Containor|*} The updated containor instance, or the inserted value.
     * @example
     * myContainor.set('key4', 'value4'); // Adds a new key-value pair
     * myContainor.set({ a: 1, b: 2 });   // Merges multiple entries
     */
    set(key: any, value?: any): this {
        if (is.undefined(key)) throw new Error('Key cannot be undefined.')
        if (!is.string(key) && !is.number(key) && is.undefined(value)) {
            this.addMap(key)
        } else {
            super.set(key, value)
        }
        return this
    }

    _delete(key: K): boolean {
        return super.delete(key)
    }

    /**
     * Deletes one or more key-value pairs from the containor.
     * You can provide specific keys or a filtering function to determine which pairs to remove.
     * @param {...*|Function} keys - The keys to delete, or a function used to filter which pairs should be deleted.
     * @returns {number} The number of deleted pairs.
     * @example
     * myContainor.delete('key2', 'key3'); // Deletes the given keys → returns 2
     * myContainor.delete((value, key) => value === 'value1'); // Deletes matching entries dynamically
     */
    override delete(key: K): boolean;
    delete(
        ...keys: (K | ((value: V, key: K, containor: this, deletedCount: number) => boolean))[]
    ): number;
    override delete(...args: any[]): any {
        let deleted = 0;


        if (args.length === 1 && !is.function(args[0])) {
            const key = args[0] as K;
            const result = super.delete(key);
            return result;
        }

        if (is.function(args[0])) {
            const func = args[0];
            const arg = args[1];
            if (!is.undefined(arg)) func.bind(arg);

            for (const [key, value] of super.entries()) {
                if (func(value, key, this, deleted)) {
                    deleted++;
                    super.delete(key);
                }
            }
        } else {
            for (const key of args as K[]) {
                if (this.has(key)) {
                    deleted++;
                    super.delete(key);
                }
            }
        }

        return deleted;
    }

    /**
     * Internal method for retrieving a value by key from the containor. (using Map.prototype.get)
     * @param {*} key - The key of the pair to retrieve.
     * @returns {*} The value associated with the specified key, or `undefined` if not found.
     */
    _get(key: K): V | undefined {
        return super.get(key)
    }

    /**
     * Retrieves the value associated with the specified key from the containor.
     * @param {*} search - The key whose value should be retrieved.
     * @returns {*} The value associated with the key, or `null` if the key does not exist.
     * @example
     * const value = myContainor.get('key1'); // Returns 'value1' or null if not found
     */
    override get(key: K): V | undefined;
    get(search: K): V | null;
    override get(search: any): any {
        const result = super.get(search);
        return result ?? null;
    }

    /**
     * Checks whether the containor contains one or more specified keys.
     * @param {...*} keys - The keys to check for.
     * @returns {boolean|ContainorArray<boolean>}  
     * - If a single key is provided, returns `true` or `false`.  
     * - If multiple keys are provided, returns a ContainorArray of booleans with two additional non-enumerable properties: 
     *   - `hasAll` → `true` if all keys exist  
     *   - `hasAny` → `true` if at least one key exists
     * @example
     * const hasValue = myContainor.has('key1'); 
     * // true
     * @example
     * const results = myContainor.has('key1', 'missingKey');
     * // results: ContainorArray [true, false]
     * // results.hasAll === false
     * // results.hasAny === true
     */
    override has(key: K): boolean;
    has(...keys: K[]): ContainorArray<boolean> & { hasAll: boolean; hasAny: boolean; };
    override has(...keys: K[]): boolean | (ContainorArray<boolean> & { hasAll: boolean; hasAny: boolean }) {
        if (keys.length === 0) return false
        if (keys.length === 1) return super.has(keys[0])
        const results = ContainorArray.from(keys.map(key => super.has(key)))
        Object.defineProperties(results, {
            hasAll: { value: results.every(Boolean), enumerable: false },
            hasAny: { value: results.some(Boolean), enumerable: false }
        })
        return results as typeof results & { hasAll: boolean; hasAny: boolean }
    }

    /**
     * Converts the containor into a plain JSON-compatible object.
     * @returns {Object} An object representation of the containor’s key-value pairs.
     * @example
     * const myContainor = new Containor({ key1: 'value1', key2: 42 });
     * const json = myContainor.toJSON();
     * // { key1: 'value1', key2: 42 }
     */
    toJSON(): Record<string, V> {
        const obj: Record<string, V> = {}
        for (const [k, v] of super.entries()) obj[k as any] = v
        return obj
    }

    /**
     * Returns all keys from the containor as a ContainorArray.
     * Optionally, applies a transformation function to each key.
     * @param {Function} [func] - A function to transform each key. Receives `(key, containor)` as arguments.
     * @returns {ContainorArray} A ContainorArray containing the containor's keys (transformed if a function is provided).
     * @example
     * const myContainor = new Containor({ key1: 'value1', key2: 'value2' });
     * const keys = myContainor.keys();
     * // ContainorArray [ 'key1', 'key2' ]
     * @example
     * const upperKeys = myContainor.keys((key) => key.toUpperCase());
     * // ContainorArray [ 'KEY1', 'KEY2' ]
     */
    override keys(func?: (key: K, containor: this) => any): any {
        if (!func) return ContainorArray.from(super.keys() as any);

        const iterator = super.keys();
        return ContainorArray.from({ length: this.size }, () => {
            const next = iterator.next();
            if (next.done) return undefined as any;
            return func(next.value, this);
        });
    }

    /**
     * Returns all values from the containor as a ContainorArray.
     * Optionally, applies a transformation function to each value.
     * @param {Function} [func] - A function to transform each value. Receives `(value, containor)` as arguments.
     * @returns {ContainorArray} A ContainorArray containing the containor's values (transformed if a function is provided).
     * @example
     * const myContainor = new Containor({ key1: 'value1', key2: 'value2' });
     * const values = myContainor.values();
     * // ContainorArray [ 'value1', 'value2' ]
     * @example
     * const upperValues = myContainor.values((value) => value.toUpperCase());
     * // ContainorArray [ 'VALUE1', 'VALUE2' ]
     */
    override values(func?: (value: V, containor: this) => any): any {
        if (!func) return ContainorArray.from(super.values() as any);

        const iterator = super.values();
        return ContainorArray.from({ length: this.size }, () => {
            const next = iterator.next();
            if (next.done) return undefined as any;
            return func(next.value, this);
        });
    }

    /**
     * Creates a shallow clone of the containor.
     * @returns {Containor} A new Containor instance containing the same key-value pairs.
     * @example
     * const myContainor = new Containor({ key1: 'value1' });
     * const clone = myContainor.clone();
     * // clone: Containor { key1: 'value1' }
     */
    clone(): Containor<K, V> {
        return new Containor(this)
    }

    /**
     * Returns all entries (key-value pairs) from the containor as a ContainorArray.
     * @returns {ContainorArray<[*, *]>} A ContainorArray containing arrays of `[key, value]`.
     * @example
     * const myContainor = new Containor({ key1: 'value1', key2: 'value2' });
     * const entries = myContainor.entries();
     * // ContainorArray [ ['key1', 'value1'], ['key2', 'value2'] ]
     */
    override entries(transform?: (key: K, value: V, containor: this) => any): any {
        if (!transform) return ContainorArray.from(super.entries() as any);

        const iterator = super.entries();
        return ContainorArray.from({ length: this.size }, () => {
            const next = iterator.next();
            if (next.done) return undefined as any;
            const [key, value] = next.value;
            return transform(key, value, this);
        });
    }

    /**
     * Creates a new containor instance from a given source.
     * Supports Maps, Arrays, Objects, Containors, and array-like objects.
     * Optionally applies a mapping function to each element before insertion.
     * @param {Map|Array|Object|Containor|ArrayLike|ContainorArray} source - The source to convert into a containor.
     * @param {Function} [mapFn] - Optional mapping function called for each element.
     * @param {*} [thisArg] - Optional value to use as `this` when executing `mapFn`.
     * @returns {Containor} A new containor populated with the provided source entries.
     * @example
     * // From an Object
     * const c1 = Containor.from({ a: 1, b: 2 });
     * 
     * // From an Array
     * const c2 = Containor.from(['x', 'y', 'z']);
     * 
     * // From a Map
     * const c3 = Containor.from(new Map([['key1', 'value1'], ['key2', 'value2']]));
     * 
     * // With a mapping function
     * const c4 = Containor.from([1, 2, 3], (value, index) => ({ key: `num${index}`, value: value * 2 }));
     * // => Containor { num0 => 2, num1 => 4, num2 => 6 }
     * const c5 = Containor.from({ length: 3 }, (i) => ({ key: `num${i}`, value: i * 2 }));
     * // => Containor { num0 => 0, num1 => 2, num2 => 4 }
     */
    static from<K, V>(
        source: any,
        mapFn?: (value: any, key: any, containor: Containor<K, V>) => any,
        thisArg?: any
    ): Containor<K, V> {
        const containor = new Containor<K, V>()
        if (is.undefined(source) || is.null(source)) return containor
        if (is.array(source) && !source.every(is.array)) source = source.map((v, i) => [i, v])
        if (is.array(source) && source.every(is.array)) {
            for (let [key, value] of source as [K, V][]) {
                if (is.function(mapFn)) value = mapFn.call(thisArg, value, key, containor)
                if (is.plainObject(value) && 'key' in value && 'value' in value)
                    containor.set((value as any).key, (value as any).value)
                else containor.set(key, value)
            }
            return containor
        }
        if (is.map(source) || source instanceof Containor) {
            const entries = [...(source as Map<K, V>).entries()]
            for (let [key, value] of entries) {
                if (is.function(mapFn)) value = mapFn.call(thisArg, value, key, containor)
                containor.set(key, value)
            }
            return containor
        }
        if (is.plainObject(source) && is.number((source as any).length)) {
            for (let i = 0; i < (source as any).length; i++) {
                const value = is.function(mapFn) ? mapFn.call(thisArg, i, undefined, containor) : i
                const key = i as any
                if (is.plainObject(value) && is.string((value as any).key)) containor.set((value as any).key, value?.value)
                else containor.set(key, value?.value || value);
            }
            return containor
        }
        if (is.plainObject(source)) {
            for (const [key, value] of Object.entries(source)) {
                const val = is.function(mapFn)
                    ? mapFn.call(thisArg, value, key, containor)
                    : value
                containor.set(key as any, val as any)
            }
            return containor
        }
        throw new TypeError('Containor.from: unsupported source type')
    }



    get [Symbol.toStringTag](): string {
        return 'Containor'
    }

    [Symbol.for("nodejs.util.inspect.custom")](depth: number, options: util.InspectOptionsStylized) {
        const max = 10; // limite de itens exibidos
        const entries = [...this.entries()];
        const preview = entries.slice(0, max).map(([k, v]) => [k, v]);

        const base = Object.fromEntries(preview);
        const remaining = this.size - max;

        const formatted = {
            ...(remaining > 0 ? { [`+${remaining} more`]: '...' } : {}),
            ...base
        };

        return `Containor (${this.size}) ` + util.inspect(formatted, { ...options, depth: depth ?? 2 });
    }

}
