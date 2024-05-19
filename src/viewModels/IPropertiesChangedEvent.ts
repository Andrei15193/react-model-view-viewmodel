import type { IEvent } from '../events';
import type { IPropertiesChangedEventHandler } from './IPropertiesChangedEventHandler';

/**
 * A specialized event for subscribing and unsubscribing from property changed events.
 * @template T The type exposing a properties changed event.
 */
export interface IPropertiesChangedEvent<T> extends IEvent<T, readonly (keyof T)[]> {
    /**
     * Subscribes the given eventHandler to the event.
     * @param eventHandler An event handler that gets notified when the event is raised.
     */
    subscribe<TEventHandler extends IPropertiesChangedEventHandler<T>>(eventHandler: TEventHandler): void;

    /**
     * Unsubscribes the given eventHandler to the event. The exact same object that was used to subscribe to the event must be passed as well.
     * @param eventHandler The event handler that was previously subscribed to the event.
     */
    unsubscribe<TEventHandler extends IPropertiesChangedEventHandler<T>>(eventHandler: TEventHandler): void;
}