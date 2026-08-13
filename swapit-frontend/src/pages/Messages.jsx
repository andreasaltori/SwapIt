import { useEffect, useState } from 'react';
import { getInbox, getMessages, sendMessage } from '../api/messages';

export default function Messages() {
  const [inbox, setInbox] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    getInbox().then((res) => setInbox(res.data));
  }, []);

  const openConversation = (conv) => {
    setSelected(conv);
    getMessages(conv.listing_id).then((res) => setMessages(res.data));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    await sendMessage({
      listing_id: selected.listing_id,
      receiver_id: selected.other_user_id,
      content: text,
    });
    setText('');
    getMessages(selected.listing_id).then((res) => setMessages(res.data));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-5">Messaggi</h1>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex overflow-hidden" style={{ height: '70vh' }}>

        {/* Lista conversazioni */}
        <div className="w-72 border-r border-gray-100 overflow-y-auto shrink-0">
          {inbox.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">Nessun messaggio</p>
          )}
          {inbox.map((conv) => (
            <button
              key={`${conv.listing_id}-${conv.other_user_id}`}
              onClick={() => openConversation(conv)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${selected?.listing_id === conv.listing_id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0">
                  {conv.other_username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800 text-sm truncate">{conv.other_username}</p>
                    {conv.unread_count > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{conv.listing_title}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{conv.content}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Conversazione */}
        {selected ? (
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-medium text-gray-800 text-sm">{selected.other_username}</p>
              <p className="text-xs text-gray-400">{selected.listing_title}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.sender_id !== selected.other_user_id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Scrivi un messaggio..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700">
                Invia
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
            Seleziona una conversazione
          </div>
        )}
      </div>
    </div>
  );
}
