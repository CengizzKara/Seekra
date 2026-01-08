class SeekraApp {
    constructor() {
        this.state = {
            currentTheme: 'light',
            fontSize: 16,
            safeSearch: true,
            searchHistory: [],
            currentSearchType: 'web',
            settings: {}
        };
        
        this.init();
    }
    
    init() {
        this.loadState();
        this.cacheElements();
        this.bindEvents();
        this.applyTheme();
        this.applyFontSize();
        this.updateUI();
        this.updateStats();
        this.focusSearch();
    }
    
    loadState() {
        const savedSettings = localStorage.getItem('seekra_settings');
        if (savedSettings) {
            this.state.settings = JSON.parse(savedSettings);
            
            if (this.state.settings.theme) {
                this.state.currentTheme = this.state.settings.theme;
            }
            if (this.state.settings.fontSize) {
                this.state.fontSize = this.state.settings.fontSize;
            }
            if (this.state.settings.safeSearch !== undefined) {
                this.state.safeSearch = this.state.settings.safeSearch;
            }
        }
        
        const savedHistory = localStorage.getItem('seekra_history');
        if (savedHistory) {
            this.state.searchHistory = JSON.parse(savedHistory);
        }
    }
    
    saveState() {
        this.state.settings = {
            theme: this.state.currentTheme,
            fontSize: this.state.fontSize,
            safeSearch: this.state.safeSearch
        };
        
        localStorage.setItem('seekra_settings', JSON.stringify(this.state.settings));
        localStorage.setItem('seekra_history', JSON.stringify(this.state.searchHistory));
    }
    
    cacheElements() {
        this.elements = {
            searchForm: document.getElementById('searchForm'),
            searchInput: document.getElementById('searchInput'),
            clearBtn: document.getElementById('clearBtn'),
            searchTypeBtns: document.querySelectorAll('.type-btn'),
            quickSearchItems: document.querySelectorAll('.quick-search-item'),
            historyBtn: document.getElementById('historyBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            themeBtn: document.getElementById('themeBtn'),
            openDeepseekBtn: document.getElementById('openDeepseekBtn'),
            privacyPolicyBtn: document.getElementById('privacyPolicyBtn'),
            closeHistory: document.getElementById('closeHistory'),
            closeSettings: document.getElementById('closeSettings'),
            closePrivacy: document.getElementById('closePrivacy'),
            historySidebar: document.getElementById('historySidebar'),
            settingsSidebar: document.getElementById('settingsSidebar'),
            privacySidebar: document.getElementById('privacySidebar'),
            overlay: document.getElementById('overlay'),
            themeOptions: document.querySelectorAll('.theme-option'),
            fontSmaller: document.getElementById('fontSmaller'),
            fontLarger: document.getElementById('fontLarger'),
            fontSizeDisplay: document.getElementById('fontSizeDisplay'),
            safeSearchToggle: document.getElementById('safeSearchToggle'),
            historyList: document.getElementById('historyList'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),
            todayCount: document.getElementById('todayCount'),
            totalCount: document.getElementById('totalCount'),
            weekCount: document.getElementById('weekCount'),
            footerPrivacyBtn: document.getElementById('footerPrivacyBtn'),
            footerSettingsBtn: document.getElementById('footerSettingsBtn'),
            footerHistoryBtn: document.getElementById('footerHistoryBtn'),
            footerAboutBtn: document.getElementById('footerAboutBtn')
        };
    }
    
    bindEvents() {
        this.elements.searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        this.elements.searchInput.addEventListener('input', () => this.handleInput());
        this.elements.clearBtn.addEventListener('click', () => this.clearSearch());
        
        this.elements.searchTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setSearchType(btn.dataset.type));
        });
        
        this.elements.quickSearchItems.forEach(item => {
            item.addEventListener('click', () => this.performQuickSearch(item.dataset.query));
        });
        
        this.elements.historyBtn.addEventListener('click', () => this.openSidebar('history'));
        this.elements.settingsBtn.addEventListener('click', () => this.openSidebar('settings'));
        this.elements.themeBtn.addEventListener('click', () => this.toggleTheme());
        this.elements.openDeepseekBtn.addEventListener('click', () => this.openDeepseek());
        this.elements.privacyPolicyBtn.addEventListener('click', () => this.openSidebar('privacy'));
        
        this.elements.footerPrivacyBtn.addEventListener('click', () => this.openSidebar('privacy'));
        this.elements.footerSettingsBtn.addEventListener('click', () => this.openSidebar('settings'));
        this.elements.footerHistoryBtn.addEventListener('click', () => this.openSidebar('history'));
        this.elements.footerAboutBtn.addEventListener('click', () => this.showAbout());
        
        this.elements.closeHistory.addEventListener('click', () => this.closeSidebars());
        this.elements.closeSettings.addEventListener('click', () => this.closeSidebars());
        this.elements.closePrivacy.addEventListener('click', () => this.closeSidebars());
        this.elements.overlay.addEventListener('click', () => this.closeSidebars());
        
        this.elements.themeOptions.forEach(option => {
            option.addEventListener('click', () => this.setTheme(option.dataset.theme));
        });
        
        this.elements.fontSmaller.addEventListener('click', () => this.adjustFontSize(-1));
        this.elements.fontLarger.addEventListener('click', () => this.adjustFontSize(1));
        
        this.elements.safeSearchToggle.addEventListener('change', (e) => {
            this.state.safeSearch = e.target.checked;
            this.saveState();
        });
        
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory(false));
        this.elements.clearAllHistoryBtn.addEventListener('click', () => this.clearHistory(true));
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.overlay) {
                this.closeSidebars();
            }
        });
    }
    
    handleSearch(e) {
        e.preventDefault();
        
        const query = this.elements.searchInput.value.trim();
        if (!query) {
            this.focusSearch();
            return;
        }
        
        this.addToHistory(query);
        this.performSearch(query);
        this.elements.searchInput.value = '';
        this.elements.clearBtn.style.display = 'none';
    }
    
    performSearch(query, type = this.state.currentSearchType) {
        let url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        
        if (type === 'images') {
            url += '&iax=images&ia=images';
        } else if (type === 'news') {
            url += '&iar=news&ia=news';
        }
        
        if (this.state.safeSearch) {
            url += '&kp=1';
        }
        
        window.open(url, '_blank');
    }
    
    performQuickSearch(query) {
        this.elements.searchInput.value = query;
        this.handleSearch({ preventDefault: () => {} });
    }
    
    openDeepseek() {
        window.open('https://chat.deepseek.com/', '_blank');
        this.closeSidebars();
    }
    
    handleInput() {
        const hasValue = this.elements.searchInput.value.trim().length > 0;
        this.elements.clearBtn.style.display = hasValue ? 'block' : 'none';
    }
    
    clearSearch() {
        this.elements.searchInput.value = '';
        this.elements.clearBtn.style.display = 'none';
        this.focusSearch();
    }
    
    setSearchType(type) {
        this.state.currentSearchType = type;
        
        this.elements.searchTypeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
    }
    
    addToHistory(query) {
        const searchEntry = {
            id: Date.now(),
            query: query,
            type: this.state.currentSearchType,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
        };
        
        this.state.searchHistory.unshift(searchEntry);
        
        if (this.state.searchHistory.length > 100) {
            this.state.searchHistory = this.state.searchHistory.slice(0, 100);
        }
        
        this.saveState();
        this.updateHistoryDisplay();
        this.updateStats();
    }
    
    updateHistoryDisplay() {
        const historyList = this.elements.historyList;
        
        if (this.state.searchHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-search"></i>
                    <h3>No Search History</h3>
                    <p>Your searches will appear here</p>
                </div>`;
            return;
        }
        
        historyList.innerHTML = '';
        
        this.state.searchHistory.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            let icon = 'fa-search';
            if (entry.type === 'images') icon = 'fa-image';
            if (entry.type === 'news') icon = 'fa-newspaper';
            
            item.innerHTML = `
                <div class="history-content">
                    <div class="history-query">
                        <i class="fas ${icon}"></i>
                        ${this.escapeHtml(entry.query)}
                    </div>
                    <div class="history-time">${entry.time} • ${entry.date}</div>
                </div>
                <div class="history-actions">
                    <button class="history-action-btn" title="Search again" data-id="${entry.id}">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="history-action-btn" title="Delete" data-id="${entry.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;
            
            const buttons = item.querySelectorAll('.history-action-btn');
            buttons[0].addEventListener('click', () => this.searchFromHistory(entry.query, entry.type));
            buttons[1].addEventListener('click', () => this.removeFromHistory(entry.id));
            
            historyList.appendChild(item);
        });
    }
    
    searchFromHistory(query, type) {
        this.elements.searchInput.value = query;
        this.setSearchType(type);
        this.performSearch(query, type);
        this.closeSidebars();
    }
    
    removeFromHistory(id) {
        this.state.searchHistory = this.state.searchHistory.filter(entry => entry.id !== id);
        this.saveState();
        this.updateHistoryDisplay();
        this.updateStats();
    }
    
    clearHistory(all = false) {
        const message = all 
            ? 'Are you sure you want to clear all search history? This cannot be undone.'
            : 'Clear recent search history?';
        
        if (confirm(message)) {
            if (all) {
                this.state.searchHistory = [];
            } else {
                const today = new Date().toDateString();
                this.state.searchHistory = this.state.searchHistory.filter(entry => 
                    new Date(entry.timestamp).toDateString() === today
                );
            }
            
            this.saveState();
            this.updateHistoryDisplay();
            this.updateStats();
            this.showNotification('History cleared');
        }
    }
    
    updateStats() {
        const today = new Date().toDateString();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const todayCount = this.state.searchHistory.filter(entry => 
            new Date(entry.timestamp).toDateString() === today
        ).length;
        
        const weekCount = this.state.searchHistory.filter(entry => 
            new Date(entry.timestamp) >= weekAgo
        ).length;
        
        this.elements.todayCount.textContent = todayCount;
        this.elements.weekCount.textContent = weekCount;
        this.elements.totalCount.textContent = this.state.searchHistory.length;
    }
    
    toggleTheme() {
        const themes = ['light', 'dark', 'blue'];
        const currentIndex = themes.indexOf(this.state.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
    
    setTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme', 'blue-theme');
        document.body.classList.add(`${theme}-theme`);
        
        this.state.currentTheme = theme;
        
        this.elements.themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
        
        this.saveState();
    }
    
    applyTheme() {
        this.setTheme(this.state.currentTheme);
    }
    
    adjustFontSize(change) {
        let newSize = this.state.fontSize + change;
        newSize = Math.max(14, Math.min(20, newSize));
        this.setFontSize(newSize);
    }
    
    setFontSize(size) {
        this.state.fontSize = size;
        
        let displayText = 'Medium';
        if (size <= 15) displayText = 'Small';
        if (size >= 18) displayText = 'Large';
        if (size >= 20) displayText = 'X-Large';
        
        this.elements.fontSizeDisplay.textContent = displayText;
        this.applyFontSize();
        this.saveState();
    }
    
    applyFontSize() {
        document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
        
        if (this.state.fontSize <= 15) {
            document.body.classList.add('font-small');
        } else if (this.state.fontSize <= 17) {
            document.body.classList.add('font-medium');
        } else if (this.state.fontSize <= 19) {
            document.body.classList.add('font-large');
        } else {
            document.body.classList.add('font-xlarge');
        }
        
        document.documentElement.style.fontSize = `${this.state.fontSize}px`;
    }
    
    openSidebar(sidebar) {
        this.closeSidebars();
        
        let sidebarElement;
        if (sidebar === 'history') {
            sidebarElement = this.elements.historySidebar;
            this.updateHistoryDisplay();
            this.updateStats();
        } else if (sidebar === 'settings') {
            sidebarElement = this.elements.settingsSidebar;
            this.elements.safeSearchToggle.checked = this.state.safeSearch;
            this.setFontSize(this.state.fontSize);
        } else if (sidebar === 'privacy') {
            sidebarElement = this.elements.privacySidebar;
        }
        
        sidebarElement.classList.add('active');
        this.elements.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeSidebars() {
        this.elements.historySidebar.classList.remove('active');
        this.elements.settingsSidebar.classList.remove('active');
        this.elements.privacySidebar.classList.remove('active');
        this.elements.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    handleKeyboard(e) {
        if ((e.ctrlKey && e.key === 'k') || e.key === '/') {
            e.preventDefault();
            this.focusSearch();
        }
        
        if (e.ctrlKey && e.key === ',') {
            e.preventDefault();
            this.openSidebar('settings');
        }
        
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            this.openSidebar('history');
        }
        
        if (e.key === 'Escape') {
            this.closeSidebars();
        }
    }
    
    focusSearch() {
        this.elements.searchInput.focus();
    }
    
    showAbout() {
        this.showNotification('Seekra v1.0 - Privacy-first search engine');
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--primary);
            color: white;
            padding: 14px 24px;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
            max-width: 320px;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
        
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    updateUI() {
        this.setSearchType(this.state.currentSearchType);
        this.elements.safeSearchToggle.checked = this.state.safeSearch;
        this.setFontSize(this.state.fontSize);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SeekraApp();
});
