import type { IReadOnlyObservableCollection } from './IReadOnlyObservableCollection';

/**
 * Represents an observable collection based on the [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) interface.
 * @template TItem The type of items the collection contains.
 * @see [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
 */
export interface IObservableCollection<TItem> extends IReadOnlyObservableCollection<TItem> {
    /**
     * Gets or sets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    length: number;

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
     * @see [Array.at](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
     */
    get(index: number): TItem;

    /**
     * Sets the provided item at the provided index.
     * @param index The index to which to set the item.
     * @param item The item to set.
     * @returns The length of the collection.
     */
    set(index: number, item: TItem): number;

    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    splice(start: number): TItem[];
    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    splice(start: number, deleteCount: number): TItem[];
    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    splice(start: number, deleteCount: number, ...items: readonly TItem[]): TItem[];

    /**
     * Reverses the items in the collections and returns the observable collection.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.sort](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
     */
    sort(): this;

    /**
     * Reverses the items in the collections and returns the observable collection.
     * @param compareCallback Optional, a callback used to determine the sort order between two items.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.sort](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
     */
    sort(compareCallback: (left: TItem, right: TItem) => number): this;

    /**
     * Reverses the items in the collections and returns the observable collection.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.reverse](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
     */
    reverse(): this;

    /**
     * Copies items inside the collection overwriting existing ones.
     * @param target The index at which to start copying items, accepts both positive and negative values.
     * @param start The index from which to start copying items, accepts both positive and negative values.
     * @see [Array.copyWithin](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
     */
    copyWithin(target: number, start: number): this;

    /**
     * Copies items inside the collection overwriting existing ones.
     * @param target The index at which to start copying items, accepts both positive and negative values.
     * @param start The index from which to start copying items, accepts both positive and negative values.
     * @param end The index until where to copy items, accepts both positive and negative values.
     * @see [Array.copyWithin](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
     */
    copyWithin(target: number, start: number, end: number): this;

    /**
     * Fills the collection with the provided `item`.
     * @param item The item to fill the collection with.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.fill](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
     */
    fill(item: TItem): this;
    /**
     * Fills the collection with the provided `item`.
     * @param item The item to fill the collection with.
     * @param start The index from which to start filling the collection, accepts both positive and negative values.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.fill](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
     */
    fill(item: TItem, start: number): this;
    /**
     * Fills the collection with the provided `item`.
     * @param item The item to fill the collection with.
     * @param start The index from which to start filling the collection, accepts both positive and negative values.
     * @param end The index until which to fill the collection, accepts both positive and negative values.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.fill](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
     */
    fill(item: TItem, start: number, end: number): this;
}
