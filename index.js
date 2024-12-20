const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

let concesionarios = [
  // Aquí iría el modelo de datos del concesionario que mencionamos antes
];

// Endpoints
app.get('/concesionarios', (req, res) => {
  res.json(concesionarios);
});

app.post('/concesionarios', (req, res) => {
  const { nombre, direccion } = req.body;
  const nuevoConcesionario = {
    id: concesionarios.length + 1,
    nombre,
    direccion,
    coches: []
  };
  concesionarios.push(nuevoConcesionario);
  res.status(201).json(nuevoConcesionario);
});

app.get('/concesionarios/:id', (req, res) => {
  const { id } = req.params;
  const concesionario = concesionarios.find(c => c.id === parseInt(id));
  if (concesionario) {
    res.json(concesionario);
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.put('/concesionarios/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, direccion } = req.body;
  const concesionario = concesionarios.find(c => c.id === parseInt(id));
  if (concesionario) {
    concesionario.nombre = nombre;
    concesionario.direccion = direccion;
    res.json(concesionario);
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.delete('/concesionarios/:id', (req, res) => {
  const { id } = req.params;
  const index = concesionarios.findIndex(c => c.id === parseInt(id));
  if (index !== -1) {
    concesionarios.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.get('/concesionarios/:id/coches', (req, res) => {
  const { id } = req.params;
  const concesionario = concesionarios.find(c => c.id === parseInt(id));
  if (concesionario) {
    res.json(concesionario.coches);
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.post('/concesionarios/:id/coches', (req, res) => {
  const { id } = req.params;
  const { modelo, cv, precio } = req.body;
  const concesionario = concesionarios.find(c => c.id === parseInt(id));
  if (concesionario) {
    const nuevoCoche = { modelo, cv, precio };
    concesionario.coches.push(nuevoCoche);
    res.status(201).json(nuevoCoche);
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.get('/concesionarios/:id/coches/:cocheId', (req, res) => {
  const { id, cocheId } = req.params;
  const concesionario = concesionarios.find(c => c.id === parseInt(id));
  if (concesionario) {
    const coche = concesionario.coches.find(c => c.id === parseInt(cocheId));
    if (coche) {
      res.json(coche);
    } else {
      res.status(404).send('Coche no encontrado');
    }
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.put('/concesionarios/:id/coches/:cocheId', (req, res) => {
  const { id, cocheId } = req.params;
  const { modelo, cv, precio } = req.body;
  const concesionario = concesionarios.find(c => c.id === parseInt(id));
  if (concesionario) {
    const coche = concesionario.coches.find(c => c.id === parseInt(cocheId));
    if (coche) {
      coche.modelo = modelo;
      coche.cv = cv;
      coche.precio = precio;
      res.json(coche);
    } else {
      res.status(404).send('Coche no encontrado');
    }
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.delete('/concesionarios/:id/coches/:cocheId', (req, res) => {
  const { id, cocheId } = req.params;
  const concesionario = concesionarios.find(c => c.id === parseInt(id));
  if (concesionario) {
    const index = concesionario.coches.findIndex(c => c.id === parseInt(cocheId));
    if (index !== -1) {
      concesionario.coches.splice(index, 1);
      res.status(204).send();
    } else {
      res.status(404).send('Coche no encontrado');
    }
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
