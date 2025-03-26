function initPdfViewers() {
    // Select all <a> tags that have data-pdf-viewer="true"
    const pdfLinks = document.querySelectorAll('a[data-pdf-viewer="true"]');
    pdfLinks.forEach(link => {
        createPdfViewer(link);
    });
}

function createPdfViewer(element) {
    // Ensure the provided element is an anchor (<a>) tag.
    if (!(element instanceof HTMLAnchorElement)) {
        console.error("Provided element is not an anchor tag.");
        return;
    }

    // Retrieve the PDF URL (check href first; if not, use data-pdf-url)
    const pdfUrl = element.getAttribute('href') || element.getAttribute('data-pdf-url');
    if (!pdfUrl || (!pdfUrl.match(/\.pdf(\?.*)?$/i) && !element.hasAttribute('data-pdf-url'))) {
        console.error("This anchor does not point to a valid PDF file.");
        return;
    }

    // Auto-generate an id if the element doesn't have one
    if (!element.id) {
        element.id = 'pdf-viewer-' + Math.random().toString(36).substr(2, 9);
    }

    // Use data attributes for size if provided; default to 100% width and 600px height
    const width = element.dataset.width || '100%';
    const height = element.dataset.height || '600px';

    // Create a container for the PDF viewer
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = width;
    container.style.height = height;
    container.style.overflow = 'hidden';

    // Create the iframe; initially, set the src to "about:blank"
    const iframe = document.createElement('iframe');
    iframe.src = "about:blank";
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    // Create the fullscreen toggle button
    const fsButton = document.createElement('button');
    fsButton.className = 'pdf-fullscreen-button';
    fsButton.textContent = 'Fullscreen';

    // Append the iframe and button to the container
    container.appendChild(iframe);
    container.appendChild(fsButton);

    // Toggle fullscreen on button click
    fsButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error("Error enabling fullscreen:", err.message);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Listen for fullscreen changes to update the button text
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement === container) {
            fsButton.textContent = 'Exit Fullscreen';
        } else {
            fsButton.textContent = 'Fullscreen';
        }
    });

    // Replace the original anchor tag with the PDF viewer container
    element.parentNode.replaceChild(container, element);

    // Check whether to use the blob method; default is true.
    const useBlob = element.dataset.useBlob !== "false";

    if (useBlob) {
        // Fetch the PDF and create a blob URL
        fetch(pdfUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.blob();
            })
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                iframe.src = blobUrl;
            })
            .catch(error => {
                console.error("Error fetching PDF:", error);
                // Optionally display an error message inside the container
            });
    } else {
        // Directly assign the PDF URL to the iframe src
        iframe.src = pdfUrl;
    }
}