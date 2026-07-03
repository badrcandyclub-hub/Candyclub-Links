/**
 * Candy Club Hub - Interactions & Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // File Input Name Update
    // ==========================================================================
    const fileInput = document.getElementById('productImage');
    const fileNameDisplay = document.getElementById('fileName');
    const originalFileText = fileNameDisplay.textContent;

    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileNameDisplay.textContent = this.files[0].name;
        } else {
            fileNameDisplay.textContent = originalFileText;
        }
    });

    // ==========================================================================
    // Smart Request Form Submission Logic
    // ==========================================================================
    const requestForm = document.getElementById('productRequestForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('i');

    requestForm.addEventListener('submit', (e) => {
        // Prevent default browser submission
        e.preventDefault();
        
        // 1. Set Loading State
        submitBtn.disabled = true;
        btnText.textContent = 'جاري الإرسال...';
        btnIcon.className = 'fa-solid fa-spinner fa-spin';
        
        // Note: Future integration point for Google Apps Script Webhook to push to Google Sheets
        // fetch('YOUR_WEBHOOK_URL', { method: 'POST', body: new FormData(requestForm) }) ...
        
        // 2. Simulate Network Request (2-second delay)
        setTimeout(() => {
            // 3. Success State
            submitBtn.classList.add('success');
            btnText.textContent = 'تم الإرسال بنجاح ✅';
            btnIcon.className = 'fa-solid fa-check';
            
            // 4. Reset form inputs
            requestForm.reset();
            fileNameDisplay.textContent = originalFileText;
            
            // 5. Restore original button state after 3 seconds
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.classList.remove('success');
                btnText.textContent = 'إرسال الطلب';
                btnIcon.className = 'fa-solid fa-paper-plane';
            }, 3000);
            
        }, 2000);
    });

    // ==========================================================================
    // InstaPay Copy to Clipboard Logic
    // ==========================================================================
    const copyBtn = document.getElementById('copyBtn');
    const accountNumber = '01012440044'; // Explicitly exact number
    const copyIcon = copyBtn.querySelector('i');

    copyBtn.addEventListener('click', () => {
        // Use the Clipboard API
        navigator.clipboard.writeText(accountNumber).then(() => {
            // Temporary Success State
            const originalTitle = copyBtn.title;
            
            copyBtn.title = "تم النسخ";
            copyIcon.className = 'fa-solid fa-check copy-success-anim';
            copyBtn.style.color = '#2ed573';
            
            // Revert after 2 seconds
            setTimeout(() => {
                copyBtn.title = originalTitle;
                copyIcon.className = 'fa-regular fa-copy';
                copyBtn.style.color = ''; // Restore default
            }, 2000);
            
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            
            // Fallback for older browsers
            try {
                const textArea = document.createElement("textarea");
                textArea.value = accountNumber;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                
                // Temporary Success State
                const originalTitle = copyBtn.title;
                
                copyBtn.title = "تم النسخ";
                copyIcon.className = 'fa-solid fa-check copy-success-anim';
                copyBtn.style.color = '#2ed573';
                
                // Revert after 2 seconds
                setTimeout(() => {
                    copyBtn.title = originalTitle;
                    copyIcon.className = 'fa-regular fa-copy';
                    copyBtn.style.color = ''; // Restore default
                }, 2000);
            } catch(fallbackErr) {
                alert('حدث خطأ أثناء النسخ.');
            }
        });
    });
});
