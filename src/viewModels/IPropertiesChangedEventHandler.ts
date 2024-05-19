import type { IEventHandler } from '../events';

/**
 * A specialized interface for handling properties changed events.
 * @template T The type whose properties may change.
 */
export interface IPropertiesChangedEventHandler<T> extends IEventHandler<T, readonly (keyof T)[]> {
    handle(subject: T, changedProperties: readonly (keyof T)[]): void;
}