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