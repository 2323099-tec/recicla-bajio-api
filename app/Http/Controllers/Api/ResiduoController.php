<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ResiduoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResiduoController extends Controller
{
    public function __construct(
        protected ResiduoService $residuoService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $residuos = $this->residuoService->listar($request->query('categoria'));
        return response()->json(['data' => $residuos], 200);
    }

    public function show(int $id): JsonResponse
    {
        $residuo = $this->residuoService->buscarPorId($id);
        return response()->json(['data' => $residuo], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre'               => 'required|string|max:100',
            'categoria'            => 'required|in:Plásticos,Papel y Cartón,Vidrio,Metales,Electrónicos (RAEE),Orgánicos,Manejo Especial',
            'instrucciones'        => 'required|string',
            'preparacion'          => 'required|string|max:255',
            'tratamiento_especial' => 'nullable|string',
            'componentes_quimicos' => 'nullable|string|max:255',
            'fuente_info'          => 'required|string|max:150',
        ]);

        $nuevo = $this->residuoService->registrar($datos);

        return response()->json([
            'mensaje' => 'Residuo registrado correctamente',
            'data'    => $nuevo,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $datos = $request->validate([
            'nombre'               => 'sometimes|string|max:100',
            'categoria'            => 'sometimes|in:Plásticos,Papel y Cartón,Vidrio,Metales,Electrónicos (RAEE),Orgánicos,Manejo Especial',
            'instrucciones'        => 'sometimes|string',
            'preparacion'          => 'sometimes|string|max:255',
            'tratamiento_especial' => 'nullable|string',
            'componentes_quimicos' => 'nullable|string|max:255',
            'fuente_info'          => 'sometimes|string|max:150',
        ]);

        $actualizado = $this->residuoService->actualizar($id, $datos);

        return response()->json([
            'mensaje' => 'Residuo actualizado correctamente',
            'data'    => $actualizado,
        ], 200);
    }
}