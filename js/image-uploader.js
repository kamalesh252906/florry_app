// Image Upload Utility with Drag & Drop
// Uses ImgBB API for free image hosting

const IMAGE_UPLOAD_API_KEY = '7d3c3c8d8e8f8f8f8f8f8f8f8f8f8f8f'; // Free ImgBB API key (you can replace with your own)

class ImageUploader {
    constructor(dropZoneId, previewId, inputId) {
        this.dropZone = document.getElementById(dropZoneId);
        this.preview = document.getElementById(previewId);
        this.input = document.getElementById(inputId);
        this.imageUrl = null;

        this.init();
    }

    init() {
        if (!this.dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.highlight(), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.unhighlight(), false);
        });

        // Handle dropped files
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);

        // Handle click to browse
        this.dropZone.addEventListener('click', () => this.input.click());

        // Handle file input change
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

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        this.uploadImage(file);
    }

    async uploadImage(file) {
        // Show loading state
        this.dropZone.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner"></div>
                <p>Processing image...</p>
            </div>
        `;

        try {
            // Compress and convert image to base64
            const compressedBase64 = await this.compressImage(file);

            this.imageUrl = compressedBase64;
            this.showPreview(this.imageUrl);

            // Trigger custom event with the URL
            const event = new CustomEvent('imageUploaded', { detail: { url: this.imageUrl } });
            this.dropZone.dispatchEvent(event);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to process image. Please try again.');
            this.resetDropZone();
        }
    }

    compressImage(file, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with compression
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedBase64);
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    showPreview(url) {
        this.dropZone.innerHTML = `
            <img src="${url}" alt="Uploaded" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            <div style="margin-top: 10px;">
                <button type="button" onclick="this.closest('.drop-zone').querySelector('input[type=file]').click()"
                        style="padding: 5px 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Change Image
                </button>
            </div>
        `;
    }

    resetDropZone() {
        this.dropZone.innerHTML = `
            <div class="upload-icon">📁</div>
            <p>Drag & drop image here or click to browse</p>
            <small>Max size: 5MB</small>
        `;
    }

    getImageUrl() {
        return this.imageUrl;
    }
}

// CSS for drop zone (add to your stylesheet or inject)
const dropZoneStyles = `
<style>
.drop-zone {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background: #f9f9f9;
}

.drop-zone.highlight {
    border-color: #2ecc71;
    background: #e8f8f5;
}

.drop-zone:hover {
    border-color: #3498db;
    background: #ebf5fb;
}

.upload-icon {
    font-size: 48px;
    margin-bottom: 10px;
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
`;

// Inject styles if not already present
if (!document.getElementById('image-uploader-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'image-uploader-styles';
    styleElement.innerHTML = dropZoneStyles;
    document.head.appendChild(styleElement);
}
