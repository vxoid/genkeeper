import torch.optim as optim
from colorama import Fore
from dataset import *
import os

TRAIN_SIZE = 0.8
BATCH_SIZE = 64
EPOCHS = 500
     
def get_device() -> str:
  gpu_available = torch.cuda.is_available()
  device = "cuda" if gpu_available else "cpu"
  color = Fore.GREEN if gpu_available else Fore.RED
  print(color + f"THE MODEL IS RUNNING ON {device} DEVICE")
  return device

class GenKeeper:
  def __init__(self, path: str, dataset: str):
    self.device = get_device()
    self.dataset = Dataset(dataset, device=self.device)
    self.path = path
    self.criterion = torch.nn.BCEWithLogitsLoss().to(self.device)


    self._train_or_load()
    
  def _train_or_load(self):
    if os.path.exists(self.path):
      self.model = self.dataset.load_model(self.path)
    else:
      self.model = self.dataset.create_model() 
      self._train()

  def _train(self):
    train, val = self.dataset.get_train_split(TRAIN_SIZE)
    train_loader = data.DataLoader(train, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = data.DataLoader(val, batch_size=BATCH_SIZE, shuffle=False)

    optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)

    self.model.train_model(train_loader, val_loader, self.criterion, optimizer, EPOCHS)
    self.model.save(self.path)

    return self
  
  def predict(self, text: str) -> bool:
    self.model.eval()
    with torch.no_grad():
      text_tensor = self.dataset.text_to_sequence(text).unsqueeze(0)
      output = self.model(text_tensor)
      prediction = torch.round(torch.sigmoid(output)).item()
      return True if prediction else False
    
  def evaluate(self, text: str, result: bool) -> float:
    self.model.eval()
    with torch.no_grad():
      label = torch.tensor(1 if result else 0, dtype=torch.float32).to(self.device)
      text_tensor = self.dataset.text_to_sequence(text).unsqueeze(0)
      output = self.model(text_tensor)
      loss = self.criterion(output.squeeze(), label)
      return loss.item()