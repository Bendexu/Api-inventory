import { Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import pool from '../../database.config';

export const CrearUsuario = async (request: Request, response: Response) => {
    // Recibe los datos del cliente
    const {
        name,
        lastName,
        dni,
        dateOfBirth,
        gender,
        email,
        password,
    } = request.body ;

    try {
        // Genera el hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserta el usuario en la base de datos con la contraseña hasheada
        const result = await pool.query(
            'INSERT INTO users(name, lastName, dni, dateOfBirth, gender, email, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, lastName, dni, dateOfBirth, gender, email, hashedPassword]
        );

        // Obtiene el usuario creado de la base de datos
        const usuarioCreado = result.rows[0];

        // Envía la respuesta con el usuario creado
        return response.status(201).json(usuarioCreado);
    } 
    catch (error) {
        console.error('Error al crear usuario:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const BuscarUsuarioPorDNI = async (request: Request, response: Response) => {
    const dni = request.params.dni;

    try {
        const result = await pool.query(
            'SELECT * FROM Usuario WHERE dni = $1',
            [dni]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Error... Usuario no encontrado' });
        }

        return response.status(200).json(usuarioEncontrado);
    } 
    catch (error) {
        console.error('Error al buscar usuario por DNI:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const LoginUsuario = async (request: Request, response: Response) => {
    const { email, password } = request.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Credenciales incorrectas' });
        }

        // Verifica la contraseña
        const isPasswordValid = await bcrypt.compare(password, usuarioEncontrado.password);
        if (!isPasswordValid) {
            return response.status(404).json({ message: 'Credenciales incorrectas' });
        }

        return response.status(200).json({ message: 'Inicio de sesión exitoso', usuario: usuarioEncontrado });
    } 
    catch (error) {
        console.error('Error al hacer Login', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const recoverPassword = async (request: Request, response: Response) => {
    const { correo } = request.body;

    try {
        const result = await pool.query(
            'SELECT * FROM Usuario WHERE correo = $1',
            [correo]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Aquí podrías implementar la lógica para enviar un correo electrónico con un enlace para restablecer la contraseña
        // En este ejemplo, devolvemos la información del usuario encontrado
        return response.status(200).json({ message: 'Correo electrónico enviado para recuperación de contraseña', usuario: usuarioEncontrado });
    } catch (error) {
        console.error('Error al recuperar contraseña', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

