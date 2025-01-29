import type { IMapChange } from './IMapChange';
import type { IEventHandler } from '../../events';

/**
 * A specialized interface for handling map changed events.
 * @template TSubject The type of object that raises the event.
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the map contains.
 */
export interface IMapChangedEventHandler<TSubject, TKey, TItem> extends IEventHandler<TSubject, IMapChange<TKey, TItem>> {
}