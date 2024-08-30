import type { IObservableSet } from './IObservableSet';
import { ReadOnlyObservableSet } from './ReadOnlyObservableSet';

/**
 * Represents a read-only observable set based on the [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set) interface.
 * @template TItem The type of items the set contains.
 */
export class ObservableSet<TItem> extends ReadOnlyObservableSet<TItem> implements IObservableSet<TItem> {
    /**
     * Initializes a new instance of the {@linkcode ObservableSet} class.
     * @param items The items to initialize the set with.
     */
    public constructor(items?: Iterable<TItem>) {
        super(items);
    }

    /**
     * Ensures the provided `item` is in the set. There can be at most only one instance of an item in a set at any given time.
     * @param item The item to add to the set.
     * @returns The observable set on which the operation is performed.
     * @see [Set.add](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/add)
     */
    public add(item: TItem): this {
        return super.add.apply(this, arguments);
    }

    /**
     * Ensures the provided `item` is not in the set.
     * @param item The item to remove from the set.
     * @returns Returns `true` if the provided item was found and removed from the set; otherwise `false`.
     * @see [Set.add](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/add)
     */
    public delete(item: TItem): boolean {
        return super.delete.apply(this, arguments);
    }

    /**
     * Empties the set of all items.
     * @see [Set.clear](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/clear)
     */
    public clear(): void {
        return super.clear.apply(this, arguments);
    }
}