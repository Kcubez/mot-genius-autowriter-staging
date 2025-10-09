// Content Manager - Dashboard JavaScript

// Dashboard specific functionality
document.addEventListener('DOMContentLoaded', function () {
  const generateBtn = document.getElementById('generate-btn');
  const generateSpinner = document.getElementById('generate-spinner');
  const generateBtnText = document.getElementById('generate-btn-text');
  const contentArea = document.getElementById('content-area');
  const saveContentBtn = document.getElementById('save-content-btn');
  const wordCountSelect = document.getElementById('word-count');

  if (!generateBtn || !contentArea || !saveContentBtn) {
    return; // Not on dashboard page
  }

  // Word count select is ready to use - no additional functionality needed
  // Writing style dropdown functionality
  const writingStyleDropdown = document.getElementById('writing-style-dropdown');
  const writingStyleOptions = document.getElementById('writing-style-options');
  const writingStyleDisplay = document.getElementById('writing-style-display');
  const writingStyleCheckboxes = document.querySelectorAll('.writing-style-checkbox');

  if (writingStyleDropdown && writingStyleOptions) {
    // Toggle dropdown
    writingStyleDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
      writingStyleOptions.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function () {
      writingStyleOptions.classList.add('hidden');
    });

    // Prevent dropdown from closing when clicking inside options
    writingStyleOptions.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Handle checkbox changes
    writingStyleCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        // Update display text and manage disabled state
        updateWritingStyleDisplay();
        updateCheckboxStates();
      });
    });

    // Function to update display text
    function updateWritingStyleDisplay() {
      const checkedBoxes = document.querySelectorAll('.writing-style-checkbox:checked');
      if (checkedBoxes.length === 0) {
        writingStyleDisplay.textContent = 'ရွေးချယ်ပါ...';
        writingStyleDisplay.className = 'text-gray-500';
      } else {
        const selectedTexts = Array.from(checkedBoxes).map(checkbox => {
          return checkbox.parentElement.querySelector('span').textContent;
        });
        writingStyleDisplay.textContent = selectedTexts.join(', ');
        writingStyleDisplay.className = 'text-gray-900';
      }
    }

    // Function to manage checkbox disabled states
    function updateCheckboxStates() {
      const checkedBoxes = document.querySelectorAll('.writing-style-checkbox:checked');
      const isMaxSelected = checkedBoxes.length >= 3;

      writingStyleCheckboxes.forEach(checkbox => {
        const label = checkbox.parentElement;

        if (!checkbox.checked && isMaxSelected) {
          // Disable unchecked checkboxes when 3 are selected
          checkbox.disabled = true;
          label.classList.add('opacity-50', 'cursor-not-allowed');
          label.classList.remove('cursor-pointer', 'hover:bg-gray-50');
        } else {
          // Enable all checkboxes when less than 3 are selected
          checkbox.disabled = false;
          label.classList.remove('opacity-50', 'cursor-not-allowed');
          label.classList.add('cursor-pointer');
          if (!checkbox.checked) {
            label.classList.add('hover:bg-gray-50');
          }
        }
      });
    }
  }

  // Reference Links functionality
  const addReferenceLinkBtn = document.getElementById('add-reference-link');
  const referenceLinksContainer = document.getElementById('reference-links-container');
  let referenceLinkCounter = 0;

  if (addReferenceLinkBtn && referenceLinksContainer) {
    // Add initial reference link field
    addReferenceLink();

    addReferenceLinkBtn.addEventListener('click', function () {
      addReferenceLink();
    });

    function addReferenceLink() {
      referenceLinkCounter++;
      const linkDiv = document.createElement('div');
      linkDiv.className = 'flex items-center space-x-2 reference-link-item';
      linkDiv.innerHTML = `
        <input
          type="url"
          name="reference-link-${referenceLinkCounter}"
          class="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
          placeholder="Website URL ထည့်ပါ"
          data-placeholder="Website URL ထည့်ပါ"
        />
        <button
          type="button"
          class="remove-reference-link bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-200"
          title="Remove Link"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      `;

      // Add remove functionality
      const removeBtn = linkDiv.querySelector('.remove-reference-link');
      removeBtn.addEventListener('click', function () {
        linkDiv.remove();
        // If no links left, add one back
        if (referenceLinksContainer.children.length === 0) {
          addReferenceLink();
        }
      });

      referenceLinksContainer.appendChild(linkDiv);

      // Apply current language to the new input
      if (window.getTranslation && window.currentLanguage) {
        const input = linkDiv.querySelector('input[data-placeholder]');
        if (input) {
          const key = input.getAttribute('data-placeholder');
          const translation = window.getTranslation(key, window.currentLanguage);
          if (translation !== key) {
            input.placeholder = translation;
          }
        }
      }
    }

    // Function to get all reference links
    function getReferenceLinks() {
      const links = [];
      const linkInputs = referenceLinksContainer.querySelectorAll('input[type="url"]');
      linkInputs.forEach(input => {
        if (input.value.trim()) {
          links.push(input.value.trim());
        }
      });
      return links;
    }

    // Make getReferenceLinks available globally for the generate function
    window.getReferenceLinks = getReferenceLinks;
  }

  // Emoji Toggle functionality
  const emojiToggle = document.getElementById('emoji-toggle');
  const emojiStatus = document.getElementById('emoji-status');

  if (emojiToggle && emojiStatus) {
    emojiToggle.addEventListener('change', function () {
      if (this.checked) {
        const onText = window.getTranslation ? window.getTranslation('ON') : 'ON';
        emojiStatus.textContent = onText;
        emojiStatus.className = 'ml-3 text-sm font-medium text-green-400';
        emojiStatus.setAttribute('data-translate', 'ON');
      } else {
        const offText = window.getTranslation ? window.getTranslation('OFF') : 'OFF';
        emojiStatus.textContent = offText;
        emojiStatus.className = 'ml-3 text-sm font-medium text-gray-400';
        emojiStatus.setAttribute('data-translate', 'OFF');
      }
    });
  }

  // Generate content functionality
  generateBtn.addEventListener('click', async function () {
    const pageName = document.getElementById('page-name').value;
    const prompt = document.getElementById('prompt').value;
    const purpose = document.getElementById('purpose').value;

    // Get selected writing styles from checkboxes
    const selectedStyles = [];
    document.querySelectorAll('.writing-style-checkbox:checked').forEach(checkbox => {
      selectedStyles.push(checkbox.value);
    });
    const writingStyle = selectedStyles.join(', ');

    const audience = document.getElementById('audience').value;
    const keywords = document.getElementById('keywords').value;
    const hashtags = document.getElementById('hashtags').value;
    const cta = document.getElementById('cta').value;
    const negativeConstraints = document.getElementById('negative-constraints').value;

    if (!pageName.trim()) {
      notify.warning(
        'Page Name ထည့်ပါ။ ဒါမှ content ကို generate လုပ်နိုင်မှာပါ။',
        'Missing Page Name'
      );
      return;
    }

    if (!prompt.trim()) {
      notify.warning('Topic ထည့်ပါ။ ဒါမှ content ကို generate လုပ်နိုင်မှာပါ။', 'Missing Topic');
      return;
    }

    try {
      // Set loading state
      generateBtn.disabled = true;
      generateSpinner.classList.remove('hidden');
      const generatingText = window.getTranslation ? 
        window.getTranslation('Generating...') : 
        'Generating...';
      generateBtnText.textContent = generatingText;
      contentArea.value = '';
      saveContentBtn.disabled = true;
      
      // Disable navigation links during generation
      disableNavigationLinks();

      const formData = new FormData();
      formData.append('pageName', pageName);
      formData.append('prompt', prompt);
      formData.append('purpose', purpose);
      formData.append('writingStyle', writingStyle);
      formData.append('audience', audience);
      formData.append('wordCount', document.getElementById('word-count').value);
      formData.append('keywords', keywords);
      formData.append('hashtags', hashtags);
      formData.append('cta', cta);
      formData.append('negativeConstraints', negativeConstraints);
      formData.append('copywritingModel', document.getElementById('copywriting-model').value);
      formData.append('language', document.getElementById('language').value);

      // Add reference links
      if (window.getReferenceLinks) {
        const referenceLinks = window.getReferenceLinks();
        formData.append('referenceLinks', JSON.stringify(referenceLinks));
      }

      // Add emoji toggle state
      const includeEmojis = document.getElementById('emoji-toggle').checked;
      formData.append('includeEmojis', includeEmojis);

      const imageFile = document.getElementById('image-upload').files[0];
      if (imageFile) {
        // Check file size (reduce to 4MB for better compatibility)
        const maxSize = 4 * 1024 * 1024; // 4MB
        if (imageFile.size > maxSize) {
          notify.error(
            'ပုံဖိုင်က အရမ်းကြီးလွန်းပါတယ်။ 4MB ထက်နည်းတဲ့ ပုံကို သုံးပါ။',
            'File Too Large'
          );
          return;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
          notify.error(
            'JPG, PNG, သို့မဟုတ် WebP ပုံဖိုင်တွေပဲ upload လုပ်နိုင်ပါတယ်။',
            'Invalid File Type'
          );
          return;
        }

        formData.append('image', imageFile);
      }

      const response = await fetch('/generate-content', {
        method: 'POST',
        body: formData,
      });

      // Check if response is ok
      if (!response.ok) {
        if (response.status === 413) {
          notify.error('ပုံဖိုင်က အရမ်းကြီးလွန်းပါတယ်။ ပိုသေးတဲ့ ပုံကို သုံးပါ။', 'File Too Large');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        notify.error(data.error, 'Generation Failed');
      } else {
        contentArea.value = data.content;
        saveContentBtn.disabled = false;
        notify.success('Content generated successfully!', 'Success');
      }
    } catch (error) {
      console.error('Error:', error);
      notify.error('An error occurred while generating content', 'Network Error');
    } finally {
      // Reset loading state
      generateBtn.disabled = false;
      generateSpinner.classList.add('hidden');
      const generateText = window.getTranslation ? 
        window.getTranslation('Generate Content') : 
        'Generate Content';
      generateBtnText.textContent = generateText;
      
      // Re-enable navigation links after generation
      enableNavigationLinks();
    }
  });

  // Save content functionality
  saveContentBtn.addEventListener('click', async function () {
    const content = contentArea.value;
    const pageName = document.getElementById('page-name').value;
    const promptText = document.getElementById('prompt').value;

    if (!content.trim()) {
      notify.warning('No content to save', 'Missing Content');
      return;
    }

    // Use page name as default title, fallback to prompt
    const defaultTitle = pageName.trim() || promptText.substring(0, 50);

    // Create a modal for saving content
    const promptMessage = window.getTranslation ? 
      window.getTranslation('Enter a title for this content:') : 
      'Enter a title for this content:';
    
    const modalTitle = window.getTranslation ? 
      window.getTranslation('Save Content') : 
      'Save Content';
    
    const title = await modal.prompt(
      promptMessage,
      modalTitle,
      defaultTitle,
      'Content title...'
    );

    if (title) {
      try {
        saveContentBtn.disabled = true;
        saveContentBtn.textContent = 'Saving...';

        // Get selected writing styles for saving
        const selectedStylesForSave = [];
        document.querySelectorAll('.writing-style-checkbox:checked').forEach(checkbox => {
          selectedStylesForSave.push(checkbox.value);
        });

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('purpose', document.getElementById('purpose').value);
        formData.append('writing_style', selectedStylesForSave.join(', '));
        formData.append('audience', document.getElementById('audience').value);
        formData.append('keywords', document.getElementById('keywords').value);
        formData.append('hashtags', document.getElementById('hashtags').value);
        formData.append('cta', document.getElementById('cta').value);
        formData.append(
          'negative_constraints',
          document.getElementById('negative-constraints').value
        );

        // Add reference links
        if (window.getReferenceLinks) {
          const referenceLinks = window.getReferenceLinks();
          formData.append('reference_links', JSON.stringify(referenceLinks));
        }

        const response = await fetch('/contents/save', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          notify.success('Content saved successfully!', 'Saved');

          // Update total content count
          updateTotalContentCount();

          // Add new content to recent content list
          addToRecentContentList(data.content);
          
          // Alternative approach: refresh the recent content section
          refreshRecentContent();

          // Clear the content area and reset form
          contentArea.value = '';
          document.getElementById('page-name').value = '';
          document.getElementById('prompt').value = '';
          saveContentBtn.disabled = true;
          saveContentBtn.textContent = 'Save Content';
        } else {
          notify.error(data.error || 'An error occurred', 'Save Failed');
        }
      } catch (error) {
        console.error('Error:', error);
        notify.error('An error occurred while saving content', 'Network Error');
      } finally {
        saveContentBtn.disabled = false;
        saveContentBtn.textContent = 'Save Content';
      }
    }
  });
});

// Function to update total content count
function updateTotalContentCount() {
  // Look for the total count in the gradient box
  const totalContentElement = document.querySelector('.bg-gradient-to-r.from-blue-600 p');
  if (totalContentElement) {
    const currentCount = parseInt(totalContentElement.textContent) || 0;
    totalContentElement.textContent = currentCount + 1;
  }
}

// Function to add new content to recent content list
function addToRecentContentList(contentData) {
  // Find the Recent Content section first, then look for the content list inside it
  const recentContentSection = document.querySelector('h2[data-translate="Recent Content"]');
  let recentContentList = null;
  
  if (recentContentSection) {
    // Find the parent container of the Recent Content section
    const sectionContainer = recentContentSection.closest('.backdrop-blur-sm');
    if (sectionContainer) {
      // Look for the space-y-3 container inside this section
      recentContentList = sectionContainer.querySelector('.space-y-3');
    }
  }
  
  // Fallback to original selector if the above doesn't work
  if (!recentContentList) {
    recentContentList = document.querySelector('.space-y-3');
  }
  
  // If no recent content list exists, we need to create it and replace the "no content" message
  if (!recentContentList) {
    // Find the "no content" message specifically in the Recent Content section
    let noContentMessage = null;
    if (recentContentSection) {
      const sectionContainer = recentContentSection.closest('.backdrop-blur-sm');
      if (sectionContainer) {
        noContentMessage = sectionContainer.querySelector('.text-gray-500.text-center.py-8');
      }
    }
    
    // Fallback to global search
    if (!noContentMessage) {
      noContentMessage = document.querySelector('.text-gray-500.text-center.py-8');
    }
    
    if (noContentMessage) {
      // Create the recent content container
      recentContentList = document.createElement('div');
      recentContentList.className = 'space-y-3';
      
      // Replace the "no content" message with our new container
      noContentMessage.parentNode.replaceChild(recentContentList, noContentMessage);
    }
  }
  
  if (recentContentList && contentData) {
    // Create new content item matching the template structure
    const contentItem = document.createElement('div');
    contentItem.className = 'border-l-4 border-red-600 pl-4 py-2';
    
    // Format the current date/time
    const now = new Date();
    const timeString = now.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
    
    contentItem.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
        <div class="flex-1 min-w-0">
          <h3 class="font-medium">
            <a href="/contents/${contentData.id}" class="hover:text-red-300 block sm:inline">
              ${contentData.title}
            </a>
          </h3>
          <p class="text-sm break-words">${contentData.content.substring(0, 60)}${
      contentData.content.length > 60 ? '...' : ''
    }</p>
          <p class="text-xs">${timeString}</p>
        </div>
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white self-start sm:ml-4">
          ${contentData.purpose || 'General'}
        </span>
      </div>
    `;

    // Add to the top of the list
    recentContentList.insertBefore(contentItem, recentContentList.firstChild);

    // Remove the last item if there are more than 3 items
    const contentItems = recentContentList.querySelectorAll('.border-l-4');
    if (contentItems.length > 3) {
      recentContentList.removeChild(contentItems[contentItems.length - 1]);
    }
  }
}

// Function to disable navigation links during content generation
function disableNavigationLinks() {
  // Find all navigation links
  const navLinks = document.querySelectorAll('a[href*="dashboard"], a[href*="content"], a[href*="history"]');
  
  navLinks.forEach(link => {
    // Store original href and onclick
    link.dataset.originalHref = link.href;
    if (link.onclick) {
      link.dataset.originalOnclick = link.onclick.toString();
    }
    
    // Disable the link
    link.href = 'javascript:void(0)';
    link.onclick = function(e) {
      e.preventDefault();
      notify.warning('Please wait for content generation to complete', 'Generation in Progress');
      return false;
    };
    
    // Add visual indication
    link.style.opacity = '0.5';
    link.style.pointerEvents = 'none';
    link.style.cursor = 'not-allowed';
  });
  
  // Also disable specific navigation buttons/links
  const specificLinks = [
    'a[href="/dashboard"]',
    'a[href="/contents"]', 
    'a[href*="content_history"]',
    'a[data-translate="View All"]'
  ];
  
  specificLinks.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.dataset.originalHref = element.href;
      element.href = 'javascript:void(0)';
      element.onclick = function(e) {
        e.preventDefault();
        notify.warning('Please wait for content generation to complete', 'Generation in Progress');
        return false;
      };
      element.style.opacity = '0.5';
      element.style.pointerEvents = 'none';
      element.style.cursor = 'not-allowed';
    });
  });
}

// Function to re-enable navigation links after content generation
function enableNavigationLinks() {
  // Find all navigation links
  const navLinks = document.querySelectorAll('a[data-original-href]');
  
  navLinks.forEach(link => {
    // Restore original href
    if (link.dataset.originalHref) {
      link.href = link.dataset.originalHref;
      delete link.dataset.originalHref;
    }
    
    // Restore original onclick if it existed
    if (link.dataset.originalOnclick) {
      link.onclick = new Function(link.dataset.originalOnclick);
      delete link.dataset.originalOnclick;
    } else {
      link.onclick = null;
    }
    
    // Remove visual indication
    link.style.opacity = '';
    link.style.pointerEvents = '';
    link.style.cursor = '';
  });
  
  // Also re-enable specific navigation buttons/links
  const specificLinks = [
    'a[href="javascript:void(0)"]'
  ];
  
  specificLinks.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element.dataset.originalHref) {
        element.href = element.dataset.originalHref;
        delete element.dataset.originalHref;
        element.onclick = null;
        element.style.opacity = '';
        element.style.pointerEvents = '';
        element.style.cursor = '';
      }
    });
  });
}

// Function to refresh recent content section by reloading the page section
async function refreshRecentContent() {
  try {
    // Simple approach: reload just this section of the page
    const currentUrl = window.location.href;
    const response = await fetch(currentUrl);
    
    if (response.ok) {
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Find the recent content section in the new HTML
      const newRecentSection = doc.querySelector('h2[data-translate="Recent Content"]');
      if (newRecentSection) {
        const newSectionContainer = newRecentSection.closest('.backdrop-blur-sm');
        
        // Find the current recent content section
        const currentRecentSection = document.querySelector('h2[data-translate="Recent Content"]');
        if (currentRecentSection) {
          const currentSectionContainer = currentRecentSection.closest('.backdrop-blur-sm');
          
          if (newSectionContainer && currentSectionContainer) {
            // Replace the entire section
            currentSectionContainer.innerHTML = newSectionContainer.innerHTML;
          }
        }
      }
    }
  } catch (error) {
    // Silent error handling
  }
}
