<?php

namespace App\Strategies;

interface DestinoStrategyInterface
{
    public function obtenerTratamiento(array $datos): string;
}