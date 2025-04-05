
const API_KEY = 'put your api here. i removed mine. cause i bought that and has a limit';
const API_ENDPOINT = 'https://api.remove.bg/v1.0/removebg';

// DOM Elements
const fileInput = document.getElementById('file-input');
const uploadArea = document.getElementById('upload-area');
const imageUrlInput = document.getElementById('image-url');
const urlSubmitBtn = document.getElementById('url-submit-btn');
const resultsContainer = document.getElementById('results-container');
const originalImage = document.getElementById('original-image');
const processedImage = document.getElementById('processed-image');
const loadingAnimation = document.getElementById('loading-animation');
const downloadBtn = document.getElementById('download-btn');
const tryAnotherBtn = document.getElementById('try-another-btn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const particlesContainer = document.getElementById('particles-container');
const developerWatermark = document.getElementById('developer-watermark');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  setupEventListeners();
  animateDeveloperWatermark();
});

function setupEventListeners() {
  fileInput.addEventListener('change', handleFileUpload);
  
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('active');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('active');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('active');
    
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFileUpload();
    }
  });
  
  urlSubmitBtn.addEventListener('click', handleUrlUpload);
  
  downloadBtn.addEventListener('click', downloadProcessedImage);
  
  tryAnotherBtn.addEventListener('click', resetUI);
  
  imageUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUrlUpload();
    }
  });
  
  // Developer watermark interaction
  developerWatermark.addEventListener('mouseover', () => {
    createMiniFireworks(developerWatermark);
  });
}

// File Upload Handler
function handleFileUpload() {
  const file = fileInput.files[0];
  if (!file) return;
  
  // Check if file is an image
  if (!file.type.match('image.*')) {
    showToast('Please upload an image file (JPEG, PNG, etc.)', 'error');
    return;
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image size should be less than 5MB', 'error');
    return;
  }
  
  // Show original image
  const reader = new FileReader();
  reader.onload = function(e) {
    originalImage.src = e.target.result;
    showResults();
    // Wait for the image to load before processing
    originalImage.onload = function() {
      removeBackground(file);
    };
  };
  reader.readAsDataURL(file);
}

// URL Upload Handler
function handleUrlUpload() {
  const imageUrl = imageUrlInput.value.trim();
  if (!imageUrl) {
    showToast('Please enter an image URL', 'error');
    return;
  }
  
  // Validate URL
  if (!isValidUrl(imageUrl)) {
    showToast('Please enter a valid URL', 'error');
    return;
  }
  
  // Show the original image
  originalImage.src = imageUrl;
  originalImage.onload = function() {
    showResults();
    removeBackgroundFromUrl(imageUrl);
  };
  
  originalImage.onerror = function() {
    showToast('Failed to load image from the provided URL', 'error');
  };
}

// Check if the URL is valid
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Show Results UI
function showResults() {
  resultsContainer.classList.remove('hidden');
  setTimeout(() => {
    resultsContainer.classList.add('visible');
  }, 100);
  
  // Hide loading animation initially
  processedImage.classList.add('hidden');
  loadingAnimation.classList.remove('hidden');
  downloadBtn.disabled = true;
}

// Reset UI for new upload
function resetUI() {
  fileInput.value = '';
  imageUrlInput.value = '';
  resultsContainer.classList.remove('visible');
  
  setTimeout(() => {
    resultsContainer.classList.add('hidden');
    originalImage.src = '';
    processedImage.src = '';
  }, 300);
  
  showUploadUI();
}

function showUploadUI() {
  // Add animation to upload area
  uploadArea.style.transform = 'scale(0.95)';
  uploadArea.style.opacity = '0.5';
  
  setTimeout(() => {
    uploadArea.style.transform = 'scale(1)';
    uploadArea.style.opacity = '1';
  }, 300);
}

// Remove Background from File
function removeBackground(file) {
  const formData = new FormData();
  formData.append('image_file', file);
  formData.append('size', 'auto');
  
  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY
    },
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(error => {
        throw new Error(error.errors && error.errors[0] ? error.errors[0].title : 'Something went wrong');
      });
    }
    return response.blob();
  })
  .then(blob => {
    const url = URL.createObjectURL(blob);
    displayProcessedImage(url);
  })
  .catch(error => {
    showToast(`Error: ${error.message}`, 'error');
    loadingAnimation.classList.add('hidden');
  });
}

// Remove Background from URL
function removeBackgroundFromUrl(imageUrl) {
  const formData = new FormData();
  formData.append('image_url', imageUrl);
  formData.append('size', 'auto');
  
  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY
    },
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(error => {
        throw new Error(error.errors && error.errors[0] ? error.errors[0].title : 'put your api first. or contact rakib for a free api');
      });
    }
    return response.blob();
  })
  .then(blob => {
    const url = URL.createObjectURL(blob);
    displayProcessedImage(url);
  })
  .catch(error => {
    showToast(`Error: ${error.message}`, 'error');
    loadingAnimation.classList.add('hidden');
  });
}

// Display Processed Image
function displayProcessedImage(url) {
  processedImage.src = url;
  processedImage.onload = function() {
    loadingAnimation.classList.add('hidden');
    processedImage.classList.remove('hidden');
    downloadBtn.disabled = false;
    
    // Add sparkle animation
    createSparkleEffect();
    showToast('Background removed successfully!', 'success');
    
    // Add watermark to processed image
    addImageWatermark();
  };
}

// Add subtle watermark on processed image
function addImageWatermark() {
  // Create a subtle watermark in the corner of the image
  const imgContainer = processedImage.parentElement;
  const watermark = document.createElement('div');
  watermark.classList.add('image-watermark');
  watermark.innerHTML = `<span>by Rakib</span>`;
  watermark.style.position = 'absolute';
  watermark.style.bottom = '10px';
  watermark.style.right = '10px';
  watermark.style.fontSize = '10px';
  watermark.style.color = 'rgba(255,255,255,0.5)';
  watermark.style.background = 'rgba(107, 70, 254, 0.2)';
  watermark.style.padding = '2px 5px';
  watermark.style.borderRadius = '3px';
  watermark.style.pointerEvents = 'none';
  
  // Remove any existing watermark
  const existingWatermark = imgContainer.querySelector('.image-watermark');
  if (existingWatermark) {
    imgContainer.removeChild(existingWatermark);
  }
  
  imgContainer.appendChild(watermark);
}

// Download Processed Image
function downloadProcessedImage() {
  const link = document.createElement('a');
  link.href = processedImage.src;
  link.download = 'removed-background-by-rakib.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show success toast
  showToast('Image downloaded successfully!', 'success');
}

// Toast Notification
function showToast(message, type = 'info') {
  toastMessage.textContent = message;
  toast.className = 'toast';
  toast.classList.add(type);
  
  setTimeout(() => {
    toast.classList.add('visible');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 400);
  }, 3000);
}

// Particle Effects
function initParticles() {
  // Clear existing particles
  particlesContainer.innerHTML = '';
  
  // Create different types of particles
  for (let i = 0; i < 20; i++) {
    createParticle('normal');
  }
  
  for (let i = 0; i < 10; i++) {
    createParticle('glow');
  }
}

function createParticle(type = 'normal') {
  const particle = document.createElement('div');
  particle.classList.add('particle');
  
  // Random properties
  const size = Math.random() * 10 + (type === 'glow' ? 5 : 2);
  const xPos = Math.random() * 100;
  const delay = Math.random() * 5;
  const duration = Math.random() * 10 + 10;
  const opacity = Math.random() * 0.5 + (type === 'glow' ? 0.3 : 0.1);
  
  let color;
  if (type === 'glow') {
    color = Math.random() > 0.5 ? 
            `rgba(107, 70, 254, ${opacity})` : 
            `rgba(254, 70, 165, ${opacity})`;
  } else {
    color = Math.random() > 0.7 ? 
            `rgba(107, 70, 254, ${opacity})` : 
            Math.random() > 0.5 ? 
            `rgba(254, 70, 165, ${opacity})` : 
            `rgba(255, 255, 255, ${opacity * 0.5})`;
  }
  
  // Apply styles
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${xPos}%`;
  particle.style.bottom = '-20px';
  particle.style.opacity = '0';
  particle.style.backgroundColor = color;
  
  if (type === 'glow') {
    particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
    particle.style.filter = 'blur(1px)';
  }
  
  // Apply animation
  particle.style.animation = `float-particle ${duration}s ${delay}s linear infinite`;
  
  particlesContainer.appendChild(particle);
  
  
  setTimeout(() => {
    if (particlesContainer.contains(particle)) {
      particlesContainer.removeChild(particle);
      createParticle(type); 
    }
  }, (duration + delay) * 1000);
}

function createSparkleEffect() {
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      
      const size = Math.random() * 8 + 2;
      const xPos = Math.random() * 100;
      const yPos = Math.random() * 100;
      const color = Math.random() > 0.5 ?
                    `rgba(107, 70, 254, ${Math.random() * 0.7 + 0.3})` :
                    `rgba(254, 70, 165, ${Math.random() * 0.7 + 0.3})`;
      
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${xPos}%`;
      particle.style.top = `${yPos}%`;
      particle.style.backgroundColor = 'transparent';
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      particle.style.opacity = '1';
      particle.style.animation = 'none';
      
      processedImage.parentElement.appendChild(particle);
      
      // Animate out
      setTimeout(() => {
        particle.style.transition = 'all 1s ease-out';
        particle.style.opacity = '0';
        particle.style.transform = 'scale(0) rotate(45deg)';
        
        setTimeout(() => {
          if (particle.parentElement) {
            particle.parentElement.removeChild(particle);
          }
        }, 1000);
      }, Math.random() * 1000 + 500);
    }, Math.random() * 1000);
  }
}


function animateDeveloperWatermark() {
 
  setTimeout(() => {
    developerWatermark.style.animation = 'fadeInUp 1s forwards';
    developerWatermark.style.opacity = '1';
  }, 1500);
  
  
  setInterval(() => {
    const devName = developerWatermark.querySelector('.developer-name');
    devName.style.transition = 'all 0.5s ease';
    devName.style.transform = 'scale(1.1)';
    devName.style.textShadow = '0 0 10px rgba(254, 70, 165, 0.7)';
    
    setTimeout(() => {
      devName.style.transform = 'scale(1)';
      devName.style.textShadow = 'none';
    }, 500);
  }, 5000);
}


function createMiniFireworks(element) {
  const rect = element.getBoundingClientRect();
  
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.classList.add('firework-particle');
      
    
      const size = Math.random() * 4 + 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 60 + 20;
      const duration = Math.random() * 0.5 + 0.5;
      
   
      particle.style.position = 'fixed';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = Math.random() > 0.5 ? '#6b46fe' : '#fe46a5';
      particle.style.boxShadow = `0 0 ${size}px ${Math.random() > 0.5 ? '#6b46fe' : '#fe46a5'}`;
      particle.style.top = `${rect.top + rect.height / 2}px`;
      particle.style.left = `${rect.left + rect.width / 2}px`;
      particle.style.transform = 'translate(-50%, -50%)';
      particle.style.opacity = '0';
      particle.style.zIndex = '1000';
      
      document.body.appendChild(particle);
      
      
      setTimeout(() => {
        particle.style.transition = `all ${duration}s ease-out`;
        particle.style.top = `${rect.top + rect.height / 2 + Math.sin(angle) * distance}px`;
        particle.style.left = `${rect.left + rect.width / 2 + Math.cos(angle) * distance}px`;
        particle.style.opacity = '1';
        
        setTimeout(() => {
          particle.style.opacity = '0';
          particle.style.transform = 'translate(-50%, -50%) scale(0.2)';
          
          setTimeout(() => {
            document.body.removeChild(particle);
          }, duration * 1000);
        }, duration * 1000);
      }, 10);
    }, Math.random() * 500);
  }
}
