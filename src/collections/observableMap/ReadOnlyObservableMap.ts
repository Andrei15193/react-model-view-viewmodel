import type { IMapChange } from "./IMapChange";
import type { IMapChangedEvent } from "./IMapChangedEvent";
import type { IReadOnlyObservableMap } from "./IReadOnlyObservableMap";
import { EventDispatcher } from "../../events";
import { ViewModel } from "../../viewModels";

/**
 * Represents a read-only observable map based on the [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) interface.
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the map contains.
 */
export class ReadOnlyObservableMap<TKey, TItem> extends ViewModel implements IReadOnlyObservableMap<TKey, TItem> {
    private _changeToken: number;
    private readonly _map: Map<TKey, TItem>;
    private readonly _mapChangedEvent: EventDispatcher<this, IMapChange<TKey, TItem>>;

    /**
     * Initializes a new instance of the {@linkcode ReadOnlyObservableMap} class.
     */
    public constructor();
    /**
     * Initializes a new instance of the {@linkcode ReadOnlyObservableMap} class.
     * @param entries The key-value pairs to initialize the map with.
     */
    public constructor(entries: Iterable<readonly [TKey, TItem]>);

    public constructor(entries?: Iterable<readonly [TKey, TItem]>) {
        super();

        this._changeToken = 0;
        this._map = new Map<TKey, TItem>(entries);
        this.mapChanged = this._mapChangedEvent = new EventDispatcher<this, IMapChange<TKey, TItem>>();
    }

    /**
     * An event that is raised when the map changed by adding or removing entries.
     */
    public readonly mapChanged: IMapChangedEvent<this, TKey, TItem>;

    /**
     * Gets the number of entries in the map.
     * @see [Map.size](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/size)
     */
    public get size(): number {
        return this._map.size;
    }

    /**
     * Gets an iterator that provides each element in the map in an key-item tupple.
     * @returns An iterator going over key-item pairs for each element in the map.
     * @see [Map.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/entries)
     */
    public [Symbol.iterator](): IterableIterator<[TKey, TItem]> {
        return this.entries();
    }

    /**
     * Gets an iterator that provides each element in the map in an key-item tupple.
     * @returns An iterator going over key-item pairs for each element in the map.
     * @see [Map.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/entries)
     */
    public entries(): IterableIterator<[TKey, TItem]> {
        var changeTokenCopy = this._changeToken;
        return new ObservableMapIterator<[TKey, TItem]>(this._map.entries(), () => changeTokenCopy !== this._changeToken);
    }

    /**
     * Gets an iterator that provides each key in the map.
     * @returns An iterator going over each key in the map.
     * @see [Map.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/keys)
     */
    public keys(): IterableIterator<TKey> {
        var changeTokenCopy = this._changeToken;
        return new ObservableMapIterator<TKey>(this._map.keys(), () => changeTokenCopy !== this._changeToken);
    }

    /**
     * Gets an iterator that provides each item in the map.
     * @returns An iterator going over each item in the map.
     * @see [Map.values](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/values)
     */
    public values(): IterableIterator<TItem> {
        var changeTokenCopy = this._changeToken;
        return new ObservableMapIterator<TItem>(this._map.values(), () => changeTokenCopy !== this._changeToken);
    }

    /**
     * Checks whether there is a value associated with the provided key.
     * @param key The key to check.
     * @returns Returns `true` if the provided key is found in the map; otherwise `false`.
     * @see [Map.has](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/has)
     */
    public has(key: TKey): boolean {
        return this._map.has(key);
    }

    /**
     * Looks up provided key and returns the associated item if one exists; otherwise `undefined`.
     * @param key The key to check.
     * @returns Returns the associated value if one can be found; otherwise `undefined`.
     * @see [Map.get](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/get)
     */
    public get(key: TKey): TItem | undefined {
        return this._map.get(key);
    }

    /**
     * Iterates over the entire map executing the `callback` for each pair.
     * @param callback The callback processing each item.
     * @see [Map.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach)
     */
    public forEach(callback: (item: TItem, key: TKey, map: this) => void): void;
    /**
     * Iterates over the entire map executing the `callback` for each pair.
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback processing each item.
     * @param thisArg A value to use as context when processing entries.
     * @see [Map.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach)
     */
    public forEach<TContext>(callback: (this: TContext, item: TItem, key: TKey, map: this) => void, thisArg: TContext): void;

    /**
     * Iterates over the entire map executing the `callback` for each pair.
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback processing each item.
     * @param thisArg A value to use as context when processing entries.
     * @see [Map.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach)
     */
    public forEach<TContext = void>(callback: (this: TContext, item: TItem, key: TKey, map: this) => void, thisArg?: TContext): void {
        const changeTokenCopy = this._changeToken;

        for (const [key, item] of this) {
            callback.call(thisArg, item, key, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Map has changed while being iterated.');
        }
    }

    /**
     * Converts the observable map to a native JavaScript [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map).
     * @returns An [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) containing all the entries in the collection.
     */
    public toMap(): Map<TKey, TItem> {
        return new Map(this._map);
    }

    /**
     * Sets the provided `item` at the given `key`. If there is an entry already exists with the given `key`, then it is replaced.
     * @param key The key to set the item at.
     * @param item The item to add to the map.
     * @returns The observable map on which the operation is performed.
     * @see [Map.set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/set)
     */
    protected set(key: TKey, item: TItem): this {
        this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

        const previousSize = this.size;
        this._map.set(key, item);

        this._mapChangedEvent.dispatch(this, {
            operation: 'set',
            addedEntries: [[key, item]],
            removedEntries: []
        });

        if (previousSize !== this.size)
            this.notifyPropertiesChanged('size');

        return this;
    }

    /**
     * Removes the entry having the given given `key` from the map.
     * @param key The key identifying the entry to remove.
     * @returns Returns `true` if an entry was found and removed from the map; otherwise `false`.
     * @see [Map.delete](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/delete)
     */
    protected delete(key: TKey): boolean {
        const removedItem = this._map.get(key);
        const wasItemRemoved = this._map.delete(key);

        if (wasItemRemoved) {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            this._mapChangedEvent.dispatch(this, {
                operation: 'delete',
                addedEntries: [],
                removedEntries: [[key, removedItem]]
            });
            this.notifyPropertiesChanged('size');
        }

        return wasItemRemoved;
    }

    /**
     * Empties the map of all entries.
     * @see [Map.clear](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/clear)
     */
    protected clear(): void {
        this._changeToken = 1;
        // throw new Error("Method not implemented.");
    }
}

class ObservableMapIterator<TItem, TValue = TItem> implements Iterator<TValue, TValue, void> {
    private _completed: boolean;
    private readonly _iterator: Iterator<TValue, TValue, void>;
    private readonly _mapChanged: () => boolean;

    public constructor(iterator: Iterator<TValue, TValue, void>, mapChanged: () => boolean) {
        this._iterator = iterator;
        this._mapChanged = mapChanged;
    }

    public [Symbol.iterator](): IterableIterator<TValue> & Iterator<TValue, TValue, void> {
        return this;
    }

    public next(): IteratorResult<TValue, TValue> {
        if (this._completed)
            return {
                done: true,
                value: undefined
            };
        else if (this._mapChanged())
            throw new Error('Map has changed while being iterated.');
        else {
            const { done = false, value } = this._iterator.next();

            if (done) {
                this._completed = true;
                return {
                    done: true,
                    value: undefined
                };
            }
            else
                return {
                    done: false,
                    value
                };
        }
    }

    public return(value?: TValue): IteratorResult<TValue, TValue> {
        this._completed = true;

        return {
            done: true,
            value
        };
    }

    public throw(): IteratorResult<TValue, TValue> {
        this._completed = true;

        return {
            done: true,
            value: undefined
        };
    }
}