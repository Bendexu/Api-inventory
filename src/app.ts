import express from 'express';
import { UsuarioRuta } from './routes/usuario.route';
import bodyParser from 'body-parser';
import { ProductoRuta } from './routes/producto.route';
import pool from '../database.config';
import cors from 'cors';
function appInit() {
    //Inicializamos Init express
    const app = express();
    //el cors sirve para conectar apis en tu pc local
    app.use(cors());

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json())

    //Uso de un Usuario Ruta
    app.use(UsuarioRuta);
    app.use(ProductoRuta);

    //Que la aplicación solo escuche el puerto 3000
    app.listen(3000);
    console.log('Server running on port http://localhost:3000');
    pool.query("SELECT * FROM producto",(error,results)=>{
        console.log("Se realizo la consulta correctamente");
    })
}

appInit();



