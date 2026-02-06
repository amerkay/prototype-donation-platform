/**
 * Form Builder Composition API
 * Central export point for all composable form functionality
 */

// Core form definition
export { defineForm } from './defineForm'

// Field constructors
export {
  textField,
  textareaField,
  numberField,
  currencyField,
  hiddenField,
  toggleField,
  checkboxField,
  selectField,
  comboboxField,
  autocompleteField,
  radioGroupField,
  dateField,
  emojiField,
  sliderField,
  imageUploadField,
  arrayField,
  fieldGroup,
  tabsField,
  cardField,
  componentField
} from './defineForm'

// Type guards for runtime type checking
export {
  isTextField,
  isTextareaField,
  isNumberField,
  isCurrencyField,
  isHiddenField,
  isToggleField,
  isCheckboxField,
  isSelectField,
  isComboboxField,
  isAutocompleteField,
  isRadioGroupField,
  isDateField,
  isEmojiField,
  isSliderField,
  isImageUploadField,
  isArrayField,
  isFieldGroup,
  isTabsField,
  isCardField,
  isComponentField
} from '../types'
