/**
 * Contains information about items that are added or removed from a collection.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionReorder<TItem> {
    readonly operation: CollectionReorderOperation;
    readonly movedItems: readonly ICollectionItemMove<TItem>[];
}

/**
 * Describes all the possible operations that can reorder a collection.
 */
export type CollectionReorderOperation = 'reverse' | 'sort';

/**
 * Contains information about the change in the collection.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionItemMove<TItem> {
    readonly previousIndex: number;
    readonly previousItem: TItem;

    readonly currentIndex: number;
    readonly currentItem: TItem;
}