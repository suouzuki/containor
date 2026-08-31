import ContainorArray from './containorArray.js'
import ContainorFlow, { type ContainorFlowOptions } from './containorFlow.js'
import is, { type EntryTuple, type EntryObject } from './is.js'

export type ArrayLike<V> = V[] | ContainorArray<V>
export type EntryArray<K, V> = ArrayLike<EntryTuple<K, V>>
export type EntryGenerator<K, V> = (key: unknown, value: unknown, containor: Containor<K, V>) => EntryTuple<K, V>

export type SetDecision<K, V> = { action: 'set', value: V, key?: K } | { action: 'skip' }
export type ResolverFunction<K, V> = (key: K, value: V, existingValue: V | undefined, c: Containor<K, V>) => SetDecision<K, V>

export type EventKey = keyof EventMap<any, any>
export type EventListener<C, Args extends unknown[]> = (context: C, ...args: Args) => void
export type EventMap<K, V> = {
    clear: [size: number]
    delete: [deleted: K[]]
    add: [add: EntryArray<K, V>]
    update: [newValues: EntryArray<K, V>, oldValues: EntryArray<K, V>]
    replace: [entries: EntryArray<K, V>]
}

export type ComparatorFunction<K, V> = (firstValue: V, secondValue: V, firstKey: K, secondKey: K) => number

export interface CollectionConstructor {
    new(): Containor<unknown, unknown>;
    new <K, V>(entries?: ReadonlyArray<readonly [K, V]> | null): Containor<K, V>;
    new <K, V>(iterable: Iterable<readonly [K, V]>): Containor<K, V>;
    readonly prototype: Containor<unknown, unknown>;
    readonly [Symbol.species]: CollectionConstructor;
}

export interface Containor<K, V> extends Map<K, V> {
    constructor: CollectionConstructor;
}

type EventEmitter = {
    emit(event: string | symbol, ...args: any[]): boolean;
    on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter;
    off(event: string | symbol, listener: (...args: any[]) => void): EventEmitter;
    once(event: string | symbol, listener: (...args: any[]) => void): EventEmitter;
    listenerCount(event: string | symbol): number;
};

export class Containor<K, V> extends Map<K, V> {
    public static readonly default: typeof Containor = Containor;
    #event: undefined | EventEmitter
    constructor(value?: Iterable<readonly [K, V]> | ReadonlyArray<readonly [K, V]> | null) {
        super()
        this.#event = undefined
        if (!value) return this;

        this.merge(value)
        return this;
    }

    public isEventEmitter(value: unknown): value is EventEmitter {
        if (typeof value !== "object" || value === null) {
            return false;
        }

        const emitter = value as Record<string, unknown>;

        return (
            typeof emitter.emit === "function" &&
            typeof emitter.on === "function" &&
            typeof emitter.off === "function" &&
            typeof emitter.once === "function" &&
            typeof emitter.listenerCount === "function"
        );
    }

    public setEventEmitter(eventEmitter: EventEmitter) {
        if (!this.isEventEmitter(this.#event)) throw new Error('EventEmitter is not set or is invalid. Please provide a valid EventEmitter.')
        this.#event = eventEmitter;
    }

    public emit<E extends keyof EventMap<K, V>>(
        event: E,
        ...args: EventMap<K, V>[E]
    ): boolean {
        if (!this.isEventEmitter(this.#event)) throw new Error('EventEmitter is not set or is invalid. Please set a valid EventEmitter using setEventEmitter() before emitting events.')
        return this.#event.emit(event as string, ...args);
    }

    public emitIfHasListeners<E extends keyof EventMap<K, V>>(
        event: E,
        ...args: EventMap<K, V>[E]
    ): boolean {
        if (!this.isEventEmitter(this.#event)) return false;
        if (this.#event.listenerCount(event as string) === 0) return false
        return this.emit(event, ...args as EventMap<K, V>[E]);
    }

    public on<E extends keyof EventMap<K, V>>(
        event: E,
        listener: EventListener<this, EventMap<K, V>[E]>
    ): this {
        if (!this.isEventEmitter(this.#event)) throw new Error('EventEmitter is not set or is invalid. Please set a valid EventEmitter using setEventEmitter() before adding listeners.')
        this.#event.on(event as string, listener);
        return this;
    }

    public once<E extends keyof EventMap<K, V>>(
        event: E,
        listener: EventListener<this, EventMap<K, V>[E]>
    ): this {
        if (!this.isEventEmitter(this.#event)) throw new Error('EventEmitter is not set or is invalid. Please set a valid EventEmitter using setEventEmitter() before adding listeners.')
        this.#event.once(event as string, listener);
        return this;
    }

    public off<E extends keyof EventMap<K, V>>(
        event: E,
        listener: EventListener<this, EventMap<K, V>[E]>
    ): this {
        if (!this.isEventEmitter(this.#event)) throw new Error('EventEmitter is not set or is invalid. Please set a valid EventEmitter using setEventEmitter() before removing listeners.')
        this.#event.off(event as string, listener);
        return this;
    }

    public hasListeners<E extends keyof EventMap<K, V>>(
        event: E | readonly E[]
    ): boolean {
        if (!this.isEventEmitter(this.#event)) return false;
        if (!Array.isArray(event)) return this.#event.listenerCount(event as string) > 0

        for (const element of event) {
            if (this.#event.listenerCount(element as string) === 0) {
                return false
            }
        }
        return true
    }

    public first(): EntryTuple<K, V> | undefined
    public first(amount: 1): EntryTuple<K, V> | undefined
    public first(amount: number): Containor<K, V> | undefined
    public first(amount?: number): EntryTuple<K, V> | Containor<K, V> | undefined {
        return this.#getFirst(
            amount,
            super.entries(),
            items => new this.constructor[Symbol.species](items),
            amount => this.last(amount)
        )
    }

    public firstKey(): K | undefined
    public firstKey(amount: 1): K | undefined
    public firstKey(amount: number): ContainorArray<K> | undefined
    public firstKey(amount?: number): K | ContainorArray<K> | undefined {
        return this.#getFirst(
            amount,
            super.keys(),
            items => ContainorArray.from(items),
            amount => this.lastKey(amount)
        )
    }

    public firstValue(): V | undefined
    public firstValue(amount: 1): V | undefined
    public firstValue(amount: number): ContainorArray<V> | undefined
    public firstValue(amount?: number): V | ContainorArray<V> | undefined {
        return this.#getFirst(
            amount,
            super.values(),
            items => ContainorArray.from(items),
            amount => this.lastValue(amount)
        )
    }

    public last(): EntryTuple<K, V> | undefined
    public last(amount: 1): EntryTuple<K, V> | undefined
    public last(amount: number): Containor<K, V> | undefined
    public last(amount?: number): EntryTuple<K, V> | Containor<K, V> | undefined {
        return this.#getLast(
            amount,
            super.entries(),
            items => new this.constructor[Symbol.species](items),
            amount => this.first(amount)
        )
    }

    public lastKey(): K | undefined
    public lastKey(amount: 1): K | undefined
    public lastKey(amount: number): ContainorArray<K> | undefined
    public lastKey(amount?: number): K | ContainorArray<K> | undefined {
        return this.#getLast(
            amount,
            super.keys(),
            items => ContainorArray.from(items),
            amount => this.firstKey(amount)
        )
    }

    public lastValue(): V | undefined
    public lastValue(amount: 1): V | undefined
    public lastValue(amount: number): ContainorArray<V> | undefined
    public lastValue(amount?: number): V | ContainorArray<V> | undefined {
        return this.#getLast(
            amount,
            super.values(),
            items => ContainorArray.from(items),
            amount => this.firstValue(amount)
        )
    }

    public at(index: number): EntryTuple<K, V> | undefined {
        return this.#getAt(index, super.entries())
    }

    public keyAt(index: number): K | undefined {
        return this.#getAt(index, super.keys())
    }

    public valueAt(index: number): V | undefined {
        return this.#getAt(index, super.values())
    }

    public random(): EntryTuple<K, V> | undefined
    public random(amount: 1): EntryTuple<K, V> | undefined
    public random(amount: number): Containor<K, V> | undefined
    public random(amount?: number): EntryTuple<K, V> | Containor<K, V> | undefined {
        return this.#getRandom(amount, this.entries(), items => {
            if (amount === 1) return items[0];
            return new this.constructor[Symbol.species](items)
        })
    }

    public randomKey(): K | undefined
    public randomKey(amount: 1): K | undefined
    public randomKey(amount: number): ContainorArray<K> | undefined
    public randomKey(amount?: number): K | ContainorArray<K> | undefined {
        return this.#getRandom(amount, this.keys(), items => {
            if (amount === 1) return items[0]
            return ContainorArray.from(items)
        })
    }

    public randomValue(): V | undefined
    public randomValue(amount: 1): V | undefined
    public randomValue(amount: number): ContainorArray<V> | undefined
    public randomValue(amount?: number): V | ContainorArray<V> | undefined {
        return this.#getRandom(amount, this.values(), items => {
            if (amount === 1) return items[0]
            return ContainorArray.from(items)
        })
    }

    public find<K2 extends K>(callback: (value: V, key: K, containor: this) => key is K2): EntryTuple<K2, V> | undefined;
    public find<V2 extends V>(callback: (value: V, key: K, containor: this) => value is V2): EntryTuple<K, V2> | undefined;
    public find(callback: (value: V, key: K, containor: this) => boolean): EntryTuple<K, V> | undefined;
    public find<This, K2 extends K>(callback: (this: This, value: V, key: K, containor: this) => key is K2, arg: This): EntryTuple<K2, V> | undefined;
    public find<This, V2 extends V>(callback: (this: This, value: V, key: K, containor: this) => value is V2, arg: This): EntryTuple<K, V2> | undefined;
    public find<This>(callback: (this: This, value: V, key: K, containor: this) => boolean, arg: This): EntryTuple<K, V> | undefined;
    public find(callback: (value: V, key: K, containor: this) => boolean, arg?: any): EntryTuple<K, V> | undefined {
        if (!is.function(callback)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(arg)) callback = callback.bind(arg)

        for (const [key, value] of this)
            if (callback(value, key, this)) return [key, value]
        return undefined
    }

    public filter<K2 extends K>(predicate: (value: V, key: K, containor: this) => key is K2): Containor<K2, V>;
    public filter<V2 extends V>(predicate: (value: V, key: K, containor: this) => value is V2): Containor<K, V2>;
    public filter(predicate: (value: V, key: K, containor: this) => boolean): Containor<K, V>;
    public filter<This, K2 extends K>(predicate: (this: This, value: V, key: K, containor: this) => key is K2, thisArg: This): Containor<K2, V>;
    public filter<This, V2 extends V>(predicate: (this: This, value: V, key: K, containor: this) => value is V2, thisArg: This): Containor<K, V2>;
    public filter<This>(predicate: (this: This, value: V, key: K, containor: this) => boolean, thisArg: This): Containor<K, V>;
    public filter(predicate: (value: V, key: K, containor: this) => boolean, thisArg?: unknown): Containor<K, V> {
        if (!is.function(predicate)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(thisArg)) predicate = predicate.bind(thisArg)

        const results = new this.constructor[Symbol.species]<K, V>()
        for (const [key, value] of this)
            if (predicate(value, key, this)) results.set(key, value)
        return results
    }

    public partition<K2 extends K>(predicate: (value: V, key: K, containor: this) => key is K2): [Containor<K2, V>, Containor<Exclude<K, K2>, V>];
    public partition<V2 extends V>(predicate: (value: V, key: K, containor: this) => value is V2): [Containor<K, V2>, Containor<K, Exclude<V, V2>>];
    public partition(predicate: (value: V, key: K, containor: this) => boolean): [Containor<K, V>, Containor<K, V>];
    public partition<This, K2 extends K>(predicate: (this: This, value: V, key: K, containor: this) => key is K2, thisArg: This): [Containor<K2, V>, Containor<Exclude<K, K2>, V>];
    public partition<This, V2 extends V>(predicate: (this: This, value: V, key: K, containor: this) => value is V2, thisArg: This): [Containor<K, V2>, Containor<K, Exclude<V, V2>>];
    public partition<This>(predicate: (this: This, value: V, key: K, containor: this) => boolean, thisArg: This): [Containor<K, V>, Containor<K, V>];
    public partition(predicate: (value: V, key: K, containor: this) => boolean, thisArg?: unknown): [Containor<K, V>, Containor<K, V>] {
        if (!is.function(predicate)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(thisArg)) predicate = predicate.bind(thisArg)

        const results: [Containor<K, V>, Containor<K, V>] = [
            new this.constructor[Symbol.species]<K, V>(),
            new this.constructor[Symbol.species]<K, V>(),
        ];
        for (const [key, val] of this) {
            if (predicate(val, key, this)) {
                results[0].set(key, val);
            } else {
                results[1].set(key, val);
            }
        }
        return results;
    }

    override delete(key: K): boolean {
        const result = super.delete(key)
        if (result) this.emitIfHasListeners('delete', [key])
        return result;
    }

    public deleteMany(keys: K[]): number {
        let deletedCount = 0;
        for (const key of keys) {
            if (this.delete(key)) deletedCount++;
        }
        return deletedCount;
    }

    public sweep(predicate: (value: V, key: K, containor: this, deletedCount: number) => boolean): number;
    public sweep<T>(predicate: (this: T, value: V, key: K, containor: this, deletedCount: number) => boolean, thisArg: T): number;
    public sweep(predicate: (value: V, key: K, containor: this, deletedCount: number) => boolean, thisArg?: unknown): number {
        if (!is.function(predicate)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(thisArg)) predicate = predicate.bind(thisArg)

        let deletedCount: number = 0;
        for (const [key, val] of this) {
            if (predicate(val, key, this, deletedCount) && this.delete(key)) deletedCount++
        }
        return deletedCount;
    }

    public flatMap<T>(mapper: (value: V, key: K, containor: this) => Containor<K, T>): Containor<K, T>;
    public flatMap<T, This>(mapper: (this: This, value: V, key: K, containor: this) => Containor<K, T>, arg: This): Containor<K, T>;
    public flatMap<T>(mapper: (value: V, key: K, containor: this) => Containor<K, T>, arg?: unknown): Containor<K, T> {
        const containors = this.map(mapper, arg);
        return new this.constructor[Symbol.species]<K, T>().concat(...containors);
    }

    //! talvez mudar o nome
    public mapValues<T>(mapper: (value: V, key: K, containor: this) => T): Containor<K, T>;
    public mapValues<This, T>(mapper: (this: This, value: V, key: K, containor: this) => T, arg: This): Containor<K, T>;
    public mapValues<T>(mapper: (value: V, key: K, containor: this) => T, arg?: unknown): Containor<K, T> {
        if (!is.undefined(arg)) mapper = mapper.bind(arg);
        const con = new this.constructor[Symbol.species]<K, T>();
        for (const [key, val] of this) con.set(key, mapper(val, key, this));
        return con;
    }

    public map<T>(mapper: (value: V, key: K, containor: this) => T): T[];
    public map<This, T>(mapper: (this: This, value: V, key: K, containor: this) => T, arg: This): T[];
    public map<T>(mapper: (value: V, key: K, containor: this) => T, arg?: any): ContainorArray<T> {
        if (!is.function(mapper)) throw new Error('Provided argument is not a function.')
        if (!is.undefined(arg)) mapper = mapper.bind(arg)
        const entries = this.entries()
        return ContainorArray.from({ length: this.size }, (): T => {
            const [key, value] = entries.next().value as [K, V]
            return mapper(value, key, this)
        })
    }

    public some(predicate: (value: V, key: K, containor: this) => boolean): boolean;
    public some<T>(predicate: (this: T, value: V, key: K, containor: this) => boolean, thisArg: T): boolean;
    public some(predicate: (value: V, key: K, containor: this) => boolean, arg?: any): boolean {
        if (!is.function(predicate)) throw new Error('Provided argument is not a function.');
        if (!is.undefined(arg)) predicate = predicate.bind(arg);
        for (const [key, value] of this) if (predicate(value, key, this)) return true;
        return false;
    }

    public every<K2 extends K>(predicate: (value: V, key: K, containor: this) => key is K2): this is Containor<K2, V>;
    public every<V2 extends V>(predicate: (value: V, key: K, containor: this) => value is V2): this is Containor<K, V2>;
    public every(predicate: (value: V, key: K, containor: this) => boolean): boolean;
    public every<This, K2 extends K>(predicate: (this: This, value: V, key: K, containor: this) => key is K2, arg: This): this is Containor<K2, V>;
    public every<This, V2 extends V>(predicate: (this: This, value: V, key: K, containor: this) => value is V2, arg: This): this is Containor<K, V2>;
    public every<This>(predicate: (this: This, value: V, key: K, containor: this) => boolean, thisArg: This): boolean;
    public every(predicate: (value: V, key: K, containor: this) => boolean, arg?: any): boolean {
        if (!is.function(predicate)) throw new Error('Provided argument is not a function.');
        if (!is.undefined(arg)) predicate = predicate.bind(arg);
        for (const [key, value] of this) if (!predicate(value, key, this)) return false;
        return true;
    }

    public reduce<T>(mapper: (accumulator: T, value: V, key: K, containor: this) => T, initialValue?: T): T {
        const iterator = this.entries();

        let accumulator: T;

        if (is.undefined(initialValue)) {
            const first = iterator.next();
            if (first.done) throw new TypeError('Reduce of empty Containor with no initial value.');
            accumulator = first.value[1] as unknown as T;
        } else {
            accumulator = initialValue;
        }

        for (let current = iterator.next(); !current.done; current = iterator.next()) {
            const [key, value] = current.value;
            accumulator = mapper(accumulator, value, key, this);
        }

        return accumulator;
    }

    public each(fn: (value: V, key: K, containor: this) => void): this;
    public each<T>(fn: (this: T, value: V, key: K, containor: this) => void, arg: T): this;
    public each(fn: (value: V, key: K, containor: this) => void, arg?: unknown): this {
        this.forEach(fn as (value: V, key: K, map: Map<K, V>) => void, arg);
        return this;
    }

    public tap(fn: (containor: this) => void): this;
    public tap<T>(fn: (this: T, containor: this) => void, arg: T): this;
    public tap(fn: (containor: this) => void, arg?: unknown): this {
        if (!is.undefined(arg)) fn = fn.bind(arg);
        fn(this);
        return this;
    }

    public sort(compareFn?: ComparatorFunction<K, V>): Containor<K, V> {
        if (super.size <= 1) return this;
        if (!is.function(compareFn)) compareFn = (firstValue: V, secondValue: V): number => Number(firstValue > secondValue) || Number(firstValue === secondValue) - 1;
        const entries = [...super.entries()]
        entries.sort((X, Y) => compareFn(X[1], Y[1], X[0], Y[0]))
        this.replace(entries)
        return this;
    }

    slice(start: number, end: number = super.size): Containor<K, V> {
        const size = super.size

        start = Math.trunc(start)
        end = Math.trunc(end)

        if (start < 0) start += size
        if (end < 0) end += size

        start = Math.max(0, start)
        end = Math.min(size, end)

        if (start >= end) return new Containor()

        const result = new Containor<K, V>()

        let index = 0;

        for (const [key, value] of this) {
            if (index >= end) break;
            if (index >= start) result.set(key, value);
            index++
        }

        return result
    }

    public splice(start: number, deleteCount?: number, ...items: EntryTuple<K, V>[]): Containor<K, V> {
        if (deleteCount === 0 && items?.length === 0) return new Containor()
        const entries = Array.from(this.entries())

        start = Number.isFinite(start) ? Math.trunc(start) : 0
        if (start < 0) start = Math.max(start + entries.length, 0)
        if (start > entries.length) start = entries.length

        deleteCount = is.number(deleteCount) ? Math.max(0, Math.min(deleteCount, entries.length - start)) : entries.length - start;

        const removedEntries = entries.splice(start, deleteCount, ...items)
        super.clear()
        this.#applyEntries(entries)
        if (removedEntries.length > 0) this.emitIfHasListeners('delete', removedEntries.map(([k, v]) => k))
        if (items?.length > 0) this.emitIfHasListeners('add', items)
        return Containor.from(removedEntries)
    }

    public rename(oldKey: K, newKey: K): this {
        if (!this.has(oldKey)) throw new ReferenceError(`Key "${String(oldKey)}" does not exist in the Containor`);
        if (!newKey) throw new Error('New key must be provided and cannot be falsy');
        if (this.has(newKey)) throw new Error(`Key "${String(newKey)}" already exists in the Containor`);

        const value = this.get(oldKey)!;

        try {
            super.set(newKey, value);
            super.delete(oldKey);

            if (!this.has(newKey) || this.has(oldKey)) throw new Error('Internal integrity check failed after renaming');

            this.emitIfHasListeners('update', [[oldKey, value]], [[newKey, value]]);
            return this;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            super.delete(newKey);
            super.set(oldKey, value);
            throw new Error(`Failed to rename key "${String(oldKey)}" to "${String(newKey)}": ${errorMessage}`);
        }
    }


    override set(key: K, value: V): this
    override set(entry: EntryObject<K, V>): this
    override set(keyOrEntry: K | EntryObject<K, V>, value?: V): this {
        if (is.undefined(keyOrEntry)) throw new Error('Key cannot be undefined.')
        if (is.entryObject(keyOrEntry)) return this.set(keyOrEntry.key, keyOrEntry.value)

        const finalValue = value as V
        const keyAndListenerExists = this.has(keyOrEntry) && this.hasListeners('update')
        const oldValue = keyAndListenerExists ? this.get(keyOrEntry) : undefined;

        super.set(keyOrEntry, finalValue)

        if (keyAndListenerExists) {
            this.emitIfHasListeners('update', [[keyOrEntry, finalValue]], [[keyOrEntry, oldValue as V]])
        } else {
            this.emitIfHasListeners('add', [[keyOrEntry, finalValue]])
        }

        return this
    }

    override clear(): void;
    override clear(): void;
    override clear(): void {
        const size = super.size
        super.clear()
        this.emitIfHasListeners('clear', size)
        return;
    }

    public replace(entries: EntryArray<K, V>): this {
        if (!is.entryArray<K, V>(entries)) throw new TypeError('Containor.replace: invalid entries')

        super.clear()
        for (const [k, v] of entries) super.set(k, v)

        this.emitIfHasListeners('replace', entries)

        return this;
    }

    public getAll(...keys: K[]): Containor<K, V> {
        if (!Array.isArray(keys) || keys.length === 0) return new Containor<K, V>();
        const result = new Containor<K, V>();
        keys.forEach(k => {
            if (this.has(k)) result.set(k, this.get(k) as V)
        })
        return result;

    }

    override has(key: K): boolean;
    override has(...key: K[]): Containor<K, boolean>;
    override has(...key: K[]): boolean | Containor<K, boolean> {
        if (key.length === 0) return false
        if (key.length === 1) return super.has(key[0])
        const result = new Containor<K, boolean>();
        key.forEach(k => result.set(k, super.has(k)))
        return result;
    }

    public hasAny(...keys: K[]): boolean {
        if (!Array.isArray(keys) || keys.length === 0) return false;
        return keys.some(v => super.has(v));
    }

    public hasAll(...keys: K[]): boolean {
        if (!Array.isArray(keys) || keys.length === 0) return false;
        return keys.every(v => super.has(v));
    }

    public toJSON(): Record<string, V> {
        const obj: Record<string, V> = {}
        for (const [k, v] of this) obj[String(k)] = v
        return obj;
    }

    public valuesFlow(options?: ContainorFlowOptions): ContainorFlow<V> {
        return new ContainorFlow<V>(() => super.values(), options)
    }

    public keysFlow(options?: ContainorFlowOptions): ContainorFlow<K> {
        return new ContainorFlow<K>(() => super.keys(), options)
    }

    public entriesFlow(options?: ContainorFlowOptions): ContainorFlow<[K, V]> {
        return new ContainorFlow<[K, V]>(() => super.entries(), options)
    }

    public clone(): Containor<K, V> {
        return new this.constructor[Symbol.species]<K, V>(this)
    }

    public concat<K2 = K, V2 = V>(...interables: Iterable<readonly [K2, V2]>[]): Containor<K | K2, V | V2> {
        const con = new this.constructor[Symbol.species]<K | K2, V | V2>(this);
        for (const iterablePair of interables) for (const [k, v] of iterablePair) con.set(k, v);
        return con;
    }

    public union<K2 = K, V2 = V>(interable: Iterable<readonly [K2, V2]>): Containor<K | K2, V | V2> {
        const con = new this.constructor[Symbol.species]<K | K2, V | V2>(this);
        for (const [k, v] of interable) if (!con.has(k)) con.set(k, v);
        return con;
    }

    public intersection(other: Containor<K, unknown> | Map<K, unknown> | Set<K>): Containor<K, V> {
        const con = new this.constructor[Symbol.species]<K, V>();
        for (const [k, v] of this) if (other.has(k)) con.set(k, v);
        return con;
    }

    public difference(other: Containor<K, unknown> | Map<K, unknown> | Set<K>): Containor<K, V> {
        const con = new this.constructor[Symbol.species]<K, V>();
        for (const [k, v] of this) if (!other.has(k)) con.set(k, v);
        return con;
    }

    public symmetricDifference<V2 = V>(other: Containor<K, V2> | Map<K, V2>): Containor<K, V | V2> {
        const con = new this.constructor[Symbol.species]<K, V | V2>();
        for (const [k, v] of this) if (!other.has(k)) con.set(k, v);
        for (const [k, v] of other) if (!this.has(k)) con.set(k, v);
        return con;
    }

    public isSubsetOf(other: Containor<K, unknown> | Map<K, unknown> | Set<K>): boolean {
        if (this.size > other.size) return false;
        for (const key of this.keys()) if (!other.has(key)) return false;
        return true;
    }

    public isSupersetOf(other: Containor<K, unknown> | Map<K, unknown> | Set<K>): boolean {
        if (this.size < other.size) return false;
        for (const key of other.keys()) if (!this.has(key)) return false;
        return true;
    }

    public isDisjointFrom(other: Containor<K, unknown> | Map<K, unknown> | Set<K>): boolean {
        const source = this.size <= other.size ? this : other;
        const target = source === this ? other : this;
        for (const key of source.keys()) if (target.has(key)) return false;
        return true;
    }

    public merge(source: unknown, resolver?: ResolverFunction<K, V>): this {
        const entries = Containor.entriesFrom<K, V>(source)

        if (entries.length <= 0) throw new Error('Invalid source: cannot be converted to entries')

        const { added, updated, oldValues } = this.#applyEntries(entries, resolver, !this.hasListeners(['add', 'update']))

        if (added.length > 0) this.emitIfHasListeners('add', added)
        if (updated.length > 0) this.emitIfHasListeners('update', updated, oldValues)

        return this
    }

    public static entriesFrom<K, V>(source: unknown): [K, V][] {
        if (is.entryArray<K, V>(source)) return source;
        if (source instanceof Map || source instanceof Containor) return Array.from(source.entries())
        if (is.iterable(source)) return [...source].map((v, i) => [i, v]) as [K, V][]
        if (source && typeof source === 'object') return Object.entries(source) as [K, V][]
        return [];
    }

    public static is<K, V>(v: unknown): v is Containor<K, V> {
        return v instanceof Containor;
    }

    override get [Symbol.toStringTag](): string {
        return 'Containor';
    }

    async *[Symbol.asyncIterator](): AsyncIterableIterator<[K, V]> {
        for (const entry of this) {
            yield entry
        }
    }

    public static from<K, V>(source: Iterable<EntryTuple<K, V>> | ArrayLike<EntryTuple<K, V>>): Containor<K, V>
    public static from<V>(source: Iterable<V> | ArrayLike<V>): Containor<number, V>
    public static from(source: { length: number }): Containor<number, undefined>
    public static from<K, V>(
        source: Iterable<EntryTuple<K, V>> | ArrayLike<EntryTuple<K, V>>,
        mapFn: (key: K, value: V, index: number) => EntryTuple<K, V> | EntryObject<K, V> | V,
        thisArg?: unknown
    ): Containor<K, V>
    public static from<K, V>(
        source: Iterable<V> | ArrayLike<V>,
        mapFn: (key: number, value: V, index: number) => EntryTuple<K, V> | EntryObject<K, V> | V,
        thisArg?: unknown
    ): Containor<K, V>
    public static from<K, V>(
        source: Iterable<EntryTuple<K, V>> | ArrayLike<EntryTuple<K, V>> | Iterable<V> | ArrayLike<V> | { length: number },
        mapFn?: (key: K | number, value: V | undefined, index: number) => EntryTuple<K, V> | EntryObject<K, V> | V,
        thisArg?: unknown
    ): Containor<K | number, V | undefined> {

        const con = new Containor<K | number, V | undefined>()

        const mappedFunction = mapFn ? mapFn.bind(thisArg) : undefined

        if ((!is.entryArray<K, V>(source) && is.array(source)) || (is.plainObject(source) && "length" in source && Object.keys(source).length == 1)) {
            const length = Number(source.length) || 0

            for (let index = 0; index < length; index++) {
                const item = is.array<V>(source) ? source[index] : undefined
                if (!mappedFunction) {
                    //previnir que não transforme ['a', 'b', 'c', 'd'] -> Map(3) { 0 => 'a', 1 => 'b', 'c' => 'd' }
                    con.set(index, item);
                    continue;
                }

                const value = mappedFunction(index, item, index) || item

                if (is.entry<K, V>(value)) con.set(value[0], value[1])
                else if (is.entryObject<K, V>(value)) con.set(value.key, value.value)
                else con.set(index, value)
            }

            return con
        }

        if (is.iterable<V | EntryTuple<K, V>>(source)) {
            let index = 0

            for (const item of source) {

                if (is.entry<K, V>(item)) {
                    const value = mappedFunction ? mappedFunction(item[0], item[1], index) : item

                    if (is.entry<K, V>(value)) con.set(value[0], value[1])
                    else if (is.entryObject<K, V>(value)) con.set(value.key, value.value)
                    else con.set(item[0], value)

                } else {
                    const value = mappedFunction ? mappedFunction(index, item, index) : item

                    if (is.entry<K, V>(value)) con.set(value[0], value[1])
                    else if (is.entryObject<K, V>(value)) con.set(value.key, value.value)
                    else con.set(index, value)
                }

                index++
            }

            return con
        }

        return con
    }


    #applyEntries(
        entries: EntryArray<K, V>,
        resolver?: ResolverFunction<K, V>,
        skipSaving: boolean = false
    ): { added: EntryArray<K, V>, updated: EntryArray<K, V>, oldValues: EntryArray<K, V> } {
        if (!is.entryArray<K, V>(entries)) throw new Error("Invalid entries: must be an array of [key, value] tuples")

        const added: EntryArray<K, V> = []
        const updated: EntryArray<K, V> = []
        const oldValues: EntryArray<K, V> = []
        resolver = is.function(resolver) ? resolver : undefined;

        for (const [key, value] of entries) {

            const existingValue = this.get(key)
            const decision: SetDecision<K, V> = resolver ? resolver(key, value, existingValue, this) : { action: 'set', value }

            if (!is.plainObject(decision)) throw new Error('Resolver must return an object with an "action" property of either "set" or "skip"')

            if (resolver && (!('action' in decision) ||
                !is.string(decision.action) ||
                (decision.action !== 'set' && decision.action !== 'skip'))) {
                throw new Error('Resolver must return an object with an "action" property of either "set" or "skip"')
            }

            if (decision.action === 'skip') continue;

            if (resolver && !('value' in decision)) {
                throw new Error('Resolver must return an object with a "value" property when action is "set"')
            }

            const finalKey = decision.key ?? key

            if (!skipSaving) {

                if (this.has(finalKey)) {
                    oldValues.push([finalKey, this.get(finalKey) as V])
                    updated.push([finalKey, decision.value])
                } else {
                    added.push([finalKey, decision.value])
                }
            }

            super.set(finalKey, decision.value)
        }

        return { added, updated, oldValues };
    }

    #getAt<T>(index: number, iterable: Iterable<T>): T | undefined {
        if (!is.number(index) || !Number.isFinite(index)) throw new Error('Index must be a number.')
        const size = super.size;
        if (size === 0) return undefined;

        index = Math.trunc(index)

        if (index < 0) index += size
        if (index < 0 || index >= size) return undefined

        let current = 0

        for (const item of iterable) {
            if (current++ === index) {
                return item
            }
        }

        return undefined
    }

    #getLast<T, TResult>(
        amount: number | undefined,
        iterable: Iterable<T>,
        createContainor: (items: T[] | Iterable<T>) => TResult,
        negativeHandler: (amount: number) => T | TResult | undefined,
    ): T | TResult | undefined {
        const size = super.size;
        if (size === 0) return undefined

        const count = Number.isFinite(amount) ? Math.trunc(amount!) : 1
        if (count >= size) return createContainor(iterable)
        if (count < 0) return negativeHandler(-count)

        if (count === 1) {
            let last: T | undefined

            for (const item of iterable) {
                last = item
            }

            return last
        }

        const result: T[] = new Array(count)

        let writeIndex = 0
        let total = 0

        for (const item of iterable) {
            result[writeIndex] = item
            writeIndex = (writeIndex + 1) % count
            total++
        }

        const start = total % count;

        return createContainor([...result.slice(start), ...result.slice(0, start)])
    }

    #getFirst<T, TResult>(
        amount: number | undefined,
        iterable: Iterable<T>,
        createContainor: (items: T[] | Iterable<T>) => TResult,
        negativeHandler: (amount: number) => T | TResult | undefined
    ): T | TResult | undefined {
        const size = super.size
        if (size === 0) return undefined

        const count = Number.isFinite(amount) ? Math.trunc(amount!) : 1
        if (count >= size) return createContainor(iterable)
        if (count < 0) return negativeHandler(-count)

        const iterator = iterable[Symbol.iterator]()

        if (count === 1) return iterator.next().value

        const result: T[] = []

        for (let i = 0; i < count; i++) {
            const entry = iterator.next()

            if (entry.done) {
                break
            }

            result.push(entry.value)
        }

        return createContainor(result)
    }

    #getRandom<T, TResult>(amount: number | undefined, iterable: Iterable<T>, createContainor: (items: T[]) => TResult): TResult | undefined {
        const size = super.size
        if (size === 0) return undefined
        const entries = [...iterable]

        const count = Math.min(
            Number.isFinite(amount) ? Math.trunc(amount!) : 1,
            entries.length
        )

        for (let i = 0; i < count; i++) {
            const randomIndex =
                i + Math.floor(Math.random() * (entries.length - i));

            [entries[i], entries[randomIndex]] = [
                entries[randomIndex],
                entries[i]
            ]
        }

        return createContainor(entries.slice(0, count))
    }
}
