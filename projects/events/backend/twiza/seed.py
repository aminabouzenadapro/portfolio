"""Demo data: the association's team, its events and their participants.
Dates are relative to now so the demo always has an event in progress, past events and upcoming ones."""
from __future__ import annotations

import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from . import clock
from .models import Event, Registration, User
from .security import hash_password
from .services import CODE_ALPHABET

DEMO_PASSWORD = "demo1234"
ORGANIZER = "organisatrice@twiza-dz.org"
VOLUNTEER = "benevole@twiza-dz.org"

FIRST = ["Amine", "Lina", "Walid", "Meriem", "Sofiane", "Imene", "Rayan", "Yasmine", "Bilal", "Asma", "Hichem", "Nour", "Islam", "Feriel", "Anis", "Rania", "Mehdi", "Khadidja", "Oussama", "Selma", "Riad", "Chaima", "Fares", "Manel", "Adel", "Ines", "Zakaria", "Hadjer", "Nassim", "Douaa", "Ayoub", "Sabrina", "Younes", "Amel", "Haithem", "Wissal", "Samir", "Maroua", "Akram", "Djihane"]
LAST = ["Bouzid", "Hamdi", "Saidi", "Mebarki", "Rahmani", "Benkhaled", "Ziani", "Chabane", "Belkacem", "Aouadi", "Gherbi", "Lounis", "Merabet", "Brahimi", "Djebbar", "Kaci", "Boukhalfa", "Ferhat", "Slimani", "Bensalem"]


def _day(n: datetime, days: int, hour: int, minute: int = 0) -> datetime:
    return (n + timedelta(days=days)).replace(hour=hour, minute=minute, second=0, microsecond=0)


def events_spec(n: datetime) -> list[dict]:
    now_slot = n.replace(minute=0, second=0, microsecond=0)
    return [
        dict(slug="cafe-lecture-enfants", category="education", color="#7048e8", capacity=40, registered=34, checked=18,
             starts_at=now_slot - timedelta(hours=1), ends_at=now_slot + timedelta(hours=3),
             place="Bibliothèque de quartier Émir-Abdelkader", address="Cité Émir-Abdelkader, Constantine",
             title={"fr": "Café-lecture pour enfants", "ar": "مقهى القراءة للأطفال", "en": "Children's reading café"},
             summary={"fr": "Lectures à voix haute, jeux et dessins pour les 6–11 ans, avec un livre offert à chaque enfant.", "ar": "قراءة بصوت عال وألعاب ورسم للأطفال من 6 إلى 11 سنة، مع كتاب هدية لكل طفل.", "en": "Read-aloud stories, games and drawing for 6 to 11 year olds, with a free book for every child."},
             description={"fr": "Nos bénévoles lisent des contes en arabe et en français, puis chaque enfant repart avec un livre offert par l'association.\n\nLes parents peuvent rester sur place : un coin thé est prévu.", "ar": "يقرأ متطوعونا حكايات بالعربية والفرنسية، ثم يعود كل طفل بكتاب تهديه له الجمعية.\n\nيمكن للأولياء البقاء في المكان: ركن للشاي متوفر.", "en": "Our volunteers read stories in Arabic and French, and every child goes home with a book from the association.\n\nParents are welcome to stay: there is a tea corner."}),
        dict(slug="plantation-djebel-ouahch", category="environment", color="#12715b", capacity=80, registered=57,
             starts_at=_day(n, 6, 9), ends_at=_day(n, 6, 13),
             place="Forêt du Djebel Ouahch", address="Route du Djebel Ouahch, Constantine",
             title={"fr": "Plantons 500 arbres au Djebel Ouahch", "ar": "لنغرس 500 شجرة في جبل الوحش", "en": "Planting 500 trees at Djebel Ouahch"},
             summary={"fr": "Une matinée de reboisement avec la Conservation des forêts. Outils et plants fournis.", "ar": "صبيحة تشجير مع محافظة الغابات. الأدوات والشتلات متوفرة.", "en": "A morning of reforestation with the forestry service. Tools and seedlings provided."},
             description={"fr": "Rendez-vous à l'entrée de la forêt. Des équipes de cinq personnes, chacune avec un forestier, plantent pins d'Alep et chênes-lièges.\n\nPrévoyez des chaussures fermées, une casquette et une bouteille d'eau.", "ar": "الموعد عند مدخل الغابة. فرق من خمسة أشخاص، مع كل فرقة حارس غابة، تغرس الصنوبر الحلبي والفلين.\n\nأحضروا أحذية مغلقة وقبعة وقارورة ماء.", "en": "Meet at the forest entrance. Teams of five, each with a forester, plant Aleppo pines and cork oaks.\n\nBring closed shoes, a cap and a bottle of water."}),
        dict(slug="collecte-de-sang", category="health", color="#c92a2a", capacity=60, registered=41,
             starts_at=_day(n, 10, 9), ends_at=_day(n, 10, 15),
             place="Maison de jeunes de Sidi Mabrouk", address="Sidi Mabrouk, Constantine",
             title={"fr": "Collecte de sang avec le CHU", "ar": "حملة التبرع بالدم مع المستشفى الجامعي", "en": "Blood drive with the university hospital"},
             summary={"fr": "Réservez un créneau : l'équipe du CHU Ibn Badis accueille les donneurs toute la journée.", "ar": "احجزوا موعدكم: يستقبل فريق المستشفى الجامعي ابن باديس المتبرعين طوال اليوم.", "en": "Book a slot: the Ibn Badis hospital team welcomes donors all day."},
             description={"fr": "Un don prend environ 45 minutes, collation comprise. Venez avec une pièce d'identité, après avoir mangé.\n\nConditions : avoir entre 18 et 65 ans et peser plus de 50 kg.", "ar": "يستغرق التبرع حوالي 45 دقيقة مع الوجبة الخفيفة. أحضروا بطاقة التعريف وتعالوا بعد الأكل.\n\nالشروط: السن بين 18 و65 سنة والوزن أكثر من 50 كغ.", "en": "Donating takes about 45 minutes, snack included. Bring an ID and come after eating.\n\nYou must be between 18 and 65 and weigh more than 50 kg."}),
        dict(slug="atelier-code-enfants", category="education", color="#1971c2", capacity=20, registered=20, waitlist=6,
             starts_at=_day(n, 13, 14), ends_at=_day(n, 13, 17),
             place="Bibliothèque municipale Malek-Bennabi", address="Centre-ville, Constantine",
             title={"fr": "Atelier code pour enfants (8–12 ans)", "ar": "ورشة برمجة للأطفال (8–12 سنة)", "en": "Coding workshop for kids (8–12)"},
             summary={"fr": "Les enfants créent leur premier jeu avec Scratch, accompagnés d'étudiants en informatique.", "ar": "يصنع الأطفال أول لعبة لهم بـ Scratch بمرافقة طلبة الإعلام الآلي.", "en": "Children make their first game with Scratch, guided by computer science students."},
             description={"fr": "Un ordinateur pour deux enfants, fourni par l'association. Aucune connaissance n'est demandée.\n\nLes parents récupèrent les enfants à 17 h ; chaque projet est envoyé par e-mail.", "ar": "حاسوب لكل طفلين توفره الجمعية. لا تشترط أي معرفة مسبقة.\n\nيستلم الأولياء أطفالهم على الساعة 17:00 ويُرسل كل مشروع عبر البريد.", "en": "One computer for two children, provided by the association. No experience needed.\n\nParents pick the children up at 5 pm; each project is sent by email."}),
        dict(slug="balade-patrimoine-souika", category="culture", color="#b5651d", capacity=30, registered=17,
             starts_at=_day(n, 17, 10), ends_at=_day(n, 17, 12, 30),
             place="Place des Martyrs", address="Centre-ville, Constantine",
             title={"fr": "Balade patrimoine : la Souika et les ponts", "ar": "جولة تراثية: السويقة والجسور", "en": "Heritage walk: the Souika and the bridges"},
             summary={"fr": "Deux heures dans la vieille ville avec un guide, du pont Sidi M'Cid à la mosquée Sidi Lakhdar.", "ar": "ساعتان في المدينة القديمة مع مرشد، من جسر سيدي مسيد إلى مسجد سيدي لخضر.", "en": "Two hours in the old town with a guide, from the Sidi M'Cid bridge to the Sidi Lakhdar mosque."},
             description={"fr": "Notre guide bénévole raconte l'histoire des ruelles de la Souika, des artisans du cuivre et des ponts suspendus.\n\nParcours en pente : prévoyez de bonnes chaussures.", "ar": "يروي مرشدنا المتطوع تاريخ أزقة السويقة وحرفيي النحاس والجسور المعلقة.\n\nالمسار منحدر: أحضروا أحذية مريحة.", "en": "Our volunteer guide tells the story of the Souika's alleys, the coppersmiths and the suspension bridges.\n\nThe route is steep: wear good shoes."}),
        dict(slug="nettoyage-berges-rhumel", category="environment", color="#0b7285", capacity=80, registered=71, checked=56,
             starts_at=_day(n, -9, 9), ends_at=_day(n, -9, 12),
             place="Berges du Rhumel, Bab El Kantara", address="Bab El Kantara, Constantine",
             title={"fr": "Grand nettoyage des berges du Rhumel", "ar": "حملة تنظيف ضفاف وادي الرمال", "en": "Big clean-up of the Rhumel riverbanks"},
             summary={"fr": "Gants, sacs et pinces fournis : 1,2 tonne de déchets ramassée l'an dernier.", "ar": "القفازات والأكياس متوفرة: جمعنا 1,2 طن من النفايات العام الماضي.", "en": "Gloves, bags and grabbers provided: 1.2 tonnes of waste collected last year."},
             description={"fr": "Nous travaillons par équipes le long de la rivière, avec le soutien de l'APC pour l'enlèvement des sacs.", "ar": "نعمل في فرق على طول الوادي بدعم من البلدية لرفع الأكياس.", "en": "We work in teams along the river, with the town council collecting the bags."}),
        dict(slug="conference-entreprendre", category="solidarity", color="#e8590c", capacity=50, registered=46, checked=33,
             starts_at=_day(n, -24, 17), ends_at=_day(n, -24, 19),
             place="Maison de la culture Mohamed-Laïd-Al-Khalifa", address="Centre-ville, Constantine",
             title={"fr": "Rencontre : entreprendre à Constantine", "ar": "لقاء: ريادة الأعمال في قسنطينة", "en": "Meet-up: starting a business in Constantine"},
             summary={"fr": "Trois jeunes entrepreneurs racontent leurs débuts, suivis d'échanges avec le public.", "ar": "ثلاثة رواد أعمال شباب يروون بداياتهم، يليها نقاش مع الجمهور.", "en": "Three young entrepreneurs share how they started, followed by questions from the audience."},
             description={"fr": "Avec la participation de l'ANADE et d'un incubateur local.", "ar": "بمشاركة الوكالة الوطنية لدعم وتنمية المقاولاتية وحاضنة محلية.", "en": "With the national entrepreneurship agency (ANADE) and a local incubator."}),
    ]


def seed(s: Session, at: datetime | None = None) -> dict:
    n = at or clock.now()
    rnd = random.Random(20261024)
    s.add_all([
        User(name="Nesrine Bouali", email=ORGANIZER, password_hash=hash_password(DEMO_PASSWORD), role="organizer"),
        User(name="Walid Haddad", email=VOLUNTEER, password_hash=hash_password(DEMO_PASSWORD), role="volunteer"),
    ])
    people = [(f"{f} {rnd.choice(LAST)}") for f in FIRST]
    codes: set[str] = set()

    def code() -> str:
        while True:
            c = "TWZ-" + "".join(rnd.choice(CODE_ALPHABET) for _ in range(4)) + "-" + "".join(rnd.choice(CODE_ALPHABET) for _ in range(4))
            if c not in codes:
                codes.add(c)
                return c

    total = 0
    for spec in events_spec(n):
        registered, waitlist, checked = spec.pop("registered"), spec.pop("waitlist", 0), spec.pop("checked", 0)
        event = Event(**spec, created_at=spec["starts_at"] - timedelta(days=40), published=True)
        s.add(event)
        # Registrations arrive over the weeks before the event (and before now)
        latest = min(n, event.starts_at) - timedelta(hours=2)
        for i in range(registered + waitlist):
            first = FIRST[i % len(FIRST)]
            name = f"{first} {LAST[(i * 7 + len(spec['slug'])) % len(LAST)]}"
            email = f"{name.lower().replace(' ', '.')}.{i}@mail.dz"
            created = latest - timedelta(hours=rnd.randint(0, 40 * 24) * (registered + waitlist - i) / (registered + waitlist))
            status = "confirmed" if i < registered else "waitlist"
            reg = Registration(event=event, code=code(), name=name, email=email, phone="0" + rnd.choice("567") + "".join(rnd.choice("0123456789") for _ in range(8)),
                               status=status, created_at=created.replace(microsecond=0))
            if status == "confirmed" and i < checked:
                reg.checked_in_at = (event.starts_at + timedelta(minutes=rnd.randint(-40, 50))).replace(microsecond=0)
                reg.checked_in_by = "Walid Haddad"
            s.add(reg)
            total += 1
        # A couple of cancellations, so the counts look real
        if registered > 30:
            s.add(Registration(event=event, code=code(), name="Lamia Kebir", email=f"lamia.kebir.{spec['slug']}@mail.dz", phone="0661234567", status="cancelled", created_at=latest - timedelta(days=5)))
    s.commit()
    return {"events": len(events_spec(n)), "registrations": total}
