import type { INotifyPropertiesChanged } from "../viewModels";
import type { IDependencyResolver, ResolvableSimpleDependency, ComplexDependency } from "./IDependencyResolver";
import type { IDependencyContainer, ConfigurableDependency } from './IDependencyContainer'
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
 *
 * @template TViewModel The view model type to resolve.
 *
 * @param viewModelDependency The view model dependency to resolve.
 *
 * @returns Returns the resolved view model which is also watched for changes.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link ConfigurableDependency}
 * @see {@link useDependency}
 * @see {@link useViewModel}
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
 *
 * @template TViewModel The view model type to resolve.
 * @template TAdditional A tuple representing additional parameters required by the constructor.
 *
 * @param viewModelDependency The view model dependency to resolve.
 * @param additionalDependencies Additional constructor arguments which also act as dependencies, if one of them changes the view model will be reinitialized.
 *
 * @returns Returns the resolved view model which is also watched for changes.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link ConfigurableDependency}
 * @see {@link useDependency}
 * @see {@link useViewModel}
 */
export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged, TAdditional extends readonly any[]>(viewModelDependency: ComplexDependency<TViewModel, TAdditional>, additionalDependencies: TAdditional): TViewModel;

export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged, TAdditional extends readonly any[]>(viewModelDependency: ResolvableSimpleDependency<TViewModel> | ComplexDependency<TViewModel, TAdditional>, additionalDependencies?: TAdditional): TViewModel {
  const viewModel = useDependency<TViewModel, TAdditional>(viewModelDependency as ComplexDependency<TViewModel, TAdditional>, additionalDependencies!);
  useViewModel(viewModel);

  return viewModel;
}