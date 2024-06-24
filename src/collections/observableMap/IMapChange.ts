/**
 * Contains information about items that are added or removed from a map.
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the map contains.
 */
export interface IMapChange<TKey, TItem> {
    /** The items that were added to the set. */
    readonly addedEntries: readonly (readonly [TKey, TItem])[];
    /** The items that were removed from the set. */
    readonly removedEntries: readonly (readonly [TKey, TItem])[];
    /** The operation that was performed */
    readonly operation: MapChangeOperation;
}

/**
 * Describes all the possible operations that can add or remove items from a map.
 */
export type MapChangeOperation = 'set' | 'delete' | 'clear';