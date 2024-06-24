import type { INotifyPropertiesChanged } from "../../viewModels";
import type { INotifyMapChanged } from "./INotifyMapChanged";

/**
 * Represents a read-only observable map based on the [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) interface.
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the map contains.
 */
export interface IReadOnlyObservableMap<TKey, TItem> extends Iterable<[TKey, TItem]>, INotifyPropertiesChanged, INotifyMapChanged<TKey, TItem> {
    /**
     * Gets the number of entries in the map.
     * @see [Map.size](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/size)
     */
    readonly size: number;

    /**
     * Gets an iterator that provides each element in the map in an key-item tupple.
     * @returns An iterator going over key-item pairs for each element in the map.
     * @see [Map.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/entries)
     */
    [Symbol.iterator](): IterableIterator<[TKey, TItem]>;

    /**
     * Gets an iterator that provides each element in the map in an key-item tupple.
     * @returns An iterator going over key-item pairs for each element in the map.
     * @see [Map.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/entries)
     */
    entries(): IterableIterator<[TKey, TItem]>;

    /**
     * Gets an iterator that provides each key in the map.
     * @returns An iterator going over each key in the map.
     * @see [Map.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/keys)
     */
    keys(): IterableIterator<TKey>;

    /**
     * Gets an iterator that provides each item in the map.
     * @returns An iterator going over each item in the map.
     * @see [Map.values](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/values)
     */
    values(): IterableIterator<TItem>;

    /**
     * Checks whether there is a value associated with the provided key.
     * @param key The key to check.
     * @returns Returns `true` if the provided key is found in the map; otherwise `false`.
     * @see [Map.has](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/has)
     */
    has(key: TKey): boolean;

    /**
     * Looks up provided key and returns the associated item if one exists; otherwise `undefined`.
     * @param key The key to check.
     * @returns Returns the associated value if one can be found; otherwise `undefined`.
     * @see [Map.get](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/get)
     */
    get(key: TKey): TItem | undefined;

    /**
     * Iterates over the entire map executing the `callback` for each pair.
     * @param callback The callback processing each item.
     * @see [Map.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach)
     */
    forEach(callback: (item: TItem, key: TKey, map: this) => void): void;
    /**
     * Iterates over the entire map executing the `callback` for each pair.
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback processing each item.
     * @param thisArg A value to use as context when processing entries.
     * @see [Map.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach)
     */
    forEach<TContext>(callback: (this: TContext, item: TItem, key: TKey, map: this) => void, thisArg: TContext): void;

    /**
     * Converts the observable map to a native JavaScript [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map).
     * @returns An [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) containing all the entries in the collection.
     */
    toMap(): Map<TKey, TItem>;
}