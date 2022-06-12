// collecting all requirements
const mysql = require('mysql');
const express = require('express');
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyparser.json());
app.use(
    bodyparser.urlencoded({
        extended: true,
    }),
);

// midleware
const checkLogin = (req, res, next) => {
    const { authorization } = req.headers;
    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'shhhhh');
        const { name, email } = decoded;
        req.name = name;
        req.email = email;
        next();
    } catch {
        next('Authentication failure!');
    }
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: err });
};
app.use(errorHandler);

// default route creating
app.get('/', (req, res) => {
    res.send({
        error: true,
        message: 'hello',
    });
});

// mysql statement
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'students',
    multipleStatements: true,
});
// now connect to database
mysqlConnection.connect((err) => {
    if (!err) {
        console.log('connection established successfully');
    } else {
        console.log(Connection Failed!${JSON.stringify(err, undefined, 2)});
    }
});

// establish the server connection
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(the app is running at port ${port}...);
});
// now create get request to fetch all data
app.get('/students', checkLogin, (req, res) => {
    mysqlConnection.query('SELECT * FROM studentdetails', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});
// create get request to fetch all data
app.get('/api', checkLogin, (req, res) => {
    mysqlConnection.query('SELECT * FROM blogs', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});
// Router to GET specific students detail from the MySQL database
app.get('/students/:id', checkLogin, (req, res) => {
    mysqlConnection.query(
        'SELECT * FROM studentdetails WHERE student_id = ?',
        [req.params.id],
        (err, rows, fields) => {
            if (!err) {
                res.send(rows);
            } else {
                console.log(err);
            }
        }
    );
});
// Router to GET specific  detail from the MySQL database
app.get('/api/:id', checkLogin, (req, res) => {
    mysqlConnection.query(
        'SELECT * FROM blogs WHERE blog_id = ?',
        [req.params.id],
        (err, rows, fields) => {
            if (!err) {
                res.send(rows);
            } else {
                console.log(err);
            }
        }
    );
});

// Router to DELETE a student's detail
app.delete('/students', checkLogin, (req, res) => {
    const student_id = req.body.Student_id;
    if (!student_id) {
        return res.status(400).send({ error: true, message: 'Please provide student_id' });
    }
    mysqlConnection.query(
        'DELETE FROM studentdetails WHERE student_id = ?',
        [student_id],
        (error, results, fields) => {
            if (error) throw error;
            return res.send({
                error: false,
                data: results,
                message: 'student record has been deleted successfully.',
            });
        },
    );
});
//// Router to DELETE a  detail
app.delete('/api', checkLogin, (req, res) => {
    const blog_id = req.body.blog_id;
    if (!blog_id) {
        return res.status(400).send({ error: true, message: 'Please provide blog_id' });
    }
    mysqlConnection.query(
        'DELETE FROM blogs WHERE blog_id = ?',
        [blog_id],
        (error, results, fields) => {
            if (error) throw error;
            return res.send({
                error: false,
                data: results,
                message: 'blog record has been deleted successfully.',
            });
        },
    );
});
// insert a new student
app.post('/students', checkLogin, (req, res) => {
    const student = req.body.students;
    // const { id } = req.body;
    // const email = req.body.gmail;
    // const courseid = req.body.courseID;
    if (!student) {
        return res.status(400).send({ error: true, message: 'Please provide student' });
    }
    mysqlConnection.query(
        'INSERT INTO studentdetails SET ? ',
        { student_name: student },
        // { student_id: id },
        // { student_email: email },
        // { course_id: courseid },

        (error, results, fields) => {
            if (error) throw error;
            return res.send({
                error: false,
                data: results,
                message: 'New user has been created successfully.',
            });
        },
    );
});

// insert a new blog
app.post('/api', checkLogin, (req, res) => {
    const blog = req.body.blogs;
    // const { id } = req.body;
    // const email = req.body.gmail;
    // const courseid = req.body.courseID;
    if (!blog) {
        return res.status(400).send({ error: true, message: 'Please provide blog' });
    }
    mysqlConnection.query(
        'INSERT INTO blogs SET ? ',
        { title: title },
        // { student_id: id },
        // { student_email: email },
        // { course_id: courseid },

        (error, results, fields) => {
            if (error) throw error;
            return res.send({
                error: false,
                data: results,
                message: 'New blog  has been created successfully.',
            });
        },
    );
});

// update configuaration
//  Update user with id
app.put('/students', checkLogin, (req, res) => {
    const student_id = req.body.Student_id;
    const student_name = req.body.Student_name;
    if (!student_id || !student_name) {
        return res
            .status(400)
            .send({ error: true, message: 'Please provide student_name and student_id' });
    }
    mysqlConnection.query(
        'UPDATE studentdetails SET student_name = ? WHERE student_id = ?',
        [student_name, student_id],
        (error, results, fields) => {
            if (error) throw error;
            return res.send({
                error: false,
                data: results,
                message: 'user has been updated successfully.',
            });
        },
    );
});

// sign up creating
app.post('/students/signup', (req, res) => {
    const { name, email } = req.body;
    if (!email || !name) {
        res.status(500).json({
            message: 'Signup failed!',
        });
    } else {
        res.status(200).json({
            message: 'Signup succeded!',
        });
    }
});
// log in creating
app.post('/students/login', (req, res) => {
    const { name, email } = req.body;
    if (!email || !name) {
        res.status(401).json({
            error: 'Authentication failed!',
        });
    } else {
        // generate token
        const token = jwt.sign(
            {
                name,
                email,
            },
            'shhhhh',
            {
                expiresIn: '1h',
            }
        );
        res.status(200).json({
            access_token: token,
            message: 'login successful!',
        });
    }
});
