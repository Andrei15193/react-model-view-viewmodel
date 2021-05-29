import type { EventHandler } from '../../src/hooks/watch-event';
import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import './setup';
import { DispatchEvent } from '../../src/events';
import { watchEvent } from '../../src/hooks/watch-event';
import { ViewModel } from '../../src/view-model';

describe('watch-event/useViewModelType', (): void => {
    class TestViewModel extends ViewModel {
        public event = new DispatchEvent<any>();
    }

    interface ITestComponentProps {
        readonly viewModel: TestViewModel;
        readonly eventHandler: EventHandler<any>;
    }

    function TestComponent({ viewModel, eventHandler }: ITestComponentProps): JSX.Element {
        watchEvent(viewModel.event, eventHandler);

        return (
            <></>
        );
    }

    it('raising the event executes the callback', (): void => {
        const viewModel = new TestViewModel();
        let invocationCount = 0;
        render(<TestComponent viewModel={viewModel} eventHandler={() => { invocationCount++; }} />);
        expect(invocationCount).is.equal(0);

        viewModel.event.dispatch(undefined, undefined);

        expect(invocationCount).is.equal(1);
    });

    it('raising the event passes subject and event args', (): void => {
        const subject = {};
        const eventArgs = {};
        const viewModel = new TestViewModel();
        let invocationCount = 0;
        render(<TestComponent viewModel={viewModel} eventHandler={(actualSubject, actualEventArgs) => {
            invocationCount++;
            expect(actualSubject).is.equal(subject);
            expect(actualEventArgs).is.equal(eventArgs);
        }} />);
        expect(invocationCount).is.equal(0);

        viewModel.event.dispatch(subject, eventArgs);

        expect(invocationCount).is.equal(1);
    });
});