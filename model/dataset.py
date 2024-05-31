import torch.utils.data as data
from collections import Counter
from typing import List
import pandas as pd
from tcm import *
import re

def preprocess_text(text: str) -> str:
  text = text.lower()
  text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
  return text

def _tokenize(text: str) -> List[str]:
   return text.split()

def _build_vocab(texts: List[str]):
  counter = Counter()
  for text in texts:
      counter.update(_tokenize(text))
  return {word: i + 1 for i, (word, _) in enumerate(counter.items())}

class Dataset(data.Dataset):
  def __init__(self, annotations: str, length: int = 80, device: str = "cpu"):
    self.annotations = pd.read_csv(annotations)
    texts = [preprocess_text(text) for text in self.annotations["text"].values]
    self.labels = torch.tensor(self.annotations["label"].astype(int).values, dtype=torch.float32).to(device)
    self.device = device
    self.vocab = _build_vocab(texts)
    self.length = length
    
    self.texts = [self.text_to_sequence(text) for text in texts]

  def create_model(self) -> TextClassificationModel:
    return TextClassificationModel(len(self.vocab) + 1, self.device).to(self.device)

  def load_model(self, path: str) -> TextClassificationModel:
    model = TextClassificationModel(len(self.vocab) + 1, self.device).to(self.device)
    model.load(path)
    return model

  def get_train_split(self, train_split: float):
    length = len(self)
    train_size = int(train_split * length)
    val_size = length - train_size

    train_dataset, val_dataset = torch.utils.data.random_split(self, [train_size, val_size])
    return train_dataset, val_dataset
  
  def text_to_sequence(self, text):
    tokens = _tokenize(text)
    return self._cut(self._pad(torch.tensor([self.vocab.get(token, 0) for token in tokens], dtype=torch.long))).to(self.device)

  def _pad(self, seq: torch.Tensor) -> torch.Tensor:
    length = seq.shape[0]
    if length < self.length:
      return torch.nn.functional.pad(seq, (0, self.length - length))
    
    return seq

  def _cut(self, seq: torch.Tensor) -> torch.Tensor:
    if seq.shape[0] > self.length:
      return seq[:self.length]

    return seq

  def __len__(self) -> int:
    return len(self.texts)

  def __getitem__(self, index):
    return self.texts[index], self.labels[index]