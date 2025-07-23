import os
from langchain.memory import ConversationBufferMemory
from langchain_core.messages import AIMessage, HumanMessage
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores.faiss import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain.docstore.document import Document
from langchain.chains.qa_with_sources import load_qa_with_sources_chain

# Optional: dotenv
from dotenv import load_dotenv
load_dotenv()

def create_user_chatbot(user_stories):
    # Convert list of story strings into LangChain Documents
    documents = [Document(page_content=story['story']) for story in user_stories]

    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    vectorstore = FAISS.from_documents(docs, embeddings)

    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    llm = ChatGroq(
    model="llama3-8b-8192",  
    api_key=os.environ["GROQ_API_KEY"]
)

    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory,
        return_source_documents=False
    )

    return qa_chain
