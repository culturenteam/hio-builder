import { useEffect, useRef, useState } from 'react';
import { sendCommand } from '../../services/ai';
import { usePage } from '../../hooks/usePage';
import styles from './ChatSidebar.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  error?: boolean;
}

export function ChatSidebar() {
  const { page, refresh } = usePage();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: 'Hi! Tell me what you\'d like to change on your page and I\'ll update it for you.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading || !page) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const result = await sendCommand(prompt, page.id);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: result.message,
      error: !result.ok,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);

    // Refresh sections if a tool was called successfully
    if (result.ok && result.tool) await refresh();
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.messages}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`${styles.message} ${styles[msg.role]} ${msg.error ? styles.error : ''}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className={`${styles.message} ${styles.assistant} ${styles.thinking}`}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
          placeholder="Change my headline to…"
          rows={2}
          disabled={loading}
        />
        <button className={styles.send} type="submit" disabled={loading || !input.trim()}>
          {loading ? '…' : '↑'}
        </button>
      </form>
    </div>
  );
}
