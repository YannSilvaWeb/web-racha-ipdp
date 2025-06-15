const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
// Usa o caminho absoluto para servir os arquivos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================================
// Bloco Único de Importação de Rotas
// ==========================================================
const atletasRoutes = require('./routes/atletas.js');
const rachasRoutes = require('./routes/rachas.js');
// Futuramente, outras rotas virão aqui...


// ==========================================================
// Bloco Único de Uso de Rotas
// ==========================================================
app.use('/api/atletas', atletasRoutes);
app.use('/api/rachas', rachasRoutes);
// Futuramente, outras rotas virão aqui...


app.listen(PORT, () => {
    console.log(`Servidor v2 rodando na porta ${PORT}`);
    console.log(`Acesse em http://localhost:${PORT}`);
});