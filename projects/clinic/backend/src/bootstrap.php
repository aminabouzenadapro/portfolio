<?php

declare(strict_types=1);

// PSR-4 style autoloading for the Clinic\ namespace (no Composer needed at runtime)
spl_autoload_register(static function (string $class): void {
    if (str_starts_with($class, 'Clinic\\')) {
        $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, 7)) . '.php';
        if (is_file($file)) {
            require $file;
        }
    }
});

date_default_timezone_set('Africa/Algiers');
mb_internal_encoding('UTF-8');
