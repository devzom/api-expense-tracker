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
                    create: {
                        notificationsEnabled: true,
                        weekStartsOn: 'monday',
                        language: 'en',
                        dateFormat: 'dd/MM/yyyy',
                        timeFormat: '24h',
                        currency: 'EUR'
                    }
                },
                expenses: {
                    create: [
                        {
                            amount: 10.99,
                            description: 'Pizza',
                            date: new Date(),
                            category: {
                                connect: {
                                    name: 'food'
                                }
                            },
                            paymentMethod: {
                                connect: {
                                    name: 'cash'
                                }
                            }
                        },
                        {
                            amount: 249.99,
                            description: 'Electricity',
                            date: new Date(),
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