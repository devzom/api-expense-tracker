import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {

    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'bob@prisma.io' },
            update: {},
            create: {
                email: 'bob@prisma.io',
                name: 'Bob',
            }
        }),
        prisma.user.upsert({
            where: { email: 'alice@prisma.io' },
            update: {},
            create: {
                email: 'alice@prisma.io',
                name: 'Alice',
                preferences: {
                    create: {}
                },
                expenses: {
                    create: {
                        amount: 10.99,
                        description: 'Pizza',
                        date: new Date(),
                    }
                }
            },
        })
    ])

    const paymentsMethod = await Promise.all([
        prisma.paymentMethod.upsert({
            where: { name: 'card' },
            update: {},
            create: {
                name: 'card',
            },
        }),
        prisma.paymentMethod.upsert({
            where: { name: 'cash' },
            update: {},
            create: {
                name: 'cash',
            },
        }),
        prisma.paymentMethod.upsert({
            where: { name: 'transfer' },
            update: {},
            create: {
                name: 'transfer',
                isActive: false
            },
        })
    ])

    const expensesCategories = await Promise.all([
        prisma.category.upsert({
            where: { name: 'food' },
            update: {},
            create: {
                name: 'food',
            },
        }),
        prisma.category.upsert({
            where: { name: 'bills' },
            update: {},
            create: {
                name: 'bills',
            },
        })
    ])

    console.log(users, paymentsMethod, expensesCategories)
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })