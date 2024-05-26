import type { IObservableCollection } from './IObservableCollection';
import { ReadOnlyObservableCollection } from './ReadOnlyObservableCollection';

/**
 * Represents an observable collection based on the [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) interface.
 * @template TItem The type of items the collection contains.
 * @see [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
 */
export class ObservableCollection<TItem> extends ReadOnlyObservableCollection<TItem> implements IObservableCollection<TItem> {
    /**
     * Initializes a new instance of the {@link ObservableCollection} class.
     * @param items The items to initialize the collection with.
     */
    public constructor(...items: readonly TItem[]) {
        super(...items);
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
    public every<TSpecific extends TItem>(predicate: (item: TItem, index: number, collection: this) => item is TSpecific): this is ObservableCollection<TSpecific>;
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
    public every<TSpecific extends TItem, TContext>(predicate: (this: TContext, item: TItem, index: number, collection: this) => item is TSpecific, thisArg: TContext): this is ObservableCollection<TSpecific>;

    public every() {
        return super.every.apply(this, arguments);
    }

    /**
     * Gets or sets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    public get length(): number {
        return super.length;
    }

    /**
     * Gets or sets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    public set length(value: number) {
        super.length = value;
    }

    /**
     * Appends new elements to the end of the collection, and returns the new length of the collection.
     * @param items New elements to add at the end of the collection.
     * @returns The new length of the collection.
     * @see [Array.push](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
     */
    public push(...items: readonly TItem[]): number;

    public push() {
        return super.push.apply(this, arguments);
    }

    /**
     * Removes the last element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The last element in the collection that was removed.
     * @see [Array.pop](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
     */
    public pop(): TItem | undefined;

    public pop() {
        return super.pop.apply(this, arguments);
    }

    /**
     * Inserts new elements at the start of the collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     * @returns The new length of the collection.
     * @see [Array.unshift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     */
    public unshift(...items: readonly TItem[]): number;

    public unshift() {
        return super.unshift.apply(this, arguments);
    }

    /**
     * Removes the first element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The first element in the collection that was removed.
     * @see [Array.shift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
     */
    public shift(): TItem | undefined;

    public shift() {
        return super.shift.apply(this, arguments);
    }

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @returns The item at the provided index.
     * @see [Array.at](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
     */
    public get(index: number): TItem;

    public get() {
        return super.get.apply(this, arguments);
    }

    /**
     * Sets the provided item at the provided index.
     * @param index The index to which to set the item.
     * @param item The item to set.
     * @returns The length of the collection.
     */
    public set(index: number, item: TItem): number;

    public set() {
        return super.set.apply(this, arguments);
    }

    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    public splice(start: number): TItem[];
    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    public splice(start: number, deleteCount: number): TItem[];
    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    public splice(start: number, deleteCount: number, ...items: readonly TItem[]): TItem[];

    public splice() {
        return super.splice.apply(this, arguments);
    }

    /**
     * Reverses the items in the collections and returns the observable collection.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.sort](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
     */
    public sort(): this;

    /**
     * Reverses the items in the collections and returns the observable collection.
     * @param compareCallback Optional, a callback used to determine the sort order between two items.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.sort](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
     */
    public sort(compareCallback?: (left: TItem, right: TItem) => number): this;

    public sort() {
        return super.sort.apply(this, arguments);
    }

    /**
     * Reverses the items in the collections and returns the observable collection..
     * @returns The observable collection on which the operation is performed.
     * @see [Array.reverse](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
     */
    public reverse(): this;

    public reverse() {
        return super.reverse.apply(this, arguments);
    }

    /**
     * Copies items inside the collection overwriting existing ones.
     * @param target The index at which to start copying items, accepts both positive and negative values.
     * @param start The index from which to start copying items, accepts both positive and negative values.
     * @see [Array.copyWithin](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
     */
    public copyWithin(target: number, start: number): this;

    /**
     * Copies items inside the collection overwriting existing ones.
     * @param target The index at which to start copying items, accepts both positive and negative values.
     * @param start The index from which to start copying items, accepts both positive and negative values.
     * @param end The index until where to copy items, accepts both positive and negative values.
     * @see [Array.copyWithin](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
     */
    public copyWithin(target: number, start: number, end: number): this;

    public copyWithin() {
        return super.copyWithin.apply(this, arguments);
    }

    /**
     * Fills the collection with the provided `item`.
     * @param item The item to fill the collection with.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.fill](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
     */
    public fill(item: TItem): this;

    /**
     * Fills the collection with the provided `item`.
     * @param item The item to fill the collection with.
     * @param start The index from which to start filling the collection, accepts both positive and negative values.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.fill](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
     */
    public fill(item: TItem, start: number): this;

    /**
     * Fills the collection with the provided `item`.
     * @param item The item to fill the collection with.
     * @param start The index from which to start filling the collection, accepts both positive and negative values.
     * @param end The index until which to fill the collection, accepts both positive and negative values.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.fill](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
     */
    public fill(item: TItem, start: number, end: number): this;

    public fill(item: TItem, start?: number, end?: number): this {
        return super.fill.apply(this, arguments);
    }
}