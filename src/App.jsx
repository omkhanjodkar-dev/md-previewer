import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

function App() {
  const [markdownContent, setMarkdownContent] = useState('## Welcome to Markdown Previewer\n\nChoose a Markdown file to preview.');
  const [fileName, setFileName] = useState('No file selected');

  const loadFileContent = async (filePath) => {
    try {
      let content;
      if (window.electronAPI) {
        content = await window.electronAPI.readFileContent(filePath);
      } else {
        // Fallback for browser environment (not directly applicable for file path input)
        // This part would typically be handled by the <input type="file"> event
        console.warn("Attempted to load file content directly in browser environment without FileReader.");
        return;
      }
      setMarkdownContent(content);
      setFileName(filePath.split(/[\\/]/).pop()); // Extract file name from path
    } catch (error) {
      setMarkdownContent(`Error loading file: ${error.message}`);
      setFileName('Error');
    }
  };

  useEffect(() => {
    if (window.electronAPI) {
      // Listener for files opened via file association
      window.electronAPI.onFileOpened((filePath) => {
        loadFileContent(filePath);
      });

      // Handle initial launch with a file (if any)
      // This part would ideally be handled by electron.js's initial launch logic
      // and then sent via onFileOpened, but for robustness:
      // (This specific logic might need fine-tuning based on how electron.js sends initial args)
      // If electron.js ensures onFileOpened is called for initial args, this block might be redundant.
    }
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      if (window.electronAPI) {
        // In Electron, we can get the full path for the file, but FileReader is also fine
        // For consistency and showing Electron API usage:
        // We'll rely on FileReader here as the input type="file" doesn't give full path securely.
        // If we needed the full path, we'd send file.path to main process.
        // For now, FileReader is sufficient for user-selected files.
        const reader = new FileReader();
        reader.onload = (e) => {
          setMarkdownContent(e.target.result);
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setMarkdownContent(e.target.result);
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Markdown Previewer</h1>
        <div className="file-input-container">
          <input
            type="file"
            id="file-upload"
            accept=".md,.markdown"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="file-upload-button">
            Open Markdown File
          </label>
          <span className="file-name">{fileName}</span>
        </div>
      </header>
      <main className="App-main">
        <div className="markdown-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </main>
    </div>
  );
}

export default App;
