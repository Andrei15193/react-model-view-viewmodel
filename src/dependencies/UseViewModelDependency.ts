import type { INotifyPropertiesChanged } from "../viewModels";
import type { ResolvableSimpleDependency, ComplexDependency } from "./IDependencyResolver";
import { useViewModel } from "../hooks";
import { useDependency } from "./UseDependency";

/**
 * Resolves the requested view model dependency and subscribes to it for changes.
 *
 * This is a utility hook providing the following functionality.
 *
 * ```ts
 * const viewModel = useDependency(viewModelDependency);
 * useViewModel(viewModel);
 * ```
 * @param viewModelDependency The view model dependency to resolve.
 */
export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged>(viewModelDependency: ResolvableSimpleDependency<TViewModel>): TViewModel;
/**
 * Resolves the requested complex view model dependency and subscribes to it for changes.
 *
 * This is a utility hook providing the following functionality.
 *
 * ```ts
 * const viewModel = useDependency(viewModelDependency, additionalDependencies);
 * useViewModel(viewModel);
 * ```
 * @param viewModelDependency The view model dependency to resolve.
 * @param additionalDependencies Additional constructor arguments which also act as dependencies, if one of them changes the view model will be reinitialized.
 */
export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged, TAdditional extends readonly any[]>(viewModelDependency: ComplexDependency<TViewModel, TAdditional>, additionalDependencies: TAdditional): TViewModel;
/**
 * Resolves the requested view model dependency and subscribes to it for changes.
 *
 * This is a function allowing for easier reuse in other similarly defined hooks.
 * @param viewModelDependency The view model dependency to resolve.
 * @param additionalDependencies Additional constructor arguments which also act as dependencies, if one of them changes the view model will be reinitialized.
 */
export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged, TAdditional extends readonly any[] = []>(viewModelDependency: ResolvableSimpleDependency<TViewModel> | ComplexDependency<TViewModel, TAdditional>, additionalDependencies: TAdditional): TViewModel;

export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged, TAdditional extends readonly any[]>(viewModelDependency: ResolvableSimpleDependency<TViewModel> | ComplexDependency<TViewModel, TAdditional>, additionalDependencies?: TAdditional): TViewModel {
  const viewModel = useDependency<TViewModel, TAdditional>(viewModelDependency, additionalDependencies!);
  useViewModel(viewModel);

  return viewModel;
}