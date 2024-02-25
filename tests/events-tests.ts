import type { IEventHandler } from '../src/events';
import { expect } from 'chai';
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
                expect(actualSubject).is.equal(subject);
                expect(actualArgs).is.equal(args);
            }
        })
        eventDispatcher.dispatch(subject, args);

        expect(invocationCount).is.equal(1);
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

        expect(firstInvocationCount).is.equal(1);
        expect(secondInvocationCount).is.equal(0);
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

        expect(invocationCount).is.equal(2);
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

        expect(invocationCount).is.equal(1);
    });
});