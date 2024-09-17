import React, { type DependencyList } from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { type INotifyPropertiesChanged, ViewModel } from '../../viewModels';
import { type ViewModelFactory, useViewModelMemo } from '../UseViewModelMemo';

describe('useViewModelMemo', (): void => {
    interface ITestComponentProps<TViewModel extends INotifyPropertiesChanged> {
        readonly viewModelFactory: ViewModelFactory<TViewModel>;
        readonly deps: DependencyList;

        children(viewModel: TViewModel): JSX.Element;
    }

    function TestComponent<TViewModel extends INotifyPropertiesChanged>({ viewModelFactory, deps, children }: ITestComponentProps<TViewModel>): JSX.Element {
        const viewModel = useViewModelMemo(viewModelFactory, deps);

        return children(viewModel);
    }

    it('updating the view model does not create a new instance', () => {
        class TestCaseViewModel extends ViewModel {
            private _value: number = 0;

            public get value(): number {
                return this._value;
            }

            public increment(): void {
                this._value++;
                this.notifyPropertiesChanged("value");
            }
        }

        let viewModel: TestCaseViewModel;
        let invocationCount = 0;

        const { getByText } = render(
            <TestComponent
                viewModelFactory={() => {
                    invocationCount++;
                    viewModel = new TestCaseViewModel();

                    return viewModel;
                }}
                deps={[]}>
                {viewModel => (
                    <>
                        Value: {viewModel.value}
                    </>
                )}
            </TestComponent>
        );
        expect(getByText('Value: 0')).not.toBe(undefined);

        act(() => {
            viewModel.increment();
        });

        expect(getByText('Value: 1')).not.toBe(undefined);
        expect(invocationCount).toBe(1);
    });

    it('changing the deps creates a new instance', () => {
        class TestCaseViewModel extends ViewModel {
            private _value: number = 0;

            public get value(): number {
                return this._value;
            }

            public increment(): void {
                this._value++;
                this.notifyPropertiesChanged("value");
            }
        }

        const deps: [number] = [0];
        let viewModel: TestCaseViewModel;
        let invocationCount = 0;

        const { getByText } = render(
            <TestComponent
                viewModelFactory={() => {
                    invocationCount++;
                    viewModel = new TestCaseViewModel();

                    return viewModel;
                }}
                deps={deps}>
                {viewModel => (
                    <>
                        Value: {viewModel.value}
                    </>
                )}
            </TestComponent>
        );
        expect(getByText('Value: 0')).not.toBe(undefined);

        act(() => {
            deps[0] = 1;
            viewModel.increment();
        });

        expect(getByText('Value: 0')).not.toBe(undefined);
        expect(invocationCount).toBe(2);
    });

    it('component reacts to view model changes', () => {
        class TestCaseViewModel extends ViewModel {
            private _value: number = 0;

            public get value(): number {
                return this._value;
            }

            public increment(): void {
                this._value++;
                this.notifyPropertiesChanged("value");
            }
        }

        let viewModel: TestCaseViewModel;

        const { getByText } = render(
            <TestComponent
                viewModelFactory={() => {
                    viewModel = new TestCaseViewModel();

                    return viewModel;
                }}
                deps={[]}>
                {viewModel => (
                    <>
                        Value: {viewModel.value}
                    </>
                )}
            </TestComponent>
        );
        expect(getByText('Value: 0')).not.toBe(undefined);

        act(() => {
            viewModel.increment();
        });

        expect(getByText('Value: 1')).not.toBe(undefined);
    });

    it('successive view model changes without actually changing anything does not cause re-render', () => {
        class TestCaseViewModel extends ViewModel {
            private _value: number = 0;

            public get value(): number {
                return this._value;
            }

            public set value(value: number) {
                this._value = value;
                this.notifyPropertiesChanged("value");
            }
        }

        let viewModel: TestCaseViewModel;
        let renderCount = 0;

        const { getByText } = render(
            <TestComponent
                viewModelFactory={() => {
                    viewModel = new TestCaseViewModel();

                    return viewModel;
                }}
                deps={[]}>
                {viewModel => {
                    renderCount++;

                    return (
                        <>
                            Value: {viewModel.value}
                        </>
                    );
                }}
            </TestComponent>
        );
        expect(getByText('Value: 0')).not.toBe(undefined);

        act(() => {
            viewModel.value = 0;
            viewModel.value = 0;
            viewModel.value = 0;
        });

        expect(getByText('Value: 0')).not.toBe(undefined);
        expect(renderCount).toBe(2);
    });
});