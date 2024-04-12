import { Request, Response, request } from 'express';
import pool from '../../database.config';
export const CrearProducto = async (request: Request, response: Response) => {
    const {
        codigo,
        nombre,
        stock,
        precio
    } = request.body;

    try {
        const result = await pool.query(
            'INSERT INTO producto (codigo, nombre, stock, precio) VALUES ($1, $2, $3, $4) RETURNING *',
            [codigo, nombre, stock, precio]
        );

        const ProductoAgregado = result.rows[0];
        return response.status(201).json(ProductoAgregado);
    } catch (error) {
        console.error('Error al agregar Producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const EliminarProducto = async (request: Request, response: Response) => {
    const codigoProducto = request.params.codigo; // Obtener el código del producto desde los parámetros de la solicitud
    try {
        const result = await pool.query(
            'DELETE FROM producto   WHERE codigo = $1', // Utilizar el código del producto en lugar del ID en la consulta SQL
            [codigoProducto]
        );

        return response.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
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

export const EditarProducto = async (request: Request, response: Response) => {
    const { codigo, nombre, stock, precio } = request.body;

    try {
        const result = await pool.query(
            'UPDATE producto SET nombre = $2, stock = $3, precio = $4 WHERE codigo = $1',
            [codigo, nombre, stock, precio]
        );

        return response.status(200).json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error al editar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};
