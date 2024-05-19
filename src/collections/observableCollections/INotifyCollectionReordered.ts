import type { ICollectionReorderedEvent } from './ICollectionReorderedEvent';

/**
 * A core interface for observable collections. Components can react to this and display the new value as a consequence.
 *
 * Any collection change can be reduced to [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
 * to fully sync collections, `copy.splice(0, copy.length, ...subject)`.
 * @template TItem The type of items the collection contains.
 */
export interface INotifyCollectionReordered<TItem> {
    /** An event that is raised when the collection changed. */
    readonly collectionReordered: ICollectionReorderedEvent<this, TItem>;
}