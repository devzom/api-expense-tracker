import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {

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
            where: { name: 'groceries' },
            update: {},
            create: {
                name: 'groceries',
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
                surname: 'Smith',
                avatar: 'https://domain/assets/profile-1-alice.png',
                preferences: {
                    create: {
                        notificationsEnabled: true,
                        weekStartsOn: 'monday',
                        language: 'en',
                        dateFormat: 'dd/MM/yyyy',
                        timeFormat: '24h',
                        currency: 'USD',
                    }
                },
                expenses: {
                    create: [
                        {
                            amount: 10.99,
                            description: 'pizza',
                            type: 'expense',
                            currency: 'USD',
                            createdAt: new Date('2025-01-02T06:22:33.444Z'),
                            category: {
                                connect: {
                                    name: 'groceries'
                                }
                            },
                            paymentMethod: {
                                connect: {
                                    name: 'cash'
                                }
                            }
                        },
                        {
                            amount: 149.99,
                            description: 'Electricity',
                            date: new Date('2025-01-31T06:22:33.444Z'),
                            type: 'expense',
                            currency: 'USD',
                            category: {
                                connect: {
                                    name: 'bills'
                                }
                            },
                            paymentMethod: {
                                connect: {
                                    name: 'card'
                                }
                            }
                        }
                    ]
                },
            },
        })
    ])

    const budget = await prisma.budget.create({
        data: {
            userId: users[0].id,
            title: 'Monthly Groceries Budget',
            amount: 500,
            currency: 'USD',
            startDate: new Date('2025-01-01T00:00:00Z'),
            endDate: new Date('2025-01-31T23:59:59Z'),
            category: 'groceries'
        }
    })

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