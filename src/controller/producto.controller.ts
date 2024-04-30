import { Request, Response, request, response } from 'express';
import pool from '../../database.config';
import multer from 'multer';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    }
});

const upload = multer({ storage: storage }).single('imagen');

function Saveimagen(file) {
    const newPath = `./uploads/${file.originalname}`; 
    fs.renameSync(file.path, newPath);
    return newPath; 
}

export const CrearProducto = async (request: Request, response: Response) => {
    upload(request, response, async function (err) {
        if (err) {
            console.error('Error al cargar la imagen', err);
            return response.status(500).json({ message: 'Error al cargar la imagen' });
        }
        try {
            const {
                codigo,
                nombre,
                detalles,
                stock,
                precio
            } = request.body;

            const imagenName = request.file.originalname ;

            const newPath = Saveimagen(request.file);

            // Verifica si se proporcionaron todos los campos requeridos
            if (!codigo || !nombre || !detalles || !stock || !precio) {
                return response.status(400).json({ message: 'Todos los campos son obligatorios' });
            }

            // Inserta el producto en la base de datos
            const result = await pool.query(
                'INSERT INTO producto (codigo, nombre, detalles, stock, precio, imagen) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [codigo, nombre, detalles, stock, precio, imagenName]
            );

            // Verifica si se insertó correctamente el producto
            if (result.rows.length === 0) {
                return response.status(500).json({ message: 'Error al agregar el producto' });
            }

            // Obtiene el producto recién agregado
            const productoAgregado = result.rows[0];
            return response.status(201).json(productoAgregado);
        } catch (error) {
            console.error('Error al agregar Producto:', error);
            if (error.code === '23505') { // Verifica si hay una violación de restricción de clave única
                return response.status(400).json({ message: 'Ya existe un producto con este código' });
            }
            return response.status(500).json({ message: 'Error interno del servidor' });
        }
    });
};


export const EliminarProducto = async (request: Request, response: Response) => {
    const codigoProducto = request.params.codigo; // Obtener el código del producto desde los parámetros de la solicitud
    try {
        const result = await pool.query(
            'DELETE FROM producto   WHERE codigo = $1', // Utilizar el código del producto en lugar del ID en la consulta SQL
            [codigoProducto]
        );
        const EliminarProducto = result.rows[0];
        return response.status(201).json(EliminarProducto);
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const EditarProducto = async (request: Request, response: Response) => {
    const { codigo, nombre, stock, precio } = request.body;

    try {
        const result = await pool.query(
            'UPDATE producto SET nombre = $1, stock = $2, precio = $3 WHERE codigo = $4',
            [nombre, stock, precio, codigo]
        );
        if (result.rowCount === 0) {
            return response.status(404).json({ message: 'No se encontró ningún producto para actualizar' });
        }
        return response.status(200).json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error al editar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const filtrarProducto = async (request: Request, response: Response) => {
    const { codigo, nombre } = request.query;
    try {
        let result;
        let queryParams = [];

        if (codigo && nombre) {
            queryParams = [codigo, `%${nombre}%`];
            result = await pool.query(
                'SELECT * FROM producto WHERE codigo = $1 AND nombre ILIKE $2',
                queryParams
            );
        } else if (codigo) {
            queryParams = [codigo];
            result = await pool.query(
                'SELECT * FROM producto WHERE codigo = $1',
                queryParams
            );
        } else if (nombre) {
            queryParams = [`%${nombre}%`];
            result = await pool.query(
                'SELECT * FROM producto WHERE nombre ILIKE $1',
                queryParams
            );
        } else {
            result = await pool.query(
                'SELECT * FROM producto'
            );
        }

        const productos = result.rows;
        return response.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const BuscarCodigoProducto = async (request: Request, response: Response) => {
    const idProducto = request.params.id;
    try {
        const result = await pool.query(
            'SELECT * FROM producto WHERE id_producto = $1',
            [idProducto]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Error... Producto no encontrado' });
        }

        return response.status(200).json(usuarioEncontrado);
    } 
    catch (error) {
        console.error('Error al buscar Producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const BuscarNombreProducto = async (request: Request, response: Response) => {
    const { nombre } = request.query;

    try {
        const result = await pool.query(
            'SELECT * FROM producto WHERE nombre ILIKE $1',
            [`%${nombre}%`]
        );

        const productoEncontrado = result.rows;
        return response.status(200).json(productoEncontrado);
    } 
    catch (error) {
        console.error('Error al buscar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const ObtenerProductos = async (request: Request, response: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM producto'
        );

        const productos = result.rows;
        return response.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const ObtenerLogs = async (request: Request, response: Response) => {
    try {
        const result = await pool.query(
            'SELECT p.nombre, l.* FROM logs l JOIN producto p ON l.codigo_producto = p.codigo'
        );

        const productos = result.rows;
        return response.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const AgregarStockProducto = async (request: Request, response: Response) => {
    try {
        const { codigo, cantidad, detalles } = request.body;

        if (!codigo || !cantidad || typeof cantidad !== 'number') {
            return response.status(400).json({ message: 'Todos los campos son obligatorios y cantidad debe ser un número' });
        }

        const producto = await pool.query('SELECT * FROM producto WHERE codigo = $1', [codigo]);
        if (producto.rows.length === 0) {
            return response.status(404).json({ message: 'Producto no encontrado' });
        }

        await pool.query(
            'UPDATE producto SET stock = stock + $1 WHERE codigo = $2',
            [cantidad, codigo]
        );

        await pool.query(
            'INSERT INTO logs (codigo_producto, tipo_movimiento, cantidad, detalles) VALUES ($1, $2, $3, $4)',
            [codigo, 'agregar_stock', cantidad, detalles]
        );

        return response.status(201).json({ message: 'Stock agregado correctamente' });
    } catch (error) {
        console.error('Error al agregar stock a producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const QuitarStockProducto = async (request: Request, response: Response) => {
    try {
        const { codigo, cantidad, detalles } = request.body;

        if (!codigo || !cantidad || typeof cantidad !== 'number') {
            return response.status(400).json({ message: 'Todos los campos son obligatorios y cantidad debe ser un número' });
        }

        const producto = await pool.query('SELECT * FROM producto WHERE codigo = $1', [codigo]);
        if (producto.rows.length === 0) {
            return response.status(404).json({ message: 'Producto no encontrado' });
        }

        await pool.query(
            'UPDATE producto SET stock = CASE WHEN stock - $1 < 0 THEN 0 ELSE stock - $1 END WHERE codigo = $2',
            [cantidad, codigo]
        );

        await pool.query(
            'INSERT INTO logs (codigo_producto, tipo_movimiento, cantidad, detalles) VALUES ($1, $2, $3, $4)',
            [codigo, 'quitar_stock', cantidad, detalles]
        );

        return response.status(201).json({ message: 'Stock quitado correctamente' });
    } catch (error) {
        console.error('Error al quitar stock a producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const BuscarProducto = async (request: Request, response: Response) => {
    try {
        const { codigo, nombre } = request.query;

        let result;
        let queryParams = [];

        // Verifica si se proporcionó un código y/o un nombre para buscar el producto
        if (codigo && nombre) {
            queryParams = [codigo, `%${nombre}%`];
            result = await pool.query(
                'SELECT codigo, nombre FROM producto WHERE codigo = $1 AND nombre ILIKE $2',
                queryParams
            );
        } else if (codigo) {
            queryParams = [codigo];
            result = await pool.query(
                'SELECT codigo, nombre FROM producto WHERE codigo = $1',
                queryParams
            );
        } else if (nombre) {
            queryParams = [`%${nombre}%`];
            result = await pool.query(
                'SELECT codigo, nombre FROM producto WHERE nombre ILIKE $1',
                queryParams
            );
        } else {
            // Si no se proporciona ni código ni nombre, devuelve un mensaje de error
            return response.status(400).json({ message: 'Debe proporcionar al menos el código o el nombre del producto' });
        }

        const productos = result.rows;
        return response.status(200).json(productos);
    } catch (error) {
        console.error('Error al buscar productos:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const filtrarLogs = async (request: Request, response: Response) => {
    const { fecha_movimiento, tipo_movimiento } = request.query;
    try {
        let result;
        let queryParams = [];

        if (fecha_movimiento && tipo_movimiento) {
            const tipoMovimientoLower = String(tipo_movimiento).toLowerCase();
            queryParams = [`%${tipoMovimientoLower}%`, fecha_movimiento];
            result = await pool.query(
                'SELECT p.nombre, l.* FROM logs l JOIN producto p ON l.codigo_producto = p.codigo WHERE LOWER(l.tipo_movimiento) LIKE $1 AND l.fecha_movimiento = $2',
                queryParams
            );
        } else if (tipo_movimiento) {
            const tipoMovimientoLower = String(tipo_movimiento).toLowerCase();
            queryParams = [`%${tipoMovimientoLower}%`];
            result = await pool.query(
                'SELECT p.nombre, l.* FROM logs l JOIN producto p ON l.codigo_producto = p.codigo WHERE LOWER(l.tipo_movimiento) LIKE $1',
                queryParams
            );
        } else if (fecha_movimiento) {
            const fechaMovimientoString = String(fecha_movimiento);
            queryParams = [`%${fechaMovimientoString}%`];
            result = await pool.query(
                'SELECT p.nombre, l.* FROM logs l JOIN producto p ON l.codigo_producto = p.codigo WHERE CAST(l.fecha_movimiento AS VARCHAR) LIKE $1',
                queryParams
            );
        } else {
            result = await pool.query(
                'SELECT p.nombre, l.* FROM logs l JOIN producto p ON l.codigo_producto = p.codigo'
            );
        }

        const logs = result.rows;
        return response.status(200).json(logs);
    } catch (error) {
        console.error('Error al obtener logs:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};





