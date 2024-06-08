import json
import dataset

def read_jsonl(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            yield json.loads(line)


file_path = 'quotes.jsonl'
for json_obj in read_jsonl(file_path):
    print(f"\"{dataset.preprocess_text(json_obj['quote'])}\",1")