### Major Breaking Changes to `@madeinhaus/disclosure`

- **Removed Controlled Accordion Support:** The ability to control `Disclosure` using the `registerDetails` function has been removed. This change simplifies the API and aligns with the intended behavior of `Disclosure` as an uncontrolled component.
- **Updated `Disclosure.Details`:** Added a `defaultOpen` prop for initial open state, replacing the `defaultOpenIndex` behavior.
- **Simplified State Management:** Internal logic has been streamlined.
