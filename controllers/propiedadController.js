import { validationResult } from "express-validator";
import { Precio, Categoria, Propiedad } from "../models/index.js";

const admin = (req, res) => {
	res.render("propiedades/admin", {
		pagina: "Mis propiedades",
		barra: true,
	});
};

const crear = async (req, res) => {
	const [categorias, precios] = await Promise.all([Categoria.findAll(), Precio.findAll()]);

	res.render("propiedades/crear", {
		pagina: "Crear Propiedad",
		barra: true,
		csrfToken: req.csrfToken(),
		categorias: categorias,
		precios: precios,
		datos: {},
	});
};

const guardar = async (req, res) => {
	let resultado = validationResult(req);

	if (!resultado.isEmpty()) {
		const [categorias, precios] = await Promise.all([Categoria.findAll(), Precio.findAll()]);

		return res.render("propiedades/crear", {
			pagina: "Crear Propiedad",
			barra: true,
			csrfToken: req.csrfToken(),
			categorias: categorias,
			precios: precios,
			errores: resultado.array(),
			datos: req.body,
		});
	}

	const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body;

	try {
		const propiedadGuardada = await Propiedad.create({
			titulo,
			descripcion,
			habitaciones,
			estacionamiento,
			wc,
			calle,
			lat,
			lng,
      precioId,
      categoriaId
		});
	} catch (error) {
		console.log(error);
	}
};

export { admin, crear, guardar };
