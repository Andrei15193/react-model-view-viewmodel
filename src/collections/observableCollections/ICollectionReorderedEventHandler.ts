import type { IEventHandler } from '../../events';
import type { ICollectionItemMove } from './ICollectionItemMove';

/**
 * A specialized interface for handling collection reorder events.
 * @template Provides the object that raised the event.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionReorderedEventHandler<TSubject, TItem> extends IEventHandler<TSubject, readonly ICollectionItemMove<TItem>[]> {
    handle(subject: TSubject, movedItems: readonly ICollectionItemMove<TItem>[]): void;
}