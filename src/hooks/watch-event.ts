import type { DependencyList } from 'react';
import type { IEvent, IEventHandler } from '../events';
import { useEffect } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Defines the signature of an event handler callback. */
export type EventHandler<TEventArgs> = (subject: object, args: TEventArgs) => void;

/** Watches the event for changes, whenever the evet is fired the callback is being invoked. The callback is not part of the hook dependencies, only the event is.
 * @param event - The event to watch.
 * @param handler - The callback that handles the event.
 * @param deps - Optional, additional dependencies along side the event.
 */
export function watchEvent<TEventArgs>(event: IEvent<TEventArgs>, handler: EventHandler<TEventArgs>, deps?: DependencyList): void {
    useEffect(
        (): EffectResult => {
            if (event) {
                const eventHandler: IEventHandler<TEventArgs> = { handle: handler };

                event.subscribe(eventHandler);
                return () => event.unsubscribe(eventHandler);
            }
        },
        deps ? [event, ...deps] : [event]
    );
}