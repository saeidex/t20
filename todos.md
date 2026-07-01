# Todos

- [ ] (view) label text field position at zero
- [x] (view) default view name change to `all-${view_name}`
- [x] (prompts) show object on select prompt
- [x] (prompts) add -v command
- [ ] (nav) generate default navigation menu item


# Maybe in Near Future

- [ ] Array type support (Array)
- [ ] Object typee Support (RELATION)
- [ ] Array of Object type support (RELATION)


# Refactor

- [ ] Retain the original enum structure instead of hardcoded SELECT Options. Example: 
  ```diff
  - {
  -   universalIdentifier: TAX_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  -   name: "taxStatus",
  -   label: "Tax Status",
  -   type: FieldType.SELECT,
  -   options: [
  -     {
  -       value: "taxable",
  -       label: "Taxable",
  -       position: 0,
  -       color: "gray",
  -     },
  -     {
  -       value: "none",
  -       label: "None",
  -       position: 1,
  -       color: "gray",
  -     }
  -   ]
  - }
  + enum TaxStatus {
  +   TAXABLE = "TAXABLE",
  +   NONE = "NONE",
  + }
  +
  + ...
  +
  + {
  +   universalIdentifier: TAXSTATUS_FIELD_UNIVERSAL_IDENTIFIER,
  +   name: "taxStatus",
  +   label: "Tax status",
  +   type: FieldType.SELECT,
  +   description: "Product's tax status",
  +   defaultValue: `'${TaxStatus.NONE}'`,
  +   options: [
  +     {
  +       value: TaxStatus.TAXABLE,
  +       label: TaxStatus.TAXABLE,
  +       position: 0,
  +       color: "yellow",
  +     },
  +     {
  +       value: TaxStatus.NONE,
  +       label: TaxStatus.NONE,
  +       position: 1,
  +       color: "gray",
  +     },
  +   ],
  + }
  ```
