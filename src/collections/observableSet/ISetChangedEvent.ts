import type { IEvent } from '../../events';
import type { ISetChange } from './ISetChange';

/**
 * A specialized event for subscribing and unsubscribing from set changed events.
 * @template TSubject The type of object that raises the event.
 * @template TItem The type of items the collection contains.
 */
export interface ISetChangedEvent<TSubject, TItem> extends IEvent<TSubject, ISetChange<TItem>> {
}