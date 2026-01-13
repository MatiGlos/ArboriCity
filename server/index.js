process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import dotenv from 'dotenv'; // 1. Importar dotenv

dotenv.config(); // 2. Cargar variables de entorno

const app = express();
const port = process.env.PORT || 5000; // 3. Usar puerto dinámico

// Configuración de Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// Probar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error adquiriendo cliente:', err.stack);
  }
  console.log('🚀 Conexión exitosa a Supabase PostgreSQL');
  release();
});

// obtener arboles
app.get('/api/arboles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM arboles ORDER BY id_arbol DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guardar
app.post('/api/arboles', async (req, res) => {
  const { nom_arbol, nom_cientifico, especie, edad, altura, estado, lat, lng, descripcion, imagen } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO arboles (nom_arbol, nom_cientifico, especie, edad, altura, estado, lat, lng, descripcion, imagen) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [nom_arbol, nom_cientifico, especie, edad, altura, estado, lat, lng, descripcion, imagen]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar
app.put('/api/arboles/:id', async (req, res) => {
  const { id } = req.params;
  const { nom_arbol, nom_cientifico, especie, edad, altura, estado, descripcion, imagen } = req.body;
  try {
    const result = await pool.query(
      'UPDATE arboles SET nom_arbol=$1, nom_cientifico=$2, especie=$3, edad=$4, altura=$5, estado=$6, descripcion=$7, imagen=$8 WHERE id_arbol=$9 RETURNING *',
      [nom_arbol, nom_cientifico, especie, edad, altura, estado, descripcion, imagen, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar 
app.delete('/api/arboles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM arboles WHERE id_arbol = $1', [req.params.id]);
    res.json({ message: "Árbol eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});