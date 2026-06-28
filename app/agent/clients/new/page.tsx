import { redirect } from 'next/navigation';

export default function NewAgentClientPage() {
  redirect('/dashboard/agent/clients/new');
}
