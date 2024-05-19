import type { IEvent } from '../../events';
import type { ICollectionItemMove } from './ICollectionItemMove';

/**
 * A specialized event for subscribing and unsubscribing from collection reordering events.
 * @template TSubject Provides the object that raised the event.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionReorderedEvent<TSubject, TItem> extends IEvent<TSubject, readonly ICollectionItemMove<TItem>[]> {
}