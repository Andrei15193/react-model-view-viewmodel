import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import './setup';
import { watchViewModel } from '../../src/hooks/watch-view-model';
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
    }

    interface ITestComponentProps {
        readonly viewModel: TestViewModel;
        readonly watchedProperties?: readonly (keyof TestViewModel)[];
    }

    function TestComponent({ viewModel, watchedProperties }: ITestComponentProps): JSX.Element {
        watchViewModel(viewModel, watchedProperties);

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

        viewModel.increment1();

        expect(getByText('Value1: 1')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;
    });

    it('changing the view model watched property updates the component', (): void => {
        const viewModel = new TestViewModel();
        const { getByText } = render(<TestComponent viewModel={viewModel} watchedProperties={['value1']} />);
        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;

        viewModel.increment1();

        expect(getByText('Value1: 1')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;
    });

    it('changing the view model unwatched property does not update the component', (): void => {
        const viewModel = new TestViewModel();
        const { getByText } = render(<TestComponent viewModel={viewModel} watchedProperties={['value1']} />);
        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;

        viewModel.increment2();

        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;
    });
});