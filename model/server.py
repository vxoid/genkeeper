from flask import Flask, jsonify, request, make_response, Response, send_file
from genkeeper import *
import dotenv
import os

dotenv.load_dotenv()

MODEL = os.getenv('MODEL')
DATASET = os.getenv('DATASET')

app = Flask(__name__)
genkeeper = GenKeeper(MODEL, DATASET)

@app.get("/v1/predict/<query>")
def get_prediction_endpoint(query):
  try:
    query = str(query)
  except ValueError:
    return make_response(jsonify({ "error": f"cannot parse query as string: '{query}'" }), 400)
  
  return get_prediction(query)

def get_prediction(query: str) -> Response:
  try:
    return make_response(jsonify({ "query": query, "prediction": genkeeper.predict(query) }), 200)
  except Exception as e:
    return create_error_response(e)

def create_error_response(e):
  return make_response(jsonify(create_error_message(e)), 500)

def create_error_message(e):
  return {"error": str(e)}

if __name__ == "__main__":
  app.run(debug=True, port=int(os.getenv('PORT')))