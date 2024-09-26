import type { IEventHandler } from '../events';

/**
 * A specialized interface for handling properties changed events.
 * @template T The type whose properties may change.
 */
export interface IPropertiesChangedEventHandler<T> extends IEventHandler<T, readonly (keyof T)[]> {
    /**
     * The method that handles the event.
     * @param subject The object whose properties may have changed.
     * @param changedProperties The properties that may have changed.
     */
    handle(subject: T, changedProperties: readonly (keyof T)[]): void;
}