import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosinstance';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [allStories, setAllStories] = useState([]);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const navigate = useNavigate();

  const fetchAllStories = async () => {
    try {
      const response = await axiosInstance.get('/get-all-stories');
      if (response.data?.travelStories) {
        setAllStories(response.data.travelStories);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchAllStories();
  }, []);

  const askBot = async () => {
    if (!question.trim()) return;

    const userMessage = { sender: 'user', text: question };
    setChatHistory(prev => [...prev, userMessage]);

    const payload = {
      userStories: allStories.map((story) => ({
        story: story.title + " " + story.story + " " + story.visitedDate + " " + story.visitedLocations
      })),
      question,
      chatHistory: []
    };
    setQuestion("");

    try {
      const response = await fetch("http://localhost:2000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.answer || "No answer received" };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: "An error occurred." }]);
      console.error("Bot error:", error);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "100px",
          right: "35px",
          backgroundColor: "#05B6D3",
          borderRadius: "50%",
          width: "65px",
          height: "65px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: "28px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}
      >
        {isOpen ? <IoClose /> : <FiMessageCircle />}
      </div>

      {/* Chat modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "180px",
            right: "32px",
            width: "320px",
            height: "420px",
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 999
          }}
        >
          <div
            style={{
              backgroundColor: "#05B6D3",
              color: "#fff",
              padding: "1rem",
              fontWeight: "bold"
            }}
          >
            Travel ChatBot
          </div>

          <div
            style={{
              flex: 1,
              padding: "1rem",
              overflowY: "auto",
              fontSize: "0.95rem",
              background: "#f5f7fa"
            }}
          >
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.sender === 'user' ? "right" : "left",
                  marginBottom: "0.75rem"
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "0.6rem 0.9rem",
                    borderRadius: "12px",
                    backgroundColor: msg.sender === 'user' ? "#dcf8c6" : "#fff",
                    maxWidth: "80%",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              borderTop: "1px solid #ddd",
              padding: "0.5rem",
              backgroundColor: "#fff"
            }}
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something..."
              style={{
                flex: 1,
                border: "none",
                padding: "0.5rem",
                fontSize: "0.9rem",
                outline: "none"
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") askBot();
              }}
            />
            <button
              onClick={askBot}
              style={{
                padding: "0.4rem 0.8rem",
                backgroundColor: "#05B6D3",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                marginLeft: "0.5rem",
                cursor: "pointer"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
