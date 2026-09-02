import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Toast from './components/Toast';

const API_BASE = 'https://rag-assistant-nhi.duckdns.org';

function App() {
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem('rag_documents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('rag_messages');
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
      localStorage.setItem('rag_documents', JSON.stringify(documents));
    } catch (e) {
      console.error('Failed to save documents to localStorage:', e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem('rag_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages to localStorage:', e);
    }
  }, [messages]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      showToast('Please select a valid PDF file.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await fetch(`${API_BASE}/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const formatSize = (bytes) => {
          if (bytes < 1024) return bytes + ' B';
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
          return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        };

        const newDoc = {
          id: data.document_id,
          name: file.name,
          summary: data.summary,
          size: formatSize(file.size),
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        // Avoid duplicate entries with the same name
        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.name !== file.name)]);
        showToast(`"${file.name}" uploaded and indexed successfully!`, 'success');
      } else {
        showToast('Failed to upload and process document.', 'error');
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

    const userMessage = {
      role: 'user',
      content: trimmedQuestion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          document_names: documents.map((d) => d.name),
        }),
      });



      if (response.ok) {
        const data = await response.json();
        const assistantMessage = {
          role: 'assistant',
          content: data.answer || 'No answer received from the server.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage = {
          role: 'assistant',
          content: '⚠️ Failed to retrieve an answer from the backend service. Please check your connection or backend status.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        showToast('Failed to get an answer.', 'error');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      const errorMessage = {
        role: 'assistant',
        content: '⚠️ Network error occurred while connecting to the RAG service.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  const handleRemoveDoc = (docName) => {
    setDocuments((prev) => prev.filter((d) => d.name !== docName));
    showToast(`Removed "${docName}" from session list.`, 'info');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Knowledge Base */}
      <Sidebar
        documents={documents}
        onUpload={handleFileUpload}
        uploading={uploading}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onRemoveDoc={handleRemoveDoc}
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
