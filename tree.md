researchmind/
│
├── backend/
│   ├── .env                   # [EXISTING] Stores GEMINI_API_KEY & TAVILY_API_KEY
│   ├── requirements.txt       # [MODIFIED] Backend packages (FastAPI, LangChain, etc.)
│   ├── tools.py               # [EXISTING] Tavily search & BeautifulSoup scraper
│   ├── agents.py              # [EXISTING] Gemini setup, Writer chain, Critic chain
│   ├── api.py                 # [NEW] FastAPI server with SSE live-stream endpoint
│   └── main.py                # [EXISTING] Terminal/CLI test runner (optional)
│
├── frontend/
│   ├── package.json           # [NEW] Node dependencies (React, Lucide, Tailwind)
│   ├── vite.config.js         # [NEW] Vite build configuration
│   ├── tailwind.config.js     # [NEW] Tailwind CSS design settings (Manus theme)
│   ├── postcss.config.js      # [NEW] CSS processing config
│   ├── index.html             # [NEW] Web entry point
│   └── src/
│       ├── App.jsx            # [NEW] Manus-style UI, live stepper & report viewer
│       ├── main.jsx           # [NEW] React mounting script
│       └── index.css          # [NEW] Global styling & Tailwind directives
│
├── .gitignore                 # Exclude node_modules, .env, __pycache__
└── README.md                  # Project documentation & architecture diagram