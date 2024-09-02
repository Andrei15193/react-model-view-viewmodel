import type { IObservableCollection } from "../collections";
import type { FormViewModel } from "./FormViewModel";
import type { IConfigurableFormSectionCollection } from './IConfigurableFormSectionCollection';

export interface IFormSectionCollection<TSection extends FormViewModel<TValidationError>, TValidationError = string>
    extends IObservableCollection<TSection>, IConfigurableFormSectionCollection<TSection, TValidationError> {
}