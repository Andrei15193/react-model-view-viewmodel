import type { IObservableMap } from "./IObservableMap";
import { ReadOnlyObservableMap } from "./ReadOnlyObservableMap";

export class ObservableMap<TKey, TItem> extends ReadOnlyObservableMap<TKey, TItem> implements IObservableMap<TKey, TItem> {
    /**
     * Initializes a new instance of the {@linkcode ObservableMap} class.
     */
    public constructor();
    /**
     * Initializes a new instance of the {@linkcode ObservableMap} class.
     * @param entries The key-value pairs to initialize the map with.
     */
    public constructor(entries: Iterable<readonly [TKey, TItem]>);

    public constructor(entries?: Iterable<readonly [TKey, TItem]>) {
        super(entries);
    }

    /**
     * Sets the provided `item` at the given `key`. If there is an entry already exists with the given `key`, then it is replaced.
     * @param key The key to set the item at.
     * @param item The item to add to the map.
     * @returns The observable map on which the operation is performed.
     * @see [Map.set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/set)
     */
    public set(key: TKey, item: TItem): this;

    public set() {
        return super.set.apply(this, arguments);
    }

    /**
     * Removes the entry having the given given `key` from the map.
     * @param key The key identifying the entry to remove.
     * @returns Returns `true` if an entry was found and removed from the map; otherwise `false`.
     * @see [Map.delete](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/delete)
     */
    public delete(key: TKey): boolean;

    public delete() {
        return super.delete.apply(this, arguments);
    }

    /**
     * Empties the map of all entries.
     * @see [Map.clear](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/clear)
     */
    public clear(): void;

    public clear() {
        return super.clear.apply(this, arguments);
    }
}