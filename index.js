const express = require('express');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const helmet = require('helmet');

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
    console.log('Conectando a la base de datos...');
    await client.connect();
    database = client.db('concesionariosDB'); // Nombre de la base de datos
    concesionariosCollection = database.collection('concesionarios');
    console.log('Conexión a MongoDB exitosa');

    // **Insertar un concesionario de prueba (solo la primera vez)**
    const concesionarioPrueba = {
      nombre: 'Concesionarios del Norte',
      direccion: 'Calle Principal 123',
      coches: [
        { modelo: 'Toyota Corolla', cv: 120, precio: 20000 },
        { modelo: 'Honda Civic', cv: 140, precio: 25000 },
      ],
    };

    // Verificar si ya existe el concesionario para evitar duplicados
    const concesionarioExistente = await concesionariosCollection.findOne({ nombre: concesionarioPrueba.nombre });
    if (!concesionarioExistente) {
      const resultado = await concesionariosCollection.insertOne(concesionarioPrueba);
      console.log('Concesionario de prueba insertado con ID:', resultado.insertedId);
    } else {
      console.log('El concesionario de prueba ya existe en la base de datos.');
    }
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    process.exit(1);
  }
}
connectToDatabase();

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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
