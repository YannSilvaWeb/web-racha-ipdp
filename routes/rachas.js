
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const db = new sqlite3.Database('./racha_v2.db', (err) => {
    if (err) console.error("Erro ao conectar ao banco de dados em 'rachas.js'", err.message);
});

// ROTA PARA CRIAR UM NOVO RACHA (EVENTO)
router.post('/', (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res.status(400).json({ error: "A data é obrigatória." });
    }

    const sql = `INSERT INTO rachas_semanais (data) VALUES (?)`;
    db.run(sql, [data], function (err) {
        if (err) {
            // Trata o erro de data duplicada
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Já existe um racha agendado para esta data." });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Racha agendado com sucesso!", id: this.lastID });
    });
});

// ROTA PARA LISTAR TODOS OS RACHAS AGENDADOS/PASSADOS
router.get('/', (req, res) => {
    const sql = `SELECT * FROM rachas_semanais ORDER BY data DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ rachas: rows });
    });
});

// --- Rotas futuras virão aqui (listar presença, confirmar, etc.) ---

module.exports = router;