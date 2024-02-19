from transformers import pipeline, DistilBertTokenizer, TFDistilBertForSequenceClassification

class SentimentAnalyzer:
    def __init__(self):
        self.tokenizer = DistilBertTokenizer.from_pretrained('models/sentiment/DistilBERT/distilbert-base-uncased-finetuned-sst-2-english/')
        self.model = TFDistilBertForSequenceClassification.from_pretrained('models/sentiment/DistilBERT/distilbert-base-uncased-finetuned-sst-2-english/')
        self.nlp = pipeline("sentiment-analysis", model=self.model, tokenizer=self.tokenizer)

    def analyze(self, text):
        return self.nlp(text)

# Initialize the sentiment analyzer
sentiment_analyzer = SentimentAnalyzer()
