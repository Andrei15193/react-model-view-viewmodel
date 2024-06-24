import type { IEvent } from './IEvent';
import type { IEventHandler } from './IEventHandler';

/**
 * A base implementation of an event. To avoid misuse, declare a private event of this type and expose it as an {@link IEvent}.
 * @template TSubject Optional, the type of object that raises the event.
 * @template TEventArgs Optional, the type of the event context containing additional information about the event.
 */
export class EventDispatcher<TSubject, TEventArgs = void> implements IEvent<TSubject, TEventArgs> {
    private _eventHandlers: readonly IEventHandler<TSubject, TEventArgs>[] = [];

    /**
     * Subscribes the given eventHandler to the event.
     * @param eventHandler An event handler that gets notified when the event is raised.
     */
    public subscribe<TEventHandler extends IEventHandler<TSubject, TEventArgs>>(eventHandler: TEventHandler): void {
        if (eventHandler !== null && eventHandler !== undefined)
            this._eventHandlers = this._eventHandlers.concat(eventHandler);
    }

    /**
     * Unsubscribes the given eventHandler to the event. The exact same object that was used to subscribe to the event must be passed as well.
     * @param eventHandler The event handler that was previously subscribed to the event.
     */
    public unsubscribe<TEventHandler extends IEventHandler<TSubject, TEventArgs>>(eventHandler: TEventHandler): void {
        const eventHandlerIndex = this._eventHandlers.indexOf(eventHandler);
        if (eventHandlerIndex >= 0)
            this._eventHandlers = this._eventHandlers.filter((_, index) => index !== eventHandlerIndex);
    }

    /**
     * Dispatches a notification to all subscribers.
     * @param subject The object raising the event, generally the object which is exposing it.
     * @param args A set of arguments that provide context for the event.
     */
    public dispatch(subject: TSubject, args: TEventArgs): void {
        this._eventHandlers.forEach(eventHandler => {
            if (this._eventHandlers.indexOf(eventHandler) >= 0)
                eventHandler.handle(subject, args);
        });
    }
}