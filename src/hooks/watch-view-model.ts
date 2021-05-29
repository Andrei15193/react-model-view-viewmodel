import type { IEventHandler, INotifyPropertiesChanged } from '../events';
import { useEffect, useState } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Watches the view model for changes, requesting a render when it does.
 * @param viewModel - The view model to change, a view model is any object that implements INotifyPropertiesChanged.
 * @param watchedProperties - Optional, when provided, will request a render when only one of these properties has changed.
 */
export function watchViewModel<TViewModel extends INotifyPropertiesChanged>(viewModel: TViewModel, watchedProperties?: readonly (keyof TViewModel)[]): void {
    const [_, setState] = useState<{} | undefined>(undefined);

    useEffect(
        (): EffectResult => {
            if (!watchedProperties) {
                const propertyChangedEventHandler: IEventHandler<readonly string[]> = {
                    handle(subject, changedProperties) {
                        setState(props => Object.assign({}, props, selectProps(subject, changedProperties)));
                    }
                };
                viewModel.propertiesChanged.subscribe(propertyChangedEventHandler);
                return (): void => {
                    viewModel.propertiesChanged.unsubscribe(propertyChangedEventHandler);
                    setState(undefined);
                };
            }
            else if (watchedProperties.length > 0) {
                const propertyChangedEventHandler: IEventHandler<readonly string[]> = {
                    handle(subject: any, changedProperties: readonly string[]): void {
                        const selectedProps = changedProperties.filter(changedProperty => watchedProperties.indexOf(changedProperty as keyof TViewModel) >= 0);
                        if (selectedProps.length > 0)
                            setState(props => Object.assign({}, props, selectProps(subject, selectedProps)));
                    }
                };
                viewModel.propertiesChanged.subscribe(propertyChangedEventHandler);
                return () => {
                    viewModel.propertiesChanged.unsubscribe(propertyChangedEventHandler);
                    setState(undefined);
                };
            }
        },
        watchedProperties ? [viewModel, ...watchedProperties] : [viewModel]
    );
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