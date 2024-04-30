import Router from 'express';
import { AgregarStockProducto, BuscarCodigoProducto, BuscarNombreProducto, BuscarProducto, CrearProducto, EditarProducto, EliminarProducto,ObtenerLogs,ObtenerProductos, QuitarStockProducto, filtrarLogs, filtrarProducto} from '../controller/producto.controller';


export const ProductoRuta = Router()

ProductoRuta.post("/registrar_producto",CrearProducto);   
ProductoRuta.delete("/eliminar_producto/:codigo", EliminarProducto);
ProductoRuta.get("/Busca_cod_producto/:id", BuscarCodigoProducto);
ProductoRuta.get("/buscar", BuscarNombreProducto);
ProductoRuta.get("/obtener_productos", ObtenerProductos);
ProductoRuta.get("/editar/:codigo", EditarProducto);
ProductoRuta.get("/filtrar_producto",filtrarProducto);
ProductoRuta.post("/agregar_stock",AgregarStockProducto);
ProductoRuta.post("/quitar_stock",QuitarStockProducto);
ProductoRuta.get("/buscar_producto",BuscarProducto);
ProductoRuta.get("/obtener_logs",ObtenerLogs);
ProductoRuta.get("/filtrar_logs",filtrarLogs);
