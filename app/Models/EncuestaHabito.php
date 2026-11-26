<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EncuestaHabito extends Model
{
    protected $table = 'encuestas_habitos';
    protected $primaryKey = 'id_encuesta';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'colonia_zona',
        'separa_residuos',
        'conoce_acopios',
        'frecuencia_entrega',
    ];

    public function detalles()
    {
        return $this->hasMany(DetalleMaterialSeparado::class, 'id_encuesta', 'id_encuesta');
    }
}