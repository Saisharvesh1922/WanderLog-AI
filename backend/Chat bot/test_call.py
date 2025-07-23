import requests

response = requests.post("http://localhost:8000/chat", json={
    "userStories": [
        {"story": "I visited Tokyo in 2022 and ate sushi."},
        {"story": "In 2023, I went to Kerala and enjoyed the backwaters."}
    ],
    "question": "What did I eat?",
    "chatHistory": []
})

print(response.json())
