import type { INotifyPropertiesChanged } from '../events';
import { useRef } from 'react';
import { watchViewModel } from './watch-view-model';

export type ViewModelFactory<TViewModel extends INotifyPropertiesChanged> = () => TViewModel;

export function useViewModelFactory<TViewModel extends INotifyPropertiesChanged>(viewModelFactory: ViewModelFactory<TViewModel>, watchedProperties?: readonly (keyof TViewModel)[]): TViewModel {
    const $vm = useRef<TViewModel | null>(null);
    if ($vm.current === null)
        $vm.current = viewModelFactory();

    watchViewModel($vm.current, watchedProperties);
    return $vm.current;
}