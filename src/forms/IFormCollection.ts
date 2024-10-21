import type { IObservableCollection } from '../collections';
import type { IValidatable } from '../validation';
import type { Form } from './Form';
import type { IConfigurableFormCollection } from './IConfigurableFormCollection';

/** 
 * Represents a configurable observable collection of forms. Callbacks can be configured for setting up individual
 * form sections for cases where validation and other aspects are based on the state of an entity or the form itself.
 *
 * @template TForm The concrete type of the form section.
 * @template TValidationError The concrete type for representing validation errors (strings, enums, numbers etc.).
 */
export interface IFormCollection<TForm extends Form<TValidationError>, TValidationError = string> extends IValidatable<TValidationError>, IObservableCollection<TForm>, IConfigurableFormCollection<TForm, TValidationError> {
    /**
     * Resets the sections collection and all contained items.
     *
     * Validation and other flags are reset, fields retain their current values.
     */
    reset(): void;
}