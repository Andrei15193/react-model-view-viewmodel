import type { IEventHandler } from '../../events';
import type { ICollectionReorder } from './ICollectionReorder';

/**
 * A specialized interface for handling collection reorder events.
 * @template Provides the object that raised the event.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionReorderedEventHandler<TSubject, TItem> extends IEventHandler<TSubject, ICollectionReorder<TItem>> {
    handle(subject: TSubject, movedItems: ICollectionReorder<TItem>): void;
}