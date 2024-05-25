/**
 * Contains information about reordering items in a collection.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionChange<TItem> {
    /** The start index where the change has happenend. */
    readonly startIndex: number;
    /** An array of added items, if any. */
    readonly addedItems: readonly TItem[];
    /** An array of removed items, if any. */
    readonly removedItems: readonly TItem[];
    /** The operation that was performed */
    readonly operation: CollectionChangeOperation;
}

/**
 * Describes all the possible operations that can add or remove items from a collection.
 */
export type CollectionChangeOperation = 'push' | 'pop' | 'unshift' | 'shift' | 'splice' | 'expand' | 'contract' | 'set' | 'fill';