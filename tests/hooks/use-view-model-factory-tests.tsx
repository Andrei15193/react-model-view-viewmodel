import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { type ViewModelFactory, useViewModelFactory } from '../../src/hooks/use-view-model-memo';
import { ViewModel } from '../../src/view-model';

describe('use-view-model-factory/useViewModelFactory', (): void => {
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
        readonly viewModelFactory: ViewModelFactory<TestViewModel>;
        readonly watchedProperties?: readonly (keyof TestViewModel)[];
    }

    function TestComponent({ viewModelFactory, watchedProperties }: ITestComponentProps): JSX.Element {
        const viewModel = useViewModelFactory(viewModelFactory, watchedProperties);

        return (
            <>
                <div>Value1: {viewModel.value1}</div>
                <div>Value2: {viewModel.value2}</div>
            </>
        );
    }

    it('changing the view model does not create a new instace', (): void => {
        const viewModels: TestViewModel[] = [];

        const { getByText } = render(<TestComponent viewModelFactory={() => { const viewModel = new TestViewModel(); viewModels.push(viewModel); return viewModel; }} />);
        expect(getByText('Value1: 0')).not.toBe(undefined);

        act(() => {
            viewModels.forEach(viewModel => viewModel.increment1());
        });

        expect(getByText('Value1: 1')).not.toBe(undefined);
        expect(viewModels.length).toBe(1);
    });

    it('changing the view model updates the component', (): void => {
        let viewModel: TestViewModel | undefined = undefined;
        const { getByText } = render(<TestComponent viewModelFactory={() => viewModel = new TestViewModel()} />);
        expect(getByText('Value1: 0')).not.toBe(undefined);
        expect(getByText('Value2: 0')).not.toBe(undefined);

        act(() => {
            viewModel!.increment1();
        });

        expect(getByText('Value1: 1')).not.toBe(undefined);
        expect(getByText('Value2: 0')).not.toBe(undefined);
    });

    it('changing the view model watched property updates the component', (): void => {
        let viewModel: TestViewModel | undefined = undefined;
        const { getByText } = render(<TestComponent viewModelFactory={() => viewModel = new TestViewModel()} watchedProperties={['value1']} />);
        expect(getByText('Value1: 0')).not.toBe(undefined);
        expect(getByText('Value2: 0')).not.toBe(undefined);

        act(() => {
            viewModel!.increment1();
        });

        expect(getByText('Value1: 1')).not.toBe(undefined);
        expect(getByText('Value2: 0')).not.toBe(undefined);
    });

    it('changing the view model unwatched property does not update the component', (): void => {
        let viewModel: TestViewModel | undefined = undefined;
        const { getByText } = render(<TestComponent viewModelFactory={() => viewModel = new TestViewModel()} watchedProperties={['value1']} />);
        expect(getByText('Value1: 0')).not.toBe(undefined);
        expect(getByText('Value2: 0')).not.toBe(undefined);

        act(() => {
            viewModel!.increment2();
        });

        expect(getByText('Value1: 0')).not.toBe(undefined);
        expect(getByText('Value2: 0')).not.toBe(undefined);
    });
});