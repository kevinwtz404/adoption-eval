---
title: adoption-eval API
emoji: 🔍
colorFrom: purple
colorTo: purple
sdk: gradio
sdk_version: "5.33.0"
app_file: app.py
pinned: false
---

# adoption-eval API

Backend for the [adoption-eval](https://github.com/kevinwtz404/adoption-eval) guide. Proxies step analysis requests to Gemini.

## Setup

1. Create a new Space on Hugging Face
2. Upload these files (app.py, requirements.txt, this README)
3. Add your Gemini API key as a Space secret: Settings → Secrets → `GEMINI_API_KEY`
4. The Space will start automatically

## Usage

The Gradio app exposes an API at `/api/predict`. The adoption-eval site calls this endpoint directly.
