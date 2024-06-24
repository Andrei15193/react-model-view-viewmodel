import type { IMapChangedEvent } from './IMapChangedEvent';

/**
 * Notifies when a map has items added or removed to it.
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the map contains.
 */
export interface INotifyMapChanged<TKey, TItem> {
    /**
     * An event that is raised when the map changed by adding or removing entries.
     */
    readonly mapChanged: IMapChangedEvent<this, TKey, TItem>;
}