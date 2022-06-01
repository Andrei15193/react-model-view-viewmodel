import type { IEventHandler, INotifyPropertiesChanged } from '../events';
import { useEffect, useState, } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Watches the view model for changes, requesting a render when it does. The view model and watched properties are part of the hook dependencies.
 * @template TViewModel The type of view model to watch.
 * @param viewModel The view model to change, a view model is any object that implements INotifyPropertiesChanged.
 * @param watchedProperties Optional, when provided, a render will be requested when only one of these properties has changed.
 */
export function watchViewModel<TViewModel extends INotifyPropertiesChanged>(viewModel: TViewModel, watchedProperties?: readonly (keyof TViewModel)[]) {
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