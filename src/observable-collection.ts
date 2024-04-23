import type { ICollectionChange, ICollectionChangedEvent, INotifyCollectionChanged, INotifyPropertiesChanged } from './events';
import { EventDispatcher } from './events';
import { ViewModel } from './view-model';

/** Represents a read-only observable collection based on the read-only array interface.
 * @template TItem The type of items the collection contains.
 */
export interface IReadOnlyObservableCollection<TItem> extends Iterable<TItem>, INotifyPropertiesChanged, INotifyCollectionChanged<TItem> {
    readonly length: number;

    readonly [index: number]: TItem;

    at(index: number): TItem;
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

/** Represents an observable collection based on the array interface.
 * @template TItem The type of items the collection contains.
 */
export interface IObservableCollection<TItem> extends IReadOnlyObservableCollection<TItem> {
    /**
     * Appends new elements to the end of the collection, and returns the new length of the collection.
     * @param items New elements to add at the end of the collection.
     * @returns The new length of the collection.
     * @see [Array.push](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
     */
    push(...items: readonly TItem[]): number;

    /**
     * Removes the last element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The last element in the collection that was removed.
     * @see [Array.pop](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
    */
    pop(): TItem | undefined;

    /**
     * Inserts new elements at the start of the collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     * @returns The new length of the collection.
     * @see [Array.unshift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     */
    unshift(...items: readonly TItem[]): number;

    /**
     * Removes the first element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The first element in the collection that was removed.
     * @see [Array.shift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
    */
    shift(): TItem | undefined;

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @returns The item at the provided index.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
     */
    get(index: number): TItem;

    /**
     * Sets the provided item at the provided index.
     * @param index The index to which to set the item.
     * @param item The item to set.
     */
    set(index: number, item: TItem): void;

    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    splice(start: number, deleteCount?: number, ...items: readonly TItem[]): TItem[];

    sort(): this;
    sort(compareCallback: (left: TItem, right: TItem) => number): this;

    reverse(): this;

    copyWithin(target: number, start: number): this;
    copyWithin(target: number, start: number, end: number): this;

    fill(item: TItem): this;
    fill(item: TItem, start: number): this;
    fill(item: TItem, start: number, end: number): this;
}

/** Represents a read-only observable collection which can be used as a base class for custom observable collections as well.
 * @template TItem The type of items the collection contains.
 * @see [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
 */
export class ReadOnlyObservableCollection<TItem> extends ViewModel implements IReadOnlyObservableCollection<TItem> {
    private _length: number;
    private _changeToken: unknown;
    private readonly _collectionChangedEvent: EventDispatcher<this, ICollectionChange<TItem>>;

    /** Initializes a new instance of the {@link ReadOnlyObservableCollection} class.
     * @param items The items to initialize the collection with.
     */
    public constructor(...items: readonly TItem[]) {
        super();
        for (let index = 0; index < items.length; index++)
            Object.defineProperty(this, index, {
                configurable: true,
                enumerable: true,
                value: items[index],
                writable: false
            });
        this._length = items.length;
        this._changeToken = {};

        this.collectionChanged = this._collectionChangedEvent = new EventDispatcher<this, ICollectionChange<TItem>>();
    }

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
    */
    readonly [index: number]: TItem;

    /** An event that is raised when the collection changed. */
    public readonly collectionChanged: ICollectionChangedEvent<this, TItem>;

    /** Gets the number of items in the collection. */
    public get length(): number {
        return this._length;
    }

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @returns The item at the provided index.
     */
    public at(index: number): TItem {
        return this[index < 0 ? index + this._length : index];
    }

    /**
     * Merges the current collection with the given {@link Array} and returns a new JavaScript {@link Array}.
     * @param items The items to concatenate.
     * @returns Returns a new {@link Array} containing the items of this collection followed by the items in the provided {@link Array}.
     * @see [Array.concat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
     */
    public concat(...items: readonly (TItem | readonly TItem[])[]): TItem[] {
        throw new Error('Method not implemented.');
    }

    /** Aggregates the contained items into a {@link String} placing the provided `separator` between them.
     * @param separator The separator used to insert between items when aggregating them into a {@link String}.
     * @returns The aggregated items as a {@link String}.
     * @see [Array.join](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
     */
    public join(separator?: string): string {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns a new JavaScript {@link Array} containing the elements starting at the provided `start` index up to, but not including, the provided `end` index.
     * @param start The inclusive index at which to start the sub-array.
     * @param end The exclusive index at which the sub-array ends.
     * @returns Returns a new array containing items from the provided `start` index up to the provided `end` index.
     * @see [Array.slice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
     */
    public slice(start?: number, end?: number): TItem[] {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns the first index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start the search.
     * @returns Returns the index where the provided `searchElement` was first found; otherwise `-1`.
     * @see [Array.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
     */
    public indexOf(searchElement: TItem, fromIndex?: number): number {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns the last index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start searching backwards.
     * @returns Returns the index where the provided `searchElement` was last found; otherwise `-1`.
     * @see [Array.lastIndexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     */
    public lastIndexOf(searchElement: TItem, fromIndex?: number): number {
        throw new Error('Method not implemented.');
    }

    /**
     * Checks whether all elements in the collection fulfil a given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
    public every<TContext = undefined>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): boolean {
        throw new Error('Method not implemented.');
    }

    /**
     * Checks whether some elements in the collection fulfil a given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for at least one item; otherwise `false`.
     * @see [Array.some](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    public some<TContext = undefined>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): boolean {
        throw new Error('Method not implemented.');
    }

    /**
     * Executes the given callback for each item in the collection.
     * @template TContext The context type in which the callback is executed.
     * @param callbackfn The callback processing each item.
     * @param thisArg A value to use as context when processing items.
     * @see [Array.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    public forEach<TContext = undefined>(callbackfn: (this: TContext, item: TItem, index: number, collection: this) => void, thisArg?: TContext): void {
        throw new Error('Method not implemented.');
    }
    /**
     * Creates a new JavaScript {@link Array} constructed by mapping each item in the collection using a callback.
     * @template TResult The type to map each item to.
     * @param callbackfn The callback mapping each item.
     * @returns A new {@link Array} containing the mapped items.
     * @see [Array.map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    public map<TResult>(callbackfn: (item: TItem, index: number, collection: this) => TResult): TResult[];
    /**
     * Creates a new JavaScript {@link Array} constructed by mapping each item in the collection using a callback.
     * @template TResult The type to map each item to.
     * @template TContext The context type in which the callback is executed.
     * @param callbackfn The callback mapping each item.
     * @param thisArg A value to use as the callback context when mapping items.
     * @returns A new {@link Array} containing the mapped items.
     * @see [Array.map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    public map<TResult, TContext>(callbackfn: (this: TContext, item: TItem, index: number, collection: this) => TResult, thisArg: TContext): TResult[];
    public map<TResult, TContext = undefined>(callbackfn: (this: TContext, item: TItem, index: number, collection: this) => TResult, thisArg?: TContext): TResult[] {
        throw new Error('Method not implemented.');
    }

    /**
     * Creates a new JavaScript {@link Array} containing only the items for which the provided `predicate` evaluates to `true`.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback indicating which items to add in the result {@link Array}.
     * @param thisArg A value to use as context when evaluating items.
     * @returns A new {@link Array} containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter<TContext = undefined>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TItem[];
    /**
     * Creates a new JavaScript {@link Array} containing only the items for which the provided `predicate` evaluates to `true`.
     * @template TResult The type to convert each item to.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback indicating which items to add in the result {@link Array}.
     * @param thisArg A value to use as context when evaluating items.
     * @returns A new {@link Array} containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter<TResult extends TItem = TItem, TContext = undefined>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg?: TContext): TResult[];
    public filter<TResult extends TItem = TItem, TContext = undefined>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TResult[] {
        throw new Error('Method not implemented.');
    }

    /**
     * Aggregates the collection to a single item.
     * @param callbackfn The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    public reduce(callbackfn: (previousValue: TItem, currentItem: TItem, currentIndex: number, collection: this) => TItem): TItem;
    /**
     * Aggregates the collection to a single value.
     * @template TResult The result value type to which items are aggregated.
     * @param callbackfn The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    public reduce<TResult>(callbackfn: (previousValue: TResult, currentItem: TItem, currentIndex: number, collection: this) => TResult, initialValue: TResult): TResult;
    public reduce(callbackfn: any, initialValue?: any): any {
        throw new Error('Method not implemented.');
    }

    /**
     * Aggregates the collection to a single item by iterating the collection from end to start.
     * @param callbackfn The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    public reduceRight(callbackfn: (previousValue: TItem, currentItem: TItem, currentIndex: number, collection: this) => TItem): TItem;
    /**
     * Aggregates the collection to a single value by iterating the collection from end to start.
     * @template TResult The result value type to which items are aggregated.
     * @param callbackfn The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    public reduceRight<TResult>(callbackfn: (previousValue: TResult, currentItem: TItem, currentIndex: number, collection: this) => TResult, initialValue: TResult): TResult;
    public reduceRight(callbackfn: any, initialValue?: any): any {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns the first item for which the provided `predicate` evaluated to `true`, if no item can be found then `undefined` is returned.
     * @template TResult The type of item to return.
    * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TContext = undefined>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TItem | undefined;
    /**
     * Returns the first item for which the provided `predicate` evaluated to `true`, if no item can be found then `undefined` is returned.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TResult extends TItem = TItem, TContext = undefined>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg?: TContext): TResult | undefined;
    public find<TResult extends TItem = TItem, TContext = undefined>(predicate: (item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TResult | undefined {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns the last item for which the provided `predicate` evaluated to `true`, if no item can be found then `undefined` is returned.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    public findLast<TContext = undefined>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TItem | undefined;
    /**
     * Returns the last item for which the provided `predicate` evaluated to `true`, if no item can be found then `undefined` is returned.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    public findLast<TResult extends TItem = TItem, TContext = undefined>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg?: TContext): TResult | undefined;
    public findLast<TResult extends TItem = TItem, TContext = undefined>(predicate: (item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TResult | undefined {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns the index of the first item for which the provided `predicate` evaluated to `true`, if no item can be found then `-1` is returned.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the index of the first item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
     */
    public findIndex<TContext = undefined>(predicate: (item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): number {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns the index of the last item for which the provided `predicate` evaluated to `true`, if no item can be found then `-1` is returned.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the index of the last item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findLastIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex)
     */
    public findLastIndex<TContext = undefined>(predicate: (item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): number {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns an {@link Array} iterator containing all the index/item pairs in the collection.
     * @returns Returns an {@link Array} iterator for iterating over all index/item pairs.
     * @see [Array.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/entries)
     */
    public entries(): IterableIterator<[number, TItem]> {
        const changeTokenCopy = this._changeToken;
        return new ObservableCollectionIterator<TItem, [number, TItem]>(this, () => changeTokenCopy !== this._changeToken, index => [index, this[index]]);
    }

    /**
     * Returns an {@link Array} iterator containing all the indexes in the collection.
     * @returns Returns an {@link Array} iterator for iterating over all indexes in the collection.
     * @see [Array.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/keys)
     */
    public keys(): IterableIterator<number> {
        const changeTokenCopy = this._changeToken;
        return new ObservableCollectionIterator<TItem, number>(this, () => changeTokenCopy !== this._changeToken, index => index);
    }

    /**
     * Returns an {@link Array} iterator containing all the items in the collection.
     * @returns Returns an {@link Array} iterator for iterating over all items in the collection.
     * @see [Array.values](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/values)
     */
    public values(): IterableIterator<TItem> {
        const changeTokenCopy = this._changeToken;
        return new ObservableCollectionIterator<TItem>(this, () => changeTokenCopy !== this._changeToken, index => this[index]);
    }

    /**
     * Checks whether the provided item is contained by the collection.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start the search.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Array.includes](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
     */
    public includes(searchElement: TItem, fromIndex?: number): boolean {
        throw new Error('Method not implemented.');
    }

    /** Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in reverse order.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements in reversed order.
     * @see [Array.toReversed](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed)
     */
    public toReversed(): TItem[] {
        throw new Error('Method not implemented.');
    }

    /** Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in ascending order.
     * @param compareFn Optional, a callback used to determine the sort order between two items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) with the elements sorted in ascending order.
     * @see [Array.toSorted](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
     */
    public toSorted(compareFn?: (a: TItem, b: TItem) => number): TItem[] {
        throw new Error('Method not implemented.');
    }

    /** Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the spliced items of the collection.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) without the removed items and containing the replacements.
     * @see {@link ObservableCollection.splice}
     * @see [Array.toSpliced](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)
     */
    public toSpliced(start: number, deleteCount?: number, ...items: readonly TItem[]): TItem[] {
        throw new Error('Method not implemented.');
    }

    /** Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements from the collection and having the one at the provided index replaced with the provided value.
     * @param index The zero-based location in the collection where to set the item in the result array.
     * @param value The item to set in the result array.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements of the collection having the provided value set at the provided index.
     * @see [Array.with](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/with)
     */
    public with(index: number, value: TItem): TItem[] {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns an {@link Array} iterator containing all the items in the collection.
     * @returns Returns a new {@link Array} iterator for iterating over all items in the collection.
     * @see [Array@iterator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/@@iterator)
     */
    public [Symbol.iterator](): IterableIterator<TItem> {
        const changeTokenCopy = this._changeToken;
        return new ObservableCollectionIterator<TItem>(this, () => changeTokenCopy !== this._changeToken, index => this[index]);
    }

    /**
     * Converts the observable collection to a native JavaScript {@link Array}.
     * @returns An {@link Array} containing all the items in the collection.
     */
    public toArray(): TItem[] {
        return Array.from(this);
    }

    /**
     * Appends new elements to the end of the collection, and returns the new length of the collection.
     * @param items New elements to add at the end of the collection.
     * @returns The new length of the collection.
     * @see [Array.push](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
     */
    protected push(...items: readonly TItem[]): number {
        if (items.length > 0) {
            this._changeToken = {};
            const startIndex = this._length;

            for (let index = 0; index < items.length; index++)
                Object.defineProperty(this, startIndex + index, {
                    configurable: true,
                    enumerable: true,
                    value: items[index],
                    writable: false
                });
            this._length += items.length;

            this._collectionChangedEvent.dispatch(this, {
                operation: 'push',
                startIndex,
                addedItems: items,
                removedItems: []
            });

            const changedIndexes: number[] = [];
            for (let index = 0; index < items.length; index++)
                changedIndexes.push(startIndex + index);
            this.notifyPropertiesChanged('length', ...changedIndexes);
        }

        return this._length;
    }

    /** Removes the last element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The last element in the collection that was removed.
     * @see [Array.pop](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
    */
    protected pop(): TItem | undefined {
        if (this._length === 0)
            return undefined;
        else {
            this._changeToken = {};
            const removedIndex = this._length - 1;
            const removedItem = this[removedIndex];

            this._length--;
            delete (this as Record<number, TItem>)[removedIndex];

            this._collectionChangedEvent.dispatch(this, {
                operation: 'pop',
                startIndex: removedIndex,
                addedItems: [],
                removedItems: [removedItem]
            });
            this.notifyPropertiesChanged('length', removedIndex);

            return removedItem;
        }
    }

    /** Inserts new elements at the start of the collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     * @returns The new length of the collection.
     * @see [Array.unshift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     */
    protected unshift(...items: readonly TItem[]): number {
        if (items.length > 0) {
            this._changeToken = {};

            for (let index = this._length - 1; index >= 0; index--)
                Object.defineProperty(this, index + items.length, {
                    configurable: true,
                    enumerable: true,
                    value: this[index],
                    writable: false
                });
            for (let index = 0; index < items.length; index++)
                Object.defineProperty(this, index, {
                    configurable: true,
                    enumerable: true,
                    value: items[index],
                    writable: false
                });
            this._length += items.length;

            this._collectionChangedEvent.dispatch(this, {
                operation: 'unshift',
                startIndex: 0,
                addedItems: items,
                removedItems: []
            });

            const changedIndexes: number[] = [];
            for (let index = 0; index < this._length; index++)
                changedIndexes.push(index);
            this.notifyPropertiesChanged('length', ...changedIndexes);
        }

        return this._length;
    }

    /** Removes the first element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The first element in the collection that was removed.
     * @see [Array.shift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
     */
    protected shift(): TItem | undefined {
        if (this._length === 0)
            return undefined;
        else {
            this._changeToken = {};
            const removedItem = this[0];

            const changedIndexes: number[] = [];
            for (let index = 0; index < this._length - 1; index++) {
                changedIndexes.push(index);

                Object.defineProperty(this, index, {
                    configurable: true,
                    enumerable: true,
                    value: this[index + 1],
                    writable: false
                });
            }
            changedIndexes.push(this._length - 1);

            this._length--;
            delete (this as Record<number, TItem>)[this._length];

            this._collectionChangedEvent.dispatch(this, {
                operation: 'shift',
                startIndex: 0,
                addedItems: [],
                removedItems: [removedItem]
            });
            this.notifyPropertiesChanged('length', ...changedIndexes);

            return removedItem;
        }
    }

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @returns The item at the provided index.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
     */
    protected get(index: number): TItem {
        return this.at(index);
    }

    /**
     * Sets the provided item at the provided index.
     * @param index The index to which to set the item.
     * @param item The item to set.
     */
    protected set(index: number, item: TItem): void {
        const normalizedIndex = normalizeIndex(index, this._length);
        this._changeToken = {};

        if (normalizedIndex < this._length) {
            const removedItem = this[normalizedIndex];

            Object.defineProperty(this, normalizedIndex, {
                configurable: true,
                enumerable: true,
                value: item,
                writable: false
            });

            this._collectionChangedEvent.dispatch(this, {
                operation: 'splice',
                startIndex: normalizedIndex,
                addedItems: [item],
                removedItems: [removedItem]
            });
            this.notifyPropertiesChanged(normalizedIndex);
        }
        else {
            const fillStartIndex = this._length;
            const addedItems = [];
            const removedItems = normalizedIndex < this._length ? [this[normalizedIndex]] : [];

            for (let fillIndex = fillStartIndex; fillIndex < normalizedIndex; fillIndex++) {
                Object.defineProperty(this, fillIndex, {
                    configurable: true,
                    enumerable: true,
                    value: undefined,
                    writable: false
                });
                addedItems.push(undefined);
            }
            Object.defineProperty(this, normalizedIndex, {
                configurable: true,
                enumerable: true,
                value: item,
                writable: false
            });
            addedItems.push(item);

            this._length = normalizedIndex + 1;

            this._collectionChangedEvent.dispatch(this, {
                operation: 'splice',
                startIndex: fillStartIndex,
                addedItems,
                removedItems
            });
            this.notifyPropertiesChanged("length", normalizedIndex);
        }
    }

    /** Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    protected splice(start: number, deleteCount?: number, ...items: readonly TItem[]): TItem[] {
        throw new Error('Method not implemented.');
    }

    protected sort(): this;
    protected sort(compareCallback: (left: TItem, right: TItem) => number): this;
    protected sort(compareCallback?: (left: TItem, right: TItem) => number): this {
        throw new Error('Method not implemented.');
    }

    protected reverse(): this {
        throw new Error('Method not implemented.');
    }

    protected copyWithin(target: number, start: number): this;
    protected copyWithin(target: number, start: number, end: number): this;
    protected copyWithin(target: number, start: number, end?: number): this {
        throw new Error('Method not implemented.');
    }

    protected fill(item: TItem): this;
    protected fill(item: TItem, start: number): this;
    protected fill(item: TItem, start: number, end: number): this;
    protected fill(item: TItem, start?: number, end?: number): this {
        throw new Error('Method not implemented.');
    }
}

/** Represents an observable collection.
 * @template TItem The type of items the collection contains.
 * @see [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
 */
export class ObservableCollection<TItem> extends ReadOnlyObservableCollection<TItem> implements IObservableCollection<TItem> {
    /** Initializes a new instance of the {@link ObservableCollection} class.
     * @param items The items to initialize the collection with.
     */
    public constructor(...items: readonly TItem[]) {
        super(...items);
    }

    /**
     * Appends new elements to the end of the collection, and returns the new length of the collection.
     * @param items New elements to add at the end of the collection.
     * @returns The new length of the collection.
     * @see [Array.push](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
     */
    public push(...items: readonly TItem[]): number {
        return super.push(...items);
    }

    /** Removes the last element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The last element in the collection that was removed.
     * @see [Array.pop](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
     */
    public pop(): TItem | undefined {
        return super.pop();
    }

    /** Inserts new elements at the start of the collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     * @returns The new length of the collection.
     * @see [Array.unshift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     */
    public unshift(...items: readonly TItem[]): number {
        return super.unshift(...items);
    }

    /** Removes the first element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The first element in the collection that was removed.
     * @see [Array.shift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
     */
    public shift(): TItem | undefined {
        return super.shift();
    }

    /** Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @returns The item at the provided index.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
     */
    public get(index: number): TItem {
        return super.get(index);
    }

    /** Sets the provided item at the provided index.
     * @param index The index to which to set the item.
     * @param item The item to set.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
     */
    public set(index: number, item: TItem): void {
        super.set(index, item);
    }

    /** Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    public splice(start: number, deleteCount?: number, ...items: readonly TItem[]): TItem[] {
        return super.splice(start, deleteCount, ...items);
    }

    public sort(): this;
    public sort(compareCallback: (left: TItem, right: TItem) => number): this;
    public sort(compareCallback?: (left: TItem, right: TItem) => number): this {
        return super.sort(compareCallback);
    }

    public reverse(): this {
        return super.reverse();
    }

    public copyWithin(target: number, start: number): this;
    public copyWithin(target: number, start: number, end: number): this;
    public copyWithin(target: number, start: number, end?: number): this {
        return this.copyWithin(target, start, end);
    }

    public fill(item: TItem): this;
    public fill(item: TItem, start: number): this;
    public fill(item: TItem, start: number, end: number): this;
    public fill(item: TItem, start?: number, end?: number): this {
        return super.fill(item, start, end);
    }
}

class ObservableCollectionIterator<TItem, TValue = TItem> implements Iterator<TValue, TValue, void> {
    private _completed: boolean;
    private _index: number = 0;
    private readonly _observableCollection: IReadOnlyObservableCollection<TItem>;
    private readonly _collectionChanged: () => boolean;
    private readonly _getCurrentValue: (index: number, observableCollection: IReadOnlyObservableCollection<TItem>) => TValue;

    public constructor(observableCollection: IReadOnlyObservableCollection<TItem>, collectionChanged: () => boolean, getCurrentValue: (index: number, observableCollection: IReadOnlyObservableCollection<TItem>) => TValue) {
        this._index = 0;
        this._observableCollection = observableCollection;
        this._completed = this._index >= this._observableCollection.length;

        this._collectionChanged = collectionChanged;
        this._getCurrentValue = getCurrentValue;
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
        else if (this._collectionChanged())
            throw new Error('Collection has changed while being iterated.');
        else {
            const value = this._getCurrentValue(this._index, this._observableCollection);
            this._index++;

            this._completed = this._index >= this._observableCollection.length;

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

function normalizeIndex(index: number, length: number): number {
    return index < 0 ? Math.max(0, index + length) : index;
}