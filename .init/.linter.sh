#!/bin/bash
cd /home/kavia/workspace/code-generation/voice-persona-ai-7cdff3c0/mimic_ai_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

