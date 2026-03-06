require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const Minio = require('minio');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, dialect: 'postgres', port: process.env.DB_PORT
});

const User = sequelize.define('User', { name: DataTypes.STRING, email: DataTypes.STRING, photo_url: DataTypes.STRING });

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT, port: parseInt(process.env.MINIO_PORT),
    useSSL: false, accessKey: process.env.MINIO_ACCESS_KEY, secretKey: process.env.MINIO_SECRET_KEY
});

const upload = multer({ storage: multer.memoryStorage() });

// CREATE
app.post('/users', upload.single('photo'), async (req, res) => {
    try {
        const fileName = `${Date.now()}_${req.file.originalname}`;
        await minioClient.putObject(process.env.MINIO_BUCKET_NAME, fileName, req.file.buffer);
        const host = req.get('host').split(':')[0];
        const photoUrl = `http://${host}:9000/${process.env.MINIO_BUCKET_NAME}/${fileName}`;
        const user = await User.create({ name: req.body.name, email: req.body.email, photo_url: photoUrl });
        res.status(201).json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// READ
app.get('/users', async (req, res) => { res.json(await User.findAll()); });

// UPDATE (Nama, Email, & Foto)
app.put('/users/:id', upload.single('photo'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        let photoUrl = user.photo_url;

        if (req.file) {
            await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, user.photo_url.split('/').pop());
            const newName = `${Date.now()}_${req.file.originalname}`;
            await minioClient.putObject(process.env.MINIO_BUCKET_NAME, newName, req.file.buffer);
            photoUrl = `http://${req.get('host').split(':')[0]}:9000/${process.env.MINIO_BUCKET_NAME}/${newName}`;
        }

        await user.update({ name: req.body.name || user.name, email: req.body.email || user.email, photo_url: photoUrl });
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
app.delete('/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, user.photo_url.split('/').pop());
    await user.destroy();
    res.json({ message: "Deleted" });
});

sequelize.sync().then(() => app.listen(8080, '0.0.0.0'));
