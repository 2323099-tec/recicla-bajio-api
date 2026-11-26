<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre_usuario' => 'required|string|max:50|unique:usuarios,nombre_usuario',
            'correo'         => 'required|email|max:100|unique:usuarios,correo',
            'password'       => 'required|string|min:8',
        ]);

        $usuario = User::create([
            'nombre_usuario' => $datos['nombre_usuario'],
            'correo'         => $datos['correo'],
            'password_hash'  => Hash::make($datos['password']),
            'rol'            => 'participante',
            'estado'         => 1,
        ]);

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'mensaje' => 'Usuario registrado exitosamente',
            'token'   => $token,
            'usuario' => [
                'id'             => $usuario->id_usuario,
                'nombre_usuario' => $usuario->nombre_usuario,
                'correo'         => $usuario->correo,
                'rol'            => $usuario->rol,
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'correo'   => 'required|email',
            'password' => 'required|string',
        ]);

        $usuario = User::where('correo', $request->correo)->first();

        if (!$usuario || !Hash::check($request->password, $usuario->password_hash)) {
            return response()->json([
                'mensaje' => 'Credenciales incorrectas'
            ], 401);
        }

        if ((int) $usuario->estado !== 1) {
            return response()->json([
                'mensaje' => 'Esta cuenta se encuentra desactivada'
            ], 403);
        }

        // Revoca tokens anteriores para mantener una sesión limpia
        $usuario->tokens()->delete();
        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'mensaje' => 'Inicio de sesión exitoso',
            'token'   => $token,
            'usuario' => [
                'id'             => $usuario->id_usuario,
                'nombre_usuario' => $usuario->nombre_usuario,
                'correo'         => $usuario->correo,
                'rol'            => $usuario->rol,
            ],
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'mensaje' => 'Sesión cerrada correctamente'
        ], 200);
    }

    public function perfil(Request $request): JsonResponse
    {
        $u = $request->user();
        return response()->json([
            'id'             => $u->id_usuario,
            'nombre_usuario' => $u->nombre_usuario,
            'correo'         => $u->correo,
            'rol'            => $u->rol,
        ], 200);
    }
}