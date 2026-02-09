/**
 * ImageUploader Class
 * Handles drag-and-drop image uploads, client-side compression, and preview.
 * This helper makes it easy to add image upload functionality to any form.
 */
export default class ImageUploader {
    /**
     * @param {string} dropZoneId - ID of the container element for drag & drop
     * @param {string} previewId - ID of the element to show preview (optional)
     * @param {string} inputId - ID of the hidden file input element
     */
    constructor(dropZoneId, previewId, inputId) {
        this.dropZone = document.getElementById(dropZoneId);
        this.preview = document.getElementById(previewId);
        this.input = document.getElementById(inputId);
        this.imageUrl = null;

        this.init();
    }

    // Initialize event listeners
    init() {
        if (!this.dropZone) return;

        // Prevent default drag behaviors to allow dropping
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Visual feedback when dragging over
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.highlight(), false);
        });

        // Remove visual feedback when dragging out or dropping
        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.unhighlight(), false);
        });

        // Handle the actual file drop
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);

        // Handle click to open file browser
        this.dropZone.addEventListener('click', () => {
            if (this.input) this.input.click();
        });

        // Handle file selection from standard input
        if (this.input) {
            this.input.addEventListener('change', (e) => this.handleFiles(e.target.files));
        }
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight() {
        this.dropZone.classList.add('highlight');
    }

    unhighlight() {
        this.dropZone.classList.remove('highlight');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];

        // 1. Validate file type (must be image)
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file (JPG, PNG)');
            return;
        }

        // 2. Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        this.uploadImage(file);
    }

    async uploadImage(file) {
        // Show loading spinner
        this.dropZone.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner"></div>
                <p>Processing image...</p>
            </div>
        `;

        try {
            // Compress and convert image to base64 string
            // This allows us to display it immediately without a server
            const compressedBase64 = await this.compressImage(file);

            this.imageUrl = compressedBase64;
            this.showPreview(this.imageUrl);

            // Dispatch event so other scripts know an image is ready
            const event = new CustomEvent('imageUploaded', { detail: { url: this.imageUrl } });
            this.dropZone.dispatchEvent(event);

        } catch (error) {
            console.error('Processing error:', error);
            alert('Failed to process image. Please try again.');
            this.resetDropZone();
        }
    }

    /**
     * Compresses image using Canvas API
     * Returns a Promise that resolves with the base64 string
     */
    compressImage(file, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            // Read the file as a Data URL
            reader.readAsDataURL(file);

            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    // Create a virtual canvas to draw the image
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if too large, maintaining aspect ratio
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw image onto canvas
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert canvas back to image (compressed/resized)
                    // Returns: "data:image/jpeg;base64,....."
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedBase64);
                };

                img.onerror = () => reject(new Error('Failed to load image'));
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
        });
    }

    showPreview(url) {
        // Show the image and a "Change" button
        this.dropZone.innerHTML = `
            <img src="${url}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="margin-top: 10px;">
                <button type="button" class="change-img-btn" style="padding: 6px 12px; font-size: 0.9em; cursor: pointer;">
                    Change Image
                </button>
            </div>
        `;

        // Re-attach click listener to the new button
        const changeBtn = this.dropZone.querySelector('.change-img-btn');
        if (changeBtn) {
            changeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't trigger dropZone click
                if (this.input) this.input.click();
            });
        }
    }

    resetDropZone() {
        this.dropZone.innerHTML = `
            <p>Drag & drop image here or click to browse</p>
            <small style="color: #888;">Max size: 5MB</small>
        `;
    }

    getImageUrl() {
        return this.imageUrl;
    }
}
