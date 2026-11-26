<?php

namespace App\Services;

use App\Repositories\Contracts\ResiduoRepositoryInterface;
use App\Strategies\ManejoEspecialStrategy;
use App\Strategies\ReciclajeComunStrategy;

class ResiduoService
{
    public function __construct(
        protected ResiduoRepositoryInterface $residuoRepo
    ) {}

    public function listar(?string $categoria)
    {
        return $this->residuoRepo->obtenerTodos($categoria);
    }

    public function buscarPorId(int $id)
    {
        return $this->residuoRepo->obtenerPorId($id);
    }

    public function registrar(array $datos)
    {
        // Aplica el patrón Strategy si no se especificó tratamiento especial
        if (empty($datos['tratamiento_especial'])) {
            $estrategia = in_array($datos['categoria'], ['Electrónicos (RAEE)', 'Manejo Especial'], true)
                ? new ManejoEspecialStrategy()
                : new ReciclajeComunStrategy();

            $datos['tratamiento_especial'] = $estrategia->obtenerTratamiento($datos);
        }

        return $this->residuoRepo->crear($datos);
    }

    public function actualizar(int $id, array $datos)
    {
        return $this->residuoRepo->actualizar($id, $datos);
    }
}