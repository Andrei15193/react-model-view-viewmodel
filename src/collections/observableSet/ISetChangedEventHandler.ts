import type { IEventHandler } from '../../events';
import type { ISetChange } from './ISetChange';

/**
 * A specialized interface for handling set changed events.
 * @template TSubject the object that raised the event.
 * @template TItem The type of items the set contains.
 */
export interface ISetChangedEventHandler<TSubject, TItem> extends IEventHandler<TSubject, ISetChange<TItem>> {
}