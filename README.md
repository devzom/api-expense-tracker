# Expense Tracker API

## Overview
A robust expense tracking API built with Hono, Prisma, and TypeScript.

## Features
- Create, read, update, and delete expenses
- User management
- Validation with Zod
- SQLite database with Prisma ORM

## Prerequisites
- Node.js (v18+)
- npm or yarn

## Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

## Running the Application
- Development mode: `npm run dev`
- Production build: `npm run build && npm start`

## API Endpoints
- `POST /users`: Create a new user
- `POST /expenses`: Create an expense
- `GET /expenses/:userId`: Get all expenses for a user
- `PUT /expenses/:id`: Update an expense
- `DELETE /expenses/:id`: Delete an expense

## Testing
Run tests with: `npm test`

## Technologies
- Hono
- Prisma
- TypeScript
- Zod
- SQLite
