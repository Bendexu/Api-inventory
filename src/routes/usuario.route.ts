import Router from 'express';
import { CrearUsuario, BuscarUsuarioPorDNI, LoginUsuario, recoverPassword } from '../controller/usuario.controller';

export const UsuarioRuta = Router();

UsuarioRuta.post("/registrar_usuario", CrearUsuario);   
UsuarioRuta.get("/buscar/:dni", BuscarUsuarioPorDNI);
UsuarioRuta.post("/login", LoginUsuario);
UsuarioRuta.post("/recover", recoverPassword);