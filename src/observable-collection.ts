import type { ICollectionChange, IEvent, IItemAddedEventArgs, IItemRemovedEventArgs, INotifyCollectionChanged, INotifyPropertiesChanged, ItemRemovedCallback } from './events';
import { DispatchEvent } from './events';
import { ViewModel } from './view-model';

/** Represents a read-only observable collection based on the read-only array interface.
 * @template TItem The type of items the collection contains.
 */
export interface IReadOnlyObservableCollection<TItem> extends Readonly<TItem[]>, INotifyPropertiesChanged, INotifyCollectionChanged<TItem> {
    /** Converts the observable collection to a native JavaScript {@link Array}.
     * @returns An {@link Array} containing all the items in the collection.
     */
    toArray(): TItem[];
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

    /** Removes the last element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The last element in the collection that was removed.
     * @see [Array.pop](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
    */
    pop(): TItem | undefined;

    /** Inserts new elements at the start of the collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     * @returns The new length of the collection.
     * @see [Array.unshift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     */
    unshift(...items: readonly TItem[]): number;

    /** Removes the first element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The first element in the collection that was removed.
     * @see [Array.shift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
    */
    shift(): TItem | undefined;

    /** Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @returns The item at the provided index.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
     */
    get(index: number): TItem;

    /** Sets the provided item at the provided index.
     * @param index The index to which to set the item.
     * @param item The item to set.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
     */
    set(index: number, item: TItem): void;

    /** Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    splice(start: number, deleteCount?: number, ...items: readonly TItem[]): TItem[];

    /** Clears the contents of the collection and returns the removed items, similar to calling `collection.splice(0)`.
     * @returns Returns the items that used to be in the collection.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    clear(): TItem[];

    /**
     * Resets the contents of the collection by clearing it and setting the provided items. Returns the new length of the collection.
     * Similar to calling `collection.splice(0, collection.length, ...items)`.
     * @param items The new content of the collection.
     * @returns The new length of the collection.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    reset(...items: readonly TItem[]): number;
}

/** Represents a read-only observable collection which can be used as a base class for custom observable collections as well.
 * @template TItem The type of items the collection contains.
 * @see [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
 */
export class ReadOnlyObservableCollection<TItem> extends ViewModel implements IReadOnlyObservableCollection<TItem> {
    private readonly _items: TItem[] = [];
    private readonly _itemCleanupCallbacks: ItemRemovedCallback<TItem>[][];
    private readonly _itemAdded: DispatchEvent<IItemAddedEventArgs<TItem>>;
    private readonly _itemRemoved: DispatchEvent<IItemRemovedEventArgs<TItem>>;
    private readonly _collectionChanged: DispatchEvent<ICollectionChange<TItem>>;

    /** Initializes a new instance of the {@link ReadOnlyObservableCollection} class.
     * @param items The items to initialize the collection with.
     */
    public constructor(...items: readonly TItem[]) {
        super();
        this._items = [...items];
        this._items.forEach((item, index) => (this as any)[index] = item);
        this._itemCleanupCallbacks = items.map(() => []);
        this.itemAdded = this._itemAdded = new DispatchEvent<IItemAddedEventArgs<TItem>>();
        this.itemRemoved = this._itemRemoved = new DispatchEvent<IItemRemovedEventArgs<TItem>>();
        this.collectionChanged = this._collectionChanged = new DispatchEvent<ICollectionChange<TItem>>();
    }

    /** Gets the item at the provided {@link n} index
     * @param n The index from which to retrieve an item.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
    */
    readonly [n: number]: TItem;

    /** An event that is raised when an item is added to the collection. */
    public readonly itemAdded: IEvent<IItemAddedEventArgs<TItem>>;

    /** An event that is raised when an item is removed from the collection. */
    public readonly itemRemoved: IEvent<IItemRemovedEventArgs<TItem>>;

    /** An event that is raised when the collection changed. */
    public readonly collectionChanged: IEvent<ICollectionChange<TItem>>;

    /** Gets the number of items in the collection. */
    public get length(): number {
        return this._items.length;
    }

    /**
     * Merges the current collection with the given {@link Array} and returns a new JavaScript {@link Array}.
     * @param items The items to concatenate.
     * @returns Returns a new {@link Array} containing the items of this collection followed by the items in the provided {@link Array}.
     * @see [Array.concat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
     */
    public concat(...items: readonly TItem[]): TItem[]
    /**
     * Merges the current collection with the given {@link Array}s and returns a new JavaScript {@link Array}.
     * @param items The item arrays to concatenate.
     * @returns Returns a new {@link Array} containing the items of this collection followed by the items in the provided {@link Array}s.
     * @see [Array.concat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
     */
    public concat(...items: readonly ConcatArray<TItem>[]): TItem[]
    public concat(...items: readonly (TItem | ConcatArray<TItem>)[]): TItem[] {
        return this._items.concat(...items);
    }

    /** Aggregates the contained items into a {@link String} placing the provided `separator` between them.
     * @param separator The separator used to insert between items when aggregating them into a {@link String}.
     * @returns The aggregated items as a {@link String}.
     * @see [Array.join](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
     */
    public join(separator?: string): string {
        return this._items.join(separator);
    }

    /**
     * Returns a new JavaScript {@link Array} containing the elements starting at the provided `start` index up to, but not including, the provided `end` index.
     * @param start The inclusive index at which to start the sub-array.
     * @param end The exclusive index at which the sub-array ends.
     * @returns Returns a new array containing items from the provided `start` index up to the provided `end` index.
     * @see [Array.slice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
     */
    public slice(start?: number, end?: number): TItem[] {
        return this._items.slice(start, end);
    }

    /**
     * Returns the first index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start the search.
     * @returns Returns the index where the provided `searchElement` was first found; otherwise `-1`.
     * @see [Array.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
     */
    public indexOf(searchElement: TItem, fromIndex?: number): number {
        return this._items.indexOf(searchElement, fromIndex);
    }

    /**
     * Returns the last index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start searching backwards.
     * @returns Returns the index where the provided `searchElement` was last found; otherwise `-1`.
     * @see [Array.lastIndexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     */
    public lastIndexOf(searchElement: TItem, fromIndex?: number): number {
        return this._items.lastIndexOf(searchElement, fromIndex);
    }

    /**
     * Checks whether all elements in the collection fulfil a given condition.
     * @param predicate The callback performing the check for each item.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
    public every(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean): boolean;
    /**
     * Checks whether all elements in the collection fulfil a given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
    public every<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean, thisArg: TContext): boolean;
    public every(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean, thisArg?: any): boolean {
        const collection = this;
        return this._items.every(function (this: any, item, index) { return predicate.call(this, item, index, collection); }, thisArg);
    }

    /**
     * Checks whether some elements in the collection fulfil a given condition.
     * @param predicate The callback performing the check for each item.
     * @returns Returns `true` if the provided `predicate` is `true` for at least one item; otherwise `false`.
     * @see [Array.some](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    public some(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean): boolean;
    /**
     * Checks whether some elements in the collection fulfil a given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for at least one item; otherwise `false`.
     * @see [Array.some](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    public some<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean, thisArg: TContext): boolean;
    public some(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean, thisArg?: any): boolean {
        const collection = this;
        return this._items.some(function (this: any, item, index) { return predicate.call(this, item, index, collection); }, thisArg);
    }

    /**
     * Executes the given callback for each item in the collection.
     * @param callbackfn The callback processing each item.
     * @see [Array.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    public forEach(callbackfn: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => void): void;
    /**
     * Executes the given callback for each item in the collection.
     * @template TContext The context type in which the callback is executed.
     * @param callbackfn The callback processing each item.
     * @param thisArg A value to use as context when processing items.
     * @see [Array.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    public forEach<TContext>(callbackfn: (this: TContext, item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => void, thisArg: TContext): void;
    public forEach(callbackfn: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => void, thisArg?: any): void {
        const collection = this;
        return this._items.forEach(function (this: any, item, index) { callbackfn.call(this, item, index, collection); }, thisArg);
    }

    /**
     * Creates a new JavaScript {@link Array} constructed by mapping each item in the collection using a callback.
     * @template TResult The type to map each item to.
     * @param callbackfn The callback mapping each item.
     * @returns A new {@link Array} containing the mapped items.
     * @see [Array.map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    public map<TResult>(callbackfn: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => TResult): TResult[];
    /**
     * Creates a new JavaScript {@link Array} constructed by mapping each item in the collection using a callback.
     * @template TResult The type to map each item to.
     * @template TContext The context type in which the callback is executed.
     * @param callbackfn The callback mapping each item.
     * @param thisArg A value to use as the callback context when mapping items.
     * @returns A new {@link Array} containing the mapped items.
     * @see [Array.map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    public map<TResult, TContext>(callbackfn: (this: TContext, item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => TResult, thisArg: TContext): TResult[];
    public map<TResult>(callbackfn: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => TResult, thisArg?: any): TResult[] {
        const collection = this;
        return this._items.map(function (this: any, item, index) { return callbackfn.call(this, item, index, collection); }, thisArg);
    }

    /**
     * Creates a new JavaScript {@link Array} containing only the items for which the provided `predicate` evaluates to `true`.
     * @param predicate The callback indicating which items to add in the result {@link Array}.
     * @returns A new {@link Array} containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean): TItem[];
    /**
     * Creates a new JavaScript {@link Array} containing only the items for which the provided `predicate` evaluates to `true`.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback indicating which items to add in the result {@link Array}.
     * @param thisArg A value to use as context when evaluating items.
     * @returns A new {@link Array} containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean, thisArg: TContext): TItem[];
    /**
     * Creates a new JavaScript {@link Array} containing only the items for which the provided `predicate` evaluates to `true`.
     * @template TResult The type to convert each item to.
     * @param predicate The callback indicating which items to add in the result {@link Array}.
     * @returns A new {@link Array} containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter<TResult extends TItem>(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => item is TResult): TResult[];
    /**
     * Creates a new JavaScript {@link Array} containing only the items for which the provided `predicate` evaluates to `true`.
     * @template TResult The type to convert each item to.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback indicating which items to add in the result {@link Array}.
     * @param thisArg A value to use as context when evaluating items.
     * @returns A new {@link Array} containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => item is TResult, thisArg: TContext): TResult[];
    public filter<TResult extends TItem>(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => item is TResult, thisArg?: any): TResult[] {
        const collection = this;
        return this._items.filter(function (this: any, item, index): item is TResult { return predicate.call(this, item, index, collection); }, thisArg);
    }

    /**
     * Aggregates the collection to a single item.
     * @param callbackfn The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    public reduce(callbackfn: (previousValue: TItem, currentItem: TItem, currentIndex: number, collection: IReadOnlyObservableCollection<TItem>) => TItem): TItem;
    /**
     * Aggregates the collection to a single value.
     * @template TResult The result value type to which items are aggregated.
     * @param callbackfn The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    public reduce<TResult>(callbackfn: (previousValue: TResult, currentItem: TItem, currentIndex: number, collection: IReadOnlyObservableCollection<TItem>) => TResult, initialValue: TResult): TResult;
    public reduce(callbackfn: any, initialValue?: any): any {
        const collection = this;
        return this._items.reduce(function (previousValue, currentItem, currentIndex) { return callbackfn.call(previousValue, currentItem, currentIndex, collection); }, initialValue);
    }

    /**
     * Aggregates the collection to a single item by iterating the collection from end to start.
     * @param callbackfn The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    public reduceRight(callbackfn: (previousValue: TItem, currentItem: TItem, currentIndex: number, collection: IReadOnlyObservableCollection<TItem>) => TItem): TItem;
    /**
     * Aggregates the collection to a single value by iterating the collection from end to start.
     * @template TResult The result value type to which items are aggregated.
     * @param callbackfn The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    public reduceRight<TResult>(callbackfn: (previousValue: TResult, currentItem: TItem, currentIndex: number, collection: IReadOnlyObservableCollection<TItem>) => TResult, initialValue: TResult): TResult;
    public reduceRight(callbackfn: any, initialValue?: any): any {
        const collection = this;
        return this._items.reduceRight(function (previousValue, currentItem, currentIndex) { return callbackfn.call(collection, previousValue, currentItem, currentIndex, collection); }, initialValue);
    }

    /**
     * Returns the first item for which the provided `predicate` evaluated to `true`, if no item can be found then `undefined` is returned.
     * @template TResult The type of item to return.
     * @param predicate The callback performing the item check.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean): TItem | undefined;
    /**
     * Returns the first item for which the provided `predicate` evaluated to `true`, if no item can be found then `undefined` is returned.
     * @template TResult The type of item to return.
    * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean, thisArg: TContext): TItem | undefined;
    /**
     * Returns the first item for which the provided `predicate` evaluated to `true`, if no item can be found then `undefined` is returned.
     * @template TResult The type of item to return.
     * @param predicate The callback performing the item check.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TResult extends TItem>(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => item is TResult): TResult | undefined;
    /**
     * Returns the first item for which the provided `predicate` evaluated to `true`, if no item can be found then `undefined` is returned.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => item is TResult, thisArg: TContext): TResult | undefined;
    public find(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean, thisArg?: any): TItem | undefined {
        const collection = this;
        return this._items.find(function (this: any, item, index): item is any { return predicate.call(this, item, index, collection); }, thisArg);
    }

    /**
     * Returns the index of the first item for which the provided `predicate` evaluated to `true`, if no item can be found then `-1` is returned.
     * @param predicate The callback performing the item check.
     * @returns Returns the index of the first item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
     */
    public findIndex(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean): number;
    /**
     * Returns the index of the first item for which the provided `predicate` evaluated to `true`, if no item can be found then `-1` is returned.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the index of the first item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
     */
    public findIndex<TContext>(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean, thisArg: TContext): number;
    public findIndex(predicate: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => boolean, thisArg?: any): number {
        const collection = this;
        return this._items.findIndex(function (this: any, item, index) { return predicate.call(this, item, index, collection); }, thisArg);
    }

    /**
     * Returns an {@link Array} iterator containing all the index/item pairs in the collection.
     * @returns Returns an {@link Array} iterator for iterating over all index/item pairs.
     * @see [Array.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/entries)
     */
    public entries(): IterableIterator<[number, TItem]> {
        return this._items.entries();
    }

    /**
     * Returns an {@link Array} iterator containing all the indexes in the collection.
     * @returns Returns an {@link Array} iterator for iterating over all indexes in the collection.
     * @see [Array.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/keys)
     */
    public keys(): IterableIterator<number> {
        return this._items.keys();
    }

    /**
     * Returns an {@link Array} iterator containing all the items in the collection.
     * @returns Returns an {@link Array} iterator for iterating over all items in the collection.
     * @see [Array.values](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/values)
     */
    public values(): IterableIterator<TItem> {
        return this._items.values();
    }

    /**
     * Checks whether the provided item is contained by the collection.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start the search.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Array.includes](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
     */
    public includes(searchElement: TItem, fromIndex?: number): boolean {
        return this._items.includes(searchElement, fromIndex);
    }

    /**
     * Returns a new JavaScript {@link Array} by mapping all items in the collection and the flattening the result by one level.
     * @template TResult The type to map each item to.
     * @param callback The callback mapping each item.
     * @returns Returns a mapped and one level flattened {@link Array}.
     * @see [Array.flatMap](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)
     */
    public flatMap<TResult>(callback: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => TResult | readonly TResult[]): TResult[];
    /**
     * Returns a new JavaScript {@link Array} by mapping all items in the collection and the flattening the result by one level.
     * @template TResult The type to map each item to.
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback mapping each item.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns a mapped and one level flattened {@link Array}.
     * @see [Array.flatMap](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)
     */
    public flatMap<TResult, TContext>(callback: (item: TItem, index: number, collection: IReadOnlyObservableCollection<TItem>) => TResult | readonly TResult[], thisArg: TContext): TResult[];
    /**
     * Returns a new JavaScript {@link Array} by mapping all items in the collection and the flattening the result by one level.
     * @template TResult The type to map each item to.
     * @param callback The callback mapping each item.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns a mapped and one level flattened {@link Array}.
     * @see [Array.flatMap](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)
     */
    public flatMap<TResult>(callback: (item: TItem, index: number, collection: any) => TResult | readonly TResult[], thisArg?: any): TResult[];
    public flatMap<TResult>(callback: (item: TItem, index: number, collection: any) => TResult | readonly TResult[], thisArg?: any): TResult[] {
        const collection = this;
        return this._items.flatMap(function (item, index) { return callback.call(this, item, index, collection); }, thisArg);
    }

    /**
     * Returns a new JavaScript {@link Array} containing the flattened sub-arrays by recursively concatenating them.
     * @param depth The number of levels to flatten.
     * @returns Returns a flattened {@link Array}.
     * @see [Array.flat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)
     */
    public flat<TContext, TDepth extends number = 1>(this: TContext, depth?: TDepth): FlatArray<TContext, TDepth>[];
    /**
     * Returns a new JavaScript {@link Array} containing the flattened sub-arrays by recursively concatenating them.
     * @template TDepth The number of levels to flatten.
     * @param depth The number of levels to flatten.
     * @returns Returns a flattened {@link Array}.
     * @see [Array.flat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)
     */
    public flat<TDepth extends number = 1>(depth?: TDepth): FlatArray<readonly TItem[], TDepth>[] {
        return this._items.flat.call(this._items, depth);
    }

    /**
     * Returns an {@link Array} iterator containing all the items in the collection.
     * @returns Returns a new {@link Array} iterator for iterating over all items in the collection.
     * @see [Array@iterator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/@@iterator)
     */
    public [Symbol.iterator](): IterableIterator<TItem> {
        return this._items[Symbol.iterator]();
    }

    /** Converts the observable collection to a native JavaScript {@link Array}.
     * @returns An {@link Array} containing all the items in the collection.
     */
    public toArray(): TItem[] {
        return [...this._items];
    }

    /**
     * Appends new elements to the end of the collection, and returns the new length of the collection.
     * @param items New elements to add at the end of the collection.
     * @returns The new length of the collection.
     * @see [Array.push](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
     */
    protected push(...items: readonly TItem[]): number {
        this._splice(this.length, 0, items);
        return this.length;
    }

    /** Removes the last element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The last element in the collection that was removed.
     * @see [Array.pop](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
    */
    protected pop(): TItem | undefined {
        const removedItems = this._splice(this.length - 1, 1, []);
        return removedItems.length > 0 ? removedItems[0] : undefined;
    }

    /** Inserts new elements at the start of the collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     * @returns The new length of the collection.
     * @see [Array.unshift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     */
    protected unshift(...items: readonly TItem[]): number {
        this._splice(0, 0, items);
        return this.length;
    }

    /** Removes the first element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The first element in the collection that was removed.
     * @see [Array.shift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
     */
    protected shift(): TItem | undefined {
        const removedItems = this._splice(0, 1, []);
        return removedItems.length > 0 ? removedItems[0] : undefined;
    }

    /** Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @returns The item at the provided index.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
     */
    protected get(index: number): TItem {
        if (index < 0 || index >= this._items.length)
            throw new RangeError('The index is outside the bounds of the collection.');

        return this[index];
    }

    /** Sets the provided item at the provided index.
     * @param index The index to which to set the item.
     * @param item The item to set.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
     */
    protected set(index: number, item: TItem): void {
        if (index < 0 || index >= this._items.length)
            throw new RangeError('The index is outside the bounds of the collection.');

        this._splice(index, 1, [item]);
    }

    /** Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    protected splice(start: number, deleteCount?: number, ...items: readonly TItem[]): TItem[] {
        return this._splice(start, deleteCount, items);
    }

    /** Clears the contents of the collection and returns the removed items, similar to calling `collection.splice(0)`.
     * @returns Returns the items that used to be in the collection.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    protected clear(): TItem[] {
        return this._splice(0, this.length, []);
    }

    /**
     * Resets the contents of the collection by clearing it and setting the provided items. Returns the new length of the collection.
     * Similar to calling `collection.splice(0, collection.length, ...items)`.
     * @param items The new content of the collection.
     * @returns The new length of the collection.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    protected reset(...items: readonly TItem[]): number {
        this._splice(0, this.length, items);
        return this.length;
    }

    private _splice(start: number, deleteCount: number, items: readonly TItem[]): TItem[] {
        if (start < 0)
            start = Math.max(0, this._items.length + start);
        else if (start > this._items.length)
            start = this._items.length;

        if (deleteCount === undefined)
            deleteCount = this._items.length - start;
        else if (deleteCount < 0)
            deleteCount = 0;

        if (items === undefined)
            items = [];

        const previousLength = this._items.length;
        if (deleteCount < items.length) {
            const gap = items.length - deleteCount;
            for (let index = this._items.length + gap; index > start + items.length; index--)
                (this as any)[index] = this[index - gap];
        }
        else if (deleteCount > items.length) {
            const gap = deleteCount - items.length;
            for (let index = start + items.length + gap; index < this._items.length; index++)
                (this as any)[index - gap] = this[index];
            for (let index = this._items.length - gap; index < this._items.length; index++)
                delete (this as any)[index];
        }
        for (let index = 0; index < items.length; index++)
            (this as any)[index + start] = items[index];

        const removedItems = this._items.splice(start, deleteCount, ...items);
        const removedItemsCallbacks = this._itemCleanupCallbacks.splice(start, deleteCount, ...items.map(() => []));
        removedItems.forEach((item, index) => {
            removedItemsCallbacks[index].forEach(callback => callback(item, index + start));
        });

        removedItems.forEach((item, index) => this._itemRemoved.dispatch(this, {
            item,
            index: index + start
        }));
        items.forEach((item, index) => this._itemAdded.dispatch(this, {
            item,
            index: index + start,
            addItemRemovalCallback: callback => this._itemCleanupCallbacks[index + start].push(callback)
        }));

        if (removedItems.length > 0 || items.length > 0)
            this._collectionChanged.dispatch(this, {
                addedItems: items.length > 0 ? new Array(start).concat(items) : items,
                removedItems: removedItems.length > 0 ? new Array(start).concat(removedItems) : removedItems
            });

        if (previousLength !== this._items.length)
            this.notifyPropertiesChanged('length');

        return removedItems;
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

    /** Clears the contents of the collection and returns the removed items, similar to calling `collection.splice(0)`.
     * @returns Returns the items that used to be in the collection.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    public clear(): TItem[] {
        return super.clear();
    }

    /**
     * Resets the contents of the collection by clearing it and setting the provided items. Returns the new length of the collection.
     * Similar to calling `collection.splice(0, collection.length, ...items)`.
     * @param items The new content of the collection.
     * @returns The new length of the collection.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    public reset(...items: readonly TItem[]): number {
        return super.reset(...items);
    }
}