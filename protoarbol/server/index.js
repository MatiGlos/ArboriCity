import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';

const app = express();
const port = 5000;

// Configuración de Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const pool = new Pool({
  user: 'postgres',           
  host: 'localhost',
  database: 'Catastro Arboreo',    
  password: 'arbol123',    
  port: 5432,
});

// 1. OBTENER TODOS LOS ÁRBOLES
app.get('/api/arboles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM arboles ORDER BY id_arbol DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// guardar
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

// actualizar (PUT)
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

// eliminar (DELETE)
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