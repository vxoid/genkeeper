import torch.nn.functional as F
import torch

class TextClassificationModel(torch.nn.Module):
  def __init__(self, vocab_size, device: str = "cpu"):
    super(TextClassificationModel, self).__init__()
    self.embedding = torch.nn.Embedding(vocab_size, 128)
    self.pool = torch.nn.MaxPool2d(kernel_size=3, stride=1, padding=2)
    self.linear1 = torch.nn.Linear(128, 1)
    self.device = device

  def forward(self, text):
    embedded = self.embedding(text)
    pooled = F.avg_pool2d(embedded, (embedded.shape[1], 1)).squeeze(1)
    return self.linear1(pooled)

  def load(self, model_path: str):
    self.load_state_dict(torch.load(model_path))

  def train_model(self, train_loader, val_loader, criterion, optimizer, num_epochs: int = 10):
    for epoch in range(num_epochs):
      train_loss = self.train_epoch(train_loader, criterion, optimizer)
      val_loss, val_accuracy = self.evaluate(val_loader, criterion)
      print(f'Epoch: {epoch+1}, Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}, Val Accuracy: {val_accuracy:.4f}')
  
  def train_epoch(self, train_loader, criterion, optimizer):
    self.train()
    total_loss = 0
    for text, label in train_loader:
      optimizer.zero_grad()
      output = self(text)
      loss = criterion(output.squeeze(), label)
      loss.backward()
      optimizer.step()
      total_loss += loss.item()
    return total_loss / len(train_loader)
  
  def evaluate(self, val_loader, criterion):
    self.eval()
    total_loss = 0
    correct = 0
    with torch.no_grad():
      for text, label in val_loader:
        output = self(text)
        loss = criterion(output.squeeze(), label)
        total_loss += loss.item()
        predictions = torch.round(torch.sigmoid(output.squeeze()))
        correct += (predictions == label).sum().item()
    val_len = len(val_loader)
    dataset_len = len(val_loader.dataset)
    return (total_loss / val_len) if val_len != 0 else 0.0, (correct / dataset_len) if dataset_len != 0 else 0.0
  
  def save(self, file: str):
    torch.save(self.state_dict(), file)