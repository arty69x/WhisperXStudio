import { ChatInterface } from '@/components/chat/chat-interface';

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-zinc-50 text-zinc-900 overflow-hidden">
      <ChatInterface />
    </main>
  );
}
