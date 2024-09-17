import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { type INotifyPropertiesChanged, ViewModel } from '../../viewModels';
import { type ViewModelType, useViewModel } from '../UseViewModel';

describe('useViewModel', (): void => {
    interface ITestComponentProps<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[]> {
        readonly viewModelOrType: TViewModel | ViewModelType<TViewModel, TConstructorArgs>;
        readonly constructorArgs: TConstructorArgs;

        children(viewModel: TViewModel): JSX.Element;
    }

    function TestComponent<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[]>({ viewModelOrType, constructorArgs, children }: ITestComponentProps<TViewModel, TConstructorArgs>): JSX.Element {
        const viewModel = useViewModel(viewModelOrType, constructorArgs);

        return children(viewModel);
    }

    it('updating the view model does not create a new instance', () => {
        const viewModels: TestCaseViewModel[] = [];
        class TestCaseViewModel extends ViewModel {
            private _value: number = 0;

            public constructor() {
                super();

                viewModels.push(this);
            }

            public get value(): number {
                return this._value;
            }

            public increment(): void {
                this._value++;
                this.notifyPropertiesChanged("value");
            }
        }

        const { getByText } = render(
            <TestComponent
                viewModelOrType={TestCaseViewModel}
                constructorArgs={[]}>
                {viewModel => (
                    <>
                        Value: {viewModel.value}
                    </>
                )}
            </TestComponent>
        );
        expect(getByText('Value: 0')).not.toBe(undefined);

        act(() => {
            viewModels.forEach(viewModel => viewModel.increment());
        });

        expect(getByText('Value: 1')).not.toBe(undefined);
        expect(viewModels.length).toBe(1);
    });

    it('changing the constructor arguments creates a new instance', () => {
        const viewModels: TestCaseViewModel[] = [];
        class TestCaseViewModel extends ViewModel {
            public constructor(value: number) {
                super();

                this.value = value;
                viewModels.push(this);
            }

            public readonly value: number;

            public notifyPropertiesChanged(): void {
                super.notifyPropertiesChanged("value");
            }
        }

        const constructorArgs: [number] = [0]

        const { getByText } = render(
            <TestComponent
                viewModelOrType={TestCaseViewModel}
                constructorArgs={constructorArgs}>
                {viewModel => (
                    <>
                        Value: {viewModel.value}
                    </>
                )}
            </TestComponent>
        );
        expect(getByText('Value: 0')).not.toBe(undefined);

        act(() => {
            constructorArgs[0] = 1;
            viewModels.forEach(viewModel => viewModel.notifyPropertiesChanged());
        });

        expect(getByText('Value: 1')).not.toBe(undefined);
        expect(viewModels.length).toBe(2);
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

        const viewModel = new TestCaseViewModel();

        const { getByText } = render(
            <TestComponent
                viewModelOrType={viewModel}
                constructorArgs={[]}>
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

        let renderCount = 0;
        const viewModel = new TestCaseViewModel();

        const { getByText } = render(
            <TestComponent
                viewModelOrType={viewModel}
                constructorArgs={[]}>
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