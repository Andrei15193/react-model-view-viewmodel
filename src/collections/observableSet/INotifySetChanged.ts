import type { ISetChangedEvent } from './ISetChangedEvent';

/**
 * Notifies when a set has items added or removed to it.
 * @template TItem The type of items the set contains.
 */
export interface INotifySetChanged<TItem> {
    /** An event that is raised when the set changed by adding or removing items. */
    readonly setChanged: ISetChangedEvent<this, TItem>;
}