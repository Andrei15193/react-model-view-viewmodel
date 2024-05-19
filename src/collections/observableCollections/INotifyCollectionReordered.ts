import type { INotifyCollectionChanged } from './INotifyCollectionChanged';
import type { ICollectionReorderedEvent } from './ICollectionReorderedEvent';

/**
 * Notifies when a collection has its items reordered. Adding and removing items is handled through the {@link INotifyCollectionChanged} interface.
 * A core interface for observable collections. Components can react to this and display the new value as a consequence.
 *
 * Any collection change can be reduced to [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice),
 * event handlers can splice entire mapped collections to get all items in the same order.
 * 
 * Additionally, event handlers receive all the necessary information about how each item has moved inside the collection making it easy to
 * add animations when it happens.
 * @template TItem The type of items the collection contains.
 */
export interface INotifyCollectionReordered<TItem> {
    /** An event that is raised when the collection changed. */
    readonly collectionReordered: ICollectionReorderedEvent<this, TItem>;
}