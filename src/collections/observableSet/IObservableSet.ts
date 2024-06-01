import type { IReadOnlyObservableSet } from "./IReadOnlyObservableSet";

/**
 * Represents an observable set based on the [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set) interface.
 * @template TItem The type of items the set contains.
 */
export interface IObservableSet<TItem> extends IReadOnlyObservableSet<TItem> {
    /**
     * Ensures the provided `item` is in the set. There can be at most only one instance of an item in a set at any given time.
     * @param item The item to add to the set.
     * @returns The observable set on which the operation is performed.
     * @see [Set.add](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/add)
     */
    add(item: TItem): this;
    /**
     * Ensures the provided `item` is not in the set.
     * @param item The item to remove from the set.
     * @returns Returns `true` if the provided item was found and removed from the set; otherwise `false`.
     * @see [Set.add](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/add)
     */
    delete(item: TItem): boolean;

    /**
     * Empties the set of all items.
     * @see [Set.clear](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/clear)
     */
    clear(): void;
}