/**
 * Diet Tracker Application - Production Ready with Diet Planner Integration
 * A comprehensive nutrition tracking app with Indian foods database
 * Features: Entry management, export functionality, charts, offline storage, meal plan import
 * 
 * @version 1.2.0
 * @author TheDietPlanner.com
 */

// Global helper function for safe numeric parsing
function safeNumber(v) {
    if (v == null || v == undefined) return 0;
    if (typeof v === 'number') return isNaN(v) ? 0 : v;
    const n = parseFloat(String(v).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
}

// Diet Planner Integration - Meal Plan Import System
// Integration keys to check for incoming data
const INTEGRATION_KEYS = [
    'dietplanner_integration_v3',
    'planned_meals_v1',
    'diettracker_import', 
    'meal_plan_transfer'
];

// Check for incoming meal plan data on page load
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure Diet Tracker is initialized first
    setTimeout(() => {
        checkForIncomingMealPlan();
    }, 1000);
});

// Function to check and load incoming meal plan data
function checkForIncomingMealPlan() {
    let integrationData = null;
    let usedKey = null;

    // Check all possible integration keys
    for (const key of INTEGRATION_KEYS) {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const data = JSON.parse(stored);
                if (data && data.mealPlan && data.userProfile) {
                    integrationData = data;
                    usedKey = key;
                    break;
                }
            }
        } catch (error) {
            console.log(`Error parsing ${key}:`, error);
        }
    }

    // If data found, process it
    if (integrationData) {
        console.log('✅ Found meal plan data from Diet Planner');
        processMealPlanData(integrationData, usedKey);
    }
}

// Function to process and apply the meal plan data
function processMealPlanData(data, usedKey) {
    try {
        // Show import message
        showImportMessage('🔄 Importing your meal plan from Diet Planner...', 'info');

        // Wait for dietTracker instance to be available
        const waitForDietTracker = setInterval(() => {
            if (window.dietTracker) {
                clearInterval(waitForDietTracker);
                
                // Set daily nutrition targets
                if (data.dailyTargets) {
                    updateNutritionTargets(data.dailyTargets);
                }

                // Import meal plan
                if (data.mealPlan) {
                    importWeeklyMealPlan(data.mealPlan);
                }

                // Clean up the integration data after successful import
                localStorage.removeItem(usedKey);
                
                // Show success message
                setTimeout(() => {
                    showImportMessage('✅ Meal plan imported successfully from Diet Planner!', 'success');
                    
                    // Hide message after 4 seconds
                    setTimeout(() => {
                        hideImportMessage();
                    }, 4000);
                }, 1000);

                console.log('✅ Meal plan imported successfully from Diet Planner');
            }
        }, 100);

        // Timeout after 5 seconds if dietTracker not found
        setTimeout(() => {
            clearInterval(waitForDietTracker);
        }, 5000);
        
    } catch (error) {
        console.error('Error importing meal plan:', error);
        showImportMessage('❌ Error importing meal plan. Please try again.', 'error');
        
        setTimeout(() => {
            hideImportMessage();
        }, 5000);
    }
}

// Function to update nutrition targets in your Diet Tracker
function updateNutritionTargets(targets) {
    try {
        // Update the dietTracker profile
        if (window.dietTracker) {
            window.dietTracker.profile = {
                calories: safeNumber(targets.calories) || 2000,
                protein: safeNumber(targets.protein) || 150,
                carbs: safeNumber(targets.carbs) || 250,
                fat: safeNumber(targets.fat) || 65,
                fiber: safeNumber(targets.fiber) || 25,
                water: safeNumber(targets.water) || 2000
            };
            
            // Save the updated profile
            window.dietTracker.saveData();
            window.dietTracker.loadProfile();
            
            console.log('✅ Nutrition targets updated:', window.dietTracker.profile);
        }
    } catch (error) {
        console.error('Error updating nutrition targets:', error);
    }
}

// Function to import the weekly meal plan
function importWeeklyMealPlan(mealPlan) {
    if (!window.dietTracker) return;
    
    const days = Object.keys(mealPlan);
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    let importedCount = 0;
    
    days.forEach(day => {
        mealTypes.forEach(mealType => {
            const meal = mealPlan[day][mealType];
            if (meal) {
                // Add meal entry to your Diet Tracker
                const success = addMealEntryToTracker(day, mealType, meal);
                if (success) importedCount++;
            }
        });
    });
    
    // Refresh the views
    if (importedCount > 0) {
        window.dietTracker.renderDailyView();
        window.dietTracker.renderWeeklyView();
        console.log(`✅ Imported ${importedCount} meal entries`);
    }
}

// Function to add a meal entry to your Diet Tracker
function addMealEntryToTracker(day, mealType, meal) {
    if (!window.dietTracker) return false;
    
    try {
        const mealData = {
            id: window.dietTracker.generateId(),
            date: convertDayToDate(day),
            mealTime: mealType === 'snacks' ? 'snack' : mealType, // Match your meal time naming
            foodName: meal.title,
            servingSize: meal.serving_size || '1 serving',
            calories: safeNumber(meal.calories),
            protein: safeNumber(meal.protein),
            carbs: safeNumber(meal.carbs),
            fat: safeNumber(meal.fat),
            fiber: safeNumber(meal.fiber),
            waterIntake: 0, // Default water intake
            notes: 'Imported from Diet Planner',
            timestamp: new Date().toISOString()
        };

        // Add to entries array
        window.dietTracker.entries.push(mealData);
        
        return true;
    } catch (error) {
        console.error('Error adding meal entry:', error);
        return false;
    }
}

// Helper function to convert day name to date
function convertDayToDate(dayName) {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const dayMap = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    
    const targetDay = dayMap[dayName];
    if (targetDay === undefined) return today.toISOString().split('T')[0];
    
    const daysToAdd = (targetDay - currentDay + 7) % 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    
    return targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Function to show import message
function showImportMessage(message, type = 'info') {
    // Remove any existing message
    hideImportMessage();
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.id = 'import-message';
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        backdrop-filter: blur(8px);
        font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        font-size: 14px;
        line-height: 1.4;
    `;
    
    // Set message and style based on type
    messageElement.textContent = message;
    
    switch(type) {
        case 'success':
            messageElement.style.background = 'linear-gradient(135deg, #059669, #047857)';
            messageElement.style.border = '1px solid rgba(5, 150, 105, 0.3)';
            break;
        case 'error':
            messageElement.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
            messageElement.style.border = '1px solid rgba(220, 38, 38, 0.3)';
            break;
        case 'info':
        default:
            messageElement.style.background = 'linear-gradient(135deg, #1FB8CD, #0891b2)';
            messageElement.style.border = '1px solid rgba(31, 184, 205, 0.3)';
    }
    
    document.body.appendChild(messageElement);
    
    // Animate in
    setTimeout(() => {
        messageElement.style.transform = 'translateX(0)';
        messageElement.style.opacity = '1';
    }, 10);
}

// Function to hide import message
function hideImportMessage() {
    const messageElement = document.getElementById('import-message');
    if (messageElement) {
        messageElement.style.transform = 'translateX(100%)';
        messageElement.style.opacity = '0';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }
}

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
        this.pdfLoaded = false;

        // Make instance globally available for integration
        window.dietTracker = this;

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

    // Initialize the application with defensive programming
    async init() {
        console.log('🚀 Initializing Diet Tracker...');
        try {
            // Load data first
            await this.loadData();

            // Auto-fill today's date in form to prevent validation blocking
            this.autoFillDate();

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

    // Auto-fill date input to prevent form validation blocking
    autoFillDate() {
        try {
            const dateInput = document.getElementById('entryDate') || document.querySelector('input[type="date"]');
            if (dateInput && !dateInput.value) {
                dateInput.value = this.currentDate;
                console.log('✅ Auto-filled date input with today:', this.currentDate);
            }
        } catch (error) {
            console.error('Error auto-filling date:', error);
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

    // Setup all event listeners with defensive programming
    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');
        try {
            // Tab navigation
            this.setupTabNavigation();

            // Button handlers
            this.setupButtonHandlers();

            // Modal handlers
            this.setupModalHandlers();

            // Form handlers
            this.setupFormHandlers();

            // Navigation handlers
            this.setupNavigationHandlers();

            // Export handlers (simplified)
            this.setupExportHandlers();

            // Quick actions
            this.setupQuickActions();

            // Keyboard shortcuts
            this.setupKeyboardShortcuts();

            console.log('✅ Event listeners set up successfully');
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }

    setupTabNavigation() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tabName = button.getAttribute('data-tab');
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
                this.openAddEntryModal();
            });
        }

        // Profile button
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openProfileModal();
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

    // Simplified export handlers - only CSV and PDF
    setupExportHandlers() {
        const exportButtons = {
            'exportCSV': () => this.exportCSV(),
            'exportPDF': () => this.exportPDF()
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
    }

    setupQuickActions() {
        // Water tracking buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('water-btn')) {
                e.preventDefault();
                const amount = safeNumber(e.target.getAttribute('data-amount'));
                if (amount > 0) {
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
        try {
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
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    // Charts loading and rendering with defensive programming
    async loadAndRenderCharts() {
        if (!this.chartsLoaded) {
            try {
                await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js');
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
            console.warn('Chart.js not available');
            return;
        }

        try {
            this.renderCaloriesChart();
            this.renderMacrosChart();
            this.renderWeeklyChart();
        } catch (error) {
            console.error('Error rendering charts:', error);
        }
    }

    renderCaloriesChart() {
        const ctx = document.getElementById('caloriesChart');
        if (!ctx) return;

        if (this.charts.calories) {
            this.charts.calories.destroy();
        }

        try {
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
                calories.push(Math.round(safeNumber(summary.calories)));
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
                        data: Array(7).fill(safeNumber(this.profile.calories)),
                        borderColor: '#FFC185',
                        borderDash: [5, 5],
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering calories chart:', error);
        }
    }

    renderMacrosChart() {
        const ctx = document.getElementById('macrosChart');
        if (!ctx) return;

        if (this.charts.macros) {
            this.charts.macros.destroy();
        }

        try {
            const todayEntries = this.entries.filter(entry => entry.date === this.currentDate);
            const summary = this.calculateDailySummary(todayEntries);

            this.charts.macros = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Protein', 'Carbs', 'Fat'],
                    datasets: [{
                        data: [
                            safeNumber(summary.protein) * 4,
                            safeNumber(summary.carbs) * 4,
                            safeNumber(summary.fat) * 9
                        ],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering macros chart:', error);
        }
    }

    renderWeeklyChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }

        try {
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
                weeklyCalories.push(Math.round(safeNumber(summary.calories)));
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
                        legend: { position: 'bottom' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        } catch (error) {
            console.error('Error rendering weekly chart:', error);
        }
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
        try {
            const modal = document.getElementById('addEntryModal');
            const form = document.getElementById('entryForm');
            if (!modal || !form) {
                console.error('Modal elements not found');
                return;
            }

            if (entry) {
                this.currentEditingEntry = entry;
                const modalTitle = document.getElementById('modalTitle');
                const saveBtn = document.getElementById('saveEntry');
                if (modalTitle) modalTitle.textContent = 'Edit Food Entry';
                if (saveBtn) saveBtn.textContent = 'Update Entry';
                this.populateEntryForm(entry);
            } else {
                this.currentEditingEntry = null;
                const modalTitle = document.getElementById('modalTitle');
                const saveBtn = document.getElementById('saveEntry');
                if (modalTitle) modalTitle.textContent = 'Add Food Entry';
                if (saveBtn) saveBtn.textContent = 'Add Entry';
                form.reset();

                const entryDate = document.getElementById('entryDate');
                if (entryDate) entryDate.value = this.currentDate;
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
        } catch (error) {
            console.error('Error opening add entry modal:', error);
        }
    }

    openProfileModal() {
        try {
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
        } catch (error) {
            console.error('Error opening profile modal:', error);
        }
    }

    closeModal(modalId) {
        try {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
                this.currentEditingEntry = null;
            }
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    }

    // Form population with safe numeric parsing
    populateEntryForm(entry) {
        const fields = {
            'entryDate': entry.date,
            'entryMealTime': entry.mealTime,
            'entryFood': entry.foodName,
            'entryServing': entry.servingSize,
            'entryCalories': safeNumber(entry.calories),
            'entryProtein': safeNumber(entry.protein),
            'entryCarbs': safeNumber(entry.carbs),
            'entryFat': safeNumber(entry.fat),
            'entryFiber': safeNumber(entry.fiber),
            'entryWater': safeNumber(entry.waterIntake),
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
            'targetCalories': safeNumber(this.profile.calories),
            'targetProtein': safeNumber(this.profile.protein),
            'targetCarbs': safeNumber(this.profile.carbs),
            'targetFat': safeNumber(this.profile.fat),
            'targetFiber': safeNumber(this.profile.fiber),
            'targetWater': safeNumber(this.profile.water)
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

        try {
            select.innerHTML = '<option value="">-- Select a preset food --</option>';

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
        } catch (error) {
            console.error('Error populating preset foods:', error);
        }
    }

    selectPresetFood(event) {
        if (!event.target.value) return;

        try {
            const food = JSON.parse(event.target.value);

            const fields = {
                'entryFood': food.name,
                'entryServing': food.serving,
                'entryCalories': safeNumber(food.calories),
                'entryProtein': safeNumber(food.protein),
                'entryCarbs': safeNumber(food.carbs),
                'entryFat': safeNumber(food.fat),
                'entryFiber': safeNumber(food.fiber)
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

    // Entry management with safe numeric parsing
    saveEntry(event) {
        event.preventDefault();
        console.log('Saving entry...');

        try {
            const formData = this.getFormData();
            if (!this.validateEntryForm(formData)) return;

            const entry = {
                id: this.currentEditingEntry?.id || this.generateId(),
                date: formData.entryDate,
                mealTime: formData.entryMealTime,
                foodName: formData.entryFood,
                servingSize: formData.entryServing,
                calories: safeNumber(formData.entryCalories),
                protein: safeNumber(formData.entryProtein),
                carbs: safeNumber(formData.entryCarbs),
                fat: safeNumber(formData.entryFat),
                fiber: safeNumber(formData.entryFiber),
                waterIntake: safeNumber(formData.entryWater),
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
        } catch (error) {
            console.error('Error saving entry:', error);
            this.showStatus('Error saving entry', 'error');
        }
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
        const required = ['entryFood', 'entryDate', 'entryMealTime', 'entryServing'];

        for (const field of required) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                this.showStatus('Please fill in all required fields', 'error');
                return false;
            }
        }

        const calories = safeNumber(formData.entryCalories);
        if (calories < 0) {
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

        try {
            const formData = this.getProfileFormData();

            this.profile = {
                calories: Math.max(500, safeNumber(formData.targetCalories) || 2000),
                protein: Math.max(10, safeNumber(formData.targetProtein) || 150),
                carbs: Math.max(20, safeNumber(formData.targetCarbs) || 250),
                fat: Math.max(10, safeNumber(formData.targetFat) || 65),
                fiber: Math.max(5, safeNumber(formData.targetFiber) || 25),
                water: Math.max(500, safeNumber(formData.targetWater) || 2000)
            };

            this.saveData();
            this.loadProfile();
            this.renderDailyView();
            this.closeModal('profileModal');
            this.showStatus('Profile saved! ⚙️', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showStatus('Error saving profile', 'error');
        }
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
            'caloriesTarget': safeNumber(this.profile.calories),
            'proteinTarget': safeNumber(this.profile.protein),
            'carbsTarget': safeNumber(this.profile.carbs),
            'fatTarget': safeNumber(this.profile.fat),
            'fiberTarget': safeNumber(this.profile.fiber),
            'waterTarget': safeNumber(this.profile.water)
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
            waterIntake: safeNumber(amount),
            notes: 'Quick add water',
            timestamp: new Date().toISOString()
        };

        this.entries.push(waterEntry);
        this.saveData();
        this.renderDailyView();
        this.showStatus(`Added ${amount}ml water! 💧`, 'success');
    }

    // Rendering with safe numeric handling
    renderDailyView() {
        try {
            const dayEntries = this.entries.filter(entry => entry.date === this.currentDate);
            const summary = this.calculateDailySummary(dayEntries);
            this.updateSummaryCards(summary);
            this.renderMealSections(dayEntries);
        } catch (error) {
            console.error('Error rendering daily view:', error);
        }
    }

    updateSummaryCards(summary) {
        const fields = {
            'caloriesCurrent': Math.round(safeNumber(summary.calories)),
            'proteinCurrent': Math.round(safeNumber(summary.protein)),
            'carbsCurrent': Math.round(safeNumber(summary.carbs)),
            'fatCurrent': Math.round(safeNumber(summary.fat)),
            'fiberCurrent': Math.round(safeNumber(summary.fiber)),
            'waterCurrent': Math.round(safeNumber(summary.water))
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update progress bars with safe numbers
        this.updateProgressBar('caloriesProgress', safeNumber(summary.calories), safeNumber(this.profile.calories));
        this.updateProgressBar('proteinProgress', safeNumber(summary.protein), safeNumber(this.profile.protein));
        this.updateProgressBar('carbsProgress', safeNumber(summary.carbs), safeNumber(this.profile.carbs));
        this.updateProgressBar('fatProgress', safeNumber(summary.fat), safeNumber(this.profile.fat));
        this.updateProgressBar('fiberProgress', safeNumber(summary.fiber), safeNumber(this.profile.fiber));
    }

    updateProgressBar(elementId, current, target) {
        const progressBar = document.getElementById(elementId);
        if (!progressBar) return;

        const safeCurrent = safeNumber(current);
        const safeTarget = safeNumber(target);
        const percentage = safeTarget > 0 ? Math.min((safeCurrent / safeTarget) * 100, 100) : 0;

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

            const mealCalories = mealEntries.reduce((sum, entry) => sum + safeNumber(entry.calories), 0);

            if (caloriesDisplay) {
                caloriesDisplay.textContent = `${Math.round(mealCalories)} kcal`;
            }

            if (mealContainer) {
                mealContainer.innerHTML = '';
                
                if (mealEntries.length === 0) {
                    mealContainer.innerHTML = `
                        <div class="empty-meal">
                            <p>No entries for this meal.</p>
                            <button class="btn btn--primary add-food-btn">Add Food</button>
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

        const macros = [
            `${Math.round(safeNumber(entry.calories))} kcal`,
            `P: ${Math.round(safeNumber(entry.protein))}g`,
            `C: ${Math.round(safeNumber(entry.carbs))}g`,
            `F: ${Math.round(safeNumber(entry.fat))}g`
        ];

        if (safeNumber(entry.fiber) > 0) {
            macros.push(`Fiber: ${Math.round(safeNumber(entry.fiber))}g`);
        }

        if (safeNumber(entry.waterIntake) > 0) {
            macros.push(`💧 ${Math.round(safeNumber(entry.waterIntake))}ml`);
        }

        div.innerHTML = `
            <div class="entry-details">
                <h4>${entry.foodName}</h4>
                <div class="entry-meta">
                    <span>${entry.servingSize}</span>
                    ${macros.map(macro => `<span>${macro}</span>`).join('')}
                    ${entry.notes ? `<span>📝 ${entry.notes}</span>` : ''}
                </div>
            </div>
            <div class="entry-actions">
                <button class="edit-entry-btn" title="Edit entry">
                    ✏️
                </button>
                <button class="delete-entry-btn delete-btn" title="Delete entry">
                    🗑️
                </button>
            </div>
        `;

        return div;
    }

    renderWeeklyView() {
        try {
            const weekStart = new Date(this.currentWeekStart);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const weekRange = document.getElementById('weekRange');
            if (weekRange) {
                weekRange.textContent = `Week of ${weekStart.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - ${weekEnd.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;
            }

            const weeklyGrid = document.querySelector('.weekly-grid');
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
        } catch (error) {
            console.error('Error rendering weekly view:', error);
        }
    }

    createDayCard(date, summary, entryCount) {
        const div = document.createElement('div');
        div.className = 'day-card';
        
        const dayName = date.toLocaleDateString('en-US', {weekday: 'long'});
        const dayDate = date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
        
        div.innerHTML = `
            <div class="day-header">
                <div class="day-date">${dayDate}</div>
                <h3 class="day-name">${dayName}</h3>
            </div>
            <div class="day-summary">
                <div class="day-calories">${Math.round(safeNumber(summary.calories))} kcal</div>
                <div class="day-macros">
                    <div>P: ${Math.round(safeNumber(summary.protein))}g</div>
                    <div>C: ${Math.round(safeNumber(summary.carbs))}g</div>
                    <div>F: ${Math.round(safeNumber(summary.fat))}g</div>
                </div>
                <div class="entry-count">${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}</div>
            </div>
        `;

        div.addEventListener('click', () => {
            this.currentDate = date.toISOString().split('T')[0];
            this.setCurrentDate();
            this.renderDailyView();
            this.switchTab('daily');
        });

        return div;
    }

    calculateDailySummary(entries) {
        return entries.reduce((summary, entry) => {
            summary.calories += safeNumber(entry.calories);
            summary.protein += safeNumber(entry.protein);
            summary.carbs += safeNumber(entry.carbs);
            summary.fat += safeNumber(entry.fat);
            summary.fiber += safeNumber(entry.fiber);
            summary.water += safeNumber(entry.waterIntake);
            return summary;
        }, {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            water: 0
        });
    }

    // Data persistence
    async loadData() {
        try {
            const entriesData = localStorage.getItem('dietTracker_entries');
            const profileData = localStorage.getItem('dietTracker_profile');
            const customFoodsData = localStorage.getItem('dietTracker_customFoods');

            if (entriesData) {
                this.entries = JSON.parse(entriesData);
            }

            if (profileData) {
                this.profile = { ...this.profile, ...JSON.parse(profileData) };
            }

            if (customFoodsData) {
                this.customFoods = JSON.parse(customFoodsData);
            }

            console.log('✅ Data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading data:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('dietTracker_entries', JSON.stringify(this.entries));
            localStorage.setItem('dietTracker_profile', JSON.stringify(this.profile));
            localStorage.setItem('dietTracker_customFoods', JSON.stringify(this.customFoods));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Export functions
    async exportCSV() {
        try {
            if (this.entries.length === 0) {
                this.showStatus('No data to export', 'warning');
                return;
            }

            // Add UTF-8 BOM for Excel compatibility
            const BOM = '\uFEFF';
            
            // CSV headers
            const headers = [
                'date', 'meal_time', 'food_name', 'serving_size', 
                'calories', 'protein', 'carbs', 'fat', 'fiber', 
                'notes', 'water_intake'
            ];
            
            // Convert entries to CSV rows
            const csvRows = this.entries.map(entry => [
                entry.date,
                entry.mealTime,
                this.escapeCsvField(entry.foodName),
                this.escapeCsvField(entry.servingSize),
                safeNumber(entry.calories),
                safeNumber(entry.protein),
                safeNumber(entry.carbs),
                safeNumber(entry.fat),
                safeNumber(entry.fiber),
                this.escapeCsvField(entry.notes || ''),
                safeNumber(entry.waterIntake)
            ]);
            
            // Combine headers and data
            const csvContent = BOM + [headers, ...csvRows]
                .map(row => row.join(','))
                .join('\n');
            
            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `diet-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            this.showStatus('CSV exported successfully! 📊', 'success');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            this.showStatus('Error exporting CSV', 'error');
        }
    }

    async exportPDF() {
        try {
            if (this.entries.length === 0) {
                this.showStatus('No data to export', 'warning');
                return;
            }

            // Show loading
            this.showLoadingOverlay('Generating PDF report...');

            // Load html2pdf if not already loaded
            if (!this.pdfLoaded) {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js');
                this.pdfLoaded = true;
            }

            // Generate PDF content
            const pdfContent = this.generatePDFContent();
            
            // PDF configuration
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `diet-tracker-report-${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Generate and download PDF
            await html2pdf().set(opt).from(pdfContent).save();
            
            // Cleanup
            document.body.removeChild(pdfContent);
            this.hideLoadingOverlay();
            
            this.showStatus('PDF exported successfully! 📄', 'success');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            this.hideLoadingOverlay();
            this.showStatus('Error exporting PDF', 'error');
        }
    }

    generatePDFContent() {
        const container = document.createElement('div');
        container.className = 'pdf-report';
        container.style.cssText = `
            font-family: Arial, sans-serif;
            padding: 20px;
            background: white;
            color: #333;
            max-width: 210mm;
        `;

        // Calculate summary
        const allEntries = this.entries;
        const totalSummary = this.calculateDailySummary(allEntries);
        const days = Math.max(1, [...new Set(allEntries.map(e => e.date))].length);
        const avgDaily = {
            calories: totalSummary.calories / days,
            protein: totalSummary.protein / days,
            carbs: totalSummary.carbs / days,
            fat: totalSummary.fat / days,
            fiber: totalSummary.fiber / days,
            water: totalSummary.water / days
        };

        container.innerHTML = `
            <div class="pdf-header">
                <div class="pdf-logo">🍽️ Diet Tracker Report</div>
                <div class="pdf-subtitle">Complete Nutrition Analysis</div>
                <div class="pdf-date">Generated on ${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                })}</div>
            </div>

            <div class="pdf-summary">
                <h3>📊 Summary Overview</h3>
                <div class="pdf-nutrition-grid">
                    <div class="pdf-nutrition-item">
                        <div class="pdf-nutrition-value">${Math.round(avgDaily.calories)}</div>
                        <div class="pdf-nutrition-label">Avg Daily Calories</div>
                    </div>
                    <div class="pdf-nutrition-item">
                        <div class="pdf-nutrition-value">${Math.round(avgDaily.protein)}g</div>
                        <div class="pdf-nutrition-label">Avg Daily Protein</div>
                    </div>
                    <div class="pdf-nutrition-item">
                        <div class="pdf-nutrition-value">${allEntries.length}</div>
                        <div class="pdf-nutrition-label">Total Entries</div>
                    </div>
                    <div class="pdf-nutrition-item">
                        <div class="pdf-nutrition-value">${Math.round(avgDaily.carbs)}g</div>
                        <div class="pdf-nutrition-label">Avg Daily Carbs</div>
                    </div>
                    <div class="pdf-nutrition-item">
                        <div class="pdf-nutrition-value">${Math.round(avgDaily.fat)}g</div>
                        <div class="pdf-nutrition-label">Avg Daily Fat</div>
                    </div>
                    <div class="pdf-nutrition-item">
                        <div class="pdf-nutrition-value">${days}</div>
                        <div class="pdf-nutrition-label">Days Tracked</div>
                    </div>
                </div>
            </div>

            <div class="pdf-section-title">🍽️ Complete Food Log</div>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Meal</th>
                        <th>Food</th>
                        <th>Serving</th>
                        <th>Calories</th>
                        <th>Protein (g)</th>
                        <th>Carbs (g)</th>
                        <th>Fat (g)</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${allEntries.map(entry => `
                        <tr>
                            <td>${entry.date}</td>
                            <td><span class="pdf-meal-badge">${entry.mealTime}</span></td>
                            <td>${entry.foodName}</td>
                            <td>${entry.servingSize}</td>
                            <td>${Math.round(safeNumber(entry.calories))}</td>
                            <td>${Math.round(safeNumber(entry.protein))}</td>
                            <td>${Math.round(safeNumber(entry.carbs))}</td>
                            <td>${Math.round(safeNumber(entry.fat))}</td>
                            <td>${entry.notes || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="pdf-footer">
                <p><strong>Diet Tracker by TheDietPlanner.com</strong></p>
                <p>Generated with complete nutrition tracking data • All values are approximate</p>
                <p>For personalized nutrition advice, consult with a qualified dietitian or healthcare provider</p>
            </div>
        `;

        document.body.appendChild(container);
        return container;
    }

    showLoadingOverlay(message) {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }

    // Utility functions
    escapeCsvField(field) {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    generateId() {
        return 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    showStatus(message, type = 'info') {
        // Remove existing status
        const existingStatus = document.getElementById('status-message');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create status element
        const status = document.createElement('div');
        status.id = 'status-message';
        status.className = `status status--${type}`;
        status.textContent = message;
        status.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: 500;
            animation: slideUp 0.3s ease;
        `;

        document.body.appendChild(status);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (status.parentNode) {
                status.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => status.remove(), 300);
            }
        }, 3000);
    }

    // Theme management
    loadThemePreference() {
        const savedTheme = localStorage.getItem('dietTracker_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('dietTracker_theme', newTheme);
        
        this.showStatus(`Switched to ${newTheme} theme! 🎨`, 'success');
    }
}

// Initialize Diet Tracker
document.addEventListener('DOMContentLoaded', () => {
    new DietTracker();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);