import type { IEventHandler } from '../src/events';
import { DispatchEvent } from '../src/events';
import { expect } from "chai";

describe("events/DispatchEvent", (): void => {
    it("dispatching event having no subscribers", (): void => {
        const dispatchEvent = new DispatchEvent();
        dispatchEvent.dispatch(null);
    });

    it("dispatching event to subscriber passes subject and args", (): void => {
        let invocationCount = 0;
        const subject = {};
        const args = {};

        const dispatchEvent = new DispatchEvent<{}>();
        dispatchEvent.subscribe({
            handle(actualSubject, actualArgs) {
                invocationCount++;
                expect(actualSubject).is.equal(subject);
                expect(actualArgs).is.equal(args);
            }
        })
        dispatchEvent.dispatch(subject, args);

        expect(invocationCount).is.equal(1);
    });

    it("dispatching event to subscriber that unsubscribes next one no longer notifies it", (): void => {
        const dispatchEvent = new DispatchEvent();
        let secondInvocationCount = 0;
        const secondSubscriber: IEventHandler = {
            handle() {
                secondInvocationCount++;
            }
        };
        let firstInvocationCount = 0;
        const firstSubscriber: IEventHandler = {
            handle() {
                firstInvocationCount++;
                dispatchEvent.unsubscribe(secondSubscriber);
            }
        };
        dispatchEvent.subscribe(firstSubscriber);
        dispatchEvent.subscribe(secondSubscriber);

        dispatchEvent.dispatch(null);

        expect(firstInvocationCount).is.equal(1);
        expect(secondInvocationCount).is.equal(0);
    });

    it("dispatching event to handler subscribed twice notifies it twice", (): void => {
        let invocationCount = 0;
        const subscriber: IEventHandler = {
            handle() {
                invocationCount++;
            }
        };
        const dispatchEvent = new DispatchEvent();
        dispatchEvent.subscribe(subscriber);
        dispatchEvent.subscribe(subscriber);

        dispatchEvent.dispatch(null);

        expect(invocationCount).is.equal(2);
    });

    it("dispatching event to handler subscribed twice then unsubscribed once notifies it once", (): void => {
        let invocationCount = 0;
        const subscriber: IEventHandler = {
            handle() {
                invocationCount++;
            }
        };
        const dispatchEvent = new DispatchEvent();
        dispatchEvent.subscribe(subscriber);
        dispatchEvent.subscribe(subscriber);
        dispatchEvent.unsubscribe(subscriber);

        dispatchEvent.dispatch(null);

        expect(invocationCount).is.equal(1);
    });
});