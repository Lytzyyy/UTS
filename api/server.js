const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const Minio = require('minio');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize('usersdb', 'admin', 'password_kamu', {
    host: 'postgres',
    dialect: 'postgres',
    logging: false
});

const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    photo_url: DataTypes.STRING
});

const minioClient = new Minio.Client({
    endPoint: '10.225.237.228', // Ganti dengan IP Debian kamu
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

const upload = multer({ storage: multer.memoryStorage() });

// Ambil Semua User (Tampil di 8080/users)
app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

// Simpan Data & File ke Minio
app.post('/users', upload.single('photo'), async (req, res) => {
    const fileName = `${Date.now()}_${req.file.originalname}`;
    await minioClient.putObject('uts', fileName, req.file.buffer);
    const photoUrl = `http://10.225.237.228:9000/uts/${fileName}`;
    const user = await User.create({ name: req.body.name, email: req.body.email, photo_url: photoUrl });
    res.json(user);
});

// Edit Data (Nama, Email, File)
app.put('/users/:id', upload.single('photo'), async (req, res) => {
    const user = await User.findByPk(req.params.id);
    let photoUrl = user.photo_url;
    if (req.file) {
        const oldFile = user.photo_url.split('/').pop();
        try { await minioClient.removeObject('uts', oldFile); } catch(e) {}
        const fileName = `${Date.now()}_${req.file.originalname}`;
        await minioClient.putObject('uts', fileName, req.file.buffer);
        photoUrl = `http://10.225.237.228:9000/uts/${fileName}`;
    }
    await user.update({ name: req.body.name, email: req.body.email, photo_url: photoUrl });
    res.json(user);
});

app.delete('/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    const fileName = user.photo_url.split('/').pop();
    try { await minioClient.removeObject('uts', fileName); } catch(e) {}
    await user.destroy();
    res.json({ message: "Deleted" });
});

sequelize.sync().then(() => {
    app.listen(8080, '0.0.0.0', () => console.log('API Data running on 8080'));
});
