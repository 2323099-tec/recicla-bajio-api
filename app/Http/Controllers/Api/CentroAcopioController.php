<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CentroAcopio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CentroAcopioController extends Controller
{
    public function index(): JsonResponse
    {
        $centros = DB::select("
            SELECT 
                c.id_centro, c.nombre, c.localidad, c.direccion, c.horario, 
                c.contacto, c.fuente_verificacion, c.fecha_verificacion,
                GROUP_CONCAT(r.nombre SEPARATOR ', ') AS materiales_aceptados
            FROM centros_acopio c
            LEFT JOIN centro_materiales cm ON c.id_centro = cm.id_centro
            LEFT JOIN residuos r ON cm.id_residuo = r.id_residuo
            WHERE c.activo = 1
            GROUP BY c.id_centro, c.nombre, c.localidad, c.direccion, c.horario, 
                     c.contacto, c.fuente_verificacion, c.fecha_verificacion
        ");

        return response()->json(['data' => $centros], 200);
    }

    public function porLocalidad(Request $request): JsonResponse
    {
        $localidad = $request->query('localidad', '');

        $centros = CentroAcopio::with('materiales')
            ->where('activo', 1)
            ->where('localidad', 'LIKE', '%' . $localidad . '%')
            ->get();

        return response()->json(['data' => $centros], 200);
    }

    public function porMateriales(Request $request): JsonResponse
    {
        $categoria = $request->query('categoria', '');

        $centros = DB::select("
            SELECT DISTINCT c.* 
            FROM centros_acopio c
            INNER JOIN centro_materiales cm ON c.id_centro = cm.id_centro
            INNER JOIN residuos r ON cm.id_residuo = r.id_residuo
            WHERE c.activo = 1 AND r.categoria = ?
        ", [$categoria]);

        return response()->json(['data' => $centros], 200);
    }
}