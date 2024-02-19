from joblib import load

class SpamModel:
    def __init__(self):
        self.bundle = load('models/spamfilter/spam_filter_bundle_large.joblib')
        self.model = self.bundle["model"]
        self.vectorizer = self.bundle["vectorizer"]

    def predict(self, text):
        processed_text = self.vectorizer.transform([text])
        prediction = self.model.predict(processed_text)
        probability = self.model.predict_proba(processed_text)
        return prediction, probability

spam_model = SpamModel()
