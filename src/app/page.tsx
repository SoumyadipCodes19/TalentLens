import ClientPage from './ClientPage';

export const maxDuration = 60; // Force Vercel to allow 60s for this route

export default function Page() {
  return <ClientPage />;
}
