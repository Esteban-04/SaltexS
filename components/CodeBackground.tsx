import React, { useState, useEffect } from 'react';

const codeSnippets = [
  'const x = 10;',
  'if (err) throw err;',
  'console.log("init");',
  'return <App />;',
  'const [count, setCount] = useState(0);',
  'import React from "react";',
  'const API_URL = process.env.API_URL;',
  'function fetchData() { ... }',
  'a.map(i => i * 2);',
  '.container { display: flex; }',
  'z-index: 10;',
  'type User = { id: string; }',
  'await fetch(url);',
  'Promise.all([...]);',
  'background-color: #0d1a2e;',
  'opacity: 0.5;',
];

const ipAddresses = [
  '192.168.1.1',
  '10.0.0.1',
  '172.16.0.10',
  '203.0.113.42',
  '198.51.100.0',
  '8.8.8.8',
  '1.1.1.1',
  '127.0.0.1',
  '255.255.255.0',
  '192.168.12.10',
  '192.168.15.20',
  '10.1.2.3',
];

const displayItems = [...codeSnippets, ...ipAddresses];

interface Snippet {
  id: number;
  code: string;
  top: string;
  left: string;
  opacity: number;
  fontSize: string;
  animationDuration: string;
}

const CodeBackground: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    const generatedSnippets: Snippet[] = [];
    const snippetCount = 50; // Adjust for density

    for (let i = 0; i < snippetCount; i++) {
      generatedSnippets.push({
        id: i,
        code: displayItems[Math.floor(Math.random() * displayItems.length)],
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.2 + 0.1, // Faint opacity
        fontSize: `${Math.random() * 8 + 8}px`, // Small font sizes
        animationDuration: `${Math.random() * 20 + 15}s`,
      });
    }
    setSnippets(generatedSnippets);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {snippets.map((snippet) => (
        <pre
          key={snippet.id}
          className="text-cyan-200 font-mono absolute animate-pulse"
          style={{
            top: snippet.top,
            left: snippet.left,
            opacity: snippet.opacity,
            fontSize: snippet.fontSize,
            animationDuration: snippet.animationDuration,
            textShadow: '0 0 5px rgba(100, 200, 255, 0.5)',
            transform: 'translateX(-50%) translateY(-50%)',
          }}
        >
          {snippet.code}
        </pre>
      ))}
    </div>
  );
};

export default CodeBackground;