// =================================================================
// MÓDULO DE ROTAS: ATLETAS
// Este arquivo define todas as rotas da API relacionadas a atletas.
// =================================================================

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Conecta-se ao banco de dados.
const db = new sqlite3.Database('./racha_v2.db');

// =================================================================
// ROTA: GET /api/atletas
// OBJETIVO: Listar todos os atletas, com filtro opcional por status.
// =================================================================
router.get('/', (req, res) => {
    const { status } = req.query; // Ex: /api/atletas?status=Mensalista
    let sql = `SELECT * FROM atletas`; // Query base
    const params = [];

    if (status) {
        sql += ` WHERE status = ?`; // Adiciona filtro se o parâmetro 'status' for fornecido
        params.push(status);
    }
    sql += ` ORDER BY nome`;

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ atletas: rows });
    });
});

// =================================================================
// ROTA: POST /api/atletas
// OBJETIVO: Criar um novo atleta.
// =================================================================
router.post('/', (req, res) => {
    const { nome, contato, status, nivel_habilidade, data_inicio, observacoes } = req.body;
    const sql = `INSERT INTO atletas (nome, contato, status, nivel_habilidade, data_inicio, observacoes) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [nome, contato, status, nivel_habilidade, data_inicio, observacoes], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ message: "Atleta criado com sucesso!", id: this.lastID });
    });
});

// =================================================================
// ROTA: PUT /api/atletas/:id
// OBJETIVO: Atualizar um atleta existente pelo seu ID.
// =================================================================
router.put('/:id', (req, res) => {
    const { nome, contato, status, nivel_habilidade, data_inicio, observacoes } = req.body;
    const sql = `UPDATE atletas SET nome = ?, contato = ?, status = ?, nivel_habilidade = ?, data_inicio = ?, observacoes = ? WHERE id = ?`;
    db.run(sql, [nome, contato, status, nivel_habilidade, data_inicio, observacoes, req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Atleta atualizado com sucesso!", changes: this.changes });
    });
});

// =================================================================
// ROTA: DELETE /api/atletas/:id
// OBJETIVO: Excluir um atleta pelo seu ID.
// =================================================================
router.delete('/:id', (req, res) => {
    const sql = `DELETE FROM atletas WHERE id = ?`;
    db.run(sql, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Atleta não encontrado." });
        res.json({ message: "Atleta excluído com sucesso!" });
    });
});

// Exporta o router para ser usado no server.js
module.exports = router;