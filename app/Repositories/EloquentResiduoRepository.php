<?php

namespace App\Repositories;

use App\Models\Residuo;
use App\Repositories\Contracts\ResiduoRepositoryInterface;

class EloquentResiduoRepository implements ResiduoRepositoryInterface
{
    public function obtenerTodos(?string $categoria = null)
    {
        return Residuo::when($categoria, function ($query, $categoria) {
            return $query->where('categoria', $categoria);
        })->get();
    }

    public function obtenerPorId(int $id)
    {
        return Residuo::findOrFail($id);
    }

    public function crear(array $datos)
    {
        return Residuo::create($datos);
    }

    public function actualizar(int $id, array $datos)
    {
        $residuo = $this->obtenerPorId($id);
        $residuo->update($datos);
        return $residuo;
    }
}