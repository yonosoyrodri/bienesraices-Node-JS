import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";
import { generarId } from "../helpers/token.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
	res.render("auth/login", {
		pagina: "Iniciar Sesión",
	});
};

const formularioRegistro = (req, res) => {
	res.render("auth/registro", {
		pagina: "Crear Cuenta",
		csrfToken: req.csrfToken(),
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
			csrfToken: req.csrfToken(),
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
			csrfToken: req.csrfToken(),
			errores: [{ msg: "El usuario ya existe" }],
			usuario: {
				nombre: req.body.nombre,
				email: req.body.email,
			},
		});
	}

	// almacenar usuario
	const usuario = await Usuario.create({
		nombre,
		email,
		password,
		token: generarId(),
	});

	// Enviar email de confirmacion
	emailRegistro({
		nombre: usuario.nombre,
		email: usuario.email,
		token: usuario.token,
	});

	// mostrar mensaje de confirmacion
	res.render("templates/mensaje", {
		pagina: "Cuenta creada correctamente",
		mensaje: "Hemos enviado un email de confirmacion, presiona en el enlace",
	});
};

// Funcion que comprueba una cuenta
const confirmar = async (req, res) => {
	const { token } = req.params;

	// verificar si el token es valido
	const usuario = await Usuario.findOne({ where: { token } });

	if (!usuario) {
		return res.render("auth/confirmar-cuenta", {
			pagina: "Error al confirmar tu cuenta",
			mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo",
			error: true,
		});
	}

	// confirmar la Cuenta
	usuario.token = null;
	usuario.confirmado = true;
	await usuario.save();

	res.render("auth/confirmar-cuenta", {
		pagina: "Cuenta confirmada",
		mensaje: "La cuenta se confirmo correctamente",
	});
};

const formularioOlvidePassword = (req, res) => {
	res.render("auth/olvidePassword", {
		pagina: "Recupera tu acceso a Bienes Raíces",
		csrfToken: req.csrfToken(),
	});
};

const resetPassword = async (req, res) => {
	// validacion
	await check("email").isEmail().withMessage("Eso no parece un email").run(req);

	let resultado = validationResult(req);

	// Verificar que el resultado este vacio
	if (!resultado.isEmpty()) {
		// Errores
		return res.render("auth/olvidePassword", {
			pagina: "Recupera tu acceso a Bienes Raíces",
			csrfToken: req.csrfToken(),
		});
	}

	// Buscar al usuario

	const { email } = req.body;

	const usuario = await Usuario.findOne({ where: { email } });
	if (!usuario) {
		return res.render("auth/olvidePassword", {
			pagina: "Recupera tu acceso a Bienes Raíces",
			csrfToken: req.csrfToken(),
			errores: [{ msg: "El email no pertenece a ningún usuario" }],
		});
	}

	// generar token y enviar email
	usuario.token = generarId();
	await usuario.save();

	//Enviar un email
	emailOlvidePassword({
		email: usuario.email,
		nombre: usuario.nombre,
		token: usuario.token,
	});

	// Renderizar mensaje
	res.render("templates/mensaje", {
		pagina: "Reestablece tu password",
		mensaje: "Hemos enviado un email con las instrucciones, presiona en el enlace",
	});
};

const comprobarToken = async (req, res) => {
	const { token } = req.params;
	const usuario = await Usuario.findOne({ where: { token } });
	if (!usuario) {
		return res.render("auth/confirmar-cuenta", {
			pagina: "Reestablece tu password",
			mensaje: "Hubo un error al validar tu información, intenta de nuevo",
			error: true,
		});
	}

	// mostrar formulario para modificar el password
	res.render("auth/reset-password", {
		pagina: "Reestablece tu password",
		csrfToken: req.csrfToken(),
	});
};

const nuevoPassword = async (req, res) => {
	// validar password
	await check("password").isLength({ min: 6 }).withMessage("El password debe ser de al menos 6 caracteres").run(req);

	let resultado = validationResult(req);

	// Verificar que el resultado este vacio
	if (!resultado.isEmpty()) {
		// Errores
		return res.render("auth/reset-password", {
			pagina: "Reestablece tu password",
			csrfToken: req.csrfToken(),
			errores: resultado.array(),
		});
	}

	const { token } = req.params;
	const { password } = req.body;

	// identificar quien hace el cambio
	const usuario = await Usuario.findOne()({ where: { token } });

	const salt = await bcrypt.genSalt(10);
	usuario.password = await bcrypt.hash(password, salt);
	usuario.token = null;

	await usuario.save();

	res.render("auth/confirmar-cuenta", {
		pagina: "Password restablecido",
		msensaje: "El password se guardó correctamente",
	});
};

export { formularioLogin, formularioRegistro, registrar, confirmar, formularioOlvidePassword, resetPassword, comprobarToken, nuevoPassword };
