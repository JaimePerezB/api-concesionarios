const express = require('express');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const helmet = require('helmet');
const swaggerUi = require("swagger-ui-express");  
const swaggerDocument = require("./swagger.json");

const app = express();
const PORT = 3000;

// Seguridad con Helmet
app.use(helmet());

// Middleware para parsear JSON
app.use(express.json());

// Conexión a MongoDB
const uri = 'mongodb+srv://jaimepb94:T7tZKy77tuTJKDkH@cluster0.w3911.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Sustituye con tu URI de MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database, concesionariosCollection;

// Conectar con la base de datos
async function connectToDatabase() {
  try {
    await client.connect();
    database = client.db('concesionariosDB'); // Nombre de la base de datos
    concesionariosCollection = database.collection('concesionarios');
    console.log('Conexión a MongoDB exitosa');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    process.exit(1);
  }
}
connectToDatabase();

// Configuración de Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoints
app.get('/concesionarios', async (req, res) => {
  const concesionarios = await concesionariosCollection.find().toArray();
  res.json(concesionarios);
});

app.post('/concesionarios', async (req, res) => {
  const { nombre, direccion } = req.body;
  const nuevoConcesionario = { nombre, direccion, coches: [] };
  const result = await concesionariosCollection.insertOne(nuevoConcesionario);
  res.status(201).json({ ...nuevoConcesionario, _id: result.insertedId });
});

app.get('/concesionarios/:id', async (req, res) => {
  const { id } = req.params;
  const concesionario = await concesionariosCollection.findOne({
    _id: new ObjectId(id),
  });
  if (concesionario) {
    res.json(concesionario);
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.put('/concesionarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion } = req.body;
  const result = await concesionariosCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { nombre, direccion } }
  );
  if (result.matchedCount > 0) {
    res.send('Concesionario actualizado correctamente');
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.delete('/concesionarios/:id', async (req, res) => {
  const { id } = req.params;
  const result = await concesionariosCollection.deleteOne({
    _id: new ObjectId(id),
  });
  if (result.deletedCount > 0) {
    res.status(204).send();
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.post('/concesionarios/:id/coches', async (req, res) => {
  const { id } = req.params;
  const { modelo, cv, precio } = req.body;
  const concesionario = await concesionariosCollection.findOne({
    _id: new ObjectId(id),
  });
  if (concesionario) {
    const nuevoCoche = {
      id: concesionario.coches.length + 1,
      modelo,
      cv,
      precio,
    };
    concesionario.coches.push(nuevoCoche);
    await concesionariosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { coches: concesionario.coches } }
    );
    res.status(201).json(nuevoCoche);
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.get('/concesionarios/:id/coches', async (req, res) => {
  const { id } = req.params;
  const concesionario = await concesionariosCollection.findOne({
    _id: new ObjectId(id),
  });
  if (concesionario) {
    res.json(concesionario.coches);
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.get('/concesionarios/:id/coches/:cocheId', async (req, res) => {
  const { id, cocheId } = req.params;
  const concesionario = await concesionariosCollection.findOne({
    _id: new ObjectId(id),
  });
  if (concesionario) {
    const coche = concesionario.coches.find(c => c.id == cocheId);
    if (coche) {
      res.json(coche);
    } else {
      res.status(404).send('Coche no encontrado');
    }
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.put('/concesionarios/:id/coches/:cocheId', async (req, res) => {
  const { id, cocheId } = req.params;
  const { modelo, cv, precio } = req.body;
  const concesionario = await concesionariosCollection.findOne({
    _id: new ObjectId(id),
  });
  if (concesionario) {
    const cocheIndex = concesionario.coches.findIndex(c => c.id == cocheId);
    if (cocheIndex >= 0) {
      concesionario.coches[cocheIndex] = { id: cocheId, modelo, cv, precio };
      await concesionariosCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { coches: concesionario.coches } }
      );
      res.send('Coche actualizado correctamente');
    } else {
      res.status(404).send('Coche no encontrado');
    }
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

app.delete('/concesionarios/:id/coches/:cocheId', async (req, res) => {
  const { id, cocheId } = req.params;
  const concesionario = await concesionariosCollection.findOne({
    _id: new ObjectId(id),
  });
  if (concesionario) {
    const cocheIndex = concesionario.coches.findIndex(c => c.id == cocheId);
    if (cocheIndex >= 0) {
      concesionario.coches.splice(cocheIndex, 1);
      await concesionariosCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { coches: concesionario.coches } }
      );
      res.status(204).send();
    } else {
      res.status(404).send('Coche no encontrado');
    }
  } else {
    res.status(404).send('Concesionario no encontrado');
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
