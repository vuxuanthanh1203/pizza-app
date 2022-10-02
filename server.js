const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const passport = require('passport');

dotenv.config({ path: './.env' });

// Database connection
const Database = process.env.DATABASE_CONNECTION_URL

mongoose.connect(Database, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => console.log('Database connected...'));

// Sessions config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({
        mongoUrl: Database
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Authentication configuration
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'pizza-app'
}));

// Passport config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Assets
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user
    next();
})

// Set Template Engine
app.use(expressLayouts);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);


app.listen(3000, () => {
    console.log(`listening on port ${PORT}`);
})