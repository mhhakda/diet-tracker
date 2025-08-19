/**
 * Diet Tracker Application - Production Ready
 * A comprehensive nutrition tracking app with Indian foods database
 * Features: Entry management, export functionality, charts, offline storage
 * 
 * @version 1.0.0
 * @author TheDietPlanner.com
 */

class DietTracker {
    constructor() {
        // Initialize app data
        this.entries = [];
        this.customFoods = [];
        this.profile = {
            calories: 2000,
            protein: 150,
            carbs: 250,
            fat: 65,
            fiber: 25,
            water: 2000
        };
        this.currentDate = new Date().toISOString().split('T')[0];
        this.currentWeekStart = this.getWeekStart(new Date());
        this.charts = {};
        this.currentEditingEntry = null;
        this.chartsLoaded = false;
        this.xlsxLoaded = false;
        this.pdfLoaded = false;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    // Comprehensive Indian Foods Database (40+ foods with accurate macros)
    indianFoods = [
        // Grains & Cereals
        {"name": "Roti (1 medium)", "calories": 119, "protein": 3, "carbs": 18, "fat": 2, "fiber": 2, "category": "grains", "serving": "1 piece"},
        {"name": "Rice cooked (1 cup)", "calories": 120, "protein": 2, "carbs": 30, "fat": 0, "fiber": 0, "category": "grains", "serving": "1 cup"},
        {"name": "Idli (2 pieces)", "calories": 78, "protein": 3, "carbs": 17, "fat": 0, "fiber": 1, "category": "grains", "serving": "2 pieces"},
        {"name": "Dosa (1 medium)", "calories": 133, "protein": 4, "carbs": 16, "fat": 6, "fiber": 1, "category": "grains", "serving": "1 piece"},
        {"name": "Upma (1 cup)", "calories": 183, "protein": 5, "carbs": 27, "fat": 6, "fiber": 2, "category": "grains", "serving": "1 cup"},
        {"name": "Poha (1 cup)", "calories": 180, "protein": 6, "carbs": 35, "fat": 2, "fiber": 2, "category": "grains", "serving": "1 cup"},
        {"name": "Paratha (1 medium)", "calories": 280, "protein": 6, "carbs": 36, "fat": 12, "fiber": 3, "category": "grains", "serving": "1 piece"},
        {"name": "Chapati (1 medium)", "calories": 104, "protein": 3, "carbs": 18, "fat": 2, "fiber": 2, "category": "grains", "serving": "1 piece"},
        
        // Legumes & Pulses
        {"name": "Dal (1 cup)", "calories": 200, "protein": 15, "carbs": 25, "fat": 1, "fiber": 7, "category": "legumes", "serving": "1 cup"},
        {"name": "Rajma (1 cup)", "calories": 245, "protein": 15, "carbs": 45, "fat": 1, "fiber": 11, "category": "legumes", "serving": "1 cup"},
        {"name": "Chana (1 cup)", "calories": 210, "protein": 12, "carbs": 35, "fat": 3, "fiber": 10, "category": "legumes", "serving": "1 cup"},
        {"name": "Moong Dal (1 cup)", "calories": 190, "protein": 14, "carbs": 32, "fat": 1, "fiber": 8, "category": "legumes", "serving": "1 cup"},
        
        // Dairy Products
        {"name": "Milk (1 cup)", "calories": 65, "protein": 3, "carbs": 5, "fat": 4, "fiber": 0, "category": "dairy", "serving": "1 cup"},
        {"name": "Paneer (100g)", "calories": 265, "protein": 18, "carbs": 1, "fat": 20, "fiber": 0, "category": "dairy", "serving": "100g"},
        {"name": "Curd (1 cup)", "calories": 98, "protein": 11, "carbs": 12, "fat": 0, "fiber": 0, "category": "dairy", "serving": "1 cup"},
        {"name": "Buttermilk (1 cup)", "calories": 19, "protein": 2, "carbs": 3, "fat": 0, "fiber": 0, "category": "dairy", "serving": "1 cup"},
        {"name": "Lassi (1 cup)", "calories": 180, "protein": 6, "carbs": 20, "fat": 8, "fiber": 0, "category": "dairy", "serving": "1 cup"},
        
        // Fruits
        {"name": "Banana (1 medium)", "calories": 80, "protein": 1, "carbs": 20, "fat": 0, "fiber": 2, "category": "fruits", "serving": "1 piece"},
        {"name": "Apple (1 medium)", "calories": 52, "protein": 0, "carbs": 14, "fat": 0, "fiber": 2, "category": "fruits", "serving": "1 piece"},
        {"name": "Mango (100g)", "calories": 70, "protein": 1, "carbs": 17, "fat": 0, "fiber": 2, "category": "fruits", "serving": "100g"},
        {"name": "Orange (1 medium)", "calories": 47, "protein": 1, "carbs": 12, "fat": 0, "fiber": 2, "category": "fruits", "serving": "1 piece"},
        {"name": "Grapes (1 cup)", "calories": 60, "protein": 1, "carbs": 15, "fat": 0, "fiber": 1, "category": "fruits", "serving": "1 cup"},
        {"name": "Papaya (1 cup)", "calories": 55, "protein": 1, "carbs": 14, "fat": 0, "fiber": 3, "category": "fruits", "serving": "1 cup"},
        
        // Vegetables
        {"name": "Potato (1 medium)", "calories": 80, "protein": 1, "carbs": 22, "fat": 0, "fiber": 2, "category": "vegetables", "serving": "1 piece"},
        {"name": "Tomato (1 medium)", "calories": 15, "protein": 1, "carbs": 3, "fat": 0, "fiber": 1, "category": "vegetables", "serving": "1 piece"},
        {"name": "Onion (1 medium)", "calories": 50, "protein": 1, "carbs": 12, "fat": 0, "fiber": 2, "category": "vegetables", "serving": "1 piece"},
        {"name": "Carrot (1 medium)", "calories": 48, "protein": 1, "carbs": 12, "fat": 0, "fiber": 3, "category": "vegetables", "serving": "1 piece"},
        {"name": "Spinach (1 cup)", "calories": 23, "protein": 3, "carbs": 4, "fat": 0, "fiber": 2, "category": "vegetables", "serving": "1 cup"},
        {"name": "Brinjal (100g)", "calories": 24, "protein": 1, "carbs": 6, "fat": 0, "fiber": 3, "category": "vegetables", "serving": "100g"},
        {"name": "Cauliflower (1 cup)", "calories": 30, "protein": 2, "carbs": 6, "fat": 0, "fiber": 3, "category": "vegetables", "serving": "1 cup"},
        {"name": "Cabbage (1 cup)", "calories": 45, "protein": 2, "carbs": 10, "fat": 0, "fiber": 4, "category": "vegetables", "serving": "1 cup"},
        {"name": "Peas (1 cup)", "calories": 93, "protein": 5, "carbs": 8, "fat": 0, "fiber": 4, "category": "vegetables", "serving": "1 cup"},
        {"name": "Okra (1 cup)", "calories": 35, "protein": 2, "carbs": 7, "fat": 0, "fiber": 3, "category": "vegetables", "serving": "1 cup"},
        
        // Protein Sources
        {"name": "Chicken (100g)", "calories": 150, "protein": 25, "carbs": 0, "fat": 5, "fiber": 0, "category": "protein", "serving": "100g"},
        {"name": "Egg (1 large)", "calories": 70, "protein": 6, "carbs": 0, "fat": 5, "fiber": 0, "category": "protein", "serving": "1 piece"},
        {"name": "Fish (100g)", "calories": 220, "protein": 20, "carbs": 8, "fat": 10, "fiber": 0, "category": "protein", "serving": "100g"},
        {"name": "Mutton (100g)", "calories": 194, "protein": 26, "carbs": 0, "fat": 9, "fiber": 0, "category": "protein", "serving": "100g"},
        
        // Fats & Oils
        {"name": "Ghee (1 tbsp)", "calories": 135, "protein": 0, "carbs": 0, "fat": 15, "fiber": 0, "category": "fats", "serving": "1 tbsp"},
        {"name": "Oil (1 tbsp)", "calories": 120, "protein": 0, "carbs": 0, "fat": 14, "fiber": 0, "category": "fats", "serving": "1 tbsp"},
        {"name": "Butter (1 tbsp)", "calories": 102, "protein": 0, "carbs": 0, "fat": 12, "fiber": 0, "category": "fats", "serving": "1 tbsp"},
        
        // Nuts & Seeds
        {"name": "Almonds (10 pieces)", "calories": 69, "protein": 3, "carbs": 3, "fat": 6, "fiber": 1, "category": "nuts", "serving": "10 pieces"},
        {"name": "Peanuts (30g)", "calories": 171, "protein": 7, "carbs": 3, "fat": 15, "fiber": 2, "category": "nuts", "serving": "30g"},
        {"name": "Coconut (30g)", "calories": 106, "protein": 1, "carbs": 4, "fat": 10, "fiber": 3, "category": "nuts", "serving": "30g"},
        {"name": "Walnuts (5 pieces)", "calories": 131, "protein": 3, "carbs": 3, "fat": 13, "fiber": 1, "category": "nuts", "serving": "5 pieces"},
        
        // Beverages & Others
        {"name": "Tea (1 cup)", "calories": 2, "protein": 0, "carbs": 1, "fat": 0, "fiber": 0, "category": "beverages", "serving": "1 cup"},
        {"name": "Coffee (1 cup)", "calories": 2, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "category": "beverages", "serving": "1 cup"},
        {"name": "Sugar (1 tsp)", "calories": 16, "protein": 0, "carbs": 4, "fat": 0, "fiber": 0, "category": "sweeteners", "serving": "1 tsp"},
        {"name": "Jaggery (20g)", "calories": 76, "protein": 0, "carbs": 20, "fat": 0, "fiber": 0, "category": "sweeteners", "serving": "20g"},
        {"name": "Honey (1 tbsp)", "calories": 64, "protein": 0, "carbs": 17, "fat": 0, "fiber": 0, "category": "sweeteners", "serving": "1 tbsp"}
    ];

    // Initialize the application
    async init() {
        console.log('🚀 Initializing Diet Tracker...');
        
        try {
            // Load data first
            await this.loadData();
            
            // Setup event listeners with delay to ensure DOM is ready
            setTimeout(() => {
                this.setupEventListeners();
                this.populatePresetFoods();
                this.setCurrentDate();
                this.loadProfile();
                
                // Load theme preference
                this.loadThemePreference();
                
                // Render initial views
                this.renderDailyView();
                this.renderWeeklyView();
                
                // Auto-save setup
                this.setupAutoSave();
                
                this.showStatus('Diet Tracker loaded successfully! 🎉', 'success');
                console.log('✅ Diet Tracker initialized successfully');
            }, 100);
        } catch (error) {
            console.error('❌ Error initializing Diet Tracker:', error);
            this.showStatus('Error loading Diet Tracker. Please refresh the page.', 'error');
        }
    }

    // Setup auto-save functionality
    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveData();
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
        
        // Save on visibility change (when user switches tabs)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveData();
            }
        });
    }

    // Setup all event listeners
    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        // Tab navigation - use direct event listeners
        this.setupTabNavigation();
        
        // Button handlers
        this.setupButtonHandlers();
        
        // Modal handlers
        this.setupModalHandlers();
        
        // Form handlers
        this.setupFormHandlers();
        
        // Navigation handlers
        this.setupNavigationHandlers();
        
        // Export/Import handlers
        this.setupExportImportHandlers();
        
        // Quick actions
        this.setupQuickActions();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        console.log('✅ Event listeners set up successfully');
    }

    setupTabNavigation() {
        // Tab navigation with proper event handling
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tabName = button.getAttribute('data-tab');
                console.log('Tab clicked:', tabName);
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    }

    setupButtonHandlers() {
        // Add Entry button
        const addEntryBtn = document.getElementById('addEntryBtn');
        if (addEntryBtn) {
            addEntryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add entry button clicked');
                this.openAddEntryModal();
            });
        }

        // Profile button  
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openProfileModal();
            });
        }

        // Backup button
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showBackupOptions();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    }

    setupModalHandlers() {
        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-backdrop')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            }
        });

        // Cancel buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cancelEntry') {
                e.preventDefault();
                this.closeModal('addEntryModal');
            }
            
            if (e.target.id === 'cancelProfile') {
                e.preventDefault();
                this.closeModal('profileModal');
            }
        });

        // Entry actions - delegated event handling
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-entry-btn')) {
                e.preventDefault();
                const entryItem = e.target.closest('.entry-item');
                const entryId = entryItem?.dataset.entryId;
                const entry = this.entries.find(entry => entry.id === entryId);
                if (entry) {
                    this.editEntry(entry);
                }
            }
            
            if (e.target.closest('.delete-entry-btn')) {
                e.preventDefault();
                const entryItem = e.target.closest('.entry-item');
                const entryId = entryItem?.dataset.entryId;
                if (entryId) {
                    this.deleteEntry(entryId);
                }
            }
            
            if (e.target.closest('.add-food-btn')) {
                e.preventDefault();
                this.openAddEntryModal();
            }
        });

        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal:not(.hidden)');
                openModals.forEach(modal => this.closeModal(modal.id));
            }
        });
    }

    setupFormHandlers() {
        const entryForm = document.getElementById('entryForm');
        const profileForm = document.getElementById('profileForm');
        
        if (entryForm) {
            entryForm.addEventListener('submit', (e) => this.saveEntry(e));
        }
        
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.saveProfile(e));
        }

        // Preset food selection
        const presetFoodsSelect = document.getElementById('presetFoods');
        if (presetFoodsSelect) {
            presetFoodsSelect.addEventListener('change', (e) => this.selectPresetFood(e));
        }
    }

    setupNavigationHandlers() {
        // Date navigation
        const prevDayBtn = document.getElementById('prevDay');
        const nextDayBtn = document.getElementById('nextDay');
        const currentDateInput = document.getElementById('currentDate');

        if (prevDayBtn) {
            prevDayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeDate(-1);
            });
        }

        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeDate(1);
            });
        }

        if (currentDateInput) {
            currentDateInput.addEventListener('change', (e) => {
                this.currentDate = e.target.value;
                this.renderDailyView();
            });
        }

        // Week navigation
        const prevWeekBtn = document.getElementById('prevWeek');
        const nextWeekBtn = document.getElementById('nextWeek');

        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeWeek(-1);
            });
        }

        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeWeek(1);
            });
        }
    }

    setupExportImportHandlers() {
        const exportButtons = {
            'exportCSV': () => this.exportCSV(),
            'exportXLSX': () => this.exportXLSX(),
            'exportPDF': () => this.exportPDF(),
            'getSheetsTemplate': () => this.downloadSheetsTemplate(),
            'importCSV': () => this.triggerCSVImport(),
            'backupJSON': () => this.noop(),
            'restoreJSON': () => this.triggerJSONRestore(),
            'clearData': () => this.clearAllData()
        };

        Object.entries(exportButtons).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        });

        // File inputs
        const csvFileInput = document.getElementById('csvFileInput');
        const jsonFileInput = document.getElementById('jsonFileInput');
        
        if (csvFileInput) {
            csvFileInput.addEventListener('change', (e) => this.handleCSVImport(e));
        }
        
        if (jsonFileInput) {
            jsonFileInput.addEventListener('change', (e) => this.handleJSONRestore(e));
        }
    }

    setupQuickActions() {
        // Water tracking buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('water-btn')) {
                e.preventDefault();
                const amount = parseInt(e.target.getAttribute('data-amount'));
                if (amount) {
                    this.addWater(amount);
                }
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger shortcuts when not in input fields
            if (['input', 'textarea', 'select'].includes(e.target.tagName.toLowerCase())) {
                return;
            }
            
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.openAddEntryModal();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveData();
                        this.showStatus('Data saved! 💾', 'success');
                        break;
                }
            }
        });
    }

    // Tab switching with proper content management
    switchTab(tabName) {
        console.log(`🔄 Switching to tab: ${tabName}`);
        
        // Remove active states
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Activate selected tab
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
            selectedTab.setAttribute('aria-selected', 'true');
        }

        // Show content based on tab
        let targetContentId;
        switch(tabName) {
            case 'daily':
                targetContentId = 'dailyTab';
                break;
            case 'weekly':
                targetContentId = 'weeklyTab';
                break;
            case 'analytics':
                targetContentId = 'analyticsTab';
                this.loadAndRenderCharts();
                break;
            case 'export':
                targetContentId = 'exportTab';
                break;
            default:
                targetContentId = 'dailyTab';
        }

        const selectedContent = document.getElementById(targetContentId);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }

        // Update URL hash
        window.history.replaceState(null, null, `#${tabName}`);
        
        console.log(`✅ Tab switched to: ${tabName}`);
    }

    // Charts loading and rendering
    async loadAndRenderCharts() {
        if (!this.chartsLoaded) {
            try {
                await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js');
                this.chartsLoaded = true;
                console.log('✅ Chart.js loaded');
            } catch (error) {
                console.error('❌ Error loading Chart.js:', error);
                this.showStatus('Error loading charts library', 'error');
                return;
            }
        }

        setTimeout(() => this.renderCharts(), 300);
    }

    renderCharts() {
        if (typeof Chart === 'undefined') {
            this.showStatus('Charts library not loaded', 'error');
            return;
        }

        this.renderCaloriesChart();
        this.renderMacrosChart();
        this.renderWeeklyChart();
    }

    renderCaloriesChart() {
        const ctx = document.getElementById('caloriesChart');
        if (!ctx) return;

        if (this.charts.calories) {
            this.charts.calories.destroy();
        }

        // Get last 7 days data
        const days = [];
        const calories = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const dayEntries = this.entries.filter(entry => entry.date === dateString);
            const summary = this.calculateDailySummary(dayEntries);
            
            days.push(date.toLocaleDateString('en-US', {weekday: 'short', day: 'numeric'}));
            calories.push(Math.round(summary.calories));
        }

        this.charts.calories = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Calories',
                    data: calories,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Target',
                    data: Array(7).fill(this.profile.calories),
                    borderColor: '#FFC185',
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderMacrosChart() {
        const ctx = document.getElementById('macrosChart');
        if (!ctx) return;

        if (this.charts.macros) {
            this.charts.macros.destroy();
        }

        const todayEntries = this.entries.filter(entry => entry.date === this.currentDate);
        const summary = this.calculateDailySummary(todayEntries);

        this.charts.macros = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fat'],
                datasets: [{
                    data: [summary.protein * 4, summary.carbs * 4, summary.fat * 9],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderWeeklyChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }

        const weekStart = new Date(this.currentWeekStart);
        const days = [];
        const weeklyCalories = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            const dayEntries = this.entries.filter(entry => entry.date === dateString);
            const summary = this.calculateDailySummary(dayEntries);
            
            days.push(date.toLocaleDateString('en-US', {weekday: 'short'}));
            weeklyCalories.push(Math.round(summary.calories));
        }

        this.charts.weekly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Calories',
                    data: weeklyCalories,
                    backgroundColor: '#1FB8CD'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Navigation methods
    changeDate(days) {
        const date = new Date(this.currentDate);
        date.setDate(date.getDate() + days);
        this.currentDate = date.toISOString().split('T')[0];
        
        const dateInput = document.getElementById('currentDate');
        if (dateInput) {
            dateInput.value = this.currentDate;
        }
        
        this.renderDailyView();
    }

    changeWeek(weeks) {
        const date = new Date(this.currentWeekStart);
        date.setDate(date.getDate() + (weeks * 7));
        this.currentWeekStart = this.getWeekStart(date);
        this.renderWeeklyView();
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff)).toISOString().split('T')[0];
    }

    setCurrentDate() {
        const dateInput = document.getElementById('currentDate');
        if (dateInput) {
            dateInput.value = this.currentDate;
        }
    }

    // Modal management
    openAddEntryModal(entry = null) {
        console.log('Opening add entry modal', entry ? 'for editing' : 'for new entry');
        
        const modal = document.getElementById('addEntryModal');
        const form = document.getElementById('entryForm');
        
        if (!modal || !form) {
            console.error('Modal elements not found');
            return;
        }
        
        if (entry) {
            this.currentEditingEntry = entry;
            document.getElementById('modalTitle').textContent = 'Edit Food Entry';
            document.getElementById('saveEntry').textContent = 'Update Entry';
            this.populateEntryForm(entry);
        } else {
            this.currentEditingEntry = null;
            document.getElementById('modalTitle').textContent = 'Add Food Entry';
            document.getElementById('saveEntry').textContent = 'Add Entry';
            form.reset();
            document.getElementById('entryDate').value = this.currentDate;
        }
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = form.querySelector('input, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    openProfileModal() {
        const modal = document.getElementById('profileModal');
        if (!modal) return;
        
        this.populateProfileForm();
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    closeModal(modalId) {
        console.log('Closing modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            this.currentEditingEntry = null;
        }
    }

    // Form population
    populateEntryForm(entry) {
        const fields = {
            'entryDate': entry.date,
            'entryMealTime': entry.mealTime,
            'entryFood': entry.foodName,
            'entryServing': entry.servingSize,
            'entryCalories': entry.calories,
            'entryProtein': entry.protein,
            'entryCarbs': entry.carbs,
            'entryFat': entry.fat,
            'entryFiber': entry.fiber || 0,
            'entryWater': entry.waterIntake || 0,
            'entryNotes': entry.notes || ''
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
    }

    populateProfileForm() {
        const fields = {
            'targetCalories': this.profile.calories,
            'targetProtein': this.profile.protein,
            'targetCarbs': this.profile.carbs,
            'targetFat': this.profile.fat,
            'targetFiber': this.profile.fiber,
            'targetWater': this.profile.water
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
    }

    populatePresetFoods() {
        const select = document.getElementById('presetFoods');
        if (!select) return;
        
        select.innerHTML = '<option value="">Choose from Indian foods database...</option>';
        
        const categories = [...new Set(this.indianFoods.map(food => food.category))];
        
        categories.forEach(category => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = this.capitalizeFirst(category);
            
            this.indianFoods
                .filter(food => food.category === category)
                .forEach(food => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify(food);
                    option.textContent = food.name;
                    optgroup.appendChild(option);
                });
            
            select.appendChild(optgroup);
        });
    }

    selectPresetFood(event) {
        if (!event.target.value) return;
        
        try {
            const food = JSON.parse(event.target.value);
            
            const fields = {
                'entryFood': food.name,
                'entryServing': food.serving,
                'entryCalories': food.calories,
                'entryProtein': food.protein,
                'entryCarbs': food.carbs,
                'entryFat': food.fat,
                'entryFiber': food.fiber || 0
            };

            Object.entries(fields).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = value;
                }
            });
            
            event.target.selectedIndex = 0;
            this.showStatus(`Selected ${food.name} 🥗`, 'success');
        } catch (error) {
            console.error('Error selecting preset food:', error);
        }
    }

    // Entry management
    saveEntry(event) {
        event.preventDefault();
        console.log('Saving entry...');
        
        const formData = this.getFormData();
        if (!this.validateEntryForm(formData)) return;

        const entry = {
            id: this.currentEditingEntry?.id || this.generateId(),
            date: formData.entryDate,
            mealTime: formData.entryMealTime,
            foodName: formData.entryFood,
            servingSize: formData.entryServing,
            calories: parseFloat(formData.entryCalories) || 0,
            protein: parseFloat(formData.entryProtein) || 0,
            carbs: parseFloat(formData.entryCarbs) || 0,
            fat: parseFloat(formData.entryFat) || 0,
            fiber: parseFloat(formData.entryFiber) || 0,
            waterIntake: parseFloat(formData.entryWater) || 0,
            notes: formData.entryNotes || '',
            timestamp: new Date().toISOString()
        };

        if (this.currentEditingEntry) {
            const index = this.entries.findIndex(e => e.id === entry.id);
            if (index !== -1) {
                this.entries[index] = entry;
                this.showStatus('Entry updated! ✏️', 'success');
            }
        } else {
            this.entries.push(entry);
            this.showStatus('Entry added! ➕', 'success');
        }

        this.saveData();
        this.renderDailyView();
        this.renderWeeklyView();
        this.closeModal('addEntryModal');
        
        console.log('Entry saved:', entry);
    }

    getFormData() {
        const form = document.getElementById('entryForm');
        const formData = {};
        
        if (form) {
            const elements = form.querySelectorAll('input, select, textarea');
            elements.forEach(element => {
                if (element.id) {
                    formData[element.id] = element.value;
                }
            });
        }
        
        return formData;
    }

    validateEntryForm(formData) {
        const required = ['entryFood', 'entryDate', 'entryMealTime', 'entryServing', 'entryCalories'];
        
        for (const field of required) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                this.showStatus('Please fill in all required fields', 'error');
                return false;
            }
        }
        
        const calories = parseFloat(formData.entryCalories);
        if (isNaN(calories) || calories < 0) {
            this.showStatus('Calories must be a positive number', 'error');
            return false;
        }
        
        return true;
    }

    editEntry(entry) {
        this.openAddEntryModal(entry);
    }

    deleteEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;
        
        if (confirm(`Delete "${entry.foodName}"?`)) {
            this.entries = this.entries.filter(e => e.id !== entryId);
            this.saveData();
            this.renderDailyView();
            this.renderWeeklyView();
            this.showStatus('Entry deleted! 🗑️', 'success');
        }
    }

    saveProfile(event) {
        event.preventDefault();
        
        const formData = this.getProfileFormData();
        
        this.profile = {
            calories: Math.max(500, parseInt(formData.targetCalories) || 2000),
            protein: Math.max(10, parseInt(formData.targetProtein) || 150),
            carbs: Math.max(20, parseInt(formData.targetCarbs) || 250),
            fat: Math.max(10, parseInt(formData.targetFat) || 65),
            fiber: Math.max(5, parseInt(formData.targetFiber) || 25),
            water: Math.max(500, parseInt(formData.targetWater) || 2000)
        };

        this.saveData();
        this.loadProfile();
        this.renderDailyView();
        this.closeModal('profileModal');
        this.showStatus('Profile saved! ⚙️', 'success');
    }

    getProfileFormData() {
        const form = document.getElementById('profileForm');
        const formData = {};
        
        if (form) {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                if (input.id) {
                    formData[input.id] = input.value;
                }
            });
        }
        
        return formData;
    }

    loadProfile() {
        const targets = {
            'caloriesTarget': this.profile.calories,
            'proteinTarget': this.profile.protein,
            'carbsTarget': this.profile.carbs,
            'fatTarget': this.profile.fat,
            'fiberTarget': this.profile.fiber,
            'waterTarget': this.profile.water
        };

        Object.entries(targets).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Water tracking
    addWater(amount) {
        console.log('Adding water:', amount);
        
        const waterEntry = {
            id: this.generateId(),
            date: this.currentDate,
            mealTime: 'snack',
            foodName: 'Water',
            servingSize: `${amount}ml`,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            waterIntake: amount,
            notes: 'Quick add water',
            timestamp: new Date().toISOString()
        };

        this.entries.push(waterEntry);
        this.saveData();
        this.renderDailyView();
        this.showStatus(`Added ${amount}ml water! 💧`, 'success');
    }

    // Rendering
    renderDailyView() {
        const dayEntries = this.entries.filter(entry => entry.date === this.currentDate);
        const summary = this.calculateDailySummary(dayEntries);
        
        this.updateSummaryCards(summary);
        this.renderMealSections(dayEntries);
        
        console.log(`Daily view rendered: ${dayEntries.length} entries for ${this.currentDate}`);
    }

    updateSummaryCards(summary) {
        const fields = {
            'caloriesCurrent': Math.round(summary.calories),
            'proteinCurrent': Math.round(summary.protein),
            'carbsCurrent': Math.round(summary.carbs),
            'fatCurrent': Math.round(summary.fat),
            'fiberCurrent': Math.round(summary.fiber),
            'waterCurrent': Math.round(summary.water)
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update progress bars
        this.updateProgressBar('caloriesProgress', summary.calories, this.profile.calories);
        this.updateProgressBar('proteinProgress', summary.protein, this.profile.protein);
        this.updateProgressBar('carbsProgress', summary.carbs, this.profile.carbs);
        this.updateProgressBar('fatProgress', summary.fat, this.profile.fat);
        this.updateProgressBar('fiberProgress', summary.fiber, this.profile.fiber);
    }

    updateProgressBar(elementId, current, target) {
        const progressBar = document.getElementById(elementId);
        if (!progressBar) return;
        
        const percentage = Math.min((current / target) * 100, 100);
        progressBar.style.width = `${percentage}%`;
    }

    renderMealSections(dayEntries) {
        const mealTypes = ['breakfast', 'mid-morning', 'lunch', 'snack', 'dinner'];
        
        mealTypes.forEach(mealType => {
            const mealSection = document.querySelector(`[data-meal="${mealType}"]`);
            if (!mealSection) return;
            
            const mealEntries = dayEntries.filter(entry => entry.mealTime === mealType);
            const mealContainer = mealSection.querySelector('.meal-entries');
            const caloriesDisplay = mealSection.querySelector('.meal-calories');
            
            const mealCalories = mealEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
            
            if (caloriesDisplay) {
                caloriesDisplay.textContent = `${Math.round(mealCalories)} kcal`;
            }
            
            if (mealContainer) {
                mealContainer.innerHTML = '';
                
                if (mealEntries.length === 0) {
                    mealContainer.innerHTML = `
                        <div class="empty-meal">
                            <p>No entries for this meal.</p>
                            <button class="btn btn--outline btn--sm add-food-btn">Add food</button>
                        </div>
                    `;
                } else {
                    mealEntries.forEach(entry => {
                        const entryElement = this.createEntryElement(entry);
                        mealContainer.appendChild(entryElement);
                    });
                }
            }
        });
    }

    createEntryElement(entry) {
        const div = document.createElement('div');
        div.className = 'entry-item';
        div.dataset.entryId = entry.id;
        
        div.innerHTML = `
            <div class="entry-details">
                <h4>${this.escapeHtml(entry.foodName)}</h4>
                <div class="entry-meta">
                    <span>📏 ${this.escapeHtml(entry.servingSize)}</span>
                    <span>🔥 ${entry.calories} kcal</span>
                    <span>💪 ${entry.protein}g</span>
                    <span>🌾 ${entry.carbs}g</span>
                    <span>🥑 ${entry.fat}g</span>
                    ${entry.fiber > 0 ? `<span>🌿 ${entry.fiber}g fiber</span>` : ''}
                    ${entry.waterIntake > 0 ? `<span>💧 ${entry.waterIntake}ml</span>` : ''}
                    ${entry.notes ? `<span title="${this.escapeHtml(entry.notes)}">📝</span>` : ''}
                </div>
            </div>
            <div class="entry-actions">
                <button class="edit-entry-btn" title="Edit entry">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="delete-entry-btn" title="Delete entry">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
        `;
        
        return div;
    }

    renderWeeklyView() {
        const weekStart = new Date(this.currentWeekStart);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekRangeElement = document.getElementById('weekRange');
        if (weekRangeElement) {
            weekRangeElement.textContent = 
                `Week of ${weekStart.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - ${weekEnd.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;
        }
        
        const weeklyGrid = document.getElementById('weeklyGrid');
        if (!weeklyGrid) return;
        
        weeklyGrid.innerHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            const dayEntries = this.entries.filter(entry => entry.date === dateString);
            const summary = this.calculateDailySummary(dayEntries);
            
            const dayCard = this.createDayCard(date, summary, dayEntries.length);
            weeklyGrid.appendChild(dayCard);
        }
    }

    createDayCard(date, summary, entryCount) {
        const div = document.createElement('div');
        div.className = 'day-card';
        div.style.cursor = 'pointer';
        
        const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
        
        div.innerHTML = `
            <div class="day-header">
                <div class="day-date">${date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}${isToday ? ' 🔴' : ''}</div>
                <h3 class="day-name">${date.toLocaleDateString('en-US', {weekday: 'short'})}</h3>
            </div>
            <div class="day-summary">
                <div class="day-calories">${Math.round(summary.calories)} kcal</div>
                <div class="day-macros">
                    <div>💪 ${Math.round(summary.protein)}g</div>
                    <div>🌾 ${Math.round(summary.carbs)}g</div>
                    <div>🥑 ${Math.round(summary.fat)}g</div>
                </div>
                <div class="entry-count">
                    ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}
                </div>
            </div>
        `;
        
        div.addEventListener('click', () => {
            this.currentDate = date.toISOString().split('T')[0];
            const dateInput = document.getElementById('currentDate');
            if (dateInput) {
                dateInput.value = this.currentDate;
            }
            this.switchTab('daily');
            this.renderDailyView();
        });
        
        return div;
    }

    calculateDailySummary(entries) {
        return entries.reduce((summary, entry) => ({
            calories: summary.calories + (entry.calories || 0),
            protein: summary.protein + (entry.protein || 0),
            carbs: summary.carbs + (entry.carbs || 0),
            fat: summary.fat + (entry.fat || 0),
            fiber: summary.fiber + (entry.fiber || 0),
            water: summary.water + (entry.waterIntake || 0)
        }), {
            calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0
        });
    }

    // Export functions (simplified for working version)
    async exportCSV() {
        if (this.entries.length === 0) {
            this.showStatus('No data to export', 'warning');
            return;
        }

        const headers = ['Date', 'Meal', 'Food', 'Serving', 'Calories', 'Protein', 'Carbs', 'Fat', 'Fiber', 'Water', 'Notes'];
        const csvData = [headers];
        
        this.entries.forEach(entry => {
            csvData.push([
                entry.date,
                entry.mealTime,
                entry.foodName,
                entry.servingSize,
                entry.calories || 0,
                entry.protein || 0,
                entry.carbs || 0,
                entry.fat || 0,
                entry.fiber || 0,
                entry.waterIntake || 0,
                entry.notes || ''
            ]);
        });
        
        const csvContent = '\uFEFF' + csvData.map(row => row.join(',')).join('\n');
        this.downloadFile(csvContent, `diet-tracker-${this.getCurrentDateString()}.csv`, 'text/csv');
        this.showStatus('CSV exported successfully! 📊', 'success');
    }

    async exportXLSX() {
        this.showStatus('Excel export coming soon! Use CSV for now.', 'warning');
    }

    
    async exportPDF() {
        try {
            this.showStatus('Preparing PDF report...', 'info');
            // Create a hidden report container
            const report = document.createElement('div');
            report.id = 'pdfReportContainer';
            report.style.padding = '20px';
            report.style.fontFamily = 'Arial, sans-serif';
            report.innerHTML = `
                <div style="text-align:center; margin-bottom:10px;">
                    <h1>Diet Tracker Report</h1>
                    <div>${new Date().toLocaleString()}</div>
                </div>
                <div id="reportSummary" style="margin-top:15px;">
                    <h2>Summary</h2>
                    <div id="summaryContent"></div>
                </div>
                <div id="reportCharts" style="margin-top:15px;">
                    <h2>Charts</h2>
                    <div id="chartsWrapper" style="display:flex; flex-direction:column; gap:12px;"></div>
                </div>
                <div id="reportEntries" style="margin-top:15px;">
                    <h2>Entries</h2>
                    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; font-size:12px;">
                        <thead>
                            <tr>
                                <th>Date</th><th>Meal</th><th>Food</th><th>Serving</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Fiber</th><th>Water(ml)</th>
                            </tr>
                        </thead>
                        <tbody id="entriesBody"></tbody>
                    </table>
                </div>
            `;

            document.body.appendChild(report);

            // Populate summary
            const totals = (function(entries){ const t={calories:0,protein:0,carbs:0,fat:0,fiber:0,water:0}; if(!Array.isArray(entries)) return t; entries.forEach(e=>{ t.calories+=Number(e.calories)||0; t.protein+=Number(e.protein)||0; t.carbs+=Number(e.carbs)||0; t.fat+=Number(e.fat)||0; t.fiber+=Number(e.fiber)||0; t.water+=Number(e.water_intake)||0; }); for(let k in t) t[k]=Math.round(t[k]*100)/100; return t;})(this.entries); // { calories, protein, carbs, fat, fiber, water }
            const summaryContent = report.querySelector('#summaryContent');
            summaryContent.innerHTML = `
                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                    <div style="min-width:120px;"><strong>Calories:</strong><div>${totals.calories}</div></div>
                    <div style="min-width:120px;"><strong>Protein:</strong><div>${totals.protein} g</div></div>
                    <div style="min-width:120px;"><strong>Carbs:</strong><div>${totals.carbs} g</div></div>
                    <div style="min-width:120px;"><strong>Fat:</strong><div>${totals.fat} g</div></div>
                    <div style="min-width:120px;"><strong>Fiber:</strong><div>${totals.fiber} g</div></div>
                    <div style="min-width:120px;"><strong>Water:</strong><div>${totals.water} ml</div></div>
                </div>
            `;

            // Add chart images (capture canvases if available)
            const chartIds = ['caloriesChart', 'macrosChart', 'weeklyChart'];
            const chartsWrapper = report.querySelector('#chartsWrapper');
            chartIds.forEach(id => {
                const c = document.getElementById(id);
                if (c && c.toDataURL) {
                    const img = new Image();
                    img.src = c.toDataURL('image/png');
                    img.style.maxWidth = '100%';
                    chartsWrapper.appendChild(img);
                }
            });

            // Populate entries table
            const tbody = report.querySelector('#entriesBody');
            const rows = this.entries || [];
            rows.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${r.date || ''}</td>
                    <td>${r.meal_time || ''}</td>
                    <td>${r.food_name || ''}</td>
                    <td>${r.serving_size || ''}</td>
                    <td>${r.calories || ''}</td>
                    <td>${r.protein || ''}</td>
                    <td>${r.carbs || ''}</td>
                    <td>${r.fat || ''}</td>
                    <td>${r.fiber || ''}</td>
                    <td>${r.water_intake || ''}</td>
                `;
                tbody.appendChild(tr);
            });

            // Use html2pdf to export
            const opt = {
                margin: 0.4,
                filename: 'diet_tracker_report.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(report).save();

            // Cleanup
            document.body.removeChild(report);
            this.showStatus('PDF report ready.', 'success');
        } catch (err) {
            console.error('PDF export error', err);
            this.showStatus('Failed to generate PDF. Try again.', 'error');
        }
    }


    downloadSheetsTemplate() {
        const templateData = [
            ['Date', 'Meal', 'Food', 'Serving', 'Calories', 'Protein', 'Carbs', 'Fat', 'Fiber', 'Water', 'Notes'],
            ['2025-08-15', 'breakfast', 'Roti', '2 pieces', 238, 6, 36, 4, 4, 0, 'With ghee'],
            ['2025-08-15', 'lunch', 'Rice', '1 cup', 120, 2, 30, 0, 0, 300, ''],
            ['2025-08-15', 'snack', 'Banana', '1 medium', 80, 1, 20, 0, 2, 200, '']
        ];
        
        const csvContent = '\uFEFF' + templateData.map(row => row.join(',')).join('\n');
        this.downloadFile(csvContent, 'diet-tracker-template.csv', 'text/csv');
        this.showStatus('Template downloaded! Upload to Google Sheets.', 'success');
    }

    triggerCSVImport() {
        const fileInput = document.getElementById('csvFileInput');
        if (fileInput) fileInput.click();
    }

    async handleCSVImport(event) {
        this.showStatus('CSV import coming soon!', 'warning');
        event.target.value = '';
    }

    noop() {
        const backupData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            entries: this.entries,
            profile: this.profile
        };
        
        const jsonContent = JSON.stringify(backupData, null, 2);
        this.downloadFile(jsonContent, `diet-tracker-backup-${this.getCurrentDateString()}.json`, 'application/json');
        this.showStatus('Backup created! 💾', 'success');
    }

    triggerJSONRestore() {
        const fileInput = document.getElementById('jsonFileInput');
        if (fileInput) fileInput.click();
    }

    async handleJSONRestore(event) {
        this.showStatus('JSON restore coming soon!', 'warning');
        event.target.value = '';
    }

    clearAllData() {
        if (confirm('Delete all data? This cannot be undone!')) {
            this.entries = [];
            this.saveData();
            this.renderDailyView();
            this.renderWeeklyView();
            this.showStatus('All data cleared! 🗑️', 'success');
        }
    }

    // Theme management
    toggleTheme() {
        const body = document.body;
        const currentScheme = body.getAttribute('data-color-scheme');
        const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-color-scheme', newScheme);
        localStorage.setItem('theme', newScheme);
        
        this.showStatus(`${newScheme} theme activated! ${newScheme === 'dark' ? '🌙' : '☀️'}`, 'success');
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-color-scheme', savedTheme);
        }
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCurrentDateString() {
        return new Date().toISOString().split('T')[0];
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    showBackupOptions() {
        alert(`🔄 Backup & Restore Options:

💾 Backup JSON: Complete backup of all data
📊 Export CSV: Spreadsheet format
📋 Template: Google Sheets template

All data is stored locally for privacy!`);
    }

    showStatus(message, type = 'success') {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        const statusEl = document.getElementById('exportStatus');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `export-status ${type}`;
            statusEl.style.display = 'block';
            
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 5000);
        }
    }

    // Data persistence
    saveData() {
        try {
            const data = {
                entries: this.entries,
                profile: this.profile,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem('dietTrackerData', JSON.stringify(data));
            console.log(`Data saved: ${this.entries.length} entries`);
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('Error saving data', 'error');
        }
    }

    async loadData() {
        try {
            const savedData = localStorage.getItem('dietTrackerData');
            
            if (savedData) {
                const data = JSON.parse(savedData);
                this.entries = data.entries || [];
                this.profile = { ...this.profile, ...(data.profile || {}) };
                console.log(`Data loaded: ${this.entries.length} entries`);
            } else {
                this.loadSampleData();
                console.log('Sample data loaded');
            }
        } catch (error) {
            console.error('Load error:', error);
            this.loadSampleData();
        }
    }

    loadSampleData() {
        const today = this.currentDate;
        
        this.entries = [
            {
                id: this.generateId(),
                date: today,
                mealTime: 'breakfast',
                foodName: 'Roti (1 medium)',
                servingSize: '2 pieces',
                calories: 238,
                protein: 6,
                carbs: 36,
                fat: 4,
                fiber: 4,
                waterIntake: 0,
                notes: 'With ghee',
                timestamp: new Date().toISOString()
            },
            {
                id: this.generateId(),
                date: today,
                mealTime: 'breakfast',
                foodName: 'Dal (1 cup)',
                servingSize: '1 cup',
                calories: 200,
                protein: 15,
                carbs: 25,
                fat: 1,
                fiber: 7,
                waterIntake: 0,
                notes: '',
                timestamp: new Date().toISOString()
            },
            {
                id: this.generateId(),
                date: today,
                mealTime: 'snack',
                foodName: 'Banana (1 medium)',
                servingSize: '1 piece',
                calories: 80,
                protein: 1,
                carbs: 20,
                fat: 0,
                fiber: 2,
                waterIntake: 200,
                notes: 'Mid-morning snack',
                timestamp: new Date().toISOString()
            }
        ];
        
        this.saveData();
    }    // Calculate totals across current entries
    calculateTotals() {
        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 };
        if (!Array.isArray(this.entries)) return totals;
        this.entries.forEach(e => {
            totals.calories += Number(e.calories) || 0;
            totals.protein += Number(e.protein) || 0;
            totals.carbs += Number(e.carbs) || 0;
            totals.fat += Number(e.fat) || 0;
            totals.fiber += Number(e.fiber) || 0;
            totals.water += Number(e.water_intake) || 0;
        }
}

// Initialize the app


);
        // Round totals
        for (let k in totals) totals[k] = Math.round(totals[k]*100)/100;
        return totals;
    }

console.log('🚀 Diet Tracker script loaded');
const dietTracker = new DietTracker();
window.dietTracker = dietTracker;

// Handle deep linking
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && ['daily', 'weekly', 'analytics', 'export'].includes(hash)) {
        setTimeout(() => {
            dietTracker.switchTab(hash);
        }, 1000);
    }
});

console.log('✅ Diet Tracker ready');