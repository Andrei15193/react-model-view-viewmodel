/**
 * Contains information about items that are added or removed from a collection.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionChange<TItem> {
    /** The start index where the change has happenend. */
    readonly startIndex: number;
    /** The items that were added to the collection. */
    readonly addedItems: readonly TItem[];
    /** The items that were removed from the collection. */
    readonly removedItems: readonly TItem[];
    /** The operation that was performed */
    readonly operation: CollectionChangeOperation;
}

/**
 * Describes all the possible operations that can add or remove items from a collection.
 */
export type CollectionChangeOperation = 'push' | 'pop' | 'unshift' | 'shift' | 'splice' | 'expand' | 'contract' | 'set' | 'fill' | 'copyWithin';