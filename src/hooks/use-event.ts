import type { IEvent, IEventHandler } from '../events';
import { useEffect } from 'react';

/**
 * Represents an event handler callback.
 * @template TSubject The type of object that raises the event.
 * @template TEventArgs Optional, the type of the event context containing additional information about the event.
 * @param subject The object that raised the event.
 * @param args A set of arguments that provide context for the event.
 */
export type EventHandlerCallback<TSubject, TEventArgs = void> = (subject: TSubject, eventArgs: TEventArgs) => void;

/**
 * Subscribes to an event for changes, whenever the event is raised the callback will be invoked.
 * @template TSubject The type of object that raises the event.
 * @template TEventArgs Optional, can be used to provide context when notifying subscribers.
 * @param event The event to subscribe to.
 * @param eventHandlerCallback The callback that handles the event.
 */
export function useEvent<TSubject, TEventArgs = void>(event: IEvent<TSubject, TEventArgs>, eventHandlerCallback: EventHandlerCallback<TSubject, TEventArgs>): void {
    useEffect(
        () => {
            if (event === null || event === undefined || eventHandlerCallback === null || eventHandlerCallback === undefined)
                return;

            const eventHandler: IEventHandler<TSubject, TEventArgs> = {
                handle: eventHandlerCallback
            };
            event.subscribe(eventHandler);

            return () => {
                event.unsubscribe(eventHandler);
            };
        },
        [event, eventHandlerCallback]
    );
}