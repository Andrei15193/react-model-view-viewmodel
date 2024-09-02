import type { IReadOnlyObservableCollection } from "../collections";
import type { FormViewModel } from "./FormViewModel";
import type { IConfigurableFormSectionCollection } from './IConfigurableFormSectionCollection';

export interface IReadOnlyFormSectionCollection<TSection extends FormViewModel<TValidationError>, TValidationError = string>
    extends IReadOnlyObservableCollection<TSection>, IConfigurableFormSectionCollection<TSection, TValidationError> {
}