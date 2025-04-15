// Classe para gerenciar os CDs
class CDManager {
    constructor() {
        this.cds = [];
        this.searchTerm = '';
        this.loadCDs();
        this.setupSearch();
    }

    // Configura o campo de busca
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderCDs();
        });
    }

    // Carrega os CDs do localStorage
    loadCDs() {
        const storedCDs = localStorage.getItem('cds');
        if (storedCDs) {
            this.cds = JSON.parse(storedCDs);
        }
        this.renderCDs();
    }

    // Salva os CDs no localStorage
    saveCDs() {
        localStorage.setItem('cds', JSON.stringify(this.cds));
    }

    // Adiciona um novo CD
    addCD(cd) {
        this.cds.push(cd);
        this.saveCDs();
        this.renderCDs();
    }

    // Atualiza um CD existente
    updateCD(index, cd) {
        this.cds[index] = cd;
        this.saveCDs();
        this.renderCDs();
    }

    // Remove um CD
    deleteCD(index) {
        this.cds.splice(index, 1);
        this.saveCDs();
        this.renderCDs();
    }

    // Exporta os CDs para um arquivo de texto
    exportToFile() {
        const data = JSON.stringify(this.cds, null, 2);
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cds.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Importa CDs de um arquivo de texto
    importFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedCDs = JSON.parse(e.target.result);
                if (Array.isArray(importedCDs)) {
                    this.cds = importedCDs;
                    this.saveCDs();
                    this.renderCDs();
                    alert('Dados importados com sucesso!');
                } else {
                    alert('Formato de arquivo inválido!');
                }
            } catch (error) {
                alert('Erro ao importar arquivo: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Atualiza o contador de CDs
    updateCounter(filteredCDs) {
        document.getElementById('cdCount').textContent = filteredCDs.length;
    }

    // Filtra os CDs com base no termo de busca
    filterCDs() {
        if (!this.searchTerm) {
            return this.cds;
        }

        return this.cds.filter(cd => {
            const title = cd.title.toLowerCase();
            const author = (cd.author || '').toLowerCase();
            const genre = (cd.genre || '').toLowerCase();

            return title.includes(this.searchTerm) ||
                   author.includes(this.searchTerm) ||
                   genre.includes(this.searchTerm);
        });
    }

    // Renderiza a lista de CDs na tabela
    renderCDs() {
        const tbody = document.getElementById('cdTableBody');
        tbody.innerHTML = '';

        // Filtra e ordena os CDs
        const filteredCDs = this.filterCDs();
        const sortedCDs = [...filteredCDs].sort((a, b) => {
            return a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' });
        });

        sortedCDs.forEach((cd, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cd.title}</td>
                <td>${cd.author || '-'}</td>
                <td>${cd.duration ? cd.duration + ' min' : '-'}</td>
                <td>${cd.genre || '-'}</td>
                <td>${cd.price ? 'R$ ' + cd.price.toFixed(2) : '-'}</td>
                <td>${cd.favorite ? '⭐' : '-'}</td>
                <td class="action-buttons">
                    <button class="edit-btn" onclick="editCD(${this.cds.indexOf(cd)})">Editar</button>
                    <button class="delete-btn" onclick="deleteCD(${this.cds.indexOf(cd)})">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Atualiza o contador com os CDs filtrados
        this.updateCounter(filteredCDs);
    }
}

// Instância do gerenciador de CDs
const cdManager = new CDManager();

// Manipulador do formulário
document.getElementById('cdForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const cd = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value || null,
        duration: document.getElementById('duration').value ? parseInt(document.getElementById('duration').value) : null,
        genre: document.getElementById('genre').value || null,
        price: document.getElementById('price').value ? parseFloat(document.getElementById('price').value) : null,
        favorite: document.getElementById('favorite').checked
    };

    cdManager.addCD(cd);
    this.reset();
});

// Função para editar um CD
function editCD(index) {
    const cd = cdManager.cds[index];
    document.getElementById('title').value = cd.title;
    document.getElementById('author').value = cd.author || '';
    document.getElementById('duration').value = cd.duration || '';
    document.getElementById('genre').value = cd.genre || '';
    document.getElementById('price').value = cd.price || '';
    document.getElementById('favorite').checked = cd.favorite;

    // Remove o CD antigo
    cdManager.deleteCD(index);
}

// Função para excluir um CD
function deleteCD(index) {
    if (confirm('Tem certeza que deseja excluir este CD?')) {
        cdManager.deleteCD(index);
    }
}

// Manipuladores para exportação e importação
document.getElementById('exportBtn').addEventListener('click', () => {
    cdManager.exportToFile();
});

document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        cdManager.importFromFile(file);
    }
    e.target.value = ''; // Limpa o input para permitir importar o mesmo arquivo novamente
}); 