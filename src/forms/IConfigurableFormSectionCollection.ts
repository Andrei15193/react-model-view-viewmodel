import type { FormViewModel } from "./FormViewModel";

export type FormSectionSetupCallback<TSection extends FormViewModel<TValidationError>, TValidationError = string> = (section: TSection) => void;

export interface IConfigurableFormSectionCollection<TSection extends FormViewModel<TValidationError>, TValidationError = string> {
    withItemSetup(setupCallback: FormSectionSetupCallback<TSection, TValidationError>): this;
    withoutItemSetup(setupCallback: FormSectionSetupCallback<TSection, TValidationError>): this;

    clearItemSetups(): void;
}