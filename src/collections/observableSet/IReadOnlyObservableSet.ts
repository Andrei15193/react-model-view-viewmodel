import type { INotifyPropertiesChanged } from '../../viewModels';
import type { INotifySetChanged } from './INotifySetChanged';
import type { ISetLike } from './ISetLike';

/**
 * Represents a read-only observable set based on the [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set) interface.
 * @template TItem The type of items the set contains.
 */
export interface IReadOnlyObservableSet<TItem> extends Iterable<TItem>, ISetLike<TItem>, INotifyPropertiesChanged, INotifySetChanged<TItem> {
    /**
     * Gets the number of items in the collection.
     * @see [Set.size](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/size)
     */
    readonly size: number;

    /**
     * Gets an iterator that provides each element in the collection.
     * @returns An iterator going over each element in the collection.
     * @see [Set[@@iterator]](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/@@iterator)
     */
    [Symbol.iterator](): IterableIterator<TItem>;

    /**
     * Gets an iterator that provides each element in the collection in an item-item tupple. Items in a set are their own key.
     * @returns An iterator going over key-item pairs for each element in the collection.
     * @see [Set.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/entries)
     */
    entries(): IterableIterator<[TItem, TItem]>;

    /**
     * Gets an iterator that provides each element in the collection, this is an alias for {@linkcode values}
     * @returns An iterator going over each key in the collection.
     * @see [Set.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/keys)
     */
    keys(): IterableIterator<TItem>;

    /**
     * Gets an iterator that provides each item in the collection.
     * @returns An iterator going over each item in the collection.
     * @see [Set.values](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/values)
     */
    values(): IterableIterator<TItem>;

    /**
     * Checks whether the provided item is in the collection.
     * @param item The item to search for.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Set.has](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/has)
     */
    has(item: TItem): boolean;

    /**
     * Checks whether there are no items common in both the current set and the provided collection.
     * @param other The collection whose items to check.
     * @returns Returns `true` if there are no items common in both the current set and the provided collection; otherwise `false`.
     * @see [Set.isDisjointFrom](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/isDisjointFrom)
     */
    isDisjointFrom(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): boolean;

    /**
     * Checks whether all items from the current set are contained by the provided collection.
     * @param other The collection whose items to check.
     * @returns Returns `true` if all items in the current set are found in the provided collection; otherwise `false`.
     * @see [Set.isSubsetOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/isSubsetOf)
     */
    isSubsetOf(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): boolean;

    /**
     * Checks whether all items from the provided collection are contained by the current set.
     * @param other The collection whose items to check.
     * @returns Returns `true` if all items from the provided collection are found in the current set; otherwise `false`.
     * @see [Set.isSupersetOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/isSupersetOf)
     */
    isSupersetOf(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): boolean;

    /**
     * Generates a set that contains all items in the current one, but not in the provided collection.
     * @param other The collection whose items to exclude from the result.
     * @returns Returns a new set containing all items in the current one, but not in the provided collection.
     * @see [Set.difference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/difference)
     */
    difference(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): Set<TItem>;

    /**
     * Generates a set that contains the items contained by both the current and provided collection.
     * @param other The collection whose items to check.
     * @returns Returns a set that contains the items contained by both the current and provided collection.
     * @see [Set.intersection](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection)
     */
    intersection(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): Set<TItem>;

    /**
     * Generates a set that contains all items from both the current and the provided collection.
     * @param other The collection whose items to check.
     * @returns Returns a new set containing all items from both the current and the provided collection.
     * @see [Set.union](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/union)
     */
    union(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): Set<TItem>;

    /**
     * Generates a set that contains all items from both the current and provided collection, but are not contained by both.
     * @param other The collection whose items to check.
     * @returns Returns a new set containing all items from both the current and provided collection, but not contained by both.
     * @see [Set.symmetricDifference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/symmetricDifference)
     */
    symmetricDifference(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): Set<TItem>;

    /**
     * Iterates over the entire collections executing the `callback` for each.
     * @param callback The callback processing each item.
     * @see [Set.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach)
     */
    forEach(callback: (item: TItem, key: TItem, set: this) => void): void;
    /**
     * Iterates over the entire collections executing the `callback` for each.
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback processing each item.
     * @param thisArg A value to use as context when processing items.
     * @see [Set.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach)
     */
    forEach<TContext>(callback: (this: TContext, item: TItem, key: TItem, set: this) => void, thisArg: TContext): void;

    /**
     * Converts the observable set to a native JavaScript [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set).
     * @returns An [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set) containing all the items in the collection.
     */
    toSet(): Set<TItem>;
}