<?php

namespace App\Strategies;

class ReciclajeComunStrategy implements DestinoStrategyInterface
{
    public function obtenerTratamiento(array $datos): string
    {
        return 'Aprovechamiento convencional: Entregar limpio, seco y compactado para reincorporación industrial.';
    }
}