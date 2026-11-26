<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CentroAcopioController;
use App\Http\Controllers\Api\EncuestaController;
use App\Http\Controllers\Api\ResiduoController;
use Illuminate\Support\Facades\Route;

// ============================================================================
// RUTAS PÚBLICAS (Visitantes y Participantes sin sesión)
// ============================================================================

// Autenticación
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Servicio 1: API de Residuos (Consulta)
Route::get('/residuos', [ResiduoController::class, 'index']);
Route::get('/residuos/{id}', [ResiduoController::class, 'show']);

// Servicio 2: API de Centros de Acopio
Route::get('/acopio', [CentroAcopioController::class, 'index']);
Route::get('/acopio/localidad', [CentroAcopioController::class, 'porLocalidad']);
Route::get('/acopio/materiales', [CentroAcopioController::class, 'porMateriales']);

// Módulo 4 y 5: Encuestas y Estadísticas
Route::post('/encuestas', [EncuestaController::class, 'store']);
Route::get('/estadisticas', [EncuestaController::class, 'estadisticas']);

// ============================================================================
// RUTAS PROTEGIDAS (Requieren Token Bearer de Sanctum)
// ============================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/perfil', [AuthController::class, 'perfil']);

    // Solo Colaboradores y Administradores pueden crear o editar residuos
    Route::middleware('rol:colaborador,admin')->group(function () {
        Route::post('/residuos', [ResiduoController::class, 'store']);
        Route::patch('/residuos/{id}', [ResiduoController::class, 'update']);
    });
});