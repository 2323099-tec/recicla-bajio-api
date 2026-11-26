<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetalleMaterialSeparado;
use App\Models\EncuestaHabito;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EncuestaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'id_usuario'         => 'nullable|integer|exists:usuarios,id_usuario',
            'colonia_zona'       => 'required|string|max:100',
            'separa_residuos'    => 'required|in:Siempre,A veces,Nunca',
            'conoce_acopios'     => 'required|boolean',
            'frecuencia_entrega' => 'required|in:Semanal,Quincenal,Mensual,Nunca',
            'materiales'         => 'nullable|array',
            'materiales.*.id_residuo'           => 'required_with:materiales|integer|exists:residuos,id_residuo',
            'materiales.*.cantidad_estimada_kg' => 'nullable|numeric|min:0.1|max:999',
        ]);

        $encuesta = DB::transaction(function () use ($datos) {
            $nueva = EncuestaHabito::create([
                'id_usuario'         => $datos['id_usuario'] ?? null,
                'colonia_zona'       => $datos['colonia_zona'],
                'separa_residuos'    => $datos['separa_residuos'],
                'conoce_acopios'     => $datos['conoce_acopios'],
                'frecuencia_entrega' => $datos['frecuencia_entrega'],
            ]);

            if (!empty($datos['materiales'])) {
                foreach ($datos['materiales'] as $item) {
                    DetalleMaterialSeparado::create([
                        'id_encuesta'          => $nueva->id_encuesta,
                        'id_residuo'           => $item['id_residuo'],
                        'cantidad_estimada_kg' => $item['cantidad_estimada_kg'] ?? 1.00,
                    ]);
                }
            }

            return $nueva->load('detalles');
        });

        return response()->json([
            'mensaje' => 'Encuesta registrada correctamente',
            'data'    => $encuesta,
        ], 201);
    }

    public function estadisticas(): JsonResponse
    {
        $habitos = DB::select("
            SELECT 
                separa_residuos AS categoria,
                COUNT(*) AS total,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM encuestas_habitos)), 2) AS porcentaje
            FROM encuestas_habitos
            GROUP BY separa_residuos
        ");

        $rankingMateriales = DB::select("
            SELECT 
                r.nombre AS material,
                COUNT(d.id_detalle) AS veces_reportado,
                SUM(d.cantidad_estimada_kg) AS total_kg
            FROM detalle_materiales_separados d
            INNER JOIN residuos r ON d.id_residuo = r.id_residuo
            GROUP BY r.id_residuo, r.nombre
            ORDER BY total_kg DESC
        ");

        return response()->json([
            'habitos_separacion' => $habitos,
            'ranking_materiales' => $rankingMateriales,
        ], 200);
    }
}