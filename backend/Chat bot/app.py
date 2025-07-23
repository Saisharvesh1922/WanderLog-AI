from flask import Flask, request, jsonify
from chatbot import create_user_chatbot
from dotenv import load_dotenv
from flask_cors import CORS


load_dotenv()
app = Flask(__name__)
CORS(app)  

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_stories = data.get("userStories", [])
    question = data.get("question", "")
    chat_history = data.get("chatHistory", [])

    if not user_stories or not question:
        return jsonify({"error": "Missing data"}), 400

    try:
        chatbot = create_user_chatbot(user_stories)
        result = chatbot.invoke({"question": question, "chat_history": chat_history})
        print("Result from chatbot:", result)

        
        chat_history = result.get("chat_history", [])

        formatted_history = []
        for msg in chat_history:
            if hasattr(msg, "type") and hasattr(msg, "content"):
                formatted_history.append({
                    "type": msg.type,
                    "content": msg.content
                })
            else:
               
                formatted_history.append(str(msg))

        last_ai_msg = next((msg for msg in reversed(chat_history) if msg.type == "ai"), None)
        answer = last_ai_msg.content if last_ai_msg else "No answer found"

        return jsonify({
            "answer": answer,
            "chatHistory": formatted_history
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=2000) 