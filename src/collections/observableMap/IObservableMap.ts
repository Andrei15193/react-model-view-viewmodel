import type { IReadOnlyObservableMap } from './IReadOnlyObservableMap';

/**
 * Represents an observable map based on the [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) interface.
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the map contains.
 */
export interface IObservableMap<TKey, TItem> extends IReadOnlyObservableMap<TKey, TItem> {
    /**
     * Sets the provided `item` at the given `key`. If there is an entry already exists with the given `key`, then it is replaced.
     * @param key The key to set the item at.
     * @param item The item to add to the map.
     * @returns The observable map on which the operation is performed.
     * @see [Map.set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/set)
     */
    set(key: TKey, item: TItem): this;

    /**
     * Removes the entry having the given given `key` from the map.
     * @param key The key identifying the entry to remove.
     * @returns Returns `true` if an entry was found and removed from the map; otherwise `false`.
     * @see [Map.delete](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/delete)
     */
    delete(key: TKey): boolean;

    /**
     * Empties the map of all entries.
     * @see [Map.clear](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/clear)
     */
    clear(): void;
}