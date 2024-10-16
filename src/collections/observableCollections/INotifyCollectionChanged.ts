import type { ICollectionChangedEvent } from './ICollectionChangedEvent';
import type { INotifyCollectionReordered } from './INotifyCollectionReordered';

/**
 * Notifies when a collection has items added or removed to it. Item reordering is handled through the {@linkcode INotifyCollectionReordered} interface.
 *
 * Any collection change can be reduced to [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice),
 * event handlers receive all the relevant information to easily reproduce the operation on mapped collections.
 * @template TItem The type of items the collection contains.
 */
export interface INotifyCollectionChanged<TItem> {
    /**
     * An event that is raised when the collection changed by adding or removing items.
     */
    readonly collectionChanged: ICollectionChangedEvent<this, TItem>;
}