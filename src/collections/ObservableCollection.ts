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

    public every<TContext = void>(predicate: (this: TContext, item: TItem, index: number, collection: this) => boolean, thisArg?: TContext): boolean {
       return super.every(predicate, thisArg);
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
    public push(...items: readonly TItem[]): number {
        return super.push(...items);
    }

    /**
     * Removes the last element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The last element in the collection that was removed.
     * @see [Array.pop](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
     */
    public pop(): TItem | undefined {
        return super.pop();
    }

    /**
     * Inserts new elements at the start of the collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     * @returns The new length of the collection.
     * @see [Array.unshift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     */
    public unshift(...items: readonly TItem[]): number {
        return super.unshift(...items);
    }

    /**
     * Removes the first element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The first element in the collection that was removed.
     * @see [Array.shift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
     */
    public shift(): TItem | undefined {
        return super.shift();
    }

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @returns The item at the provided index.
     * @see [Array.at](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
     */
    public get(index: number): TItem {
        return super.get(index);
    }

    /**
     * Sets the provided item at the provided index.
     * @param index The index to which to set the item.
     * @param item The item to set.
     * @throws {@link RangeError} when the index is outside the bounds of the collection.
     */
    public set(index: number, item: TItem): void {
        super.set(index, item);
    }

    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
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