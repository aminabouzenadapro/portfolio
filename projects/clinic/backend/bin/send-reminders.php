<?php

declare(strict_types=1);

// Sends tomorrow's SMS reminders. Run every evening, e.g. with cron:
//   0 18 * * * php /var/www/clinic/backend/bin/send-reminders.php

use Clinic\Db;
use Clinic\Desk;
use Clinic\Sms;

require __DIR__ . '/../src/bootstrap.php';

$db = Db::connect(getenv('DATABASE_URL') ?: 'mysql://root:@127.0.0.1:3306/clinic');
$sent = (new Desk($db, new Sms($db)))->sendReminders();
echo "Reminders queued: $sent\n";
