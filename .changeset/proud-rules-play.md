---
"@madeinhaus/disclosure": major
---

### Major Breaking Changes to `@madeinhaus/disclosure`

- **Removed Controlled Accordion Support:** The ability to control `Disclosure` using the `registerDetails` function has been removed. This change simplifies the API and aligns with the intended behavior of `Disclosure` as an uncontrolled component.
- **Updated `defaultOpen` Logic:** The `defaultOpen` prop now ensures that the initially open `Disclosure.Details` is present during hydration, improving SSR compatibility.
- **Simplified State Management:** Internal logic has been streamlined.
