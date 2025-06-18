// =================================================================
// SCRIPT.JS - VERSÃO FINAL E CORRIGIDA DA FASE 1
// =================================================================
const API_URL = 'http://localhost:3000/api';
let MODAL_ATLETA;
let FORM_ATleta;

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
    
    document.querySelector('.nav-link[data-target="dashboard"]').click();
});

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.id === 'sidebar-toggle') return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            if (targetId) navegarPara(targetId);
        });
    });
}

function setupEventListeners() {
    document.getElementById('btn-novo-atleta').addEventListener('click', () => AtletasModule.abrirModalParaCriar());
    document.getElementById('btn-fechar-modal').addEventListener('click', () => AtletasModule.fecharModal());
    MODAL_ATLETA.addEventListener('click', (e) => {
        if (e.target === MODAL_ATLETA) AtletasModule.fecharModal();
    });
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
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.id === 'sidebar-toggle') return;
        link.classList.toggle('active', link.dataset.target === sectionId);
    });
    document.querySelectorAll('.content').forEach(content => {
        content.classList.toggle('active', content.id === sectionId);
    });
    document.getElementById('main-title').textContent = TITULOS_SECAO[sectionId];
    feather.replace();
    if (sectionId === 'atletas') AtletasModule.init();
}

const AtletasModule = {
    statusAtivo: 'Mensalista',
    initialized: false,
    init() {
        if (!this.initialized) {
            this.setupTabListeners();
            this.initialized = true;
        }
        const abaAtiva = document.querySelector('#atletas .tab-button.active');
        this.carregarLista(abaAtiva ? abaAtiva.dataset.status : this.statusAtivo);
    },
    setupTabListeners() {
        document.querySelectorAll('#atletas .tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const status = button.dataset.status;
                this.statusAtivo = status;
                document.querySelectorAll('#atletas .tab-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.carregarLista(status);
            });
        });
    },
    abrirModalParaCriar() {
        FORM_ATLETA.reset();
        document.getElementById('atleta-id').value = '';
        document.getElementById('modal-titulo').textContent = 'Adicionar Novo Atleta';
        document.getElementById('status').value = this.statusAtivo;
        MODAL_ATLETA.classList.add('visible');
    },
    abrirModalParaEditar(atleta) {
        FORM_ATLETA.reset();
        document.getElementById('atleta-id').value = atleta.id;
        document.getElementById('nome').value = atleta.nome;
        document.getElementById('contato').value = atleta.contato || '';
        document.getElementById('data_inicio').value = atleta.data_inicio.split('T')[0];
        document.getElementById('status').value = atleta.status;
        document.getElementById('nivel_habilidade').value = atleta.nivel_habilidade || '3';
        document.getElementById('observacoes').value = atleta.observacoes || '';
        document.getElementById('modal-titulo').textContent = `Editando: ${atleta.nome}`;
        MODAL_ATLETA.classList.add('visible');
    },
    fecharModal() {
        MODAL_ATLETA.classList.remove('visible');
    },
    async carregarLista(status) {
        const tbody = document.getElementById('lista-atletas-tbody');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">Carregando...</td></tr>`;
        try {
            const response = await fetch(`${API_URL}/atletas?status=${status}`);
            if (!response.ok) throw new Error('Falha na resposta da rede');
            const data = await response.json();
            this.renderizarTabela(data.atletas);
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--cor-perigo);">Falha ao carregar dados.</td></tr>`;
        }
    },
    renderizarTabela(atletas) {
        const tbody = document.getElementById('lista-atletas-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (atletas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">Nenhum atleta encontrado.</td></tr>`;
            return;
        }
        atletas.forEach(atleta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${atleta.nome}</td>
                <td>${atleta.contato || 'N/A'}</td>
                <td>${atleta.status}</td>
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
            if (!response.ok) throw new Error((await response.json()).message || 'Falha ao excluir.');
            this.carregarLista(this.statusAtivo);
        } catch (error) {
            alert(`Não foi possível excluir: ${error.message}`);
        }
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
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/atletas/${id}` : `${API_URL}/atletas`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(atletaData) });
            if (!response.ok) throw new Error((await response.json()).error || 'Falha ao salvar.');
            this.fecharModal();
            const targetTab = document.querySelector(`#atletas .tab-button[data-status="${atletaData.status}"]`);
            if (targetTab) targetTab.click();
        } catch (error) {
            alert(`Não foi possível salvar: ${error.message}`);
        }
    }
};