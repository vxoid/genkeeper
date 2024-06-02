@echo off
start cmd /c "python model/server.py"
start cmd /c "cd client && npm run dev"