import { useState, useRef, useEffect } from 'react';
import { api } from '../../utils/api';
import s from './AIAssistant.module.css';

const SUGGESTIONS = [
  "Which is the hottest zone?",
  "What's the best intervention for the highest risk zone?",
  "Give me a city overview",
  "Explain Urban Heat Islands",
  "What's the green cover status?",
  "How does GAIA align with SDGs?",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm GAIA, your climate planning assistant. I can help you understand your city's heat data, recommend interventions, and explain simulation results.\n\nTry asking me about specific zones, heat hotspots, or intervention strategies.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await api.chat(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>AI Climate Assistant</h1>
      <p className={s.pageSubtitle}>Ask questions about your city's climate data and interventions</p>

      <div className={s.chatContainer}>
        <div className={s.messages} ref={messagesRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${s.message} ${msg.role === 'user' ? s.messageUser : ''}`}
            >
              <div className={`${s.messageAvatar} ${msg.role === 'user' ? s.avatarUser : s.avatarAI}`}>
                {msg.role === 'user' ? 'U' : 'G'}
              </div>
              <div className={`${s.messageBubble} ${msg.role === 'user' ? s.bubbleUser : s.bubbleAI}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className={s.message}>
              <div className={`${s.messageAvatar} ${s.avatarAI}`}>G</div>
              <div className={`${s.messageBubble} ${s.bubbleAI}`}>Thinking...</div>
            </div>
          )}
        </div>

        <div className={s.suggestions}>
          {SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              className={s.suggestionBtn}
              onClick={() => sendMessage(sug)}
              disabled={loading}
            >
              {sug}
            </button>
          ))}
        </div>

        <div className={s.inputArea}>
          <input
            className={s.chatInput}
            placeholder="Ask about zones, interventions, or climate data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className={s.sendBtn} onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
