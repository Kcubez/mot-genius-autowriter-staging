/**
 * Image Generator JavaScript
 * Handles file uploads, form interactions, and image generation
 */

// Global variables for uploaded files
let productFile = null;
let logoFile = null;

/**
 * Get required image credits based on quantity
 */
function getRequiredImageCredits(quantityValue) {
  const parsed = Number.parseInt(quantityValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  initializeImageGenerator();
});

/**
 * Initialize all event listeners and functionality
 */
function initializeImageGenerator() {
  // Product upload handlers
  const productUploadInput = document.getElementById('product-upload');
  const productUploadArea = document.getElementById('product-upload-area');

  if (productUploadInput) {
    productUploadInput.addEventListener('change', handleProductUpload);
  }

  if (productUploadArea) {
    productUploadArea.addEventListener('dragover', handleDragOver);
    productUploadArea.addEventListener('dragleave', handleDragLeave);
    productUploadArea.addEventListener('drop', e => handleDrop(e, 'product'));
  }

  // Logo upload handlers
  const logoUploadInput = document.getElementById('logo-upload');
  const logoUploadArea = document.getElementById('logo-upload-area');

  if (logoUploadInput) {
    logoUploadInput.addEventListener('change', handleLogoUpload);
  }

  if (logoUploadArea) {
    logoUploadArea.addEventListener('dragover', handleDragOver);
    logoUploadArea.addEventListener('dragleave', handleDragLeave);
    logoUploadArea.addEventListener('drop', e => handleDrop(e, 'logo'));
  }

  // Logo tint color picker
  const logoTintColor = document.getElementById('logo-tint-color');
  if (logoTintColor) {
    logoTintColor.addEventListener('change', handleColorChange);
  }

  // Logo tint text input manual entry
  const logoTintText = document.getElementById('logo-tint-text');
  if (logoTintText) {
    logoTintText.addEventListener('input', handleManualColorInput);
    logoTintText.addEventListener('blur', validateManualColorInput);
  }

  // Initialize logo tint picker as disabled (no logo uploaded yet)
  setLogoTintEnabled(false);

  // Generate button
  const generateBtn = document.getElementById('generate-image-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', handleGenerateImage);
  }

  // Render button
  const renderBtn = document.getElementById('render-btn');
  if (renderBtn) {
    renderBtn.addEventListener('click', handleRenderPreview);
  }

  // Download button
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', handleDownload);
  }

  // Regenerate button
  const regenerateBtn = document.getElementById('regenerate-btn');
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', handleGenerateImage);
  }

  // Apply language translations
  applyTranslations();

  // Check if there's generated content from the content generator page
  const generatedContent = sessionStorage.getItem('generatedContentForImage');
  if (generatedContent) {
    const extraDirectionsField = document.getElementById('extra-directions');
    if (extraDirectionsField) {
      extraDirectionsField.value = generatedContent;
      // Clear the storage so it doesn't persist on refresh
      sessionStorage.removeItem('generatedContentForImage');
    }
  }
}

/**
 * Handle drag over event
 */
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  this.classList.add('dragover');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  this.classList.remove('dragover');
}

/**
 * Handle drop event
 */
function handleDrop(e, type) {
  e.preventDefault();
  e.stopPropagation();

  const uploadArea = e.currentTarget;
  uploadArea.classList.remove('dragover');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (isValidImageFile(file)) {
      if (type === 'product') {
        productFile = file;
        showProductPreview(file);
      } else if (type === 'logo') {
        logoFile = file;
        showLogoPreview(file);
      }
    } else {
      showNotification('Please upload a valid image file (JPG, PNG, JPEG)', 'error');
    }
  }
}

/**
 * Validate image file type
 */
function isValidImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Handle product image upload
 */
function handleProductUpload(e) {
  const file = e.target.files[0];
  if (file && isValidImageFile(file)) {
    productFile = file;
    showProductPreview(file);
  } else if (file) {
    showNotification('Please upload a valid image file (JPG, PNG, JPEG)', 'error');
  }
}

/**
 * Handle logo image upload
 */
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (file && isValidImageFile(file)) {
    logoFile = file;
    showLogoPreview(file);
  } else if (file) {
    showNotification('Please upload a valid image file (JPG, PNG, JPEG)', 'error');
  }
}

/**
 * Show product image preview
 */
function showProductPreview(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const uploadArea = document.getElementById('product-upload-area');
    const previewContainer = document.getElementById('product-preview-container');
    const previewImage = document.getElementById('product-preview');
    const placeholder = document.getElementById('product-upload-placeholder');

    if (previewImage && previewContainer && placeholder) {
      previewImage.src = e.target.result;
      previewContainer.style.display = 'block';
      placeholder.style.display = 'none';
      if (uploadArea) uploadArea.classList.add('has-image');
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Show logo image preview
 */
function showLogoPreview(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const uploadArea = document.getElementById('logo-upload-area');
    const previewContainer = document.getElementById('logo-preview-container');
    const previewImage = document.getElementById('logo-preview');
    const placeholder = document.getElementById('logo-upload-placeholder');

    if (previewImage && previewContainer && placeholder) {
      previewImage.src = e.target.result;
      previewContainer.style.display = 'block';
      placeholder.style.display = 'none';
      if (uploadArea) uploadArea.classList.add('has-image');

      // Enable logo tint toggle when logo is uploaded
      setLogoTintEnabled(true);
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Remove product image
 */
function removeProductImage() {
  productFile = null;

  const uploadArea = document.getElementById('product-upload-area');
  const previewContainer = document.getElementById('product-preview-container');
  const previewImage = document.getElementById('product-preview');
  const placeholder = document.getElementById('product-upload-placeholder');
  const uploadInput = document.getElementById('product-upload');

  if (previewImage) previewImage.src = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (placeholder) placeholder.style.display = 'flex';
  if (uploadInput) uploadInput.value = '';
  if (uploadArea) uploadArea.classList.remove('has-image');
}

/**
 * Remove logo image
 */
function removeLogoImage() {
  logoFile = null;

  const uploadArea = document.getElementById('logo-upload-area');
  const previewContainer = document.getElementById('logo-preview-container');
  const previewImage = document.getElementById('logo-preview');
  const placeholder = document.getElementById('logo-upload-placeholder');
  const uploadInput = document.getElementById('logo-upload');

  if (previewImage) previewImage.src = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (placeholder) placeholder.style.display = 'flex';
  if (uploadInput) uploadInput.value = '';
  if (uploadArea) uploadArea.classList.remove('has-image');

  // Disable logo tint toggle when logo is removed
  setLogoTintEnabled(false);
}

/**
 * Open the color picker for logo tint
 */
function openColorPicker() {
  const colorInput = document.getElementById('logo-tint-color');
  if (colorInput) {
    colorInput.click();
  }
}

/**
 * Handle color change from the color picker
 */
function handleColorChange(event) {
  const color = event.target.value;
  const circle = document.getElementById('color-picker-circle');
  const textInput = document.getElementById('logo-tint-text');
  const backBtn = document.getElementById('back-to-original-btn');

  if (circle && textInput) {
    // Update the circle background with the selected color
    circle.style.backgroundColor = color;
    circle.classList.add('has-color');

    // Convert hex to color name or show hex
    const colorName = getColorName(color);
    textInput.value = colorName;

    // Show back to original button
    if (backBtn) {
      backBtn.classList.remove('hidden');
    }
  }
}

/**
 * Handle manual color input
 */
function handleManualColorInput(event) {
  const text = event.target.value.toUpperCase();
  const circle = document.getElementById('color-picker-circle');
  const backBtn = document.getElementById('back-to-original-btn');
  const colorInput = document.getElementById('logo-tint-color');

  // If text is empty or ORIGINAL, just update UI potentially
  if (!text || text === 'ORIGINAL') {
    if (text === 'ORIGINAL') {
      resetLogoTint();
    }
    return;
  }

  // Check if it's a valid color name or hex
  const hexColor = nameToHex(text);

  if (hexColor && circle) {
    circle.style.backgroundColor = hexColor;
    circle.classList.add('has-color');
    if (colorInput) colorInput.value = hexColor;

    // Show back to original button
    if (backBtn) {
      backBtn.classList.remove('hidden');
    }
  }
}

/**
 * Validate manual color input on blur
 */
function validateManualColorInput(event) {
  const text = event.target.value;
  if (!text || text.trim() === '') {
    resetLogoTint();
  }
}

/**
 * Convert color name to hex
 */
function nameToHex(name) {
  const colors = {
    RED: '#FF0000',
    GREEN: '#00FF00',
    BLUE: '#0000FF',
    YELLOW: '#FFFF00',
    MAGENTA: '#FF00FF',
    CYAN: '#00FFFF',
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    ORANGE: '#FFA500',
    PURPLE: '#800080',
    PINK: '#FFC0CB',
    BROWN: '#A52A2A',
    GRAY: '#808080',
    GREY: '#808080',
  };

  if (colors[name]) return colors[name];

  // Check if valid hex
  const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
  // Add # if missing for hex check
  const potentialHex = name.startsWith('#') ? name : '#' + name;

  if (hexRegex.test(potentialHex)) {
    return potentialHex;
  }

  return null;
}

/**
 * Get a simple color name from hex value
 */
function getColorName(hex) {
  const colors = {
    '#ff0000': 'RED',
    '#00ff00': 'GREEN',
    '#0000ff': 'BLUE',
    '#ffff00': 'YELLOW',
    '#ff00ff': 'MAGENTA',
    '#00ffff': 'CYAN',
    '#ffffff': 'WHITE',
    '#000000': 'BLACK',
    '#ffa500': 'ORANGE',
    '#800080': 'PURPLE',
    '#ffc0cb': 'PINK',
    '#a52a2a': 'BROWN',
    '#808080': 'GRAY',
  };

  // Check for exact match
  const lowerHex = hex.toLowerCase();
  if (colors[lowerHex]) {
    return colors[lowerHex];
  }

  // Return hex if no match
  return hex.toUpperCase();
}

/**
 * Reset logo tint to original
 */
function resetLogoTint() {
  const circle = document.getElementById('color-picker-circle');
  const textInput = document.getElementById('logo-tint-text');
  const colorInput = document.getElementById('logo-tint-color');
  const backBtn = document.getElementById('back-to-original-btn');

  if (circle && textInput) {
    circle.style.backgroundColor = '#4b5563';
    circle.classList.remove('has-color');
    textInput.value = 'ORIGINAL';
    if (colorInput) colorInput.value = '#ffffff';

    // Hide back to original button
    if (backBtn) {
      backBtn.classList.add('hidden');
    }

    // Apply translations if language function is available
    if (typeof applyLanguage === 'function') {
      const currentLang = localStorage.getItem('language') || 'my';
      applyLanguage(currentLang);
    }
  }
}

/**
 * Enable or disable the Logo Tint picker based on whether logo is uploaded
 * Also shows/hides the entire Logo Tint field
 */
function setLogoTintEnabled(enabled) {
  const logoTintContainer = document.getElementById('logo-tint-container');
  const logoTintField = document.getElementById('logo-tint-field');

  if (logoTintField) {
    if (enabled) {
      logoTintField.classList.remove('hidden');
    } else {
      logoTintField.classList.add('hidden');
    }
  }

  if (logoTintContainer) {
    if (enabled) {
      logoTintContainer.classList.remove('disabled');
    } else {
      logoTintContainer.classList.add('disabled');
      // Reset to original when disabled
      resetLogoTint();
    }
  }
}

/**
 * Handle render preview button click
 */
function handleRenderPreview() {
  // Check if product image is uploaded
  if (!productFile) {
    showNotification('Please upload a product image first', 'error');
    return;
  }

  // Show live preview with uploaded assets
  updateLivePreview();
}

/**
 * Update live preview with current assets
 */
function updateLivePreview() {
  const previewEmpty = document.getElementById('preview-empty');
  const generatedImages = document.getElementById('generated-images');

  if (productFile && generatedImages && previewEmpty) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewEmpty.style.display = 'none';
      generatedImages.style.display = 'grid';
      generatedImages.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
    };
    reader.readAsDataURL(productFile);
  }
}

/**
 * Handle generate image button click
 */
async function handleGenerateImage() {
  // Validate required fields
  if (!productFile) {
    showNotification('Please upload a product image', 'error');
    return;
  }

  // Get form values
  const formData = getFormData();
  const requiredCredits = getRequiredImageCredits(formData.quantity);

  if (window.imageCredits) {
    const availableCredits = window.imageCredits.getCredits();
    if (availableCredits !== null && availableCredits < requiredCredits) {
      showNotification('Not enough image credits. Please contact admin.', 'error');
      return;
    }
  }

  // Show loading state
  showLoading(true);

  try {
    // Create FormData for API request
    const apiFormData = new FormData();
    apiFormData.append('product_image', productFile);
    if (logoFile) {
      apiFormData.append('logo_image', logoFile);
    }
    apiFormData.append('main_headline', formData.mainHeadline);
    apiFormData.append('subtext', formData.subtext);
    apiFormData.append('product_name', formData.productName);
    apiFormData.append('price', formData.price);
    apiFormData.append('palette_theme', formData.paletteTheme);
    apiFormData.append('logo_tint', formData.logoTint);
    apiFormData.append('style', formData.style);
    apiFormData.append('quantity', formData.quantity);
    apiFormData.append('extra_directions', formData.extraDirections);

    // Make API request
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      body: apiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate image');
    }

    const data = await response.json();

    // Display generated images
    displayGeneratedImages(data.images || []);
    showNotification('Image generated successfully!', 'success');

    if (window.imageCredits) {
      if (data.remaining_credits !== undefined && data.remaining_credits !== null) {
        window.imageCredits.setCredits(data.remaining_credits);
      } else {
        const latestCredits = window.imageCredits.getCredits();
        if (latestCredits !== null) {
          const nextCredits = Math.max(latestCredits - requiredCredits, 0);
          window.imageCredits.setCredits(nextCredits);
        }
      }
    }
  } catch (error) {
    console.error('Error generating image:', error);
    showNotification(error.message || 'Failed to generate image. Please try again.', 'error');

    // For demo purposes, show a placeholder message
    showDemoPreview();
  } finally {
    showLoading(false);
  }
}

/**
 * Get form data values
 */
function getFormData() {
  const logoTintText = document.getElementById('logo-tint-text');
  const logoTintColor = document.getElementById('logo-tint-color');
  // If text shows ORIGINAL, use 'original', otherwise use the color value
  const logoTint =
    logoTintText?.value === 'ORIGINAL' ? 'original' : logoTintColor?.value || 'original';

  return {
    mainHeadline: document.getElementById('main-headline')?.value || '',
    subtext: document.getElementById('subtext')?.value || '',
    productName: document.getElementById('product-name')?.value || '',
    price: document.getElementById('price')?.value || '',
    paletteTheme: document.getElementById('palette-theme')?.value || 'red-black',
    logoTint: logoTint,
    style: document.getElementById('image-style')?.value || 'modern-minimalist',
    quantity: document.getElementById('quantity')?.value || '1',
    extraDirections: document.getElementById('extra-directions')?.value || '',
  };
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
  const generateBtn = document.getElementById('generate-image-btn');
  const generateBtnText = document.getElementById('generate-btn-text');
  const generateSpinner = document.getElementById('generate-spinner');
  const previewLoading = document.getElementById('preview-loading');

  if (show) {
    if (generateBtn) generateBtn.disabled = true;
    if (generateBtnText) generateBtnText.textContent = 'GENERATING...';
    if (generateSpinner) generateSpinner.classList.remove('hidden');
    if (previewLoading) previewLoading.style.display = 'flex';
  } else {
    if (generateBtn) generateBtn.disabled = false;
    if (generateBtnText) generateBtnText.textContent = 'GENERATE';
    if (generateSpinner) generateSpinner.classList.add('hidden');
    if (previewLoading) previewLoading.style.display = 'none';
  }
}

/**
 * Display generated images in preview area
 */
function displayGeneratedImages(images) {
  const previewEmpty = document.getElementById('preview-empty');
  const generatedImages = document.getElementById('generated-images');
  const previewActions = document.getElementById('preview-actions');

  if (previewEmpty) previewEmpty.style.display = 'none';

  if (generatedImages && images.length > 0) {
    generatedImages.style.display = 'grid';
    generatedImages.innerHTML = images
      .map(
        img =>
          `<img src="${img.url}" alt="Generated Image" onclick="openImageModal('${img.url}')" />`
      )
      .join('');
  }

  if (previewActions) previewActions.style.display = 'flex';
}

/**
 * Show demo preview when API is not available
 */
function showDemoPreview() {
  const previewEmpty = document.getElementById('preview-empty');
  const generatedImages = document.getElementById('generated-images');
  const previewActions = document.getElementById('preview-actions');

  if (previewEmpty) previewEmpty.style.display = 'none';

  if (generatedImages && productFile) {
    generatedImages.style.display = 'grid';
    const reader = new FileReader();
    reader.onload = function (e) {
      generatedImages.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <img src="${e.target.result}" alt="Product Preview" style="max-width: 100%; border-radius: 0.5rem;" />
          <p style="color: #9ca3af; margin-top: 1rem; font-size: 0.875rem;">
            Image generation API endpoint not configured.<br>
            This is a preview of your uploaded product image.
          </p>
        </div>
      `;
    };
    reader.readAsDataURL(productFile);
  }

  if (previewActions) previewActions.style.display = 'flex';
}

/**
 * Handle download button click
 */
function handleDownload() {
  const generatedImages = document.getElementById('generated-images');
  const images = generatedImages?.querySelectorAll('img');

  if (images && images.length > 0) {
    images.forEach((img, index) => {
      const link = document.createElement('a');
      link.href = img.src;
      link.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    showNotification('Download started!', 'success');
  } else {
    showNotification('No images to download', 'error');
  }
}

/**
 * Open image in modal for full view
 */
function openImageModal(imageUrl) {
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'image-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: pointer;
  `;

  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    border-radius: 0.5rem;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  `;

  modal.appendChild(img);
  document.body.appendChild(modal);

  // Close on click
  modal.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Close on Escape key
  const handleEscape = e => {
    if (e.key === 'Escape') {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/**
 * Show notification toast
 */
/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
  // Use global notification system when available
  if (window.notify) {
    if (typeof window.notify[type] === 'function') {
      window.notify[type](message);
    } else {
      window.notify.show(message, type);
    }
    return;
  }

  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
    return;
  }

  // Fallback notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;

  // Set background color based on type
  let bg = '#1f2937'; // Default dark gray
  let border = '#374151';
  let icon = '';

  if (type === 'error') {
    bg = '#450a0a'; // Dark red
    border = '#ef4444'; // Bright red
    icon = '⚠️ ';
  } else if (type === 'success') {
    bg = '#064e3b'; // Dark green
    border = '#10b981'; // Bright green
    icon = '✅ ';
  } else {
    bg = '#1e3a8a'; // Dark blue
    border = '#3b82f6'; // Bright blue
    icon = 'ℹ️ ';
  }

  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${bg};
    border: 1px solid ${border};
    border-radius: 0.75rem;
    color: #ffffff;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 300px;
    max-width: 90vw;
    animation: slideDownFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  notification.innerHTML = `<span>${icon}</span><span>${message}</span>`;

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 400);
  }, 3000);
}

/**
 * Apply language translations
 */
function applyTranslations() {
  if (typeof applyLanguage === 'function') {
    const currentLang = localStorage.getItem('language') || 'my';
    applyLanguage(currentLang);
  }
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDownFade {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideUpFade {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
