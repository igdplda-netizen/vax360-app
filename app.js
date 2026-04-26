/* =======================================================
   Vax360 v2.0 – Application Logic
   ======================================================= */

// ─── Vaccine Schedule ───────────────────────────────────
const VACCINE_SCHEDULE = [
  { id:'bcg', name:'BCG', desc:'Protects against tuberculosis (TB).', ageMonths:0, ageLabel:'At Birth', group:'birth' },
  { id:'hepb-1', name:'Hepatitis B – 1st dose', desc:'Protects against liver infection caused by Hepatitis B.', ageMonths:0, ageLabel:'At Birth', group:'birth' },
  { id:'penta-1', name:'Pentavalent – 1st dose', desc:'Combined vaccine: Diphtheria, Tetanus, Pertussis, Hepatitis B, Hib.', ageMonths:2, ageLabel:'2 months', group:'2m' },
  { id:'ipv-1', name:'Polio (IPV) – 1st dose', desc:'Inactivated Polio Vaccine.', ageMonths:2, ageLabel:'2 months', group:'2m' },
  { id:'rota-1', name:'Rotavirus – 1st dose', desc:'Protects against severe diarrhea from rotavirus.', ageMonths:2, ageLabel:'2 months', group:'2m' },
  { id:'pcv-1', name:'Pneumococcal – 1st dose', desc:'Protects against pneumonia, meningitis.', ageMonths:2, ageLabel:'2 months', group:'2m' },
  { id:'penta-2', name:'Pentavalent – 2nd dose', desc:'Second dose of the combined vaccine.', ageMonths:4, ageLabel:'4 months', group:'4m' },
  { id:'ipv-2', name:'Polio (IPV) – 2nd dose', desc:'Second dose of Polio vaccine.', ageMonths:4, ageLabel:'4 months', group:'4m' },
  { id:'rota-2', name:'Rotavirus – 2nd dose', desc:'Second dose of Rotavirus vaccine.', ageMonths:4, ageLabel:'4 months', group:'4m' },
  { id:'pcv-2', name:'Pneumococcal – 2nd dose', desc:'Second dose of Pneumococcal vaccine.', ageMonths:4, ageLabel:'4 months', group:'4m' },
  { id:'penta-3', name:'Pentavalent – 3rd dose', desc:'Third and final primary dose.', ageMonths:6, ageLabel:'6 months', group:'6m' },
  { id:'ipv-3', name:'Polio (IPV) – 3rd dose', desc:'Third dose of Polio vaccine.', ageMonths:6, ageLabel:'6 months', group:'6m' },
  { id:'rota-3', name:'Rotavirus – 3rd dose', desc:'Third dose of Rotavirus vaccine.', ageMonths:6, ageLabel:'6 months', group:'6m' },
  { id:'flu-1', name:'Influenza – 1st dose', desc:'Annual flu vaccine. First dose for babies over 6 months.', ageMonths:6, ageLabel:'6 months', group:'6m' },
  { id:'yellow-fever', name:'Yellow Fever', desc:'Single dose providing lifelong protection.', ageMonths:9, ageLabel:'9 months', group:'9m' },
  { id:'measles-1', name:'Measles – 1st dose', desc:'Protects against measles virus.', ageMonths:9, ageLabel:'9 months', group:'9m' },
  { id:'mmr-1', name:'MMR – 1st dose', desc:'Measles, Mumps, Rubella combined vaccine.', ageMonths:12, ageLabel:'12 months', group:'12m' },
  { id:'pcv-b', name:'Pneumococcal – Booster', desc:'Booster dose for long-lasting protection.', ageMonths:12, ageLabel:'12 months', group:'12m' },
  { id:'meningo-c', name:'Meningococcal C', desc:'Protects against meningococcal serogroup C.', ageMonths:12, ageLabel:'12 months', group:'12m' },
  { id:'hepa-1', name:'Hepatitis A – 1st dose', desc:'Protects against Hepatitis A infection.', ageMonths:12, ageLabel:'12 months', group:'12m' },
  { id:'varicella-1', name:'Varicella – 1st dose', desc:'Protects against chickenpox.', ageMonths:12, ageLabel:'12 months', group:'12m' },
  { id:'dtp-b1', name:'DTP – 1st Booster', desc:'Booster for Diphtheria, Tetanus, Pertussis.', ageMonths:15, ageLabel:'15 months', group:'15m' },
  { id:'ipv-b1', name:'Polio (IPV) – Booster', desc:'Booster dose of Polio vaccine.', ageMonths:15, ageLabel:'15 months', group:'15m' },
  { id:'mmr-2', name:'MMR – 2nd dose', desc:'Second dose for stronger immunity.', ageMonths:15, ageLabel:'15 months', group:'15m' },
  { id:'hepa-2', name:'Hepatitis A – 2nd dose', desc:'Second dose for lasting protection.', ageMonths:18, ageLabel:'18 months', group:'18m' },
  { id:'varicella-2', name:'Varicella – 2nd dose', desc:'Second dose for lasting immunity.', ageMonths:48, ageLabel:'4 years', group:'4y' },
  { id:'dtp-b2', name:'DTP – 2nd Booster', desc:'Pre-school booster dose.', ageMonths:48, ageLabel:'4 years', group:'4y' },
  { id:'ipv-b2', name:'Polio – 2nd Booster', desc:'Pre-school booster dose.', ageMonths:48, ageLabel:'4 years', group:'4y' },
  { id:'hpv-1', name:'HPV – 1st dose', desc:'Protects against HPV-related cancers.', ageMonths:108, ageLabel:'9 years', group:'9y' },
  { id:'hpv-2', name:'HPV – 2nd dose', desc:'Given 6 months after first dose.', ageMonths:114, ageLabel:'9.5 years', group:'9y' },
  { id:'meningo-acwy', name:'Meningococcal ACWY', desc:'Protects against serogroups A, C, W, Y.', ageMonths:132, ageLabel:'11 years', group:'11y' },
  { id:'tdap', name:'Tdap Booster', desc:'Adolescent booster for Tetanus, Diphtheria, Pertussis.', ageMonths:132, ageLabel:'11 years', group:'11y' },
];

// ─── Vaccine Dependencies ───────────────────────────────
const VACCINE_DEPENDENCIES = {
  'penta-2': ['penta-1'], 'penta-3': ['penta-2'],
  'ipv-2': ['ipv-1'], 'ipv-3': ['ipv-2'], 'ipv-b1': ['ipv-3'], 'ipv-b2': ['ipv-b1'],
  'rota-2': ['rota-1'], 'rota-3': ['rota-2'],
  'pcv-2': ['pcv-1'], 'pcv-b': ['pcv-2'],
  'mmr-2': ['mmr-1'],
  'hepa-2': ['hepa-1'],
  'varicella-2': ['varicella-1'],
  'dtp-b1': ['penta-3'], 'dtp-b2': ['dtp-b1'],
  'hpv-2': ['hpv-1'],
  'measles-1': [], 'mmr-1': ['measles-1'],
};

const GROUP_LABELS_I18N = {
  en: { birth:'🍼 At Birth', '2m':'📅 2 Months', '4m':'📅 4 Months', '6m':'📅 6 Months', '9m':'📅 9 Months', '12m':'🎂 12 Months', '15m':'📅 15 Months', '18m':'📅 18 Months', '4y':'🎒 4 Years', '9y':'📅 9 Years', '11y':'📅 11 Years' },
  pt: { birth:'🍼 Ao Nascer', '2m':'📅 2 Meses', '4m':'📅 4 Meses', '6m':'📅 6 Meses', '9m':'📅 9 Meses', '12m':'🎂 12 Meses', '15m':'📅 15 Meses', '18m':'📅 18 Meses', '4y':'🎒 4 Anos', '9y':'📅 9 Anos', '11y':'📅 11 Anos' },
  fr: { birth:'🍼 À la Naissance', '2m':'📅 2 Mois', '4m':'📅 4 Mois', '6m':'📅 6 Mois', '9m':'📅 9 Mois', '12m':'🎂 12 Mois', '15m':'📅 15 Mois', '18m':'📅 18 Mois', '4y':'🎒 4 Ans', '9y':'📅 9 Ans', '11y':'📅 11 Ans' },
  af: { birth:'🍼 By Geboorte', '2m':'📅 2 Maande', '4m':'📅 4 Maande', '6m':'📅 6 Maande', '9m':'📅 9 Maande', '12m':'🎂 12 Maande', '15m':'📅 15 Maande', '18m':'📅 18 Maande', '4y':'🎒 4 Jaar', '9y':'📅 9 Jaar', '11y':'📅 11 Jaar' },
};
function getGroupLabels() { return GROUP_LABELS_I18N[currentLang] || GROUP_LABELS_I18N.en; }

const TIPS = {
  en: [
    { title:'Did you know?', text:'Vaccines protect not only your child but also the community through herd immunity.' },
    { title:'Stay on schedule!', text:'Following the recommended vaccine schedule gives your child the best protection early in life.' },
    { title:'Keep records safe', text:'Use the export feature to back up your vaccination data regularly.' },
    { title:'Vaccine safety', text:'Vaccines go through rigorous testing before approval. Side effects are usually mild and temporary.' },
    { title:'Travel alert', text:'Some countries require proof of certain vaccinations. Check requirements before traveling.' },
    { title:'Boosters matter', text:'Booster doses strengthen immunity that may fade over time. Don\'t skip them!' },
  ],
  pt: [
    { title:'Você sabia?', text:'As vacinas protegem não apenas o seu filho, mas também a comunidade por meio da imunidade coletiva.' },
    { title:'Fique no cronograma!', text:'Seguir o calendário vacinal recomendado dá ao seu filho a melhor proteção desde cedo.' },
    { title:'Mantenha registros seguros', text:'Use o recurso de exportação para fazer backup dos dados de vacinação regularmente.' },
    { title:'Segurança vacinal', text:'As vacinas passam por testes rigorosos antes da aprovação. Efeitos colaterais geralmente são leves.' },
    { title:'Alerta viagem', text:'Alguns países exigem comprovante de certas vacinações. Verifique os requisitos antes de viajar.' },
    { title:'Reforços importam', text:'Doses de reforço fortalecem a imunidade que pode diminuir com o tempo. Não as pule!' },
  ],
  fr: [
    { title:'Le saviez-vous ?', text:'Les vaccins protègent non seulement votre enfant mais aussi la communauté grâce à l\'immunité collective.' },
    { title:'Respectez le calendrier !', text:'Suivre le calendrier vaccinal recommandé offre la meilleure protection à votre enfant dès le plus jeune âge.' },
    { title:'Gardez vos dossiers', text:'Utilisez la fonction d\'exportation pour sauvegarder régulièrement vos données de vaccination.' },
    { title:'Sécurité vaccinale', text:'Les vaccins passent des tests rigoureux avant approbation. Les effets secondaires sont généralement légers.' },
    { title:'Alerte voyage', text:'Certains pays exigent une preuve de vaccination. Vérifiez les exigences avant de voyager.' },
    { title:'Les rappels comptent', text:'Les doses de rappel renforcent l\'immunité qui peut s\'affaiblir avec le temps. Ne les sautez pas !' },
  ],
  af: [
    { title:'Het jy geweet?', text:'Entstowwe beskerm nie net jou kind nie, maar ook die gemeenskap deur kudde-immuniteit.' },
    { title:'Bly op skedule!', text:'Deur die aanbevole entstofkalender te volg, kry jou kind die beste beskerming vroeg in die lewe.' },
    { title:'Hou rekords veilig', text:'Gebruik die uitvoerfunksie om jou inentingsdata gereeld te rugsteun.' },
    { title:'Entstofveiligheid', text:'Entstowwe ondergaan streng toetsing voor goedkeuring. Newe-effekte is gewoonlik lig en tydelik.' },
    { title:'Reisalarm', text:'Sommige lande vereis bewys van sekere inentings. Kontroleer vereistes voor jy reis.' },
    { title:'Herhaalskote is belangrik', text:'Herhaaldosisse versterk immuniteit wat mettertyd kan afneem. Moet dit nie oorslaan nie!' },
  ],
};

// ─── Translated Vaccine Schedule Data ────────────────────
const VACCINE_I18N = {
  pt: {
    'bcg':{ name:'BCG', desc:'Protege contra a tuberculose (TB).', ageLabel:'Ao Nascer' },
    'hepb-1':{ name:'Hepatite B – 1ª dose', desc:'Protege contra infecção hepática causada pela Hepatite B.', ageLabel:'Ao Nascer' },
    'penta-1':{ name:'Pentavalente – 1ª dose', desc:'Vacina combinada: Difteria, Tétano, Coqueluche, Hepatite B, Hib.', ageLabel:'2 meses' },
    'ipv-1':{ name:'Pólio (VIP) – 1ª dose', desc:'Vacina Inativada contra Poliomielite.', ageLabel:'2 meses' },
    'rota-1':{ name:'Rotavírus – 1ª dose', desc:'Protege contra diarreia grave causada por rotavírus.', ageLabel:'2 meses' },
    'pcv-1':{ name:'Pneumocócica – 1ª dose', desc:'Protege contra pneumonia e meningite.', ageLabel:'2 meses' },
    'penta-2':{ name:'Pentavalente – 2ª dose', desc:'Segunda dose da vacina combinada.', ageLabel:'4 meses' },
    'ipv-2':{ name:'Pólio (VIP) – 2ª dose', desc:'Segunda dose da vacina contra Poliomielite.', ageLabel:'4 meses' },
    'rota-2':{ name:'Rotavírus – 2ª dose', desc:'Segunda dose da vacina contra Rotavírus.', ageLabel:'4 meses' },
    'pcv-2':{ name:'Pneumocócica – 2ª dose', desc:'Segunda dose da vacina Pneumocócica.', ageLabel:'4 meses' },
    'penta-3':{ name:'Pentavalente – 3ª dose', desc:'Terceira e última dose primária.', ageLabel:'6 meses' },
    'ipv-3':{ name:'Pólio (VIP) – 3ª dose', desc:'Terceira dose da vacina contra Poliomielite.', ageLabel:'6 meses' },
    'rota-3':{ name:'Rotavírus – 3ª dose', desc:'Terceira dose da vacina contra Rotavírus.', ageLabel:'6 meses' },
    'flu-1':{ name:'Gripe – 1ª dose', desc:'Vacina anual contra a gripe. Primeira dose para bebês com mais de 6 meses.', ageLabel:'6 meses' },
    'yellow-fever':{ name:'Febre Amarela', desc:'Dose única que oferece proteção vitalícia.', ageLabel:'9 meses' },
    'measles-1':{ name:'Sarampo – 1ª dose', desc:'Protege contra o vírus do sarampo.', ageLabel:'9 meses' },
    'mmr-1':{ name:'Tríplice Viral – 1ª dose', desc:'Vacina combinada contra Sarampo, Caxumba e Rubéola.', ageLabel:'12 meses' },
    'pcv-b':{ name:'Pneumocócica – Reforço', desc:'Dose de reforço para proteção duradoura.', ageLabel:'12 meses' },
    'meningo-c':{ name:'Meningocócica C', desc:'Protege contra o sorogrupo C da meningococo.', ageLabel:'12 meses' },
    'hepa-1':{ name:'Hepatite A – 1ª dose', desc:'Protege contra infecção por Hepatite A.', ageLabel:'12 meses' },
    'varicella-1':{ name:'Varicela – 1ª dose', desc:'Protege contra catapora.', ageLabel:'12 meses' },
    'dtp-b1':{ name:'DTP – 1º Reforço', desc:'Reforço para Difteria, Tétano e Coqueluche.', ageLabel:'15 meses' },
    'ipv-b1':{ name:'Pólio (VIP) – Reforço', desc:'Dose de reforço da vacina contra Poliomielite.', ageLabel:'15 meses' },
    'mmr-2':{ name:'Tríplice Viral – 2ª dose', desc:'Segunda dose para imunidade mais forte.', ageLabel:'15 meses' },
    'hepa-2':{ name:'Hepatite A – 2ª dose', desc:'Segunda dose para proteção duradoura.', ageLabel:'18 meses' },
    'varicella-2':{ name:'Varicela – 2ª dose', desc:'Segunda dose para imunidade duradoura.', ageLabel:'4 anos' },
    'dtp-b2':{ name:'DTP – 2º Reforço', desc:'Dose de reforço pré-escolar.', ageLabel:'4 anos' },
    'ipv-b2':{ name:'Pólio – 2º Reforço', desc:'Dose de reforço pré-escolar.', ageLabel:'4 anos' },
    'hpv-1':{ name:'HPV – 1ª dose', desc:'Protege contra cânceres relacionados ao HPV.', ageLabel:'9 anos' },
    'hpv-2':{ name:'HPV – 2ª dose', desc:'Administrada 6 meses após a primeira dose.', ageLabel:'9,5 anos' },
    'meningo-acwy':{ name:'Meningocócica ACWY', desc:'Protege contra sorogrupos A, C, W, Y.', ageLabel:'11 anos' },
    'tdap':{ name:'Reforço dTpa', desc:'Reforço adolescente para Tétano, Difteria e Coqueluche.', ageLabel:'11 anos' },
  },
  fr: {
    'bcg':{ name:'BCG', desc:'Protège contre la tuberculose (TB).', ageLabel:'À la naissance' },
    'hepb-1':{ name:'Hépatite B – 1ère dose', desc:"Protège contre l'infection du foie causée par l'hépatite B.", ageLabel:'À la naissance' },
    'penta-1':{ name:'Pentavalent – 1ère dose', desc:'Vaccin combiné : Diphtérie, Tétanos, Coqueluche, Hépatite B, Hib.', ageLabel:'2 mois' },
    'ipv-1':{ name:'Polio (VPI) – 1ère dose', desc:'Vaccin antipoliomyélitique inactivé.', ageLabel:'2 mois' },
    'rota-1':{ name:'Rotavirus – 1ère dose', desc:'Protège contre la diarrhée sévère causée par le rotavirus.', ageLabel:'2 mois' },
    'pcv-1':{ name:'Pneumococcique – 1ère dose', desc:'Protège contre la pneumonie et la méningite.', ageLabel:'2 mois' },
    'penta-2':{ name:'Pentavalent – 2ème dose', desc:'Deuxième dose du vaccin combiné.', ageLabel:'4 mois' },
    'ipv-2':{ name:'Polio (VPI) – 2ème dose', desc:'Deuxième dose du vaccin antipoliomyélitique.', ageLabel:'4 mois' },
    'rota-2':{ name:'Rotavirus – 2ème dose', desc:'Deuxième dose du vaccin contre le rotavirus.', ageLabel:'4 mois' },
    'pcv-2':{ name:'Pneumococcique – 2ème dose', desc:'Deuxième dose du vaccin pneumococcique.', ageLabel:'4 mois' },
    'penta-3':{ name:'Pentavalent – 3ème dose', desc:'Troisième et dernière dose primaire.', ageLabel:'6 mois' },
    'ipv-3':{ name:'Polio (VPI) – 3ème dose', desc:'Troisième dose du vaccin antipoliomyélitique.', ageLabel:'6 mois' },
    'rota-3':{ name:'Rotavirus – 3ème dose', desc:'Troisième dose du vaccin contre le rotavirus.', ageLabel:'6 mois' },
    'flu-1':{ name:'Grippe – 1ère dose', desc:'Vaccin annuel contre la grippe. Première dose pour les bébés de plus de 6 mois.', ageLabel:'6 mois' },
    'yellow-fever':{ name:'Fièvre Jaune', desc:'Dose unique offrant une protection à vie.', ageLabel:'9 mois' },
    'measles-1':{ name:'Rougeole – 1ère dose', desc:'Protège contre le virus de la rougeole.', ageLabel:'9 mois' },
    'mmr-1':{ name:'ROR – 1ère dose', desc:'Vaccin combiné Rougeole, Oreillons, Rubéole.', ageLabel:'12 mois' },
    'pcv-b':{ name:'Pneumococcique – Rappel', desc:'Dose de rappel pour une protection durable.', ageLabel:'12 mois' },
    'meningo-c':{ name:'Méningocoque C', desc:'Protège contre le sérogroupe C du méningocoque.', ageLabel:'12 mois' },
    'hepa-1':{ name:'Hépatite A – 1ère dose', desc:"Protège contre l'infection par l'hépatite A.", ageLabel:'12 mois' },
    'varicella-1':{ name:'Varicelle – 1ère dose', desc:'Protège contre la varicelle.', ageLabel:'12 mois' },
    'dtp-b1':{ name:'DTC – 1er Rappel', desc:'Rappel pour Diphtérie, Tétanos, Coqueluche.', ageLabel:'15 mois' },
    'ipv-b1':{ name:'Polio (VPI) – Rappel', desc:'Dose de rappel du vaccin antipoliomyélitique.', ageLabel:'15 mois' },
    'mmr-2':{ name:'ROR – 2ème dose', desc:'Deuxième dose pour une immunité renforcée.', ageLabel:'15 mois' },
    'hepa-2':{ name:'Hépatite A – 2ème dose', desc:'Deuxième dose pour une protection durable.', ageLabel:'18 mois' },
    'varicella-2':{ name:'Varicelle – 2ème dose', desc:'Deuxième dose pour une immunité durable.', ageLabel:'4 ans' },
    'dtp-b2':{ name:'DTC – 2ème Rappel', desc:'Dose de rappel pré-scolaire.', ageLabel:'4 ans' },
    'ipv-b2':{ name:'Polio – 2ème Rappel', desc:'Dose de rappel pré-scolaire.', ageLabel:'4 ans' },
    'hpv-1':{ name:'HPV – 1ère dose', desc:'Protège contre les cancers liés au HPV.', ageLabel:'9 ans' },
    'hpv-2':{ name:'HPV – 2ème dose', desc:'Administrée 6 mois après la première dose.', ageLabel:'9,5 ans' },
    'meningo-acwy':{ name:'Méningocoque ACWY', desc:'Protège contre les sérogroupes A, C, W, Y.', ageLabel:'11 ans' },
    'tdap':{ name:'Rappel dTca', desc:'Rappel adolescent pour Tétanos, Diphtérie, Coqueluche.', ageLabel:'11 ans' },
  },
  af: {
    'bcg':{ name:'BCG', desc:'Beskerm teen tuberkulose (TB).', ageLabel:'By geboorte' },
    'hepb-1':{ name:'Hepatitis B – 1ste dosis', desc:'Beskerm teen lewerinfeksie veroorsaak deur Hepatitis B.', ageLabel:'By geboorte' },
    'penta-1':{ name:'Pentavalent – 1ste dosis', desc:'Gekombineerde entstof: Difterie, Tetanus, Kinkhoes, Hepatitis B, Hib.', ageLabel:'2 maande' },
    'ipv-1':{ name:'Polio (IPV) – 1ste dosis', desc:'Geïnaktiveerde Polio-entstof.', ageLabel:'2 maande' },
    'rota-1':{ name:'Rotavirus – 1ste dosis', desc:'Beskerm teen erge diarree veroorsaak deur rotavirus.', ageLabel:'2 maande' },
    'pcv-1':{ name:'Pneumokokkale – 1ste dosis', desc:'Beskerm teen longontsteking en meningitis.', ageLabel:'2 maande' },
    'penta-2':{ name:'Pentavalent – 2de dosis', desc:'Tweede dosis van die gekombineerde entstof.', ageLabel:'4 maande' },
    'ipv-2':{ name:'Polio (IPV) – 2de dosis', desc:'Tweede dosis van Polio-entstof.', ageLabel:'4 maande' },
    'rota-2':{ name:'Rotavirus – 2de dosis', desc:'Tweede dosis van Rotavirus-entstof.', ageLabel:'4 maande' },
    'pcv-2':{ name:'Pneumokokkale – 2de dosis', desc:'Tweede dosis van Pneumokokkale entstof.', ageLabel:'4 maande' },
    'penta-3':{ name:'Pentavalent – 3de dosis', desc:'Derde en laaste primêre dosis.', ageLabel:'6 maande' },
    'ipv-3':{ name:'Polio (IPV) – 3de dosis', desc:'Derde dosis van Polio-entstof.', ageLabel:'6 maande' },
    'rota-3':{ name:'Rotavirus – 3de dosis', desc:'Derde dosis van Rotavirus-entstof.', ageLabel:'6 maande' },
    'flu-1':{ name:'Griep – 1ste dosis', desc:'Jaarlikse griep-entstof. Eerste dosis vir babas ouer as 6 maande.', ageLabel:'6 maande' },
    'yellow-fever':{ name:'Geelkoors', desc:'Enkele dosis wat lewenslange beskerming bied.', ageLabel:'9 maande' },
    'measles-1':{ name:'Masels – 1ste dosis', desc:'Beskerm teen die maselvirus.', ageLabel:'9 maande' },
    'mmr-1':{ name:'MMR – 1ste dosis', desc:'Gekombineerde entstof teen Masels, Pampoentjies, Rubella.', ageLabel:'12 maande' },
    'pcv-b':{ name:'Pneumokokkale – Herhaalskoot', desc:'Herhaaldosis vir langdurige beskerming.', ageLabel:'12 maande' },
    'meningo-c':{ name:'Meningokokkale C', desc:'Beskerm teen meningokokkale serogroep C.', ageLabel:'12 maande' },
    'hepa-1':{ name:'Hepatitis A – 1ste dosis', desc:'Beskerm teen Hepatitis A-infeksie.', ageLabel:'12 maande' },
    'varicella-1':{ name:'Varicella – 1ste dosis', desc:'Beskerm teen waterpokkies.', ageLabel:'12 maande' },
    'dtp-b1':{ name:'DTP – 1ste Herhaalskoot', desc:'Herhaalskoot vir Difterie, Tetanus, Kinkhoes.', ageLabel:'15 maande' },
    'ipv-b1':{ name:'Polio (IPV) – Herhaalskoot', desc:'Herhaaldosis van Polio-entstof.', ageLabel:'15 maande' },
    'mmr-2':{ name:'MMR – 2de dosis', desc:'Tweede dosis vir sterker immuniteit.', ageLabel:'15 maande' },
    'hepa-2':{ name:'Hepatitis A – 2de dosis', desc:'Tweede dosis vir langdurige beskerming.', ageLabel:'18 maande' },
    'varicella-2':{ name:'Varicella – 2de dosis', desc:'Tweede dosis vir langdurige immuniteit.', ageLabel:'4 jaar' },
    'dtp-b2':{ name:'DTP – 2de Herhaalskoot', desc:'Voorskoolse herhaaldosis.', ageLabel:'4 jaar' },
    'ipv-b2':{ name:'Polio – 2de Herhaalskoot', desc:'Voorskoolse herhaaldosis.', ageLabel:'4 jaar' },
    'hpv-1':{ name:'HPV – 1ste dosis', desc:'Beskerm teen HPV-verwante kankers.', ageLabel:'9 jaar' },
    'hpv-2':{ name:'HPV – 2de dosis', desc:'Gegee 6 maande na die eerste dosis.', ageLabel:'9,5 jaar' },
    'meningo-acwy':{ name:'Meningokokkale ACWY', desc:'Beskerm teen serogroepe A, C, W, Y.', ageLabel:'11 jaar' },
    'tdap':{ name:'Tdap Herhaalskoot', desc:'Adolessent-herhaalskoot vir Tetanus, Difterie, Kinkhoes.', ageLabel:'11 jaar' },
  },
};

function getVaccineI18n(vaccineId) {
  const lang = VACCINE_I18N[currentLang];
  if (lang && lang[vaccineId]) return lang[vaccineId];
  const base = VACCINE_SCHEDULE.find(s => s.id === vaccineId);
  // Also check custom vaccines
  const custom = customVaccines?.find(s => s.id === vaccineId);
  if (base) return { name: base.name, desc: base.desc, ageLabel: base.ageLabel };
  if (custom) return { name: custom.name, desc: custom.desc, ageLabel: custom.ageLabel };
  return { name: vaccineId, desc: '', ageLabel: '' };
}

function getVaccineBaseType(id) {
  // Extract base type: 'penta-2' -> 'penta', 'bcg' -> 'bcg', 'custom-abc123' -> 'custom'
  const parts = id.split('-');
  if (parts[0] === 'custom') return 'custom';
  // Remove trailing number
  if (parts.length > 1 && /^\d+$/.test(parts[parts.length-1])) parts.pop();
  // Remove 'b' suffix (booster indicator)
  if (parts.length > 1 && /^b\d*$/.test(parts[parts.length-1])) parts.pop();
  return parts.join('-');
}

// ─── Vaccine Pros & Cons (Benefits / Side Effects) ──────
const VACCINE_DETAIL = {
  en: {
    'bcg': {
      pros: ['Highly effective against severe childhood TB', 'Single dose provides years of protection', 'One of the oldest and most widely used vaccines globally', 'Prevents TB meningitis in children'],
      cons: ['Small scar may form at injection site', 'Mild fever possible for 1-2 days', 'Local swelling or redness', 'Not fully effective against adult pulmonary TB'],
    },
    'hepb': {
      pros: ['Prevents chronic liver disease and liver cancer', '95% effective after complete series', 'Protection lasts 20+ years', 'Safe for newborns'],
      cons: ['Mild soreness at injection site', 'Low-grade fever in some infants', 'Occasional fussiness for 24-48 hours', 'Very rare allergic reaction'],
    },
    'penta': {
      pros: ['5 vaccines in 1 injection — fewer needle pricks', 'Protects against 5 deadly diseases at once', 'Extensively tested and proven safe', 'Reduces number of clinic visits needed'],
      cons: ['Fever common for 1-2 days', 'Injection site may be sore or swollen', 'Baby may be fussy for 24-48 hours', 'Rarely, a small hard lump at injection site'],
    },
    'ipv': {
      pros: ['Polio is incurable — prevention is the only option', 'IPV cannot cause polio (killed-virus vaccine)', 'Part of a global effort to eradicate polio', '99% effective after 3 doses'],
      cons: ['Mild redness or pain at injection site', 'Slight fever possible', 'Very rare allergic reactions', 'Requires multiple doses for full immunity'],
    },
    'rota': {
      pros: ['Prevents severe dehydration from rotavirus diarrhea', 'Given orally — no injection needed', 'Reduces hospitalizations by ~85%', 'Safe and well-tolerated by infants'],
      cons: ['Mild diarrhea or vomiting for a few days', 'Baby may be slightly irritable', 'Very small increased risk of intussusception (1 in 100,000)', 'Must be started before 15 weeks of age'],
    },
    'pcv': {
      pros: ['Prevents deadly pneumococcal meningitis', 'Protects against pneumonia — leading cause of child death', 'Reduces ear infections', 'Creates herd immunity protection'],
      cons: ['Mild fever or fussiness for 1-2 days', 'Injection site redness or swelling', 'Decreased appetite temporarily', 'Mild drowsiness after vaccination'],
    },
    'flu': {
      pros: ['Reduces risk of severe flu complications', 'Updated annually to match circulating strains', 'Protects vulnerable family members', 'Reduces risk of flu-related hospitalization'],
      cons: ['Must be given every year', 'Mild body aches or low fever for 1-2 days', 'Soreness at injection site', 'Effectiveness varies by season (40-60%)'],
    },
    'yellow-fever': {
      pros: ['Single dose provides lifelong immunity', 'Required for travel to endemic countries', 'Extremely effective (99% protection)', 'Prevents a potentially fatal disease'],
      cons: ['Mild headache, muscle aches for a few days', 'Low-grade fever in ~10% of recipients', 'Not recommended for infants under 6 months', 'Very rare serious reactions in those with egg allergy'],
    },
    'measles': {
      pros: ['Measles can be fatal — vaccine prevents this', '93% effective after 1 dose, 97% after 2 doses', 'Also prevents brain inflammation (encephalitis)', 'Critical for herd immunity (95% coverage needed)'],
      cons: ['Mild rash possible 7-10 days after vaccination', 'Temporary fever in some children', 'Very rare febrile seizure (1 in 3,000)', 'Joint pain very rarely in older children'],
    },
    'mmr': {
      pros: ['Protects against 3 serious diseases in 1 shot', 'Prevents birth defects caused by rubella', 'Prevents deafness from mumps', '97% effective after 2 doses'],
      cons: ['Mild fever or rash 7-12 days after vaccination', 'Temporary joint stiffness (more common in adults)', 'Swollen glands possible', 'Very rare febrile seizure'],
    },
    'meningo-c': {
      pros: ['Meningitis can kill within hours — vaccine saves lives', 'High effectiveness (>90%)', 'Reduces risk of permanent brain damage', 'Protects against blood infections (septicemia)'],
      cons: ['Redness, pain at injection site', 'Mild headache or fatigue', 'Low-grade fever for 1-2 days', 'Mild nausea in some recipients'],
    },
    'hepa': {
      pros: ['Prevents Hepatitis A — a highly contagious liver infection', 'Protection lasts 25+ years', '95-100% effective after 2 doses', 'Important for travel safety'],
      cons: ['Soreness at injection site', 'Mild headache', 'Loss of appetite for 1-2 days', 'Low-grade fever possible'],
    },
    'varicella': {
      pros: ['Prevents chickenpox complications (pneumonia, encephalitis)', 'Prevents shingles later in life', '90% effective after 2 doses', 'Much safer than getting the actual disease'],
      cons: ['Mild rash at injection site in ~5% of recipients', 'Low-grade fever possible', 'Very mild chickenpox-like symptoms (rare)', 'Slight risk of mild joint pain'],
    },
    'dtp': {
      pros: ['Booster maintains critical protection against 3 diseases', 'Pertussis (whooping cough) is dangerous for infants nearby', 'Tetanus prevention through protective wounds', 'Diphtheria protection is life-saving'],
      cons: ['Injection site may be sore for 1-3 days', 'Mild fever or tiredness', 'Temporary arm swelling', 'Fussiness in young children'],
    },
    'hpv': {
      pros: ['Prevents cervical, throat, and other cancers', 'Almost 100% effective against targeted HPV types', 'Most effective when given before exposure', 'Can prevent genital warts'],
      cons: ['Injection site soreness common', 'Mild headache in some recipients', 'Dizziness (brief) after injection', 'Rare fainting episodes (sit for 15 min after)'],
    },
    'meningo-acwy': {
      pros: ['Protects against 4 deadly meningococcal strains', 'Critical for adolescents in group settings', 'Prevents devastating brain infections', 'High effectiveness across all 4 serogroups'],
      cons: ['Soreness, redness at injection site', 'Mild headache or fatigue', 'Low-grade fever for 1-2 days', 'Muscle or joint pain temporarily'],
    },
    'tdap': {
      pros: ['Essential adolescent booster for 3 diseases', 'Helps protect newborns from whooping cough', 'Maintains tetanus immunity for wound protection', 'Need only 1 dose as a teen'],
      cons: ['Injection site pain common', 'Body aches for 1-2 days', 'Mild fever or headache', 'Fatigue for 24-48 hours'],
    },
  },
  pt: {
    'bcg': {
      pros: ['Altamente eficaz contra TB grave na infância', 'Uma única dose oferece anos de proteção', 'Uma das vacinas mais antigas e utilizadas no mundo', 'Previne meningite tuberculosa em crianças'],
      cons: ['Pode formar uma pequena cicatriz no local', 'Febre leve possível por 1-2 dias', 'Inchaço ou vermelhidão local', 'Não totalmente eficaz contra TB pulmonar em adultos'],
    },
    'hepb': {
      pros: ['Previne doenças crônicas do fígado e câncer hepático', '95% de eficácia após série completa', 'Proteção dura mais de 20 anos', 'Segura para recém-nascidos'],
      cons: ['Dor leve no local da injeção', 'Febre baixa em alguns bebês', 'Irritabilidade ocasional por 24-48 horas', 'Reação alérgica muito rara'],
    },
    'penta': {
      pros: ['5 vacinas em 1 injeção — menos furadas', 'Protege contra 5 doenças mortais de uma vez', 'Extensivamente testada e comprovadamente segura', 'Reduz o número de consultas necessárias'],
      cons: ['Febre comum por 1-2 dias', 'Local da injeção pode ficar dolorido ou inchado', 'Bebê pode ficar irritado por 24-48 horas', 'Raramente, um pequeno nódulo no local'],
    },
    'ipv': {
      pros: ['Pólio é incurável — prevenção é a única opção', 'VIP não pode causar pólio (vacina de vírus morto)', 'Parte do esforço global para erradicar a pólio', '99% de eficácia após 3 doses'],
      cons: ['Leve vermelhidão ou dor no local', 'Febre leve possível', 'Reações alérgicas muito raras', 'Requer múltiplas doses para imunidade completa'],
    },
    'rota': {
      pros: ['Previne desidratação grave por diarreia de rotavírus', 'Administrada oralmente — sem injeção', 'Reduz hospitalizações em ~85%', 'Segura e bem tolerada por bebês'],
      cons: ['Diarreia ou vômito leves por alguns dias', 'Bebê pode ficar levemente irritável', 'Risco muito pequeno de intussuscepção (1 em 100.000)', 'Deve ser iniciada antes das 15 semanas'],
    },
    'pcv': {
      pros: ['Previne meningite pneumocócica mortal', 'Protege contra pneumonia — principal causa de morte infantil', 'Reduz infecções de ouvido', 'Cria proteção por imunidade coletiva'],
      cons: ['Febre leve ou irritabilidade por 1-2 dias', 'Vermelhidão ou inchaço no local', 'Diminuição temporária do apetite', 'Sonolência leve após a vacinação'],
    },
    'flu': {
      pros: ['Reduz risco de complicações graves da gripe', 'Atualizada anualmente para cepas circulantes', 'Protege familiares vulneráveis', 'Reduz risco de hospitalização por gripe'],
      cons: ['Deve ser administrada todo ano', 'Dores leves ou febre baixa por 1-2 dias', 'Dor no local da injeção', 'Eficácia varia por temporada (40-60%)'],
    },
    'yellow-fever': {
      pros: ['Dose única fornece imunidade vitalícia', 'Exigida para viagens a países endêmicos', 'Extremamente eficaz (99% de proteção)', 'Previne uma doença potencialmente fatal'],
      cons: ['Dor de cabeça leve, dores musculares por alguns dias', 'Febre baixa em ~10% dos vacinados', 'Não recomendada para bebês com menos de 6 meses', 'Reações graves muito raras em alérgicos a ovo'],
    },
    'measles': {
      pros: ['Sarampo pode ser fatal — a vacina previne isso', '93% eficaz após 1 dose, 97% após 2 doses', 'Também previne inflamação cerebral (encefalite)', 'Crítica para imunidade coletiva (95% de cobertura necessária)'],
      cons: ['Erupção leve possível 7-10 dias após', 'Febre temporária em algumas crianças', 'Convulsão febril muito rara (1 em 3.000)', 'Dor articular muito raramente em crianças mais velhas'],
    },
    'mmr': {
      pros: ['Protege contra 3 doenças graves em 1 dose', 'Previne defeitos congênitos causados pela rubéola', 'Previne surdez por caxumba', '97% eficaz após 2 doses'],
      cons: ['Febre leve ou erupção 7-12 dias após', 'Rigidez articular temporária (mais comum em adultos)', 'Inchaço de gânglios possível', 'Convulsão febril muito rara'],
    },
    'meningo-c': {
      pros: ['Meningite pode matar em horas — a vacina salva vidas', 'Alta eficácia (>90%)', 'Reduz risco de dano cerebral permanente', 'Protege contra infecções sanguíneas (septicemia)'],
      cons: ['Vermelhidão, dor no local da injeção', 'Dor de cabeça ou fadiga leves', 'Febre baixa por 1-2 dias', 'Náusea leve em alguns vacinados'],
    },
    'hepa': {
      pros: ['Previne Hepatite A — infecção hepática altamente contagiosa', 'Proteção dura mais de 25 anos', '95-100% eficaz após 2 doses', 'Importante para segurança em viagens'],
      cons: ['Dor no local da injeção', 'Dor de cabeça leve', 'Perda de apetite por 1-2 dias', 'Febre baixa possível'],
    },
    'varicella': {
      pros: ['Previne complicações da catapora (pneumonia, encefalite)', 'Previne herpes-zóster no futuro', '90% eficaz após 2 doses', 'Muito mais segura do que ter a doença'],
      cons: ['Erupção leve no local em ~5% dos vacinados', 'Febre baixa possível', 'Sintomas muito leves tipo catapora (raro)', 'Leve risco de dor articular'],
    },
    'dtp': {
      pros: ['Reforço mantém proteção crítica contra 3 doenças', 'Coqueluche é perigosa para bebês próximos', 'Prevenção de tétano em ferimentos', 'Proteção contra difteria salva vidas'],
      cons: ['Local da injeção pode doer por 1-3 dias', 'Febre leve ou cansaço', 'Inchaço temporário do braço', 'Irritabilidade em crianças pequenas'],
    },
    'hpv': {
      pros: ['Previne câncer cervical, de garganta e outros', 'Quase 100% eficaz contra tipos de HPV visados', 'Mais eficaz quando administrada antes da exposição', 'Pode prevenir verrugas genitais'],
      cons: ['Dor no local da injeção é comum', 'Dor de cabeça leve em alguns', 'Tontura (breve) após a injeção', 'Episódios raros de desmaio (sente-se 15 min após)'],
    },
    'meningo-acwy': {
      pros: ['Protege contra 4 cepas mortais de meningococo', 'Crítica para adolescentes em ambientes coletivos', 'Previne infecções cerebrais devastadoras', 'Alta eficácia em todos os 4 sorogrupos'],
      cons: ['Dor, vermelhidão no local da injeção', 'Dor de cabeça ou fadiga leves', 'Febre baixa por 1-2 dias', 'Dor muscular ou articular temporária'],
    },
    'tdap': {
      pros: ['Reforço essencial para adolescentes contra 3 doenças', 'Ajuda a proteger recém-nascidos da coqueluche', 'Mantém imunidade antitetânica para ferimentos', 'Necessária apenas 1 dose na adolescência'],
      cons: ['Dor no local da injeção é comum', 'Dores no corpo por 1-2 dias', 'Febre leve ou dor de cabeça', 'Fadiga por 24-48 horas'],
    },
  },
  fr: {
    'bcg': {
      pros: ['Très efficace contre la TB sévère chez l\'enfant', 'Une seule dose offre des années de protection', 'L\'un des vaccins les plus anciens et utilisés au monde', 'Prévient la méningite tuberculeuse chez l\'enfant'],
      cons: ['Une petite cicatrice peut se former au point d\'injection', 'Fièvre légère possible pendant 1-2 jours', 'Gonflement ou rougeur locale', 'Pas totalement efficace contre la TB pulmonaire adulte'],
    },
    'hepb': {
      pros: ['Prévient les maladies chroniques du foie et le cancer', 'Efficace à 95% après la série complète', 'Protection dure plus de 20 ans', 'Sûr pour les nouveau-nés'],
      cons: ['Légère douleur au point d\'injection', 'Fièvre modérée chez certains nourrissons', 'Irritabilité occasionnelle pendant 24-48 heures', 'Réaction allergique très rare'],
    },
    'penta': {
      pros: ['5 vaccins en 1 injection — moins de piqûres', 'Protège contre 5 maladies mortelles à la fois', 'Extensivement testé et prouvé sûr', 'Réduit le nombre de visites médicales'],
      cons: ['Fièvre fréquente pendant 1-2 jours', 'Le site d\'injection peut être douloureux', 'Le bébé peut être irritable pendant 24-48 heures', 'Rarement, une petite bosse dure au point d\'injection'],
    },
    'ipv': {
      pros: ['La polio est incurable — la prévention est la seule option', 'Le VPI ne peut pas causer la polio (vaccin inactivé)', 'Fait partie de l\'effort mondial pour éradiquer la polio', 'Efficace à 99% après 3 doses'],
      cons: ['Légère rougeur ou douleur au point d\'injection', 'Fièvre légère possible', 'Réactions allergiques très rares', 'Nécessite plusieurs doses pour une immunité complète'],
    },
    'rota': {
      pros: ['Prévient la déshydratation sévère par diarrhée à rotavirus', 'Administré par voie orale — pas d\'injection', 'Réduit les hospitalisations d\'environ 85%', 'Sûr et bien toléré par les nourrissons'],
      cons: ['Diarrhée ou vomissements légers pendant quelques jours', 'Le bébé peut être légèrement irritable', 'Très faible risque d\'intussusception (1 sur 100 000)', 'Doit être commencé avant 15 semaines'],
    },
    'pcv': {
      pros: ['Prévient la méningite pneumococcique mortelle', 'Protège contre la pneumonie — principale cause de décès infantile', 'Réduit les otites', 'Crée une protection par immunité collective'],
      cons: ['Fièvre légère ou irritabilité pendant 1-2 jours', 'Rougeur ou gonflement au point d\'injection', 'Diminution temporaire de l\'appétit', 'Légère somnolence après la vaccination'],
    },
    'flu': {
      pros: ['Réduit le risque de complications grippales sévères', 'Mis à jour annuellement pour les souches circulantes', 'Protège les membres vulnérables de la famille', 'Réduit le risque d\'hospitalisation liée à la grippe'],
      cons: ['Doit être administré chaque année', 'Courbatures ou fièvre légère pendant 1-2 jours', 'Douleur au point d\'injection', 'Efficacité variable selon la saison (40-60%)'],
    },
    'yellow-fever': {
      pros: ['Une dose unique offre une immunité à vie', 'Exigé pour les voyages dans les pays endémiques', 'Extrêmement efficace (99% de protection)', 'Prévient une maladie potentiellement mortelle'],
      cons: ['Légers maux de tête, douleurs musculaires pendant quelques jours', 'Fièvre modérée chez ~10% des vaccinés', 'Non recommandé pour les nourrissons de moins de 6 mois', 'Réactions graves très rares chez les allergiques aux œufs'],
    },
    'measles': {
      pros: ['La rougeole peut être mortelle — le vaccin la prévient', 'Efficace à 93% après 1 dose, 97% après 2 doses', 'Prévient aussi l\'encéphalite', 'Crucial pour l\'immunité collective (95% de couverture nécessaire)'],
      cons: ['Éruption légère possible 7-10 jours après', 'Fièvre temporaire chez certains enfants', 'Convulsion fébrile très rare (1 sur 3 000)', 'Douleurs articulaires très rares chez les enfants plus âgés'],
    },
    'mmr': {
      pros: ['Protège contre 3 maladies graves en 1 injection', 'Prévient les malformations congénitales causées par la rubéole', 'Prévient la surdité due aux oreillons', 'Efficace à 97% après 2 doses'],
      cons: ['Fièvre légère ou éruption 7-12 jours après', 'Raideur articulaire temporaire (plus fréquente chez les adultes)', 'Gonflement des ganglions possible', 'Convulsion fébrile très rare'],
    },
    'meningo-c': {
      pros: ['La méningite peut tuer en quelques heures — le vaccin sauve des vies', 'Haute efficacité (>90%)', 'Réduit le risque de dommages cérébraux permanents', 'Protège contre les infections du sang (septicémie)'],
      cons: ['Rougeur, douleur au point d\'injection', 'Léger mal de tête ou fatigue', 'Fièvre modérée pendant 1-2 jours', 'Légère nausée chez certains vaccinés'],
    },
    'hepa': {
      pros: ['Prévient l\'hépatite A — infection hépatique très contagieuse', 'Protection dure plus de 25 ans', 'Efficace à 95-100% après 2 doses', 'Important pour la sécurité en voyage'],
      cons: ['Douleur au point d\'injection', 'Léger mal de tête', 'Perte d\'appétit pendant 1-2 jours', 'Fièvre modérée possible'],
    },
    'varicella': {
      pros: ['Prévient les complications de la varicelle (pneumonie, encéphalite)', 'Prévient le zona plus tard dans la vie', 'Efficace à 90% après 2 doses', 'Beaucoup plus sûr que d\'attraper la maladie'],
      cons: ['Légère éruption au point d\'injection chez ~5%', 'Fièvre modérée possible', 'Symptômes très légers type varicelle (rare)', 'Léger risque de douleur articulaire'],
    },
    'dtp': {
      pros: ['Le rappel maintient une protection critique contre 3 maladies', 'La coqueluche est dangereuse pour les nourrissons proches', 'Prévention du tétanos en cas de blessure', 'La protection contre la diphtérie sauve des vies'],
      cons: ['Le point d\'injection peut être douloureux 1-3 jours', 'Fièvre légère ou fatigue', 'Gonflement temporaire du bras', 'Irritabilité chez les jeunes enfants'],
    },
    'hpv': {
      pros: ['Prévient les cancers du col, de la gorge et autres', 'Presque 100% efficace contre les types de HPV ciblés', 'Plus efficace avant l\'exposition', 'Peut prévenir les verrues génitales'],
      cons: ['Douleur au point d\'injection fréquente', 'Léger mal de tête chez certains', 'Vertiges (brefs) après l\'injection', 'Épisodes rares d\'évanouissement (rester assis 15 min)'],
    },
    'meningo-acwy': {
      pros: ['Protège contre 4 souches mortelles de méningocoque', 'Critique pour les adolescents en groupe', 'Prévient les infections cérébrales dévastatrices', 'Haute efficacité sur les 4 sérogroupes'],
      cons: ['Douleur, rougeur au point d\'injection', 'Léger mal de tête ou fatigue', 'Fièvre modérée pendant 1-2 jours', 'Douleur musculaire ou articulaire temporaire'],
    },
    'tdap': {
      pros: ['Rappel essentiel pour adolescents contre 3 maladies', 'Aide à protéger les nouveau-nés de la coqueluche', 'Maintient l\'immunité antitétanique pour les blessures', 'Une seule dose nécessaire à l\'adolescence'],
      cons: ['Douleur au point d\'injection fréquente', 'Courbatures pendant 1-2 jours', 'Fièvre légère ou mal de tête', 'Fatigue pendant 24-48 heures'],
    },
  },
  af: {
    'bcg': {
      pros: ['Hoogs effektief teen erge kindertyd-TB', 'Enkele dosis bied jare se beskerming', 'Een van die oudste en mees gebruikte entstowwe wêreldwyd', 'Voorkom TB-meningitis by kinders'],
      cons: ['Klein litteken kan by inspuitplek vorm', 'Ligte koors moontlik vir 1-2 dae', 'Plaaslike swelling of rooiheid', 'Nie ten volle effektief teen volwasse pulmonale TB nie'],
    },
    'hepb': {
      pros: ['Voorkom chroniese lewersiekte en lewerkanker', '95% effektief na volledige reeks', 'Beskerming duur 20+ jaar', 'Veilig vir pasgeborenes'],
      cons: ['Ligte seerheid by inspuitplek', 'Lae-graadse koors by sommige babas', 'Af-en-toe norsheid vir 24-48 uur', 'Baie seldsame allergiese reaksie'],
    },
    'penta': {
      pros: ['5 entstowwe in 1 inspuiting — minder naaldprikke', 'Beskerm teen 5 dodelike siektes gelyktydig', 'Uitgebreid getoets en bewys as veilig', 'Verminder die aantal kliniekbesoeke'],
      cons: ['Koors algemeen vir 1-2 dae', 'Inspuitplek kan seer of geswel wees', 'Baba kan nors wees vir 24-48 uur', 'Selde, klein harde knobbel by inspuitplek'],
    },
    'ipv': {
      pros: ['Polio is ongeneeslik — voorkoming is die enigste opsie', 'IPV kan nie polio veroorsaak nie (doodgemaakte virus)', 'Deel van wêreldwye poging om polio uit te roei', '99% effektief na 3 dosisse'],
      cons: ['Ligte rooiheid of pyn by inspuitplek', 'Geringe koors moontlik', 'Baie seldsame allergiese reaksies', 'Vereis meervoudige dosisse vir volle immuniteit'],
    },
    'rota': {
      pros: ['Voorkom erge dehidrasie deur rotavirus-diarree', 'Oraal toegedien — geen inspuiting nodig', 'Verminder hospitalisasies met ~85%', 'Veilig en goed verdra deur babas'],
      cons: ['Ligte diarree of braking vir \'n paar dae', 'Baba kan effens prikkelbaar wees', 'Baie klein verhoogde risiko van intussussepsie (1 in 100 000)', 'Moet voor 15 weke ouderdom begin word'],
    },
    'pcv': {
      pros: ['Voorkom dodelike pneumokokkale meningitis', 'Beskerm teen longontsteking — hoofrede van kindersterftes', 'Verminder oorinfeksies', 'Skep kudde-immuniteit beskerming'],
      cons: ['Ligte koors of norsheid vir 1-2 dae', 'Inspuitplek rooiheid of swelling', 'Tydelike afname in eetlus', 'Ligte slaperigheid na inenting'],
    },
    'flu': {
      pros: ['Verminder risiko van erge griepkomplikasies', 'Jaarliks opgedateer vir sirkulerende stamme', 'Beskerm kwesbare gesinslede', 'Verminder risiko van griep-verwante hospitalisasie'],
      cons: ['Moet elke jaar gegee word', 'Ligte lyfseer of lae koors vir 1-2 dae', 'Seerheid by inspuitplek', 'Effektiwiteit wissel per seisoen (40-60%)'],
    },
    'yellow-fever': {
      pros: ['Enkele dosis bied lewenslange immuniteit', 'Vereis vir reis na endemiese lande', 'Uiters effektief (99% beskerming)', 'Voorkom \'n potensieel dodelike siekte'],
      cons: ['Ligte hoofpyn, spierpyne vir \'n paar dae', 'Lae-graadse koors by ~10% van ontvangers', 'Nie aanbeveel vir babas onder 6 maande', 'Baie seldsame ernstige reaksies by eier-allergie'],
    },
    'measles': {
      pros: ['Masels kan dodelik wees — entstof voorkom dit', '93% effektief na 1 dosis, 97% na 2 dosisse', 'Voorkom ook breinontsteking (ensefalitis)', 'Krities vir kudde-immuniteit (95% dekking nodig)'],
      cons: ['Ligte uitslag moontlik 7-10 dae na inenting', 'Tydelike koors by sommige kinders', 'Baie seldsame koorsstuip (1 in 3 000)', 'Gewrigspyn baie selde by ouer kinders'],
    },
    'mmr': {
      pros: ['Beskerm teen 3 ernstige siektes met 1 inspuiting', 'Voorkom geboortedefekte deur rubella', 'Voorkom doofheid deur pampoentjies', '97% effektief na 2 dosisse'],
      cons: ['Ligte koors of uitslag 7-12 dae na inenting', 'Tydelike gewrigstyfheid (meer by volwassenes)', 'Geswelde kliere moontlik', 'Baie seldsame koorsstuip'],
    },
    'meningo-c': {
      pros: ['Meningitis kan binne ure doodmaak — entstof red lewens', 'Hoë effektiwiteit (>90%)', 'Verminder risiko van permanente breinskade', 'Beskerm teen bloedinfeksies (septisemie)'],
      cons: ['Rooiheid, pyn by inspuitplek', 'Ligte hoofpyn of moegheid', 'Lae-graadse koors vir 1-2 dae', 'Ligte naarheid by sommige ontvangers'],
    },
    'hepa': {
      pros: ['Voorkom Hepatitis A — hoogs aansteeklike lewerinfeksie', 'Beskerming duur 25+ jaar', '95-100% effektief na 2 dosisse', 'Belangrik vir reisveiligheid'],
      cons: ['Seerheid by inspuitplek', 'Ligte hoofpyn', 'Verlies van eetlus vir 1-2 dae', 'Lae-graadse koors moontlik'],
    },
    'varicella': {
      pros: ['Voorkom waterpokkie-komplikasies (longontsteking, ensefalitis)', 'Voorkom gordelroos later in die lewe', '90% effektief na 2 dosisse', 'Baie veiliger as om die siekte te kry'],
      cons: ['Ligte uitslag by inspuitplek by ~5%', 'Lae-graadse koors moontlik', 'Baie ligte waterpokkie-simptome (seld)', 'Geringe risiko van gewrigspyn'],
    },
    'dtp': {
      pros: ['Herhaalskoot handhaaf kritieke beskerming teen 3 siektes', 'Kinkhoes is gevaarlik vir babas naby', 'Tetanusvoorkoming deur wondbeskerming', 'Difteriebeskerming red lewens'],
      cons: ['Inspuitplek kan seer wees vir 1-3 dae', 'Ligte koors of moegheid', 'Tydelike armswelling', 'Norsheid by jong kinders'],
    },
    'hpv': {
      pros: ['Voorkom servikale, keel- en ander kankers', 'Byna 100% effektief teen geteikende HPV-tipes', 'Mees effektief wanneer voor blootstelling gegee', 'Kan genitale vrate voorkom'],
      cons: ['Inspuitplek seerheid is algemeen', 'Ligte hoofpyn by sommige ontvangers', 'Duiseligheid (kort) na inspuiting', 'Seldsame flou-episodes (sit 15 min na inspuiting)'],
    },
    'meningo-acwy': {
      pros: ['Beskerm teen 4 dodelike meningokokkale stamme', 'Krities vir adolessente in groepomgewings', 'Voorkom verwoestende breininfeksies', 'Hoë effektiwiteit oor al 4 serogroepe'],
      cons: ['Seerheid, rooiheid by inspuitplek', 'Ligte hoofpyn of moegheid', 'Lae-graadse koors vir 1-2 dae', 'Spier- of gewrigspyn tydelik'],
    },
    'tdap': {
      pros: ['Noodsaaklike adolessent-herhaalskoot teen 3 siektes', 'Help om pasgeborenes teen kinkhoes te beskerm', 'Handhaaf tetanus-immuniteit vir wondbeskerming', 'Slegs 1 dosis nodig as tiener'],
      cons: ['Inspuitplek-pyn is algemeen', 'Lyfseer vir 1-2 dae', 'Ligte koors of hoofpyn', 'Moegheid vir 24-48 uur'],
    },
  },
};

// Map vaccine IDs to their base type for pros/cons lookup
function getVaccineProsConsType(vaccineId) {
  const map = {
    'bcg':'bcg', 'hepb-1':'hepb', 'penta-1':'penta', 'penta-2':'penta', 'penta-3':'penta',
    'ipv-1':'ipv', 'ipv-2':'ipv', 'ipv-3':'ipv', 'ipv-b1':'ipv', 'ipv-b2':'ipv',
    'rota-1':'rota', 'rota-2':'rota', 'rota-3':'rota',
    'pcv-1':'pcv', 'pcv-2':'pcv', 'pcv-b':'pcv',
    'flu-1':'flu', 'yellow-fever':'yellow-fever',
    'measles-1':'measles', 'mmr-1':'mmr', 'mmr-2':'mmr',
    'meningo-c':'meningo-c', 'hepa-1':'hepa', 'hepa-2':'hepa',
    'varicella-1':'varicella', 'varicella-2':'varicella',
    'dtp-b1':'dtp', 'dtp-b2':'dtp',
    'hpv-1':'hpv', 'hpv-2':'hpv',
    'meningo-acwy':'meningo-acwy', 'tdap':'tdap',
  };
  // Fall back to the other base type parser
  return map[vaccineId] || getVaccineBaseType(vaccineId);
}

function getVaccineDetail(vaccineId) {
  const baseType = getVaccineBaseType(vaccineId);
  const lang = VACCINE_DETAIL[currentLang];
  if (lang && lang[baseType]) return lang[baseType];
  return VACCINE_DETAIL.en[baseType] || { pros: [], cons: [] };
}

// ─── i18n Translation Dictionaries ──────────────────────
const I18N = {
  en: {
    // Splash & Lang
    splash_sub: 'Protecting what matters most',
    choose_language: 'Choose Language',
    change_language: 'Change Language',
    welcome_vax360: 'Welcome to Vax360! 💉',
    onboarding_1: "Keep track of your child's vaccinations easily.",
    onboarding_sched: 'Never miss a date with automatic scheduling.',
    onboarding_offline: 'Works offline. Your data is always available.',
    onboarding_lang: 'Available in multiple languages.',
    got_it: 'Got it!',
    // Login
    choose_continue: "Choose how you'd like to continue",
    im_parent: "I'm a Parent",
    track_vaccines: "Track my children's vaccines",
    administrator: 'Administrator',
    manage_families: 'Manage families & schedules',
    // Parent select
    back: 'Back',
    welcome: 'Welcome!',
    select_or_create: 'Select your profile or create a new one',
    create_profile: 'Create New Profile',
    no_profiles_yet: 'No profiles yet. Create one to get started!',
    child_count: '{n} child',
    children_count: '{n} children',
    // Admin pin
    admin_access: 'Admin Access',
    enter_pin: 'Enter the admin PIN to continue',
    default_pin: 'Default PIN: 1234',
    unlock: 'Unlock',
    incorrect_pin: '❌ Incorrect PIN',
    // Create parent
    your_profile: 'Your Profile',
    tell_about: 'Tell us a little about yourself',
    your_name: 'Your Name',
    email_optional: 'Email (optional)',
    whatsapp_optional: 'WhatsApp (optional)',
    choose_avatar: 'Choose an Avatar',
    lets_go: "Let's Go!",
    please_enter_name: 'Please enter your name',
    welcome_user: 'Welcome, {name}! 🎉',
    // Home
    children: 'Children',
    completed: 'Completed',
    pending: 'Pending',
    needs_attention: 'Needs Attention',
    my_children: 'My Children',
    no_children_yet: 'No children yet',
    add_first_child_desc: 'Add your first child to start tracking their vaccines!',
    add_child: 'Add Child',
    coming_up: 'Coming Up',
    overdue: 'Overdue',
    upcoming_label: 'Upcoming',
    is_overdue: 'is overdue!',
    scheduled: 'Scheduled',
    // Child detail
    edit: 'Edit',
    delete: 'Delete',
    all: 'All',
    done: 'Done',
    // Schedule
    showing_for: 'Showing schedule for:',
    add_child_schedule: 'Add a child to see their schedule here.',
    // History
    vaccination_history: 'Vaccination History',
    no_completed: 'No completed vaccines yet',
    no_completed_desc: 'Completed vaccines will appear here.',
    completed_label: 'Completed',
    // Admin home
    families: 'Families',
    vaccines_given: 'Vaccines Given',
    completion: 'Completion',
    vaccine_completion: 'Vaccine Completion',
    all_families: 'All Families',
    no_families: 'No families registered',
    no_families_desc: 'Families will appear here when parents create profiles.',
    no_data_yet: 'No data yet',
    registered: 'registered',
    no_children_admin: 'No children',
    no_children_admin_desc: 'This family has no children registered yet.',
    // Admin family
    edit_profile: 'Edit Profile',
    // Admin vaccines
    vaccine_schedule_template: 'Vaccine Schedule Template',
    vaccine_template_desc: 'This is the default vaccine schedule applied to all new children.',
    // Modals
    child_name: "Child's Name",
    dob: 'Date of Birth',
    gender: 'Gender',
    girl: 'Girl',
    boy: 'Boy',
    save: 'Save',
    description: 'Description',
    recommended_age: 'Recommended Age',
    scheduled_date: 'Scheduled Date',
    status: 'Status',
    completed_on: 'Completed On',
    notes: 'Notes',
    date_administered: 'Date Administered',
    mark_completed: 'Mark as Completed',
    mark_pending: '↩️ Mark as Pending',
    email: 'Email',
    cancel: 'Cancel',
    confirm: 'Confirm',
    change_pin: 'Change Admin PIN',
    new_pin: 'New PIN',
    change_pin_desc: 'Update the admin access code',
    // Settings
    sign_out: 'Sign Out',
    my_info: 'My Info',
    appearance: 'Appearance',
    dark_mode: 'Dark Mode',
    dark_mode_desc: 'Switch between light & dark',
    language: 'Language',
    change: 'Change',
    data: 'Data',
    export_data: 'Export Data',
    export_desc: 'Download backup as JSON',
    import_data: 'Import Data',
    import_desc: 'Restore from a backup',
    clear_all: 'Clear All Data',
    clear_desc: 'Delete everything permanently',
    clear: 'Clear',
    export: 'Export',
    import: 'Import',
    about_text: "A modern PWA to help parents and administrators track children's vaccinations.",
    // Navigation
    home: 'Home',
    schedule: 'Schedule',
    history: 'History',
    settings: 'Settings',
    dashboard: 'Dashboard',
    vaccines: 'Vaccines',
    // Dynamic strings
    good_morning: 'Good morning',
    good_afternoon: 'Good afternoon',
    good_evening: 'Good evening',
    lets_check: "Let's check on vaccines",
    overview_families: 'Overview of all families',
    vaccine_schedule: 'Vaccine schedule',
    full_timeline: 'Full vaccine timeline',
    completed_vaccines: 'Completed vaccines',
    customize_exp: 'Customize your experience',
    template_children: 'Template for all children',
    family_details: 'Family Details',
    edit_child_title: 'Edit Child',
    add_child_title: 'Add Child',
    fill_all_fields: 'Please fill all fields',
    child_updated: '{name} updated!',
    child_added: '{name} added! 🎉',
    error_no_user: 'Error: no user found',
    delete_child_title: 'Delete Child',
    delete_child_msg: "Delete {name} and all their vaccine records? This can't be undone.",
    child_deleted: '{name} deleted',
    vaccine_completed: '🎉 Vaccine completed!',
    marked_pending: '↩️ Marked as pending',
    parent_label: 'Parent',
    admin_label: 'Admin',
    pin_too_short: 'PIN must be at least 4 characters',
    pin_updated: 'PIN updated! 🔐',
    data_exported: '📤 Data exported!',
    import_data_confirm: 'Replace all data with {n} profiles from backup?',
    data_imported: '📥 Data imported!',
    invalid_file: 'Invalid file',
    error_reading: 'Error reading file',
    clear_all_title: 'Clear All Data',
    clear_all_msg: 'Delete ALL profiles, children, and vaccine records? This cannot be undone.',
    all_data_cleared: 'All data cleared',
    no_match_filter: 'No vaccines match this filter.',
    lang_name: 'English',
    // Landing page
    landing_title: 'Your Child\'s Health, Organized',
    landing_desc: 'Vax360 helps you track vaccinations for all your children in one secure place. Never miss a dose, stay on schedule, and keep your family safe.',
    landing_feature_1: 'Smart Scheduling',
    landing_feature_1_desc: 'Automatic vaccine schedule based on your child\'s age',
    landing_feature_2: 'Secure & Private',
    landing_feature_2_desc: 'Your data is protected with PIN access and stored locally',
    landing_feature_3: 'Multi-Language',
    landing_feature_3_desc: 'Available in English, Portuguese, French, and Afrikaans',
    landing_feature_4: 'Works Offline',
    landing_feature_4_desc: 'Access your records anytime, even without internet',
    get_started: 'Get Started',
    // Vaccine dependencies
    dependency_warning: 'Prerequisites Required',
    dependency_msg: 'The following vaccines must be completed first: {names}',
    // Schedule view toggle
    list_view: 'List',
    calendar_view: 'Calendar',
    // History filters
    filter_by_child: 'Filter by child',
    all_children: 'All Children',
    filter_by_type: 'Vaccine type',
    all_types: 'All Types',
    filter_by_date: 'Date range',
    date_from: 'From',
    date_to: 'To',
    // Admin vaccine CRUD
    add_vaccine: 'Add Vaccine',
    edit_vaccine: 'Edit Vaccine',
    delete_vaccine: 'Delete Vaccine',
    vaccine_name: 'Vaccine Name',
    vaccine_desc: 'Description',
    vaccine_age: 'Age (months)',
    vaccine_group: 'Group',
    vaccine_added: 'Vaccine added!',
    vaccine_updated: 'Vaccine updated!',
    vaccine_deleted: 'Vaccine deleted',
    delete_vaccine_msg: 'Delete vaccine "{name}"? This cannot be undone.',
    custom_vaccine: 'Custom',
    // Super admin
    super_admin: 'Super Admin',
    only_super_admin: 'Only the super admin can perform this action',
    // Password confirm
    enter_password_confirm: 'Enter your PIN to confirm',
    wrong_password: 'Incorrect PIN',
    // Per-child dashboard
    vaccines_per_child: 'Vaccines by Child',
    overdue_count: '{n} overdue',
    pending_count: '{n} pending',
    completed_count: '{n} completed',
    next_vaccine: 'Next',
    no_pending: 'All up to date!',
    // Parent login
    enter_your_pin: 'Enter your PIN',
    create_pin: 'Create a PIN',
    pin_for_security: 'For your security, create a 4-digit PIN',
    login_pin: 'Login PIN',
    // Age strings
    age_years: '{y} yr',
    age_years_plural: '{y} yrs',
    age_months_and: ', {m} mo',
    age_month: '{m} month',
    age_months: '{m} months',
    age_days: '{d} days old',
    age_day: '{d} day old',
    // Status
    status_overdue: 'Overdue',
    status_upcoming: 'Upcoming',
    status_completed: 'Completed',
    status_pending: 'Pending',
    // Family delete
    delete_family_title: 'Delete Family',
    delete_family_msg: "Delete {name} and all their children's records? This can't be undone.",
    profile_updated: '{name} updated!',
    contact_updated: '{field} updated!',
    // Vaccine Modal Tabs
    info_tab: 'Info',
    pros_cons_tab: 'Pros & Cons',
    benefits: 'Benefits',
    side_effects: 'Possible Side Effects',
    // Admin Management
    manage_admins: 'Manage Admins',
    manage_admins_desc: 'Create and manage admin profiles',
    manage: 'Manage',
    add_admin: 'Add Admin',
    edit_admin: 'Edit Admin',
    admin_name: 'Admin Name',
    pin: 'PIN',
    default_admin: 'Default',
    admin_added: 'Admin added! \ud83d\udee1\ufe0f',
    admin_updated: 'Admin updated!',
    admin_deleted: 'Admin deleted',
    delete_admin_title: 'Delete Admin',
    delete_admin_msg: 'Delete admin "{name}"? This cannot be undone.',
    cannot_delete_last: 'Cannot delete the last admin profile',
    no_admins_msg: 'No admin profiles yet',
  },
  pt: {
    splash_sub: 'Protegendo o que mais importa',
    choose_language: 'Escolha o Idioma',
    change_language: 'Mudar Idioma',
    welcome_vax360: 'Bem-vindo ao Vax360! 💉',
    onboarding_1: 'Acompanhe as vacinas do seu filho com facilidade.',
    onboarding_sched: 'Nunca perca uma data com agendamento automático.',
    onboarding_offline: 'Funciona offline. Os seus dados estão sempre disponíveis.',
    onboarding_lang: 'Disponível em vários idiomas.',
    got_it: 'Entendi!',
    choose_continue: 'Escolha como deseja continuar',
    im_parent: 'Sou Pai/Mãe',
    track_vaccines: 'Acompanhar as vacinas dos meus filhos',
    administrator: 'Administrador',
    manage_families: 'Gerenciar famílias e cronogramas',
    back: 'Voltar',
    welcome: 'Bem-vindo!',
    select_or_create: 'Selecione seu perfil ou crie um novo',
    create_profile: 'Criar Novo Perfil',
    no_profiles_yet: 'Nenhum perfil ainda. Crie um para começar!',
    child_count: '{n} filho',
    children_count: '{n} filhos',
    admin_access: 'Acesso Admin',
    enter_pin: 'Digite o PIN de administrador para continuar',
    default_pin: 'PIN padrão: 1234',
    unlock: 'Desbloquear',
    incorrect_pin: '❌ PIN incorreto',
    your_profile: 'Seu Perfil',
    tell_about: 'Conte-nos um pouco sobre você',
    your_name: 'Seu Nome',
    email_optional: 'E-mail (opcional)',
    whatsapp_optional: 'WhatsApp (opcional)',
    choose_avatar: 'Escolha um Avatar',
    lets_go: 'Vamos Lá!',
    please_enter_name: 'Por favor, insira seu nome',
    welcome_user: 'Bem-vindo(a), {name}! 🎉',
    children: 'Filhos',
    completed: 'Completas',
    pending: 'Pendentes',
    needs_attention: 'Precisa de Atenção',
    my_children: 'Meus Filhos',
    no_children_yet: 'Nenhum filho cadastrado',
    add_first_child_desc: 'Adicione seu primeiro filho para começar a acompanhar as vacinas!',
    add_child: 'Adicionar Filho',
    coming_up: 'Próximas',
    overdue: 'Atrasada',
    upcoming_label: 'Em breve',
    is_overdue: 'está atrasada!',
    scheduled: 'Agendada',
    edit: 'Editar',
    delete: 'Excluir',
    all: 'Todas',
    done: 'Feita',
    showing_for: 'Mostrando cronograma para:',
    add_child_schedule: 'Adicione um filho para ver o cronograma aqui.',
    vaccination_history: 'Histórico de Vacinação',
    no_completed: 'Nenhuma vacina concluída ainda',
    no_completed_desc: 'Vacinas concluídas aparecerão aqui.',
    completed_label: 'Concluída',
    families: 'Famílias',
    vaccines_given: 'Vacinas Aplicadas',
    completion: 'Conclusão',
    vaccine_completion: 'Conclusão das Vacinas',
    all_families: 'Todas as Famílias',
    no_families: 'Nenhuma família registrada',
    no_families_desc: 'As famílias aparecerão aqui quando os pais criarem perfis.',
    no_data_yet: 'Sem dados ainda',
    registered: 'registrado(s)',
    no_children_admin: 'Sem filhos',
    no_children_admin_desc: 'Esta família ainda não tem filhos registrados.',
    edit_profile: 'Editar Perfil',
    vaccine_schedule_template: 'Modelo de Calendário Vacinal',
    vaccine_template_desc: 'Este é o calendário de vacinas padrão aplicado a todas as novas crianças.',
    child_name: 'Nome da Criança',
    dob: 'Data de Nascimento',
    gender: 'Gênero',
    girl: 'Menina',
    boy: 'Menino',
    save: 'Salvar',
    description: 'Descrição',
    recommended_age: 'Idade Recomendada',
    scheduled_date: 'Data Agendada',
    status: 'Status',
    completed_on: 'Concluída em',
    notes: 'Observações',
    date_administered: 'Data de Aplicação',
    mark_completed: 'Marcar como Concluída',
    mark_pending: '↩️ Marcar como Pendente',
    email: 'E-mail',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    change_pin: 'Alterar PIN Admin',
    new_pin: 'Novo PIN',
    change_pin_desc: 'Atualizar o código de acesso admin',
    sign_out: 'Sair',
    my_info: 'Minhas Informações',
    appearance: 'Aparência',
    dark_mode: 'Modo Escuro',
    dark_mode_desc: 'Alternar entre claro e escuro',
    language: 'Idioma',
    change: 'Alterar',
    data: 'Dados',
    export_data: 'Exportar Dados',
    export_desc: 'Baixar backup em JSON',
    import_data: 'Importar Dados',
    import_desc: 'Restaurar de um backup',
    clear_all: 'Limpar Todos os Dados',
    clear_desc: 'Deletar tudo permanentemente',
    clear: 'Limpar',
    export: 'Exportar',
    import: 'Importar',
    about_text: 'Um PWA moderno para ajudar pais e administradores a acompanhar as vacinações das crianças.',
    home: 'Início',
    schedule: 'Agenda',
    history: 'Histórico',
    settings: 'Configurações',
    dashboard: 'Painel',
    vaccines: 'Vacinas',
    good_morning: 'Bom dia',
    good_afternoon: 'Boa tarde',
    good_evening: 'Boa noite',
    lets_check: 'Vamos verificar as vacinas',
    overview_families: 'Visão geral de todas as famílias',
    vaccine_schedule: 'Calendário vacinal',
    full_timeline: 'Cronograma completo de vacinas',
    completed_vaccines: 'Vacinas concluídas',
    customize_exp: 'Personalize sua experiência',
    template_children: 'Modelo para todas as crianças',
    family_details: 'Detalhes da Família',
    edit_child_title: 'Editar Filho',
    add_child_title: 'Adicionar Filho',
    fill_all_fields: 'Por favor, preencha todos os campos',
    child_updated: '{name} atualizado!',
    child_added: '{name} adicionado! 🎉',
    error_no_user: 'Erro: nenhum usuário encontrado',
    delete_child_title: 'Excluir Filho',
    delete_child_msg: 'Excluir {name} e todos os registros de vacinas? Essa ação não pode ser desfeita.',
    child_deleted: '{name} excluído',
    vaccine_completed: '🎉 Vacina concluída!',
    marked_pending: '↩️ Marcada como pendente',
    parent_label: 'Pai/Mãe',
    admin_label: 'Administrador',
    pin_too_short: 'O PIN deve ter pelo menos 4 caracteres',
    pin_updated: 'PIN atualizado! 🔐',
    data_exported: '📤 Dados exportados!',
    import_data_confirm: 'Substituir todos os dados com {n} perfis do backup?',
    data_imported: '📥 Dados importados!',
    invalid_file: 'Arquivo inválido',
    error_reading: 'Erro ao ler arquivo',
    clear_all_title: 'Limpar Todos os Dados',
    clear_all_msg: 'Deletar TODOS os perfis, filhos e registros de vacinas? Essa ação não pode ser desfeita.',
    all_data_cleared: 'Todos os dados limpos',
    no_match_filter: 'Nenhuma vacina corresponde a este filtro.',
    lang_name: 'Português (Angola)',
    landing_title: 'A Saúde do Seu Filho, Organizada',
    landing_desc: 'O Vax360 ajuda a acompanhar as vacinas de todos os seus filhos num só lugar seguro. Nunca perca uma dose, mantenha-se no cronograma e proteja a sua família.',
    landing_feature_1: 'Agendamento Inteligente',
    landing_feature_1_desc: 'Calendário automático de vacinas baseado na idade do seu filho',
    landing_feature_2: 'Seguro e Privado',
    landing_feature_2_desc: 'Os seus dados são protegidos com acesso por PIN e armazenados localmente',
    landing_feature_3: 'Multi-Idioma',
    landing_feature_3_desc: 'Disponível em Inglês, Português, Francês e Afrikaans',
    landing_feature_4: 'Funciona Offline',
    landing_feature_4_desc: 'Acesse os seus registos a qualquer momento, mesmo sem internet',
    get_started: 'Começar',
    dependency_warning: 'Pré-requisitos Necessários',
    dependency_msg: 'As seguintes vacinas devem ser concluídas primeiro: {names}',
    list_view: 'Lista',
    calendar_view: 'Calendário',
    filter_by_child: 'Filtrar por filho',
    all_children: 'Todos os Filhos',
    filter_by_type: 'Tipo de vacina',
    all_types: 'Todos os Tipos',
    filter_by_date: 'Intervalo de datas',
    date_from: 'De',
    date_to: 'Até',
    add_vaccine: 'Adicionar Vacina',
    edit_vaccine: 'Editar Vacina',
    delete_vaccine: 'Eliminar Vacina',
    vaccine_name: 'Nome da Vacina',
    vaccine_desc: 'Descrição',
    vaccine_age: 'Idade (meses)',
    vaccine_group: 'Grupo',
    vaccine_added: 'Vacina adicionada!',
    vaccine_updated: 'Vacina atualizada!',
    vaccine_deleted: 'Vacina eliminada',
    delete_vaccine_msg: 'Eliminar a vacina "{name}"? Esta ação não pode ser desfeita.',
    custom_vaccine: 'Personalizada',
    super_admin: 'Super Administrador',
    only_super_admin: 'Apenas o super administrador pode realizar esta ação',
    enter_password_confirm: 'Digite o seu PIN para confirmar',
    wrong_password: 'PIN incorreto',
    vaccines_per_child: 'Vacinas por Filho',
    overdue_count: '{n} atrasada(s)',
    pending_count: '{n} pendente(s)',
    completed_count: '{n} concluída(s)',
    next_vaccine: 'Próxima',
    no_pending: 'Tudo em dia!',
    enter_your_pin: 'Digite o seu PIN',
    create_pin: 'Crie um PIN',
    pin_for_security: 'Para sua segurança, crie um PIN de 4 dígitos',
    login_pin: 'PIN de Acesso',
    age_years: '{y} ano',
    age_years_plural: '{y} anos',
    age_months_and: ', {m} mês',
    age_month: '{m} mês',
    age_months: '{m} meses',
    age_days: '{d} dias de vida',
    age_day: '{d} dia de vida',
    status_overdue: 'Atrasada',
    status_upcoming: 'Em breve',
    status_completed: 'Concluída',
    status_pending: 'Pendente',
    delete_family_title: 'Excluir Família',
    delete_family_msg: 'Excluir {name} e todos os registros dos filhos? Essa ação não pode ser desfeita.',
    profile_updated: '{name} atualizado!',
    contact_updated: '{field} atualizado!',
    info_tab: 'Informa\u00e7\u00e3o',
    pros_cons_tab: 'Pr\u00f3s e Contras',
    benefits: 'Benef\u00edcios',
    side_effects: 'Poss\u00edveis Efeitos Secund\u00e1rios',
    manage_admins: 'Gerir Admins',
    manage_admins_desc: 'Criar e gerir perfis de administrador',
    manage: 'Gerir',
    add_admin: 'Adicionar Admin',
    edit_admin: 'Editar Admin',
    admin_name: 'Nome do Admin',
    pin: 'PIN',
    default_admin: 'Padr\u00e3o',
    admin_added: 'Admin adicionado! \ud83d\udee1\ufe0f',
    admin_updated: 'Admin atualizado!',
    admin_deleted: 'Admin eliminado',
    delete_admin_title: 'Eliminar Admin',
    delete_admin_msg: 'Eliminar o admin "{name}"? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita.',
    cannot_delete_last: 'N\u00e3o \u00e9 poss\u00edvel eliminar o \u00faltimo perfil de administrador',
    no_admins_msg: 'Nenhum perfil de administrador ainda',
  },
  fr: {
    splash_sub: 'Protéger ce qui compte le plus',
    choose_language: 'Choisir la Langue',
    change_language: 'Changer de Langue',
    welcome_vax360: 'Bienvenue sur Vax360 ! 💉',
    onboarding_1: 'Suivez facilement les vaccins de votre enfant.',
    onboarding_sched: 'Ne manquez jamais une date avec la planification automatique.',
    onboarding_offline: 'Fonctionne hors ligne. Vos données sont toujours disponibles.',
    onboarding_lang: 'Disponible en plusieurs langues.',
    got_it: 'Compris !',
    choose_continue: 'Choisissez comment continuer',
    im_parent: 'Je suis Parent',
    track_vaccines: 'Suivre les vaccins de mes enfants',
    administrator: 'Administrateur',
    manage_families: 'Gérer les familles et les calendriers',
    back: 'Retour',
    welcome: 'Bienvenue !',
    select_or_create: 'Sélectionnez votre profil ou créez-en un nouveau',
    create_profile: 'Créer un Nouveau Profil',
    no_profiles_yet: 'Aucun profil encore. Créez-en un pour commencer !',
    child_count: '{n} enfant',
    children_count: '{n} enfants',
    admin_access: 'Accès Admin',
    enter_pin: "Entrez le PIN admin pour continuer",
    default_pin: 'PIN par défaut : 1234',
    unlock: 'Déverrouiller',
    incorrect_pin: '❌ PIN incorrect',
    your_profile: 'Votre Profil',
    tell_about: 'Dites-nous un peu sur vous',
    your_name: 'Votre Nom',
    email_optional: 'E-mail (optionnel)',
    whatsapp_optional: 'WhatsApp (optionnel)',
    choose_avatar: 'Choisissez un Avatar',
    lets_go: 'C\'est Parti !',
    please_enter_name: 'Veuillez entrer votre nom',
    welcome_user: 'Bienvenue, {name} ! 🎉',
    children: 'Enfants',
    completed: 'Terminés',
    pending: 'En attente',
    needs_attention: 'Attention Requise',
    my_children: 'Mes Enfants',
    no_children_yet: 'Aucun enfant encore',
    add_first_child_desc: 'Ajoutez votre premier enfant pour commencer à suivre ses vaccins !',
    add_child: 'Ajouter un Enfant',
    coming_up: 'À venir',
    overdue: 'En retard',
    upcoming_label: 'À venir',
    is_overdue: 'est en retard !',
    scheduled: 'Programmé',
    edit: 'Modifier',
    delete: 'Supprimer',
    all: 'Tous',
    done: 'Fait',
    showing_for: 'Affichage du calendrier pour :',
    add_child_schedule: 'Ajoutez un enfant pour voir son calendrier ici.',
    vaccination_history: 'Historique de Vaccination',
    no_completed: 'Aucun vaccin terminé encore',
    no_completed_desc: 'Les vaccins terminés apparaîtront ici.',
    completed_label: 'Terminé',
    families: 'Familles',
    vaccines_given: 'Vaccins Administrés',
    completion: 'Progression',
    vaccine_completion: 'Progression Vaccinale',
    all_families: 'Toutes les Familles',
    no_families: 'Aucune famille enregistrée',
    no_families_desc: 'Les familles apparaîtront ici quand les parents créeront des profils.',
    no_data_yet: 'Aucune donnée encore',
    registered: 'enregistré(s)',
    no_children_admin: 'Aucun enfant',
    no_children_admin_desc: "Cette famille n'a pas encore d'enfants enregistrés.",
    edit_profile: 'Modifier le Profil',
    vaccine_schedule_template: 'Modèle de Calendrier Vaccinal',
    vaccine_template_desc: "Ceci est le calendrier vaccinal par défaut appliqué à tous les nouveaux enfants.",
    child_name: "Nom de l'Enfant",
    dob: 'Date de Naissance',
    gender: 'Genre',
    girl: 'Fille',
    boy: 'Garçon',
    save: 'Enregistrer',
    description: 'Description',
    recommended_age: 'Âge Recommandé',
    scheduled_date: 'Date Prévue',
    status: 'Statut',
    completed_on: 'Terminé le',
    notes: 'Notes',
    date_administered: 'Date Administrée',
    mark_completed: 'Marquer comme Terminé',
    mark_pending: '↩️ Marquer comme En Attente',
    email: 'E-mail',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    change_pin: 'Changer le PIN Admin',
    new_pin: 'Nouveau PIN',
    change_pin_desc: "Mettre à jour le code d'accès admin",
    sign_out: 'Se Déconnecter',
    my_info: 'Mes Infos',
    appearance: 'Apparence',
    dark_mode: 'Mode Sombre',
    dark_mode_desc: 'Basculer entre clair et sombre',
    language: 'Langue',
    change: 'Changer',
    data: 'Données',
    export_data: 'Exporter les Données',
    export_desc: 'Télécharger la sauvegarde en JSON',
    import_data: 'Importer les Données',
    import_desc: 'Restaurer à partir d\'une sauvegarde',
    clear_all: 'Effacer Toutes les Données',
    clear_desc: 'Supprimer tout de manière permanente',
    clear: 'Effacer',
    export: 'Exporter',
    import: 'Importer',
    about_text: 'Un PWA moderne pour aider les parents et administrateurs à suivre les vaccinations des enfants.',
    home: 'Accueil',
    schedule: 'Calendrier',
    history: 'Historique',
    settings: 'Paramètres',
    dashboard: 'Tableau de bord',
    vaccines: 'Vaccins',
    good_morning: 'Bonjour',
    good_afternoon: 'Bon après-midi',
    good_evening: 'Bonsoir',
    lets_check: 'Vérifions les vaccins',
    overview_families: 'Vue d\'ensemble de toutes les familles',
    vaccine_schedule: 'Calendrier vaccinal',
    full_timeline: 'Calendrier complet des vaccins',
    completed_vaccines: 'Vaccins terminés',
    customize_exp: 'Personnalisez votre expérience',
    template_children: 'Modèle pour tous les enfants',
    family_details: 'Détails de la Famille',
    edit_child_title: 'Modifier l\'Enfant',
    add_child_title: 'Ajouter un Enfant',
    fill_all_fields: 'Veuillez remplir tous les champs',
    child_updated: '{name} mis à jour !',
    child_added: '{name} ajouté ! 🎉',
    error_no_user: 'Erreur : aucun utilisateur trouvé',
    delete_child_title: 'Supprimer l\'Enfant',
    delete_child_msg: 'Supprimer {name} et tous ses registres vaccinaux ? Cette action est irréversible.',
    child_deleted: '{name} supprimé',
    vaccine_completed: '🎉 Vaccin terminé !',
    marked_pending: '↩️ Marqué comme en attente',
    parent_label: 'Parent',
    admin_label: 'Administrateur',
    pin_too_short: 'Le PIN doit comporter au moins 4 caractères',
    pin_updated: 'PIN mis à jour ! 🔐',
    data_exported: '📤 Données exportées !',
    import_data_confirm: 'Remplacer toutes les données avec {n} profils de la sauvegarde ?',
    data_imported: '📥 Données importées !',
    invalid_file: 'Fichier invalide',
    error_reading: 'Erreur de lecture du fichier',
    clear_all_title: 'Effacer Toutes les Données',
    clear_all_msg: 'Supprimer TOUS les profils, enfants et registres vaccinaux ? Cette action est irréversible.',
    all_data_cleared: 'Toutes les données effacées',
    no_match_filter: 'Aucun vaccin ne correspond à ce filtre.',
    lang_name: 'Français',
    age_years: '{y} an',
    age_years_plural: '{y} ans',
    age_months_and: ', {m} mois',
    age_month: '{m} mois',
    age_months: '{m} mois',
    age_days: '{d} jours',
    age_day: '{d} jour',
    status_overdue: 'En retard',
    status_upcoming: 'À venir',
    status_completed: 'Terminé',
    status_pending: 'En attente',
    delete_family_title: 'Supprimer la Famille',
    delete_family_msg: 'Supprimer {name} et tous les dossiers de ses enfants ? Cette action est irréversible.',
    profile_updated: '{name} mis à jour !',
    contact_updated: '{field} mis à jour !',
    info_tab: 'Info',
    pros_cons_tab: 'Avantages et Risques',
    benefits: 'Avantages',
    side_effects: 'Effets secondaires possibles',
    manage_admins: 'Gérer les Admins',
    manage_admins_desc: 'Créer et gérer les profils administrateurs',
    manage: 'Gérer',
    add_admin: 'Ajouter un Admin',
    edit_admin: 'Modifier l\'Admin',
    admin_name: 'Nom de l\'Admin',
    pin: 'PIN',
    default_admin: 'Par défaut',
    admin_added: 'Admin ajouté ! 🛡️',
    admin_updated: 'Admin mis à jour !',
    admin_deleted: 'Admin supprimé',
    delete_admin_title: 'Supprimer l\'Admin',
    delete_admin_msg: 'Supprimer l\'admin "{name}" ? Cette action est irréversible.',
    cannot_delete_last: 'Impossible de supprimer le dernier profil administrateur',
    no_admins_msg: 'Aucun profil administrateur encore',
  },
  af: {
    splash_sub: 'Beskerm wat die meeste saak maak',
    choose_language: 'Kies Taal',
    change_language: 'Verander Taal',
    welcome_vax360: 'Welkom by Vax360! 💉',
    onboarding_1: 'Hou u kind se inentings maklik dop.',
    onboarding_sched: "Moet nooit 'n datum mis met outomatiese skedulering nie.",
    onboarding_offline: 'Werk vanlyn. U data is altyd beskikbaar.',
    onboarding_lang: 'Beskikbaar in verskeie tale.',
    got_it: 'Verstaan!',
    choose_continue: 'Kies hoe jy wil voortgaan',
    im_parent: "Ek is 'n Ouer",
    track_vaccines: 'Volg my kinders se entstowwe',
    administrator: 'Administrateur',
    manage_families: 'Bestuur gesinne en skedules',
    back: 'Terug',
    welcome: 'Welkom!',
    select_or_create: "Kies jou profiel of skep 'n nuwe een",
    create_profile: 'Skep Nuwe Profiel',
    no_profiles_yet: "Geen profiele nog nie. Skep een om te begin!",
    child_count: '{n} kind',
    children_count: '{n} kinders',
    admin_access: 'Admin Toegang',
    enter_pin: 'Voer die admin-PIN in om voort te gaan',
    default_pin: 'Verstek PIN: 1234',
    unlock: 'Ontsluit',
    incorrect_pin: '❌ Verkeerde PIN',
    your_profile: 'Jou Profiel',
    tell_about: "Vertel ons 'n bietjie van jouself",
    your_name: 'Jou Naam',
    email_optional: 'E-pos (opsioneel)',
    whatsapp_optional: 'WhatsApp (opsioneel)',
    choose_avatar: "Kies 'n Avatar",
    lets_go: 'Kom ons Gaan!',
    please_enter_name: 'Voer asseblief jou naam in',
    welcome_user: 'Welkom, {name}! 🎉',
    children: 'Kinders',
    completed: 'Voltooi',
    pending: 'Hangend',
    needs_attention: 'Benodig Aandag',
    my_children: 'My Kinders',
    no_children_yet: 'Nog geen kinders nie',
    add_first_child_desc: 'Voeg jou eerste kind by om hul entstowwe te begin volg!',
    add_child: 'Voeg Kind By',
    coming_up: 'Komende',
    overdue: 'Agterstallig',
    upcoming_label: 'Komend',
    is_overdue: 'is agterstallig!',
    scheduled: 'Geskeduleer',
    edit: 'Wysig',
    delete: 'Verwyder',
    all: 'Alles',
    done: 'Klaar',
    showing_for: 'Wys skedule vir:',
    add_child_schedule: "Voeg 'n kind by om hul skedule hier te sien.",
    vaccination_history: 'Inentingsgeskiedenis',
    no_completed: 'Nog geen voltooide entstowwe nie',
    no_completed_desc: 'Voltooide entstowwe sal hier verskyn.',
    completed_label: 'Voltooi',
    families: 'Gesinne',
    vaccines_given: 'Entstowwe Gegee',
    completion: 'Voltooiing',
    vaccine_completion: 'Entstof Voltooiing',
    all_families: 'Alle Gesinne',
    no_families: 'Geen gesinne geregistreer nie',
    no_families_desc: 'Gesinne sal hier verskyn wanneer ouers profiele skep.',
    no_data_yet: 'Nog geen data nie',
    registered: 'geregistreer',
    no_children_admin: 'Geen kinders',
    no_children_admin_desc: 'Hierdie gesin het nog geen kinders geregistreer nie.',
    edit_profile: 'Wysig Profiel',
    vaccine_schedule_template: 'Entstof Skedule Sjabloon',
    vaccine_template_desc: 'Dit is die verstek entstofskedule wat op alle nuwe kinders toegepas word.',
    child_name: 'Kind se Naam',
    dob: 'Geboortedatum',
    gender: 'Geslag',
    girl: 'Meisie',
    boy: 'Seun',
    save: 'Stoor',
    description: 'Beskrywing',
    recommended_age: 'Aanbevole Ouderdom',
    scheduled_date: 'Geskeduleerde Datum',
    status: 'Status',
    completed_on: 'Voltooi op',
    notes: 'Notas',
    date_administered: 'Datum Toegedien',
    mark_completed: 'Merk as Voltooi',
    mark_pending: '↩️ Merk as Hangend',
    email: 'E-pos',
    cancel: 'Kanselleer',
    confirm: 'Bevestig',
    change_pin: 'Verander Admin-PIN',
    new_pin: 'Nuwe PIN',
    change_pin_desc: 'Dateer die admin-toegangskode op',
    sign_out: 'Teken Uit',
    my_info: 'My Inligting',
    appearance: 'Voorkoms',
    dark_mode: 'Donker Modus',
    dark_mode_desc: 'Wissel tussen lig en donker',
    language: 'Taal',
    change: 'Verander',
    data: 'Data',
    export_data: 'Voer Data Uit',
    export_desc: 'Laai rugsteun af as JSON',
    import_data: 'Voer Data In',
    import_desc: "Herstel van 'n rugsteun",
    clear_all: 'Vee Alle Data Uit',
    clear_desc: 'Verwyder alles permanent',
    clear: 'Vee uit',
    export: 'Uitvoer',
    import: 'Invoer',
    about_text: "'n Moderne PWA om ouers en administrateurs te help om kinders se inentings te volg.",
    home: 'Tuis',
    schedule: 'Skedule',
    history: 'Geskiedenis',
    settings: 'Instellings',
    dashboard: 'Kontroleskerm',
    vaccines: 'Entstowwe',
    good_morning: 'Goeiemôre',
    good_afternoon: 'Goeiemiddag',
    good_evening: 'Goeienaand',
    lets_check: 'Kom ons kyk na die entstowwe',
    overview_families: 'Oorsig van alle gesinne',
    vaccine_schedule: 'Entstofskedule',
    full_timeline: 'Volledige entstof tydlyn',
    completed_vaccines: 'Voltooide entstowwe',
    customize_exp: 'Pasmaak jou ervaring',
    template_children: 'Sjabloon vir alle kinders',
    family_details: 'Gesinbesonderhede',
    edit_child_title: 'Wysig Kind',
    add_child_title: 'Voeg Kind By',
    fill_all_fields: 'Vul asseblief alle velde in',
    child_updated: '{name} opgedateer!',
    child_added: '{name} bygevoeg! 🎉',
    error_no_user: 'Fout: geen gebruiker gevind',
    delete_child_title: 'Verwyder Kind',
    delete_child_msg: 'Verwyder {name} en al hul entstofrekords? Dit kan nie ongedaan gemaak word nie.',
    child_deleted: '{name} verwyder',
    vaccine_completed: '🎉 Entstof voltooi!',
    marked_pending: '↩️ Gemerk as hangend',
    parent_label: 'Ouer',
    admin_label: 'Administrateur',
    pin_too_short: 'PIN moet ten minste 4 karakters wees',
    pin_updated: 'PIN opgedateer! 🔐',
    data_exported: '📤 Data uitgevoer!',
    import_data_confirm: 'Vervang alle data met {n} profiele van rugsteun?',
    data_imported: '📥 Data ingevoer!',
    invalid_file: 'Ongeldige lêer',
    error_reading: 'Fout met lees van lêer',
    clear_all_title: 'Vee Alle Data Uit',
    clear_all_msg: 'Alle profiele, kinders en entstofrekords verwyder? Dit kan nie ongedaan gemaak word nie.',
    all_data_cleared: 'Alle data uitgevee',
    no_match_filter: 'Geen entstowwe pas by hierdie filter nie.',
    lang_name: 'Afrikaans',
    age_years: '{y} jr',
    age_years_plural: '{y} jr',
    age_months_and: ', {m} md',
    age_month: '{m} maand',
    age_months: '{m} maande',
    age_days: '{d} dae oud',
    age_day: '{d} dag oud',
    status_overdue: 'Agterstallig',
    status_upcoming: 'Komend',
    status_completed: 'Voltooi',
    status_pending: 'Hangend',
    delete_family_title: 'Verwyder Gesin',
    delete_family_msg: 'Verwyder {name} en al hul kinders se rekords? Dit kan nie ongedaan gemaak word nie.',
    profile_updated: '{name} opgedateer!',
    contact_updated: '{field} opgedateer!',
    info_tab: 'Inligting',
    pros_cons_tab: 'Voor- en Nadele',
    benefits: 'Voordele',
    side_effects: 'Moontlike Newe-effekte',
    manage_admins: 'Bestuur Admins',
    manage_admins_desc: 'Skep en bestuur admin-profiele',
    manage: 'Bestuur',
    add_admin: 'Voeg Admin By',
    edit_admin: 'Wysig Admin',
    admin_name: 'Admin Naam',
    pin: 'PIN',
    default_admin: 'Verstek',
    admin_added: 'Admin bygevoeg! \ud83d\udee1\ufe0f',
    admin_updated: 'Admin opgedateer!',
    admin_deleted: 'Admin verwyder',
    delete_admin_title: 'Verwyder Admin',
    delete_admin_msg: 'Verwyder admin "{name}"? Dit kan nie ongedaan gemaak word nie.',
    cannot_delete_last: 'Kan nie die laaste admin-profiel verwyder nie',
    no_admins_msg: 'Nog geen admin-profiele nie',
  },
};

// Current language
let currentLang = 'en';

function t(key, replacements) {
  let text = (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });
  // Update language display in settings
  const langDisplay = document.getElementById('current-lang-display');
  if (langDisplay) langDisplay.textContent = t('lang_name');
  // Update html lang attribute
  document.documentElement.lang = currentLang;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('vt2_lang', lang);
  applyTranslations();
}

function loadLanguage() {
  const saved = localStorage.getItem('vt2_lang');
  if (saved && I18N[saved]) {
    currentLang = saved;
  }
  return !!saved;
}

// ─── State ──────────────────────────────────────────────
const S = {
  role: null,        // 'parent' | 'admin'
  userId: null,      // current parent profile id
  users: [],         // all parent profiles
  adminPin: '1234',  // legacy fallback
  adminProfiles: [], // [{id, name, email, pin}]
  currentAdminId: null, // which admin is logged in
  currentChildId: null,
  currentVaccineId: null,
  filter: 'all',
  confirmCb: null,
};

// ─── Helpers ────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const esc = s => { const d = document.createElement('span'); d.textContent = s; return d.innerHTML; };

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

function schedDate(birth, months) {
  const d = new Date(birth);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function vaccineStatus(v, birth) {
  if (v.completedDate) return 'completed';
  const today = new Date(); today.setHours(0,0,0,0);
  const sched = new Date(v.scheduledDate); sched.setHours(0,0,0,0);
  const diff = (sched - today) / 864e5;
  if (diff < 0) return 'overdue';
  if (diff <= 30) return 'upcoming';
  return 'pending';
}

function ageStr(birth) {
  const now = new Date(), b = new Date(birth);
  let y = now.getFullYear()-b.getFullYear(), m = now.getMonth()-b.getMonth(), d = now.getDate()-b.getDate();
  if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  if (y > 0) {
    const yrStr = y > 1 ? t('age_years_plural', {y}) : t('age_years', {y});
    const moStr = m > 0 ? t('age_months_and', {m}) : '';
    return yrStr + moStr;
  }
  if (m > 0) return m > 1 ? t('age_months', {m}) : t('age_month', {m});
  const days = Math.max(0, d);
  return days !== 1 ? t('age_days', {d: days}) : t('age_day', {d: days});
}

function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s+'T00:00:00');
  const localeMap = { en:'en-US', pt:'pt-AO', fr:'fr-FR', af:'af-ZA' };
  return d.toLocaleDateString(localeMap[currentLang]||'en-US', { month:'short', day:'numeric', year:'numeric' });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: t('good_morning'), emoji:'🌅' };
  if (h < 18) return { text: t('good_afternoon'), emoji:'☀️' };
  return { text: t('good_evening'), emoji:'🌙' };
}

// ─── Data Persistence ───────────────────────────────────
function load() {
  try {
    const d = JSON.parse(localStorage.getItem('vt2'));
    if (d) {
      S.users = d.users || [];
      S.adminPin = d.adminPin || '1234';
      S.adminProfiles = d.adminProfiles || [];
    }
  } catch { S.users = []; S.adminProfiles = []; }
  // Ensure at least one admin profile always exists
  if (S.adminProfiles.length === 0) {
    S.adminProfiles.push({
      id: uid(),
      name: 'Admin',
      email: '',
      pin: S.adminPin
    });
    // Persist the migration immediately
    save();
  }
}

const SYNC_API_URL = 'https://tangy-llamas-enjoy.loca.lt/api/sync/vax360_main';

function save() {
  const dataString = JSON.stringify({
    users: S.users,
    adminPin: S.adminPin,
    adminProfiles: S.adminProfiles
  });
  localStorage.setItem('vt2', dataString);

  // Background Cloud Sync
  if (navigator.onLine) {
    fetch(SYNC_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
      body: dataString
    }).catch(err => console.log('DB Sync failed:', err));
  }
}

async function syncFromCloud() {
  try {
    const res = await fetch(SYNC_API_URL, { headers: { 'bypass-tunnel-reminder': 'true' } });
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && json.data) {
      // Merge cloud data over local
      const d = json.data;
      if (d.users) S.users = d.users;
      if (d.adminPin) S.adminPin = d.adminPin;
      if (d.adminProfiles) S.adminProfiles = d.adminProfiles;
      
      // Update local storage without recursive sync
      localStorage.setItem('vt2', JSON.stringify({
        users: S.users,
        adminPin: S.adminPin,
        adminProfiles: S.adminProfiles
      }));
      
      console.log('Database sync successful');
    }
  } catch (err) {
    console.log('Running offline or DB not reachable');
  }
}

function currentUser() { return S.users.find(u => u.id === S.userId); }

// ─── Theme ──────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('vt2_theme');
  const dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.setAttribute('data-theme','dark');
  $('toggle-theme').checked = dark;
}
function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (dark) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('vt2_theme','light'); }
  else { document.documentElement.setAttribute('data-theme','dark'); localStorage.setItem('vt2_theme','dark'); }
}

// ─── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  load();
  await syncFromCloud();
  const hasLang = loadLanguage();
  applyTranslations();
  initTheme();
  injectSVGDefs();
  bindEvents();

  setTimeout(() => {
    $('splash')?.remove();
    if (hasLang) {
      // Language already chosen, go to login
      $('screen-login').classList.remove('hidden');
    } else {
      // First time: show landing page
      $('screen-landing').classList.remove('hidden');
    }
  }, 2200);

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
});

function injectSVGDefs() {
  // SVG gradient for progress ring
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width','0'); svg.setAttribute('height','0');
  svg.style.position = 'absolute';
  const defs = document.createElementNS(ns, 'defs');
  const grad = document.createElementNS(ns, 'linearGradient');
  grad.id = 'ringGrad';
  grad.setAttribute('x1','0%'); grad.setAttribute('y1','0%');
  grad.setAttribute('x2','100%'); grad.setAttribute('y2','100%');
  const s1 = document.createElementNS(ns,'stop'); s1.setAttribute('offset','0%'); s1.setAttribute('stop-color','#6366f1');
  const s2 = document.createElementNS(ns,'stop'); s2.setAttribute('offset','50%'); s2.setAttribute('stop-color','#a855f7');
  const s3 = document.createElementNS(ns,'stop'); s3.setAttribute('offset','100%'); s3.setAttribute('stop-color','#ec4899');
  grad.append(s1,s2,s3); defs.append(grad); svg.append(defs);
  document.body.prepend(svg);
}

// ─── Events ─────────────────────────────────────────────
function bindEvents() {
  // Landing page
  $('btn-get-started').onclick = () => showScreen('lang');

  // Language selection buttons
  $$('.lang-btn').forEach(btn => {
    btn.onclick = () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
      // Highlight active
      $$('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Go to login after a brief highlight
      setTimeout(() => {
        showScreen('login');
        applyTranslations();
      }, 250);
    };
  });

  // Change language from login screen
  $('btn-change-lang-login').onclick = () => showScreen('lang');

  // Change language from settings
  $('btn-change-lang').onclick = () => {
    // Show language selection inline
    showScreen('lang');
    $('app-shell').classList.add('hidden');
  };

  // Login flow
  $('btn-role-parent').onclick = () => showScreen('parent-select');
  $('btn-role-admin').onclick = () => showScreen('admin-pin');
  $('btn-back-to-login').onclick = () => showScreen('login');
  $('btn-back-to-login2').onclick = () => showScreen('login');
  $('btn-back-to-profiles').onclick = () => showScreen('parent-select');
  $('btn-create-parent').onclick = () => showScreen('create-parent');
  $('btn-admin-login').onclick = handleAdminLogin;
  $('form-create-parent').onsubmit = handleCreateParent;
  $('input-admin-pin').addEventListener('keyup', e => { if (e.key==='Enter') handleAdminLogin(); });

  // Navigation
  $('btn-nav-back').onclick = navBack;
  $('btn-header-profile').onclick = () => showAppView('settings');

  // Bottom nav items
  $$('.nav-item').forEach(item => {
    item.onclick = () => {
      const view = item.dataset.view;
      if (view === 'history') showAppView('history');
      else showAppView(view);
    };
  });
  $('nav-fab').onclick = openAddChildModal;

  // Onboarding Modal
  const closeOnboarding = () => {
    $('modal-onboarding').classList.add('hidden');
    localStorage.setItem('vt2_onboarded', 'true');
  };
  $('btn-close-onboarding').onclick = closeOnboarding;
  $('btn-onboarding-ok').onclick = closeOnboarding;

  // Child form
  $('btn-close-child-modal').onclick = () => $('modal-child').classList.add('hidden');
  $('form-child').onsubmit = handleSaveChild;

  // Vaccine modal
  $('btn-close-vaccine-modal').onclick = () => $('modal-vaccine').classList.add('hidden');
  $('btn-mark-vaccine').onclick = handleMarkVaccine;

  // Vaccine modal tabs
  $$('.mv-tab').forEach(tab => {
    tab.onclick = () => {
      $$('.mv-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      $$('.mv-panel').forEach(p => p.classList.remove('active'));
      $(`mv-panel-${tab.dataset.mvtab}`).classList.add('active');
    };
  });

  // Child detail actions
  $('btn-edit-child').onclick = openEditChildModal;
  $('btn-delete-child').onclick = handleDeleteChild;

  // Filter pills
  $$('.pill').forEach(p => {
    p.onclick = () => {
      $$('.pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      S.filter = p.dataset.filter;
      renderChildVaccines();
    };
  });

  // Settings
  $('toggle-theme').onchange = toggleTheme;
  $('btn-logout').onclick = handleLogout;
  $('btn-change-pin').onclick = () => $('modal-pin').classList.remove('hidden');
  $('btn-close-pin-modal').onclick = () => $('modal-pin').classList.add('hidden');
  $('btn-save-pin').onclick = handleChangePin;
  $('btn-export').onclick = exportData;
  $('btn-import').onclick = () => $('import-file').click();
  $('import-file').onchange = importData;
  $('btn-clear-all').onclick = handleClearAll;
  $('btn-dismiss-tip').onclick = () => $('tip-card').classList.add('hidden');

  // Admin profile management
  $('btn-manage-admins').onclick = openAdminProfilesModal;
  $('btn-close-admin-profiles').onclick = () => $('modal-admin-profiles').classList.add('hidden');
  $('btn-add-admin').onclick = openAddAdminForm;
  $('btn-close-admin-form').onclick = () => $('modal-admin-form').classList.add('hidden');
  $('form-admin').onsubmit = handleSaveAdmin;

  // Admin vaccine CRUD
  $('btn-add-custom-vaccine').onclick = openAddVaccineModal;
  $('btn-close-admin-vaccine').onclick = () => $('modal-admin-vaccine').classList.add('hidden');
  $('form-admin-vaccine').onsubmit = handleSaveVaccine;

  // Password confirm modal
  $('btn-close-pw-confirm').onclick = () => $('modal-password-confirm').classList.add('hidden');
  $('btn-pw-cancel').onclick = () => $('modal-password-confirm').classList.add('hidden');

  // Parent PIN login modal
  $('btn-close-parent-pin').onclick = () => $('modal-parent-pin').classList.add('hidden');

  // Contact edit modal
  $('btn-edit-email').onclick = () => openEditContactModal('email');
  $('btn-edit-whatsapp').onclick = () => openEditContactModal('whatsapp');
  $('btn-close-contact-modal').onclick = () => $('modal-edit-contact').classList.add('hidden');
  $('btn-save-contact').onclick = saveContact;

  // Admin family actions
  $('btn-admin-add-child').onclick = () => {
    if (S.adminViewUserId) {
      S.userId = S.adminViewUserId;
      openAddChildModal();
    }
  };
  $('btn-admin-edit-family').onclick = () => {
    if (S.adminViewUserId) openEditParentModal(S.adminViewUserId);
  };
  $('btn-admin-delete-family').onclick = () => {
    if (S.adminViewUserId) handleDeleteFamily(S.adminViewUserId);
  };

  // Edit parent modal
  $('btn-close-edit-parent').onclick = () => $('modal-edit-parent').classList.add('hidden');
  $('form-edit-parent').onsubmit = handleEditParent;

  // Confirm modal
  $('btn-confirm-no').onclick = () => $('modal-confirm').classList.add('hidden');
  $('btn-confirm-yes').onclick = () => { if (S.confirmCb) S.confirmCb(); $('modal-confirm').classList.add('hidden'); };

  // Close modals on overlay click
  $$('.modal-overlay').forEach(o => {
    o.onclick = e => { if (e.target === o) o.classList.add('hidden'); };
  });

  // Schedule child dropdown
  $('schedule-child-dropdown').onchange = renderScheduleView;
}

// ─── Screen Navigation ──────────────────────────────────
function showScreen(name) {
  ['screen-lang','screen-landing','screen-login','screen-parent-select','screen-admin-pin','screen-create-parent'].forEach(id => {
    $(id).classList.toggle('hidden', id !== `screen-${name}`);
  });
  if (name === 'parent-select') renderParentProfiles();
  // Highlight current language button
  if (name === 'lang') {
    $$('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));
  }
}

function enterApp(role) {
  S.role = role;
  ['screen-lang','screen-landing','screen-login','screen-parent-select','screen-admin-pin','screen-create-parent'].forEach(id => {
    $(id).classList.add('hidden');
  });
  $('app-shell').classList.remove('hidden');

  if (role === 'admin') {
    $('nav-parent').classList.add('hidden');
    $('nav-admin').classList.remove('hidden');
    $('settings-admin-section').classList.remove('hidden');
    // Only super admin (first admin profile) can manage other admins
    const isSuperAdmin = S.adminProfiles.length > 0 && S.currentAdminId === S.adminProfiles[0].id;
    const manageRow = $('btn-manage-admins')?.closest('.setting-row');
    if (manageRow) manageRow.classList.toggle('hidden', !isSuperAdmin);
    // Only super admin sees Clear All Data
    const clearRow = $('btn-clear-all')?.closest('.setting-row');
    if (clearRow) clearRow.classList.toggle('hidden', !isSuperAdmin);
    showAppView('admin-home');
  } else {
    $('nav-parent').classList.remove('hidden');
    $('nav-admin').classList.add('hidden');
    $('settings-admin-section').classList.add('hidden');
    // Parents don't see Clear All Data
    const clearRow = $('btn-clear-all')?.closest('.setting-row');
    if (clearRow) clearRow.classList.add('hidden');
    showAppView('home');
  }
  updateSettingsProfile();

  // Onboarding Check
  if (!localStorage.getItem('vt2_onboarded')) {
    setTimeout(() => {
      $('modal-onboarding').classList.remove('hidden');
    }, 400);
  }
}

// ─── App View Navigation ────────────────────────────────
function showAppView(name) {
  // Hide ALL views — clear both class and any leftover inline styles
  $$('.view').forEach(v => {
    v.classList.remove('active');
    v.style.removeProperty('display');
  });

  // Show the target view
  const targetView = $(`view-${name}`);
  if (targetView) {
    targetView.classList.add('active');
    // Scroll to top on page switch
    const scroll = targetView.querySelector('.view-scroll');
    if (scroll) scroll.scrollTop = 0;
  }

  const back = $('btn-nav-back');
  const isSubView = ['child','admin-family'].includes(name);
  back.classList.toggle('hidden', !isSubView);

  // Update header per page
  const g = greeting();
  const user = currentUser();

  if (name === 'home' && user) {
    $('header-title').textContent = `${g.text}, ${user.name}! ${g.emoji}`;
    $('header-subtitle').textContent = t('lets_check');
    $('btn-header-profile').textContent = user.avatar;
  } else if (name === 'admin-home') {
    $('header-title').textContent = `${t('dashboard')} ${g.emoji}`;
    $('header-subtitle').textContent = t('overview_families');
    $('btn-header-profile').textContent = '🛡️';
  } else if (name === 'child') {
    const child = getChildById(S.currentChildId);
    $('header-title').textContent = child ? child.name : '';
    $('header-subtitle').textContent = t('vaccine_schedule');
  } else if (name === 'schedule') {
    $('header-title').textContent = `📅 ${t('schedule')}`;
    $('header-subtitle').textContent = t('full_timeline');
  } else if (name === 'history') {
    $('header-title').textContent = `📋 ${t('history')}`;
    $('header-subtitle').textContent = t('completed_vaccines');
  } else if (name === 'settings') {
    $('header-title').textContent = `⚙️ ${t('settings')}`;
    $('header-subtitle').textContent = t('customize_exp');
  } else if (name === 'admin-vaccines') {
    $('header-title').textContent = `💉 ${t('vaccines')}`;
    $('header-subtitle').textContent = t('template_children');
  } else if (name === 'admin-family') {
    $('header-title').textContent = t('family_details');
    $('header-subtitle').textContent = '';
  }

  // Update bottom nav active state
  const navBar = S.role === 'admin' ? $('nav-admin') : $('nav-parent');
  navBar.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === name);
  });

  // Render view content
  switch (name) {
    case 'home': renderHome(); break;
    case 'admin-home': renderAdminHome(); break;
    case 'child': renderChildDetail(); break;
    case 'schedule': renderScheduleView(); break;
    case 'history': renderHistory(); break;
    case 'admin-vaccines': renderAdminVaccines(); break;
    case 'settings': updateSettingsProfile(); break;
  }
}

function navBack() {
  if (S.role === 'admin') {
    showAppView('admin-home');
  } else {
    showAppView('home');
  }
}

// ─── Login Handlers ─────────────────────────────────────
function renderParentProfiles() {
  const list = $('parent-profiles-list');
  if (S.users.length === 0) {
    list.innerHTML = `<p style="text-align:center;color:var(--text-3);font-size:0.88rem;padding:16px 0;">${t('no_profiles_yet')}</p>`;
    return;
  }
  list.innerHTML = S.users.map(u => {
    const childCount = u.children ? u.children.length : 0;
    const countLabel = childCount === 1 ? t('child_count', {n: childCount}) : t('children_count', {n: childCount});
    return `
      <div class="profile-item" onclick="selectParent('${u.id}')">
        <span class="profile-item-avatar">${u.avatar}</span>
        <div>
          <div class="profile-item-name">${esc(u.name)}</div>
          <div class="profile-item-children">${countLabel}</div>
        </div>
      </div>
    `;
  }).join('');
}

// selectParent is defined at the bottom of the file with PIN support

function handleAdminLogin() {
  const pin = $('input-admin-pin').value;
  // Check against all admin profiles
  const matched = S.adminProfiles.find(a => a.pin === pin);
  if (matched) {
    S.currentAdminId = matched.id;
    enterApp('admin');
    $('input-admin-pin').value = '';
  } else {
    toast(t('incorrect_pin'));
    $('input-admin-pin').value = '';
    $('input-admin-pin').focus();
  }
}

function handleCreateParent(e) {
  e.preventDefault();
  const name = $('input-parent-name').value.trim();
  const email = $('input-parent-email')?.value.trim() || '';
  const whatsapp = $('input-parent-whatsapp')?.value.trim() || '';
  const pin = $('input-parent-pin')?.value.trim() || '';
  const avatar = document.querySelector('input[name="avatar"]:checked')?.value || '👩';
  if (!name) { toast(t('please_enter_name')); return; }
  
  // Validate email format if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast('⚠️ Invalid email format');
    return;
  }

  const user = { id: uid(), name, avatar, email, whatsapp, pin: pin || null, children: [] };
  S.users.push(user);
  save();
  S.userId = user.id;
  $('form-create-parent').reset();
  enterApp('parent');
  toast(t('welcome_user', {name}));
}

function handleLogout() {
  S.role = null;
  S.userId = null;
  S.currentChildId = null;
  $('app-shell').classList.add('hidden');
  showScreen('login');
}

// ─── Parent Home ────────────────────────────────────────
function renderHome() {
  const user = currentUser();
  if (!user) return;

  // Tip
  const tips = TIPS[currentLang] || TIPS.en;
  const tip = tips[Math.floor(Math.random() * tips.length)];
  $('tip-title').textContent = tip.title;
  $('tip-text').textContent = tip.text;
  $('tip-card').classList.remove('hidden');

  const children = user.children || [];
  let totalDone = 0, totalPending = 0;
  const alerts = [], upcoming = [];

  children.forEach(child => {
    (child.vaccines || []).forEach(v => {
      if (v.completedDate) { totalDone++; return; }
      const st = vaccineStatus(v, child.birthDate);
      if (st === 'overdue') { totalPending++; alerts.push({ child, vaccine:v }); }
      else if (st === 'upcoming') { totalPending++; upcoming.push({ child, vaccine:v }); }
      else totalPending++;
    });
  });

  $('qs-children').textContent = children.length;
  $('qs-done').textContent = totalDone;
  $('qs-pending').textContent = totalPending;

  // Alerts
  const alertsSec = $('home-alerts');
  if (alerts.length) {
    alertsSec.classList.remove('hidden');
    $('home-alerts-list').innerHTML = alerts.slice(0,5).map(a => `
      <div class="alert-card" onclick="goChildVaccine('${a.child.id}','${a.vaccine.id}')">
        <span class="alert-emoji">🚨</span>
        <div class="alert-text">
          <strong>${esc(a.child.name)}</strong> — ${getVaccineI18n(a.vaccine.id).name} ${t('is_overdue')}
          <br><small>${t('scheduled')} ${fmtDate(a.vaccine.scheduledDate)}</small>
        </div>
      </div>
    `).join('');
  } else alertsSec.classList.add('hidden');

  // Children
  const isEmpty = children.length === 0;
  $('home-empty').classList.toggle('hidden', !isEmpty);
  $('home-children').classList.toggle('hidden', isEmpty);
  $('btn-add-first').onclick = openAddChildModal;

  if (!isEmpty) {
    // Per-child vaccine breakdown cards
    $('home-children').innerHTML = children.map((child, i) => {
      const vaxes = child.vaccines || [];
      const done = vaxes.filter(v => v.completedDate).length;
      const total = vaxes.length;
      const pct = total ? Math.round(done/total*100) : 0;
      const overdueCount = vaxes.filter(v => !v.completedDate && vaccineStatus(v, child.birthDate) === 'overdue').length;
      const pendingCount = vaxes.filter(v => !v.completedDate && vaccineStatus(v, child.birthDate) === 'pending').length;
      const upcomingCount = vaxes.filter(v => !v.completedDate && vaccineStatus(v, child.birthDate) === 'upcoming').length;
      const avatar = child.gender === 'female' ? '👧' : '👦';
      
      // Find next upcoming vaccine
      const nextVax = vaxes
        .filter(v => !v.completedDate)
        .sort((a,b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))[0];
      const nextInfo = nextVax ? `${t('next_vaccine')}: ${getVaccineI18n(nextVax.id).name} (${fmtDate(nextVax.scheduledDate)})` : t('no_pending');

      return `
        <div class="child-card child-card-detailed" onclick="goChild('${child.id}')" style="animation-delay:${i*0.08}s">
          <div class="cc-top-row">
            <div class="cc-avatar">${avatar}</div>
            <div class="cc-info">
              <div class="cc-name">${esc(child.name)}</div>
              <div class="cc-age">${ageStr(child.birthDate)}</div>
            </div>
            <span class="cc-pct-badge">${pct}%</span>
          </div>
          <div class="cc-progress">
            <div class="cc-bar"><div class="cc-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="cc-stats-row">
            <span class="cc-stat cc-stat-done">✅ ${done}</span>
            ${overdueCount > 0 ? `<span class="cc-stat cc-stat-overdue">🔴 ${overdueCount}</span>` : ''}
            ${upcomingCount > 0 ? `<span class="cc-stat cc-stat-upcoming">🟡 ${upcomingCount}</span>` : ''}
            <span class="cc-stat cc-stat-pending">⏳ ${pendingCount}</span>
          </div>
          <div class="cc-next-vax">${nextInfo}</div>
        </div>
      `;
    }).join('');
  }

  // Upcoming — show ALL children's upcoming/overdue vaccines
  const upItems = [...alerts,...upcoming].sort((a,b) => new Date(a.vaccine.scheduledDate)-new Date(b.vaccine.scheduledDate)).slice(0,6);
  const upSec = $('home-upcoming-section');
  if (upItems.length) {
    upSec.classList.remove('hidden');
    $('home-upcoming').innerHTML = upItems.map(item => {
      const st = item.vaccine.completedDate ? 'completed' : vaccineStatus(item.vaccine, item.child.birthDate);
      return `
        <div class="upcoming-card" onclick="goChildVaccine('${item.child.id}','${item.vaccine.id}')">
          <span class="uc-dot dot-${st}"></span>
          <div class="uc-info">
            <div class="uc-name">${getVaccineI18n(item.vaccine.id).name}</div>
            <div class="uc-child">${esc(item.child.name)}</div>
            <div class="uc-date">${fmtDate(item.vaccine.scheduledDate)}</div>
          </div>
          <span class="uc-badge badge-${st}">${t(st === 'completed' ? 'done' : st === 'overdue' ? 'overdue' : st === 'upcoming' ? 'upcoming_label' : 'pending')}</span>
        </div>
      `;
    }).join('');
  } else upSec.classList.add('hidden');
}

// ─── Global onclick handlers ────────────────────────────
window.goChild = function(id) {
  S.currentChildId = id;
  S.filter = 'all';
  $$('.pill').forEach(p => p.classList.toggle('active', p.dataset.filter==='all'));
  showAppView('child');
};

window.goChildVaccine = function(childId, vaccineId) {
  S.currentChildId = childId;
  S.filter = 'all';
  showAppView('child');
  setTimeout(() => openVaccineModal(vaccineId), 400);
};

window.goAdminFamily = function(userId) {
  S.adminViewUserId = userId;
  showAppView('admin-family');
  renderAdminFamilyDetail(userId);
};

window.openVaccineModal = openVaccineModal;

// ─── Child Detail ───────────────────────────────────────
function getChildById(id) {
  for (const u of S.users) {
    const c = (u.children||[]).find(ch => ch.id === id);
    if (c) return c;
  }
  return null;
}

function renderChildDetail() {
  const child = getChildById(S.currentChildId);
  if (!child) return navBack();

  const avatar = child.gender === 'female' ? '👧' : '👦';
  const done = (child.vaccines||[]).filter(v=>v.completedDate).length;
  const total = (child.vaccines||[]).length;
  const pct = total ? Math.round(done/total*100) : 0;
  const circumference = 2 * Math.PI * 42;

  $('child-hero-avatar').textContent = avatar;
  $('child-hero-name').textContent = child.name;
  $('child-hero-age').textContent = `${ageStr(child.birthDate)} · ${fmtDate(child.birthDate)}`;
  $('progress-ring-fill').style.strokeDashoffset = circumference - (pct/100) * circumference;
  $('progress-ring-text').textContent = `${pct}%`;

  // Hide edit/delete for admin viewing other families
  const isOwnChild = S.role === 'parent' && currentUser()?.children?.some(c => c.id === child.id);
  const isAdmin = S.role === 'admin';
  $('btn-edit-child').classList.toggle('hidden', !isOwnChild && !isAdmin);
  $('btn-delete-child').classList.toggle('hidden', !isOwnChild && !isAdmin);

  renderChildVaccines();
}

function renderChildVaccines() {
  const child = getChildById(S.currentChildId);
  if (!child) return;

  let vaccines = (child.vaccines||[]).map(v => ({
    ...v, status: v.completedDate ? 'completed' : vaccineStatus(v, child.birthDate)
  }));

  if (S.filter !== 'all') vaccines = vaccines.filter(v => v.status === S.filter);

  const grouped = {};
  vaccines.forEach(v => {
    const sched = VACCINE_SCHEDULE.find(s => s.id === v.id);
    const g = sched ? sched.group : 'other';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(v);
  });

  const container = $('child-vaccines-list');
  if (!vaccines.length) {
    container.innerHTML = `<div class="empty-state"><p style="color:var(--text-3)">${t('no_match_filter')}</p></div>`;
    return;
  }

  let html = '';
  const GL = getGroupLabels();
  Object.keys(GL).forEach(gk => {
    if (!grouped[gk]) return;
    html += `<div class="vt-group-label">${GL[gk]}</div>`;
    grouped[gk].forEach(v => {
      const dateText = v.completedDate ? `✅ ${fmtDate(v.completedDate)}` : `📅 ${fmtDate(v.scheduledDate)}`;
      html += `
        <div class="vt-card ${v.status==='completed'?'vt-completed':''}" onclick="openVaccineModal('${v.id}')">
          <span class="uc-dot dot-${v.status}"></span>
          <div class="uc-info">
            <div class="uc-name">${getVaccineI18n(v.id).name}</div>
            <div class="uc-date">${dateText}</div>
          </div>
          <span class="uc-badge badge-${v.status}">${t(v.status === 'completed' ? 'done' : v.status === 'overdue' ? 'overdue' : v.status === 'upcoming' ? 'upcoming_label' : 'pending')}</span>
        </div>
      `;
    });
  });
  container.innerHTML = html;
}

// ─── Schedule View ──────────────────────────────────────
function renderScheduleView() {
  const user = currentUser();
  if (!user || !user.children?.length) {
    $('schedule-child-select').classList.add('hidden');
    $('schedule-empty').classList.remove('hidden');
    $('schedule-timeline').innerHTML = '';
    return;
  }

  $('schedule-empty').classList.add('hidden');
  const select = $('schedule-child-dropdown');

  if (user.children.length > 1) {
    $('schedule-child-select').classList.remove('hidden');
    const currentVal = select.value;
    select.innerHTML = user.children.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    if (currentVal && user.children.some(c => c.id === currentVal)) select.value = currentVal;
  } else {
    $('schedule-child-select').classList.add('hidden');
  }

  const childId = select.value || user.children[0].id;
  const child = user.children.find(c => c.id === childId);
  if (!child) return;

  const vaccines = (child.vaccines||[]).map(v => ({
    ...v, status: v.completedDate ? 'completed' : vaccineStatus(v, child.birthDate)
  }));

  const grouped = {};
  vaccines.forEach(v => {
    const sched = VACCINE_SCHEDULE.find(s => s.id === v.id);
    const g = sched ? sched.group : 'other';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(v);
  });

  let html = '';
  const GL = getGroupLabels();
  Object.keys(GL).forEach(gk => {
    if (!grouped[gk]) return;
    html += `<div class="vt-group-label">${GL[gk]}</div>`;
    grouped[gk].forEach(v => {
      const dateText = v.completedDate ? `✅ ${fmtDate(v.completedDate)}` : `📅 ${fmtDate(v.scheduledDate)}`;
      html += `
        <div class="vt-card ${v.status==='completed'?'vt-completed':''}" onclick="goScheduleVaccine('${child.id}','${v.id}')">
          <span class="uc-dot dot-${v.status}"></span>
          <div class="uc-info">
            <div class="uc-name">${getVaccineI18n(v.id).name}</div>
            <div class="uc-date">${dateText}</div>
          </div>
          <span class="uc-badge badge-${v.status}">${t(v.status === 'completed' ? 'done' : v.status === 'overdue' ? 'overdue' : v.status === 'upcoming' ? 'upcoming_label' : 'pending')}</span>
        </div>
      `;
    });
  });
  $('schedule-timeline').innerHTML = html;
}

window.goScheduleVaccine = function(childId, vaccineId) {
  S.currentChildId = childId;
  openVaccineModal(vaccineId);
};

// ─── History View ───────────────────────────────────────
function renderHistory() {
  const user = currentUser();
  if (!user) return;

  const children = user.children || [];
  
  // Render filter controls
  let filterHtml = '<div class="history-filters">';
  // Child filter
  filterHtml += `<div class="hf-row"><label>${t('filter_by_child')}</label><select id="history-child-filter" class="select-pill" onchange="applyHistoryFilters()">`;
  filterHtml += `<option value="all">${t('all_children')}</option>`;
  children.forEach(c => { filterHtml += `<option value="${c.id}">${esc(c.name)}</option>`; });
  filterHtml += `</select></div>`;
  // Vaccine type filter
  const uniqueTypes = new Set();
  children.forEach(c => (c.vaccines||[]).forEach(v => { if(v.completedDate) { const bt = getVaccineBaseType(v.id); uniqueTypes.add(bt); }}));
  filterHtml += `<div class="hf-row"><label>${t('filter_by_type')}</label><select id="history-type-filter" class="select-pill" onchange="applyHistoryFilters()">`;
  filterHtml += `<option value="all">${t('all_types')}</option>`;
  [...uniqueTypes].sort().forEach(bt => { filterHtml += `<option value="${bt}">${bt.toUpperCase()}</option>`; });
  filterHtml += `</select></div>`;
  // Date range
  filterHtml += `<div class="hf-row hf-dates"><label>${t('filter_by_date')}</label><div class="hf-date-inputs"><input type="date" id="history-date-from" class="select-pill" onchange="applyHistoryFilters()" placeholder="${t('date_from')}"><input type="date" id="history-date-to" class="select-pill" onchange="applyHistoryFilters()" placeholder="${t('date_to')}"></div></div>`;
  filterHtml += '</div>';
  
  $('history-filters-container').innerHTML = filterHtml;
  
  applyHistoryFilters();
}

window.applyHistoryFilters = function() {
  const user = currentUser();
  if (!user) return;

  const childFilter = $('history-child-filter')?.value || 'all';
  const typeFilter = $('history-type-filter')?.value || 'all';
  const dateFrom = $('history-date-from')?.value || '';
  const dateTo = $('history-date-to')?.value || '';

  const completed = [];
  (user.children||[]).forEach(child => {
    if (childFilter !== 'all' && child.id !== childFilter) return;
    (child.vaccines||[]).forEach(v => {
      if (!v.completedDate) return;
      if (typeFilter !== 'all' && getVaccineBaseType(v.id) !== typeFilter) return;
      if (dateFrom && v.completedDate < dateFrom) return;
      if (dateTo && v.completedDate > dateTo) return;
      completed.push({ child, vaccine: v });
    });
  });

  completed.sort((a,b) => new Date(b.vaccine.completedDate) - new Date(a.vaccine.completedDate));

  if (!completed.length) {
    $('history-empty').classList.remove('hidden');
    $('history-list').innerHTML = '';
    return;
  }

  $('history-empty').classList.add('hidden');
  $('history-list').innerHTML = completed.map(item => `
    <div class="upcoming-card" onclick="goChildVaccine('${item.child.id}','${item.vaccine.id}')">
      <span class="uc-dot dot-completed"></span>
      <div class="uc-info">
        <div class="uc-name">${getVaccineI18n(item.vaccine.id).name}</div>
        <div class="uc-child">${esc(item.child.name)}</div>
        <div class="uc-date">${t('completed_label')} ${fmtDate(item.vaccine.completedDate)}</div>
      </div>
      <span class="uc-badge badge-completed">${t('done')}</span>
    </div>
  `).join('');
};

// ─── Admin Home ─────────────────────────────────────────
function renderAdminHome() {
  let totalFamilies = S.users.length;
  let totalChildren = 0, totalVaccinesGiven = 0, totalVaccines = 0;
  const vaccineData = {};

  S.users.forEach(u => {
    (u.children||[]).forEach(child => {
      totalChildren++;
      (child.vaccines||[]).forEach(v => {
        totalVaccines++;
        if (v.completedDate) totalVaccinesGiven++;
        const sched = VACCINE_SCHEDULE.find(s => s.id === v.id);
        const label = sched ? sched.group : 'other';
        if (!vaccineData[label]) vaccineData[label] = { done:0, total:0 };
        vaccineData[label].total++;
        if (v.completedDate) vaccineData[label].done++;
      });
    });
  });

  const rate = totalVaccines ? Math.round(totalVaccinesGiven/totalVaccines*100) : 0;

  $('as-families').textContent = totalFamilies;
  $('as-children').textContent = totalChildren;
  $('as-vaccines').textContent = totalVaccinesGiven;
  $('as-rate').textContent = `${rate}%`;

  // Chart
  const chartContainer = $('admin-chart');
  const GL = getGroupLabels();
  const groups = Object.keys(GL).filter(k => vaccineData[k]);
  if (groups.length) {
    chartContainer.innerHTML = groups.map(g => {
      const d = vaccineData[g];
      const pct = d.total ? Math.round(d.done/d.total*100) : 0;
      const maxH = 120;
      return `
        <div class="chart-bar-wrap">
          <div class="chart-value">${pct}%</div>
          <div class="chart-bar" style="height:${Math.max(4, pct/100*maxH)}px"></div>
          <div class="chart-label">${g}</div>
        </div>
      `;
    }).join('');
  } else {
    chartContainer.innerHTML = `<p style="text-align:center;color:var(--text-3);padding:40px;font-size:0.85rem;">${t('no_data_yet')}</p>`;
  }

  // Families list
  if (totalFamilies) {
    $('admin-no-families').classList.add('hidden');
    $('admin-families').innerHTML = S.users.map(u => {
      const cc = (u.children||[]).length;
      return `
        <div class="admin-family-card" onclick="goAdminFamily('${u.id}')">
          <span class="afc-avatar">${u.avatar}</span>
          <div class="afc-info">
            <div class="afc-name">${esc(u.name)}</div>
            <div class="afc-sub">${cc === 1 ? t('child_count', {n: cc}) : t('children_count', {n: cc})}</div>
          </div>
          <span class="afc-arrow">→</span>
        </div>
      `;
    }).join('');
  } else {
    $('admin-no-families').classList.remove('hidden');
    $('admin-families').innerHTML = '';
  }
}

function renderAdminFamilyDetail(userId) {
  const user = S.users.find(u => u.id === userId);
  if (!user) return;

  $('header-title').textContent = user.name;

  const cc = (user.children||[]).length;
  const countLabel = cc === 1 ? t('child_count', {n: cc}) : t('children_count', {n: cc});
  $('admin-family-header').innerHTML = `
    <div class="ph-avatar">${user.avatar}</div>
    <h2>${esc(user.name)}</h2>
    <p>${countLabel} ${t('registered')}</p>
  `;

  const list = $('admin-family-children');
  if (!(user.children||[]).length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-emoji">👶</div><h3>${t('no_children_admin')}</h3><p>${t('no_children_admin_desc')}</p></div>`;
    return;
  }

  list.innerHTML = user.children.map(child => {
    const done = (child.vaccines||[]).filter(v=>v.completedDate).length;
    const total = (child.vaccines||[]).length;
    const pct = total ? Math.round(done/total*100) : 0;
    const avatar = child.gender === 'female' ? '👧' : '👦';
    return `
      <div class="child-card" onclick="goChild('${child.id}')">
        <div class="cc-avatar">${avatar}</div>
        <div class="cc-info">
          <div class="cc-name">${esc(child.name)}</div>
          <div class="cc-age">${ageStr(child.birthDate)}</div>
          <div class="cc-progress">
            <div class="cc-bar"><div class="cc-bar-fill" style="width:${pct}%"></div></div>
            <span class="cc-pct">${pct}%</span>
          </div>
        </div>
        <span class="cc-arrow">→</span>
      </div>
    `;
  }).join('');
}

// ─── Admin Vaccines ─────────────────────────────────────
function renderAdminVaccines() {
  let html = '';
  let lastGroup = '';
  const GL = getGroupLabels();
  const allVaccines = getAllVaccines();
  allVaccines.forEach(v => {
    if (v.group !== lastGroup) {
      html += `<div class="vt-group-label">${GL[v.group] || v.group}</div>`;
      lastGroup = v.group;
    }
    const vi = getVaccineI18n(v.id);
    const isCustom = v.custom;
    html += `
      <div class="admin-vaccine-item">
        <span class="avi-dot" ${isCustom ? 'style="background:var(--secondary)"' : ''}></span>
        <div class="avi-info">
          <div class="avi-name">${vi.name || v.name} ${isCustom ? `<span style="font-size:0.65rem;color:var(--secondary);font-weight:800">[${t('custom_vaccine')}]</span>` : ''}</div>
          <div class="avi-age">${vi.ageLabel || v.ageLabel} · ${vi.desc || v.desc}</div>
        </div>
        ${isCustom ? `
          <button class="btn btn-glass btn-sm" type="button" onclick="editCustomVaccine('${v.id}')">✏️</button>
          <button class="btn btn-glass btn-sm btn-glass-danger" type="button" onclick="deleteCustomVaccine('${v.id}')">🗑️</button>
        ` : ''}
      </div>
    `;
  });
  $('admin-vaccine-list').innerHTML = html;
}

// ─── Vaccine Modal ──────────────────────────────────────
function openVaccineModal(vaccineId) {
  const child = getChildById(S.currentChildId);
  if (!child) return;
  const vaccine = (child.vaccines||[]).find(v => v.id === vaccineId);
  if (!vaccine) return;
  S.currentVaccineId = vaccineId;

  const sched = VACCINE_SCHEDULE.find(s => s.id === vaccineId);
  const st = vaccine.completedDate ? 'completed' : vaccineStatus(vaccine, child.birthDate);

  const vi18n = getVaccineI18n(vaccineId);
  $('mv-title').textContent = vi18n.name;
  $('mv-desc').textContent = vi18n.desc;
  $('mv-age').textContent = vi18n.ageLabel;
  $('mv-sched').textContent = fmtDate(vaccine.scheduledDate);
  const statusLabel = t(`status_${st}`);
  $('mv-status').innerHTML = `<span class="uc-badge badge-${st}">${statusLabel}</span>`;

  if (vaccine.completedDate) {
    $('mv-completed-row').classList.remove('hidden');
    $('mv-completed-date').textContent = fmtDate(vaccine.completedDate);
    $('btn-mv-text').textContent = t('mark_pending');
    $('v-date-group').classList.add('hidden');
  } else {
    $('mv-completed-row').classList.add('hidden');
    $('btn-mv-text').textContent = `✅ ${t('mark_completed')}`;
    $('v-date-group').classList.remove('hidden');
    $('input-v-date').value = new Date().toISOString().split('T')[0];
  }

  $('input-v-notes').value = vaccine.notes || '';

  // Reset tabs to Info
  $$('.mv-tab').forEach(t => t.classList.remove('active'));
  $$('.mv-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('.mv-tab[data-mvtab="info"]').classList.add('active');
  $('mv-panel-info').classList.add('active');

  // Populate Pros & Cons
  const detail = getVaccineDetail(vaccineId);
  const prosEl = $('mv-pros');
  const consEl = $('mv-cons');
  prosEl.innerHTML = (detail.pros || []).map(p => `<li>${esc(p)}</li>`).join('');
  consEl.innerHTML = (detail.cons || []).map(c => `<li>${esc(c)}</li>`).join('');

  $('modal-vaccine').classList.remove('hidden');
}

function handleMarkVaccine() {
  const child = getChildById(S.currentChildId);
  if (!child) return;
  const vaccine = (child.vaccines||[]).find(v => v.id === S.currentVaccineId);
  if (!vaccine) return;

  vaccine.notes = $('input-v-notes').value.trim();

  if (vaccine.completedDate) {
    vaccine.completedDate = null;
    toast(t('marked_pending'));
  } else {
    // Check dependencies
    const deps = VACCINE_DEPENDENCIES[vaccine.id];
    if (deps && deps.length > 0) {
      const missing = deps.filter(depId => {
        const depVax = (child.vaccines||[]).find(v => v.id === depId);
        return !depVax || !depVax.completedDate;
      });
      if (missing.length > 0) {
        const names = missing.map(id => getVaccineI18n(id).name).join(', ');
        toast(`⚠️ ${t('dependency_msg', {names})}`);
        return;
      }
    }
    vaccine.completedDate = $('input-v-date').value || new Date().toISOString().split('T')[0];
    toast(t('vaccine_completed'));
    fireConfetti();
  }

  save();
  $('modal-vaccine').classList.add('hidden');
  renderChildDetail();
}

// ─── Child Modal ────────────────────────────────────────
function openAddChildModal() {
  $('modal-child-title').textContent = t('add_child_title');
  $('form-child').reset();
  $('input-child-id').value = '';
  $('input-child-dob').max = new Date().toISOString().split('T')[0];
  $('modal-child').classList.remove('hidden');
}

function openEditChildModal() {
  const child = getChildById(S.currentChildId);
  if (!child) return;
  $('modal-child-title').textContent = t('edit_child_title');
  $('input-child-name').value = child.name;
  $('input-child-dob').value = child.birthDate;
  $('input-child-dob').max = new Date().toISOString().split('T')[0];
  $('input-child-id').value = child.id;
  const r = document.querySelector(`input[name="child-gender"][value="${child.gender}"]`);
  if (r) r.checked = true;
  $('modal-child').classList.remove('hidden');
}

function handleSaveChild(e) {
  e.preventDefault();
  const name = $('input-child-name').value.trim();
  const dob = $('input-child-dob').value;
  const gender = document.querySelector('input[name="child-gender"]:checked')?.value;
  if (!name||!dob||!gender) { toast(t('fill_all_fields')); return; }

  const editId = $('input-child-id').value;

  // Find which user owns this child
  let owner;
  if (editId) {
    owner = S.users.find(u => (u.children||[]).some(c => c.id === editId));
  } else {
    owner = currentUser();
  }
  if (!owner) { toast(t('error_no_user')); return; }

  if (editId) {
    const child = owner.children.find(c => c.id === editId);
    if (child) {
      const oldDob = child.birthDate;
      child.name = name; child.birthDate = dob; child.gender = gender;
      if (oldDob !== dob) {
        child.vaccines.forEach(v => {
          const s = VACCINE_SCHEDULE.find(x => x.id === v.id);
          if (s) v.scheduledDate = schedDate(dob, s.ageMonths);
        });
      }
      toast(t('child_updated', {name}));
    }
  } else {
    const vaccines = VACCINE_SCHEDULE.map(s => ({
      id: s.id, name: s.name,
      scheduledDate: schedDate(dob, s.ageMonths),
      completedDate: null, notes: ''
    }));
    owner.children.push({ id: uid(), name, birthDate: dob, gender, vaccines });
    toast(t('child_added', {name}));
    fireConfetti();
  }

  save();
  $('modal-child').classList.add('hidden');

  if (editId) renderChildDetail();
  else if (S.role === 'parent') renderHome();
  else renderAdminHome();
}

function handleDeleteChild() {
  const child = getChildById(S.currentChildId);
  if (!child) return;
  confirm2(t('delete_child_title'), t('delete_child_msg', {name: child.name}), () => {
    for (const u of S.users) {
      const idx = (u.children||[]).findIndex(c => c.id === S.currentChildId);
      if (idx >= 0) { u.children.splice(idx, 1); break; }
    }
    save();
    toast(t('child_deleted', {name: child.name}));
    navBack();
  });
}

// ─── Settings Handlers ──────────────────────────────────
function updateSettingsProfile() {
  if (S.role === 'parent') {
    const u = currentUser();
    $('settings-avatar').textContent = u?.avatar || '👩';
    $('settings-name').textContent = u?.name || 'User';
    $('settings-role').textContent = t('parent_label');
    $('settings-parent-edit').classList.remove('hidden');
    // Show contact info
    $('settings-email-display').textContent = u?.email || '—';
    $('settings-whatsapp-display').textContent = u?.whatsapp || '—';
    // Settings contact summary
    const contactEl = $('settings-contact');
    let contactHtml = '';
    if (u?.email) contactHtml += `<span>📧 ${esc(u.email)}</span>`;
    if (u?.whatsapp) contactHtml += `<span>📱 ${esc(u.whatsapp)}</span>`;
    contactEl.innerHTML = contactHtml;
  } else {
    const adminProfile = S.adminProfiles.find(a => a.id === S.currentAdminId);
    $('settings-avatar').textContent = '🛡️';
    $('settings-name').textContent = adminProfile ? adminProfile.name : t('administrator');
    $('settings-role').textContent = t('admin_label');
    $('settings-parent-edit').classList.add('hidden');
  }
}

function handleChangePin() {
  const pin = $('input-new-pin').value;
  if (!pin || pin.length < 4) { toast(t('pin_too_short')); return; }
  // Update current admin's PIN
  const adminProfile = S.adminProfiles.find(a => a.id === S.currentAdminId);
  if (adminProfile) adminProfile.pin = pin;
  S.adminPin = pin;
  save();
  toast(t('pin_updated'));
  $('modal-pin').classList.add('hidden');
  $('input-new-pin').value = '';
}

function exportData() {
  const data = { version:3, exported: new Date().toISOString(), users: S.users, adminPin: S.adminPin, adminProfiles: S.adminProfiles };
  const blob = new Blob([JSON.stringify(data,null,2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `vax360-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click(); URL.revokeObjectURL(url);
  toast(t('data_exported'));
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.users) {
        confirm2(t('import_data'), t('import_data_confirm', {n: data.users.length}), () => {
          S.users = data.users;
          if (data.adminPin) S.adminPin = data.adminPin;
          if (data.adminProfiles) S.adminProfiles = data.adminProfiles;
          save();
          toast(t('data_imported'));
          handleLogout();
        });
      } else toast(t('invalid_file'));
    } catch { toast(t('error_reading')); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function handleClearAll() {
  // Only super admin can clear all data
  const isSuperAdmin = S.adminProfiles.length > 0 && S.currentAdminId === S.adminProfiles[0].id;
  if (!isSuperAdmin) {
    toast(t('only_super_admin'));
    return;
  }
  
  // Show password confirm modal
  $('pw-confirm-title').textContent = `⚠️ ${t('clear_all_title')}`;
  $('pw-confirm-msg').textContent = t('clear_all_msg');
  $('input-pw-confirm').value = '';
  $('pw-confirm-error').classList.add('hidden');
  $('modal-password-confirm').classList.remove('hidden');
  
  $('btn-pw-confirm').onclick = () => {
    const pin = $('input-pw-confirm').value;
    const adminProfile = S.adminProfiles.find(a => a.id === S.currentAdminId);
    if (!adminProfile || pin !== adminProfile.pin) {
      $('pw-confirm-error').textContent = t('wrong_password');
      $('pw-confirm-error').classList.remove('hidden');
      return;
    }
    $('modal-password-confirm').classList.add('hidden');
    S.users = [];
    S.adminPin = '1234';
    S.adminProfiles = [{ id: uid(), name: 'Admin', email: '', pin: '1234' }];
    save();
    toast(t('all_data_cleared'));
    handleLogout();
  };
}

// ─── Contact Edit Modal ─────────────────────────────────
let editContactField = null;

function openEditContactModal(field) {
  editContactField = field;
  const u = currentUser();
  if (!u) return;
  $('edit-contact-title').textContent = `${t('edit')} ${field === 'email' ? t('email') : 'WhatsApp'}`;
  $('edit-contact-label').textContent = field === 'email' ? t('email') : 'WhatsApp';
  $('input-edit-contact').value = field === 'email' ? (u.email || '') : (u.whatsapp || '');
  $('input-edit-contact').type = field === 'email' ? 'email' : 'tel';
  $('modal-edit-contact').classList.remove('hidden');
}

function saveContact() {
  const u = currentUser();
  if (!u) return;
  const val = $('input-edit-contact').value.trim();
  if (editContactField === 'email') u.email = val;
  else u.whatsapp = val;
  save();
  toast(t('contact_updated', {field: editContactField === 'email' ? t('email') : 'WhatsApp'}));
  $('modal-edit-contact').classList.add('hidden');
  updateSettingsProfile();
}

// ─── Admin Edit/Delete Family ───────────────────────────
function openEditParentModal(userId) {
  const user = S.users.find(u => u.id === userId);
  if (!user) return;
  $('input-ep-name').value = user.name;
  $('input-ep-email').value = user.email || '';
  $('input-ep-whatsapp').value = user.whatsapp || '';
  $('input-ep-id').value = user.id;
  $('modal-edit-parent').classList.remove('hidden');
}

function handleEditParent(e) {
  e.preventDefault();
  const id = $('input-ep-id').value;
  const user = S.users.find(u => u.id === id);
  if (!user) return;
  user.name = $('input-ep-name').value.trim();
  user.email = $('input-ep-email').value.trim();
  user.whatsapp = $('input-ep-whatsapp').value.trim();
  save();
  toast(t('profile_updated', {name: user.name}));
  $('modal-edit-parent').classList.add('hidden');
  renderAdminFamilyDetail(id);
}

function handleDeleteFamily(userId) {
  const user = S.users.find(u => u.id === userId);
  if (!user) return;
  confirm2(t('delete_family_title'), t('delete_family_msg', {name: user.name}), () => {
    S.users = S.users.filter(u => u.id !== userId);
    save();
    toast(t('child_deleted', {name: user.name}));
    showAppView('admin-home');
  });
}

// ─── Admin Profile Management ───────────────────────────
function openAdminProfilesModal() {
  renderAdminProfilesList();
  $('modal-admin-profiles').classList.remove('hidden');
}

function renderAdminProfilesList() {
  const list = $('admin-profiles-list');
  if (!S.adminProfiles.length) {
    list.innerHTML = `<div class="admin-profiles-empty">${t('no_admins_msg')}</div>`;
    return;
  }
  list.innerHTML = S.adminProfiles.map((admin, i) => {
    const isDefault = i === 0;
    const badgeHtml = isDefault ? `<span class="ap-badge ap-default">${t('default_admin')}</span>` : '';
    return `
      <div class="admin-profile-card" style="animation-delay:${i * 0.06}s">
        <div class="ap-avatar">🛡️</div>
        <div class="ap-info">
          <div class="ap-name">${esc(admin.name)} ${badgeHtml}</div>
          <div class="ap-email">${admin.email ? esc(admin.email) : '—'}</div>
        </div>
        <div class="admin-profile-actions">
          <button class="btn btn-glass btn-sm" onclick="editAdminProfile('${admin.id}')" type="button">✏️</button>
          <button class="btn btn-glass btn-sm btn-glass-danger" onclick="deleteAdminProfile('${admin.id}')" type="button">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function openAddAdminForm() {
  $('admin-form-title').textContent = t('add_admin');
  $('input-admin-name').value = '';
  $('input-admin-email-f').value = '';
  $('input-admin-pin-f').value = '';
  $('input-admin-edit-id').value = '';
  $('modal-admin-form').classList.remove('hidden');
}

window.editAdminProfile = function(id) {
  const admin = S.adminProfiles.find(a => a.id === id);
  if (!admin) return;
  $('admin-form-title').textContent = t('edit_admin');
  $('input-admin-name').value = admin.name;
  $('input-admin-email-f').value = admin.email || '';
  $('input-admin-pin-f').value = admin.pin;
  $('input-admin-edit-id').value = admin.id;
  $('modal-admin-form').classList.remove('hidden');
};

window.deleteAdminProfile = function(id) {
  if (S.adminProfiles.length <= 1) {
    toast(t('cannot_delete_last'));
    return;
  }
  const admin = S.adminProfiles.find(a => a.id === id);
  if (!admin) return;
  confirm2(t('delete_admin_title'), t('delete_admin_msg', {name: admin.name}), () => {
    S.adminProfiles = S.adminProfiles.filter(a => a.id !== id);
    save();
    toast(t('admin_deleted'));
    renderAdminProfilesList();
  });
};

function handleSaveAdmin(e) {
  e.preventDefault();
  const name = $('input-admin-name').value.trim();
  const email = $('input-admin-email-f').value.trim();
  const pin = $('input-admin-pin-f').value.trim();
  if (!name || !pin || pin.length < 4) {
    toast(t('pin_too_short'));
    return;
  }

  const editId = $('input-admin-edit-id').value;
  if (editId) {
    // Edit existing
    const admin = S.adminProfiles.find(a => a.id === editId);
    if (admin) {
      admin.name = name;
      admin.email = email;
      admin.pin = pin;
    }
    toast(t('admin_updated'));
  } else {
    // Add new
    S.adminProfiles.push({ id: uid(), name, email, pin });
    toast(t('admin_added'));
  }

  save();
  $('modal-admin-form').classList.add('hidden');
  renderAdminProfilesList();
  updateSettingsProfile();
}

// ─── Confirm Dialog ─────────────────────────────────────
function confirm2(title, msg, cb) {
  $('confirm-title').textContent = title;
  $('confirm-msg').textContent = msg;
  S.confirmCb = cb;
  $('modal-confirm').classList.remove('hidden');
}

// ─── Toast ──────────────────────────────────────────────
let toastTimer;
function toast(msg) {
  const toastEl = $('toast');
  $('toast-msg').textContent = msg;
  toastEl.classList.remove('hidden','out');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add('out');
    setTimeout(() => toastEl.classList.add('hidden'), 300);
  }, 2800);
}

// ─── Confetti ───────────────────────────────────────────
function fireConfetti() {
  const canvas = $('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#6366f1','#a855f7','#ec4899','#f59e0b','#22c55e','#06b6d4','#f472b6'];
  const count = 80;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width/2 + (Math.random()-0.5)*200,
      y: canvas.height/2,
      vx: (Math.random()-0.5) * 12,
      vy: Math.random() * -14 - 4,
      w: Math.random()*10+4,
      h: Math.random()*6+3,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*360,
      rotV: (Math.random()-0.5)*10,
      life: 1,
    });
  }

  let frame;
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let alive = false;

    particles.forEach(p => {
      if (p.life <= 0) return;
      alive = true;
      p.x += p.vx;
      p.vy += 0.3;
      p.y += p.vy;
      p.rot += p.rotV;
      p.life -= 0.012;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });

    if (alive) frame = requestAnimationFrame(animate);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  animate();

  setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0,0,canvas.width,canvas.height); }, 4000);
}

// ─── Admin Vaccine CRUD ─────────────────────────────────
let customVaccines = JSON.parse(localStorage.getItem('vt2_custom_vaccines') || '[]');

function saveCustomVaccines() {
  localStorage.setItem('vt2_custom_vaccines', JSON.stringify(customVaccines));
}

function getAllVaccines() {
  return [...VACCINE_SCHEDULE, ...customVaccines];
}

function openAddVaccineModal() {
  $('admin-vaccine-form-title').textContent = t('add_vaccine');
  $('input-av-name').value = '';
  $('input-av-desc').value = '';
  $('input-av-age').value = '';
  $('input-av-group').value = '';
  $('input-av-edit-id').value = '';
  $('modal-admin-vaccine').classList.remove('hidden');
}

window.editCustomVaccine = function(id) {
  const v = customVaccines.find(x => x.id === id);
  if (!v) return;
  $('admin-vaccine-form-title').textContent = t('edit_vaccine');
  $('input-av-name').value = v.name;
  $('input-av-desc').value = v.desc;
  $('input-av-age').value = v.ageMonths;
  $('input-av-group').value = v.group;
  $('input-av-edit-id').value = v.id;
  $('modal-admin-vaccine').classList.remove('hidden');
};

window.deleteCustomVaccine = function(id) {
  const v = customVaccines.find(x => x.id === id);
  if (!v) return;
  confirm2(t('delete_vaccine'), t('delete_vaccine_msg', {name: v.name}), () => {
    customVaccines = customVaccines.filter(x => x.id !== id);
    saveCustomVaccines();
    toast(t('vaccine_deleted'));
    renderAdminVaccines();
  });
};

function handleSaveVaccine(e) {
  e.preventDefault();
  const name = $('input-av-name').value.trim();
  const desc = $('input-av-desc').value.trim();
  const ageMonths = parseInt($('input-av-age').value) || 0;
  const group = $('input-av-group').value.trim();
  if (!name || !group) return;
  
  const editId = $('input-av-edit-id').value;
  if (editId) {
    const v = customVaccines.find(x => x.id === editId);
    if (v) { v.name = name; v.desc = desc; v.ageMonths = ageMonths; v.group = group; }
    toast(t('vaccine_updated'));
  } else {
    const id = 'custom-' + uid();
    const ageLabel = ageMonths >= 12 ? `${Math.floor(ageMonths/12)} ${ageMonths >= 24 ? 'years' : 'year'}` : `${ageMonths} months`;
    customVaccines.push({ id, name, desc, ageMonths, ageLabel, group, custom: true });
    toast(t('vaccine_added'));
  }
  
  saveCustomVaccines();
  $('modal-admin-vaccine').classList.add('hidden');
  renderAdminVaccines();
}

// ─── Schedule View Toggle ───────────────────────────────
let scheduleViewMode = 'list';

window.setScheduleView = function(mode) {
  scheduleViewMode = mode;
  $$('.svt-btn').forEach(b => b.classList.toggle('active', b.dataset.sview === mode));
  if (mode === 'list') {
    $('schedule-timeline').classList.remove('hidden');
    $('schedule-calendar').classList.add('hidden');
  } else {
    $('schedule-timeline').classList.add('hidden');
    $('schedule-calendar').classList.remove('hidden');
    renderScheduleCalendar();
  }
};

function renderScheduleCalendar() {
  const user = currentUser();
  if (!user || !user.children?.length) return;
  
  const select = $('schedule-child-dropdown');
  const childId = select.value || user.children[0].id;
  const child = user.children.find(c => c.id === childId);
  if (!child) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString(currentLang === 'pt' ? 'pt-AO' : currentLang, { month: 'long', year: 'numeric' });
  
  // Map vaccine dates to days
  const dayMap = {};
  (child.vaccines || []).forEach(v => {
    const d = new Date((v.completedDate || v.scheduledDate) + 'T00:00:00');
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push({ ...v, status: v.completedDate ? 'completed' : vaccineStatus(v, child.birthDate) });
    }
  });

  let html = `<div class="cal-header"><h3>${monthName}</h3></div>`;
  html += '<div class="cal-weekdays">';
  const weekdays = ['S','M','T','W','T','F','S'];
  weekdays.forEach(w => html += `<div class="cal-wd">${w}</div>`);
  html += '</div><div class="cal-grid">';
  
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day cal-empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate();
    const vaxes = dayMap[d];
    let dots = '';
    if (vaxes) {
      dots = vaxes.slice(0,3).map(v => `<span class="cal-dot dot-${v.status}"></span>`).join('');
    }
    html += `<div class="cal-day ${isToday ? 'cal-today' : ''} ${vaxes ? 'cal-has-vax' : ''}">${d}${dots ? `<div class="cal-dots">${dots}</div>` : ''}</div>`;
  }
  html += '</div>';
  
  $('schedule-calendar').innerHTML = html;
}

// ─── Parent PIN Login ───────────────────────────────────
window.selectParent = function(id) {
  const user = S.users.find(u => u.id === id);
  if (!user) return;
  
  // If user has a PIN set, require it
  if (user.pin) {
    S._pendingLoginId = id;
    $('input-parent-login-pin').value = '';
    $('modal-parent-pin').classList.remove('hidden');
    $('btn-parent-pin-login').onclick = () => {
      const pin = $('input-parent-login-pin').value;
      if (pin === user.pin) {
        $('modal-parent-pin').classList.add('hidden');
        S.userId = id;
        enterApp('parent');
      } else {
        toast(t('incorrect_pin'));
        $('input-parent-login-pin').value = '';
        $('input-parent-login-pin').focus();
      }
    };
    $('input-parent-login-pin').addEventListener('keyup', function handler(e) {
      if (e.key === 'Enter') { $('btn-parent-pin-login').click(); $('input-parent-login-pin').removeEventListener('keyup', handler); }
    });
  } else {
    // No PIN, go directly
    S.userId = id;
    enterApp('parent');
  }
};
