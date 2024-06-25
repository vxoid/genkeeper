@echo off
start cmd /c "cd model && python server.py"
start cmd /c "cd client && npm run dev"