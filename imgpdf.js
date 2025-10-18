 <script>
        document.addEventListener('DOMContentLoaded', function() {
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const browseBtn = document.getElementById('browseBtn');
            const previewSection = document.getElementById('previewSection');
            const imagePreview = document.getElementById('imagePreview');
            const addMoreBtn = document.getElementById('addMoreBtn');
            const convertBtn = document.getElementById('convertBtn');
            
            let selectedImages = [];
            
            // Event listeners
            browseBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', handleFileSelect);
            uploadArea.addEventListener('dragover', handleDragOver);
            uploadArea.addEventListener('dragleave', handleDragLeave);
            uploadArea.addEventListener('drop', handleDrop);
            addMoreBtn.addEventListener('click', () => fileInput.click());
            convertBtn.addEventListener('click', convertToPdf);
            
            // File selection handler
            function handleFileSelect(e) {
                const files = e.target.files;
                processFiles(files);
            }
            
            // Drag and drop handlers
            function handleDragOver(e) {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            }
            
            function handleDragLeave(e) {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
            }
            
            function handleDrop(e) {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                processFiles(files);
            }
            
            // Process selected files
            function processFiles(files) {
                if (files.length === 0) return;
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    
                    // Check if file is an image
                    if (!file.type.match('image.*')) {
                        alert('Please select only image files.');
                        continue;
                    }
                    
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const imageData = {
                            name: file.name,
                            dataUrl: e.target.result
                        };
                        
                        selectedImages.push(imageData);
                        updatePreview();
                    };
                    
                    reader.readAsDataURL(file);
                }
                
                // Reset file input to allow selecting the same file again
                fileInput.value = '';
            }
            
            // Update image preview
            function updatePreview() {
                imagePreview.innerHTML = '';
                
                selectedImages.forEach((image, index) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    
                    const img = document.createElement('img');
                    img.src = image.dataUrl;
                    img.alt = image.name;
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-btn';
                    removeBtn.innerHTML = '×';
                    removeBtn.addEventListener('click', () => removeImage(index));
                    
                    previewItem.appendChild(img);
                    previewItem.appendChild(removeBtn);
                    imagePreview.appendChild(previewItem);
                });
                
                // Show preview section if there are images
                if (selectedImages.length > 0) {
                    previewSection.style.display = 'block';
                } else {
                    previewSection.style.display = 'none';
                }
            }
            
            // Remove image from selection
            function removeImage(index) {
                selectedImages.splice(index, 1);
                updatePreview();
            }
            
            // Convert images to PDF
            function convertToPdf() {
                if (selectedImages.length === 0) {
                    alert('Please select at least one image to convert.');
                    return;
                }
                
                // Disable convert button during processing
                convertBtn.disabled = true;
                convertBtn.textContent = 'Converting...';
                
                // Use jsPDF to create PDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                
                // Set margin (0.5 inches = 14.17 mm)
                const margin = 14.17;
                
                // Process each image
                let processedCount = 0;
                
                selectedImages.forEach((image, index) => {
                    const img = new Image();
                    img.src = image.dataUrl;
                    
                    img.onload = function() {
                        // Calculate dimensions to fit the page with margins
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        
                        const contentWidth = pageWidth - (2 * margin);
                        const contentHeight = pageHeight - (2 * margin);
                        
                        let imgWidth = img.width;
                        let imgHeight = img.height;
                        
                        // Scale image to fit content area
                        const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
                        imgWidth *= ratio;
                        imgHeight *= ratio;
                        
                        // Center image on page with margins
                        const x = margin + (contentWidth - imgWidth) / 2;
                        const y = margin + (contentHeight - imgHeight) / 2;
                        
                        // Add image to PDF
                        if (index > 0) {
                            pdf.addPage();
                        }
                        
                        pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
                        
                        processedCount++;
                        
                        // If all images processed, save the PDF
                        if (processedCount === selectedImages.length) {
                            pdf.save('converted-images.pdf');
                            
                            // Reset button
                            convertBtn.disabled = false;
                            convertBtn.textContent = 'Convert to PDF & Download';
                        }
                    };
                });
            }
        });
    </script>