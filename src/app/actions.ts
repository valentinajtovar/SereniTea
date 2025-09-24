'use server';

import { z } from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const registerPsychologistSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  specialization: z.string(),
  bio: z.string(),
});

export async function registerPsychologistAction(data: unknown) {
  const result = registerPsychologistSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Invalid data' };
  }

  const { email, fullName, specialization, bio } = result.data;

  try {
    // Note: This is a simplified example. In a real application, you'd want
    // to handle password creation more securely, perhaps by sending a
    // password reset/setup email.
    const tempPassword = Math.random().toString(36).slice(-8);
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    const user = userCredential.user;

    await setDoc(doc(db, 'psychologists', user.uid), {
      fullName,
      email,
      specialization,
      bio,
      approved: false, // Psychologists need to be manually approved
    });

    // In a real app, you would also trigger an email to the psychologist
    // with their login details and a prompt to change their password.

    return { success: true };

  } catch (error: any) {
    console.error('Error registering psychologist:', error);
    return { error: error.message };
  }
}
