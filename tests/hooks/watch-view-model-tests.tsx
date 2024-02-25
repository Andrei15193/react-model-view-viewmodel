import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { watchViewModel } from '../../src/hooks/use-view-model';
import { ViewModel } from '../../src/view-model';

describe('watch-view-model/watchViewModel', (): void => {
    class TestViewModel extends ViewModel {
        private _value1: number = 0;
        private _value2: number = 0;

        public get value1(): number {
            return this._value1;
        }

        public get value2(): number {
            return this._value2;
        }

        public increment1(): void {
            this._value1++;
            this.notifyPropertiesChanged('value1');
        }

        public increment2(): void {
            this._value2++;
            this.notifyPropertiesChanged('value2');
        }

        public notifyPropertiesChanged(changedProperty: keyof this, ...otherChangedProperties: readonly (keyof this)[]): void {
            super.notifyPropertiesChanged(changedProperty, ...otherChangedProperties);
        }
    }

    interface ITestComponentProps {
        readonly viewModel: TestViewModel;
        readonly watchedProperties?: readonly (keyof TestViewModel)[];

        renderCallback?(): void;
    }

    function TestComponent({ viewModel, watchedProperties, renderCallback }: ITestComponentProps): JSX.Element {
        watchViewModel(viewModel, watchedProperties);

        renderCallback && renderCallback();

        return (
            <>
                <div>Value1: {viewModel.value1}</div>
                <div>Value2: {viewModel.value2}</div>
            </>
        );
    }

    it('changing the view model updates the component', (): void => {
        const viewModel = new TestViewModel();
        const { getByText } = render(<TestComponent viewModel={viewModel} />);
        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;

        act(() => {
            viewModel.increment1();
        });

        expect(getByText('Value1: 1')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;
    });

    it('changing the view model watched property updates the component', (): void => {
        const viewModel = new TestViewModel();
        const { getByText } = render(<TestComponent viewModel={viewModel} watchedProperties={['value1']} />);
        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;

        act(() => {
            viewModel.increment1();
        });

        expect(getByText('Value1: 1')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;
    });

    it('changing the view model unwatched property does not update the component', (): void => {
        const viewModel = new TestViewModel();
        const { getByText } = render(<TestComponent viewModel={viewModel} watchedProperties={['value1']} />);
        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;

        act(() => {
            viewModel.increment2();
        });

        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;
    });

    it('subsequent property changed notifications do not render the component if it has no change', (): void => {
        const viewModel = new TestViewModel();
        let renderCount = 0;
        render(<TestComponent viewModel={viewModel} renderCallback={() => renderCount++} />);
        expect(renderCount).is.equal(1);

        act(() => {
            viewModel.notifyPropertiesChanged('value1');
        });
        expect(renderCount).is.equal(2);

        act(() => {
            viewModel.notifyPropertiesChanged('value1');
        });
        expect(renderCount).is.equal(2);
    });
});