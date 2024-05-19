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