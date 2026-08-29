# Roadmap

- [x] (view) label text field position at zero
- [x] (view) default view name change to `all-${view_name}`
- [x] (prompts) show object on select prompt
- [x] (prompts) add -v command
- [x] (nav) generate default navigation menu item
- [x] (constant) extract entinty constants into a seperate file
- [x] (cli) handle invalid -e entities options
- [x] (prompts) replace object select with multi-select
- [x] (object) extend multi-select for enum[] or Array<enum>
- [x] add users guide, examples
- [x] Array type support (Array)
- [x] (object) RELATION
- [x] Object type Support (RELATION)
- [x] Array of Object type support (RELATION)

# Maybe in Near Future

- [ ] Show Relation info in Select prompt

# Refactor

- [x] (entity) remove constant entity
- [ ] (relation) related object with field, e.g. Products["id"]
- [ ] (relation) fix relation type
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
