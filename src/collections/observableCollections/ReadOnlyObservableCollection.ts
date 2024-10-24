import type { ICollectionChangedEvent } from './ICollectionChangedEvent';
import type { ICollectionChange } from './ICollectionChange';
import type { ICollectionReorderedEvent } from './ICollectionReorderedEvent';
import type { ICollectionReorder, ICollectionItemMove } from './ICollectionReorder';
import type { IReadOnlyObservableCollection } from './IReadOnlyObservableCollection';
import type { ObservableCollection } from './ObservableCollection';
import { EventDispatcher } from '../../events';
import { ViewModel } from '../../viewModels';

/**
 * Represents a read-only observable collection based on the [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) interface.
 * This can be used both as a wrapper and as a base class for custom observable collections.
 * @template TItem The type of items the collection contains.
 * @see [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
 */
export class ReadOnlyObservableCollection<TItem> extends ViewModel implements IReadOnlyObservableCollection<TItem> {
    private _length: number;
    private _changeToken: number;
    private readonly _collectionChangedEvent: EventDispatcher<this, ICollectionChange<TItem>>;
    private readonly _collectionReorderedEvent: EventDispatcher<this, ICollectionReorder<TItem>>;

    /**
     * Initializes a new instance of the {@linkcode ReadOnlyObservableCollection} class.
     * @param items The items to initialize the collection with.
     */
    public constructor(items?: Iterable<TItem>) {
        super();

        this._changeToken = 0;
        this._length = 0;
        if (items !== null && items !== undefined)
            for (const item of items) {
                defineIndexProperty(this, this._length, item);
                this._length++;
            }

        this.collectionChanged = this._collectionChangedEvent = new EventDispatcher<this, ICollectionChange<TItem>>();
        this.collectionReordered = this._collectionReorderedEvent = new EventDispatcher<this, ICollectionReorder<TItem>>();
    }

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @see [Indexed Collections](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Indexed_collections)
     */
    readonly [index: number]: TItem;

    /** An event that is raised when the collection changed by adding or removing items. */
    public readonly collectionChanged: ICollectionChangedEvent<this, TItem>;

    /** An event that is raised when the collection is reordered. */
    public readonly collectionReordered: ICollectionReorderedEvent<this, TItem>;

    /**
     * Gets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    public get length(): number {
        return this._length;
    }

    /**
     * Gets or sets the number of items in the collection.
     * @protected
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    protected set length(value: number) {
        if (this._length < value) {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const startIndex = this._length;
            const addedItems = new Array<TItem>(value - this._length);
            const addedIndexes = new Array<number>(addedItems.length);

            for (let index = 0; index < addedItems.length; index++) {
                const collectionIndex = index + startIndex;
                addedItems[index] = undefined!;
                addedIndexes[index] = collectionIndex;
                defineIndexProperty(this, collectionIndex, undefined);
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
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const startIndex = value;
            const removedItems = new Array<TItem>(this._length - value);
            const removedIndexes = new Array<number>(removedItems.length);

            for (let index = 0; index < removedItems.length; index++) {
                const collectionIndex = index + startIndex;
                removedItems[index] = this[collectionIndex];
                removedIndexes[index] = collectionIndex;
                delete (this as Record<number, TItem>)[collectionIndex];
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
     * @param item The item to set in the result array.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements of the collection having the provided value set at the provided index.
     * @see [Array.with](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/with)
     * @throws [RangeError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RangeError) Thrown when the normalized index is out of bounds.
     */
    public with(index: number, item: TItem): TItem[] {
        if (index < -this._length || index >= this._length)
            throw new RangeError(`The provided index '${index}' is outside the bounds of the collection.`);

        const result: TItem[] = new Array(this._length);
        let normalizedIndex = index < 0 ? index + this._length : index;

        for (let itemIndex = 0; itemIndex < normalizedIndex; itemIndex++)
            result[itemIndex] = this[itemIndex];

        result[normalizedIndex] = item;

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
     * Aggregates the contained items into a {@linkcode String} placing the provided `separator` between them.
     * @param separator The separator used to insert between items when aggregating them into a {@linkcode String}.
     * @returns The aggregated items as a {@linkcode String}.
     * @see [Array.join](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
     */
    public join(separator?: string | null): string {
        return this.toArray().join(separator!);
    }

    /**
     * Returns a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements starting at the provided `start` index up to, but not including, the provided `end` index.
     * @param start The inclusive index at which to start the sub-array, accepts both positive and negative values.
     * @param end The exclusive index at which the sub-array ends, accepts both positive and negative values.
     * @returns Returns a new array containing items from the provided `start` index up to the provided `end` index.
     * @see [Array.slice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
     */
    public slice(start?: number, end?: number): TItem[] {
        const normalizedStartIndex = normalizeStartIndex(this, start);
        const normalizedEndIndex = normalizeEndIndex(this, end);

        if (normalizedEndIndex <= normalizedStartIndex)
            return [];
        else {
            const result = new Array<TItem>(normalizedEndIndex - normalizedStartIndex);
            for (let index = 0; index < result.length; index++)
                result[index] = this[index + normalizedStartIndex];
            return result;
        }
    }

    /**
     * Returns the first index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start the search, accepts both positive and negative values.
     * @returns Returns the index where the provided `searchElement` was first found; otherwise `-1`.
     * @see [Array.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
     */
    public indexOf(searchElement: TItem, fromIndex?: number): number {
        let searchElementIndex = normalizeStartIndex(this, fromIndex);

        while (searchElementIndex < this._length && this[searchElementIndex] !== searchElement)
            searchElementIndex++;

        if (searchElementIndex >= this._length)
            return -1;
        else
            return searchElementIndex;
    }

    /**
     * Returns the last index of an item, or `-1` if none can be found.
     * @param searchElement The item to search for.
     * @param fromIndex The index from where to start searching backwards.
     * @returns Returns the index where the provided `searchElement` was last found; otherwise `-1`.
     * @see [Array.lastIndexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     */
    public lastIndexOf(searchElement: TItem, fromIndex?: number): number {
        let searchElementIndex = normalizeEndIndex(this, fromIndex);

        while (searchElementIndex >= 0 && this[searchElementIndex] !== searchElement)
            searchElementIndex--;

        if (searchElementIndex < -1)
            return -1;
        else
            return searchElementIndex;
    }

    /**
     * Checks whether all elements in the collection satisfy a given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for all items; otherwise `false`.
     * @see [Array.every](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
     */
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
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check for each item.
     * @param thisArg A value to use as context when checking items.
     * @returns Returns `true` if the provided `predicate` is `true` for at least one item; otherwise `false`.
     * @see [Array.some](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
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
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback processing each item.
     * @param thisArg A value to use as context when processing items.
     * @see [Array.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    public forEach<TContext = void>(callback: (this: TContext, item: TItem, index: number, collection: this) => void, thisArg?: TContext): void {
        const changeTokenCopy = this._changeToken;

        for (let index = 0; index < this._length; index++) {
            callback.call(thisArg, this[index], index, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }
    }

    /**
     * Creates a new JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) constructed by mapping each item in the collection.
     * @template TResult The type to map each item to.
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback mapping each item.
     * @param thisArg A value to use as the callback context when mapping items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the mapped items.
     * @see [Array.map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    public map<TResult, TContext = void>(callback: (this: TContext, item: TItem, index: number, collection: this) => TResult, thisArg?: TContext): TResult[] {
        const changeTokenCopy = this._changeToken;
        const result = new Array<TResult>(this._length);

        for (let index = 0; index < this._length; index++) {
            result[index] = callback.call(thisArg, this[index], index, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

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
     * @template TContext The context type in which the callback is executed.
     * @template TResult The type to convert each item to.
     * @param predicate The callback indicating which items to add in the result [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array).
     * @param thisArg A value to use as context when evaluating items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items for which the provided `predicate` evaluated to `true`.
     * @see [Array.filter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    public filter<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg?: TContext): TResult[];

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
     * @param callback The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    public reduce(callback: (previousItem: TItem, currentItem: TItem, currentIndex: number, collection: this) => TItem): TItem;
    /**
     * Reduces the collection to a single item.
     * @template TResult The result value type to which items are aggregated.
     * @param callback The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    public reduce<TResult>(callback: (result: TResult, item: TItem, index: number, collection: this) => TResult, initialValue: TResult): TResult;

    public reduce(callback: any, initialValue?: any): any {
        if (arguments.length === 1 && this._length === 0)
            throw new Error('Cannot reduce an empty collection without providing an initial value.');

        const changeTokenCopy = this._changeToken;

        let result = arguments.length === 1 ? this[0] : initialValue;
        const startIndex = arguments.length === 1 ? 1 : 0;
        for (let index = startIndex; index < this._length; index++) {
            result = callback(result, this[index], index, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Reduces the collection to a single item iterating the collection from end to start.
     * @param callback The callback that aggregates two items at a time.
     * @returns Returns a single aggregated item.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    public reduceRight(callback: (previousItem: TItem, currentItem: TItem, currentIndex: number, collection: this) => TItem): TItem;
    /**
     * Reduces the collection to a single item iterating the collection from end to start.
     * @template TResult The result value type to which items are aggregated.
     * @param callback The callback that aggregates one item and the previous value at a time.
     * @param initialValue The initial value when aggregating the collection.
     * @returns Returns the value containing the aggregated collection.
     * @see [Array.reduceRight](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight)
     */
    public reduceRight<TResult>(callback: (result: TResult, item: TItem, index: number, collection: this) => TResult, initialValue: TResult): TResult;

    public reduceRight(callback: any, initialValue?: any): any {
        if (arguments.length === 1 && this._length === 0)
            throw new Error('Cannot reduce an empty collection without providing an initial value.');

        const changeTokenCopy = this._changeToken;

        let result = arguments.length === 1 ? this[this._length - 1] : initialValue;
        const startIndex = arguments.length === 1 ? this._length - 2 : this._length - 1;
        for (let index = startIndex; index >= 0; index--) {
            result = callback(result, this[index], index, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return result;
    }

    /**
     * Returns the first item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TItem | undefined;
    /**
     * Returns the first item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the first item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.find](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    public find<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg?: TContext): TResult | undefined;

    public find<TResult extends TItem, TContext = void>(predicate: (item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TResult | undefined {
        const changeTokenCopy = this._changeToken;
        let foundItem = false;
        let index = 0;
        let result: TResult | undefined = undefined;

        while (!foundItem && index < this._length) {
            const item = this[index];
            if (predicate.call(thisArg, item, index, this)) {
                foundItem = true;
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
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    public findLast<TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TItem | undefined;
    /**
     * Returns the last item that satisfies the given condition.
     * @template TResult The type of item to return.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the last item for which the provided `predicate` evaluates to `true`; otherwise `undefined`.
     * @see [Array.findLast](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
     */
    public findLast<TResult extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TResult, thisArg?: TContext): TResult | undefined;

    public findLast<TResult extends TItem, TContext = void>(predicate: (item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): TResult | undefined {
        const changeTokenCopy = this._changeToken;
        let foundItem = false;
        let index = this._length - 1;
        let result: TResult | undefined = undefined;

        while (!foundItem && index >= 0) {
            const item = this[index];
            if (predicate.call(thisArg, item, index, this)) {
                foundItem = true;
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
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the index of the first item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
     */
    public findIndex<TContext = void>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): number {
        const changeTokenCopy = this._changeToken;
        let foundItem = false;
        let index = 0;

        while (!foundItem && index < this._length) {
            if (predicate.call(thisArg, this[index], index, this))
                foundItem = true;
            else
                index++;

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        if (index >= this._length)
            return -1;
        else
            return index;
    }

    /**
     * Returns the index of the last item that satisfies the given condition.
     * @template TContext The context type in which the callback is executed.
     * @param predicate The callback performing the item check.
     * @param thisArg A value to use as context when evaluating items.
     * @returns Returns the index of the last item for which the provided `predicate` evaluates to `true`; otherwise `-1`.
     * @see [Array.findLastIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex)
     */
    public findLastIndex<TContext = void>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): number {
        const changeTokenCopy = this._changeToken;
        let foundItem = false;
        let index = this._length - 1;

        while (!foundItem && index >= 0) {
            if (predicate.call(thisArg, this[index], index, this))
                foundItem = true;
            else
                index--;

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Collection has changed while being iterated.');
        }

        return index;
    }

    /**
     * Checks whether the provided item is in the collection.
     * @param item The item to search for.
     * @param fromIndex The index from where to start the search.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Array.includes](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
     */
    public includes(item: TItem, fromIndex?: number): boolean {
        let searchElementIndex = (
            fromIndex === null || fromIndex === undefined || fromIndex < -this._length
                ? 0
                : fromIndex < 0
                    ? fromIndex + this._length
                    : fromIndex
        );

        while (searchElementIndex < this._length && this[searchElementIndex] !== item)
            searchElementIndex++;

        return searchElementIndex < this._length;
    }

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in reverse order.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements in reversed order.
     * @see [Array.toReversed](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed)
     */
    public toReversed(): TItem[] {
        const result = new Array<TItem>(this._length);

        for (let sourceIndex = 0, destinationIndex = this._length - 1; sourceIndex < this._length; sourceIndex++, destinationIndex--)
            result[destinationIndex] = this[sourceIndex];

        return result;
    }

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the items of the collection in ascending order.
     * @param compareCallback Optional, a callback used to determine the sort order between two items.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the elements sorted in ascending order.
     * @see [Array.toSorted](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
     */
    public toSorted(compareCallback?: (a: Exclude<TItem, undefined>, b: Exclude<TItem, undefined>) => number): TItem[] {
        const changeTokenCopy = this._changeToken;
        const sortedIndexes = sortIndexes(this, compareCallback, () => changeTokenCopy !== this._changeToken);

        const result = new Array<TItem>(this._length);

        for (let index = 0; index < this._length; index++)
            result[index] = this[sortedIndexes[index]];

        return result;
    }

    /**
     * Returns a JavaScript [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) containing the spliced items of the collection.
     * @param start The index from which to start removing items, accepts both positive and negative values.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns A new [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) without the removed items and containing the replacements.
     * @see {@linkcode ObservableCollection.splice}
     * @see [Array.toSpliced](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)
     */
    public toSpliced(start: number, deleteCount?: number, ...items: readonly TItem[]): TItem[] {
        const normalizedStartIndex = normalizeStartIndex(this, start);
        const normalizedDeleteCount = (
            arguments.length === 1
                ? this._length - normalizedStartIndex
                : normalizeDeleteCount(this, normalizedStartIndex, deleteCount)
        );
        const remainderStartIndex = normalizedStartIndex + normalizedDeleteCount;

        let resultIndex = 0;
        const result = new Array<TItem>(normalizedStartIndex + items.length + (this._length - remainderStartIndex));

        for (let index = 0; index < normalizedStartIndex; index++, resultIndex++)
            result[resultIndex] = this[index];
        for (let index = 0; index < items.length; index++, resultIndex++)
            result[resultIndex] = items[index];
        for (let index = remainderStartIndex; index < this._length; index++, resultIndex++)
            result[resultIndex] = this[index];

        return result;
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
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const startIndex = this._length;
            for (let index = 0; index < items.length; index++)
                defineIndexProperty(this, startIndex + index, items[index]);
            this._length += items.length;

            this._collectionChangedEvent.dispatch(this, {
                operation: 'push',
                startIndex,
                addedItems: items,
                removedItems: []
            });

            const changedIndexes = new Array<number>(items.length);
            for (let index = 0; index < items.length; index++)
                changedIndexes[index] = index + startIndex;
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
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

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
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            for (let index = this._length - 1; index >= 0; index--)
                defineIndexProperty(this, index + items.length, this[index]);
            for (let index = 0; index < items.length; index++)
                defineIndexProperty(this, index, items[index]);
            this._length += items.length;

            this._collectionChangedEvent.dispatch(this, {
                operation: 'unshift',
                startIndex: 0,
                addedItems: items,
                removedItems: []
            });

            const changedIndexes = new Array<number>(this._length);
            for (let index = 0; index < this._length; index++)
                changedIndexes[index] = index;
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
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const removedItem = this[0];
            const changedIndexes = new Array<number>(this._length);
            for (let index = 0; index < this._length - 1; index++) {
                changedIndexes[index] = index;

                defineIndexProperty(this, index, this[index + 1]);
            }
            changedIndexes[this._length - 1] = this._length - 1;

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
     * @returns The length of the collection.
     */
    protected set(index: number, item: TItem): number {
        const normalizedIndex = normalizeIndex(index, this._length);

        if (normalizedIndex < this._length) {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const removedItem = this[normalizedIndex];

            defineIndexProperty(this, normalizedIndex, item);

            this._collectionChangedEvent.dispatch(this, {
                operation: 'set',
                startIndex: normalizedIndex,
                addedItems: [item],
                removedItems: [removedItem]
            });
            this.notifyPropertiesChanged(normalizedIndex);
        }
        else {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const fillStartIndex = this._length;
            const addedItems = new Array<TItem>(normalizedIndex - fillStartIndex);

            for (let fillIndex = fillStartIndex; fillIndex < normalizedIndex; fillIndex++) {
                defineIndexProperty(this, fillIndex, undefined);
                addedItems[fillIndex - fillStartIndex] = undefined!;
            }
            defineIndexProperty(this, normalizedIndex, item);
            addedItems[normalizedIndex - fillStartIndex] = item;

            this._length = normalizedIndex + 1;

            this._collectionChangedEvent.dispatch(this, {
                operation: 'set',
                startIndex: fillStartIndex,
                addedItems,
                removedItems: []
            });
            this.notifyPropertiesChanged('length', normalizedIndex);
        }

        return this._length;
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
        const normalizedStartIndex = normalizeStartIndex(this, start);
        const normalizedDeleteCount = (
            arguments.length === 1
                ? this._length - normalizedStartIndex
                : normalizeDeleteCount(this, normalizedStartIndex, deleteCount)
        );

        if (normalizedDeleteCount === 0 && items.length === 0)
            return [];
        else {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const removedItems = new Array<TItem>(normalizedDeleteCount);
            for (let index = 0; index < normalizedDeleteCount; index++)
                removedItems[index] = this[index + normalizedStartIndex];

            let updatedProperties: (keyof this)[];
            const lengthOffset = items.length - normalizedDeleteCount;

            if (lengthOffset === 0) {
                updatedProperties = new Array(normalizedDeleteCount);

                for (let index = 0; index < normalizedDeleteCount; index++) {
                    const collectionIndex = index + normalizedStartIndex;
                    updatedProperties[index] = collectionIndex;

                    defineIndexProperty(this, collectionIndex, items[index]);
                }
            }
            else {
                const affectedRangeLength = this._length - normalizedStartIndex;

                if (lengthOffset < 0) {
                    updatedProperties = new Array(1 + affectedRangeLength);

                    for (let index = normalizedStartIndex + normalizedDeleteCount; index < this._length; index++)
                        defineIndexProperty(this, index + lengthOffset, this[index]);

                    for (let index = this._length + lengthOffset; index < this._length; index++)
                        delete (this as Record<number, TItem>)[index];
                }
                else {
                    updatedProperties = new Array(1 + affectedRangeLength + lengthOffset);

                    for (let index = normalizedStartIndex + affectedRangeLength - 1; index >= normalizedStartIndex; index--)
                        defineIndexProperty(this, index + lengthOffset, this[index]);
                }
                this._length += lengthOffset;

                updatedProperties[0] = 'length';
                for (let index = 1; index < updatedProperties.length; index++)
                    updatedProperties[index] = normalizedStartIndex + index - 1;

                for (let index = 0; index < items.length; index++)
                    defineIndexProperty(this, index + normalizedStartIndex, items[index]);
            }

            this._collectionChangedEvent.dispatch(this, {
                operation: 'splice',
                startIndex: normalizedStartIndex,
                addedItems: items,
                removedItems: removedItems
            });
            this.notifyPropertiesChanged.apply(this, updatedProperties);

            return removedItems;
        }
    }

    /**
     * Reverses the items in the collections and returns the observable collection.
     * @param compareCallback Optional, a callback used to determine the sort order between two items.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.sort](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
     */
    protected sort(compareCallback?: (left: Exclude<TItem, undefined>, right: Exclude<TItem, undefined>) => number): this {
        if (this.length > 1) {
            const changeTokenCopy = this._changeToken;
            const sortedIndexes = sortIndexes(this, compareCallback, () => changeTokenCopy !== this._changeToken);

            if (sortedIndexes.some((sortedIndex, currentIndex) => sortedIndex !== currentIndex)) {
                this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

                const movedItems = new Array<ICollectionItemMove<TItem>>(sortedIndexes.filter((sortedIndex, currentIndex) => sortedIndex !== currentIndex).length);
                const changedIndexes = new Array<number>(movedItems.length);

                let index = 0;
                sortedIndexes.forEach((sortedIndex, itemIndex) => {
                    if (sortedIndex !== itemIndex) {
                        movedItems[index] = {
                            currentIndex: itemIndex,
                            currentItem: this[sortedIndex],
                            previousIndex: sortedIndex,
                            previousItem: this[itemIndex]
                        };
                        changedIndexes[index] = itemIndex;
                        index++;
                    }
                });
                movedItems.forEach(({ currentItem: item, currentIndex: sortedIndex }) => {
                    defineIndexProperty(this, sortedIndex, item);
                });

                this._collectionReorderedEvent.dispatch(this, {
                    operation: 'sort',
                    movedItems
                });
                this.notifyPropertiesChanged.apply(this, changedIndexes);
            }
        }

        return this;
    }

    /**
     * Reverses the items in the collections and returns the observable collection.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.reverse](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
     */
    protected reverse(): this {
        if (this.length > 1) {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const evenLength = this.length - this.length % 2;
            const movedItems = new Array<ICollectionItemMove<TItem>>(evenLength);
            const changedIndexes = new Array<number>(evenLength);

            for (let index = 0, lengthHalf = evenLength / 2; index < lengthHalf; index++) {
                const oppositeIndex = this.length - 1 - index;

                movedItems[index] = {
                    currentIndex: index,
                    currentItem: this[oppositeIndex],
                    previousIndex: oppositeIndex,
                    previousItem: this[index]
                };
                movedItems[movedItems.length - 1 - index] = {
                    currentIndex: oppositeIndex,
                    currentItem: this[index],
                    previousIndex: index,
                    previousItem: this[oppositeIndex]
                };
                changedIndexes[index] = index;
                changedIndexes[changedIndexes.length - 1 - index] = oppositeIndex;

                const copy = this[index];
                defineIndexProperty(this, index, this[oppositeIndex]);
                defineIndexProperty(this, oppositeIndex, copy);
            }

            this._collectionReorderedEvent.dispatch(this, {
                operation: 'reverse',
                movedItems
            });
            this.notifyPropertiesChanged.apply(this, changedIndexes);
        }

        return this;
    }

    /**
     * Copies items inside the collection overwriting existing ones.
     * @param target The index at which to start copying items, accepts both positive and negative values.
     * @param start The index from which to start copying items, accepts both positive and negative values.
     * @param end The index until where to copy items, accepts both positive and negative values.
     * @see [Array.copyWithin](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
     */
    protected copyWithin(target: number, start: number, end?: number): this {
        const normalizedTargetIndex = normalizeStartIndex(this, target);
        const normalizedStartIndex = normalizeStartIndex(this, start);
        const normalizedEndIndex = normalizeEndIndex(this, end);

        if (normalizedTargetIndex !== normalizedStartIndex && normalizedStartIndex < normalizedEndIndex) {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const rangeLength = normalizedEndIndex - normalizedStartIndex;
            const changedIndexes = new Array<number>(rangeLength);
            const addedItems = new Array<TItem>(rangeLength);
            const removedItems = new Array<TItem>(rangeLength);

            if (normalizedTargetIndex < normalizedStartIndex)
                for (let index = 0; index < rangeLength; index++) {
                    const targetIndex = index + normalizedTargetIndex;
                    const sourceIndex = index + normalizedStartIndex;

                    changedIndexes[index] = targetIndex;
                    addedItems[index] = this[sourceIndex];
                    removedItems[index] = this[targetIndex];

                    defineIndexProperty(this, targetIndex, this[sourceIndex]);
                }
            else
                for (let index = rangeLength - 1; index >= 0; index--) {
                    const targetIndex = index + normalizedTargetIndex;
                    const sourceIndex = index + normalizedStartIndex;

                    changedIndexes[index] = targetIndex;
                    addedItems[index] = this[sourceIndex];
                    removedItems[index] = this[targetIndex];

                    defineIndexProperty(this, targetIndex, this[sourceIndex]);
                }

            this._collectionChangedEvent.dispatch(this, {
                operation: 'copyWithin',
                addedItems,
                removedItems,
                startIndex: normalizedTargetIndex
            })
            this.notifyPropertiesChanged.apply(this, changedIndexes);
        }

        return this;
    }

    /**
     * Fills the collection with the provided `item`.
     * @param item The item to fill the collection with.
     * @param start The index from which to start filling the collection, accepts both positive and negative values.
     * @param end The index until which to fill the collection, accepts both positive and negative values.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.fill](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
     */
    protected fill(item: TItem, start?: number, end?: number): this {
        const normalizedStartIndex = normalizeStartIndex(this, start);
        const normalizedEndIndex = normalizeEndIndex(this, end);

        if (normalizedEndIndex > normalizedStartIndex) {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const length = normalizedEndIndex - normalizedStartIndex;
            const changedIndexes = new Array<number>(length);
            const addedItems = new Array<TItem>(length);
            const removedItems = new Array<TItem>(length);

            for (let index = 0; index < length; index++) {
                const collecitonIndex = index + normalizedStartIndex;
                changedIndexes[index] = collecitonIndex;
                addedItems[index] = item;
                removedItems[index] = this[collecitonIndex];

                defineIndexProperty(this, collecitonIndex, item);
            }

            this._collectionChangedEvent.dispatch(this, {
                operation: 'fill',
                startIndex: normalizedStartIndex,
                addedItems,
                removedItems
            });
            this.notifyPropertiesChanged.apply(this, changedIndexes);
        }

        return this;
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
                value: undefined!
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
            value: value!
        };
    }

    public throw(): IteratorResult<TValue, TValue> {
        this._completed = true;

        return {
            done: true,
            value: undefined!
        };
    }
}

function normalizeIndex(index: number, length: number): number {
    return index < 0 ? Math.max(0, index + length) : index;
}

function normalizeStartIndex(collection: ArrayLike<unknown>, index: unknown): number {
    const length = collection.length;
    const numberizedIndex = Number(index) || 0;

    const normalizedIndex = (
        numberizedIndex < -length
            ? 0
            : numberizedIndex < 0
                ? numberizedIndex + length
                : Math.min(numberizedIndex, length)
    );

    return normalizedIndex;
}

function normalizeEndIndex(collection: ArrayLike<unknown>, index: unknown): number {
    const length = collection.length;
    const numberizedIndex = Number(index) || Number.POSITIVE_INFINITY;

    const normalizedIndex = (
        numberizedIndex >= length
            ? length
            : numberizedIndex < 0
                ? numberizedIndex + length
                : numberizedIndex
    );

    return normalizedIndex;
}

function normalizeDeleteCount(colleciton: ArrayLike<unknown>, normalizedStartIndex: number, deleteCount: unknown): number {
    const length = colleciton.length;
    const numberizedDeleteCount = Number(deleteCount) || 0;

    const normalizedDeleteCount = (
        arguments.length === 1
            ? length - normalizedStartIndex
            : numberizedDeleteCount < 0
                ? 0
                : Math.min(numberizedDeleteCount, length - normalizedStartIndex)
    );

    return normalizedDeleteCount;
}

function defineIndexProperty(collection: ArrayLike<unknown>, index: number, item: unknown): void {
    Object.defineProperty(collection, index, {
        configurable: true,
        enumerable: true,
        value: item,
        writable: false
    });
}

function sortIndexes<TItem>(items: ArrayLike<TItem>, compareCallback: ((a: TItem, b: TItem) => number) | undefined, hasCollectionChanged: () => boolean): readonly number[] {
    if (items.length <= 1)
        return [0];
    else if (compareCallback === null || compareCallback === undefined) {
        const stringifiedItems = new Array<string>(items.length);
        for (let index = 0; index < items.length; index++) {
            const item = items[index];

            if (item === null)
                stringifiedItems[index] = 'null';
            else if (item === undefined)
                stringifiedItems[index] = undefined!;
            else if (item.toString)
                stringifiedItems[index] = item.toString();
            else
                stringifiedItems[index] = '' + item;
        }

        return mergeSortIndexes(stringifiedItems, (left, right) => left.localeCompare(right));
    }
    else
        return mergeSortIndexes(items, (left, right) => {
            const result = compareCallback(left, right);
            if (hasCollectionChanged && hasCollectionChanged())
                throw new Error('Collection has changed while being iterated.');

            return result;
        });
}

function mergeSortIndexes<TItem>(items: ArrayLike<TItem>, compareCallback: (a: TItem, b: TItem) => number): readonly number[] {
    let result: number[];

    let sourceIndexes = new Array<number>(items.length);
    for (let index = 0; index < items.length; index++)
        sourceIndexes[index] = index;
    let destinationIndexes = new Array<number>(items.length);

    let rangeLength = 1;
    do {
        rangeLength <<= 1;

        for (let rangeStart = 0; rangeStart < items.length; rangeStart += rangeLength)
            mergeIndexes(items, sourceIndexes, destinationIndexes, rangeStart, rangeLength, compareCallback);

        result = destinationIndexes;
        destinationIndexes = sourceIndexes;
        sourceIndexes = result;

    } while (rangeLength < items.length);

    return result;
}

function mergeIndexes<TItem>(items: ArrayLike<TItem>, sourceIndexes: readonly number[], result: number[], rangeStart: number, rangeLength: number, compareCallback: (a: TItem, b: TItem) => number) {
    let leftIndex = rangeStart;
    const leftEnd = Math.min(items.length, rangeStart + Math.floor(rangeLength / 2));
    let rightIndex = leftEnd;
    const rightEnd = Math.min(items.length, rangeStart + rangeLength);

    let index = rangeStart;
    while (leftIndex < leftEnd && rightIndex < rightEnd) {
        const left = items[sourceIndexes[leftIndex]];
        const right = items[sourceIndexes[rightIndex]];

        const comparison = (
            left === undefined
                ? right === undefined
                    ? 0
                    : 1
                : right === undefined
                    ? -1
                    : compareCallback(items[sourceIndexes[leftIndex]], items[sourceIndexes[rightIndex]])
        );
        if (comparison <= 0) {
            result[index] = sourceIndexes[leftIndex];
            leftIndex++;
        }
        else {
            result[index] = sourceIndexes[rightIndex];
            rightIndex++;
        }
        index++;
    }

    while (leftIndex < leftEnd) {
        result[index] = sourceIndexes[leftIndex];
        leftIndex++;
        index++;
    }

    while (rightIndex < rightEnd) {
        result[index] = sourceIndexes[rightIndex];
        rightIndex++;
        index++
    }
}