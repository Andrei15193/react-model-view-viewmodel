import '../react-test-setup';
import type { ViewModelType } from '../../src/hooks/use-view-model-type';
import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { useViewModelType } from '../../src/hooks/use-view-model-type';
import { ViewModel } from '../../src/view-model';

describe('use-view-model-type/useViewModelType', (): void => {
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
        readonly viewModelType: ViewModelType<TestViewModel>;
        readonly watchedProperties?: readonly (keyof TestViewModel)[];
    }

    function TestComponent({ viewModelType, watchedProperties }: ITestComponentProps): JSX.Element {
        const viewModel = useViewModelType(viewModelType, watchedProperties);

        return (
            <>
                <div>Value1: {viewModel.value1}</div>
                <div>Value2: {viewModel.value2}</div>
            </>
        );
    }

    it('changing the view model does not create a new instace', (): void => {
        const viewModels: TestViewModel[] = [];
        class TestCaseViewModel extends TestViewModel {
            public constructor() {
                super();
                viewModels.push(this);
            }
        }

        const { getByText } = render(<TestComponent viewModelType={TestCaseViewModel} />);
        expect(getByText('Value1: 0')).not.to.be.undefined;

        viewModels.forEach(viewModel => viewModel.increment1());

        expect(getByText('Value1: 1')).not.to.be.undefined;
        expect(viewModels.length).is.equal(1);
    });

    it('changing the view model updates the component', (): void => {
        let viewModel: TestViewModel = undefined;
        class TestCaseViewModel extends TestViewModel {
            public constructor() {
                super();
                viewModel = this;
            }
        }

        const { getByText } = render(<TestComponent viewModelType={TestCaseViewModel} />);
        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;

        viewModel.increment1();

        expect(getByText('Value1: 1')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;
    });

    it('changing the view model watched property updates the component', (): void => {
        let viewModel: TestViewModel = undefined;
        class TestCaseViewModel extends TestViewModel {
            public constructor() {
                super();
                viewModel = this;
            }
        }
        const { getByText } = render(<TestComponent viewModelType={TestCaseViewModel} watchedProperties={['value1']} />);
        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;

        viewModel.increment1();

        expect(getByText('Value1: 1')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;
    });

    it('changing the view model unwatched property does not update the component', (): void => {
        let viewModel: TestViewModel = undefined;
        class TestCaseViewModel extends TestViewModel {
            public constructor() {
                super();
                viewModel = this;
            }
        }
        const { getByText } = render(<TestComponent viewModelType={TestCaseViewModel} watchedProperties={['value1']} />);
        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;

        viewModel.increment2();

        expect(getByText('Value1: 0')).not.to.be.undefined;
        expect(getByText('Value2: 0')).not.to.be.undefined;
    });
});