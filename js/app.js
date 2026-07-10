// js/app.js
document.addEventListener('DOMContentLoaded', async () => {
    const experimentListEl = document.getElementById('experiment-list');
    const gridContainerEl = document.getElementById('grid-container');
    const sidebarEl = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    
    // Toggle Sidebar listener
    toggleSidebarBtn.addEventListener('click', () => {
        sidebarEl.classList.toggle('collapsed');
    });

    let experiments = [];
    let selectedExperiments = new Set();

    let experiments = window.APP_DATA || [];

    renderSidebar();

    function renderSidebar() {
        experimentListEl.innerHTML = '';
        experiments.forEach(exp => {
            const item = document.createElement('div');
            item.className = 'experiment-item';
            item.dataset.id = exp.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selectedExperiments.has(exp.id);
            
            const label = document.createElement('span');
            label.textContent = exp.name;
            
            item.appendChild(checkbox);
            item.appendChild(label);
            
            item.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
                toggleExperiment(exp.id, checkbox.checked);
            });
            
            experimentListEl.appendChild(item);
        });
    }

    function toggleExperiment(id, isSelected) {
        if (isSelected) {
            selectedExperiments.add(id);
        } else {
            selectedExperiments.delete(id);
        }
        
        document.querySelectorAll('.experiment-item').forEach(el => {
            if (selectedExperiments.has(el.dataset.id)) {
                el.classList.add('selected');
            } else {
                el.classList.remove('selected');
            }
        });
        
        renderGrid();
    }

    function renderGrid() {
        gridContainerEl.innerHTML = '';
        
        if (selectedExperiments.size === 0) {
            gridContainerEl.innerHTML = `
                <div class="empty-state">
                    <p>No hay experimentos seleccionados.</p>
                </div>
            `;
            return;
        }

        const sortedIds = Array.from(selectedExperiments).sort((a,b) => parseInt(a) - parseInt(b));

        for (const expId of sortedIds) {
            const exp = experiments.find(e => e.id === expId);
            const card = document.createElement('div');
            card.className = 'experiment-card';
            
            const metadata = {
                tension_kv: exp.tension_kv || "N/A",
                pollution: exp.pollution || "N/A",
                flash_over: exp.flash_over || "N/A",
                descripcion: exp.descripcion || "Metadatos no disponibles."
            };

            const imgPath = `data/exp_${expId}/metrica_combinada_exp${expId}.png`;
            
            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>${exp.name}</h3>
                    <select class="metric-select" data-exp="${expId}" style="background: var(--bg-main); color: var(--text-primary); border: 1px solid var(--border-color); padding: 5px; border-radius: 4px; font-size: 0.85rem; cursor: pointer; outline: none;">
                        <option value="combinada">Vista Combinada</option>
                        <option value="feq">Solo FEQ</option>
                        <option value="vpp">Solo VPP</option>
                        <option value="teq">Solo TEQ</option>
                    </select>
                </div>
                <div class="card-image">
                    <img id="img-${expId}" src="${imgPath}" alt="${exp.name}" onerror="this.onerror=null; this.src='https://placehold.co/800x400/121216/A0A0AB?text=Gráfica+Exp+${expId}+No+Encontrada';">
                </div>
                <div class="card-metadata">
                    <div class="metadata-grid">
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
                    <div class="card-comments"><b>Comentarios del Experimento:</b><br><br>${metadata.descripcion || 'Sin comentarios.'}</div>
                </div>
            `;
            gridContainerEl.appendChild(card);
        }

        // Bind events to dropdowns
        document.querySelectorAll('.metric-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const expId = e.target.dataset.exp;
                const metric = e.target.value;
                const imgEl = document.getElementById(`img-${expId}`);
                if (metric === 'combinada') {
                    imgEl.src = `data/exp_${expId}/metrica_combinada_exp${expId}.png`;
                } else {
                    imgEl.src = `data/exp_${expId}/metrica_${metric}_exp${expId}.png`;
                }
            });
        });
    }
});
