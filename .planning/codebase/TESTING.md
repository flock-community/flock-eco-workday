# Testing Patterns

**Analysis Date:** 2026-02-28

## Test Framework

**Frontend Unit Tests:**
- Jest 29.7.0
- Config: `/jest.config.cjs`

**E2E Tests:**
- Playwright 1.53.1
- Config: `/playwright.config.ts`

**Backend Tests:**
- JUnit 5 (Jupiter)
- Spring Boot Test
- AssertJ for assertions

**Assertion Libraries:**
- Jest: `expect()` from `@testing-library/jest-dom`
- Playwright: `expect()` from `@playwright/test`
- Kotlin: AssertJ - `assertThat(res).isNotEmpty`

**Run Commands:**
```bash
npm test                    # Run Jest unit tests
npm run test:tdd            # Watch mode with nodemon
npm run test:e2e            # Run Playwright tests
npm run test:e2e:ui         # Playwright UI mode
npm run test:e2e:debug      # Playwright debug mode
npm run test:e2e:report     # Show Playwright report
```

## Test File Organization

**Location:**
- Jest tests: Co-located with source files
  - `/workday-application/src/main/react/hooks/expenseFilters.spec.ts`
  - `/workday-application/src/main/react/utils/validation/definedVars.spec.ts`
  - `/workday-application/src/main/react/components/expenses-card/ExpensesCard.spec.tsx`
- Playwright tests: Separate `/tests/` directory
  - `/tests/login.spec.ts`
  - `/tests/person.spec.ts`
  - `/tests/workday.spec.ts`
- Kotlin tests: Mirror structure in `/src/test/kotlin/`
  - `/workday-application/src/test/kotlin/community/flock/eco/workday/repository/PersonRepositoryTest.kt`
  - `/workday-application/src/test/kotlin/community/flock/eco/workday/model/WorkDayTest.kt`

**Naming:**
- Jest: `*.spec.ts` or `*.spec.tsx`
- Playwright: `*.spec.ts`
- Kotlin: `*Test.kt` (e.g., `PersonRepositoryTest.kt`)

**Structure:**
```
/tests/
  ├── login.spec.ts         # Login/auth tests
  ├── person.spec.ts        # CRUD operations
  ├── workday.spec.ts       # Business logic tests
  ├── steps/
  │   └── workdaySteps.ts   # Reusable step functions
  └── files/                # Test fixtures for upload
```

## Test Structure

**Jest Suite Organization:**
```typescript
describe('useExpenseFiltersHook', () => {
  const testExpense001 = createTestCostExpense('item-01', dayjs());
  const testExpense003 = createTestCostExpense('item-03', dayjs().subtract(3, 'days'), 'APPROVED');

  afterEach(() => {
    cleanup();
  });

  describe('getOpenExpenses', () => {
    it('should return an empty list if the items provided are empty', () => {
      const result = getOpenExpenses([]);
      expect(result.length).toBe(0);
    });

    it('should only return items with the status REQUESTED', () => {
      const result = getOpenExpenses([testExpense001, testExpense002, testExpense007]);
      expect(result.length).toBe(2);
    });
  });
});
```

**Playwright Suite Organization:**
```typescript
test.describe('Login Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
    await expect(page.locator('h1:has-text("Workday Login")')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[name="username"]', VALID_USERNAME);
    await page.fill('input[name="password"]', VALID_PASSWORD);
    await page.click('button:has-text("Sign in")');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });
});
```

**Kotlin Test Structure:**
```kotlin
class PersonRepositoryTest(
    @Autowired private val repository: PersonRepository,
) : WorkdayIntegrationTest() {
    @Test
    fun `should create person without email`() {
        val person = Person(
            firstname = "Maurice",
            lastname = "Moss",
            email = "",
            position = "",
            number = null,
            user = null,
        )

        repository.save(person)
        val res = repository.findByUuid(person.uuid)
        assertThat(res).isNotEmpty
    }
}
```

**Patterns:**
- Nested `describe()` blocks for grouping related tests
- `beforeEach`/`afterEach` for setup/teardown
- Descriptive test names with `should` or backticks
- Test constants defined at suite level

## Mocking

**Framework:** Jest built-in mocking (not heavily used in codebase)

**Test Data Factories:**
```typescript
import {
  createTestCostExpense,
  createTestTravelExpense,
} from '../utils/tests/test-models';

const testExpense001 = createTestCostExpense('item-01', dayjs());
const testExpense002 = createTestTravelExpense('item-02', dayjs().subtract(3, 'months'));
```

**What to Mock:**
- External API calls (implied by test data factories)
- File uploads in Playwright - `await fileInput.setInputFiles('tests/files/${filename}')`

**What NOT to Mock:**
- React component rendering - use Testing Library
- Database in Kotlin tests - use H2 with Spring Boot Test
- Browser interactions in Playwright - use real browser

## Fixtures and Factories

**Test Data Factories:**
```typescript
// Location: workday-application/src/main/react/utils/tests/test-models.ts
const testExpense001 = createTestCostExpense('item-01', dayjs());
const testExpense003 = createTestCostExpense('item-03', dayjs().subtract(3, 'days'), 'APPROVED');
const testExpense002 = createTestTravelExpense('item-02', dayjs().subtract(3, 'months'));
```

**Playwright Fixtures:**
```typescript
// Test files for upload
// Location: tests/files/
await fileInput.setInputFiles('tests/files/${filename}');
```

**Playwright Step Functions:**
```typescript
// Location: tests/steps/workdaySteps.ts
export async function Given_I_am_logged_in_as_user(page, username: string) {
  await page.goto('http://localhost:3000/auth');
  await page.getByLabel('Username').fill(`${username}@sesam.straat`);
  await page.getByLabel('Password').fill(username);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('http://localhost:3000/**');
}
```

**Kotlin Test Data:**
```kotlin
val person = Person(
    firstname = "Maurice",
    lastname = "Moss",
    email = "",
    position = "",
    number = null,
    user = null,
)
```

**Location:**
- Jest factories: `workday-application/src/main/react/utils/tests/`
- Playwright steps: `/tests/steps/`
- Playwright files: `/tests/files/`
- Kotlin: Inline in test methods

## Coverage

**Requirements:** None enforced

**Configuration:**
- Jest coverage available but not configured in scripts
- No coverage thresholds set in `jest.config.cjs`

**View Coverage:**
```bash
# Jest coverage (not in package.json scripts, would need to add)
jest --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and hooks
- Examples:
  - `expenseFilters.spec.ts` - Tests `getOpenExpenses()`, `getRecentExpenses()`
  - `definedVars.spec.ts` - Tests utility functions
  - `ExpensesCard.spec.tsx` - Component rendering
- Framework: Jest + React Testing Library
- Location: Co-located with source

**Integration Tests:**
- Scope: React components with multiple dependencies
- Example: `ExpensesCard.spec.tsx` - Tests rendering with expense data
- Framework: Jest + React Testing Library
- Pattern: Render component, query DOM, assert results

**E2E Tests:**
- Framework: Playwright
- Scope: Full user journeys
- Examples:
  - `login.spec.ts` - Authentication flow
  - `person.spec.ts` - CRUD operations with navigation
  - `workday.spec.ts` - Business workflows
- Pattern: Page Object actions via step functions
- Location: `/tests/` directory

**Backend Tests:**
- Scope: Repository and domain logic
- Example: `PersonRepositoryTest.kt` - Database queries
- Framework: JUnit 5 + Spring Boot Test
- Base class: `WorkdayIntegrationTest()`

## Common Patterns

**Async Testing (Jest):**
```typescript
it('should return item when date is equal to today', () => {
  const today = dayjs();
  const result = getRecentExpenses(
    [createTestTravelExpense('item-today', today, 'APPROVED')],
    lastNumberOfDays,
  );
  expect(result.length).toBe(1);
});
```

**Async Testing (Playwright):**
```typescript
test('should login successfully with valid credentials', async ({ page }) => {
  await page.fill('input[name="username"]', VALID_USERNAME);
  await page.fill('input[name="password"]', VALID_PASSWORD);
  await page.click('button:has-text("Sign in")');
  await expect(page).toHaveURL(`${BASE_URL}/`);
  await expect(page.locator('h2:has-text("Hi, Tommy!")')).toBeVisible();
});
```

**Error Testing (Jest):**
```typescript
it('should throw an TypeError if no object is passed as parameter', () => {
  expect(() => isEmptyObject(13)).toThrow(TypeError);
});
```

**React Component Testing:**
```typescript
describe('without expenses', () => {
  let expenseCardElement: HTMLElement | null;
  beforeEach(() => {
    render(<ExpensesCard items={[]} />);
    expenseCardElement = screen.queryByTestId('expenses-card');
  });

  it('renders without crashing', () => {
    expect(expenseCardElement).toBeInTheDocument();
  });

  it('should have no items', () => {
    const emptyElements = screen.queryAllByTestId('expense-empty');
    const rowElements = screen.queryAllByTestId('table-row-expense');
    expect(emptyElements.length).toBe(2);
    expect(rowElements.length).toBe(0);
  });
});
```

**Playwright Cleanup:**
```typescript
test.afterEach(async ({ page, context }) => {
  await context.clearCookies();
  await page.evaluate(() => {
    if (typeof window.localStorage !== 'undefined') window.localStorage.clear();
    if (typeof window.sessionStorage !== 'undefined') window.sessionStorage.clear();
  });
});
```

**Kotlin Backtick Test Names:**
```kotlin
@Test
fun `should find person by full name`() {
    val persons = listOf(
        Person(firstname = "Roy", lastname = "Jensen", ...),
        Person(firstname = "Rob", lastname = "Jansen", ...),
    )
    repository.saveAll(persons)
    val res1 = repository.findAllByFullName(Pageable.unpaged(), "rob ja")
    assertThat(res1.totalElements).isEqualTo(1)
}
```

**Test Isolation (Playwright):**
```typescript
// Playwright config settings
fullyParallel: false,
workers: process.env.CI ? 1 : 2,
storageState: undefined, // Don't persist storage state
```

**Step Function Pattern (Playwright):**
```typescript
// BDD-style naming with snake_case
export async function Given_I_am_logged_in_as_user(page, username: string) { ... }
export async function When_I_go_to_my_work_days(page) { ... }
export async function Then_I_see_a_list_of_the_hours_I_have_submitted_as_for(
  page,
  role: string,
  client: string,
) { ... }
```

**Unique Test Data (Playwright):**
```typescript
// Use timestamps to avoid data conflicts
const timestamp = Date.now();
const testPersonData = {
  firstname: `TestUser${timestamp}`,
  lastname: 'Create',
  email: `test.create.${timestamp}@example.com`,
  number: `${timestamp.toString().slice(-5)}`,
};
```

---

*Testing analysis: 2026-02-28*
