/**
 * Contains information about the changes in the collection.
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
 * Describes all the possible operations that can be performed on a collection.
 */
export type CollectionChangeOperation = 'push' | 'pop' | 'unshift' | 'shift' | 'splice' | 'expand' | 'contract' | 'set';