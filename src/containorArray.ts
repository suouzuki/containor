import is from './is.js'

/**
 * A specialized Array class with utility methods for advanced array manipulations.
 * @extends Array
 */
export default class ContainorArray<T> extends Array<T> {
    constructor(...v: T[]) {
        super(...v)
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

    /**
     * Deletes specific items from the array.
     * @param {...*} removeArr - Items to remove.
     * @returns {ContainorArray} The modified array.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * arr.delete(2); // ContainorArray [1, 3]
     */
    delete(...removeArr: T[]): this {
        if (!removeArr || removeArr.length === 0) return this
        const removeSet = new Set(removeArr)
        const items = this.filter(item => !removeSet.has(item))
        this.length = 0
        for (const item of items) this.push(item)
        return this
    }

    /**
     * Deletes specific items from the array.
     * @param {...*} removeArr - Items to remove.
     * @returns {ContainorArray} The modified array.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * arr.delete(2); // ContainorArray [1, 3]
     */
    deleteAt(...removeArr: number[]): this {
        if (!removeArr || removeArr.length === 0) return this
        const uniqueIndices = Array.from(new Set(removeArr))
        for (const index of uniqueIndices) {
            if (index < 0 || index >= this.length)
                throw new Error(`The index ${index} is out of bounds for the array.`)
        }
        const items = this.filter((_, idx) => !uniqueIndices.includes(idx))
        this.length = 0
        for (const item of items) this.push(item)
        return this
    }

    /**
     * Removes duplicate elements, optionally ignoring specific items.
     * @param {Array} [arrayDefault=[]] - The array to process (default is the current array).
     * @param {...*} ignore - Values to ignore while removing duplicates.
     * @returns {ContainorArray} The modified array.
     * @example
     * const arr = new ContainorArray(1, 2, 2, 3);
     * arr.removeDuplicates(); // ContainorArray [1, 2, 3]
     */
    removeDuplicates(arrayDefault: T[] = [], ...ignore: T[]): this {
        if (this.length <= 1) return this
        const ignoreSet = new Set(ignore)
        const seen = new Set<T>()
        this.length = 0
        for (const item of arrayDefault) {
            if (ignoreSet.has(item) || !seen.has(item)) {
                if (!seen.has(item)) seen.add(item)
                this.push(item)
            }
        }
        return this
    }

    /**
     * Returns a new array with elements shuffled randomly.
     * @returns {ContainorArray} A new shuffled array.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * const shuffled = arr.shuffle(); // ContainorArray [3, 1, 2] (example)
     */
    shuffle(): ContainorArray<T> {
        const array = this.clone()
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[array[i], array[j]] = [array[j], array[i]]
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
        return ContainorArray.from(
            { length: Math.ceil(this.length / size) },
            (_, i) => ContainorArray.from(this.slice(i * size, i * size + size))
        )
    }

    /**
     * Returns a random element or a specified number of random elements from the array.
     * @param {number} [quantity=1] - Number of random elements to return.
     * @returns {ContainorArray} A new array of random elements.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * arr.random();   // ContainorArray [2] (example)
     * arr.random(2);  // ContainorArray [1, 3] (example)
     */
    random(quantity: number = 1): ContainorArray<T> {
        if (!is.number(quantity) || quantity < 1)
            throw new Error('Quantity must be a positive number.')
        const array = this.clone()
        const maxItems = Math.min(quantity, array.length)
        return ContainorArray.from({ length: maxItems }, () => {
            const randomIndex = Math.floor(Math.random() * array.length)
            const randomItem = array[randomIndex]
            array.splice(randomIndex, 1)
            return randomItem
        })
    }

    /**
     * Creates a shallow clone of the array.
     * @returns {ContainorArray} A new ContainorArray containing the same elements.
     * @example
     * const arr = new ContainorArray(1, 2, 3);
     * const clone = arr.clone(); // ContainorArray [1, 2, 3]
     */
    clone(): ContainorArray<T> {
        return ContainorArray.from(this)
    }



    static override from<U>(
        items: Iterable<U> | ArrayLike<U>,
        mapFn?: (value: U, index: number) => U,
        thisArg?: any
    ): ContainorArray<U> {
        const result = Array.from(items, mapFn as any, thisArg) as U[]
        return new ContainorArray<U>(...result)
    }
}
