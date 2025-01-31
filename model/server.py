from fastapi import FastAPI, HTTPException
from genkeeper import *
import dotenv
import os

dotenv.load_dotenv()

MODEL = os.getenv('AI_MODEL')
DATASET = os.getenv('AI_DATASET')

app = FastAPI()
genkeeper = GenKeeper(MODEL, DATASET)

@app.get("/v1/predict/{query}")
async def get_prediction_endpoint(query: str = ""):  
  return get_prediction(query)

@app.post("/v1/evaluate/{query}")
async def post_evaluate_endpoint(query: str = "", result: bool = True):
  return post_evaluate(query, result)

def post_evaluate(query: str, value: bool):
  try:
    return { "loss": genkeeper.evaluate(query, value) }
  except Exception as e:
    create_error(e)

def get_prediction(query: str):
  try:
    return { "query": query, "prediction": genkeeper.predict(query) }
  except Exception as e:
    create_error(e)

def create_error(e):
  raise HTTPException(status_code=500, detail=f"Error: {e}")

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host=os.getenv('AI_HOST'), port=int(os.getenv('AI_PORT')))