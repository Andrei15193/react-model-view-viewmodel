import type { INotifyPropertiesChanged } from '../../viewModels';
import type { INotifyCollectionChanged } from './INotifyCollectionChanged';
import type { INotifyCollectionReordered } from './INotifyCollectionReordered';

/**
 * Represents a read-only observable collection based on the [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) interface.
 * @template TItem The type of items the collection contains.
 * @see [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
 */
export interface IReadOnlyObservableCollection<TItem> extends Iterable<TItem>, ArrayLike<TItem>, INotifyPropertiesChanged, INotifyCollectionChanged<TItem>, INotifyCollectionReordered<TItem> {
    /**
     * Gets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    readonly length: number;

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @see [Indexed Collections](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Indexed_collections)
     */
    readonly [index: number]: TItem;

    /**
     * Gets an iterator that provides each element in the collection.
     * @returns An iterator going over each element in the collection.
     * @see [Array[@@iterator]](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/@@iterator)
     */
    [Symbol.iterator](): IterableIterator<TItem>;

    /**
     * Gets an iterator that provides index-item pairs for each element in the collection.
     * @returns An iterator going over index-item pairs for each element in the collection.
     * @see [Array.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/entries)
     */
    entries(): IterableIterator<[number, TItem]>;

    /**
     * Gets an iterator that provides the indexes for each element in the collection.
     * @returns An iterator going over each index in the collection.
     * @see [Array.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/keys)
     */
    keys(): IterableIterator<number>;

    /**
     * Gets an iterator that provides each element in the collection.
     * @returns An iterator going over each element in the collection.
     * @see [Array.values](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/values)
     */
    values(): IterableIterator<TItem>;

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item, accepts both positive and negative values.
     * @returns The item at the provided index.
     * @see [Array.at](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
     */
    at(index: number): TItem;

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements from the collection and having the one at the provided index replaced with the provided value.
     * @param index The index at which to set the item in the result array, accepts both positive and negative values.
     * @param value The item to set in the result array.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements of the collection having the provided value set at the provided index.
     * @see [Array.with](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/with)
     * @throws [RangeError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RangeError) Thrown when the normalized index is out of bounds.
     */
    with(index: number, item: TItem): TItem[];

    /**
     * Iterates over the entire collections executing the `callback` for each.
     * @param callback The callback processing each item.
     * @see [Array.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    forEach(callback: (item: TItem, index: number, collection: this) => void): void;
    /**
     * Iterates over the entire collections executing the `callback` for each.
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback processing each item.
     * @param thisArg A value to use as context when processing items.
     * @see [Array.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    forEach<TContext>(callback: (this: TContext, item: TItem, index: number, collection: this) => void, thisArg: TContext): void;

    /**
     * Checks whether the provided item is in the collection.
     * @param searchElement The item to search for.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Array.includes](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
     */
    includes(item: TItem): boolean;
    /**
     * Checks whether the provided item is in the collection.
     * @param item The item to search for.
     * @param fromIndex The index from where to start the search.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Array.includes](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
     */
    includes(item: TItem, fromIndex: number): boolean;

    /**
     * Returns the first index of an item, or `-1` if none can be found.
     * @param item The item to search for.
     * @returns Returns the index where the provided `searchElement` was first found; otherwise `-1`.
     * @see [Array.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
     */
    indexOf(item: TItem): number;
    /**
     * Returns the first index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start the search, accepts both positive and negative values.
     * @returns Returns the index where the provided `searchElement` was first found; otherwise `-1`.
     * @see [Array.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
     */
    indexOf(item: TItem, fromIndex: number): number;

    /**
     * Returns the last index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @returns Returns the index where the provided `searchElement` was last found; otherwise `-1`.
     * @see [Array.lastIndexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     */
    lastIndexOf(searchElement: TItem): number;
    /**
     * Returns the last index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start searching backwards.
     * @returns Returns the index where the provided `searchElement` was last found; otherwise `-1`.
     * @see [Array.lastIndexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     */
    lastIndexOf(searchElement: TItem, fromIndex: number): number;

    /**
     * Returns the index of the first item that satisfies the given condition.
     * @param predicate The callback performing the item check.
     * @returns Returns the index of the first item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
     */
    findIndex<TContext>(predicate: (item: TItem, index: number, collection: this) => boolean): number;
    /**
     * Returns the index of the first item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the index of the first item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
     */
    findIndex<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): number;

    /**
     * Returns the index of the last item that satisfies the given condition.
     * @param predicate The callback performing the item check.
     * @returns Returns the index of the last item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findLastIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex)
     */
    findLastIndex(predicate: (item: TItem, index: number, collection: this) => boolean): number;
    /**
     * Returns the index of the last item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the index of the last item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findLastIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex)
     */
    findLastIndex<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): number;

    /**
     * Returns the first item that satisfies the given condition.
     * @param predicate The callback performing the check.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    find(predicate: (item: TItem, index: number, collection: this) => boolean): TItem | undefined;
    /**
     * Returns the first item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    find<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): TItem | undefined;
    /**
     * Returns the first item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @param predicate The callback performing the check.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    find<TResult extends TItem>(predicate: (item: TItem, index: number, collection: this) => item is TResult): TResult | undefined;
    /**
     * Returns the first item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    find<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg: TContext): TResult | undefined;

    /**
     * Returns the last item that satisfies the given condition.
     * @param predicate The callback performing the check.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    findLast(predicate: (item: TItem, index: number, collection: this) => boolean): TItem | undefined;
    /**
     * Returns the last item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    findLast<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): TItem | undefined;
    /**
     * Returns the last item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @param predicate The callback performing the check.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    findLast<TResult extends TItem>(predicate: (item: TItem, index: number, collection: this) => item is TResult): TResult | undefined;
    /**
     * Returns the last item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    findLast<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg: TContext): TResult | undefined;

    /**
     * Merges the current collection with the given [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) and returns a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @param items The items to concatenate.
     * @returns Returns a new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of this collection followed by the items in the provided [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @see [Array.concat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
     */
    concat(...items: readonly (TItem | readonly TItem[])[]): TItem[];

    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) constructed by mapping each item in the collection.
     * @template TResult The type to map each item to.
     * @param callback The callback mapping each item.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the mapped items.
     * @see [Array.map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    map<TResult>(callback: (item: TItem, index: number, collection: this) => TResult): TResult[];
    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) constructed by mapping each item in the collection.
     * @template TResult The type to map each item to.
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback mapping each item.
     * @param thisArg A value to use as the callback context when mapping items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the mapped items.
     * @see [Array.map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    map<TResult, TContext>(callback: (this: TContext, item: TItem, index: number, collection: this) => TResult, thisArg: TContext): TResult[];

    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing only the items the satisfy the given collection.
     * @param predicate The callback indicating which items to add in the result [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    filter(predicate: (item: TItem, index: number, collection: this) => boolean): TItem[];
    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing only the items the satisfy the given collection.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback indicating which items to add in the result [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @param thisArg A value to use as context when evaluating items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    filter<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TItem[];
    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing only the items the satisfy the given collection.
     * @template TResult The type to convert each item to.
     * @param predicate The callback indicating which items to add in the result [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    filter<TResult extends TItem>(predicate: (item: TItem, index: number, collection: this) => item is TResult): TResult[];
    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing only the items the satisfy the given collection.
     * @template TContext The context type in which the callback is executed.
     * @template TResult The type to convert each item to.
     * @param predicate The callback indicating which items to add in the result [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @param thisArg A value to use as context when evaluating items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    filter<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg: TContext): TResult[];

    /**
     * Returns a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements starting at the provided `start` index up to, but not including, the provided `end` index.
     * @returns Returns a new array containing items from the provided `start` index up to the provided `end` index.
     * @see [Array.slice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
     */
    slice(): TItem[];
    /**
     * Returns a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements starting at the provided `start` index up to, but not including, the provided `end` index.
     * @param start The inclusive index at which to start the sub-array, accepts both positive and negative values.
     * @returns Returns a new array containing items from the provided `start` index up to the provided `end` index.
     * @see [Array.slice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
     */
    slice(start: number): TItem[];
    /**
     * Returns a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements starting at the provided `start` index up to, but not including, the provided `end` index.
     * @param start The inclusive index at which to start the sub-array, accepts both positive and negative values.
     * @param end The exclusive index at which the sub-array ends, accepts both positive and negative values.
     * @returns Returns a new array containing items from the provided `start` index up to the provided `end` index.
     * @see [Array.slice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
     */
    slice(start: number, end: number): TItem[];

    /**
     * Aggregates the contained items into a {@link String} separating them with `,` (comma) between them.
     * @returns The aggregated items as a {@link String}.
     * @see [Array.join](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
     */
    join(): string;
    /**
     * Aggregates the contained items into a {@link String} placing the provided `separator` between them.
     * @param separator The separator used to insert between items when aggregating them into a {@link String}.
     * @returns The aggregated items as a {@link String}.
     * @see [Array.join](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
     */
    join(separator: string): string;

    /**
     * Checks whether some elements in the collection satisfy a given condition.
     * @param predicate The callback performing the check for each item.
     * @returns Returns `true` if the provided `predicate` is `true` for at least one item; otherwise `false`.
     * @see [Array.some](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    some(predicate: (item: TItem, index: number, collection: this) => boolean): boolean;
    /**
     * Checks whether some elements in the collection satisfy a given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for at least one item; otherwise `false`.
     * @see [Array.some](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    some<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): boolean;

    /**
     * Checks whether all elements in the collection satisfy a given condition.
     * @param predicate The callback performing the check for each item.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
    every(predicate: (item: TItem, index: number, collection: this) => boolean): boolean;
    /**
     * Checks whether all elements in the collection satisfy a given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
    every<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): boolean;

    /**
     * Reduces the collection to a single item.
     * @param callback The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    reduce(callback: (previousItem: TItem, currentItem: TItem, currentIndex: number, collection: this) => TItem): TItem;
    /**
     * Reduces the collection to a single item.
     * @template TResult The result value type to which items are aggregated.
     * @param callback The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    reduce<TResult>(callback: (result: TResult, item: TItem, index: number, collection: this) => TResult, initialValue: TResult): TResult;

    /**
     * Reduces the collection to a single item iterating the collection from end to start.
     * @param callback The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    reduceRight(callback: (previousItem: TItem, currentItem: TItem, currentIndex: number, collection: this) => TItem): TItem;
    /**
     * Reduces the collection to a single item iterating the collection from end to start.
     * @template TResult The result value type to which items are aggregated.
     * @param callback The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    reduceRight<TResult>(callback: (result: TResult, item: TItem, index: number, collection: this) => TResult, initialValue: TResult): TResult;

    /**
     * Converts the observable collection to a native JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @returns An [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing all the items in the collection.
     */
    toArray(): TItem[];

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in reverse order.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements in reversed order.
     * @see [Array.toReversed](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed)
     */
    toReversed(): TItem[];

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in ascending order.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements sorted in ascending order.
     * @see [Array.toSorted](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
     */
    toSorted(): TItem[];
    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in ascending order.
     * @param compareCallback Optional, a callback used to determine the sort order between two items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements sorted in ascending order.
     * @see [Array.toSorted](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
     */
    toSorted(compareCallback: (a: TItem, b: TItem) => number): TItem[];

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the spliced items of the collection.
     * @param start The index from which to start removing items, accepts both positive and negative values.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) without the removed items and containing the replacements.
     * @see {@link ObservableCollection.splice}
     * @see [Array.toSpliced](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)
     */
    toSpliced(start: number): TItem[];
    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the spliced items of the collection.
     * @param start The index from which to start removing items, accepts both positive and negative values.
     * @param deleteCount The number of elements to remove.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) without the removed items and containing the replacements.
     * @see {@link ObservableCollection.splice}
     * @see [Array.toSpliced](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)
     */
    toSpliced(start: number, deleteCount: number): TItem[];
    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the spliced items of the collection.
     * @param start The index from which to start removing items, accepts both positive and negative values.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) without the removed items and containing the replacements.
     * @see {@link ObservableCollection.splice}
     * @see [Array.toSpliced](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)
     */
    toSpliced(start: number, deleteCount: number, ...items: readonly TItem[]): TItem[];
}
