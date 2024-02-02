import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

withAccelerate(prisma);

export { prisma };