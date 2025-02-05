
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static('uploads'));

const DATA_FILE = './data.json';

// Configuración de multer para guardar imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

function readData() {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } else {
        return { restaurants: [] };
    }
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/products/:restaurant', (req, res) => {
    const data = readData();
    const restaurant = req.params.restaurant;
    const restaurantData = data.restaurants.find(r => r.name === restaurant);

    if (restaurantData) {
        res.json(restaurantData.products);
    } else {
        res.status(404).json({ message: 'Restaurante no encontrado' });
    }
});

app.post('/api/products', upload.single('image'), (req, res) => {
    const { restaurant, name, price, description } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.png';

    const data = readData();
    let restaurantData = data.restaurants.find(r => r.name === restaurant);
    if (!restaurantData) {
        restaurantData = { name: restaurant, products: [] };
        data.restaurants.push(restaurantData);
    }

    const newProduct = { id: Date.now(), name, price, description, image_url };
    restaurantData.products.push(newProduct);
    saveData(data);

    res.json({ message: 'Producto agregado', product: newProduct });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
