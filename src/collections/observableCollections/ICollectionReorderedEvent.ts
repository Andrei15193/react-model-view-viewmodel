import type { IEvent } from '../../events';
import type { ICollectionReorder } from './ICollectionReorder';

/**
 * A specialized event for subscribing and unsubscribing from collection reordering events.
 * @template TSubject The type of object that raises the event.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionReorderedEvent<TSubject, TItem> extends IEvent<TSubject, ICollectionReorder<TItem>> {
}