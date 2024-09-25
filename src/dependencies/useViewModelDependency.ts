import type { INotifyPropertiesChanged } from "../viewModels";
import type { ResolvableSimpleDependency, ComplexDependency } from "./IDependencyResolver";
import { useViewModel } from "../hooks";
import { useDependency } from "./useDependency";

export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged>(viewModelDependency: ResolvableSimpleDependency<TViewModel>): TViewModel;
export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged, TAdditional extends readonly any[]>(viewModelDependency: ComplexDependency<TViewModel, TAdditional>, additionalDependencies: TAdditional): TViewModel;
export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged, TAdditional extends readonly any[] = []>(viewModelDependency: ResolvableSimpleDependency<TViewModel> | ComplexDependency<TViewModel, TAdditional>, additionalDependencies: TAdditional): TViewModel;

export function useViewModelDependency<TViewModel extends INotifyPropertiesChanged, TAdditional extends readonly any[]>(viewModelDependency: ResolvableSimpleDependency<TViewModel> | ComplexDependency<TViewModel, TAdditional>, additionalDependencies?: TAdditional): TViewModel {
  const viewModel = useDependency<TViewModel, TAdditional>(viewModelDependency, additionalDependencies!);
  useViewModel(viewModel);

  return viewModel;
}