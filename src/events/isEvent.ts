import type { IEvent } from './IEvent';

/**
 * Checkes whether the provided instance is an event (implements {@linkcode IEvent}).
 * @template TEvent The type of event to check, defaults to {@linkcode IEvent}.
 * @param maybeEvent The value to check if is an event.
 * @returns Returns `true` if the provided instance implements {@linkcode IEvent}; otherwise `false`.
 */
export function isEvent<TEvent extends IEvent<any, any> = IEvent<any, any>>(maybeEvent: any): maybeEvent is TEvent {
    return (
        maybeEvent !== null
        && maybeEvent !== undefined
        && typeof maybeEvent !== 'function'
        && 'subscribe' in maybeEvent
        && typeof maybeEvent.subscribe === 'function'
        && 'unsubscribe' in maybeEvent
        && typeof maybeEvent.unsubscribe === 'function'
    );
}