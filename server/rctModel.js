// Postgresql connection to backend
require('dotenv').config();

// Postgresql connection
var POSTGRES_SERVER = process.env.POSTGRES_SERVER;
var POSTGRES_PORT = process.env.POSTGRES_PORT;
var POSTGRES_NAME = process.env.POSTGRES_NAME;
var POSTGRES_USER = process.env.POSTGRES_USER;
var POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

const Pool = require("pg").Pool;
const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_SERVER,
  database: POSTGRES_NAME,
  password: POSTGRES_PASSWORD,
  port: POSTGRES_PORT,
});

const getAllPublication = (req, res) => {
    try {
        pool.query("SELECT * FROM publication", (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getPublicationByParam = (req, res) => {
    const key = req.query.key;
    const value = req.query.value;
    const query = `SELECT * FROM publication WHERE ${key} = $1`;
    pool.query(query, [value], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result.rows);
        }
    });
};

const getAllSections = (req, res) => {
    try {
        pool.query("SELECT * FROM section", (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getSectionByParam = (req, res) => {
    try {
        const key = req.query.key;
        const value = req.query.value;
        const query = `SELECT * FROM sections WHERE ${key} = $1`;
        pool.query(query, [value], (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getAllSentence = (req, res) => {
    try {
        pool.query("SELECT * FROM sentence", (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getSentenceByParam = (req, res) => {
    try {
        const key = req.query.key;
        const value = req.query.value;
        const query = `SELECT * FROM sentences WHERE ${key} = $1`;
        pool.query(query, [value], (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getAllSentenceAnnotations = (req, res) => {
    try {
        pool.query("SELECT * FROM sentenceannotation", (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getSentenceAnnotationByParam = (req, res) => {
    try {
        const key = req.query.key;
        const value = req.query.value;
        const query = `SELECT * FROM sentenceannotation WHERE ${key} = $1`;
        pool.query(query, [value], (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getAllAnnotation = (req, res) => {
    try {
        pool.query("SELECT * FROM annotation", (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getAnnotationByParam = (req, res) => {
    try {
        const key = req.query.key;
        const value = req.query.value;
        const query = `SELECT * FROM annotation WHERE ${key} = $1`;
        pool.query(query, [value], (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getAllUsers = (req, res) => {
    try {
        pool.query("SELECT * FROM users", (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getUserByParam = (req, res) => {
    try {
        const key = req.query.key;
        const value = req.query.value;
        const query = `SELECT * FROM users WHERE ${key} = $1`;
        pool.query(query, [value], (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getAllFeeback = (req, res) => {
    try {
        pool.query("SELECT * FROM feeback", (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getFeebackByParam = (req, res) => {
    try {
        const key = req.query.key;
        const value = req.query.value;
        const query = `SELECT * FROM feeback WHERE ${key} = $1`;
        pool.query(query, [value], (err, result) => {
            res.json(result.rows);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllPublication,
    getPublicationByParam,
    getAllSections,
    getSectionByParam,
    getAllSentence,
    getSentenceByParam,
    getAllSentenceAnnotations,
    getSentenceAnnotationByParam,
    getAllAnnotation,
    getAnnotationByParam,
    getAllUsers,
    getUserByParam,
    getAllFeeback,
    getFeebackByParam
};
