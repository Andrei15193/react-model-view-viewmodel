import type { ICollectionChangedEvent } from './ICollectionChangedEvent';

/**
 * A core interface for observable collections. Components can react to this and display the new value as a consequence.
 *
 * Any collection change can be reduced to [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice),
 * thus the colleciton changed notification contains all the necessary information to reproduce the operation on subsequent collections.
 * @template TItem The type of items the collection contains.
 */
export interface INotifyCollectionChanged<TItem> {
    /** An event that is raised when the collection changed. */
    readonly collectionChanged: ICollectionChangedEvent<this, TItem>;
}