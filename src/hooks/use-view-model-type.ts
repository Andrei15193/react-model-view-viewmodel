import type { INotifyPropertiesChanged } from '../events';
import { type ViewModelType, useViewModel } from './use-view-model';

/** Ensures a unique instance per component of the given type is created and watches the view model for changes. Returns the view model instance.
 * @deprecated In future versions this hook will be removed, switch to {@link useViewModel}.
 * @template TViewModel The type of view model to create.
 * @param viewModelType The view model type to initialize.
 * @param watchedProperties Optional, a render will be requested when only one of these properties has changed.
 */
export function useViewModelType<TViewModel extends INotifyPropertiesChanged>(viewModelType: ViewModelType<TViewModel>, watchedProperties?: readonly (keyof TViewModel)[]): TViewModel {
    return useViewModel(viewModelType, [], watchedProperties);
}