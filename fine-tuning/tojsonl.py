import jsonlines, json

with open('fine-tuning/training_data.json', 'r') as JSON_file:
    JSON_file = json.load(JSON_file)

with jsonlines.open('fine-tuning/training_data.jsonl', 'w') as writer:
    for entry in JSON_file:
        writer.write(entry)