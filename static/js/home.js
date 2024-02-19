

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.getElementById("process").addEventListener("click", function() {
    var text = document.getElementById("textbox").value;
    fetch('/classify-text/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: 'text=' + encodeURIComponent(text)
    })
    .then(response => response.json())
    .then(data => {
        let percentage = data.probability * 100;
        let formattedPercentage = percentage.toFixed(2); // Convert to x.xx format

        // Update the gauge chart
        if (window.renderGaugeChart) {
            window.renderGaugeChart(percentage / 100); // Convert percentage for rendering
        }

        // Update the spam probability text
        document.getElementById("spamproba").innerText = `Spam probability ${formattedPercentage}%`;

        // Update sentiment analysis text
        let sentimentScore = (data.sentiment_analysis.score * 100).toFixed(0); // Convert to xx% format
        document.getElementById("sentiment-analysis").innerText = `${data.sentiment_analysis.label.toLowerCase()} (${sentimentScore}%)`;

        // Update sentiment icon based on the label
        let sentimentIconPath = "static/icons/icons8-smile-100.png"; // Default to regular smile
        if (data.sentiment_analysis.label === "POSITIVE") {
            sentimentIconPath = "static/icons/icons8-happy-100.png";
        } else if (data.sentiment_analysis.label === "NEGATIVE") {
            sentimentIconPath = "static/icons/icons8-sad-100.png";
        }

        document.getElementById("sentimenticon").src = sentimentIconPath;

        // Log sentiment analysis results
        console.log("Sentiment Analysis:", data.sentiment_analysis);

    })
    .catch(error => console.error('Error:', error));
});

document.getElementById("clear").addEventListener("click", function() {
    document.getElementById("textbox").value = ''; // Clear textarea
    // Reset the gauge chart and spam probability text
    if (window.renderGaugeChart) {
        window.renderGaugeChart(0.00);
    }
    document.getElementById("spamproba").innerText = "Spam probability 0%";

    // Reset sentiment analysis text
    document.getElementById("sentiment-analysis").innerText = "Process to check it out";

    // Reset sentiment icon back to neutral
    document.getElementById("sentimenticon").src = "static/icons/icons8-smile-100.png";
});
