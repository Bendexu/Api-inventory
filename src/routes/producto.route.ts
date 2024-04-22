import Router from 'express';
import { BuscarCodigoProducto, BuscarNombreProducto, CrearProducto, EditarProducto, EliminarProducto,ObtenerProductos, filtrarProducto} from '../controller/producto.controller';


export const ProductoRuta = Router()

ProductoRuta.post("/registrar_producto",CrearProducto);   
ProductoRuta.delete("/eliminar_producto/:codigo", EliminarProducto);
ProductoRuta.get("/Busca_cod_producto/:id", BuscarCodigoProducto);
ProductoRuta.get("/buscar", BuscarNombreProducto);
ProductoRuta.get("/obtener_productos", ObtenerProductos);
ProductoRuta.get("/editar/:codigo", EditarProducto);
ProductoRuta.get("/filtrar_producto",filtrarProducto);

