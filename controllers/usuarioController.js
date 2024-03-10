import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";
import { generarId } from "../helpers/token.js";

const formularioLogin = (req, res) => {
	res.render("auth/login", {
		pagina: "Iniciar Sesión",
	});
};

const formularioRegistro = (req, res) => {
	res.render("auth/registro", {
		pagina: "Crear Cuenta",
	});
};

const registrar = async (req, res) => {
	// validacion
	await check("nombre").notEmpty().withMessage("El nombre no puede ir vacio").run(req);
	await check("email").isEmail().withMessage("Eso no parece un email").run(req);
	await check("password").isLength({ min: 6 }).withMessage("El password debe ser de al menos 6 caracteres").run(req);
	await check("repetir_password").equals("password").withMessage("Los passwords no son iguales").run(req);

	let resultado = validationResult(req);

	// Verificar que el resultado este vacio
	if (!resultado.isEmpty()) {
		// Errores
		return res.render("auth/registro", {
			pagina: "Crear cuenta",
			errores: resultado.array(),
			usuario: {
				nombre: req.body.nombre,
				email: req.body.email,
			},
		});
	}

	const { nombre, email, password } = req.body;

	// Verificar que el usuario no este duplicado
	const existeUsuario = await Usuario.findOne({ where: { email } });

	if (existeUsuario) {
		return res.render("auth/registro", {
			pagina: "Crear cuenta",
			errores: [{ msg: "El usuario ya existe" }],
			usuario: {
				nombre: req.body.nombre,
				email: req.body.email,
			},
		});
	}

	await Usuario.create({
		nombre,
		email,
		password,
		token: generarId(),
	});

	// mostrar mensaje de confirmacion

	res.render("templates/mensaje", {
		pagina: "Cuenta creada correctamente",
		mensaje: "Hemos enviado un email de confirmacion, presiona en el enlace",
	});
};

const formularioOlvidePassword = (req, res) => {
	res.render("auth/olvidePassword", {
		pagina: "Recupera tu acceso a Bienes Raíces",
	});
};

export { formularioLogin, formularioRegistro, registrar, formularioOlvidePassword };
