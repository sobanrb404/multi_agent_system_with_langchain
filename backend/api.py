from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio

# Import your existing agents & chains
from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

app = FastAPI(title="ResearchMind API")

# Allow your future React frontend (running on port 5173) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Defines the expected JSON input: {"topic": "your query"}
class ResearchRequest(BaseModel):
    topic: str


# Quick health check route to verify the server runs
@app.get("/")
def health_check():
    return {"status": "ResearchMind API is active and ready"}


async def research_event_generator(topic: str):
    """Executes each agent sequentially and streams live JSON updates via SSE."""

    # ── Step 1: Search Agent ─────────────────────────────────
    yield f"data: {json.dumps({'step': 1, 'agent': 'search', 'status': 'running', 'message': f'Searching web for: {topic}...' })}\n\n"

    search_agent = build_search_agent()
    # asyncio.to_thread ensures LangChain doesn't freeze the FastAPI server
    sr = await asyncio.to_thread(
        search_agent.invoke, {"messages": [("user", f"Research: {topic}")]}
    )
    search_text = sr["messages"][-1].content

    yield f"data: {json.dumps({'step': 1, 'agent': 'search', 'status': 'done', 'message': 'Web exploration complete.'})}\n\n"

    # ── Step 2: Reader Agent ─────────────────────────────────
    yield f"data: {json.dumps({'step': 2, 'agent': 'reader', 'status': 'running', 'message': 'Extracting in-depth content from sources...' })}\n\n"

    reader_agent = build_reader_agent()
    rr = await asyncio.to_thread(
        reader_agent.invoke,
        {
            "messages": [
                (
                    "user",
                    f"Extract key content from these search results:\n\n{search_text[:1200]}",
                )
            ]
        },
    )
    scraped_text = rr["messages"][-1].content

    yield f"data: {json.dumps({'step': 2, 'agent': 'reader', 'status': 'done', 'message': 'Content extraction complete.'})}\n\n"

    # ── Step 3: Writer Chain ─────────────────────────────────
    yield f"data: {json.dumps({'step': 3, 'agent': 'writer', 'status': 'running', 'message': 'Drafting synthesized report...' })}\n\n"

    combined_research = (
        f"Search Findings:\n{search_text}\n\nScraped Details:\n{scraped_text}"
    )
    report = await asyncio.to_thread(
        writer_chain.invoke, {"topic": topic, "research": combined_research}
    )

    yield f"data: {json.dumps({'step': 3, 'agent': 'writer', 'status': 'done', 'message': 'Report drafted successfully.', 'report': report})}\n\n"

    # ── Step 4: Critic Chain ─────────────────────────────────
    yield f"data: {json.dumps({'step': 4, 'agent': 'critic', 'status': 'running', 'message': 'Performing quality audit...' })}\n\n"

    critique = await asyncio.to_thread(critic_chain.invoke, {"report": report})

    yield f"data: {json.dumps({'step': 4, 'agent': 'critic', 'status': 'done', 'message': 'Audit complete.', 'critique': critique})}\n\n"


@app.post("/api/research")
async def run_pipeline(request: ResearchRequest):
    """Client calls this endpoint to receive live SSE events."""
    return StreamingResponse(
        research_event_generator(request.topic), media_type="text/event-stream"
    )
