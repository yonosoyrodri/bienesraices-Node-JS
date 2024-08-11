import express from "express";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import db from "./config/db.js";

// crear la app
const app = express();

//Habilitar lectura de datos de formulario
app.use(express.urlencoded({ extended: true }));

// habilitar cookie parser
app.use(cookieParser());

// habilitar CSRF
app.use(csurf({ cookie: true }));

// conexion a la base de datos
try {
	await db.authenticate();
	db.sync();
	console.log("Conexión correcta a la base de datos");
} catch (error) {
	console.log(error);
}

// habilitar pug
app.set("view engine", "pug");
app.set("views", "./views");

// carpeta publica
app.use(express.static("public"));

// routing
app.use("/auth", usuarioRoutes);
app.use("/", propiedadesRoutes);

const port = process.env.PORT || 3232;
app.listen(port, () => {
	console.log(`EL proyecto esta corriendo en el puerto ${port}`);
});
