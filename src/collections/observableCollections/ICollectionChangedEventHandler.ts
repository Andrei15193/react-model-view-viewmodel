import type { IEventHandler } from '../../events';
import type { ICollectionChange } from './ICollectionChange';

/**
 * A specialized interface for handling collection changed events.
 * @template TSubject the object that raised the event.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionChangedEventHandler<TSubject, TItem> extends IEventHandler<TSubject, ICollectionChange<TItem>> {
}