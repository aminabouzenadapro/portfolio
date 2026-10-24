<?php

declare(strict_types=1);

namespace Clinic;

/** A broken rule or a bad request. The message is a short English sentence the front end translates. */
final class HttpError extends \RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message);
    }
}
