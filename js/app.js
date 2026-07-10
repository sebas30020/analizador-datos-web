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

    try {
        const response = await fetch('data/index.json');
        if (!response.ok) throw new Error('No se pudo cargar el índice');
        experiments = await response.json();
    } catch (error) {
        console.warn("Usando datos dummy...");
        experiments = [
            { id: "17", name: "Exp 17" },
            { id: "18", name: "Exp 18" },
            { id: "19", name: "Exp 19" },
            { id: "20", name: "Exp 20" },
            { id: "21", name: "Exp 21" },
            { id: "22", name: "Exp 22" },
            { id: "23", name: "Exp 23" },
            { id: "24", name: "Exp 24" },
            { id: "26", name: "Exp 26" },
            { id: "27", name: "Exp 27" }
        ];
    }

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

    async function renderGrid() {
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
            
            card.innerHTML = `
                <div class="card-header">
                    <h3>${exp.name}</h3>
                </div>
                <div style="padding: 40px; text-align: center; color: var(--text-secondary);">Cargando metadatos...</div>
            `;
            gridContainerEl.appendChild(card);
            
            let metadata = null;
            try {
                const res = await fetch(`data/exp_${expId}/metadata.json?t=${new Date().getTime()}`);
                if (res.ok) metadata = await res.json();
            } catch (e) {}

            if (!metadata) {
                metadata = {
                    tension_kv: "N/A",
                    pollution: "N/A",
                    flash_over: "N/A",
                    descripcion: "Metadatos no disponibles."
                };
            }

            const imgPath = `data/exp_${expId}/metrica_combinada_exp${expId}.png`;
            
            card.innerHTML = `
                <div class="card-header">
                    <h3>${exp.name}</h3>
                </div>
                <div class="card-image">
                    <img src="${imgPath}" alt="${exp.name}" onerror="this.onerror=null; this.src='https://placehold.co/800x400/121216/A0A0AB?text=Gráfica+Exp+${expId}+No+Encontrada';">
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
        }
    }
});
