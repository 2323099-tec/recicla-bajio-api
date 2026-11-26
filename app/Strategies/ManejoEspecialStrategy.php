<?php

namespace App\Strategies;

class ManejoEspecialStrategy implements DestinoStrategyInterface
{
    public function obtenerTratamiento(array $datos): string
    {
        return 'Residuo peligroso/RAEE: Aislar polos o borrar datos y entregar únicamente en puntos autorizados de León.';
    }
}