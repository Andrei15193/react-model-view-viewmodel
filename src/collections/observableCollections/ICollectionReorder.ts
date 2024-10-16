/**
 * Contains information about reordering items in a collection.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionReorder<TItem> {
    /**
     * Gets the operation that was performed which led to items to be moved
     * within the collection.
     */
    readonly operation: CollectionReorderOperation;

    /**
     * Gets information about how each item was moved within the collection.
     */
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
    /**
     * Gets the index from where {@linkcode currentItem} was moved.
     */
    readonly previousIndex: number;
    /**
     * Gets the item that was previously at {@linkcode currentIndex}.
     */
    readonly previousItem: TItem;

    /**
     * Gets the index of {@linkcode currentItem}.
     */
    readonly currentIndex: number;
    /**
     * Gets the item that was placed on {@linkcode currentIndex}.
     */
    readonly currentItem: TItem;
}