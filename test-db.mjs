import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
    console.log('--- STARTING DB TEST ---');
    try {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            console.error('ERROR: DATABASE_URL is missing');
            process.exit(1);
        }
        console.log(`URL found: ${connectionString.substring(0, 20)}...`);

        console.log('Initializing pg.Pool...');
        const pool = new Pool({ connectionString });

        console.log('Initializing PrismaPg adapter...');
        const adapter = new PrismaPg(pool);

        console.log('Initializing PrismaClient...');
        const prisma = new PrismaClient({ adapter });

        console.log('Connecting...');
        await prisma.$connect();
        console.log('SUCCESS: Connected to database via adapter!');

        await prisma.$disconnect();
        await pool.end();
    } catch (e) {
        console.error('FAILURE:', e);
        process.exit(1);
    }
}

main();
