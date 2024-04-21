/**
 * Represents an event to which objects can subscribe and unsubscribe from. Similar to an event in .NET.
 * @template TSubject Optional, provides the object that raised the event.
 * @template TEventArgs Optional, provides context about the event when notifying subscribers.
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

/**
 * An event handler used to subscribe to events. Similar to an EventHandler delegate in .NET.
 * @template TSubject Provides the object that raised the event.
 * @template TEventArgs Optional, provides context about the event.
 */
export interface IEventHandler<TSubject, TEventArgs = void> {
    /**
     * The method that handles the event.
     * @param subject The object that raised the event.
     * @param args A set of arguments that provide context for the event.
     */
    handle(subject: TSubject, args: TEventArgs): void;
}

/**
 * A base implementation of an event. To avoid misuse, declare a private event of this type and expose it as an {@link IEvent}.
 * @template TSubject Optional, provides the object that raised the event.
 * @template TEventArgs Optional, provides context about the event.
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

/** A core interface for objects that notify subscribers when their properties have changed. Components can react to this and display the new value as a consequence. */
export interface INotifyPropertiesChanged {
    /** An event that is raised when one or more properties may have changed. */
    readonly propertiesChanged: IPropertiesChangedEvent<this>;
}

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

/**
 * A specialized interface for handling properties changed events.
 * @template T The type whose properties may change.
 */
export interface IPropertiesChangedEventHandler<T> extends IEventHandler<T, readonly (keyof T)[]> {
    handle(subject: T, changedProperties: readonly (keyof T)[]): void;
}

/**
 * A core interface for observable collections. Components can react to this and display the new value as a consequence.
 *
 * Any collection change can be reduced to [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice),
 * thus the colleciton changed notification contains all the necessary information to reproduce the operation on subsequent collections.
 * @template TItem The type of items the collection contains.
 */
export interface INotifyCollectionChanged<TItem> {
    /** An event that is raised when the collection changed. */
    readonly collectionChanged: ICollectionChangedEvent<this, TItem>;
}

/**
 * Contains information about the changes in the collection.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionChange<TItem> {
    /** The start index where the change has happenend. */
    readonly startIndex: number;
    /** An array of added items, if any. */
    readonly addedItems: readonly TItem[];
    /** An array of removed items, if any. */
    readonly removedItems: readonly TItem[];
    /** The operation that was performed */
    readonly operation: CollectionOperation;
}

/**
 * Describes all the possible operations that can be performed on a collection.
 */
export type CollectionOperation = 'push' | 'pop' | 'unshift' | 'shift';

/**
 * A specialized event for subscribing and unsubscribing from collection changed events.
 * @template TSubject Provides the object that raised the event.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionChangedEvent<TSubject, TItem> extends IEvent<TSubject, ICollectionChange<TItem>> {
}

/**
 * A specialized interface for handling collection changed events.
 * @template Provides the object that raised the event.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionChangedEventHandler<TSubject, TItem> extends IEventHandler<TSubject, ICollectionChange<TItem>> {
}