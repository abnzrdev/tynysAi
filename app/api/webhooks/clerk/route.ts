import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Get the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    if (!primaryEmail) {
      return new Response('No primary email found', { status: 400 });
    }

    // Construct the full name
    const name = [first_name, last_name].filter(Boolean).join(' ') || 'User';

    try {
      // Check if user already exists (in case of auto-create fallback)
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, id))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`User ${id} already exists in database (likely auto-created)`);
        return new Response('User already exists', { status: 200 });
      }

      // Insert the user into the database
      await db.insert(users).values({
        clerkId: id,
        name: name,
        email: primaryEmail.email_address,
      });

      console.log(`User ${id} created in database via webhook`);
    } catch (error) {
      console.error('Error creating user in database:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}

