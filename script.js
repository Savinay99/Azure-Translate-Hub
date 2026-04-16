document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const apiKeyInput = document.getElementById('api-key');
    const regionSelect = document.getElementById('region');
    const saveCredsCheckbox = document.getElementById('save-creds');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const themeToggle = document.getElementById('theme-toggle');
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const sourceLang = document.getElementById('source-lang');
    const targetLang = document.getElementById('target-lang');
    const swapBtn = document.getElementById('swap-langs');
    const translateBtn = document.getElementById('translate-btn');
    const clearSourceBtn = document.getElementById('clear-source');
    const voiceInputBtn = document.getElementById('voice-input');
    const copyOutputBtn = document.getElementById('copy-output');
    const speakOutputBtn = document.getElementById('speak-output');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const sourceCount = document.getElementById('source-count');
    const detectedLangLabel = document.getElementById('detected-lang-label');
    const toggleSettingsBtn = document.getElementById('toggle-settings');
    const settingsContent = document.getElementById('settings-content');
    const toastContainer = document.getElementById('toast-container');

    // State
    let recognition = null;
    let isListening = false;

    // Initialize
    init();

    function init() {
        loadCredentials();
        loadTheme();
        loadHistory();
        setupEventListeners();
        setupSpeechRecognition();
    }

    function setupEventListeners() {
        // Credential Management
        saveCredsCheckbox.addEventListener('change', handleSaveCredsChange);
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

        // Theme
        themeToggle.addEventListener('click', toggleTheme);

        // Translation
        translateBtn.addEventListener('click', performTranslation);
        sourceText.addEventListener('input', updateCharCount);
        sourceText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                performTranslation();
            }
        });
        clearSourceBtn.addEventListener('click', clearSource);
        swapBtn.addEventListener('click', swapLanguages);

        // Voice & Copy
        voiceInputBtn.addEventListener('click', toggleVoiceInput);
        copyOutputBtn.addEventListener('click', copyToClipboard);
        speakOutputBtn.addEventListener('click', speakText);

        // History
        clearHistoryBtn.addEventListener('click', clearHistory);

        // Mobile Settings Toggle
        toggleSettingsBtn.addEventListener('click', () => {
            settingsContent.classList.toggle('active');
            const icon = toggleSettingsBtn.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    }

    function loadCredentials() {
        const savedKey = localStorage.getItem('azure_api_key');
        const savedRegion = localStorage.getItem('azure_region');
        const shouldSave = localStorage.getItem('save_creds') === 'true';

        if (shouldSave && savedKey && savedRegion) {
            apiKeyInput.value = savedKey;
            regionSelect.value = savedRegion;
            saveCredsCheckbox.checked = true;
        }
    }

    function handleSaveCredsChange() {
        if (saveCredsCheckbox.checked) {
            if (apiKeyInput.value && regionSelect.value) {
                localStorage.setItem('azure_api_key', apiKeyInput.value);
                localStorage.setItem('azure_region', regionSelect.value);
                localStorage.setItem('save_creds', 'true');
                showToast('Credentials saved securely', 'success');
            } else {
                showToast('Please enter key and region first', 'error');
                saveCredsCheckbox.checked = false;
            }
        } else {
            localStorage.removeItem('azure_api_key');
            localStorage.removeItem('azure_region');
            localStorage.removeItem('save_creds');
            showToast('Credentials cleared', 'success');
        }
    }

    function togglePasswordVisibility() {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        togglePasswordBtn.classList.toggle('fa-eye');
        togglePasswordBtn.classList.toggle('fa-eye-slash');
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    }

    function updateCharCount() {
        const count = sourceText.value.length;
        sourceCount.textContent = `${count}/5000`;
        if (count > 5000) {
            sourceCount.style.color = 'var(--error)';
        } else {
            sourceCount.style.color = 'inherit';
        }
    }

    function clearSource() {
        sourceText.value = '';
        targetText.value = '';
        detectedLangLabel.textContent = '';
        updateCharCount();
    }

    function swapLanguages() {
        if (sourceLang.value === '') return; // Can't swap if detect is on

        const tempLang = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = tempLang;

        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;

        updateCharCount();
    }

    async function performTranslation() {
        const apiKey = apiKeyInput.value.trim();
        const region = regionSelect.value;
        const text = sourceText.value.trim();
        const target = targetLang.value;
        const source = sourceLang.value;

        // Validation
        if (!apiKey || !region) {
            showToast('Please configure API Key and Region', 'error');
            return;
        }
        if (!text) {
            showToast('Please enter text to translate', 'error');
            return;
        }
        if (text.length > 5000) {
            showToast('Text exceeds 5000 character limit', 'error');
            return;
        }

        // UI Loading State
        setLoading(true);
        detectedLangLabel.textContent = '';

        try {
            const endpoint = 'https://api.cognitive.microsofttranslator.com';
            const path = '/translate?api-version=3.0';
            const params = `&to=${target}${source ? `&from=${source}` : ''}`;
            const url = endpoint + path + params;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                    'Ocp-Apim-Subscription-Region': region,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ Text: text }])
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API Key or Region');
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const translatedText = data[0].translations[0].text;
            const detectedLanguage = data[0].detectedLanguage?.language || 'Unknown';

            // Update UI
            targetText.value = translatedText;
            if (!source) {
                detectedLangLabel.textContent = `Detected: ${detectedLanguage.toUpperCase()}`;
            }

            // Add to History
            addToHistory(text, translatedText, source || detectedLanguage, target);
            showToast('Translation successful', 'success');

        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        translateBtn.disabled = isLoading;
        const btnText = translateBtn.querySelector('.btn-text');
        const loader = translateBtn.querySelector('.loader');

        if (isLoading) {
            btnText.textContent = 'Translating...';
            loader.classList.remove('hidden');
        } else {
            btnText.textContent = 'Translate Now';
            loader.classList.add('hidden');
        }
    }

    function addToHistory(source, target, srcLang, tgtLang) {
        let history = JSON.parse(localStorage.getItem('translation_history') || '[]');

        // Add new entry
        history.unshift({
            source,
            target,
            srcLang,
            tgtLang,
            timestamp: new Date().toISOString()
        });

        // Keep only last 5
        if (history.length > 5) {
            history = history.slice(0, 5);
        }

        localStorage.setItem('translation_history', JSON.stringify(history));
        renderHistory();
    }

    function loadHistory() {
        renderHistory();
    }

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('translation_history') || '[]');
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<li class="empty-state">No recent translations</li>';
            return;
        }

        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-src">${item.source.substring(0, 50)}${item.source.length > 50 ? '...' : ''}</div>
                <div class="history-tgt">${item.target.substring(0, 50)}${item.target.length > 50 ? '...' : ''}</div>
            `;
            li.addEventListener('click', () => {
                sourceText.value = item.source;
                targetText.value = item.target;
                sourceLang.value = item.srcLang === 'Unknown' ? '' : item.srcLang;
                targetLang.value = item.tgtLang;
                updateCharCount();
            });
            historyList.appendChild(li);
        });
    }

    function clearHistory() {
        localStorage.removeItem('translation_history');
        renderHistory();
        showToast('History cleared', 'success');
    }

    function setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                sourceText.value = transcript;
                updateCharCount();
                isListening = false;
                voiceInputBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                voiceInputBtn.style.color = 'inherit';
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                showToast('Voice input error: ' + event.error, 'error');
                isListening = false;
                voiceInputBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                voiceInputBtn.style.color = 'inherit';
            };

            recognition.onend = () => {
                isListening = false;
                voiceInputBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                voiceInputBtn.style.color = 'inherit';
            };
        } else {
            voiceInputBtn.style.display = 'none';
        }
    }

    function toggleVoiceInput() {
        if (!recognition) {
            showToast('Speech recognition not supported', 'error');
            return;
        }

        if (isListening) {
            recognition.stop();
            isListening = false;
            voiceInputBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            voiceInputBtn.style.color = 'inherit';
        } else {
            // Set language based on source lang selection
            const lang = sourceLang.value || 'en-US';
            recognition.lang = lang === 'hi' ? 'hi-IN' :
                lang === 'fr' ? 'fr-FR' :
                    lang === 'es' ? 'es-ES' : 'en-US';

            recognition.start();
            isListening = true;
            voiceInputBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
            voiceInputBtn.style.color = 'var(--error)';
            showToast('Listening...', 'success');
        }
    }

    function copyToClipboard() {
        if (!targetText.value) return;

        navigator.clipboard.writeText(targetText.value).then(() => {
            showToast('Copied to clipboard', 'success');
        }).catch(err => {
            showToast('Failed to copy', 'error');
        });
    }

    function speakText() {
        if (!targetText.value) return;

        const utterance = new SpeechSynthesisUtterance(targetText.value);
        const lang = targetLang.value;
        utterance.lang = lang === 'hi' ? 'hi-IN' :
            lang === 'fr' ? 'fr-FR' :
                lang === 'es' ? 'es-ES' :
                    lang === 'de' ? 'de-DE' :
                        lang === 'ja' ? 'ja-JP' :
                            lang === 'zh-Hans' ? 'zh-CN' : 'en-US';

        window.speechSynthesis.speak(utterance);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});