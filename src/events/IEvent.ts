import type { IEventHandler } from './IEventHandler';

/**
 * Represents an event to which objects can subscribe and unsubscribe from. Similar to an event in .NET.
 * @template TSubject Optional, the type of object that raises the event.
 * @template TEventArgs Optional, the type of the event context containing additional information about the event.
 */
export interface IEvent<TSubject, TEventArgs = void> {
    /**
     * Subscribes the given eventHandler to the event.
     * @param eventHandler An event handler that gets notified when the event is raised.
     */
    subscribe<TEventHandler extends IEventHandler<TSubject, TEventArgs>>(eventHandler: TEventHandler): void;

    /**
     * Unsubscribes the given eventHandler to the event. The exact same object that was used to subscribe to the event must be passed as well.
     * @param eventHandler The event handler that was previously subscribed to the event.
     */
    unsubscribe<TEventHandler extends IEventHandler<TSubject, TEventArgs>>(eventHandler: TEventHandler): void;
}