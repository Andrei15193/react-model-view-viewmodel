import { EventHandler } from '../../src/hooks/use-event';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { EventDispatcher } from '../../src/events';
import { watchEvent } from '../../src/hooks/use-event';
import { ViewModel } from '../../src/view-model';

describe('watch-event/useViewModelType', (): void => {
    class TestViewModel extends ViewModel {
        public event = new EventDispatcher<unknown, unknown>();
    }

    interface ITestComponentProps {
        readonly viewModel: TestViewModel;
        readonly eventHandler: EventHandler<unknown>;
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
        expect(invocationCount).toBe(0);

        act(() => {
            viewModel.event.dispatch(undefined, undefined);
        });

        expect(invocationCount).toBe(1);
    });

    it('raising the event passes subject and event args', (): void => {
        const subject = {};
        const eventArgs = {};
        const viewModel = new TestViewModel();
        let invocationCount = 0;
        render(<TestComponent viewModel={viewModel} eventHandler={(actualSubject, actualEventArgs) => {
            invocationCount++;
            expect(actualSubject).toBe(subject);
            expect(actualEventArgs).toBe(eventArgs);
        }} />);
        expect(invocationCount).toBe(0);

        act(() => {
            viewModel.event.dispatch(subject, eventArgs);
        });

        expect(invocationCount).toBe(1);
    });
});