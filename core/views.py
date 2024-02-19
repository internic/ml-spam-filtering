from django.shortcuts import render, redirect
from django.http import JsonResponse
from textprocessing.ml_model import spam_model  # Adjust the import path as needed
from textprocessing.sentiment_analysis import sentiment_analyzer

from django.views.decorators.csrf import csrf_exempt  # Import csrf_exempt decorator



# Homepage
def home(request):
    headerTransparent = True
    # context = {
    #     'headerTransparent': headerTransparent
    # }
    return render(request, "home_page.html")






@csrf_exempt  # Use this decorator to bypass CSRF token for this view. Ensure to handle CSRF tokens in your AJAX call for security.
def classify_text(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        text = request.POST.get('text', None)
        if text:
            # Spam filter analysis with custom model
            prediction, probability = spam_model.predict(text)
            
            # Sentiment analysis with DistilBERT
            sentiment_result = sentiment_analyzer.analyze(text)
            
            
            # Assuming binary classification: 0 for ham, 1 for spam
            data = {
                "prediction": int(prediction[0]),  # Convert numpy type to Python type
                "probability": probability[0][1],  # Probability of being spam
                
                
                "sentiment_analysis": sentiment_result[0]  # Assuming we're interested in the first result
            }
            return JsonResponse(data)
        else:
            return JsonResponse({"error": "No text provided"}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)
