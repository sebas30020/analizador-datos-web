// js/app.js
document.addEventListener('DOMContentLoaded', async () => {
    const experimentListEl = document.getElementById('experiment-list');
    const experimentViewEl = document.getElementById('experiment-view');
    const sidebarEl = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    
    // Toggle Sidebar listener
    toggleSidebarBtn.addEventListener('click', () => {
        sidebarEl.classList.toggle('collapsed');
    });

    let selectedExperimentId = null;
    let experiments = window.APP_DATA || [];

    renderSidebar();

    function renderSidebar() {
        experimentListEl.innerHTML = '';
        experiments.forEach(exp => {
            const item = document.createElement('div');
            item.className = 'experiment-item';
            item.dataset.id = exp.id;
            
            const label = document.createElement('span');
            label.textContent = exp.name;
            label.style.pointerEvents = 'none'; // so clicks go to the item
            
            item.appendChild(label);
            
            item.addEventListener('click', () => {
                selectExperiment(exp.id);
            });
            
            experimentListEl.appendChild(item);
        });
    }

    function selectExperiment(id) {
        selectedExperimentId = id;
        
        document.querySelectorAll('.experiment-item').forEach(el => {
            if (el.dataset.id === id) {
                el.classList.add('selected');
            } else {
                el.classList.remove('selected');
            }
        });
        
        renderExperimentView();
    }

    function renderExperimentView() {
        experimentViewEl.innerHTML = '';
        
        if (!selectedExperimentId) {
            experimentViewEl.innerHTML = `
                <div class="empty-state">
                    <p>No hay experimento seleccionado.</p>
                </div>
            `;
            return;
        }

        const exp = experiments.find(e => e.id === selectedExperimentId);
        
        const metadata = {
            tension_kv: exp.tension_kv || "N/A",
            pollution: exp.pollution || "N/A",
            flash_over: exp.flash_over || "N/A",
            descripcion: exp.descripcion || "Metadatos no disponibles."
        };

        const initialImgPath = `data/exp_${selectedExperimentId}/metrica_combinada_exp${selectedExperimentId}.png`;
        
        const container = document.createElement('div');
        container.className = 'experiment-detail';
        container.style.cssText = 'background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px; animation: fadeIn 0.4s; display: flex; flex-direction: column; gap: 20px;';
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 300px;">
                    <h2 style="color: var(--accent); margin: 0 0 15px 0; font-size: 1.8rem;">${exp.name}</h2>
                    <div class="metadata-grid" style="margin-bottom: 0;">
                        <div class="meta-item">
                            <span class="meta-label">Tensión (kV)</span>
                            <span class="meta-value">${metadata.tension_kv || '-'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Polución</span>
                            <span class="meta-value">${metadata.pollution || '-'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Flashover</span>
                            <span class="meta-value">${metadata.flash_over || '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="controls" style="display: flex; gap: 15px; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap;">
                    <div>
                        <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px;">Métrica</label>
                        <select id="metric-select" style="background: var(--bg-main); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 4px; font-size: 0.95rem; outline: none; cursor: pointer;">
                            <option value="combinada">Combinada</option>
                            <option value="feq">FEQ</option>
                            <option value="vpp">VPP</option>
                            <option value="teq">TEQ</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px;">Alcance</label>
                        <select id="scope-select" style="background: var(--bg-main); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 4px; font-size: 0.95rem; outline: none; cursor: pointer;">
                            <option value="completa">Serie Completa</option>
                            <option value="ciclo">Por Ciclo</option>
                        </select>
                    </div>
                    <div id="cycle-container" style="display: none;">
                        <label style="display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px;">Ciclo #</label>
                        <input type="number" id="cycle-input" min="1" value="1" style="background: var(--bg-main); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 4px; width: 70px; font-size: 0.95rem; outline: none;">
                    </div>
                </div>
            </div>
            
            <div class="image-viewer" style="background: #ffffff; padding: 20px; border-radius: 8px; text-align: center; min-height: 400px; display: flex; justify-content: center; align-items: center; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);">
                <img id="main-chart" src="${initialImgPath}" alt="Gráfica de ${exp.name}" style="max-width: 100%; max-height: 70vh; object-fit: contain; transition: opacity 0.3s;" onerror="this.onerror=null; this.src='https://placehold.co/1000x500/121216/A0A0AB?text=Gráfica+No+Disponible';">
            </div>
            
            <div class="card-comments" style="margin-bottom: 0;">
                <b style="color: #fff;">Comentarios del Experimento:</b><br><br>${metadata.descripcion || 'Sin comentarios.'}
            </div>
        `;
        
        experimentViewEl.appendChild(container);
        
        // Bind events
        const metricSelect = document.getElementById('metric-select');
        const scopeSelect = document.getElementById('scope-select');
        const cycleContainer = document.getElementById('cycle-container');
        const cycleInput = document.getElementById('cycle-input');
        const mainChart = document.getElementById('main-chart');
        
        function updateChartImage() {
            const metric = metricSelect.value;
            const scope = scopeSelect.value;
            const cycle = cycleInput.value;
            
            let imgName = '';
            
            if (scope === 'completa') {
                if (metric === 'combinada') {
                    imgName = `metrica_combinada_exp${selectedExperimentId}.png`;
                } else {
                    imgName = `metrica_${metric}_exp${selectedExperimentId}.png`;
                }
            } else {
                // By cycle
                if (metric === 'combinada') {
                    imgName = `metrica_combinada_exp${selectedExperimentId}_ciclo${cycle}.png`;
                } else {
                    imgName = `metrica_${metric}_exp${selectedExperimentId}_ciclo${cycle}.png`;
                }
            }
            
            const newSrc = `data/exp_${selectedExperimentId}/${imgName}`;
            
            // Adding a small fade effect
            mainChart.style.opacity = '0.5';
            setTimeout(() => {
                mainChart.src = newSrc;
                mainChart.style.opacity = '1';
            }, 150);
        }

        metricSelect.addEventListener('change', updateChartImage);
        
        scopeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'ciclo') {
                cycleContainer.style.display = 'block';
            } else {
                cycleContainer.style.display = 'none';
            }
            updateChartImage();
        });
        
        cycleInput.addEventListener('input', updateChartImage);
        cycleInput.addEventListener('change', updateChartImage);
    }
});
