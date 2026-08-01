import { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    try {
      const response = await fetch('https://rag-assistant-nhi.duckdns.org/upload/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully!');
      } else {
        alert('Failed to upload file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      alert('Please enter a question.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://rag-assistant-nhi.duckdns.org/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnswer(data.answer || 'No answer received.');
      } else {
        alert('Failed to get an answer.');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      alert('An error occurred while asking the question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>AI Assistant</h1>

      {/* Upload Form */}
      <section>
        <h2>Upload File</h2>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <button onClick={handleFileUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </section>

      {/* Ask Form */}
      <section>
        <h2>Ask a Question</h2>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
        />
        <button onClick={handleAskQuestion} disabled={loading}>
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </section>

      {/* Answer Display */}
      <section>
        <h2>Answer</h2>
        <p>{answer}</p>
      </section>
    </div>
  );
}

export default App;
