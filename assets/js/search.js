document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const query = document.getElementById('query').value.toLowerCase();
        const content = document.getElementById('main');
        
        // Clear previous highlights
        clearHighlights(content);
        
        if (query) {
            highlightText(content, query);
        }
    });
});

function clearHighlights(element) {
    const highlighted = element.querySelectorAll('.highlight');
    highlighted.forEach(span => {
        span.replaceWith(span.textContent);
    });
}

function highlightText(element, query) {
    if (element.nodeType === 3) { // Text node
        const text = element.nodeValue.toLowerCase();
        const match = text.indexOf(query);
        
        if (match !== -1) {
            const span = document.createElement('span');
            span.className = 'highlight';
            const part = element.splitText(match);
            part.nodeValue = part.nodeValue.substring(query.length);
            span.appendChild(document.createTextNode(query));
            element.parentNode.insertBefore(span, part);
        }
    } else if (element.nodeType === 1 && element.childNodes && !['SCRIPT', 'STYLE'].includes(element.tagName)) {
        element.childNodes.forEach(child => highlightText(child, query));
    }
}
