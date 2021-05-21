/** Represents an event to which objects can subscribe and unsubscribe. Similar to an event in .NET.
 * @template TEventArgs
 * @param {TEventArgs} - Optional, can be used to provide context when notifying subscribers.
*/
export interface IEvent<TEventArgs = void> {
    /** Subscribes the given eventHandler to the event.
     * @param eventHandler - An event handler that gets notified when the event is raised.
    */
    subscribe(eventHandler: IEventHandler<TEventArgs>): void;

    /** Unsubscribes the given eventHandler to the event. The exact same object that was used to subscribe to the event must be passed as well.
     * @param eventHandler - The event handler that was previously subscribed to the event.
    */
    unsubscribe(eventHandler: IEventHandler<TEventArgs>): void;
}

/** An event handler used to subscribe to events. Similar to an EventHandler delegate in .NET.
 * @template TEventArgs
 * @param {TEventArgs} - Optional, can be used to provide context about the event.
*/
export interface IEventHandler<TEventArgs = void> {
    /** A callback that handles the event.
     * @param subject - The object that raised the event.
     * @param args - A set of arguments that provide context for the event.
     */
    handle(subject: object, args: TEventArgs): void;
}

/** 
 * A base implementation of an event. To avoid misuse, declare a private event of this type and expose it as an IEvent.
 * @template TEventArgs
 * @param {TEventArgs} - Optional, can be used to provide context when notifying subscribers.
 */
export class DispatchEvent<TEventArgs = void> implements IEvent<TEventArgs> {
    private _eventHandlers: readonly IEventHandler<TEventArgs>[] = [];

    /** Subscribes the given eventHandler to the event.
     * @param eventHandler - An event handler that gets notified when the event is raised.
    */
    public subscribe(eventHandler: IEventHandler<TEventArgs>): void {
        this._eventHandlers = this._eventHandlers.concat(eventHandler);
    }

    /** Unsubscribes the given eventHandler to the event. The exact same object that was used to subscribe to the event must be passed as well.
     * @param eventHandler - The event handler that was previously subscribed to the event.
    */
    public unsubscribe(eventHandler: IEventHandler<TEventArgs>): void {
        const eventHandlerIndex = this._eventHandlers.indexOf(eventHandler);
        if (eventHandlerIndex >= 0)
            this._eventHandlers = this._eventHandlers.filter((_, index) => index !== eventHandlerIndex);
    }

    /** Dispatches a notification to all subscribers.
     * @param subject - The object raising the event, generally the object which is exposing it.
     * @param args - A set of arguments that provide context for the event.
     */
    public dispatch(subject: object, args: TEventArgs): void {
        this._eventHandlers.forEach(eventHandler => {
            if (this._eventHandlers.indexOf(eventHandler) >= 0)
                eventHandler.handle(subject, args);
        });
    }
}

/** A core interface for objects that notify subscribers when their properties have changed. Components can react to this and display the new value as a consequence. */
export interface INotifyPropertiesChanged {
    /** An event that is raised when one or more properties may have changed. */
    readonly propertiesChanged: IEvent<readonly string[]>;
}