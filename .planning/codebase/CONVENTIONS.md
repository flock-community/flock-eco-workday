# Coding Conventions

**Analysis Date:** 2026-02-28

## Naming Patterns

**Files:**
- TypeScript/TSX: camelCase for components and utilities - `PersonForm.tsx`, `expenseFilters.ts`
- React components: PascalCase files - `ExpenseTable.tsx`, `PersonDialog.tsx`
- Test files: Same name as source with `.spec.ts` or `.spec.tsx` extension
- Kotlin: PascalCase for classes - `ExpensePersistenceAdapter.kt`, `CostExpenseMailService.kt`
- Kotlin tests: PascalCase with `Test` suffix - `PersonRepositoryTest.kt`, `WorkDayTest.kt`

**Functions:**
- TypeScript/React: camelCase - `usePerson()`, `getOpenExpenses()`, `selectDateInPicker()`
- Playwright steps: Snake_case with descriptive names - `Given_I_am_logged_in_as_user()`, `When_I_go_to_my_work_days()`
- Kotlin: camelCase - `sendUpdate()`, `findAllByFullName()`

**Variables:**
- TypeScript: camelCase - `testExpense001`, `expenseCardElement`, `numberOfDaysForTest`
- Constants: SCREAMING_SNAKE_CASE - `PERSON_FORM_ID`, `ISO_8601_DATE`, `PERSON_FORM_SCHEMA`
- Kotlin: camelCase - `expenseRepository`, `emailService`
- Kotlin properties: camelCase with `val`/`var` - `val id: UUID`, `open val date: LocalDate`

**Types:**
- TypeScript types: PascalCase - `Person`, `PersonRaw`, `PersonRequest`, `Expense`
- Kotlin classes: PascalCase - `ExpensePersistenceAdapter`, `CostExpenseMailService`
- Type imports: Explicit `type` keyword - `import { type Person }`

## Code Style

**Formatting:**
- Tool: Biome (replaces Prettier/ESLint)
- Config: `/biome.json`
- Indent: 2 spaces
- Quote style: Single quotes for JavaScript/TypeScript
- Run: `npm run format` (write), `npm run lint` (check)

**Linting:**
- Tool: Biome
- Rules: `recommended: true`
- Warnings: `noExplicitAny`, `noUnusedFunctionParameters`, `useExhaustiveDependencies`
- Auto-organize imports enabled
- Run: `npm run lint:fix` for auto-fix

**TypeScript Configuration:**
- `strict: false` (lenient mode)
- `noImplicitAny: false`
- Target: ES2015
- JSX: react-jsx
- Module resolution: node

**Kotlin Formatting:**
- Standard Kotlin conventions
- Properties: Open for inheritance where needed (`open val`)

## Import Organization

**Order:**
1. External library imports (React, MUI, etc.)
2. Internal library imports (@workday-core, @workday-user)
3. Relative imports (components, utils, types)

**TypeScript Example:**
```typescript
import { FormControl } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, TextField as FormikTextField } from 'formik-mui';
import { DatePickerField } from '../../components/fields/DatePickerField';
import { ShirtSizeSelectorField } from '../../components/fields/ShirtSizeSelectorField';
import { PERSON_FORM_SCHEMA } from './schema';
```

**Kotlin Example:**
```kotlin
import community.flock.eco.workday.core.utils.toDomainPage
import community.flock.eco.workday.domain.common.Status
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import java.util.UUID
```

**Path Aliases:**
- `@workday-core` → `workday-core/src/main/react/*`
- `@workday-user` → `workday-user/src/main/react/*`
- Use aliases instead of relative paths like `../../../`

## Error Handling

**TypeScript Patterns:**
- Use try-catch for async operations
- Return null for not found cases - `findByIdOrNull(): Person | null`
- Throw TypeError for invalid parameters - `throw TypeError('parameter is not of type object')`
- Error boundaries: react-error-boundary package installed

**Kotlin Patterns:**
- Use `error()` for unsupported cases - `else -> error("Unsupported expense type")`
- `findByIdOrNull` Spring Data extension for optional results
- `@Transactional` annotation for database operations

**Validation:**
- Frontend: Formik + Yup schemas - `PERSON_FORM_SCHEMA`
- Backend: Spring validation (implied by domain model)

## Logging

**Framework:** SLF4J (Kotlin)

**Patterns:**
```kotlin
private val log: Logger = LoggerFactory.getLogger(CostExpenseMailService::class.java)
log.info("Email generated for CostExpense update for ${recipient.email}")
```

**Frontend:** Console (development only)
- Playwright tests include console logs for debugging

## Comments

**When to Comment:**
- Complex business logic
- TODOs: `// TODO write test`
- FIXMEs: `// FIXME` in type definitions for temporary workarounds
- HTML templates in Kotlin: `// language=html` for IDE syntax highlighting
- Temporal context in tests: `// needs to be .isBefore because the date of testExpense002 is further in history`

**JSDoc/TSDoc:**
- Minimal usage observed
- Type annotations preferred over JSDoc

## Function Design

**Size:**
- Small, focused functions preferred
- Test helper functions: 20-50 lines
- Service methods: 10-40 lines
- Complex UI components: Can be larger (100+ lines)

**Parameters:**
- TypeScript: Prefer object destructuring for multiple params - `function PersonForm({ item, onSubmit }: PersonFormProps)`
- Test functions: Explicit parameters - `async function Given_I_am_logged_in_as_user(page, username: string)`
- Kotlin: Multiple parameters with default values supported

**Return Values:**
- TypeScript: Explicit types or inferred - `[Person | null, (personId: string) => void]`
- Null for missing values - `birthdate: Dayjs | null`
- Kotlin: Nullable types - `Person?`, `Expense<*>?`

## Module Design

**Exports:**
- Named exports preferred - `export function PersonForm()`, `export const PersonClient`
- Re-exports through index files - `export { isUndefined, isDefined, isEmptyObject };`
- Default exports: Minimal usage

**Barrel Files:**
- Used in utilities - `workday-application/src/main/react/utils/validation/index.ts`
- Used in components - `workday-core/src/main/react/components/index.ts`
- Pattern: `export { ... } from './module';`

**TypeScript Module Pattern:**
- Client modules export const objects with methods - `export const PersonClient = { ...internalizingClient, me: () => ... }`
- Hook modules export functions - `export function usePerson(): [Person | null, ...] { ... }`

**Kotlin Patterns:**
- `@Component`, `@Service` annotations for Spring beans
- Dependency injection via constructor - `class ExpensePersistenceAdapter(private val expenseRepository: ExpenseRepository)`
- Port/Adapter pattern for domain boundaries

---

*Convention analysis: 2026-02-28*
