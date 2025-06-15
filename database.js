// =================================================================
// INICIALIZAÇÃO DO BANCO DE DADOS
// Este script é executado uma única vez para criar o arquivo de banco
// de dados e definir a estrutura (schema) de todas as tabelas.
// =================================================================

// Importa o driver do SQLite para interagir com o banco de dados.
const sqlite3 = require('sqlite3').verbose();

// Cria ou conecta-se ao arquivo de banco de dados 'racha_v2.db'.
const db = new sqlite3.Database('./racha_v2.db', (err) => {
    if (err) return console.error("Erro ao conectar ao banco de dados", err.message);
    console.log('Conectado ao banco de dados racha_v2.db.');
    createTables();
});

// Função principal que contém as queries para criar as tabelas.
function createTables() {
    console.log("Verificando e criando tabelas se necessário...");

    const queries = [
        // Tabela para armazenar todos os participantes do racha.
        `CREATE TABLE IF NOT EXISTS atletas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            contato TEXT,
            status TEXT NOT NULL DEFAULT 'Convidado',
            nivel_habilidade INTEGER NOT NULL CHECK(nivel_habilidade BETWEEN 1 AND 5),
            data_inicio TEXT NOT NULL,
            observacoes TEXT
        )`,
        // Tabela para registrar transações financeiras gerais (pagamentos de convidados, despesas).
        `CREATE TABLE IF NOT EXISTS financas_transacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            descricao TEXT NOT NULL,
            valor REAL NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('Receita', 'Despesa')),
            categoria TEXT,
            atleta_id INTEGER,
            FOREIGN KEY (atleta_id) REFERENCES atletas (id)
        )`,
        // Tabela dedicada para controlar o pagamento das mensalidades.
        `CREATE TABLE IF NOT EXISTS pagamentos_mensalidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            atleta_id INTEGER NOT NULL,
            ano INTEGER NOT NULL,
            mes INTEGER NOT NULL,
            data_pagamento TEXT,
            FOREIGN KEY (atleta_id) REFERENCES atletas (id),
            UNIQUE(atleta_id, ano, mes)
        )`,
        // Tabela para agendar cada evento de racha semanal.
        `CREATE TABLE IF NOT EXISTS rachas_semanais (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL DEFAULT 'Agendado'
        )`,
        // Tabela de associação para registrar quem participou de cada racha.
        `CREATE TABLE IF NOT EXISTS presencas (
            racha_id INTEGER NOT NULL,
            atleta_id INTEGER NOT NULL,
            FOREIGN KEY (racha_id) REFERENCES rachas_semanais (id),
            FOREIGN KEY (atleta_id) REFERENCES atletas (id),
            PRIMARY KEY (racha_id, atleta_id)
        )`,
        // Tabela para armazenar os resultados e alimentar os rankings.
        `CREATE TABLE IF NOT EXISTS historico_resultados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            racha_id INTEGER NOT NULL UNIQUE,
            time_campeao TEXT,
            jogadores_vitoriosos TEXT,
            FOREIGN KEY (racha_id) REFERENCES rachas_semanais (id)
        )`,
        // Tabela para controle de materiais do racha.
        `CREATE TABLE IF NOT EXISTS inventario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item TEXT NOT NULL UNIQUE,
            quantidade INTEGER NOT NULL DEFAULT 0
        )`
    ];

    // Executa cada uma das queries para garantir que as tabelas existam.
    db.serialize(() => {
        queries.forEach((query) => {
            db.run(query, (err) => {
                if (err) console.error("Erro ao executar query:", err.message);
            });
        });
        console.log("Estrutura do banco de dados verificada com sucesso.");
    });

    // Fecha a conexão com o banco de dados.
    db.close((err) => {
        if (err) return console.error(err.message);
        console.log('Conexão com o banco de dados fechada após setup.');
    });
}