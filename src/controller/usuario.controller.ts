import { Request, Response, request, response} from 'express';
import bcrypt from 'bcryptjs';
import pool from '../../database.config';
import nodemailer from 'nodemailer';
import crypto from 'crypto'; // Módulo para generación de tokens seguros

// Configura el transporte de correo electrónico
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Coloca aquí tu servidor SMTP
    port: 587,
    secure: false, // True si el servidor requiere conexión segura (TLS)
    auth: {
        user: 'diegocarhuayo5@gmail.com', // Coloca aquí tu usuario de correo electrónico
        pass: 'wscm kcag utox whkv' // Coloca aquí tu contraseña de correo electrónico
    }
});

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


export const recoverPassword = async (request, response) => {
    const { email } = request.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar un token único para la recuperación de contraseña
        const token = crypto.randomBytes(20).toString('hex'); // Genera un token de 20 bytes y lo convierte a hexadecimal

        // Guardar el token en la base de datos asociado al usuario
        await pool.query(
            'UPDATE users SET reset_token = $1 WHERE id = $2',
            [token, usuarioEncontrado.id]
        );

        // Construir el enlace de recuperación de contraseña
        const resetLink = `http://localhost:4200/auth/reset-password?token=${token}`;

        // Envía el correo electrónico con el enlace de recuperación de contraseña
        const mailOptions = {
            from: 'email',
            to: email,
            subject: 'Recuperación de contraseña',
            text: `Hola ${usuarioEncontrado.nombre}, para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetLink}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar correo electrónico:', error);
                return response.status(500).json({ message: 'Error al enviar correo electrónico' });
            }
            console.log('Correo electrónico enviado:', info.response);
        });

        return response.status(200).json({ message: 'Correo electrónico enviado con el enlace de recuperación', usuario: usuarioEncontrado });
    } catch (error) {
        console.error('Error al recuperar contraseña', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const resetPassword = async (request, response) => {
    const { password,token } = request.body;
  
    try {
        // Buscar al usuario por el token de restablecimiento de contraseña
        const result = await pool.query(
            'SELECT * FROM users WHERE reset_token = $1',
            [token]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Token inválido o expirado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar la contraseña del usuario con la nueva contraseña proporcionada
        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL WHERE id = $2',
            [hashedPassword, usuarioEncontrado.id]
        );

        return response.status(200).json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        return response.status(500).json({ message: 'Error interno del servidor al restablecer contraseña' });
    }
};