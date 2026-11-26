<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleMaterialSeparado extends Model
{
    protected $table = 'detalle_materiales_separados';
    protected $primaryKey = 'id_detalle';
    public $timestamps = false;

    protected $fillable = [
        'id_encuesta',
        'id_residuo',
        'cantidad_estimada_kg',
    ];
}