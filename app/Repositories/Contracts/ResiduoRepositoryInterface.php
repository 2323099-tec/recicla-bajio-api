<?php

namespace App\Repositories\Contracts;

interface ResiduoRepositoryInterface
{
    public function obtenerTodos(?string $categoria = null);
    public function obtenerPorId(int $id);
    public function crear(array $datos);
    public function actualizar(int $id, array $datos);
}