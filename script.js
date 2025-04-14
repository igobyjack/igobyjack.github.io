document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('markdown-content');
    
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'content'; // Default to content.md if no page specified
    
    const mdFile = page + '.md';
    
    fetch(mdFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(markdown => {
            const cleanMarkdown = markdown.replace(/\/\/ filepath:.*$/m, '');
            contentContainer.innerHTML = marked.parse(cleanMarkdown);
            
            if (page !== 'content') {
                document.title = `${page.charAt(0).toUpperCase() + page.slice(1)} - igobyjack`;
            }
        })
        .catch(error => {
            console.error('Error loading markdown content:', error);
            contentContainer.innerHTML = '<p>Error loading content. Please try again later.</p>';
        });
});