import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import db from "./config/db.js";

// crear la app
const app = express();

//Habilitar lectura de datos de formulario
app.use(express.urlencoded({ extended: true }));

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

const port = process.env.PORT || 3232;
app.listen(port, () => {
	console.log(`EL proyecto esta corriendo en el puerto ${port}`);
});
