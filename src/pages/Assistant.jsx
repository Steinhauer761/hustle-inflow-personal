const handleSendMessage = async (userMessage) => {
  if (!userMessage.trim()) return;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key missing from environment variables.");
    setMessages((prev) => [...prev, { role: 'assistant', text: "Coach connection failed. Check your API key settings." }]);
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to connect to Coach");
    }

    const botReply = data.candidates[0].content.parts[0].text;
    setMessages((prev) => [...prev, { role: 'assistant', text: botReply }]);
  } catch (error) {
    console.error("Gemini API Error:", error);
    setMessages((prev) => [...prev, { role: 'assistant', text: "Coach connection failed. Try again later." }]);
  }
};
