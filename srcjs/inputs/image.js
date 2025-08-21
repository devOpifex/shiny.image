import $ from 'jquery';
import 'shiny';

// Utility functions
function isImageFile(file) {
  return file && file.type.startsWith('image/');
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createThumbnail(dataUrl, fileName) {
  return $(`
    <div class="image-thumbnail">
      <img src="${dataUrl}" alt="Thumbnail" />
      <div class="thumbnail-info">
        <span class="file-name">${fileName}</span>
        <button class="remove-btn" type="button">&times;</button>
      </div>
    </div>
  `);
}

function showError(container, message) {
  container.find('.upload-area-error').remove();
  const errorEl = $(`<div class="upload-area-error">${message}</div>`);
  container.find('.image-upload-area').after(errorEl);
  setTimeout(() => errorEl.fadeOut(() => errorEl.remove()), 3000);
}

// Event handlers for drag and drop
function setupDragDrop(container) {
  const uploadArea = container.find('.image-upload-area');
  let dragCounter = 0;

  uploadArea.on('dragenter', function(e) {
    e.preventDefault();
    dragCounter++;
    $(this).addClass('drag-over');
  });

  uploadArea.on('dragover', function(e) {
    e.preventDefault();
  });

  uploadArea.on('dragleave', function(e) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      $(this).removeClass('drag-over');
    }
  });

  uploadArea.on('drop', function(e) {
    e.preventDefault();
    dragCounter = 0;
    $(this).removeClass('drag-over');

    const files = e.originalEvent.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(container, files);
    }
  });

  // Click to open file dialog
  uploadArea.on('click', function() {
    container.find('input[type="file"]').click();
  });

  // Handle keyboard navigation
  uploadArea.on('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      container.find('input[type="file"]').click();
    }
  });
}

// Setup paste functionality
function setupPaste(container) {
  $(document).on('paste', function(e) {
    // Only handle paste if this input is focused or active
    if (!container.is(':visible') || !container.find('.image-upload-area').is(':focus')) {
      return;
    }

    const items = e.originalEvent.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        handleFiles(container, [file]);
        break;
      }
    }
  });
}

// Handle file processing
async function handleFiles(container, files) {
  const fileInput = container.find('input[type="file"]');
  const multiple = fileInput.attr('multiple') !== undefined;

  if (!multiple && files.length > 1) {
    showError(container, 'Multiple files not allowed. Please select only one image.');
    return;
  }

  const imageFiles = Array.from(files).filter(isImageFile);

  if (imageFiles.length === 0) {
    showError(container, 'Please select valid image files.');
    return;
  }

  if (!multiple && imageFiles.length > 1) {
    showError(container, 'Please select only one image.');
    return;
  }

  try {
    const processedFiles = [];

    for (const file of imageFiles) {
      const dataUrl = await readFileAsDataURL(file);
      processedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        dataURL: dataUrl
      });
    }

    // Update UI
    displayThumbnails(container, processedFiles);

    // Update input value and trigger change
    const inputData = multiple ? processedFiles : processedFiles[0];
    container.data('imageData', inputData);
    container.trigger('change');

  } catch (error) {
    showError(container, 'Error processing image file(s).');
    console.error('Image processing error:', error);
  }
}

// Display thumbnails
function displayThumbnails(container, files) {
  const thumbnailContainer = container.find('.image-thumbnail-container');
  const uploadArea = container.find('.image-upload-area');

  thumbnailContainer.empty();

  const filesToShow = Array.isArray(files) ? files : [files];

  filesToShow.forEach((file, index) => {
    const thumbnail = createThumbnail(file.dataURL, file.name);

    // Add remove functionality
    thumbnail.find('.remove-btn').on('click', function(e) {
      e.stopPropagation();
      removeThumbnail(container, index);
    });

    thumbnailContainer.append(thumbnail);
  });

  if (filesToShow.length > 0) {
    uploadArea.hide();
    thumbnailContainer.show();
  } else {
    thumbnailContainer.hide();
    uploadArea.show();
  }
}

// Remove thumbnail
function removeThumbnail(container, index) {
  const currentData = container.data('imageData');

  if (Array.isArray(currentData)) {
    currentData.splice(index, 1);
    if (currentData.length === 0) {
      container.removeData('imageData');
      displayThumbnails(container, []);
    } else {
      container.data('imageData', currentData);
      displayThumbnails(container, currentData);
    }
  } else {
    container.removeData('imageData');
    displayThumbnails(container, []);
  }

  container.trigger('change');
}

// Initialize input
function initializeImageInput(container) {
  const fileInput = container.find('input[type="file"]');

  // Handle file input change
  fileInput.on('change', function() {
    const files = this.files;
    if (files.length > 0) {
      handleFiles(container, files);
    }
  });

  setupDragDrop(container);
  setupPaste(container);
}

// Shiny Input Binding
var imageBinding = new Shiny.InputBinding();

$.extend(imageBinding, {
  find: function(scope) {
    return $(scope).find(".imageBinding");
  },

  initialize: function(el) {
    const $el = $(el);
    initializeImageInput($el);
  },

  getValue: function(el) {
    const $el = $(el);
    return $el.data('imageData') || null;
  },

  setValue: function(el, value) {
    const $el = $(el);
    if (value === null || value === undefined) {
      $el.removeData('imageData');
      displayThumbnails($el, []);
    } else {
      $el.data('imageData', value);
      displayThumbnails($el, value);
    }
  },

  subscribe: function(el, callback) {
    $(el).on("change.imageBinding", function(e) {
      callback();
    });
  },

  unsubscribe: function(el) {
    $(el).off(".imageBinding");
  },

  receiveMessage: function(el, data) {
    if (data.hasOwnProperty('value')) {
      this.setValue(el, data.value);
    }
  }
});

Shiny.inputBindings.register(imageBinding, "shiny.image.imageBinding");
