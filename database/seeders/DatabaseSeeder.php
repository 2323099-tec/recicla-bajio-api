<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Si tienes seeders propios en database/seeders/ (ej. MaterialSeeder),
        // puedes llamarlos aqui dentro de $this->call([...]);
    }
}