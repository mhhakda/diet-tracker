/**
 * DEBUGGING VERSION - Diet Tracker Enhanced Integration
 * This version includes extensive logging to identify why import notifications show but no data is imported
 * 
 * @version 1.3.1 - DEBUG ENHANCED
 * @author TheDietPlanner.com
 */

// ENHANCED Diet Planner Integration with DEBUGGING
// Addresses the issue where notification shows but no data is actually imported

// Integration keys to check for incoming data
const INTEGRATION_KEYS = [
    'dietplanner_integration_v3',
    'planned_meals_v1', 
    'diettracker_import',
    'meal_plan_transfer'
];

// Global helper function for safe numeric parsing
function safeNumber(v) {
    if (v == null || v == undefined) return 0;
    if (typeof v === 'number') return isNaN(v) ? 0 : v;
    const n = parseFloat(String(v).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
}

// Enhanced function to check and load incoming meal plan data (with extensive debugging)
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

// Check for incoming meal plan data on page load  
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Setting up import check');
    // Small delay to ensure Diet Tracker is initialized first
    setTimeout(() => {
        console.log('⏰ Running delayed checkForIncomingMealPlan');
        checkForIncomingMealPlan();
    }, 1000);
});

console.log('📋 Diet Planner Integration (DEBUG VERSION) loaded successfully');
