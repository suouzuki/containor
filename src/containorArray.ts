import is from './is.js'

/**
 * A specialized Array class with utility methods for advanced array manipulations.
 * @extends Array
 */
export default class ContainorArray<T> extends Array<T> {
    constructor(...v: T[]) {
        super(...v)
    }

    clear(clearVariables: boolean = true): this {//! colocar opção para apagar variaveis dentro de arrays [1, 2, 3, variable: true]
        if (clearVariables) this.clearVariables();
        this.length = 0
        return this;
    }

    clearVariables(): this {
        // @ts-ignore
        for (const nonNumericKey of Object.keys(this).filter(isNaN)) delete this[nonNumericKey]
        return this;
    }

    /**
     * Returns the first element of the array.
     * @returns {*|undefined} The first element, or undefined if the array is empty.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * arr.first(); // 1
     */
    first(): T | undefined {
        return this.length > 0 ? this[0] : undefined
    }

    /**
     * Returns the last element of the array.
     * @returns {*|undefined} The last element, or undefined if the array is empty.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * arr.last(); // 3
     */
    last(): T | undefined {
        return this.length > 0 ? this.at(-1) : undefined
    }

    has(...keys: T[]): boolean | (ContainorArray<boolean> & { hasAll: boolean; hasAny: boolean }) {
        if (keys.length === 0) return false
        if (keys.length === 1) return super.includes(keys[0])
        const results = (this.constructor as any).from(keys.map(key => super.includes(key))) as ContainorArray<boolean>
        Object.defineProperties(results, {
            hasAll: { value: results.every(Boolean), enumerable: false },
            hasAny: { value: results.some(Boolean), enumerable: false }
        })
        return results as typeof results & { hasAll: boolean; hasAny: boolean }
    }

    /**
     * Exchanges the values of two positions in the array.
     * @param {number} firstIndex
     * @param {number} secondIndex
     * @returns {this}
     * @throws {TypeError} When any index is not an integer
     */
    swap(firstIndex: number, secondIndex: number): this {
        if (this.length <= 0) throw new Error('Cannot swap elements in an empty array.')
        if (!Number.isInteger(firstIndex) || !Number.isInteger(secondIndex)) throw new TypeError('swap indices must be integers')


        const length = this.length

        if (firstIndex < 0) firstIndex += length
        if (secondIndex < 0) secondIndex += length

        if (
            firstIndex < 0 || firstIndex >= length ||
            secondIndex < 0 || secondIndex >= length ||
            firstIndex === secondIndex
        ) {
            return this
        }

        const firstValue = this[firstIndex]
        this[firstIndex] = this[secondIndex]
        this[secondIndex] = firstValue

        return this
    }

    /**
     * Moves an element from one position to another.
     * All elements between the indices are shifted.
     * @param {number} fromIndex
     * @param {number} toIndex
     * @returns {this}
     * @throws {TypeError} When any index is not an integer
     */
    move(fromIndex: number, toIndex: number): this {
        if (this.length <= 0) throw new Error('Cannot move elements in an empty array.')
        if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
            throw new TypeError('move indices must be integers')
        }

        const length = this.length

        if (fromIndex < 0) fromIndex += length
        if (toIndex < 0) toIndex += length

        if (
            fromIndex < 0 || fromIndex >= length ||
            toIndex < 0 || toIndex >= length ||
            fromIndex === toIndex
        ) {
            return this
        }

        const [item] = this.splice(fromIndex, 1)
        this.splice(toIndex, 0, item)

        return this
    }

    /*
    delete(...removeArr: T[]): this {//!  aceitar função tbm
        if (this.length <= 0) throw new Error('Cannot delete from an empty array.')
        if (!removeArr || removeArr.length === 0) throw new Error('No values provided for deletion.')
        const removeSet = new Set(removeArr)
        const items = this.filter(item => !removeSet.has(item)).map(item => this.at(item))
        return this
    }*/

        //! colocar função pra remover uma variavel especifica

    delete(...deleteArr: T[]): this {//!  aceitar função tbm
        if (this.length <= 0) throw new Error('Cannot delete from an empty array.')
        if (!deleteArr || deleteArr.length === 0) throw new Error('No values provided for deletion.')
        for (const item of deleteArr) {
            const index = this.indexOf(item)
            if (index !== -1) delete this[index]
        }
        return this
    }

    /**
     * Removes all elements from the array that strictly match any of the provided values.
     * The operation mutates the current instance and preserves element order.
     * @param {...T} removeArr - Values to be removed from the array.
     * @returns {this} The same array instance after the removals.
     * @example
     * const arr = new ContainorArray(1, 2, 3, 2)
     * arr.remove(2)
     * // ContainorArray [1, 3]
     */
    remove(...removeArr: T[]): this {//!  aceitar função tbm
        if (this.length <= 0) throw new Error('Cannot delete from an empty array.')
        if (!removeArr || removeArr.length === 0) throw new Error('No values provided for deletion.')
        const items = this.filter(item => !removeArr.includes(item))
        this.clear(false)
        for (const item of items) this.push(item)
        return this
    }

    /**
     * Removes elements from the array based on their numeric indices.
     * The operation mutates the current instance and preserves the order of remaining elements.
     * Duplicate indices are ignored. An error is thrown if any index is out of bounds.
     * @param {...number} removeArr - Zero-based indices of elements to be removed.
     * @returns {this} The same array instance after the removals.
     * @throws {Error} Thrown when any provided index is negative or exceeds the array bounds.
     * @example
     * const arr = new ContainorArray('a', 'b', 'c', 'd')
     * arr.deleteAt(1, 3)
     * // ContainorArray ['a', 'c']
     */
    removeAt(...removeArr: number[]): this {
        if (this.length <= 0) throw new Error('Cannot delete from an empty array.')
        if (!removeArr || removeArr.length === 0) throw new Error('No indices provided for deletion.')
        if (removeArr.some(i => i < 0 || i >= this.length)) throw new Error('One or more indices are out of bounds for the array.')
        const items = this.filter((_, idx) => !removeArr.includes(idx))
        this.clear(false)
        for (const item of items) this.push(item)
        return this
    }

    deleteAt(...deleteArr: number[]): this {
        if (this.length <= 0) throw new Error('Cannot delete from an empty array.')
        if (!deleteArr || deleteArr.length === 0) throw new Error('No indices provided for deletion.')
        for (const index of deleteArr) {
            if (index < 0 || index >= this.length)
                throw new Error(`The index ${index} is out of bounds for the array.`)

            delete this[index]
        }
        return this
    }

    /**
     * Removes duplicate elements, optionally ignoring specific items.
     * @param {...*} ignore - Values to ignore while removing duplicates.
     * @returns {ContainorArray} The modified array.
     * @example
     * const arr = new ContainorArray(1, 2, 2, 3);
     * arr.unique(); // ContainorArray [1, 2, 3]
     */
    unique(...ignore: T[]): ContainorArray<T> {
        if (this.length <= 1) return this
        const ignoreSet = new Set(ignore)
        const seen = new Set<T>()
        const arrayDefault = this.clone()
        const arrayReturn = new (this.constructor as any)()
        for (const item of arrayDefault) {
            if (ignoreSet.has(item) || !seen.has(item)) {
                if (!seen.has(item)) seen.add(item)
                arrayReturn.push(item)
            }
        }
        return arrayReturn;
    }

    counter(): Map<T, number>
    counter<K>(selector: (item: T) => K): Map<K, number>
    counter<K>(selector?: (item: T) => K): Map<T | K, number> {
        const count = new Map<any, number>()

        for (const item of this) {
            const key = selector ? selector(item) : item
            count.set(key, (count.get(key) || 0) + 1)
        }

        return count
    }

    /**
     * Returns a new array with elements shuffled randomly.
     * @returns {ContainorArray} A new shuffled array.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * const shuffled = arr.shuffle(); // ContainorArray [3, 1, 2] (example)
     */
    shuffle(): ContainorArray<T> {
        if (this.length <= 0) throw new Error('Cannot shuffle an empty array.')
        const array = this.clone()
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]
        }
        return array
    }

    /**
     * Returns the average of numeric elements in the array.
     * @returns {number} The average value.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * arr.average(); // 2
     */
    average(this: ContainorArray<number>): number {
        if (!this.every(is.number)) throw new Error('All elements must be numbers to calculate the average.')
        return this.reduce((a, b) => a + b, 0) / this.length
    }

    /**
     * Splits the array into chunks of a specified size.
     * @param {number} size - The size of each chunk.
     * @returns {ContainorArray} An array of ContainorArray chunks.
     * @example
     * const arr = new ContainorArray(1, 2, 3, 4);
     * arr.chunk(2); // ContainorArray [ContainorArray [1,2], ContainorArray [3,4]]
     */
    chunk(size: number): ContainorArray<ContainorArray<T>> {
        if (this.length <= 0) throw new Error('Cannot chunk an empty array.')
        return (this.constructor as any).from(
            { length: Math.ceil(this.length / size) },
            (_: any, i: number) => (this.constructor as any).from(this.slice(i * size, i * size + size), this)
        )
    }

    /**
     * Returns a random element or a specified number of random elements from the array.
     * @param {number} [quantity=1] - Number of random elements to return.
     * @returns {ContainorArray} A new array of random elements.
     * @throws {Error}
     * @example Thrown when `quantity` is not a number or is less than 1.
     * const arr = new ContainorArray(1, 2, 3);
     * arr.random();   // ContainorArray [2] (example)
     * arr.random(2);  // ContainorArray [1, 3] (example)
     */
    random(quantity: number = 1): ContainorArray<T> {
        if (this.length <= 0) throw new Error('Cannot select random elements from an empty array.')
        if (!is.number(quantity) || quantity < 1)
            throw new Error('Quantity must be a positive number.')
        const maxItems = Math.min(quantity, this.length)
        return this.shuffle().slice(0, maxItems) as ContainorArray<T>
    }

    /**
     * Creates a shallow clone of the array.
     * @returns {ContainorArray} A new ContainorArray containing the same elements.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * const clone = arr.clone(); // ContainorArray [1, 2, 3]
     */
    clone(func?: (arr: ContainorArray<T>) => void): ContainorArray<T> {
        const cloned = new (this.constructor as any)(...this)

        if (is.function(func)) func(cloned)

        return cloned;
    }

    equals(other: any, deep = false, strictType = true): boolean {
        return (this.constructor as any).equals(this, other, deep, strictType)
    }

    toArray() {
        return Array.from(this);
    }

    static override from<T, U = T>(
        items: Iterable<T> | ArrayLike<T>,
        mapFn?: (value: U, index: number) => U,
        thisArg?: any
    ): ContainorArray<U> {
        const result = Array.from(items, mapFn as any, thisArg) as U[]
        return new ContainorArray<U>(...result)
    }

    static is(v: unknown): v is ContainorArray<unknown> {
        return v instanceof ContainorArray
    }
}
