export type SourceType = 'function' | 'iterable' | 'iterator' | 'unknown'

export type Factory<T> = () => Iterator<T>

export interface ContainorFlowOptions {
    cache?: boolean
    autoReplay?: boolean
}

export interface CursorState {
    index: number
    done: boolean
}

export interface MetaState {
    maxIndexReached: number
    hasCompleted: boolean
    sourceType: SourceType
}

export interface Status<T> {
    sourceType: SourceType
    index: number
    done: boolean
    hasCompleted: boolean
    maxIndexReached: number
    cache: T[] | null
}

export default class ContainorFlow<T> implements Iterator<T>, Iterable<T> {
    #factory: Factory<T>
    #iterator: Iterator<T>
    #options: Required<ContainorFlowOptions>
    #cursor: CursorState
    #meta: MetaState
    #cache: T[] | []

    source: Iterable<T> | Iterator<T> | Factory<T>

    constructor(source: Iterable<T> | Iterator<T> | Factory<T>, options: ContainorFlowOptions = {}) {
        this.#factory = ContainorFlow.normalize<T>(source)
        this.#iterator = this.#factory()
        this.source = source

        this.#options = {
            cache: options?.cache == true,
            autoReplay: options?.autoReplay == true,
        }

        this.#cursor = {
            index: 0,
            done: false
        }

        this.#meta = {
            maxIndexReached: 0,
            hasCompleted: false,
            sourceType: 'unknown'
        }

        this.#cache = []

        const isIterable = typeof (this.source as any)?.[Symbol.iterator] === 'function'
        const isIterator = typeof (this.source as any)?.next === 'function'

        if (typeof this.source === 'function') this.#meta.sourceType = 'function'
        else this.#meta.sourceType = isIterable && !isIterator ? 'iterable' : 'iterator'
    }

    get hasCompleted(): boolean {
        return this.#meta.hasCompleted
    }

    get position(): number {
        return this.#cursor.index
    }

    get type(): SourceType {
        return this.#meta.sourceType
    }

    get maxIndexReached(): number {
        return this.#resolveMax()
    }

    get size(): number {
        if (!this.#meta.hasCompleted) return Infinity
        return this.#resolveMax()
    }

    get done(): boolean {
        return this.#cursor.done
    }

    #resolveMax(): number {
        let max = this.#cursor.index;
        if (this.#options.cache && this.#cache.length > max) max = this.#cache.length;
        if (Number.isInteger(this.#meta.maxIndexReached) && this.#meta.maxIndexReached >= max) return this.#meta.maxIndexReached;
        return this.#meta.maxIndexReached = max;
    }

    next(): IteratorResult<T> {
        if (this.#options.cache && this.#cursor.index in this.#cache) {
            return { value: this.#cache[this.#cursor.index++], done: false }
        }

        if (this.#cursor.done) {
            if (this.#options.autoReplay && this.#options.cache) {
                this.#cursor.index = 0
                this.#cursor.done = false
                return this.next()
            }

            return { value: undefined as any, done: true }
        }

        const result = this.#iterator.next()

        if (result.done) {
            this.#meta.hasCompleted = true
            this.#cursor.done = true
            return { value: undefined as any, done: true }
        }

        if (this.#options.cache) this.#cache[this.#cursor.index] = result.value
        this.#cursor.index++
        if (!this.#meta.hasCompleted) this.#resolveMax()
        return { value: result.value, done: false }
    }

    back(): IteratorResult<T> {
        if (!this.#options.cache) throw new Error('Cache disabled: back() unavailable')
        if (this.#cursor.index - 1 < 0) throw new Error('Already at the beginning')

        this.#cursor.index = Math.max(0, this.#cursor.index - 1)
        return this.next()
    }

    moveBack(n: number): IteratorResult<T> {
        if (!this.#options.cache) throw new Error('Cache disabled: moveBack() unavailable')
        if (!Number.isInteger(n) || n < 0) throw new Error('Invalid index')
        if (this.#cursor.index - n < 0) throw new Error('Already at the beginning')

        this.#cursor.index = Math.max(0, this.#cursor.index - n)
        return this.next()
    }

    jump(targetIndex: number): IteratorResult<T> | undefined {
        if (!Number.isInteger(targetIndex) || targetIndex < 0) throw new Error('Invalid index')

        const count = this.#cursor.index + targetIndex
        let result: IteratorResult<T> | undefined = undefined

        while (this.#cursor.index < count && !this.#cursor.done) {
            result = this.next()
        }

        return result
    }

    has(index: number): boolean {
        if (!this.#options.cache) throw new Error('Cache disabled: has() unavailable')
        return index in this.#cache
    }

    getStatus(): Status<T> {
        const maxIndexReached = this.#resolveMax()

        return {
            sourceType: this.#meta.sourceType,
            index: this.#cursor.index,
            done: this.#cursor.done,
            hasCompleted: this.#meta.hasCompleted,
            maxIndexReached: Number.isInteger(maxIndexReached) ? maxIndexReached : 0,
            cache: this.#options.cache ? [...this.#cache] : null
        }
    }

    reset(): true {
        this.#iterator = this.#factory()
        this.#cursor.index = 0
        this.#cursor.done = false
        this.#cache = []
        return true
    }

    setIndex(n: number): number {
        if (!this.#options.cache) throw new Error('setIndex requires cache or use jump()')
        if (!Number.isInteger(n) || n < 0) throw new Error('Invalid index')
        if (this.#cache.length < n) throw new Error('cache não foi carregado até n index')
        return this.#cursor.index = n;
    }

    [Symbol.iterator](): Iterator<T> {
        if (this.#options.autoReplay && this.#meta.sourceType !== 'iterator') return this.#factory()
        return this
    }

    static normalize<T>(
        source: Iterable<T> | Iterator<T> | (() => Iterator<T>)
    ): () => Iterator<T> {
        if (!source) throw new Error('Invalid source')

        if (typeof source === 'function') return source

        const isIterable = typeof (source as any)?.[Symbol.iterator] === 'function'
        const isIterator = typeof (source as any)?.next === 'function'

        if (isIterable && !isIterator) {
            return () => (source as Iterable<T>)[Symbol.iterator]()
        }

        if (isIterator) {
            return () => source as Iterator<T>
        }

        throw new Error('Unsupported source')
    }
}