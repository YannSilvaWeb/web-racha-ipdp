// =================================================================
// MÓDULO DE ROTAS: RACHAS
// Este arquivo define todas as rotas da API relacionadas aos eventos
// de racha semanais.
// =================================================================

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Conecta-se ao banco de dados.
const db = new sqlite3.Database('./racha_v2.db');

// =================================================================
// ROTA: POST /api/rachas
// OBJETIVO: Criar um novo evento de racha para uma data específica.
// =================================================================
router.post('/', (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res.status(400).json({ error: "A data é obrigatória." });
    }

    const sql = `INSERT INTO rachas_semanais (data) VALUES (?)`;
    db.run(sql, [data], function (err) {
        if (err) {
            // Trata o erro específico de data duplicada (constraint UNIQUE)
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Já existe um racha agendado para esta data." });
            }
            return res.status(500).json({ error: err.message });
        }
        // Retorna sucesso com o ID do novo racha criado.
        res.status(201).json({ message: "Racha agendado com sucesso!", id: this.lastID });
    });
});

// =================================================================
// ROTA: GET /api/rachas
// OBJETIVO: Listar todos os rachas agendados e passados.
// =================================================================
router.get('/', (req, res) => {
    // Ordena por data descendente para mostrar os mais recentes primeiro.
    const sql = `SELECT * FROM rachas_semanais ORDER BY data DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ rachas: rows });
    });
});

// Futuramente, adicionaremos mais rotas aqui para gerenciar presenças, etc.

module.exports = router;