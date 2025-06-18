// =================================================================
// SCRIPT.JS - VERSÃO FINAL E COMPLETA DA FASE 1
// =================================================================

// =================================================================
// CONFIGURAÇÕES GLOBAIS E INICIALIZAÇÃO
// =================================================================
const API_URL = 'http://localhost:3000/api';
let MODAL_ATLETA;
let FORM_ATLETA;

const TITULOS_SECAO = {
    dashboard: 'Dashboard',
    atletas: 'Cadastro de Atletas',
    financeiro: 'Controle Financeiro',
    rachas: 'Gestão de Rachas',
    ranking: 'Rankings e Histórico'
};

document.addEventListener('DOMContentLoaded', () => {
    MODAL_ATLETA = document.getElementById('modal-atleta');
    FORM_ATLETA = document.getElementById('form-atleta');

    setupNavigation();
    setupEventListeners();
    setupSidebarToggle();
    setupStarRating();
    
    // Verifica se há uma aba salva, senão, vai para o dashboard
    const ultimaSecao = localStorage.getItem('ultimaSecaoAtiva');
    navegarPara(ultimaSecao || 'dashboard');
});

// =================================================================
// FUNÇÕES DE SETUP GERAL
// =================================================================

function setupNavigation() {
    document.querySelectorAll('.nav-link:not(#sidebar-toggle)').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navegarPara(link.dataset.target);
        });
    });
}

function setupEventListeners() {
    document.getElementById('btn-novo-atleta').addEventListener('click', () => AtletasModule.abrirModalParaCriar());
    document.getElementById('btn-fechar-modal').addEventListener('click', () => AtletasModule.fecharModal());
    MODAL_ATLETA.addEventListener('click', (e) => { if (e.target === MODAL_ATLETA) AtletasModule.fecharModal(); });
    FORM_ATLETA.addEventListener('submit', (e) => AtletasModule.salvarAtleta(e));
}

function setupSidebarToggle() {
    const toggleButton = document.getElementById('sidebar-toggle');
    if (!toggleButton) return;
    const body = document.body;
    if (localStorage.getItem('sidebarState') === 'collapsed') {
        body.classList.add('sidebar-collapsed');
    }
    toggleButton.addEventListener('click', () => {
        body.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebarState', body.classList.contains('sidebar-collapsed') ? 'collapsed' : 'expanded');
    });
}

function navegarPara(sectionId) {
    if (!TITULOS_SECAO[sectionId]) sectionId = 'dashboard';

    document.querySelectorAll('.nav-link:not(#sidebar-toggle)').forEach(link => link.classList.toggle('active', link.dataset.target === sectionId));
    document.querySelectorAll('.content').forEach(content => content.classList.toggle('active', content.id === sectionId));
    document.getElementById('main-title').textContent = TITULOS_SECAO[sectionId];
    feather.replace();

    localStorage.setItem('ultimaSecaoAtiva', sectionId);

    if (sectionId === 'atletas') AtletasModule.init();
}

function setupStarRating() {
    const container = document.getElementById('star-rating');
    const hiddenInput = document.getElementById('nivel_habilidade');
    if (!container || !hiddenInput) return;

    const getStars = () => container.querySelectorAll('svg');

    container.addEventListener('mouseover', e => {
        const starIcon = e.target.closest('svg');
        if (starIcon) {
            const hoverValue = starIcon.dataset.value;
            getStars().forEach(star => {
                star.classList.toggle('hover', star.dataset.value <= hoverValue);
            });
        }
    });

    container.addEventListener('mouseout', () => getStars().forEach(star => star.classList.remove('hover')));

    container.addEventListener('click', e => {
        const starIcon = e.target.closest('svg');
        if (starIcon) {
            const selectedValue = starIcon.dataset.value;
            hiddenInput.value = selectedValue;
            getStars().forEach(star => {
                star.classList.toggle('selected', star.dataset.value <= selectedValue);
            });
        }
    });
}

// =================================================================
// MÓDULO DE ATLETAS
// =================================================================
const AtletasModule = {
    statusAtivo: 'Mensalista',
    initialized: false,
    init() {
        if (!this.initialized) {
            this.setupTabListeners();
            this.initialized = true;
        }
        const abaAtiva = document.querySelector('#atletas .tab-button.active') || document.querySelector('#atletas .tab-button');
        this.carregarLista(abaAtiva.dataset.status);
    },
    setupTabListeners() {
        document.querySelectorAll('#atletas .tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.statusAtivo = button.dataset.status;
                document.querySelectorAll('#atletas .tab-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.carregarLista(this.statusAtivo);
            });
        });
    },
    abrirModalParaCriar() {
        FORM_ATLETA.reset();
        document.getElementById('atleta-id').value = '';
        document.getElementById('modal-titulo').textContent = 'Adicionar Novo Atleta';
        document.getElementById('status').value = this.statusAtivo;
        document.getElementById('nivel_habilidade').value = '';
        document.querySelectorAll('#star-rating svg').forEach(star => star.classList.remove('selected'));
        MODAL_ATLETA.classList.add('visible');
        feather.replace();
    },
    abrirModalParaEditar(atleta) {
        FORM_ATLETA.reset();
        document.getElementById('atleta-id').value = atleta.id;
        document.getElementById('nome').value = atleta.nome;
        document.getElementById('contato').value = atleta.contato || '';
        document.getElementById('data_inicio').value = atleta.data_inicio.split('T')[0];
        document.getElementById('status').value = atleta.status;
        document.getElementById('observacoes').value = atleta.observacoes || '';
        document.getElementById('modal-titulo').textContent = `Editando: ${atleta.nome}`;
        
        const hiddenInput = document.getElementById('nivel_habilidade');
        const nivel = atleta.nivel_habilidade || '3';
        hiddenInput.value = nivel;
        setTimeout(() => {
            document.querySelectorAll('#star-rating svg').forEach(star => {
                star.classList.toggle('selected', star.dataset.value <= nivel);
            });
        }, 50);
        MODAL_ATLETA.classList.add('visible');
    },
    fecharModal() { MODAL_ATLETA.classList.remove('visible'); },
    async carregarLista(status) {
        const tbody = document.getElementById('lista-atletas-tbody');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem;">Carregando...</td></tr>`;
        try {
            const response = await fetch(`${API_URL}/atletas?status=${status}`);
            const data = await response.json();
            this.renderizarTabela(data.atletas);
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--cor-perigo);">Falha ao carregar dados.</td></tr>`;
        }
    },
    renderizarTabela(atletas) {
        const tbody = document.getElementById('lista-atletas-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (atletas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem;">Nenhum atleta encontrado.</td></tr>`;
            return;
        }
        atletas.forEach(atleta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${atleta.nome}</td>
                <td>${atleta.contato || 'N/A'}</td>
                <td>${new Date(atleta.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td>
                    <button class="action-button" onclick='AtletasModule.abrirModalParaEditar(${JSON.stringify(atleta)})'><i data-feather="edit-2"></i></button>
                    <button class="action-button" onclick='AtletasModule.deletarAtleta(${atleta.id}, "${atleta.nome}")'><i data-feather="trash-2"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        feather.replace();
    },
    async deletarAtleta(id, nome) {
        if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
        try {
            const response = await fetch(`${API_URL}/atletas/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error((await response.json()).message);
            this.carregarLista(this.statusAtivo);
        } catch (error) { alert(`Não foi possível excluir: ${error.message}`); }
    },
    async salvarAtleta(event) {
        event.preventDefault();
        const id = document.getElementById('atleta-id').value;
        const atletaData = {
            nome: document.getElementById('nome').value,
            contato: document.getElementById('contato').value,
            data_inicio: document.getElementById('data_inicio').value,
            status: document.getElementById('status').value,
            nivel_habilidade: document.getElementById('nivel_habilidade').value,
            observacoes: document.getElementById('observacoes').value,
        };
        if (!atletaData.nivel_habilidade) return alert('Por favor, selecione um nível de habilidade.');
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/atletas/${id}` : `${API_URL}/atletas`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(atletaData) });
            if (!response.ok) throw new Error((await response.json()).error);
            this.fecharModal();
            const targetTab = document.querySelector(`#atletas .tab-button[data-status="${atletaData.status}"]`);
            if (targetTab) targetTab.click();
        } catch (error) { alert(`Não foi possível salvar: ${error.message}`); }
    }
};