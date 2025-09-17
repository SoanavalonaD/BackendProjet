import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

type Notification = { event: string; task: any };

export default function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const socket = io(backendUrl, { transports: ['websocket'] });
    socket.on('connect', () => console.log('ws connected', socket.id));
    socket.on('notification', (payload: Notification) => {
      setNotifications((prev) => [payload, ...prev]);
    });
    return () => socket.disconnect();
  }, [backendUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await axios.post(`${backendUrl}/tasks`, { title, assigneeEmail: email });
      setTitle('');
      setEmail('');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi");
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>Notifications en direct</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <div>
          <input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <input placeholder="Email assigné" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit">Créer et assigner</button>
      </form>

      <div>
        <h3>Historique</h3>
        {notifications.length === 0 && <p>Aucune notification</p>}
        <ul>
          {notifications.map((n, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <strong>{n.event}</strong> — <em>{n.task.title}</em> (assignee: {n.task.assigneeEmail})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}