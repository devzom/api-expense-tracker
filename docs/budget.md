# Budget

## Budget Management

- Support for both `overall` and `category-specific` budgets
  - Set separate budget limits for different expense categories
  - Track spending against both overall and category budgets
  - Prevent overlapping budgets for the same period
  - Real-time budget status and spending analysis

## Budget validation

- Prevents overlapping budgets for the same period
- Validates date ranges

## Endpoints

```
- POST /budget
- GET /budget/user/:userId
- GET /budget/:id/status
```

### Example requests to create budgets

#### Overall budget

```json
{
  "title": "Monthly Budget",
  "amount": 2000,
  "currency": "USD",
  "startDate": "2025-02-01T00:00:00Z",
  "endDate": "2025-02-28T23:59:59Z",
  "isOverall": true
}
```

#### Category budget

```json
{
  "title": "Groceries Budget",
  "amount": 500,
  "currency": "USD",
  "startDate": "2025-02-01T00:00:00Z",
  "endDate": "2025-02-28T23:59:59Z",
  "categoryId": "category-uuid",
  "isOverall": false
}
```
