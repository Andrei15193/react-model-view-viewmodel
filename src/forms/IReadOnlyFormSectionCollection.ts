import type { IReadOnlyObservableCollection } from '../collections';
import type { IObjectValidator, IValidatable } from '../validation';
import type { Form } from './Form';
import type { IConfigurableFormSectionCollection } from './IConfigurableFormSectionCollection';

/** 
 * Represents a read-only configurable observable collection of form sections. Callbacks can be configured for setting
 * up individual form sections for cases where validation and other aspects are based on the state of an entity or the
 * form itself.
 *
 * @template TSection the concrete type of the form section.
 * @template TValidationError the concrete type for representing validaiton errors (strings, enums, numbers etc.).
 */
export interface IReadOnlyFormSectionCollection<TSection extends Form<TValidationError>, TValidationError = string> extends IValidatable<TValidationError>, IReadOnlyObservableCollection<TSection>, IConfigurableFormSectionCollection<TSection, TValidationError> {
    /**
     * Gets the validation configuration for the form. Fields have their own individual validation config as well.
     */
    readonly validation: IObjectValidator<this, TValidationError>;

    /**
     * Resets the sections collection and all contained items.
     *
     * Validation and other flags are reset, fields retain their current values.
     */
    reset(): void;
}