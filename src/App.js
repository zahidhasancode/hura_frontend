import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RefreshCw, Settings, Volume2, VolumeX, Upload, Download, ThumbsUp, ThumbsDown, HelpCircle, Moon, Sun } from 'lucide-react';

export default function HuraInteractiveChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("default");
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [typingEffect, setTypingEffect] = useState(true);
  const [currentTypingMessage, setCurrentTypingMessage] = useState(null);
  const [typingSpeed, setTypingSpeed] = useState(30); // ms per character
  const [expandedMessage, setExpandedMessage] = useState(null);
  
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  const suggestions = [
    "Tell me about privacy in decentralized systems",
    "How does Hura protect my data?",
    "What are the benefits of decentralization?",
    "Explain zero-knowledge proofs simply"
  ];

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: "welcome",
      content: "Hello! I'm Hura, your AI assistant focused on privacy and decentralization. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    };
    
    if (typingEffect) {
      setCurrentTypingMessage(welcomeMessage);
    } else {
      setMessages([welcomeMessage]);
    }
  }, []);

  // Handle typing effect
  useEffect(() => {
    if (!currentTypingMessage) return;
    
    let typedContent = "";
    let index = 0;
    const fullContent = currentTypingMessage.content;
    
    const typingInterval = setInterval(() => {
      if (index < fullContent.length) {
        typedContent += fullContent.charAt(index);
        index++;
        
        setMessages(prev => {
          // Find if message already exists
          const msgIndex = prev.findIndex(msg => msg.id === currentTypingMessage.id);
          
          if (msgIndex >= 0) {
            // Update existing message
            const updatedMessages = [...prev];
            updatedMessages[msgIndex] = {
              ...currentTypingMessage,
              content: typedContent,
              isTyping: true
            };
            return updatedMessages;
          } else {
            // Add new message
            return [...prev, {
              ...currentTypingMessage,
              content: typedContent,
              isTyping: true
            }];
          }
        });
      } else {
        // Typing finished
        clearInterval(typingInterval);
        setMessages(prev => {
          const updatedMessages = [...prev];
          const msgIndex = updatedMessages.findIndex(msg => msg.id === currentTypingMessage.id);
          
          if (msgIndex >= 0) {
            updatedMessages[msgIndex] = {
              ...currentTypingMessage,
              content: fullContent,
              isTyping: false
            };
          }
          
          return updatedMessages;
        });
        setCurrentTypingMessage(null);
      }
    }, typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, [currentTypingMessage, typingSpeed]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle text-to-speech
  useEffect(() => {
    if (textToSpeech && messages.length > 0 && !messages[messages.length - 1].isUser && !isSpeaking) {
      speakMessage(messages[messages.length - 1].content);
    }
  }, [messages, textToSpeech]);

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() && e) return;
    
    // const query = e ? input : e;
    
    // Add user message to chat
    const userMessage = { 
      id: Date.now().toString(),
      content: e ? input : e, 
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call your API
      const response = await fetch('https://hurabacked-production.up.railway.app/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          query: e ? input : e,
          session_id: sessionId
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Add bot response to chat
        const botResponse = { 
          id: `bot-${Date.now()}`,
          content: data.response, 
          isUser: false,
          timestamp: new Date()
        };
        
        if (typingEffect) {
          setCurrentTypingMessage(botResponse);
        } else {
          setMessages(prev => [...prev, botResponse]);
        }
      } else {
        // Handle error
        const errorMessage = { 
          id: `error-${Date.now()}`,
          content: "I apologize, but I've encountered an issue processing your request. Please try again.", 
          isUser: false,
          isError: true,
          timestamp: new Date()
        };
        
        if (typingEffect) {
          setCurrentTypingMessage(errorMessage);
        } else {
          setMessages(prev => [...prev, errorMessage]);
        }
      }
    } catch (error) {
      console.error('Error calling API:', error);
      const connectionError = { 
        id: `conn-error-${Date.now()}`,
        content: "I'm unable to connect to the server at the moment. Please check your connection and try again.", 
        isUser: false,
        isError: true,
        timestamp: new Date()
      };
      
      if (typingEffect) {
        setCurrentTypingMessage(connectionError);
      } else {
        setMessages(prev => [...prev, connectionError]);
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const resetConversation = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      stopSpeaking();
      setMessages([]);
      
      const welcomeMessage = {
        id: `welcome-${Date.now()}`,
        content: "Hello! I'm Hura, your AI assistant focused on privacy and decentralization. How can I help you today?",
        isUser: false,
        timestamp: new Date()
      };
      
      if (typingEffect) {
        setCurrentTypingMessage(welcomeMessage);
      } else {
        setMessages([welcomeMessage]);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setMessages(prev => [
          ...prev, 
          { 
            id: `file-${Date.now()}`,
            content: `I've uploaded a file: "${file.name}"`, 
            isUser: true,
            timestamp: new Date(),
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              content: event.target.result.toString().substring(0, 500) + (event.target.result.toString().length > 500 ? '...' : '')
            }
          }
        ]);
        
        // You'd typically send the file to your API here
        setInput(`I'm sending a file named ${file.name}. It's a ${file.type} file.`);
      } catch (error) {
        console.error("Error reading file:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    handleSubmit({ preventDefault: () => {}, suggestion });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleExpandMessage = (messageId) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(messageId);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleTextToSpeech = () => {
    if (textToSpeech && isSpeaking) {
      stopSpeaking();
    }
    setTextToSpeech(!textToSpeech);
  };

  const exportConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.isUser ? 'You' : 'Hura'} (${formatTime(msg.timestamp)}): ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hura-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const rateMessage = (messageId, isPositive) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, rating: isPositive ? 'positive' : 'negative' } 
          : msg
      )
    );
    
    // Here you would typically send this feedback to your API
    console.log(`Message ${messageId} rated ${isPositive ? 'positively' : 'negatively'}`);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800'} transition-colors duration-300`}>
      <header className={`${darkMode ? 'bg-indigo-950' : 'bg-indigo-900'} p-4 text-white shadow-md flex justify-between items-center transition-colors duration-300`}>
        <div>
        
          <h1 className="text-2xl font-bold flex items-center">
            <span className="text-indigo-400 mr-2">
              <img src="/ChatGPT Image Apr 10, 2025, 10_06_02 PM.png" alt="Hura Logo" className="w-8 h-8 rounded-full" />
            </span>
            Hura
          </h1>
          <p className="text-indigo-200 text-sm">Privacy-focused AI Assistant</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-indigo-100 hover:text-white hover:bg-indigo-800 rounded transition-colors"
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={toggleTextToSpeech}
            className={`p-2 text-indigo-100 hover:text-white hover:bg-indigo-800 rounded transition-colors ${textToSpeech ? 'bg-indigo-800' : ''}`}
            title={textToSpeech ? "Disable text-to-speech" : "Enable text-to-speech"}
          >
            {textToSpeech ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-indigo-100 hover:text-white hover:bg-indigo-800 rounded transition-colors"
            title="Upload file"
          >
            <Upload size={20} />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
              accept=".txt,.pdf,.doc,.docx,.csv,.json"
            />
          </button>
          <button 
            onClick={exportConversation}
            className="p-2 text-indigo-100 hover:text-white hover:bg-indigo-800 rounded transition-colors"
            title="Export conversation"
            disabled={messages.length <= 1}
          >
            <Download size={20} />
          </button>
          <button 
            onClick={resetConversation}
            className="p-2 text-indigo-100 hover:text-white hover:bg-indigo-800 rounded transition-colors"
            title="Reset conversation"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 text-indigo-100 hover:text-white hover:bg-indigo-800 rounded transition-colors ${showSettings ? 'bg-indigo-800' : ''}`}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>
      
      {showSettings && (
        <div className={`${darkMode ? 'bg-indigo-900' : 'bg-indigo-800'} text-white p-4 animate-fadeIn transition-colors duration-300`}>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="session-id" className="text-sm font-medium">Session ID:</label>
              <input 
                id="session-id"
                type="text" 
                value={sessionId} 
                onChange={(e) => setSessionId(e.target.value)}
                className={`${darkMode ? 'bg-indigo-800' : 'bg-indigo-700'} text-white px-3 py-1 rounded outline-none focus:ring-2 focus:ring-indigo-300 text-sm flex-1`}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="typing-effect" className="text-sm font-medium">Typing effect:</label>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  id="typing-effect" 
                  type="checkbox" 
                  checked={typingEffect} 
                  onChange={() => setTypingEffect(!typingEffect)}
                  className="opacity-0 absolute h-0 w-0"
                />
                <div className={`block w-10 h-6 rounded-full ${typingEffect ? 'bg-indigo-400' : 'bg-gray-500'} cursor-pointer`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${typingEffect ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="typing-speed" className="text-sm font-medium">Typing speed:</label>
              <input 
                id="typing-speed"
                type="range" 
                min="10" 
                max="100" 
                step="5"
                value={typingSpeed} 
                onChange={(e) => setTypingSpeed(Number(e.target.value))}
                className="flex-1"
                disabled={!typingEffect}
              />
              <span className="text-xs">{typingSpeed}ms</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="suggestions" className="text-sm font-medium">Show suggestions:</label>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  id="suggestions" 
                  type="checkbox" 
                  checked={showSuggestions} 
                  onChange={() => setShowSuggestions(!showSuggestions)}
                  className="opacity-0 absolute h-0 w-0"
                />
                <div className={`block w-10 h-6 rounded-full ${showSuggestions ? 'bg-indigo-400' : 'bg-gray-500'} cursor-pointer`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showSuggestions ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messageContainerRef} className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'bg-gray-900' : 'bg-slate-50'} transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold mr-2 flex-shrink-0">
                  H
                </div>
              )}
              <div className="max-w-xl">
                <div 
                  className={`p-4 rounded-lg shadow ${
                    message.isUser 
                      ? darkMode 
                        ? 'bg-indigo-800 text-white rounded-br-none' 
                        : 'bg-indigo-600 text-white rounded-br-none'
                      : message.isError 
                        ? darkMode
                          ? 'bg-red-900 text-red-100 border border-red-800 rounded-bl-none'
                          : 'bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
                        : darkMode
                          ? 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                  } ${message.isTyping ? 'border-l-4 border-l-indigo-500' : ''} relative group transition-colors duration-300`}
                >
                  <div className={`${expandedMessage === message.id || message.content.length < 280 ? '' : 'line-clamp-5'}`}>
                    {message.content}
                  </div>
                  
                  {message.file && (
                    <div className={`mt-2 p-2 rounded ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{message.file.name}</span>
                        <span className="text-xs">{Math.round(message.file.size / 1024)} KB</span>
                      </div>
                      <div className="text-xs mt-1 overflow-hidden text-ellipsis">
                        {message.file.content}
                      </div>
                    </div>
                  )}
                  
                  {message.content.length > 280 && (
                    <button 
                      onClick={() => toggleExpandMessage(message.id)}
                      className={`text-xs mt-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-500'} hover:underline`}
                    >
                      {expandedMessage === message.id ? 'Show less' : 'Read more'}
                    </button>
                  )}
                  
                  {!message.isUser && !message.isTyping && (
                    <div className={`absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {textToSpeech && (
                        <button 
                          onClick={() => speakMessage(message.content)}
                          className={`p-1 rounded-full hover:bg-indigo-500 hover:text-white ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          title="Read aloud"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => rateMessage(message.id, true)}
                        className={`p-1 rounded-full hover:bg-green-500 hover:text-white ${message.rating === 'positive' ? (darkMode ? 'bg-green-700 text-white' : 'bg-green-500 text-white') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}
                        title="Helpful"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button 
                        onClick={() => rateMessage(message.id, false)}
                        className={`p-1 rounded-full hover:bg-red-500 hover:text-white ${message.rating === 'negative' ? (darkMode ? 'bg-red-700 text-white' : 'bg-red-500 text-white') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}
                        title="Not helpful"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
              
              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold ml-2 flex-shrink-0">
                  U
                </div>
              )}
            </div>
          ))}
          <div ref={messageEndRef} />
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold mr-2 flex-shrink-0">
                H
              </div>
              <div className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-400'} p-4 rounded-lg shadow rounded-bl-none border ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center space-x-2 transition-colors duration-300`}>
                <Loader2 className="animate-spin text-indigo-600" size={16} />
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showSuggestions && messages.length <= 2 && !isLoading && (
        <div className={`px-4 pt-2 ${darkMode ? 'bg-gray-900' : 'bg-slate-50'} transition-colors duration-300`}>
          <div className="max-w-4xl mx-auto">
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Try asking:</p>
            <div className="flex flex-wrap gap-2 pb-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`text-sm px-3 py-1.5 rounded-full ${darkMode ? 'bg-gray-800 text-indigo-300 hover:bg-gray-700' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'} transition-colors duration-150`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={`p-4 ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'} shadow-md transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Hura anything..."
              className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800'
              } transition-colors duration-300`}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={`${darkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-300`}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
            <button
              type="button"
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-300`}
              onClick={() => window.open('/help', '_blank')}
              title="Help & Documentation"
            >
              <HelpCircle size={20} />
            </button>
          </div>
          <div className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Hura is committed to your privacy and decentralized computing
          </div>
        </div>
      </form>
    </div>
  );
}