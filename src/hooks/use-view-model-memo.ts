import type { INotifyPropertiesChanged } from '../viewModels';
import { type DependencyList, useMemo } from 'react';
import { useViewModel } from './use-view-model';

/** Represents a view model factory callback.
 * @template TViewModel The type of view model to create.
 */
export type ViewModelFactory<TViewModel extends INotifyPropertiesChanged> = () => TViewModel;

/** Ensures a unique instance per component that is generated by the factory is created and watches the view model for changes. Returns the view model instance.
 * @template TViewModel The type of view model to create.
 * @param viewModelFactory The view model factory callback that initializes the instance.
 * @param deps Dependencies of the callback, whenever these change the callback is called again, similar to {@link useMemo}.
 * @param watchedProperties Optional, a render will be requested when only one of these properties has changed.
 */
export function useViewModelMemo<TViewModel extends INotifyPropertiesChanged>(viewModelFactory: ViewModelFactory<TViewModel>, deps: DependencyList, watchedProperties?: readonly (keyof TViewModel)[]): TViewModel {
    const viewModel = useMemo(viewModelFactory, deps);
    useViewModel(viewModel, watchedProperties);

    return viewModel;
}