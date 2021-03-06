import type { INotifyPropertiesChanged } from '../events';
import { useRef } from 'react';
import { watchViewModel } from './watch-view-model';

/** Represents a view model factory callback.
 * @template TViewModel The type of view model to create.
 */
export type ViewModelFactory<TViewModel extends INotifyPropertiesChanged> = () => TViewModel;

/** Ensures a unique instance per component that is generated by the factory is created and watches the view model for changes. Returns the view model instance.
 * @template TViewModel The type of view model to create.
 * @param viewModelFactory The view model factory callback that initializes the instance.
 * @param watchedProperties Optional, a render will be requested when only one of these properties has changed.
 */
export function useViewModelFactory<TViewModel extends INotifyPropertiesChanged>(viewModelFactory: ViewModelFactory<TViewModel>, watchedProperties?: readonly (keyof TViewModel)[]): TViewModel {
    const $vm = useRef<TViewModel | null>(null);
    if ($vm.current === null)
        $vm.current = viewModelFactory();

    watchViewModel($vm.current, watchedProperties);
    return $vm.current;
}