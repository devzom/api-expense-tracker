# API - Expense Tracker

## Overview

### Learning purpose

Expense tracking API built with Hono, SQLite + Prisma, and TypeScript and basic Bearer.

## Features

- Create, read, update, and delete expenses
- User management
- Validation with Zod
- database with Prisma ORM

### Planned Features

- [x] Reporting capabilities
- [x] User customization options
- [x] Flexible categorization system
- [x] Budget tracking and management
- [ ] Receipt/document management
- [ ] Savings goals tracking
- [ ] Expense sharing capabilities
- [ ] Recurring expense automation

## Prerequisites

- Node.js
- PNPM
- SQLite
- Prisma CLI

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Initialize the database:
   ```bash
    prisma migrate dev
   ```
4. Seed DB by dummy data
   ```bash
      pnpm seed
   ```

## Running the Application

- Development mode: `pnpm run dev`
- Production build: `pnpm run build && pnpm start`

## A few examples of endpoints

- `POST /users`: Create a new user
- `POST /expenses`: Create an expense
- `GET /expenses/:userId`: Get all expenses for a user
- `PUT /expenses/:id`: Update an expense
- `DELETE /expenses/:id`: Delete an expense

## Technologies

- Hono
- Prisma
- TypeScript
- Zod
- SQLite

## License

MIT License
