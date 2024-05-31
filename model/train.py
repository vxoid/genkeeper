from genkeeper import *

MODEL = 'model.pth'

def main():
  genkeeper = GenKeeper(MODEL)
  print(f"prediction: {genkeeper.predict('')}")

if __name__ == "__main__":
  main()