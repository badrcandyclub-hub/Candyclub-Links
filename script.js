/**
 * Candy Club Hub - Interactions & Form Handling
 * Mobile-First Optimized
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // Intelligent Dark Mode Auto-Switching & Toggle
    // ==========================================================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIconSun = document.getElementById('themeIconSun');
    const themeIconMoon = document.getElementById('themeIconMoon');

    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        if(themeIconSun && themeIconMoon) {
            themeIconSun.style.display = 'none';
            themeIconMoon.style.display = 'block';
        }
    }

    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        if(themeIconSun && themeIconMoon) {
            themeIconSun.style.display = 'block';
            themeIconMoon.style.display = 'none';
        }
    }

    // Auto-Switch based on time (6:00 PM to 6:00 AM)
    function checkTimeAndApplyTheme() {
        const hour = new Date().getHours();
        // 18 is 6:00 PM, 6 is 6:00 AM
        if (hour >= 18 || hour < 6) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    }

    // Initialize Intelligent Dark Mode
    checkTimeAndApplyTheme();

    // Manual Toggle Overrides Auto Mode
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('dark-mode')) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });
    }

    // ==========================================================================
    // File Input Name Update
    // ==========================================================================
    const fileInput = document.getElementById('productImage');
    const fileNameDisplay = document.getElementById('fileName');
    const originalFileText = fileNameDisplay ? fileNameDisplay.textContent : '';

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = 'var(--clr-text-main)';
            } else {
                fileNameDisplay.textContent = originalFileText;
                fileNameDisplay.style.color = '';
            }
        });
    }

    // ==========================================================================
    // Smart Request Form Submission Logic
    // ==========================================================================
    const requestForm = document.getElementById('productRequestForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (requestForm && submitBtn) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnIcon = submitBtn.querySelector('i');

        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Set Loading State
            submitBtn.disabled = true;
            btnText.textContent = 'جاري الإرسال...';
            btnIcon.className = 'fa-solid fa-spinner fa-spin';
            
            // Simulate Network Request (1.5s delay)
            setTimeout(() => {
                // Success State
                submitBtn.classList.add('success');
                btnText.textContent = 'تم الإرسال بنجاح';
                btnIcon.className = 'fa-solid fa-check';
                
                // Reset form
                requestForm.reset();
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = originalFileText;
                    fileNameDisplay.style.color = '';
                }
                
                // Restore button state after 3 seconds
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('success');
                    btnText.textContent = 'إرسال الطلب';
                    btnIcon.className = 'fa-solid fa-paper-plane';
                }, 3000);
                
            }, 1500);
        });
    }

    // ==========================================================================
    // InstaPay Copy to Clipboard Logic
    // ==========================================================================
    const copyBtn = document.getElementById('copyBtn');
    
    if (copyBtn) {
        const accountNumber = '01012440044'; // Explicit exact number
        const copyIcon = copyBtn.querySelector('i');

        copyBtn.addEventListener('click', () => {
            // Provide immediate visual feedback for touch devices
            copyBtn.style.transform = 'scale(0.9)';
            setTimeout(() => copyBtn.style.transform = '', 150);

            // Copy Logic
            navigator.clipboard.writeText(accountNumber).then(() => {
                triggerCopySuccess();
            }).catch(err => {
                console.error('Clipboard API failed: ', err);
                fallbackCopyTextToClipboard(accountNumber);
            });
        });

        function triggerCopySuccess() {
            // Apply success animation class
            copyIcon.className = 'fa-solid fa-check success-pop';
            
            // Reset after animation
            setTimeout(() => {
                copyIcon.className = 'fa-regular fa-copy';
            }, 2000);
        }

        function fallbackCopyTextToClipboard(text) {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                // Avoid scrolling to bottom
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";
                
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                document.execCommand('copy');
                document.body.removeChild(textArea);
                triggerCopySuccess();
            } catch (err) {
                console.error('Fallback copy failed', err);
                alert('حدث خطأ أثناء النسخ. برجاء نسخ الرقم يدوياً.');
            }
        }
    }
});
