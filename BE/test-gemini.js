const axios = require('axios');

const API_KEY = 'AIzaSyDnl1UW4FfUyq_OuGHJw6GgW1KvutmLImA'; // Thay bằng key của bạn
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const prompt = "Explain how AI works in a few words.";

async function testGemini() {
  try {
    const res = await axios.post(
      API_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': API_KEY
        }
      }
    );

    const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      console.log("✅ Gemini response:");
      console.log(text);
    } else {
      console.log("⚠️ No valid response in the API result.");
    }

  } catch (error) {
    if (error.response) {
      console.error(`❌ Error: ${error.response.status} - ${error.response.statusText}`);
      console.error(error.response.data);
    } else {
      console.error("❌ Unexpected error:", error.message || error);
    }
  }
}

testGemini();
