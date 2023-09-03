A library for developing React applications using Model-View-ViewModel inspired by .NET.

**ToDo List App Tutorial**
* [ToDo List App Tutorial Part 1: Requirements](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ToDo-List-App-Tutorial-Part-1:-Requirements)
* [ToDo List App Tutorial Part 2: Setup](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ToDo-List-App-Tutorial-Part-2:-Setup)
* [ToDo List App Tutorial Part 3: Adding a List of Items](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ToDo-List-App-Tutorial-Part-3:-Adding-a-List-of-Items)
* [ToDo List App Tutorial Part 4: Adding ToDo Items](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ToDo-List-App-Tutorial-Part-4:-Adding-ToDo-Items)
* [ToDo List App Tutorial Part 5: Editing a ToDo Item](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ToDo-List-App-Tutorial-Part-5:-Editing-a-ToDo-Item)
* [ToDo List App Tutorial Part 6: Deleting ToDo Items](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ToDo-List-App-Tutorial-Part-6:-Deleting-ToDo-Items)
* [ToDo List App Tutorial Part 7: Adding Form Validation](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ToDo-List-App-Tutorial-Part-7:-Adding-Form-Validation)
* [ToDo List App Tutorial Part 8: Adding a Search Bar for ToDo Items](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ToDo-List-App-Tutorial-Part-8:-Adding-a-Search-Bar-for-ToDo-Items)

**API**

* **Events**
  * [IEvent\<TEventArgs\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IEvent)
  * [IEventHandler\<TEventArgs\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IEventHandler)
  * [INotifyPropertiesChanged](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/INotifyPropertiesChanged)
  * [INotifyCollectionChanged\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/INotifyCollectionChanged)
  * [IItemAddedEventArgs\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IItemAddedEventArgs)
  * [IItemRemovedEventArgs\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IItemRemovedEventArgs)
  * [ICollectionChange\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ICollectionChange)
  * [ItemRemovedCallback\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ItemRemovedCallback)
  * [EventDispatcher](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/EventDispatcher)
* **Observable Collection**
  * [IReadOnlyObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IReadOnlyObservableCollection)
  * [IObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IObservableCollection)
  * [ReadOnlyObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ReadOnlyObservableCollection)
  * [ObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ObservableCollection)
* **ViewModels**
  * [ViewModel](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ViewModel)
* **Forms**
  * [IFormFieldViewModel\<TValue\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IFormFieldViewModel)
  * [IFormFieldViewModelConfig\<TValue\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IFormFieldViewModelConfig)
  * [FormFieldViewModel\<TValue\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/FormFieldViewModel)
  * [FormFieldCollectionViewModel](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/FormFieldCollectionViewModel)
  * [FormFieldSet](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/FormFieldSet)
  * [DynamicFormFieldCollectionViewModel](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/DynamicFormFieldCollectionViewModel)
* **Validation**
  * [IReadOnlyValidatable](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IReadOnlyValidatable)
  * [IValidatable](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IValidatable)
  * [IValidationConfig\<TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IValidationConfig)
  * [ValidatorCallback\<TValidatable\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ValidatorCallback)
  * [CollectionItemValidatorCallback\<TValidatable, TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/CollectionItemValidatorCallback)
  * [ValidatableSelectorCallback\<TItem, TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ValidatableSelectorCallback)
  * [ValidationConfigSelectorCallback\<TItem, TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ValidationConfigSelectorCallback)
  * [UnsubscribeCallback](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/UnsubscribeCallback)
  * [registerValidators\<TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/registerValidators)
  * [registerCollectionValidators\<TItem, TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/registerCollectionValidators)
  * [registerCollectionItemValidators\<TItem, TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/registerCollectionItemValidators)
* **React Hooks**
  * [EventHandler\<TEventArgs\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/EventHandler)
  * [useEvent\<TEventArgs\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useEvent)
  * [ViewModelType\<TViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ViewModelType)
  * [ViewModelFactory\<TViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ViewModelFactory)
  * [useViewModel\<TViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useViewModel)
  * [useObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useObservableCollection)
  * [useValidators\<TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useValidators)
  * [useCollectionValidators\<TItem, TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useCollectionValidators)
  * [useCollectionItemValidators\<TItem, TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useCollectionItemValidators)

For more information and documentation please refer to the [project discussions](https://github.com/Andrei15193/react-model-view-viewmodel/discussions) and [project wiki](https://github.com/Andrei15193/react-model-view-viewmodel/wiki).