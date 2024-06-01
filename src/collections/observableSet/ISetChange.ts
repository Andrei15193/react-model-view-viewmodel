/**
 * Contains information about items that are added or removed from a set.
 * @template TItem The type of items the set contains.
 */
export interface ISetChange<TItem> {
    /** The items that were added to the set. */
    readonly addedItems: readonly TItem[];
    /** The items that were removed from the set. */
    readonly removedItems: readonly TItem[];
    /** The operation that was performed */
    readonly operation: SetChangeOperation;
}

/**
 * Describes all the possible operations that can add or remove items from a set.
 */
export type SetChangeOperation = 'add' | 'delete' | 'clear';