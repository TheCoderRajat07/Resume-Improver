// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Get references to form elements and result sections
    const resumeForm = document.getElementById('resumeForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const scoreDiv = document.getElementById('score');
    const suggestionsList = document.querySelector('#suggestions ul');
    const interviewTipsList = document.querySelector('#interviewTips ul');
    const errorMessageDiv = document.getElementById('errorMessage');

    // Add event listener for form submission
    resumeForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Hide previous results/errors and show loading indicator
        resultsDiv.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
        submitBtn.disabled = true; // Disable button while processing

        // Collect form data using FormData
        const formData = new FormData(resumeForm);

        // Ensure required fields are not empty before sending
        const resumeFile = formData.get('resumeFile');
        const role = formData.get('role');
        const experience = formData.get('experience');
        const skills = formData.get('skills');

        if (!resumeFile || resumeFile.size === 0 || !role || !experience || !skills) {
            displayError("Please fill in all required fields and upload a resume file.");
            hideLoading();
            return;
        }


        try {
            // Send data to the backend API
            const response = await fetch('http://localhost:3000/analyze-resume', {
                method: 'POST',
                body: formData // FormData automatically sets Content-Type to multipart/form-data
            });

            // Check if the request was successful
            if (!response.ok) {
                const errorData = await response.json();
                 // Prefer the error message from the backend if available
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // Parse the JSON response
            const data = await response.json();

            // Display the results
            displayResults(data);

        } catch (error) {
            console.error('Error during analysis:', error);
            displayError(`Failed to analyze resume: ${error.message}`);
        } finally {
            // Hide loading and re-enable button
            hideLoading();
        }
    });

    // --- Helper Functions ---

    // Function to display analysis results
    function displayResults(data) {
        // Show the results section
        resultsDiv.classList.remove('hidden');

        // Display the score
        scoreDiv.textContent = `Selection Score: ${data.score}/100`;

        // Display suggestions
        suggestionsList.innerHTML = ''; // Clear previous list items
        if (data.suggestions && data.suggestions.length > 0) {
            data.suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });
        } else {
             suggestionsList.innerHTML = '<li>No specific suggestions available at this time.</li>';
        }


        // Display interview tips
        interviewTipsList.innerHTML = ''; // Clear previous list items
         if (data.interviewTips && data.interviewTips.length > 0) {
            data.interviewTips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                interviewTipsList.appendChild(li);
            });
        } else {
            interviewTipsList.innerHTML = '<li>No specific interview tips available at this time.</li>';
        }
    }

    // Function to display error message
    function displayError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove('hidden');
        resultsDiv.classList.add('hidden'); // Hide results if error occurs
    }

    // Function to hide loading indicator and enable button
    function hideLoading() {
        loadingDiv.classList.add('hidden');
        submitBtn.disabled = false;
    }

});