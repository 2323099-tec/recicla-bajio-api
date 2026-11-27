<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre'       => ['nullable', 'string', 'min:2', 'max:60'],
            'correo'       => ['required', 'email', 'max:120'],
            'tipo_mensaje' => ['required', 'in:comentario,sugerencia,error_datos,otro'],
            'mensaje'      => ['required', 'string', 'min:10', 'max:500'],
        ]);

        $id = DB::table('mensajes_contacto')->insertGetId([
            'nombre'       => $datos['nombre'] ?? null,
            'correo'       => $datos['correo'],
            'tipo_mensaje' => $datos['tipo_mensaje'],
            'mensaje'      => $datos['mensaje'],
            'fecha_envio'  => now(),
        ]);

        return response()->json([
            'mensaje' => 'Mensaje recibido correctamente.',
            'id'      => $id,
        ], 201);
    }
}