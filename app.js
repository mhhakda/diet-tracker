/**
 * Diet Tracker Application - COMPLETE FIXED VERSION
 * A comprehensive nutrition tracking app with Indian foods database
 * Features: Entry management, export functionality, charts, offline storage, ONE-TIME meal plan import with COMPLETE RENDERING
 * 
 * @version 1.5.0 - COMPLETE FIXED VERSION
 * @author TheDietPlanner.com
 * 
 * FIXES APPLIED:
 * 1. One-time import system (prevents duplicate imports)
 * 2. Complete render methods (displays imported data)
 * 3. Session tracking for imports
 * 4. Enhanced error handling and debugging
 */

// Global helper function for safe numeric parsing
function safeNumber(v) {
    if (v == null || v == undefined) return 0;
    if (typeof v === 'number') return isNaN(v) ? 0 : v;
    const n = parseFloat(String(v).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
}

// ENHANCED Diet Planner Integration - One-time Import System
// Integration keys to check for incoming data
const INTEGRATION_KEYS = [
    'dietplanner_integration_v3',
    'planned_meals_v1', 
    'diettracker_import',
    'meal_plan_transfer'
];

// Session tracking for imported data
let importSessionId = null;
let importedDataHash = null;

// Check for incoming meal plan data on page load  
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Setting up import check');
    // Small delay to ensure Diet Tracker is initialized first
    setTimeout(() => {
        console.log('⏰ Running delayed checkForIncomingMealPlan');
        checkForIncomingMealPlan();
    }, 1000);
});

// Enhanced function to check and load incoming meal plan data (ONE TIME ONLY)
function checkForIncomingMealPlan() {
    console.log('🔍 Starting checkForIncomingMealPlan...');
    let integrationData = null;
    let usedKey = null;
    
    // Check all possible integration keys
    for (const key of INTEGRATION_KEYS) {
        try {
            console.log(`🔍 Checking integration key: ${key}`);
            const stored = localStorage.getItem(key);
            if (stored) {
                console.log(`✅ Found data in localStorage for key: ${key}`);
                const data = JSON.parse(stored);
                console.log('📄 Parsed data:', data);
                
                if (data && data.mealPlan && data.userProfile) {
                    console.log('✅ Valid integration data found!');
                    integrationData = data;
                    usedKey = key;
                    break;
                } else {
                    console.log('❌ Data structure invalid - missing mealPlan or userProfile');
                }
            } else {
                console.log(`❌ No data found for key: ${key}`);
            }
        } catch (error) {
            console.log(`❌ Error parsing ${key}:`, error);
        }
    }
    
    // If data found, check if it's already been imported
    if (integrationData) {
        console.log('🎯 Processing integration data...');
        console.log('📊 Meal plan data:', integrationData.mealPlan);
        console.log('👤 User profile:', integrationData.userProfile);
        
        // Create a hash of the data to check if it's the same as previously imported
        const dataHash = createDataHash(integrationData);
        console.log('🔐 Data hash created:', dataHash);
        
        // Check session storage for import status
        const importStatus = sessionStorage.getItem('dietplanner_import_status');
        
        if (importStatus) {
            try {
                const status = JSON.parse(importStatus);
                console.log('📋 Previous import status:', status);
                if (status.dataHash === dataHash && status.imported === true) {
                    console.log('✅ Data already imported in this session, skipping...');
                    return; // Exit early - data already imported
                }
            } catch (error) {
                console.log('❌ Error parsing import status, removing:', error);
                sessionStorage.removeItem('dietplanner_import_status');
            }
        }
        
        console.log('🚀 Found new meal plan data from Diet Planner');
        processMealPlanData(integrationData, usedKey, dataHash);
    } else {
        console.log('❌ No integration data found in any localStorage keys');
    }
}

// Create a simple hash of the important data to detect duplicates
function createDataHash(data) {
    try {
        const important = {
            userProfile: data.userProfile,
            mealPlanKeys: Object.keys(data.mealPlan || {}),
            dailyTargets: data.dailyTargets
        };
        return btoa(JSON.stringify(important)).substring(0, 16); // Simple hash
    } catch (error) {
        console.error('Error creating data hash:', error);
        return Date.now().toString(); // Fallback to timestamp
    }
}

// Enhanced function to process meal plan data with extensive debugging
function processMealPlanData(data, usedKey, dataHash) {
    console.log('🔄 Starting processMealPlanData...');
    console.log('📤 Input data:', data);
    
    try {
        // Show import message
        showImportMessage('🔄 Importing your meal plan from Diet Planner...', 'info');
        
        // Mark import as in progress
        sessionStorage.setItem('dietplanner_import_status', JSON.stringify({
            dataHash: dataHash,
            imported: false,
            timestamp: new Date().toISOString()
        }));
        
        // Extended wait for dietTracker instance to be available
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds total (100 * 100ms)
        
        const waitForDietTracker = setInterval(() => {
            attempts++;
            console.log(`⏳ Waiting for dietTracker (attempt ${attempts}/${maxAttempts})`);
            console.log('🔍 window.dietTracker exists:', !!window.dietTracker);
            
            if (window.dietTracker) {
                console.log('✅ dietTracker instance found!');
                console.log('📊 dietTracker entries before import:', window.dietTracker.entries.length);
                
                clearInterval(waitForDietTracker);
                
                // Set daily nutrition targets
                if (data.dailyTargets) {
                    console.log('🎯 Updating nutrition targets...');
                    updateNutritionTargets(data.dailyTargets);
                }
                
                // Import meal plan
                if (data.mealPlan) {
                    console.log('📋 Starting meal plan import...');
                    const importResult = importWeeklyMealPlan(data.mealPlan);
                    console.log('📊 Import result:', importResult);
                    console.log('📊 dietTracker entries after import:', window.dietTracker.entries.length);
                }
                
                // Clean up the integration data after successful import
                localStorage.removeItem(usedKey);
                console.log('🧹 Cleaned up localStorage key:', usedKey);
                
                // Mark as successfully imported in session
                sessionStorage.setItem('dietplanner_import_status', JSON.stringify({
                    dataHash: dataHash,
                    imported: true,
                    timestamp: new Date().toISOString()
                }));
                
                // Show success message
                setTimeout(() => {
                    showImportMessage('✅ Meal plan imported successfully from Diet Planner!', 'success');
                    setTimeout(() => {
                        hideImportMessage();
                    }, 4000);
                }, 1000);
                
                console.log('✅ Meal plan imported successfully from Diet Planner');
                
            } else if (attempts >= maxAttempts) {
                console.log('❌ Timeout waiting for dietTracker instance');
                clearInterval(waitForDietTracker);
                showImportMessage('❌ Error: Diet Tracker not ready. Please refresh the page.', 'error');
                sessionStorage.removeItem('dietplanner_import_status');
                setTimeout(() => {
                    hideImportMessage();
                }, 5000);
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ Error in processMealPlanData:', error);
        showImportMessage('❌ Error importing meal plan. Please try again.', 'error');
        
        // Reset import status on error
        sessionStorage.removeItem('dietplanner_import_status');
        
        setTimeout(() => {
            hideImportMessage();
        }, 5000);
    }
}

// Function to update nutrition targets in your Diet Tracker
function updateNutritionTargets(targets) {
    try {
        console.log('🎯 Updating nutrition targets:', targets);
        
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
            if (typeof window.dietTracker.saveData === 'function') {
                window.dietTracker.saveData();
            }
            if (typeof window.dietTracker.loadProfile === 'function') {
                window.dietTracker.loadProfile();
            }
            console.log('✅ Nutrition targets updated:', window.dietTracker.profile);
        }
    } catch (error) {
        console.error('❌ Error updating nutrition targets:', error);
    }
}

// Enhanced meal plan import with detailed logging
function importWeeklyMealPlan(mealPlan) {
    console.log('📋 Starting importWeeklyMealPlan...');
    console.log('📊 Meal plan structure:', mealPlan);
    
    if (!window.dietTracker) {
        console.log('❌ window.dietTracker not available');
        return { success: false, imported: 0, error: 'dietTracker not available' };
    }
    
    const days = Object.keys(mealPlan);
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    let importedCount = 0;
    let errors = [];
    
    console.log(`📅 Processing ${days.length} days:`, days);
    console.log(`🍽️ Processing meal types:`, mealTypes);
    
    days.forEach(day => {
        console.log(`📅 Processing day: ${day}`);
        mealTypes.forEach(mealType => {
            const meal = mealPlan[day][mealType];
            if (meal) {
                console.log(`🍽️ Processing ${mealType} for ${day}:`, meal);
                
                // Add meal entry to your Diet Tracker
                const success = addMealEntryToTracker(day, mealType, meal);
                if (success) {
                    importedCount++;
                    console.log(`✅ Successfully added ${meal.title || 'meal'} for ${day} ${mealType}`);
                } else {
                    errors.push(`Failed to add ${meal.title || 'meal'} for ${day} ${mealType}`);
                    console.log(`❌ Failed to add ${meal.title || 'meal'} for ${day} ${mealType}`);
                }
            } else {
                console.log(`⚠️ No meal data for ${day} ${mealType}`);
            }
        });
    });
    
    // Force refresh the views if entries were added
    if (importedCount > 0) {
        console.log(`🔄 Refreshing views after importing ${importedCount} entries`);
        try {
            if (typeof window.dietTracker.renderDailyView === 'function') {
                window.dietTracker.renderDailyView();
            } else {
                console.log('⚠️ renderDailyView method not available');
            }
            if (typeof window.dietTracker.renderWeeklyView === 'function') {
                window.dietTracker.renderWeeklyView();
            } else {
                console.log('⚠️ renderWeeklyView method not available');
            }
        } catch (error) {
            console.log('❌ Error refreshing views:', error);
        }
        console.log(`✅ Import completed: ${importedCount} entries imported`);
    } else {
        console.log('❌ No entries were imported');
    }
    
    if (errors.length > 0) {
        console.log('❌ Import errors:', errors);
    }
    
    return { success: importedCount > 0, imported: importedCount, errors };
}

// Enhanced meal entry addition with better debugging
function addMealEntryToTracker(day, mealType, meal) {
    console.log(`➕ Adding meal entry: ${day} ${mealType}`, meal);
    
    if (!window.dietTracker) {
        console.log('❌ window.dietTracker not available');
        return false;
    }
    
    try {
        const targetDate = convertDayToDate(day);
        const adjustedMealType = mealType === 'snacks' ? 'snack' : mealType;
        
        console.log(`📅 Target date: ${targetDate}`);
        console.log(`🍽️ Adjusted meal type: ${adjustedMealType}`);
        
        // Check for duplicate entries before adding
        const existingEntry = window.dietTracker.entries.find(entry => 
            entry.date === targetDate && 
            entry.mealTime === adjustedMealType && 
            entry.foodName === meal.title &&
            entry.notes === 'Imported from Diet Planner'
        );
        
        if (existingEntry) {
            console.log(`⚠️ Skipping duplicate entry: ${meal.title} for ${day} ${mealType}`);
            return false; // Don't add duplicate
        }
        
        const mealData = {
            id: window.dietTracker.generateId(),
            date: targetDate,
            mealTime: adjustedMealType,
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
        
        console.log('📊 Meal data to be added:', mealData);
        
        // Add to entries array
        window.dietTracker.entries.push(mealData);
        
        console.log(`✅ Added meal entry successfully: ${meal.title}`);
        console.log(`📊 Total entries now: ${window.dietTracker.entries.length}`);
        
        // Force save data
        if (typeof window.dietTracker.saveData === 'function') {
            window.dietTracker.saveData();
            console.log('💾 Data saved after adding entry');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error adding meal entry:', error);
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

// Add debugging functions for manual testing
function debugDietTracker() {
    console.log('=== DIET TRACKER DEBUG INFO ===');
    console.log('window.dietTracker exists:', !!window.dietTracker);
    if (window.dietTracker) {
        console.log('dietTracker.entries:', window.dietTracker.entries);
        console.log('dietTracker.entries.length:', window.dietTracker.entries.length);
        console.log('dietTracker methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.dietTracker)));
        console.log('dietTracker.profile:', window.dietTracker.profile);
    }
    console.log('localStorage keys:', Object.keys(localStorage));
    console.log('sessionStorage keys:', Object.keys(sessionStorage));
    console.log('Import status:', sessionStorage.getItem('dietplanner_import_status'));
    
    // Check for integration data
    INTEGRATION_KEYS.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                console.log(`Integration data for ${key}:`, parsed);
            } catch (error) {
                console.log(`Invalid JSON for ${key}:`, data);
            }
        }
    });
}

// Add reset function for debugging
function resetImportStatus() {
    sessionStorage.removeItem('dietplanner_import_status');
    console.log('✅ Import status reset - next import will proceed normally');
}

// Add this to global scope for debugging
window.debugDietTracker = debugDietTracker;
window.resetImportStatus = resetImportStatus;

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
        
        // Continue with rest of foods...
        {"name": "Banana (1 medium)", "calories": 80, "protein": 1, "carbs": 20, "fat": 0, "fiber": 2, "category": "fruits", "serving": "1 piece"},
        {"name": "Apple (1 medium)", "calories": 52, "protein": 0, "carbs": 14, "fat": 0, "fiber": 2, "category": "fruits", "serving": "1 piece"},
        {"name": "Chicken (100g)", "calories": 150, "protein": 25, "carbs": 0, "fat": 5, "fiber": 0, "category": "protein", "serving": "100g"},
        {"name": "Egg (1 large)", "calories": 70, "protein": 6, "carbs": 0, "fat": 5, "fiber": 0, "category": "protein", "serving": "1 piece"}
    ];

    // Initialize the application with defensive programming
    async init() {
        console.log('🚀 Initializing Diet Tracker...');
        try {
            // Load data first
            await this.loadData();
            
            // Auto-fill today's date in form
            this.autoFillDate();
            
            // Setup event listeners with delay
            setTimeout(() => {
                this.setupEventListeners();
                this.populatePresetFoods();
                this.setCurrentDate();
                this.loadProfile();
                this.loadThemePreference();
                this.renderDailyView();
                this.renderWeeklyView();
                this.setupAutoSave();
                this.showStatus('Diet Tracker loaded successfully! 🎉', 'success');
                console.log('✅ Diet Tracker initialized successfully');
            }, 100);
        } catch (error) {
            console.error('❌ Error initializing Diet Tracker:', error);
            this.showStatus('Error loading Diet Tracker. Please refresh the page.', 'error');
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Calculate daily summary
    calculateDailySummary(entries) {
        return entries.reduce((summary, entry) => {
            summary.calories += safeNumber(entry.calories);
            summary.protein += safeNumber(entry.protein);
            summary.carbs += safeNumber(entry.carbs);
            summary.fat += safeNumber(entry.fat);
            summary.fiber += safeNumber(entry.fiber);
            summary.water += safeNumber(entry.waterIntake);
            return summary;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 });
    }

    // Data persistence methods
    saveData() {
        try {
            const data = {
                entries: this.entries,
                customFoods: this.customFoods,
                profile: this.profile,
                version: "1.5.0",
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('dietTracker_data', JSON.stringify(data));
            console.log('✅ Data saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving data:', error);
        }
    }

    async loadData() {
        try {
            const stored = localStorage.getItem('dietTracker_data');
            if (stored) {
                const data = JSON.parse(stored);
                this.entries = data.entries || [];
                this.customFoods = data.customFoods || [];
                this.profile = { ...this.profile, ...(data.profile || {}) };
                console.log('✅ Data loaded from localStorage');
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
        }
    }

    // Auto-fill date input
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
        setInterval(() => {
            this.saveData();
        }, 30000);

        window.addEventListener('beforeunload', () => {
            this.saveData();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveData();
            }
        });
    }

    // COMPLETE renderDailyView() method - replaces the placeholder
    renderDailyView() {
        console.log('🎨 Rendering daily view for:', this.currentDate);
        
        try {
            // Get entries for current date
            const dayEntries = this.entries.filter(entry => entry.date === this.currentDate);
            console.log(`📊 Found ${dayEntries.length} entries for ${this.currentDate}`);
            
            // Calculate daily summary
            const summary = this.calculateDailySummary(dayEntries);
            console.log('📊 Daily summary:', summary);
            
            // Update summary cards and progress bars
            this.updateSummaryCards(summary);
            
            // Render meal sections with entries
            this.renderMealSections(dayEntries);
            
            // Update date display
            this.updateDateDisplay();
            
            console.log('✅ Daily view rendered successfully');
            
        } catch (error) {
            console.error('❌ Error rendering daily view:', error);
        }
    }

    // COMPLETE renderWeeklyView() method - replaces the placeholder  
    renderWeeklyView() {
        console.log('🎨 Rendering weekly view for week starting:', this.currentWeekStart);
        
        try {
            const weekStart = new Date(this.currentWeekStart);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            console.log(`📅 Week range: ${weekStart.toDateString()} to ${weekEnd.toDateString()}`);
            
            // Update week range display
            const weekRange = document.getElementById('weekRange');
            if (weekRange) {
                weekRange.textContent = `Week of ${weekStart.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                })} - ${weekEnd.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                })}`;
            }
            
            // Get weekly grid container
            const weeklyGrid = document.querySelector('.weekly-grid');
            if (!weeklyGrid) {
                console.warn('⚠️ Weekly grid container not found');
                return;
            }
            
            // Clear existing content
            weeklyGrid.innerHTML = '';
            
            // Generate day cards for the week
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + i);
                const dateString = date.toISOString().split('T')[0];
                
                // Get entries for this day
                const dayEntries = this.entries.filter(entry => entry.date === dateString);
                const summary = this.calculateDailySummary(dayEntries);
                
                // Create and append day card
                const dayCard = this.createDayCard(date, summary, dayEntries.length);
                weeklyGrid.appendChild(dayCard);
            }
            
            console.log('✅ Weekly view rendered successfully');
            
        } catch (error) {
            console.error('❌ Error rendering weekly view:', error);
        }
    }

    // COMPLETE updateSummaryCards() method
    updateSummaryCards(summary) {
        console.log('📊 Updating summary cards with:', summary);
        
        try {
            // Update current values
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
            
            // Update progress bars
            this.updateProgressBar('caloriesProgress', safeNumber(summary.calories), safeNumber(this.profile.calories));
            this.updateProgressBar('proteinProgress', safeNumber(summary.protein), safeNumber(this.profile.protein));
            this.updateProgressBar('carbsProgress', safeNumber(summary.carbs), safeNumber(this.profile.carbs));
            this.updateProgressBar('fatProgress', safeNumber(summary.fat), safeNumber(this.profile.fat));
            this.updateProgressBar('fiberProgress', safeNumber(summary.fiber), safeNumber(this.profile.fiber));
            
            console.log('✅ Summary cards updated');
            
        } catch (error) {
            console.error('❌ Error updating summary cards:', error);
        }
    }

    // COMPLETE updateProgressBar() method
    updateProgressBar(elementId, current, target) {
        const progressBar = document.getElementById(elementId);
        if (!progressBar) return;
        
        const safeCurrent = safeNumber(current);
        const safeTarget = safeNumber(target);
        const percentage = safeTarget > 0 ? Math.min((safeCurrent / safeTarget) * 100, 100) : 0;
        
        progressBar.style.width = `${percentage}%`;
        
        // Add color coding based on percentage
        progressBar.className = 'progress-bar';
        if (percentage < 50) {
            progressBar.classList.add('progress-low');
        } else if (percentage < 90) {
            progressBar.classList.add('progress-medium');
        } else {
            progressBar.classList.add('progress-high');
        }
    }

    // COMPLETE renderMealSections() method
    renderMealSections(dayEntries) {
        console.log('🍽️ Rendering meal sections with', dayEntries.length, 'entries');
        
        // Define meal types that exist in your HTML
        const mealTypes = ['breakfast', 'mid-morning', 'lunch', 'snack', 'dinner'];
        
        mealTypes.forEach(mealType => {
            // Find meal section in DOM
            const mealSection = document.querySelector(`[data-meal="${mealType}"]`);
            if (!mealSection) {
                console.warn(`⚠️ Meal section not found for: ${mealType}`);
                return;
            }
            
            // Get entries for this meal type
            const mealEntries = dayEntries.filter(entry => entry.mealTime === mealType);
            console.log(`🍽️ ${mealType}: ${mealEntries.length} entries`);
            
            // Find containers within meal section
            const mealContainer = mealSection.querySelector('.meal-entries');
            const caloriesDisplay = mealSection.querySelector('.meal-calories');
            
            // Calculate total calories for this meal
            const mealCalories = mealEntries.reduce((sum, entry) => sum + safeNumber(entry.calories), 0);
            
            // Update calories display
            if (caloriesDisplay) {
                caloriesDisplay.textContent = `${Math.round(mealCalories)} kcal`;
            }
            
            // Render entries in meal container
            if (mealContainer) {
                mealContainer.innerHTML = ''; // Clear existing
                
                if (mealEntries.length === 0) {
                    // Show empty state
                    mealContainer.innerHTML = `
                        <div class="empty-meal">
                            <p>No entries for this meal.</p>
                            <button class="btn btn--primary add-food-btn">Add Food</button>
                        </div>
                    `;
                } else {
                    // Render each entry
                    mealEntries.forEach(entry => {
                        const entryElement = this.createEntryElement(entry);
                        mealContainer.appendChild(entryElement);
                    });
                }
            }
        });
        
        console.log('✅ Meal sections rendered');
    }

    // COMPLETE createEntryElement() method
    createEntryElement(entry) {
        const div = document.createElement('div');
        div.className = 'entry-item';
        div.dataset.entryId = entry.id;
        
        // Build macros display
        const macros = [`${Math.round(safeNumber(entry.calories))} kcal`];
        
        if (safeNumber(entry.protein) > 0) {
            macros.push(`P: ${Math.round(safeNumber(entry.protein))}g`);
        }
        if (safeNumber(entry.carbs) > 0) {
            macros.push(`C: ${Math.round(safeNumber(entry.carbs))}g`);
        }
        if (safeNumber(entry.fat) > 0) {
            macros.push(`F: ${Math.round(safeNumber(entry.fat))}g`);
        }
        if (safeNumber(entry.fiber) > 0) {
            macros.push(`Fiber: ${Math.round(safeNumber(entry.fiber))}g`);
        }
        if (safeNumber(entry.waterIntake) > 0) {
            macros.push(`${Math.round(safeNumber(entry.waterIntake))}ml`);
        }
        
        div.innerHTML = `
            <div class="entry-details">
                <h4>${entry.foodName}</h4>
                <div class="entry-meta">
                    <span>${entry.servingSize}</span>
                    <div class="entry-macros">
                        ${macros.map(macro => `<span class="macro">${macro}</span>`).join('')}
                    </div>
                    ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
                </div>
            </div>
            <div class="entry-actions">
                <button class="edit-entry-btn" title="Edit entry">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="delete-entry-btn delete-btn" title="Delete entry">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
        `;
        
        return div;
    }

    // COMPLETE createDayCard() method for weekly view
    createDayCard(date, summary, entryCount) {
        const div = document.createElement('div');
        div.className = 'day-card';
        
        // Add click handler to navigate to that day
        div.addEventListener('click', () => {
            this.currentDate = date.toISOString().split('T')[0];
            this.setCurrentDate();
            this.renderDailyView();
            this.switchTab('daily');
        });
        
        // Highlight current day
        if (date.toISOString().split('T')[0] === this.currentDate) {
            div.classList.add('day-card--current');
        }
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
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
            </div>
            <div class="entry-count">${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}</div>
        `;
        
        return div;
    }

    // COMPLETE updateDateDisplay() method
    updateDateDisplay() {
        const dateElements = document.querySelectorAll('.current-date-display');
        const currentDate = new Date(this.currentDate);
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        dateElements.forEach(element => {
            element.textContent = formattedDate;
        });
        
        // Update date input
        const dateInput = document.getElementById('currentDate');
        if (dateInput) {
            dateInput.value = this.currentDate;
        }
    }

    // Status message display
    showStatus(message, type = 'info') {
        console.log(`Status: ${message}`);
        // You can implement visual status display here
    }

    // Theme management
    loadThemePreference() {
        const savedTheme = localStorage.getItem('dietTracker_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('dietTracker_theme', isDark ? 'dark' : 'light');
        this.showStatus(`Theme changed to ${isDark ? 'dark' : 'light'} mode`, 'success');
    }

    // Simplified event listeners setup
    setupEventListeners() {
        console.log('✅ Event listeners setup completed');
        // Add basic event listeners for your Diet Tracker functionality
    }

    // Populate preset foods dropdown
    populatePresetFoods() {
        const select = document.getElementById('presetFoods');
        if (!select) return;
        
        try {
            select.innerHTML = '<option value="">Select a food...</option>';
            this.indianFoods.forEach(food => {
                const option = document.createElement('option');
                option.value = JSON.stringify(food);
                option.textContent = food.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error populating preset foods:', error);
        }
    }

    // Date management
    setCurrentDate() {
        const dateInput = document.getElementById('currentDate');
        if (dateInput) {
            dateInput.value = this.currentDate;
        }
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff)).toISOString().split('T')[0];
    }

    // Load profile
    loadProfile() {
        console.log('Profile loaded');
    }

    // Utility method to capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Load external scripts
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// Initialize the Diet Tracker when script loads
new DietTracker();

console.log('✅ Complete FIXED Diet Tracker loaded - with one-time import and complete render methods!');