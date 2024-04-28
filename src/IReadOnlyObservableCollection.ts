import type { INotifyCollectionChanged, INotifyPropertiesChanged } from './events';

/** Represents a read-only observable collection based on the read-only array interface.
 * @template TItem The type of items the collection contains.
 */

export interface IReadOnlyObservableCollection<TItem> extends Iterable<TItem>, INotifyPropertiesChanged, INotifyCollectionChanged<TItem> {
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

    entries(): IterableIterator<[number, TItem]>;
    keys(): IterableIterator<number>;
    values(): IterableIterator<TItem>;

    forEach(callback: (item: TItem, index: number, colleciton: this) => void): void;
    forEach<TContext>(callback: (this: TContext, item: TItem, index: number, colleciton: this) => void, thisArg: TContext): void;

    includes(item: TItem): boolean;
    includes(item: TItem, fromIndex: number): boolean;

    indexOf(item: TItem): number;
    indexOf(item: TItem, fromIndex: number): number;

    lastIndexOf(item: TItem): number;
    lastIndexOf(item: TItem, fromIndex: number): number;

    findIndex(callback: (item: TItem, index: number, colleciton: this) => boolean): number;
    findIndex<TContext>(callback: (this: TContext, item: TItem, index: number, colleciton: this) => boolean, thisArg: TContext): number;

    findLastIndex(callback: (item: TItem, index: number, colleciton: this) => boolean): number;
    findLastIndex<TContext>(callback: (this: TContext, item: TItem, index: number, colleciton: this) => boolean, thisArg: TContext): number;

    find(callback: (item: TItem, index: number, colleciton: this) => boolean): TItem | undefined;
    find<TContext>(callback: (this: TContext, item: TItem, index: number, colleciton: this) => boolean, thisArg: TContext): TItem | undefined;
    find<TResult extends TItem>(callback: (item: TItem, index: number, colleciton: this) => item is TResult): TResult | undefined;
    find<TResult extends TItem, TContext>(callback: (this: TContext, item: TItem, index: number, colleciton: this) => item is TResult, thisArg: TContext): TResult | undefined;

    findLast(callback: (item: TItem, index: number, colleciton: this) => boolean): TItem | undefined;
    findLast<TContext>(callback: (this: TContext, item: TItem, index: number, colleciton: this) => boolean, thisArg: TContext): TItem | undefined;
    findLast<TResult extends TItem>(callback: (item: TItem, index: number, colleciton: this) => item is TResult): TResult | undefined;
    findLast<TResult extends TItem, TContext>(callback: (this: TContext, item: TItem, index: number, colleciton: this) => item is TResult, thisArg: TContext): TResult | undefined;

    concat(...items: readonly (TItem | readonly TItem[])[]): TItem[];

    map<TResult>(callback: (item: TItem, index: number, colleciton: this) => TResult): TResult[];
    map<TResult, TContext>(callback: (this: TContext, item: TItem, index: number, colleciton: this) => TResult, thisArg: TContext): TResult[];

    filter(callback: (item: TItem, index: number, collection: this) => boolean): TItem[];
    filter<TContext>(callback: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): TItem[];
    filter<TResult extends TItem>(callback: (item: TItem, index: number, collection: this) => item is TResult): TResult[];
    filter<TResult extends TItem, TContext>(callback: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg: TContext): TResult[];

    slice(start?: number, end?: number): TItem[];

    join(separator?: string): string;

    some(callback: (item: TItem, index: number, collection: this) => boolean): boolean;
    some<TContext>(callback: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): boolean;

    every(callback: (item: TItem, index: number, collection: this) => boolean): boolean;
    every<TContext>(callback: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): boolean;

    reduce(callback: (accumulator: TItem, item: TItem, index: number, colleciton: this) => TItem): TItem;
    reduce<TResult>(callback: (accumulator: TResult, item: TItem, index: number, colleciton: this) => TItem, initialValue: TResult): TItem;

    reduceRight(callback: (accumulator: TItem, item: TItem, index: number, colleciton: this) => TItem): TItem;
    reduceRight<TResult>(callback: (accumulator: TResult, item: TItem, index: number, colleciton: this) => TItem, initialValue: TResult): TItem;

    /**
     * Converts the observable collection to a native JavaScript {@link Array}.
     * @returns An {@link Array} containing all the items in the collection.
     */
    toArray(): TItem[];

    toSorted(): TItem[];
    toSorted(compareCallback: (left: TItem, right: TItem) => number): TItem[];

    toSpliced(start: number): TItem[];
    toSpliced(start: number, deleteCount: number): TItem[];
    toSpliced(start: number, deleteCount: number, ...newItems: readonly TItem[]): TItem[];
}
