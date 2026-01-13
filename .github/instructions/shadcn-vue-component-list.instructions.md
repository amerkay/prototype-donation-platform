---
applyTo: 'only-when-added'
---

# shadcn-vue Component List

> **Note:** “Data Table” is a _guide_ (not a standalone add-able component) and tells you to install **Table** (+ TanStack Table). ([shadcn-vue.com][2])

| Component       | When to use (quick rule of thumb)                                              | pnpm dlx install command                         |
| --------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| Accordion       | Compactly show/hide sections (FAQs, settings groups).                          | `pnpm dlx shadcn-vue@latest add accordion`       |
| Alert           | Inline callout for status/info/warning/success messages.                       | `pnpm dlx shadcn-vue@latest add alert`           |
| Alert Dialog    | Destructive/critical confirmation that must be acknowledged.                   | `pnpm dlx shadcn-vue@latest add alert-dialog`    |
| Aspect Ratio    | Keep media locked to a ratio (images/video embeds).                            | `pnpm dlx shadcn-vue@latest add aspect-ratio`    |
| Avatar          | User/profile identity chip (photo + fallback initials).                        | `pnpm dlx shadcn-vue@latest add avatar`          |
| Badge           | Small status/category label (counts, tags, “Beta”).                            | `pnpm dlx shadcn-vue@latest add badge`           |
| Breadcrumb      | Show location in hierarchy; aid navigation + context.                          | `pnpm dlx shadcn-vue@latest add breadcrumb`      |
| Button          | Primary interaction trigger (actions, submits, CTAs).                          | `pnpm dlx shadcn-vue@latest add button`          |
| Button Group    | Cluster related buttons (segmented actions, toolbars).                         | `pnpm dlx shadcn-vue@latest add button-group`    |
| Calendar        | Pick a date visually (single-date selection).                                  | `pnpm dlx shadcn-vue@latest add calendar`        |
| Card            | Group content into a distinct surface (dashboards, summaries).                 | `pnpm dlx shadcn-vue@latest add card`            |
| Carousel        | Browse a horizontal set of items/media (gallery, featured).                    | `pnpm dlx shadcn-vue@latest add carousel`        |
| Chart           | Build data visualizations using the provided chart scaffolding.                | `pnpm dlx shadcn-vue@latest add chart`           |
| Checkbox        | Binary selection (multi-select lists, “accept terms”).                         | `pnpm dlx shadcn-vue@latest add checkbox`        |
| Collapsible     | Simple show/hide for a single region (details panel).                          | `pnpm dlx shadcn-vue@latest add collapsible`     |
| Combobox        | Searchable select when options are many or async.                              | `pnpm dlx shadcn-vue@latest add combobox`        |
| Command         | Command palette / quick actions (⌘K menus, fuzzy search).                      | `pnpm dlx shadcn-vue@latest add command`         |
| Context Menu    | Right-click / overflow actions tied to an element.                             | `pnpm dlx shadcn-vue@latest add context-menu`    |
| Data Table      | When you need a full-featured grid (sorting/filtering/paging) — use the guide. | `pnpm dlx shadcn-vue@latest add table`           |
| Date Picker     | Date input with popover calendar (forms, filters).                             | `pnpm dlx shadcn-vue@latest add date-picker`     |
| Dialog          | General modal for focused tasks (edit, preview, forms).                        | `pnpm dlx shadcn-vue@latest add dialog`          |
| Drawer          | Mobile-friendly slide-over for secondary flows/settings.                       | `pnpm dlx shadcn-vue@latest add drawer`          |
| Dropdown Menu   | Menu from a trigger (overflow actions, account menu).                          | `pnpm dlx shadcn-vue@latest add dropdown-menu`   |
| Empty           | “No data” / empty-state layouts with guidance/CTA.                             | `pnpm dlx shadcn-vue@latest add empty`           |
| Field           | Form field building blocks (label, help text, errors, layout).                 | `pnpm dlx shadcn-vue@latest add field`           |
| Form            | Structured form patterns (validation wiring + consistent UX).                  | `pnpm dlx shadcn-vue@latest add form`            |
| Hover Card      | Quick preview on hover (user/profile, link preview).                           | `pnpm dlx shadcn-vue@latest add hover-card`      |
| Input           | Standard text input (single-line user entry).                                  | `pnpm dlx shadcn-vue@latest add input`           |
| Input Group     | Combine input + addons (prefix/suffix icons, buttons).                         | `pnpm dlx shadcn-vue@latest add input-group`     |
| Input OTP       | One-time-password / verification code entry.                                   | `pnpm dlx shadcn-vue@latest add input-otp`       |
| Item            | Reusable list/item primitive for consistent row styling.                       | `pnpm dlx shadcn-vue@latest add item`            |
| Kbd             | Display keyboard shortcuts (e.g., ⌘K, Ctrl+S).                                 | `pnpm dlx shadcn-vue@latest add kbd`             |
| Label           | Accessible label text for form controls.                                       | `pnpm dlx shadcn-vue@latest add label`           |
| Menubar         | App-style top menubar (desktop web apps).                                      | `pnpm dlx shadcn-vue@latest add menubar`         |
| Native Select   | Use when you prefer platform-native `<select>` behavior.                       | `pnpm dlx shadcn-vue@latest add native-select`   |
| Navigation Menu | Top-level site navigation with dropdown panels.                                | `pnpm dlx shadcn-vue@latest add navigation-menu` |
| Number Field    | Numeric input with stepper/constraints.                                        | `pnpm dlx shadcn-vue@latest add number-field`    |
| Pagination      | Navigate long lists/tables split into pages.                                   | `pnpm dlx shadcn-vue@latest add pagination`      |
| Pin Input       | Fixed-length pin entry (similar to OTP, often numeric).                        | `pnpm dlx shadcn-vue@latest add pin-input`       |
| Popover         | Lightweight floating panel (filters, help, pickers).                           | `pnpm dlx shadcn-vue@latest add popover`         |
| Progress        | Show completion/loading progress for a known range.                            | `pnpm dlx shadcn-vue@latest add progress`        |
| Radio Group     | Single choice from a small set of options.                                     | `pnpm dlx shadcn-vue@latest add radio-group`     |
| Range Calendar  | Select a date range (booking, reports, analytics filters).                     | `pnpm dlx shadcn-vue@latest add range-calendar`  |
| Resizable       | Split panes with drag handles (editors, dashboards).                           | `pnpm dlx shadcn-vue@latest add resizable`       |
| Scroll Area     | Custom scroll container when content overflows.                                | `pnpm dlx shadcn-vue@latest add scroll-area`     |
| Select          | Styled select for moderate option lists (non-search).                          | `pnpm dlx shadcn-vue@latest add select`          |
| Separator       | Visual divider between sections/items.                                         | `pnpm dlx shadcn-vue@latest add separator`       |
| Sheet           | Side panel modal (settings, cart, quick details).                              | `pnpm dlx shadcn-vue@latest add sheet`           |
| Sidebar         | Primary app navigation rail/side layout (dashboards).                          | `pnpm dlx shadcn-vue@latest add sidebar`         |
| Skeleton        | Loading placeholders to reduce perceived wait time.                            | `pnpm dlx shadcn-vue@latest add skeleton`        |
| Slider          | Choose a value from a range (volume, price range).                             | `pnpm dlx shadcn-vue@latest add slider`          |
| Sonner          | Opinionated toast notifications (quick, transient feedback).                   | `pnpm dlx shadcn-vue@latest add sonner`          |
| Spinner         | Simple indeterminate loading indicator.                                        | `pnpm dlx shadcn-vue@latest add spinner`         |
| Stepper         | Multi-step flow indicator + navigation (checkout, onboarding).                 | `pnpm dlx shadcn-vue@latest add stepper`         |
| Switch          | On/off toggle for a setting (immediate effect).                                | `pnpm dlx shadcn-vue@latest add switch`          |
| Table           | Base table primitives (use directly or for data-table builds).                 | `pnpm dlx shadcn-vue@latest add table`           |
| Tabs            | Switch between views in-place (settings sections, dashboards).                 | `pnpm dlx shadcn-vue@latest add tabs`            |
| Tags Input      | Enter multiple tokens/labels (emails, keywords, filters).                      | `pnpm dlx shadcn-vue@latest add tags-input`      |
| Textarea        | Multi-line input (comments, descriptions).                                     | `pnpm dlx shadcn-vue@latest add textarea`        |
| Toast           | Toast primitives for custom notification UX (if not using Sonner).             | `pnpm dlx shadcn-vue@latest add toast`           |
| Toggle          | Single on/off toggle button (toolbar formatting, pin).                         | `pnpm dlx shadcn-vue@latest add toggle`          |
| Toggle Group    | Exclusive/multi toggle set (segmented controls, filters).                      | `pnpm dlx shadcn-vue@latest add toggle-group`    |
| Tooltip         | Brief helper text on hover/focus (icon-only buttons).                          | `pnpm dlx shadcn-vue@latest add tooltip`         |
| Typography      | Consistent prose styles (headings, paragraphs, markdown).                      | `pnpm dlx shadcn-vue@latest add typography`      |
