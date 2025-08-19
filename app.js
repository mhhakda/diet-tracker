
/* Robust replacement app.js for Diet Tracker
   - Defensive parsing (safeNumber)
   - LocalStorage persistence under key 'diet_tracker_entries_v1'
   - Simple add-entry via modal form if available, or fallback prompt
   - CSV export (Excel-compatible BOM)
   - PDF export using html2pdf with blob fallback
   - Basic charts rendering if canvas elements exist (lazy-load Chart.js)
   - Defensive guards to avoid runtime exceptions
*/

(function () {
  'use strict';

  // Config
  const STORAGE_KEY = 'diet_tracker_entries_v1';
  const APP_PREFIX = '[DietTracker]';

  // Utilities
  const safeNumber = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return isNaN(v) ? 0 : v;
    const n = parseFloat(String(v).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const el = id => document.getElementById(id);
  const q = sel => document.querySelector(sel);

  // Simple status display
  function showStatus(msg, type='info') {
    try {
      const s = el('exportStatus') || el('statusAnnouncement');
      if (s) {
        s.textContent = msg;
        s.setAttribute('data-status', type);
      } else {
        console.log(APP_PREFIX, msg);
      }
    } catch(e){ console.log(APP_PREFIX, 'status error', e); }
  }

  // Load/save
  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data;
    } catch (e) {
      console.error(APP_PREFIX, 'loadEntries', e);
      return [];
    }
  }
  function saveEntries(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      showStatus('Saved locally', 'success');
    } catch (e) {
      console.error(APP_PREFIX, 'saveEntries', e);
      showStatus('Failed to save locally', 'error');
    }
  }

  // Rendering basics
  function formatNumber(n){ return (n===0||n)? String(n) : ''; }

  function renderTotals(entries) {
    try {
      const totals = entries.reduce((t, r) => {
        t.calories += safeNumber(r.calories);
        t.protein += safeNumber(r.protein);
        t.carbs += safeNumber(r.carbs);
        t.fat += safeNumber(r.fat);
        t.fiber += safeNumber(r.fiber);
        t.water += safeNumber(r.water_intake);
        return t;
      }, {calories:0,protein:0,carbs:0,fat:0,fiber:0,water:0});

      // Update DOM if targets exist
      const map = [
        ['caloriesCurrent','calories'],
        ['caloriesTarget','targetCalories'],
        ['caloriesProgress','caloriesProgress'],
        ['entryCalories','calories'],
        ['targetCalories','targetCalories'],
        ['waterCurrent','water'],
      ];
      // Specific element updates
      if (el('caloriesCurrent')) el('caloriesCurrent').textContent = String(Math.round(totals.calories));
      if (el('entryCalories')) el('entryCalories').textContent = String(Math.round(totals.calories));
      if (el('waterCurrent')) el('waterCurrent').textContent = String(Math.round(totals.water));
      // update small stat cards if present
      ['calories','protein','carbs','fat','fiber','water'].forEach(k => {
        const id = k + 'Stat';
        const node = el(id);
        if (node) node.textContent = String(Math.round(totals[k])); 
      });
    } catch(e){ console.error(APP_PREFIX,'renderTotals',e); }
  }

  // Render entries table if exists
  function renderEntries(entries) {
    try {
      const tbody = el('entriesTableBody') || el('entriesBody') || el('entries-list');
      if (!tbody) return;
      // Clear
      tbody.innerHTML = '';
      entries.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date||''}</td><td>${r.meal_time||''}</td><td>${r.food_name||''}</td>
          <td>${r.serving_size||''}</td><td>${safeNumber(r.calories)}</td><td>${safeNumber(r.protein)}</td>
          <td>${safeNumber(r.carbs)}</td><td>${safeNumber(r.fat)}</td><td>${safeNumber(r.fiber)}</td><td>${safeNumber(r.water_intake)}</td>`;
        tbody.appendChild(tr);
      });
    } catch(e){ console.error(APP_PREFIX,'renderEntries',e); }
  }

  // Simple add entry flow: if form present, hook it, otherwise use prompt fallback
  function hookAddEntry(entries) {
    try {
      const addBtn = el('addEntryBtn') || el('addFoodBtn') || q('.add-food');
      if (!addBtn) return;
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // If modal form exists, open it
        const modal = el('addEntryModal');
        if (modal) {
          // show modal (toggle class if implemented)
          modal.style.display = 'block';
          const cancel = el('cancelEntry');
          if (cancel) cancel.addEventListener('click', ()=> modal.style.display='none', {once:true});
          const save = el('saveEntry');
          if (save) {
            save.addEventListener('click', ()=> {
              try {
                // collect fields if present
                const date = (el('entryDate') && el('entryDate').value) || new Date().toLocaleDateString();
                const meal_time = (el('mealTime') && el('mealTime').value) || 'Meal';
                const food_name = (el('foodName') && el('foodName').value) || (el('foodSelect') && el('foodSelect').value) || 'Food';
                const serving_size = (el('servingSize') && el('servingSize').value) || '';
                const calories = safeNumber(el('caloriesInput') && el('caloriesInput').value) || safeNumber(el('cal-input') && el('cal-input').value);
                const protein = safeNumber(el('proteinInput') && el('proteinInput').value);
                const carbs = safeNumber(el('carbsInput') && el('carbsInput').value);
                const fat = safeNumber(el('fatInput') && el('fatInput').value);
                const fiber = safeNumber(el('fiberInput') && el('fiberInput').value);
                const water_intake = safeNumber(el('waterInput') && el('waterInput').value);
                const entry = { date, meal_time, food_name, serving_size, calories, protein, carbs, fat, fiber, water_intake };
                entries.push(entry);
                saveEntries(entries);
                renderEntries(entries);
                renderTotals(entries);
                modal.style.display='none';
              } catch(err){ console.error(APP_PREFIX,'saveEntry modal',err); }
            }, {once:true});
          }
          return;
        }
        // fallback prompt flow
        const food_name = prompt('Food name:');
        if (!food_name) return;
        const calories = safeNumber(prompt('Calories (kcal):', '0'));
        const protein = safeNumber(prompt('Protein (g):', '0'));
        const carbs = safeNumber(prompt('Carbs (g):', '0'));
        const fat = safeNumber(prompt('Fat (g):', '0'));
        const fiber = safeNumber(prompt('Fiber (g):', '0'));
        const water_intake = safeNumber(prompt('Water (ml):', '0'));
        const entry = { date: new Date().toLocaleDateString(), meal_time:'Meal', food_name, serving_size:'', calories, protein, carbs, fat, fiber, water_intake };
        entries.push(entry);
        saveEntries(entries);
        renderEntries(entries);
        renderTotals(entries);
      });
    } catch(e){ console.error(APP_PREFIX,'hookAddEntry',e); }
  }

  // CSV export
  function exportCSV(entries) {
    try {
      if (!Array.isArray(entries) || entries.length===0) {
        showStatus('No data to export', 'info');
        return;
      }
      const headers = ['date','meal_time','food_name','serving_size','calories','protein','carbs','fat','fiber','water_intake'];
      const rows = entries.map(r => headers.map(h => {
        const v = r[h]===undefined || r[h]===null ? '' : String(r[h]);
        // escape quotes
        return `"${v.replace(/"/g,'""')}"`;
      }).join(','));
      const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diet_tracker_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 2000);
      showStatus('CSV exported', 'success');
    } catch(e){ console.error(APP_PREFIX,'exportCSV',e); showStatus('CSV export failed','error'); }
  }

  // PDF export using html2pdf with blob fallback
  async function exportPDF(entries) {
    try {
      if (!Array.isArray(entries) || entries.length===0) {
        showStatus('No data to export', 'info');
        return;
      }
      showStatus('Preparing PDF...', 'info');
      // build report DOM
      const report = document.createElement('div');
      report.style.padding='18px';
      report.style.fontFamily='Arial, sans-serif';
      report.style.color='#222';
      report.innerHTML = `<h1 style="text-align:center;margin:0 0 8px">Diet Tracker Report</h1><div style="text-align:center;margin-bottom:12px">${new Date().toLocaleString()}</div>`;
      // summary
      const totals = entries.reduce((t,r)=>{ t.calories+=safeNumber(r.calories); t.protein+=safeNumber(r.protein); t.carbs+=safeNumber(r.carbs); t.fat+=safeNumber(r.fat); t.fiber+=safeNumber(r.fiber); t.water+=safeNumber(r.water_intake); return t; }, {calories:0,protein:0,carbs:0,fat:0,fiber:0,water:0});
      report.innerHTML += `<h2>Summary</h2><div style="display:flex;gap:12px;flex-wrap:wrap"><div><strong>Calories</strong><div>${Math.round(totals.calories)}</div></div><div><strong>Protein (g)</strong><div>${Math.round(totals.protein)}</div></div><div><strong>Carbs (g)</strong><div>${Math.round(totals.carbs)}</div></div><div><strong>Fat (g)</strong><div>${Math.round(totals.fat)}</div></div><div><strong>Fiber (g)</strong><div>${Math.round(totals.fiber)}</div></div><div><strong>Water (ml)</strong><div>${Math.round(totals.water)}</div></div></div>`;

      // charts: capture canvas images if present
      const chartsDiv = document.createElement('div');
      chartsDiv.style.marginTop='12px';
      const chartIds = ['caloriesChart','macrosChart','weeklyChart'];
      chartIds.forEach(id => {
        const c = el(id);
        if (c && typeof c.toDataURL === 'function') {
          const img = new Image();
          img.src = c.toDataURL('image/png');
          img.style.maxWidth='100%';
          img.style.display='block';
          img.style.margin='8px 0';
          chartsDiv.appendChild(img);
        }
      });
      report.appendChild(chartsDiv);

      // entries table
      const table = document.createElement('table');
      table.style.width='100%'; table.style.borderCollapse='collapse'; table.style.fontSize='12px';
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th style="border:1px solid #ddd;padding:6px">Date</th><th style="border:1px solid #ddd;padding:6px">Meal</th><th style="border:1px solid #ddd;padding:6px">Food</th><th style="border:1px solid #ddd;padding:6px">Serving</th><th style="border:1px solid #ddd;padding:6px">Calories</th><th style="border:1px solid #ddd;padding:6px">Protein</th><th style="border:1px solid #ddd;padding:6px">Carbs</th><th style="border:1px solid #ddd;padding:6px">Fat</th><th style="border:1px solid #ddd;padding:6px">Fiber</th><th style="border:1px solid #ddd;padding:6px">Water</th></tr>';
      table.appendChild(thead);
      const tb = document.createElement('tbody');
      entries.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="border:1px solid #eee;padding:6px">${r.date||''}</td><td style="border:1px solid #eee;padding:6px">${r.meal_time||''}</td><td style="border:1px solid #eee;padding:6px">${r.food_name||''}</td><td style="border:1px solid #eee;padding:6px">${r.serving_size||''}</td><td style="border:1px solid #eee;padding:6px">${safeNumber(r.calories)}</td><td style="border:1px solid #eee;padding:6px">${safeNumber(r.protein)}</td><td style="border:1px solid #eee;padding:6px">${safeNumber(r.carbs)}</td><td style="border:1px solid #eee;padding:6px">${safeNumber(r.fat)}</td><td style="border:1px solid #eee;padding:6px">${safeNumber(r.fiber)}</td><td style="border:1px solid #eee;padding:6px">${safeNumber(r.water_intake)}</td>`;
        tb.appendChild(tr);
      });
      table.appendChild(tb);
      report.appendChild(table);

      // Use html2pdf if available
      const opt = { margin:0.4, filename:'diet_tracker_report.pdf', image:{type:'jpeg',quality:0.98}, html2canvas:{scale:2,useCORS:true}, jsPDF:{unit:'in',format:'a4',orientation:'portrait'} };
      if (window.html2pdf && typeof window.html2pdf === 'function') {
        try {
          // generate blob first
          const pdfBlob = await window.html2pdf().set(opt).from(report).outputPdf('blob');
          // try download
          try {
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = opt.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(()=>URL.revokeObjectURL(url),2000);
          } catch(err) {
            // fallback open new tab
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
            setTimeout(()=>URL.revokeObjectURL(url),60000);
          }
        } catch(err) {
          console.error(APP_PREFIX,'html2pdf error',err);
          showStatus('PDF generation failed','error');
        }
      } else {
        // if library not present, fallback: open entries as CSV in new tab
        exportCSV(entries);
      }
      showStatus('PDF ready', 'success');
    } catch(e){ console.error(APP_PREFIX,'exportPDF',e); showStatus('PDF export failed','error'); }
  }

  // Charts: lazy load Chart.js and render simple charts
  async function renderCharts(entries) {
    try {
      const canvasIds = ['caloriesChart','macrosChart','weeklyChart'];
      const existing = canvasIds.map(id => el(id)).filter(Boolean);
      if (existing.length===0) return;
      // load Chart.js from CDN if not present
      if (!window.Chart) {
        await new Promise((res,rej)=>{
          const s=document.createElement('script');
          s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
          s.onload=res; s.onerror=rej; document.head.appendChild(s);
        });
      }
      // calories over time line (weekly)
      try {
        const caloriesCanvas = el('caloriesChart');
        if (caloriesCanvas) {
          const labels = entries.map(e=>e.date||'');
          const data = entries.map(e=>safeNumber(e.calories));
          new Chart(caloriesCanvas.getContext('2d'), { type:'line', data:{ labels, datasets:[{label:'Calories', data, fill:false, tension:0.3}] }, options:{responsive:true} });
        }
      } catch(e){ console.warn(APP_PREFIX,'caloriesChart render',e); }

      // macros donut
      try {
        const macrosCanvas = el('macrosChart');
        if (macrosCanvas) {
          const last = entries.length?entries[entries.length-1]:null;
          const protein = safeNumber(last && last.protein);
          const carbs = safeNumber(last && last.carbs);
          const fat = safeNumber(last && last.fat);
          new Chart(macrosCanvas.getContext('2d'), { type:'doughnut', data:{ labels:['Protein','Carbs','Fat'], datasets:[{data:[protein,carbs,fat]}] }, options:{responsive:true} });
        }
      } catch(e){ console.warn(APP_PREFIX,'macrosChart render',e); }

    } catch(e){ console.error(APP_PREFIX,'renderCharts',e); }
  }

  // Initialization
  function init() {
    try {
      const entries = loadEntries();
      renderEntries(entries);
      renderTotals(entries);
      hookAddEntry(entries);

      // wire export buttons
      const csvBtn = el('exportCSV'); if (csvBtn) csvBtn.addEventListener('click', ()=> exportCSV(entries));
      const pdfBtn = el('exportPDF'); if (pdfBtn) pdfBtn.addEventListener('click', ()=> exportPDF(entries));
      const xlsxBtn = el('exportXLSX'); if (xlsxBtn) xlsxBtn.addEventListener('click', ()=> exportCSV(entries)); // fallback to CSV

      // Try to render charts after a short delay (give page time to load canvases)
      setTimeout(()=>renderCharts(entries), 800);

      console.log(APP_PREFIX, 'Initialized with', entries.length, 'entries');
    } catch(e){ console.error(APP_PREFIX,'init',e); }
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // expose for debug
  window.dietTracker = { init, exportCSV, exportPDF };
})();