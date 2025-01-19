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
                expenses: {
                    create: {
                        amount: 100,
                        description: 'Pizza',
                        category: {
                            connect: {
                                name: 'food'
                            }
                        },
                        paymentMethod: {
                            connect: {
                                name: 'Card'
                            }
                        }
                    }
                },
            }
        }),
        prisma.user.upsert({
            where: { email: 'alice@prisma.io' },
            update: {},
            create: {
                email: 'alice@prisma.io',
                name: 'Alice',
            },
        })
    ])

    const paymentsMethod = await Promise.all([
        prisma.paymentMethod.upsert({
            where: { name: 'Card' },
            update: {},
            create: {
                name: 'Card',
            },
        }),
        prisma.paymentMethod.upsert({
            where: { name: 'Cash' },
            update: {},
            create: {
                name: 'Cash',
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