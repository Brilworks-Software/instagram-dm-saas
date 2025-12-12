import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to inbox by default (or login if not authenticated)
  redirect('/inbox');
}
