import type { IReadOnlyObservableCollection } from './IReadOnlyObservableCollection';
import type { ICollectionChange, ICollectionChangedEvent } from '../events';
import { EventDispatcher } from '../events';
import { ViewModel } from '../view-model';

/**
 * Represents a read-only observable collection based on the [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) interface.
 * This can be used both as a wrapper and as a base class for custom observable collections.
 * @template TItem The type of items the collection contains.
 * @see [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
 */
export class ReadOnlyObservableCollection<TItem> extends ViewModel implements IReadOnlyObservableCollection<TItem> {
    private _length: number;
    private _changeToken: unknown;
    private readonly _collectionChangedEvent: EventDispatcher<this, ICollectionChange<TItem>>;

    /**
     * Initializes a new instance of the {@link ReadOnlyObservableCollection} class.
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
     * @see [Indexed Collections](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Indexed_collections)
     */
    readonly [index: number]: TItem;

    /** An event that is raised when the collection changed. */
    public readonly collectionChanged: ICollectionChangedEvent<this, TItem>;

    /**
     * Gets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    public get length(): number {
        return this._length;
    }

    /**
     * Gets or sets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    protected set length(value: number) {
        if (this._length < value) {
            this._changeToken = {};

            const startIndex = this._length;
            const addedItems = [];
            const addedIndexes = [];
            for (let index = startIndex; index < value; index++) {
                addedItems.push(undefined);
                addedIndexes.push(index);
                Object.defineProperty(this, index, {
                    configurable: true,
                    enumerable: true,
                    value: undefined,
                    writable: false
                });
            }
            this._length = value;
            this._collectionChangedEvent.dispatch(this, {
                operation: 'expand',
                addedItems,
                removedItems: [],
                startIndex
            });
            this.notifyPropertiesChanged('length', ...addedIndexes);
        }
        else if (this._length > value) {
            this._changeToken = {};

            const startIndex = value;
            const removedItems = [];
            const removedIndexes = [];
            for (let index = startIndex; index < this._length; index++) {
                removedItems.push(this[index]);
                removedIndexes.push(index);
                delete (this as Record<number, TItem>)[index];
            }
            this._length = value;
            this._collectionChangedEvent.dispatch(this, {
                operation: 'contract',
                addedItems: [],
                removedItems,
                startIndex
            });
            this.notifyPropertiesChanged('length', ...removedIndexes);
        }
    }

    /**
     * Gets an iterator that provides each element in the collection.
     * @returns An iterator going over each element in the collection.
     * @see [Array[@@iterator]](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/@@iterator)
     */
    public [Symbol.iterator](): IterableIterator<TItem> {
        const changeTokenCopy = this._changeToken;

        return new ObservableCollectionIterator<TItem>(this, () => changeTokenCopy !== this._changeToken, index => this[index]);
    }

    /**
     * Gets an iterator that provides index-item pairs for each element in the collection.
     * @returns An iterator going over index-item pairs for each element in the collection.
     * @see [Array.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/entries)
     */
    public entries(): IterableIterator<[number, TItem]> {
        const changeTokenCopy = this._changeToken;
        return new ObservableCollectionIterator<TItem, [number, TItem]>(this, () => changeTokenCopy !== this._changeToken, index => [index, this[index]]);
    }

    /**
     * Gets an iterator that provides the indexes for each element in the collection.
     * @returns An iterator going over each index in the collection.
     * @see [Array.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/keys)
     */
    public keys(): IterableIterator<number> {
        const changeTokenCopy = this._changeToken;
        return new ObservableCollectionIterator<TItem, number>(this, () => changeTokenCopy !== this._changeToken, index => index);
    }

    /**
     * Gets an iterator that provides each element in the collection.
     * @returns An iterator going over each element in the collection.
     * @see [Array.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/keys)
     */
    public values(): IterableIterator<TItem> {
        const changeTokenCopy = this._changeToken;
        return new ObservableCollectionIterator<TItem>(this, () => changeTokenCopy !== this._changeToken, index => this[index]);
    }

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item, accepts both positive and negative values.
     * @returns The item at the provided index.
     * @see [Array.at](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
     */
    public at(index: number): TItem {
        return this[index < 0 ? index + this._length : index];
    }

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements from the collection and having the one at the provided index replaced with the provided value.
     * @param index The index at which to set the item in the result array, accepts both positive and negative values.
     * @param value The item to set in the result array.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements of the collection having the provided value set at the provided index.
     * @see [Array.with](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/with)
     * @throws [RangeError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RangeError) Thrown when the normalized index is out of bounds.
     */
    public with(index: number, value: TItem): TItem[] {
        if (index < -this._length || index >= this._length)
            throw new RangeError(`The provided index '${index}' is outside the bounds of the collection.`);

        const result: TItem[] = new Array(this._length);
        let normalizedIndex = index < 0 ? index + this._length : index;

        for (let itemIndex = 0; itemIndex < normalizedIndex; itemIndex++)
            result[itemIndex] = this[itemIndex];

        result[normalizedIndex] = value;

        for (let itemIndex = normalizedIndex + 1; itemIndex < this._length; itemIndex++)
            result[itemIndex] = this[itemIndex];

        return result;
    }

    /**
     * Merges the current collection with the given [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) and returns a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @param items The items to concatenate.
     * @returns Returns a new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of this collection followed by the items in the provided [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @see [Array.concat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
     */
    public concat(...items: readonly (TItem | readonly TItem[])[]): TItem[] {
        const result = this.toArray();

        items.forEach(item => {
            if (Array.isArray(item))
                result.push(...item);
            else
                result.push(item as TItem);
        });

        return result;
    };

    /**
     * Aggregates the contained items into a {@link String} separating them with `,` (comma) between them.
     * @returns The aggregated items as a {@link String}.
     * @see [Array.join](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
     */
    public join(): string;
    /**
     * Aggregates the contained items into a {@link String} placing the provided `separator` between them.
     * @param separator The separator used to insert between items when aggregating them into a {@link String}.
     * @returns The aggregated items as a {@link String}.
     * @see [Array.join](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
     */
    public join(separator: string): string;

    public join(separator?: string): string {
        return this.toArray().join(separator);
    }

    /**
     * Returns a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements starting at the provided `start` index up to, but not including, the provided `end` index.
     * @returns Returns a new array containing items from the provided `start` index up to the provided `end` index.
     * @see [Array.slice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
     */
    public slice(): TItem[];
    /**
     * Returns a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements starting at the provided `start` index up to, but not including, the provided `end` index.
     * @param start The inclusive index at which to start the sub-array, accepts both positive and negative values.
     * @returns Returns a new array containing items from the provided `start` index up to the provided `end` index.
     * @see [Array.slice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
     */
    public slice(start: number): TItem[];
    /**
     * Returns a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements starting at the provided `start` index up to, but not including, the provided `end` index.
     * @param start The inclusive index at which to start the sub-array, accepts both positive and negative values.
     * @param end The exclusive index at which the sub-array ends, accepts both positive and negative values.
     * @returns Returns a new array containing items from the provided `start` index up to the provided `end` index.
     * @see [Array.slice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
     */
    public slice(start: number, end: number): TItem[];

    public slice(start?: number, end?: number): TItem[] {
        const normalizedStartIndex = (
            start === null || start === undefined || start < -this._length
                ? 0
                : start < 0
                    ? start + this._length
                    : start
        );
        const normalizedEndIndex = (
            end === null || end === undefined || end >= this._length
                ? this._length
                : end < 0
                    ? end + this._length
                    : end
        );

        const result: TItem[] = [];
        for (let index = normalizedStartIndex; index < normalizedEndIndex; index++)
            result.push(this[index]);
        return result;
    }

    /**
     * Returns the first index of an item, or `-1` if none can be found.
     * @param item The item to search for.
     * @returns Returns the index where the provided `searchElement` was first found; otherwise `-1`.
     * @see [Array.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
     */
    public indexOf(item: TItem): number;
    /**
     * Returns the first index of an item, or `-1` if none can be found.
     * @param item The item to search for.
     * @param fromIndex The index from where to start the search, accepts both positive and negative values.
     * @returns Returns the index where the provided `searchElement` was first found; otherwise `-1`.
     * @see [Array.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
     */
    public indexOf(item: TItem, fromIndex: number): number;

    public indexOf(item: TItem, fromIndex?: number): number {
        let searchElementIndex = (
            fromIndex === null || fromIndex === undefined || fromIndex < -this._length
                ? 0
                : fromIndex < 0
                    ? fromIndex + this._length
                    : fromIndex
        );

        while (searchElementIndex < this._length && this[searchElementIndex] !== item)
            searchElementIndex++;

        if (searchElementIndex >= this._length)
            return -1;
        else
            return searchElementIndex;
    }

    /**
     * Returns the last index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @returns Returns the index where the provided `searchElement` was last found; otherwise `-1`.
     * @see [Array.lastIndexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     */
    public lastIndexOf(searchElement: TItem): number;
    /**
     * Returns the last index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start searching backwards.
     * @returns Returns the index where the provided `searchElement` was last found; otherwise `-1`.
     * @see [Array.lastIndexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     */
    public lastIndexOf(searchElement: TItem, fromIndex: number): number;

    public lastIndexOf(searchElement: TItem, fromIndex?: number): number {
        let searchElementIndex = (
            fromIndex === null || fromIndex === undefined || fromIndex >= this._length
                ? this._length - 1
                : fromIndex < 0
                    ? fromIndex + this._length
                    : fromIndex
        );

        while (searchElementIndex >= 0 && this[searchElementIndex] !== searchElement)
            searchElementIndex--;

        if (searchElementIndex < -1)
            return -1;
        else
            return searchElementIndex;
    }

    /**
     * Checks whether all elements in the collection satisfy a given condition.
     * @param predicate The callback performing the check for each item.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
    public every(predicate: (item: TItem, index: number, collection: this) => boolean): boolean;
    /**
     * Checks whether all elements in the collection satisfy a given condition.
     * @template TSpecific The specific item type the collection actually contains.
     * @param predicate The callback performing the check for each item.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
    public every<TSpecific extends TItem>(predicate: (item: TItem, index: number, collection: this) => item is TSpecific): this is ReadOnlyObservableCollection<TSpecific>;
    /**
     * Checks whether all elements in the collection satisfy a given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
    public every<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): boolean;
    /**
     * Checks whether all elements in the collection satisfy a given condition.
     * @template TSpecific The specific item type the collection actually contains.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
    public every<TSpecific extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TSpecific, thisArg: TContext): this is ReadOnlyObservableCollection<TSpecific>;

    public every<TContext = void>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): boolean {
        let result = true;
        const changeTokenCopy = this._changeToken;

        let index = 0;
        while (result && index < this._length) {
            result = predicate.call(thisArg, this[index], index, this);
            index++;

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Checks whether some elements in the collection satisfy a given condition.
     * @param predicate The callback performing the check for each item.
     * @returns Returns `true` if the provided `predicate` is `true` for at least one item; otherwise `false`.
     * @see [Array.some](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    public some(predicate: (item: TItem, index: number, collection: this) => boolean): boolean;
    /**
     * Checks whether some elements in the collection satisfy a given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for at least one item; otherwise `false`.
     * @see [Array.some](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    public some<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): boolean;

    public some<TContext = void>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): boolean {
        let result = false;
        const changeTokenCopy = this._changeToken;

        let index = 0;
        while (!result && index < this._length) {
            result = predicate.call(thisArg, this[index], index, this);
            index++;

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Iterates over the entire collections executing the `callback` for each.
     * @param callbackfn The callback processing each item.
     * @see [Array.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    public forEach(callbackfn: (item: TItem, index: number, collection: this) => void): void;
    /**
     * Iterates over the entire collections executing the `callback` for each.
     * @template TContext The context type in which the callback is executed.
     * @param callbackfn The callback processing each item.
     * @param thisArg A value to use as context when processing items.
     * @see [Array.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    public forEach<TContext>(callbackfn: (this: TContext, item: TItem, index: number, collection: this) => void, thisArg: TContext): void;

    public forEach<TContext = void>(callbackfn: (this: TContext, item: TItem, index: number, collection: this) => void, thisArg?: TContext): void {
        const changeTokenCopy = this._changeToken;

        for (let index = 0; index < this._length; index++) {
            callbackfn.call(thisArg, this[index], index, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }
    }

    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) constructed by mapping each item in the collection.
     * @template TResult The type to map each item to.
     * @param callbackfn The callback mapping each item.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the mapped items.
     * @see [Array.map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    public map<TResult>(callbackfn: (item: TItem, index: number, collection: this) => TResult): TResult[];
    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) constructed by mapping each item in the collection.
     * @template TResult The type to map each item to.
     * @template TContext The context type in which the callback is executed.
     * @param callbackfn The callback mapping each item.
     * @param thisArg A value to use as the callback context when mapping items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the mapped items.
     * @see [Array.map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    public map<TResult, TContext>(callbackfn: (this: TContext, item: TItem, index: number, collection: this) => TResult, thisArg: TContext): TResult[];

    public map<TResult, TContext = void>(callbackfn: (this: TContext, item: TItem, index: number, collection: this) => TResult, thisArg?: TContext): TResult[] {
        const changeTokenCopy = this._changeToken;
        const result = new Array<TResult>(this._length);

        for (let index = 0; index < this._length; index++) {
            result[index] = callbackfn.call(thisArg, this[index], index, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing only the items the satisfy the given collection.
     * @param predicate The callback indicating which items to add in the result [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter(predicate: (item: TItem, index: number, collection: this) => boolean): TItem[];
    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing only the items the satisfy the given collection.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback indicating which items to add in the result [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @param thisArg A value to use as context when evaluating items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TItem[];
    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing only the items the satisfy the given collection.
     * @template TResult The type to convert each item to.
     * @param predicate The callback indicating which items to add in the result [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter<TResult extends TItem>(predicate: (item: TItem, index: number, collection: this) => item is TResult): TResult[];
    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing only the items the satisfy the given collection.
     * @template TContext The context type in which the callback is executed.
     * @template TResult The type to convert each item to.
     * @param predicate The callback indicating which items to add in the result [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @param thisArg A value to use as context when evaluating items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg: TContext): TResult[];

    public filter<TResult extends TItem, TContext = void>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg?: TContext): TResult[] {
        const changeTokenCopy = this._changeToken;
        const result: TResult[] = [];

        for (let index = 0; index < this._length; index++) {
            const item = this[index];
            if (predicate.call(thisArg, item, index, this))
                result.push(item as TResult);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Reduces the collection to a single item.
     * @param callbackfn The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    public reduce(callbackfn: (previousItem: TItem, currentItem: TItem, currentIndex: number, collection: this) => TItem): TItem;
    /**
     * Reduces the collection to a single item.
     * @template TResult The result value type to which items are aggregated.
     * @param callbackfn The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    public reduce<TResult>(callbackfn: (result: TResult, item: TItem, index: number, collection: this) => TResult, initialValue: TResult): TResult;

    public reduce(callbackfn: any, initialValue?: any): any {
        if (arguments.length === 1 && this._length === 0)
            throw new Error('Cannot reduce an empty collection without providing an initial value.');

        const changeTokenCopy = this._changeToken;

        let result = arguments.length === 1 ? this[0] : initialValue;
        const startIndex = arguments.length === 1 ? 1 : 0;
        for (let index = startIndex; index < this._length; index++) {
            result = callbackfn(result, this[index], index, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Reduces the collection to a single item iterating the collection from end to start.
     * @param callbackfn The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    public reduceRight(callbackfn: (previousItem: TItem, currentItem: TItem, currentIndex: number, collection: this) => TItem): TItem;
    /**
     * Reduces the collection to a single item iterating the collection from end to start.
     * @template TResult The result value type to which items are aggregated.
     * @param callbackfn The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    public reduceRight<TResult>(callbackfn: (result: TResult, item: TItem, index: number, collection: this) => TResult, initialValue: TResult): TResult;

    public reduceRight(callbackfn: any, initialValue?: any): any {
        if (arguments.length === 1 && this._length === 0)
            throw new Error('Cannot reduce an empty collection without providing an initial value.');

        const changeTokenCopy = this._changeToken;

        let result = arguments.length === 1 ? this[this._length - 1] : initialValue;
        const startIndex = arguments.length === 1 ? this._length - 2 : this._length - 1;
        for (let index = startIndex; index >= 0; index--) {
            result = callbackfn(result, this[index], index, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Returns the first item that satisfies the given condition.
     * @param predicate The callback performing the check.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find(predicate: (item: TItem, index: number, collection: this) => boolean): TItem | undefined;
    /**
     * Returns the first item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): TItem | undefined;
    /**
     * Returns the first item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @param predicate The callback performing the check.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TResult extends TItem>(predicate: (item: TItem, index: number, collection: this) => item is TResult): TResult | undefined;
    /**
     * Returns the first item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg: TContext): TResult | undefined;

    public find<TResult extends TItem, TContext = void>(predicate: (item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TResult | undefined {
        const changeTokenCopy = this._changeToken;
        let hasResult = false;
        let index = 0;
        let result: TResult | undefined = undefined;

        while (!hasResult && index < this._length) {
            const item = this[index];
            if (predicate.call(thisArg, item, index, this)) {
                hasResult = true;
                result = item as TResult;
            }
            else
                index++;

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Returns the last item that satisfies the given condition.
     * @param predicate The callback performing the check.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    public findLast(predicate: (item: TItem, index: number, collection: this) => boolean): TItem | undefined;
    /**
     * Returns the last item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    public findLast<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): TItem | undefined;
    /**
     * Returns the last item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @param predicate The callback performing the check.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    public findLast<TResult extends TItem>(predicate: (item: TItem, index: number, collection: this) => item is TResult): TResult | undefined;
    /**
     * Returns the last item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    public findLast<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg: TContext): TResult | undefined;

    public findLast<TResult extends TItem, TContext = void>(predicate: (item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TResult | undefined {
        const changeTokenCopy = this._changeToken;
        let hasResult = false;
        let index = this._length - 1;
        let result: TResult | undefined = undefined;

        while (!hasResult && index >= 0) {
            const item = this[index];
            if (predicate.call(thisArg, item, index, this)) {
                hasResult = true;
                result = item as TResult;
            }
            else
                index--;

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Returns the index of the first item that satisfies the given condition.
     * @param predicate The callback performing the item check.
     * @returns Returns the index of the first item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
     */
    public findIndex<TContext>(predicate: (item: TItem, index: number, collection: this) => boolean): number;
    /**
     * Returns the index of the first item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the index of the first item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
     */
    public findIndex<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): number;

    public findIndex<TContext = void>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): number {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns the index of the last item that satisfies the given condition.
     * @param predicate The callback performing the item check.
     * @returns Returns the index of the last item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findLastIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex)
     */
    public findLastIndex(predicate: (item: TItem, index: number, collection: this) => boolean): number;
    /**
     * Returns the index of the last item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the index of the last item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findLastIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex)
     */
    public findLastIndex<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg: TContext): number;

    public findLastIndex<TContext = void>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): number {
        throw new Error('Method not implemented.');
    }

    /**
     * Checks whether the provided item is in the collection.
     * @param searchElement The item to search for.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Array.includes](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
     */
    public includes(searchElement: TItem): boolean;
    /**
     * Checks whether the provided item is in the collection.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start the search.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Array.includes](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
     */
    public includes(searchElement: TItem, fromIndex: number): boolean;

    public includes(searchElement: TItem, fromIndex?: number): boolean {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in reverse order.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements in reversed order.
     * @see [Array.toReversed](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed)
     */
    public toReversed(): TItem[] {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in ascending order.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) with the elements sorted in ascending order.
     * @see [Array.toSorted](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
     */
    public toSorted(): TItem[];
    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in ascending order.
     * @param compareFn Optional, a callback used to determine the sort order between two items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) with the elements sorted in ascending order.
     * @see [Array.toSorted](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
     */
    public toSorted(compareFn: (a: TItem, b: TItem) => number): TItem[];

    public toSorted(compareFn?: (a: TItem, b: TItem) => number): TItem[] {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the spliced items of the collection.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) without the removed items and containing the replacements.
     * @see {@link ObservableCollection.splice}
     * @see [Array.toSpliced](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)
     */
    public toSpliced(start: number): TItem[];
    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the spliced items of the collection.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) without the removed items and containing the replacements.
     * @see {@link ObservableCollection.splice}
     * @see [Array.toSpliced](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)
     */
    public toSpliced(start: number, deleteCount: number): TItem[];
    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the spliced items of the collection.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) without the removed items and containing the replacements.
     * @see {@link ObservableCollection.splice}
     * @see [Array.toSpliced](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)
     */
    public toSpliced(start: number, deleteCount: number, ...items: readonly TItem[]): TItem[];

    public toSpliced(start: number, deleteCount?: number, ...items: readonly TItem[]): TItem[] {
        throw new Error('Method not implemented.');
    }

    /**
     * Converts the observable collection to a native JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @returns An [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing all the items in the collection.
     */
    public toArray(): TItem[] {
        const result: TItem[] = new Array(this._length);

        for (let index = 0; index < this._length; index++)
            result[index] = this[index];

        return result;
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

    /**
     * Removes the last element from the collection and returns it. If the collection is empty, `undefined` is returned.
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

    /**
     * Inserts new elements at the start of the collection, and returns the new length of the collection.
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

    /**
     * Removes the first element from the collection and returns it. If the collection is empty, `undefined` is returned.
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
     * @see [Array.at](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
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

        if (normalizedIndex < this._length) {
            this._changeToken = {};

            const removedItem = this[normalizedIndex];

            Object.defineProperty(this, normalizedIndex, {
                configurable: true,
                enumerable: true,
                value: item,
                writable: false
            });

            this._collectionChangedEvent.dispatch(this, {
                operation: 'set',
                startIndex: normalizedIndex,
                addedItems: [item],
                removedItems: [removedItem]
            });
            this.notifyPropertiesChanged(normalizedIndex);
        }
        else {
            this._changeToken = {};

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
                operation: 'set',
                startIndex: fillStartIndex,
                addedItems,
                removedItems
            });
            this.notifyPropertiesChanged("length", normalizedIndex);
        }
    }

    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
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