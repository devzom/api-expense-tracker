import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
const app = new Hono()

// Expense validation schema
const ExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
  userId: z.string().uuid()
})


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Create an expense
app.post('/expenses', async (c) => {
  try {
    const body = await c.req.json()
    const validatedData = ExpenseSchema.parse(body)

    const expense = await prisma.expense.create({
      data: validatedData
    })

    return c.json(expense, 201)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 400)
  }
})

// Get all expenses for a user
app.get('/expenses/:userId', async (c) => {
  const userId = c.req.param('userId')

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    })

    return c.json(expenses)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

// Update an expense
app.put('/expenses/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const body = await c.req.json()
    const validatedData = ExpenseSchema.partial().parse(body)

    const expense = await prisma.expense.update({
      where: { id },
      data: validatedData
    })

    return c.json(expense)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 400)
  }
})

// Delete an expense
app.delete('/expenses/:id', async (c) => {
  const id = c.req.param('id')

  try {
    await prisma.expense.delete({
      where: { id }
    })

    return c.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

// User creation endpoint
app.post('/users', async (c) => {
  try {
    const body = await c.req.json()
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name
      }
    })

    return c.json(user, 201)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 400)
  }
})

const port = process.env.PORT || 3444
console.log(`Server running on port ${port}`)

export default app
