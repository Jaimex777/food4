
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Simulación de base de datos en memoria
let data = {
    italiano: [],
    mexicano: []
};

// Ruta para servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Obtener productos de un restaurante
app.get('/api/products/:restaurant', (req, res) => {
    const { restaurant } = req.params;
    res.json(data[restaurant] || []);
});

// Agregar un nuevo producto
app.post('/api/products', upload.single('image'), (req, res) => {
    const { restaurant, name, price, description } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : '';

    const newProduct = {
        id: Date.now(),
        name,
        price,
        description,
        image_url
    };

    if (!data[restaurant]) {
        data[restaurant] = [];
    }
    data[restaurant].push(newProduct);

    res.json({ message: 'Producto agregado', product: newProduct });
});

// Eliminar un producto
app.delete('/api/products/:restaurant/:productId', (req, res) => {
    const { restaurant, productId } = req.params;
    if (data[restaurant]) {
        data[restaurant] = data[restaurant].filter(p => p.id !== parseInt(productId));
        res.json({ message: 'Producto eliminado' });
    } else {
        res.status(404).json({ message: 'Restaurante no encontrado' });
    }
});

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
