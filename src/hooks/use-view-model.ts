import type { INotifyPropertiesChanged, IEventHandler } from '../events';
import { type DependencyList, useMemo, useState, useEffect } from 'react';

/** Represents a view model type.
 * @template TViewModel The type of view model.
 * @template TConstructorArgs The constructor parameter types, defaults to empty tuple.
 */
export type ViewModelType<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[] = []> = {
    new(...constructorArgs: TConstructorArgs): TViewModel;
};

/** Represents a view model factory callback.
 * @template TViewModel The type of view model to create.
 */
export type ViewModelFactory<TViewModel extends INotifyPropertiesChanged> = () => TViewModel;

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
export function useViewModel<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[]>(viewModelType: ViewModelType<TViewModel, TConstructorArgs>, constructorArgs?: ConstructorParameters<ViewModelType<TViewModel, TConstructorArgs>>, watchedProperties?: readonly (keyof TViewModel)[]): TViewModel;

/**
 * Creates a new instance of a view model using the provided callback and watches for property changes.
 * @template TViewModel The type of view model that is created.
 * @param viewModelFactory A callback that provides the view model instance.
 * @param deps Dependencies of the callback, whenever these change the callback is called again, similar to {@link useMemo}.
 * @param watchedProperties Optional, when provided, a render will be requested when only one of these properties has changed.
 * @returns Returns the initialized view model instance.
 */
export function useViewModel<TViewModel extends INotifyPropertiesChanged>(viewModelFactory: ViewModelFactory<TViewModel>, deps: DependencyList, watchedProperties?: readonly (keyof TViewModel)[]): TViewModel;

export function useViewModel<TViewModel extends INotifyPropertiesChanged, TConstructorArgs extends readonly any[]>(typeViewModelOrFactory: TViewModel | ViewModelType<TViewModel, TConstructorArgs> | ViewModelFactory<TViewModel>, constructorArgsOrDepsOrWatchedProperties?: ConstructorParameters<ViewModelType<TViewModel, TConstructorArgs>> | DependencyList | readonly (keyof TViewModel)[], watchedProperties?: readonly (keyof TViewModel)[]): void | TViewModel {
    const isViewModelCase = isViewModel<TViewModel>(typeViewModelOrFactory);
    const constructorArgsOrDeps: TConstructorArgs | DependencyList = isViewModelCase
        ? [typeViewModelOrFactory]
        : (constructorArgsOrDepsOrWatchedProperties || []);

    const viewModel = useMemo(
        () => {
            if (isViewModelCase)
                return typeViewModelOrFactory;

            try {
                const viewModelType = typeViewModelOrFactory as ViewModelType<TViewModel, TConstructorArgs>;
                const constructorArgsAndDeps = constructorArgsOrDeps as TConstructorArgs;
                return new viewModelType(...constructorArgsAndDeps);
            }
            catch {
                const viewModelFactory = typeViewModelOrFactory as ViewModelFactory<TViewModel>;
                return viewModelFactory();
            }
        },
        constructorArgsOrDeps
    );

    const actualWatchedProperties = isViewModelCase
        ? (constructorArgsOrDepsOrWatchedProperties as readonly (keyof TViewModel)[])
        : watchedProperties;
    useViewModelProperties(viewModel, actualWatchedProperties);

    return viewModel;
}

/**
 * Checkes whether the provided instance is a view model (implements {@link INotifyPropertiesChanged}).
 * @template TViewModel The type of view model to check, defaults to {@link INotifyPropertiesChanged}.
 * @param maybeViewModel The value to check if is a view model.
 * @returns Returns `true` if the provided instance implements {@link INotifyPropertiesChanged}; otherwise `false`.
 */
export function isViewModel<TViewModel extends INotifyPropertiesChanged = INotifyPropertiesChanged>(maybeViewModel: any): maybeViewModel is TViewModel {
    return maybeViewModel !== undefined && maybeViewModel !== null && !(maybeViewModel instanceof Function) && 'propertiesChanged' in maybeViewModel;
}

type Destructor = () => void;
type EffectResult = void | Destructor;

function useViewModelProperties<TViewModel extends INotifyPropertiesChanged>(viewModel: TViewModel, watchedProperties?: readonly (keyof TViewModel)[]): void {
    const [_, setState] = useState<{} | undefined>(undefined);

    useEffect(
        (): EffectResult => {
            if (!watchedProperties) {
                let previousProps = {};
                const propertyChangedEventHandler: IEventHandler<readonly string[]> = {
                    handle(subject, changedProperties) {
                        const actualChangedProperties = getChangedProperties(previousProps, subject, changedProperties);

                        if (actualChangedProperties === undefined)
                            setState(undefined);
                        else if (actualChangedProperties.length > 0) {
                            previousProps = Object.assign({}, previousProps, selectProps(subject, actualChangedProperties));
                            setState(previousProps);
                        }
                    }
                };
                viewModel.propertiesChanged.subscribe(propertyChangedEventHandler);
                return () => {
                    viewModel.propertiesChanged.unsubscribe(propertyChangedEventHandler);
                    setState(undefined);
                }
            }
            else if (watchedProperties.length > 0) {
                let props = {};
                const propertyChangedEventHandler: IEventHandler<readonly string[]> = {
                    handle(subject: any, changedProperties: readonly string[]): void {
                        const watchedChangedProperties = changedProperties.filter(changedProperty => watchedProperties.includes(changedProperty as keyof TViewModel));
                        const actualChangedProperties = getChangedProperties(props, subject, watchedChangedProperties);

                        if (actualChangedProperties === undefined)
                            setState(undefined);
                        else if (actualChangedProperties.length > 0) {
                            props = Object.assign({}, props, selectProps(subject, actualChangedProperties));
                            setState(props);
                        }
                    }
                }
                viewModel.propertiesChanged.subscribe(propertyChangedEventHandler);
                return () => {
                    viewModel.propertiesChanged.unsubscribe(propertyChangedEventHandler);
                    setState(undefined);
                }
            }
        },
        watchedProperties ? [viewModel, ...watchedProperties] : [viewModel]
    );
}

function getChangedProperties(previous: any, next: any, properties: readonly string[]): readonly string[] {
    if (next === undefined)
        return undefined;
    else if (previous === undefined)
        return properties;
    else
        return properties.filter(property => previous[property] !== next[property]);
}

function selectProps(object: any, properties: readonly string[]): void {
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