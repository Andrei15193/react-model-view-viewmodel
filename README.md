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
  * [DispatchEvent\<TEventArgs\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/DispatchEvent)
* **Observable Collection**
  * [IReadOnlyObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IReadOnlyObservableCollection)
  * [IObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IObservableCollection)
  * [ReadOnlyObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ReadOnlyObservableCollection)
  * [ObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ObservableCollection)
* **ViewModels**
  * [ViewModel](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ViewModel)
* **Forms**
  * [IFormFieldViewModel\<TValue\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IFormFieldViewModel)
  * [FormFieldViewModel\<TValue\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/FormFieldViewModel)
  * [FormFieldCollectionViewModel](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/FormFieldCollectionViewModel)
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
  * [watchEvent\<TEventArgs\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/watchEvent)
  * [watchCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/watchCollection)
  * [watchViewModel\<TViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/watchViewModel)
  * [ViewModelType\<TViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ViewModelType)
  * [useViewModelType\<TViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useViewModelType)
  * [ViewModelFactory\<TViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ViewModelFactory)
  * [useViewModelFactory\<TViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useViewModelFactory)
  * [useValidators\<TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useValidators)
  * [useCollectionValidators\<TItem, TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useCollectionValidators)
  * [useCollectionItemValidators\<TItem, TValidatableViewModel\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useCollectionItemValidators)
* **React Components**
  * [Input](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/Input)

For more information and documentation please refer to the [project wiki](https://github.com/Andrei15193/react-model-view-viewmodel/wiki).