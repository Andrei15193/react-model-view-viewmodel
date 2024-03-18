import { IEventHandler } from '../src/events';
import { EventDispatcher } from '../src/events';

describe('events/EventDispatcher', (): void => {
    it('dispatching event having no subscribers', (): void => {
        const eventDispatcher = new EventDispatcher();
        eventDispatcher.dispatch(null);
    });

    it('dispatching event to subscriber passes subject and args', (): void => {
        let invocationCount = 0;
        const subject = {};
        const args = {};

        const eventDispatcher = new EventDispatcher<unknown, {}>();
        eventDispatcher.subscribe({
            handle(actualSubject, actualArgs) {
                invocationCount++;
                expect(actualSubject).toStrictEqual(subject);
                expect(actualArgs).toStrictEqual(args);
            }
        })
        eventDispatcher.dispatch(subject, args);

        expect(invocationCount).toStrictEqual(1);
    });

    it('dispatching event to subscriber that unsubscribes next one no longer notifies it', (): void => {
        const eventDispatcher = new EventDispatcher();
        let secondInvocationCount = 0;
        const secondSubscriber: IEventHandler<unknown> = {
            handle() {
                secondInvocationCount++;
            }
        };
        let firstInvocationCount = 0;
        const firstSubscriber: IEventHandler<unknown> = {
            handle() {
                firstInvocationCount++;
                eventDispatcher.unsubscribe(secondSubscriber);
            }
        };
        eventDispatcher.subscribe(firstSubscriber);
        eventDispatcher.subscribe(secondSubscriber);

        eventDispatcher.dispatch(null);

        expect(firstInvocationCount).toBe(1);
        expect(secondInvocationCount).toBe(0);
    });

    it('dispatching event to handler subscribed twice notifies it twice', (): void => {
        let invocationCount = 0;
        const subscriber: IEventHandler<unknown> = {
            handle() {
                invocationCount++;
            }
        };
        const eventDispatcher = new EventDispatcher();
        eventDispatcher.subscribe(subscriber);
        eventDispatcher.subscribe(subscriber);

        eventDispatcher.dispatch(null);

        expect(invocationCount).toBe(2);
    });

    it('dispatching event to handler subscribed twice then unsubscribed once notifies it once', (): void => {
        let invocationCount = 0;
        const subscriber: IEventHandler<unknown> = {
            handle() {
                invocationCount++;
            }
        };
        const eventDispatcher = new EventDispatcher();
        eventDispatcher.subscribe(subscriber);
        eventDispatcher.subscribe(subscriber);
        eventDispatcher.unsubscribe(subscriber);

        eventDispatcher.dispatch(null);

        expect(invocationCount).toBe(1);
    });
});