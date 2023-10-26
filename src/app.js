require('dotenv').config()
const express = require("express")
const app = express()
const PORT = 8080
const path = require("path")
const handlebars = require("express-handlebars")
const products = require("./routes/products.js")
const carts = require("./routes/carts.js")
const mongoose = require('mongoose');
const uri = `mongodb+srv://djmou:${process.env.DB_PASSWORD}@dcontreras.bv4xdut.mongodb.net/ecommerce?retryWrites=true&w=majority`
const { productsModel, cartsModel } = require('./models/products.model.js')
const UserModel = require ("./models/users.model.js")
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
MongoDBStore = require('connect-mongodb-session')(session);

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/api/products", products);
app.use("/api/carts", carts)

app.engine("handlebars", handlebars.engine())

app.set("views", __dirname + "/views")

app.set("view engine", "handlebars")

app.use(express.static(__dirname + "/views"))

let store = new MongoDBStore({
  uri: uri,
  collection: 'mySessions'
});

store.on('error', function(error) {
  console.log(error);
});

// app.use(require('express-session')({
//   secret: 'djmou.2023*s3cret',
//   cookie: {
//     maxAge: 1000 * 60 * 60 * 24 * 7 
//   },
//   store: store,
//   resave: true,
//   saveUninitialized: true
// }));

app.use(session({
  secret: 'djmou.2023*s3cret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// passport.use(new LocalStrategy(UserModel.authenticate()));
// passport.serializeUser(UserModel.serializeUser());
// passport.deserializeUser(UserModel.deserializeUser());


// app.get('/login', (req, res) => {
//   res.render('login.hbs');
// });

// app.post('/login', (req, res) => {
//   const { email, password } = req.body;
// console.log("login", email, password)
 
//   if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
  
//     req.session.user = { email, role: 'admin' };
//     res.redirect('/products'); 
//   } else {
    
//     req.session.user = { email, role: 'usuario' };
//     res.redirect('/products'); 
//   }
// });

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Hashea la contraseña antes de almacenarla en la base de datos
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Error al registrar usuario' });
    }

    // Guarda 'email' y 'hashedPassword' en la base de datos (puedes usar Mongoose para esto)
    // Luego, redirige al usuario a la vista de inicio de sesión o a donde desees.
    res.redirect('/login');
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Recupera la contraseña hasheada desde la base de datos para el usuario 'email'
  // Puedes usar Mongoose para esto.

  // Compara la contraseña ingresada con la contraseña almacenada
  bcrypt.compare(password, hashedPasswordFromDatabase, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
    }

    if (result) {
      // Contraseña válida, inicia sesión
      req.session.user = { email, role: 'usuario' };  // O asigna el rol adecuado
      res.redirect('/products');
    } else {
      // Contraseña incorrecta
      res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    }
  });
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Hashea la contraseña antes de almacenarla en la base de datos
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Error al registrar usuario' });
    }

    // Crea una instancia del modelo User con los datos del usuario
    const newUser = new UserModel({
      email: email,
      password: hashedPassword,
      // Otros campos de usuario si los tienes
    });

    // Guarda el nuevo usuario en la base de datos
    newUser.save((err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Error al registrar usuario' });
      }

      // Redirige al usuario a la vista de inicio de sesión
      res.redirect('/login');
    });
  });
});
const userSchema = new mongoose.Schema({
  // Campos de usuario
});

userSchema.plugin(passportLocalMongoose); // Agrega los métodos de autenticación

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;


app.get('/products', async (req, res) => {
  const user = req.session.user;
  const products = await productsModel.find();
  if (user) {
    
    res.render('products.hbs', { user, products });
  } else {
    
    res.redirect('/login'); 
  }
});


app.get('/logout', (req, res) => {
  console.log(req.session)
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Error al cerrar sesión' });
    } else {
      res.json({ success: true });
    }
  });
});


mongoose.connect(uri).then(()=>console.log("Conectado a la base de datos"))
.catch(e => console.log("Error al conectar con la base de datos", e))

app.listen(PORT, () => {
    console.log(`Server escuchando en el puerto ${PORT}`);
})

