import type { INotifyPropertiesChanged, IPropertiesChangedEventHandler } from '../events';
import { type DependencyList, useMemo, useState, useEffect } from 'react';
import { isViewModel } from '../view-model';

/** Represents a view model type.
 * @template TViewModel The type of view model.
 * @template TConstructorArgs The constructor parameter types, defaults to empty tuple.
 */
export type ViewModelType<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[] = []> = {
    new(...constructorArgs: TConstructorArgs): TViewModel;
};

/**
 * Watches a view model for property changes.
 * @template TViewModel The type of view model to watch.
 * @param viewModel The view model to watch.
 * @param watchedProperties Optional, when provided, a render will be requested when only one of these properties has changed.
 */
export function useViewModel<TViewModel extends INotifyPropertiesChanged>(viewModel: TViewModel, watchedProperties?: readonly (keyof TViewModel)[]): void;

/**
 * Creates a new instance of a view model of the given type and watches for property changes, constructor arguments act as dependencies.
 * @template TViewModel The type of view model to initialize.
 * @template TConstructorArgs The constructor parameter types.
 * @param viewModelType The type object (class declaration or expression) of the view model.
 * @param constructorArgs The constructor arguments used for initialization, whenever these change a new instance is created.
 * @param watchedProperties Optional, when provided, a render will be requested when only one of these properties has changed.
 * @returns Returns the initialized view model instance.
 */
export function useViewModel<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[]>(viewModelType: ViewModelType<TViewModel, TConstructorArgs>, constructorArgs: ConstructorParameters<ViewModelType<TViewModel, TConstructorArgs>>, watchedProperties?: readonly (keyof TViewModel)[]): TViewModel;

export function useViewModel<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[]>(viewModelOrViewModelType: TViewModel | ViewModelType<TViewModel, TConstructorArgs>, constructorArgsOrWatchedProperties?: ConstructorParameters<ViewModelType<TViewModel, TConstructorArgs>> | readonly (keyof TViewModel)[], watchedProperties?: readonly (keyof TViewModel)[]): void | TViewModel {
    const isViewModelCase = isViewModel<TViewModel>(viewModelOrViewModelType);
    const dependencies: DependencyList = isViewModelCase
        ? [isViewModelCase, viewModelOrViewModelType]
        : [isViewModelCase, ...(constructorArgsOrWatchedProperties || [])];

    const viewModel = useMemo(
        () => isViewModelCase ? viewModelOrViewModelType : new viewModelOrViewModelType(...(constructorArgsOrWatchedProperties || []) as TConstructorArgs),
        dependencies
    );

    const actualWatchedProperties = isViewModelCase
        ? (constructorArgsOrWatchedProperties as readonly (keyof TViewModel)[])
        : watchedProperties;
    useViewModelProperties(viewModel, actualWatchedProperties);

    return viewModel;
}

type Destructor = () => void;
type EffectResult = void | Destructor;

function useViewModelProperties<TViewModel extends INotifyPropertiesChanged>(viewModel: TViewModel, watchedProperties?: readonly (keyof TViewModel)[]): void {
    const [, setState] = useState<{} | undefined>(undefined);
    useEffect(
        (): EffectResult => {
            let previousProps: Readonly<Record<string, any>> = {};
            const propertyChangedEventHandler: IPropertiesChangedEventHandler<TViewModel> = {
                handle(subject, changedProperties) {
                    const actualChangedProperties = getChangedProperties(previousProps, subject, changedProperties);
                    const actualChangedWatchedProperties = actualChangedProperties === null || actualChangedProperties === undefined || watchedProperties === null || watchedProperties === undefined
                        ? actualChangedProperties
                        : actualChangedProperties.filter(actualChangedProperty => watchedProperties.includes(actualChangedProperty as keyof TViewModel));
                    if (actualChangedWatchedProperties === null || actualChangedWatchedProperties === undefined) {
                        previousProps = {};
                        setState(previousProps);
                    }
                    else if (actualChangedWatchedProperties.length > 0) {
                        previousProps = Object.assign({}, previousProps, selectProps(subject, actualChangedWatchedProperties));
                        setState(previousProps);
                    }
                }
            };
            viewModel.propertiesChanged.subscribe(propertyChangedEventHandler);
            return () => {
                viewModel.propertiesChanged.unsubscribe(propertyChangedEventHandler);
                previousProps = {};
                setState({});
            };
        },
        (watchedProperties === null || watchedProperties === undefined) ? [viewModel] : [viewModel, ...watchedProperties]
    );
}

function getChangedProperties(previous: any, next: any, properties: readonly PropertyKey[]): readonly PropertyKey[] | undefined {
    if (next === null || next === undefined || previous === null || previous === undefined)
        return undefined;
    else
        return properties.filter(property => previous[property] !== next[property]);
}

function selectProps(object: any, properties: readonly PropertyKey[]): void {
    return properties.reduce<any>(
        (result, property) => {
            result[property] = object[property];
            return result;
        },
        {}
    );
}

/** Watches the view model for changes, requesting a render when it does. The view model and watched properties are part of the hook dependencies.
 * @deprecated In future versions this hook will be removed, switch to {@link useViewModel}.
 * @template TViewModel The type of view model to watch.
 * @param viewModel The view model to change, a view model is any object that implements INotifyPropertiesChanged.
 * @param watchedProperties Optional, when provided, a render will be requested when only one of these properties has changed.
 */
export function watchViewModel<TViewModel extends INotifyPropertiesChanged>(viewModel: TViewModel, watchedProperties?: readonly (keyof TViewModel)[]): void {
    useViewModel(viewModel, watchedProperties);
}