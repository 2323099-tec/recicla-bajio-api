<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre_usuario' => ['required', 'string', 'min:3', 'max:50', 'unique:usuarios,nombre_usuario'],
            'correo'         => ['required', 'email', 'max:100', 'unique:usuarios,correo'],
            'password'       => ['required', 'string', 'min:8', 'max:100'],
        ]);

        $usuario = Usuario::create([
            'nombre_usuario' => $datos['nombre_usuario'],
            'correo'         => $datos['correo'],
            'password_hash'  => Hash::make($datos['password']),
            'rol'            => 'participante',
            'estado'         => 1,
        ]);

        $token = $usuario->createToken('recicla-bajio-token')->plainTextToken;

        return response()->json([
            'mensaje' => 'Cuenta creada correctamente.',
            'token'   => $token,
            'usuario' => [
                'id_usuario'     => $usuario->id_usuario,
                'nombre_usuario' => $usuario->nombre_usuario,
                'correo'         => $usuario->correo,
                'rol'            => $usuario->rol,
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'correo'   => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $usuario = Usuario::where('correo', $datos['correo'])->first();

        if (!$usuario || !Hash::check($datos['password'], $usuario->password_hash)) {
            return response()->json([
                'message' => 'Correo o contraseña incorrectos.',
            ], 401);
        }

        if ((int) $usuario->estado !== 1) {
            return response()->json([
                'message' => 'Esta cuenta se encuentra desactivada.',
            ], 403);
        }

        $token = $usuario->createToken('recicla-bajio-token')->plainTextToken;

        return response()->json([
            'mensaje' => 'Sesión iniciada correctamente.',
            'token'   => $token,
            'usuario' => [
                'id_usuario'     => $usuario->id_usuario,
                'nombre_usuario' => $usuario->nombre_usuario,
                'correo'         => $usuario->correo,
                'rol'            => $usuario->rol,
            ],
        ]);
    }

    public function perfil(Request $request): JsonResponse
    {
        $u = $request->user();
        return response()->json([
            'id_usuario'     => $u->id_usuario,
            'nombre_usuario' => $u->nombre_usuario,
            'correo'         => $u->correo,
            'rol'            => $u->rol,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['mensaje' => 'Sesión cerrada.']);
    }

    // Exclusivo para rol 'admin': listar usuarios y cambiar roles/estado
    public function indexUsuarios(): JsonResponse
    {
        $usuarios = Usuario::select('id_usuario', 'nombre_usuario', 'correo', 'rol', 'estado', 'fecha_registro')
            ->orderBy('id_usuario')
            ->get();

        return response()->json($usuarios);
    }

    public function actualizarRol(Request $request, int $id): JsonResponse
    {
        $datos = $request->validate([
            'rol'    => ['sometimes', 'in:visitante,participante,colaborador,admin'],
            'estado' => ['sometimes', 'boolean'],
        ]);

        $usuario = Usuario::findOrFail($id);
        $usuario->update($datos);

        return response()->json([
            'mensaje' => 'Usuario actualizado correctamente.',
            'usuario' => $usuario,
        ]);
    }
}