import type { IEvent } from '../../events';
import type { ICollectionChange } from './ICollectionChange';

/**
 * A specialized event for subscribing and unsubscribing from collection changed events.
 * @template TSubject Provides the object that raised the event.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionChangedEvent<TSubject, TItem> extends IEvent<TSubject, ICollectionChange<TItem>> {
}