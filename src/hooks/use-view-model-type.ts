import type { INotifyPropertiesChanged } from '../events';
import { useRef } from 'react';
import { watchViewModel } from './watch-view-model';

/** Defines a view model type that has a default constructor. */
export type ViewModelType<TViewModel extends INotifyPropertiesChanged> = {
    new(): TViewModel;
};

/** Ensures a unique instance per component of the given type is created and watches the view model for changes. Returns the view model instance.
 * @param viewModelType - The view model type to initialize.
 * @param watchedProperties - Optional, when provided, will request a render when only one of these properties has changed.
 */
export function useViewModelType<TViewModel extends INotifyPropertiesChanged>(viewModelType: ViewModelType<TViewModel>, watchedProperties?: readonly (keyof TViewModel)[]): TViewModel {
    const $vm = useRef<TViewModel | null>(null);
    if ($vm.current === null)
        $vm.current = new viewModelType();

    watchViewModel($vm.current, watchedProperties);
    return $vm.current;
}