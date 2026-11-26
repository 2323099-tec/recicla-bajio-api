<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CentroAcopio extends Model
{
    protected $table = 'centros_acopio';
    protected $primaryKey = 'id_centro';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'localidad',
        'direccion',
        'horario',
        'contacto',
        'fuente_verificacion',
        'fecha_verificacion',
        'activo',
    ];

    public function materiales()
    {
        return $this->belongsToMany(Residuo::class, 'centro_materiales', 'id_centro', 'id_residuo')
                    ->withPivot('condiciones_recepcion');
    }
}