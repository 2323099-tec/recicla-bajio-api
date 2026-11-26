<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Residuo extends Model
{
    protected $table = 'residuos';
    protected $primaryKey = 'id_residuo';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'categoria',
        'instrucciones',
        'preparacion',
        'tratamiento_especial',
        'componentes_quimicos',
        'fuente_info',
    ];

    public function centros()
    {
        return $this->belongsToMany(CentroAcopio::class, 'centro_materiales', 'id_residuo', 'id_centro')
                    ->withPivot('condiciones_recepcion');
    }
}