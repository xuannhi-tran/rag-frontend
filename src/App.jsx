import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Toast from './components/Toast';
import { apiFetch, errorDetail } from './api';
import { dropLegacyStorage } from './session';

const formatSize = (bytes) => {
  if (bytes == null) return 'PDF';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const fromServer = (d) => ({
  id: d.id,
  name: d.filename,
  size: formatSize(d.size_bytes),
});

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function App() {
  // The document list always comes from the backend for this session,
  // so the UI and retrieval can never disagree.
  const [documents, setDocuments] = useState([]);
  const [limits, setLimits] = useState({ max_files: 3, max_file_mb: 10, retention_hours: 24 });

  // Chat history lives in sessionStorage (per tab), never localStorage.
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('rag_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('rag_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages to sessionStorage:', e);
    }
  }, [messages]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const refreshDocuments = async () => {
    try {
      const response = await apiFetch('/documents');
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = await response.json();
      setDocuments(data.documents.map(fromServer));
      if (data.limits) setLimits(data.limits);
    } catch (error) {
      console.error('Error loading documents:', error);
      showToast('Could not load your documents from the server.', 'error');
    }
  };

  useEffect(() => {
    dropLegacyStorage();
    refreshDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) {
      showToast('Please select a valid PDF file.', 'error');
      return;
    }
    if (file.size > limits.max_file_mb * 1024 * 1024) {
      showToast(`File is too large (max ${limits.max_file_mb} MB).`, 'error');
      return;
    }
    if (documents.length >= limits.max_files) {
      showToast(`You can upload at most ${limits.max_files} files. Remove one first.`, 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await apiFetch('/upload/', { method: 'POST', body: formData });

      if (response.ok) {
        await refreshDocuments();
        showToast(`"${file.name}" uploaded and indexed successfully!`, 'success');
      } else {
        showToast(await errorDetail(response, 'Failed to upload and process document.'), 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Connection error while uploading file.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      showToast('Please enter a question.', 'error');
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: trimmedQuestion, timestamp: now() }]);
    setQuestion('');
    setLoading(true);

    const reply = (content) =>
      setMessages((prev) => [...prev, { role: 'assistant', content, timestamp: now() }]);

    try {
      const response = await apiFetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmedQuestion,
          document_ids: documents.map((d) => d.id),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        reply(data.answer || 'No answer received from the server.');
        if (data.needs_upload) refreshDocuments(); // UI list must match what the server sees
      } else if (response.status === 429) {
        const detail = await errorDetail(response, 'Too many questions. Please wait a moment.');
        reply(`⏳ ${detail}`);
        showToast(detail, 'error');
      } else {
        reply('⚠️ Failed to retrieve an answer from the backend service. Please check your connection or backend status.');
        showToast('Failed to get an answer.', 'error');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      reply('⚠️ Network error occurred while connecting to the RAG service.');
      showToast('An error occurred while connecting to the server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      setMessages([]);
      showToast('Conversation cleared.', 'info');
    }
  };

  const handleRemoveDoc = async (doc) => {
    try {
      const response = await apiFetch(`/documents/${doc.id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 404) throw new Error(`status ${response.status}`);
      await refreshDocuments();
      showToast(`Deleted "${doc.name}".`, 'info');
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast('Could not delete the document.', 'error');
    }
  };

  const handleClearDocuments = async () => {
    if (!window.confirm('Delete all your uploaded documents from the server?')) return;
    try {
      const response = await apiFetch('/documents', { method: 'DELETE' });
      if (!response.ok) throw new Error(`status ${response.status}`);
      await refreshDocuments();
      showToast('All uploaded documents were deleted.', 'info');
    } catch (error) {
      console.error('Error clearing documents:', error);
      showToast('Could not delete your documents.', 'error');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Knowledge Base */}
      <Sidebar
        documents={documents}
        limits={limits}
        onUpload={handleFileUpload}
        uploading={uploading}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onRemoveDoc={handleRemoveDoc}
        onClearDocs={handleClearDocuments}
      />

      {/* Main Conversational Workspace */}
      <ChatArea
        messages={messages}
        question={question}
        setQuestion={setQuestion}
        onSend={handleAskQuestion}
        loading={loading}
        onClearChat={handleClearChat}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        documentCount={documents.length}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
