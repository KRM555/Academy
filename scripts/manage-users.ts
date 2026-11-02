#!/usr/bin/env node
import crypto from 'crypto';
import dotenv from 'dotenv';
import { getStorage } from '../src/server/storage';
import { hashPassword } from '../src/server/crypto';
import { strongPasswordSchema } from '../src/server/schemas';

dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const help = `
Noor & Bayan Academy — User Management Script
Usage:
  tsx scripts/manage-users.ts create --email <email> --password <password> --name <name> --role <admin|teacher>
  tsx scripts/manage-users.ts reset --email <email> --password <new-password>
  tsx scripts/manage-users.ts list
`;

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(help);
    process.exit(0);
  }

  const action = args[0];
  const storage = await getStorage();

  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
  };

  if (action === 'create') {
    const email = getArg('--email');
    const password = getArg('--password');
    const name = getArg('--name') || 'عضو المنصة';
    const role = (getArg('--role') || 'teacher') as 'admin' | 'teacher';

    if (!email || !password) {
      console.error('Error: Both --email and --password are required.');
      process.exit(1);
    }

    const passCheck = strongPasswordSchema.safeParse(password);
    if (!passCheck.success) {
      console.error(`Error: Password does not meet security requirements: ${passCheck.error.issues[0]?.message}`);
      process.exit(1);
    }

    const existing = await storage.findUserByEmail(email);
    if (existing) {
      console.error(`Error: User with email "${email}" already exists. Use "reset" to change password.`);
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);
    const user = await storage.createUser({
      id: `usr-${crypto.randomUUID()}`,
      email,
      passwordHash,
      name,
      role,
      permissions: role === 'admin' ? ['all'] : ['assigned_students', 'payouts'],
    });

    console.log(`[SUCCESS] Created ${role} user: ${user.email} (ID: ${user.id})`);
  } else if (action === 'reset') {
    const email = getArg('--email');
    const password = getArg('--password');
    if (!email || !password) {
      console.error('Error: Both --email and --password are required.');
      process.exit(1);
    }
    const passCheck = strongPasswordSchema.safeParse(password);
    if (!passCheck.success) {
      console.error(`Error: Password does not meet security requirements: ${passCheck.error.issues[0]?.message}`);
      process.exit(1);
    }
    const user = await storage.findUserByEmail(email);
    if (!user) {
      console.error(`Error: User "${email}" not found.`);
      process.exit(1);
    }
    const newHash = await hashPassword(password);
    await storage.updateUserPassword(user.id, newHash);
    console.log(`[SUCCESS] Reset password for ${email}.`);
  } else if (action === 'list') {
    console.log('[Storage] Listing all users is restricted to direct DB inspection for security.');
  } else {
    console.log(help);
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
