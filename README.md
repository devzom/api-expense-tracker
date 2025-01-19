# Expense Tracker API

## Overview

A robust expense tracking API built with Hono, Prisma, and TypeScript.

## Features

- Create, read, update, and delete expenses
- User management
- Validation with Zod
- database with Prisma ORM

### Planned Features

- [x] Reporting capabilities
- [x] User customization options
- [ ] Budget tracking and management
- [ ] Flexible tagging system
- [ ] Recurring expense automation
- [ ] Savings goals tracking
- [ ] Receipt/document management
- [ ] Expense sharing capabilities

## Prerequisites

- Node.js (v18+)
- PNPM

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

## Running the Application

- Development mode: `pnpm run dev`
- Production build: `pnpm run build && pnpm start`

## API Endpoints

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

## License

MIT License
