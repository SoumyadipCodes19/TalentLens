import { redirect } from 'next/navigation';
import ClientPage from './ClientPage';
import { auth } from '@/auth';

export const maxDuration = 60; // Force Vercel to allow 60s for this route

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return <ClientPage session={session} />;
}
