from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from genkeeper import *
import dotenv
import os

dotenv.load_dotenv()

MODEL = os.getenv('MODEL')
DATASET = os.getenv('DATASET')

app = FastAPI()
genkeeper = GenKeeper(MODEL, DATASET)

@app.get("/v1/predict/{query}")
async def get_prediction_endpoint(query: str = ""):  
  return get_prediction(query)

def get_prediction(query: str):
  try:
    return { "query": query, "prediction": genkeeper.predict(query) }
  except Exception as e:
    create_error(e)

def create_error(e):
  raise HTTPException(status_code=500, detail=f"Error: {e}")

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host=os.getenv('HOST'), port=int(os.getenv('PORT')))