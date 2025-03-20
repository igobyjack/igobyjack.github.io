document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('markdown-content');
    
    fetch('content.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(markdown => {
            contentContainer.innerHTML = marked.parse(markdown);
        })
        .catch(error => {
            console.error('Error loading markdown content:', error);
            contentContainer.innerHTML = '<p>Error loading content. Please try again later.</p>';
        });
});