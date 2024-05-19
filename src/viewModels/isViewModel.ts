import type { INotifyPropertiesChanged } from './INotifyPropertiesChanged';
import { isEvent } from '../events';

/**
 * Checkes whether the provided instance is a view model (implements {@link INotifyPropertiesChanged}).
 * @template TViewModel The type of view model to check, defaults to {@link INotifyPropertiesChanged}.
 * @param maybeViewModel The value to check if is a view model.
 * @returns Returns `true` if the provided instance implements {@link INotifyPropertiesChanged}; otherwise `false`.
 */
export function isViewModel<TViewModel extends INotifyPropertiesChanged = INotifyPropertiesChanged>(maybeViewModel: any): maybeViewModel is TViewModel {
    return (
        maybeViewModel !== null
        && maybeViewModel !== undefined
        && typeof maybeViewModel !== 'function'
        && 'propertiesChanged' in maybeViewModel
        && isEvent(maybeViewModel.propertiesChanged)
    );
}