import type { IEvent } from '../../events';
import type { IMapChange } from './IMapChange';

/**
 * A specialized event for subscribing and unsubscribing from map changed events.
 * @template TSubject The type of object that raises the event.
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the map contains.
 */
export interface IMapChangedEvent<TSubject, TKey, TItem> extends IEvent<TSubject, IMapChange<TKey, TItem>> {
}