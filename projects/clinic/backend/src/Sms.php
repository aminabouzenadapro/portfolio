<?php

declare(strict_types=1);

namespace Clinic;

/**
 * SMS the clinic sends. They are written to the sms_outbox table; a real deployment would hand
 * them to an SMS gateway from there. Messages are short and in the patient's language.
 */
final class Sms
{
    private const TEXT = [
        'confirm' => [
            'fr' => 'Centre El Amel : RDV confirmé le {date} à {time} avec {doctor}. Réf. {ref}. Pour annuler : 031 00 00 00.',
            'ar' => 'مركز الأمل: تم تأكيد موعدك يوم {date} على الساعة {time} مع {doctor}. المرجع {ref}. للإلغاء: 031 00 00 00.',
            'en' => 'El Amel clinic: appointment confirmed on {date} at {time} with {doctor}. Ref. {ref}. To cancel: 031 00 00 00.',
        ],
        'reminder' => [
            'fr' => 'Rappel Centre El Amel : RDV demain {date} à {time} avec {doctor}. Merci d\'arriver 10 min avant.',
            'ar' => 'تذكير من مركز الأمل: موعدك غدا {date} على الساعة {time} مع {doctor}. يرجى الحضور قبل 10 دقائق.',
            'en' => 'El Amel clinic reminder: appointment tomorrow {date} at {time} with {doctor}. Please arrive 10 min early.',
        ],
        'cancel' => [
            'fr' => 'Centre El Amel : votre RDV du {date} à {time} est annulé. Réf. {ref}.',
            'ar' => 'مركز الأمل: تم إلغاء موعدك يوم {date} على الساعة {time}. المرجع {ref}.',
            'en' => 'El Amel clinic: your appointment on {date} at {time} is cancelled. Ref. {ref}.',
        ],
    ];

    public function __construct(private readonly Db $db)
    {
    }

    public function send(string $kind, array $appointment, array $patient, array $practitioner): void
    {
        $at = Clock::parse($appointment['starts_at']);
        $lang = isset(self::TEXT[$kind][$patient['lang']]) ? $patient['lang'] : 'fr';
        $body = strtr(self::TEXT[$kind][$lang], [
            '{date}' => $at->format('d/m'), '{time}' => $at->format('H:i'),
            '{doctor}' => $practitioner['name'], '{ref}' => $appointment['ref'],
        ]);
        $this->db->insert('sms_outbox', [
            'appointment_id' => $appointment['id'], 'phone' => $patient['phone'], 'kind' => $kind,
            'body' => $body, 'created_at' => Clock::sql(Clock::now()),
        ]);
    }
}
