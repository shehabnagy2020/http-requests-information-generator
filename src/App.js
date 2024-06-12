import React, { useState } from 'react';
import './App.css';

function App() {
  const [requests, setRequests] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const addRequest = (newRequest) => {
    if (editIndex !== null) {
      const updatedRequests = requests.map((request, index) =>
        index === editIndex ? newRequest : request
      );
      setRequests(updatedRequests);
      setEditIndex(null);
    } else {
      setRequests([...requests, newRequest]);
    }
  };

  const editRequest = (index) => {
    setEditIndex(index);
  };

  const downloadMarkdown = () => {
    const markdown = convertToMarkdown(requests);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = new document.createElement('a');
    a.href = url;
    a.download = 'requests.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const convertToMarkdown = (requests) => {
    return requests
      .map((req, index) => `
## Request ${index + 1}

**URL:** ${req.url}

**Method:** ${req.method}

**Payload:**
\`\`\`json
${req.payload}
\`\`\`

**Response:**
\`\`\`json
${req.response}
\`\`\`
      `)
      .join('\n');
  };

  const exportToJson = () => {
    const json = JSON.stringify(requests, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requests.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const importFromJson = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const importedRequests = JSON.parse(e.target.result);
        setRequests(importedRequests);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="App">
      <h1>HTTP Requests Tracker</h1>
      <RequestForm addRequest={addRequest} editIndex={editIndex} requests={requests} />
      <RequestList requests={requests} editRequest={editRequest} />
      <div className="button-container">
        <button onClick={downloadMarkdown}>Download Markdown</button>
        <button onClick={exportToJson}>Export to JSON</button>
        <input
          type="file"
          accept="application/json"
          onChange={importFromJson}
          style={{ display: 'none' }}
          id="jsonInput"
        />
        <label htmlFor="jsonInput" className="file-upload-label">
          Import from JSON
        </label>
      </div>
    </div>
  );
}

function RequestForm({ addRequest, editIndex, requests }) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [payload, setPayload] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = { url, method, payload, response };
    addRequest(newRequest);
    setUrl('');
    setMethod('GET');
    setPayload('');
    setResponse('');
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    const regexUrl = inputUrl
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\d+/g, '\\d+')
      .replace(/\//g, '\\/')
      .replace(/\./g, '\\.');
    setUrl(regexUrl);
  };

  React.useEffect(() => {
    if (editIndex !== null) {
      const request = requests[editIndex];
      setUrl(request.url);
      setMethod(request.method);
      setPayload(request.payload);
      setResponse(request.response);
    }
  }, [editIndex, requests]);

  return (
    <div className="request-form">
      <h2>{editIndex !== null ? 'Edit Request' : 'Add New Request'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url">URL:</label>
          <input type="text" id="url" value={url} onChange={handleUrlChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="method">Method:</label>
          <select id="method" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="payload">Payload:</label>
          <textarea id="payload" rows="4" value={payload} onChange={(e) => setPayload(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="response">Response:</label>
          <textarea id="response" rows="4" value={response} onChange={(e) => setResponse(e.target.value)} />
        </div>
        <div className="button-container">
          <button type="submit">{editIndex !== null ? 'Update Request' : 'Add Request'}</button>
        </div>
      </form>
    </div>
  );
}

function RequestList({ requests, editRequest }) {
  const [openIndex, setOpenIndex] = useState(-1);

  const toggleDetails = (index) => {
    setOpenIndex(index === openIndex ? -1 : index);
  };

  return (
    <div>
      <h2>Request List</h2>
      <ul className="request-list">
        {requests.map((request, index) => (
          <li key={index} className="request-item">
            <div className="request-header" onClick={() => toggleDetails(index)}>
              {openIndex === index ? '▼' : '►'} {request.url}
              <button className="edit-button" onClick={() => editRequest(index)}>
                Edit
              </button>
            </div>
            {openIndex === index && (
              <div className="request-details">
                <strong>Method:</strong> {request.method}
                <br />
                <strong>Payload:</strong> {request.payload}
                <br />
                <strong>Response:</strong> {request.response}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
