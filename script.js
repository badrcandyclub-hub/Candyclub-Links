/**
 * Candy Club Hub - Interactions & Form Handling
 * Connected to Candy Club Live System & Supabase
 */

const SUPABASE_URL = 'https://thqccqwdwwxitvztmigt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BtFyuDBE_0PcF1z8JNskuA_-04mjcpc';
let supabaseClient = null;

function getSupabase() {
    if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { persistSession: false }
        });
    }
    return supabaseClient;
}

// In-browser lightweight image compression
function compressImage(file, maxWidth = 450, maxHeight = 450, quality = 0.6) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/')) {
            return resolve(null);
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = () => resolve(null);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    getSupabase();
    
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
    const originalFileText = fileNameDisplay ? fileNameDisplay.textContent : 'إرفاق صورة للمنتج (اختياري)';

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = 'تم اختيار: ' + this.files[0].name;
                fileNameDisplay.style.color = 'var(--clr-pink)';
            } else {
                fileNameDisplay.textContent = originalFileText;
                fileNameDisplay.style.color = '';
            }
        });
    }

    // ==========================================================================
    // Live Smart Request Form Submission Logic (Direct to Supabase Waitlist)
    // ==========================================================================
    const requestForm = document.getElementById('productRequestForm');
    const submitBtn = document.getElementById('submitBtn');
    const successBox = document.getElementById('requestSuccessBox');
    const errorBox = document.getElementById('requestErrorBox');
    
    if (requestForm && submitBtn) {
        const btnText = submitBtn.querySelector('.btn-text');
        const submitSvg = submitBtn.querySelector('.submit-svg');

        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (errorBox) errorBox.style.display = 'none';
            if (successBox) successBox.style.display = 'none';

            const prodName = document.getElementById('productName')?.value.trim();
            const phone = document.getElementById('customerPhone')?.value.trim();
            const custName = document.getElementById('customerName')?.value.trim() || 'عميل من صفحة الروابط';
            const file = fileInput && fileInput.files && fileInput.files.length > 0 ? fileInput.files[0] : null;

            if (!prodName || !phone) {
                if (errorBox) {
                    errorBox.textContent = 'برجاء إدخال اسم المنتج ورقم الهاتف للتواصل.';
                    errorBox.style.display = 'block';
                }
                return;
            }

            // Set Loading State
            submitBtn.disabled = true;
            btnText.textContent = 'جاري الإرسال...';
            if (submitSvg) submitSvg.style.display = 'none';
            
            try {
                let imgDataUrl = null;
                if (file) {
                    btnText.textContent = 'جاري تجهيز الصورة...';
                    imgDataUrl = await compressImage(file);
                }

                btnText.textContent = 'جاري تسجيل طلبك...';
                let finalReason = 'طلب من صفحة الروابط (Hub)';
                if (imgDataUrl) {
                    finalReason += ' | [IMG:' + imgDataUrl + ']';
                }

                const client = getSupabase();
                if (!client) {
                    throw new Error('تعذر الاتصال بخدمة كاندي كلوب');
                }

                let payload = {
                    customer_name: custName,
                    phone: phone,
                    product: prodName,
                    reason: finalReason
                };
                if (imgDataUrl) {
                    payload.image_url = imgDataUrl;
                }

                let { data, error } = await client.from('out_of_stock').insert([payload]);
                if (error && error.message && error.message.includes('image_url')) {
                    delete payload.image_url;
                    const res = await client.from('out_of_stock').insert([payload]);
                    if (res.error) throw res.error;
                } else if (error) {
                    throw error;
                }

                if (error) throw error;

                // Success State
                submitBtn.classList.add('success');
                btnText.textContent = 'تم الإرسال بنجاح!';
                if (successBox) {
                    successBox.style.display = 'block';
                    successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                
                // Reset form
                requestForm.reset();
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = originalFileText;
                    fileNameDisplay.style.color = '';
                }
                
                // Restore button state after 4 seconds
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('success');
                    btnText.textContent = 'إرسال طلب آخر';
                    if (submitSvg) submitSvg.style.display = 'inline-block';
                }, 4000);
                
            } catch (err) {
                console.error('Request error:', err);
                submitBtn.disabled = false;
                btnText.textContent = 'إعادة المحاولة';
                if (submitSvg) submitSvg.style.display = 'inline-block';
                if (errorBox) {
                    errorBox.textContent = 'تعذر إرسال الطلب: ' + (err.message || 'يرجى التحقق من الاتصال بالإنترنت');
                    errorBox.style.display = 'block';
                }
            }
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
            copyBtn.style.transform = 'scale(0.9)';
            setTimeout(() => copyBtn.style.transform = '', 150);

            navigator.clipboard.writeText(accountNumber).then(() => {
                triggerCopySuccess();
            }).catch(err => {
                console.error('Clipboard API failed: ', err);
                fallbackCopyTextToClipboard(accountNumber);
            });
        });

        function triggerCopySuccess() {
            copyIcon.className = 'fa-solid fa-check success-pop';
            setTimeout(() => {
                copyIcon.className = 'fa-regular fa-copy';
            }, 2000);
        }

        function fallbackCopyTextToClipboard(text) {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
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
