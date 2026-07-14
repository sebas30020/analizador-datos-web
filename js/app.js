// js/app.js
document.addEventListener('DOMContentLoaded', async () => {
    const sidebarListEl = document.getElementById('sidebar-list');
    const sidebarTitleEl = document.getElementById('sidebar-title');
    const gridViewEl = document.getElementById('grid-view');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const sidebarEl = document.getElementById('sidebar');
    
    const modeABtn = document.getElementById('mode-a-btn');
    const modeBBtn = document.getElementById('mode-b-btn');
    
    const viewTitleEl = document.getElementById('view-title');
    const viewSubtitleEl = document.getElementById('view-subtitle');
    const metadataContainer = document.getElementById('metadata-container');

    const modeChunkBtn = document.getElementById('mode-chunk-btn');
    const modeGroupBtn = document.getElementById('mode-group-btn');

    toggleSidebarBtn.addEventListener('click', () => {
        sidebarEl.classList.toggle('collapsed');
    });

    let experiments = window.APP_DATA || [];
    let currentMode = 'A'; // 'A' or 'B'
    let analysisMode = 'chunk'; // 'chunk' or 'group'
    let selectedId = null;

    // Todas las métricas posibles
    const METRICAS_NOMBRES = {
        "vpp": "Vpp",
        "kurtosis": "Kurtosis",
        "skewness": "Skewness",
        "tasa_pulsos": "Tasa de pulsos",
        "zcr": "ZCR",
        "delta_t": "Delta t",
        "log_delta_t": "log(Delta t)",
        "entropia_shannon": "Entropía de Shannon",
        "f_aprox": "Frecuencia Aproximada",
        "energia_chunk": "Energía por Chunk",
        "energia_rel": "Energía Relativa",
        "crest_factor": "Factor de Cresta"
    };
    
    const metricKeys = Object.keys(METRICAS_NOMBRES);

    modeABtn.addEventListener('click', () => setMode('A'));
    modeBBtn.addEventListener('click', () => setMode('B'));

    if (modeChunkBtn && modeGroupBtn) {
        modeChunkBtn.addEventListener('click', () => {
            analysisMode = 'chunk';
            modeChunkBtn.classList.add('active');
            modeGroupBtn.classList.remove('active');
            renderGrid();
        });

        modeGroupBtn.addEventListener('click', () => {
            analysisMode = 'group';
            modeGroupBtn.classList.add('active');
            modeChunkBtn.classList.remove('active');
            renderGrid();
        });
    }

    function setMode(mode) {
        currentMode = mode;
        selectedId = null;
        if (mode === 'A') {
            modeABtn.classList.add('active');
            modeBBtn.classList.remove('active');
            sidebarTitleEl.textContent = 'Experimentos';
            viewTitleEl.textContent = 'Dashboard: Experimento a detalle';
            viewSubtitleEl.textContent = 'Selecciona un experimento para ver todas sus métricas.';
        } else {
            modeBBtn.classList.add('active');
            modeABtn.classList.remove('active');
            sidebarTitleEl.textContent = 'Métricas';
            viewTitleEl.textContent = 'Dashboard: Comparativa de Métrica';
            viewSubtitleEl.textContent = 'Selecciona una métrica para comparar entre experimentos.';
        }
        metadataContainer.style.display = 'none';
        renderSidebar();
        renderGrid();
    }

    function renderSidebar() {
        sidebarListEl.innerHTML = '';
        
        let items = [];
        if (currentMode === 'A') {
            items = experiments.map(exp => ({ id: exp.id, label: exp.name }));
        } else {
            items = metricKeys.map(k => ({ id: k, label: METRICAS_NOMBRES[k] }));
        }

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'experiment-item';
            el.dataset.id = item.id;
            
            const label = document.createElement('span');
            label.textContent = item.label;
            label.style.pointerEvents = 'none';
            
            el.appendChild(label);
            
            el.addEventListener('click', () => {
                selectItem(item.id);
            });
            
            sidebarListEl.appendChild(el);
        });
        
        if (items.length > 0) {
            selectItem(items[0].id);
        }
    }

    function selectItem(id) {
        selectedId = id;
        
        document.querySelectorAll('.experiment-item').forEach(el => {
            if (el.dataset.id === id) {
                el.classList.add('selected');
            } else {
                el.classList.remove('selected');
            }
        });
        
        renderGrid();
    }

    function renderGrid() {
        gridViewEl.innerHTML = '';
        metadataContainer.style.display = 'none';
        metadataContainer.innerHTML = '';
        
        if (!selectedId) {
            gridViewEl.innerHTML = `
                <div class="empty-state">
                    <p>No hay selección.</p>
                </div>
            `;
            return;
        }

        if (currentMode === 'A') {
            // Un experimento, múltiples métricas
            const exp = experiments.find(e => e.id === selectedId);
            if (!exp) return;
            
            viewTitleEl.textContent = `Experimento: ${exp.name}`;
            viewSubtitleEl.textContent = exp.descripcion || "Visualización de todas las métricas disponibles.";
            
            metadataContainer.style.display = 'grid';
            metadataContainer.innerHTML = `
                <div class="meta-item">
                    <span class="meta-label">Tensión (kV)</span>
                    <span class="meta-value">${exp.tension_kv || '-'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Polución</span>
                    <span class="meta-value">${exp.pollution || '-'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Flashover</span>
                    <span class="meta-value">${exp.flash_over || '-'}</span>
                </div>
            `;

            const availableMetrics = exp.metricas_disponibles || metricKeys;

            availableMetrics.forEach(metric => {
                const title = METRICAS_NOMBRES[metric] || metric;
                const suffix = analysisMode === 'group' ? '_g5' : '';
                const imgSrc = `data/exp_${exp.id}/exp${exp.id}_${metric}${suffix}.png`;
                createGraphCard(title, imgSrc);
            });

        } else {
            // Una métrica, múltiples experimentos
            const metricKey = selectedId;
            const title = METRICAS_NOMBRES[metricKey];
            
            viewTitleEl.textContent = `Métrica: ${title}`;
            viewSubtitleEl.textContent = "Comparativa a lo largo de los distintos experimentos.";

            experiments.forEach(exp => {
                const availableMetrics = exp.metricas_disponibles || metricKeys;
                if (availableMetrics.includes(metricKey)) {
                    const suffix = analysisMode === 'group' ? '_g5' : '';
                    const imgSrc = `data/exp_${exp.id}/exp${exp.id}_${metricKey}${suffix}.png`;
                    createGraphCard(exp.name, imgSrc);
                }
            });
        }
    }

    function createGraphCard(title, imgSrc) {
        const card = document.createElement('div');
        card.className = 'graph-card';
        
        card.innerHTML = `
            <div class="graph-card-header">
                <h3>${title}</h3>
            </div>
            <div class="graph-image">
                <img src="${imgSrc}" alt="Gráfica de ${title}" onerror="this.onerror=null; this.src='https://placehold.co/800x400/ffffff/cccccc?text=No+Disponible';">
            </div>
        `;
        
        gridViewEl.appendChild(card);
    }

    setMode('A');
});
