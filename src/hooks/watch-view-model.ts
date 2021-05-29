import type { INotifyPropertiesChanged } from '../events';
import { useState, } from 'react';
import { watchEvent } from './watch-event';

/** Watches the view model for changes, requesting a render when it does. The view model and watched properties are part of the hook dependencies.
 * @param viewModel - The view model to change, a view model is any object that implements INotifyPropertiesChanged.
 * @param watchedProperties - Optional, when provided, will request a render when only one of these properties has changed.
 */
export function watchViewModel<TViewModel extends INotifyPropertiesChanged>(viewModel: TViewModel, watchedProperties?: readonly (keyof TViewModel)[]): void {
    const [_, setState] = useState<{} | undefined>(undefined);

    function setAllProperties(subject: any, changedProperties: readonly string[]) {
        setState(props => Object.assign({}, props, selectProps(subject, changedProperties)));
    }

    function setOnlyWatchedProperties(subject: any, changedProperties: readonly string[]): void {
        const selectedProps = changedProperties.filter(changedProperty => watchedProperties.indexOf(changedProperty as keyof TViewModel) >= 0);
        if (selectedProps.length > 0)
            setState(props => Object.assign({}, props, selectProps(subject, selectedProps)));
    }

    watchEvent(viewModel && viewModel.propertiesChanged, watchedProperties ? setOnlyWatchedProperties : setAllProperties, watchedProperties);
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