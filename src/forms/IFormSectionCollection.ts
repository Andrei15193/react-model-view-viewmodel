import type { IObservableCollection } from '../collections';
import type { IValidatable } from '../validation';
import type { Form } from './Form';
import type { IConfigurableFormSectionCollection } from './IConfigurableFormSectionCollection';

/** 
 * Represents a configurable observable collection of form sections. Callbacks can be configured for setting up individual
 * form sections for cases where validation and other aspects are based on the state of an entity or the form itself.
 *
 * @template TSection the concrete type of the form section.
 * @template TValidationError the concrete type for representing validaiton errors (strings, enums, numbers etc.).
 */
export interface IFormSectionCollection<TSection extends Form<TValidationError>, TValidationError = string> extends IValidatable<TValidationError>, IObservableCollection<TSection>, IConfigurableFormSectionCollection<TSection, TValidationError> {
    /**
     * Resets the sections collection and all contained items.
     *
     * Validation and other flags are reset, fields retain their current values.
     */
    reset(): void;
}