from genkeeper import *
import dotenv

dotenv.load_dotenv()

def test_prediction():
  MODEL = os.getenv('AI_MODEL')
  DATASET = os.getenv('AI_DATASET')

  assert MODEL != None
  assert DATASET != None

  genkeeper = GenKeeper(MODEL, DATASET)

  assert not genkeeper.predict("idk")