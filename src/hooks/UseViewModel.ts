import type { INotifyPropertiesChanged, IPropertiesChangedEventHandler } from '../viewModels';
import { useState, useEffect, useRef } from 'react';
import { isViewModel } from '../viewModels';

const emptyConstructorArgs: readonly unknown[] = [];

/**
 * Represents a view model type.
 * @template TViewModel The type of view model.
 * @template TConstructorArgs The constructor parameter types, defaults to an empty tuple.
 */
export type ViewModelType<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[] = []> = {
    new(...constructorArgs: TConstructorArgs): TViewModel;
};

/**
 * Watches the given view model for property changes.
 * @template TViewModel The type of view model.
 * @param viewModel The view model to watch.
 * @returns Returns the provided view model instance.
 */
export function useViewModel<TViewModel extends INotifyPropertiesChanged>(viewModel: TViewModel): TViewModel;

/**
 * Creates a new instance of a view model of the given type and watches for property changes.
 * @template TViewModel The type of view model.
 * @param viewModelType The view model class declaration to instantiate.
 * @param constructorArgs The constructor arguments used for initialization, whenever these change a new instance is created.
 * @returns Returns the created view model instance.
 */
export function useViewModel<TViewModel extends INotifyPropertiesChanged>(viewModelType: ViewModelType<TViewModel>): TViewModel;

/**
 * Creates a new instance of a view model of the given type and watches for property changes, constructor arguments act as dependencies.
 * @template TViewModel The type of view model.
 * @template TConstructorArgs The constructor parameter types.
 * @param viewModelType The view model class declaration to instantiate.
 * @param constructorArgs The constructor arguments used for initialization, whenever these change a new instance is created.
 * @returns Returns the created view model instance.
 */
export function useViewModel<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[]>(viewModelType: ViewModelType<TViewModel, TConstructorArgs>, constructorArgs: TConstructorArgs): TViewModel;

/**
 * Watches the provided view model, or creates a new instance of the given type and watches it for property changes, constructor arguments act as dependencies.
 * @template TViewModel The type of view model.
 * @template TConstructorArgs The constructor parameter types.
 * @param viewModelType The view model or class declaration to instantiate.
 * @param constructorArgs The constructor arguments used for initialization, whenever these change a new instance is created.
 * @returns Returns the provided view model or the initialized one.
 */
export function useViewModel<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[]>(viewModelOrType: TViewModel | ViewModelType<TViewModel, TConstructorArgs>, constructorArgs: TConstructorArgs): TViewModel;

export function useViewModel<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[]>(viewModelOrType: TViewModel | ViewModelType<TViewModel, TConstructorArgs>, constructorArgs?: TConstructorArgs): TViewModel {
    const [, setState] = useState<unknown>(null);

    const viewModelPropsRef = useRef<Map<keyof TViewModel, unknown> | null>(null);
    if (viewModelPropsRef.current === null)
        viewModelPropsRef.current = new Map<keyof TViewModel, unknown>();
    const { current: cachedViewModelPropertyValues } = viewModelPropsRef;

    const viewModelRef = useRef<TViewModel | null>(null)
    const normalizedConstructorArgs = constructorArgs === null || constructorArgs === undefined || !Array.isArray(constructorArgs) ? emptyConstructorArgs as TConstructorArgs : constructorArgs;
    const cachedConstructorArgsRef = useRef<TConstructorArgs>(normalizedConstructorArgs);

    if (viewModelRef.current === null
        || cachedConstructorArgsRef.current.length !== normalizedConstructorArgs.length
        || cachedConstructorArgsRef.current.some((constructorArg, constructorArgIndex) => constructorArg !== normalizedConstructorArgs[constructorArgIndex])) {
        cachedConstructorArgsRef.current = normalizedConstructorArgs.slice() as any as TConstructorArgs;
        viewModelRef.current = isViewModel(viewModelOrType) ? viewModelOrType : new viewModelOrType(...normalizedConstructorArgs);
    }
    const { current: viewModel } = viewModelRef;

    useEffect(
        () => {
            const viewModelPropertiesChangedEventHandler: IPropertiesChangedEventHandler<TViewModel> = {
                handle(_, changedProperties) {
                    let hasChanges = false;
                    changedProperties.forEach(changedProperty => {
                        const viewModelPropertyValue = viewModel[changedProperty];
                        hasChanges = hasChanges || cachedViewModelPropertyValues.get(changedProperty) !== viewModelPropertyValue;

                        cachedViewModelPropertyValues.set(changedProperty, viewModelPropertyValue);
                    });

                    if (hasChanges)
                        setState({});
                }
            };

            viewModel.propertiesChanged.subscribe(viewModelPropertiesChangedEventHandler);
            return () => {
                viewModel.propertiesChanged.unsubscribe(viewModelPropertiesChangedEventHandler);
                cachedViewModelPropertyValues.clear();
            }
        },
        [viewModel, cachedViewModelPropertyValues, setState]
    )

    return viewModel;
}