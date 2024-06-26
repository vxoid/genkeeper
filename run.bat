@echo off
start cmd /c "cd model && python server.py && pause"
start cmd /c "cd client && npm run dev && pause"