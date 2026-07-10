export interface Vaccine {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  description: string;
  descriptionPt: string;
  ageMonths: number;
  ageLabel: string;
  ageLabelPt: string;
  group: string;
  doses: number;
  doseNumber: number;
  dependsOn?: string[];
  sideEffects: string[];
  sideEffectsPt: string[];
  benefits: string[];
  benefitsPt: string[];
  category: 'mandatory' | 'recommended' | 'travel';
  detailedInfo?: {
    mechanism: string;
    mechanismPt: string;
    composition: string;
    compositionPt: string;
    contraindications: string[];
    contraindicationsPt: string[];
    storage: string;
    storagePt: string;
  };
}

export const VACCINE_SCHEDULE: Vaccine[] = [
  // ============================================================
  // AT BIRTH (0 months)
  // ============================================================
  {
    id: 'bcg',
    name: 'BCG',
    namePt: 'BCG',
    nameEn: 'BCG',
    description:
      'Bacillus Calmette-Guérin vaccine protects against tuberculosis (TB), one of the leading causes of death worldwide. It is especially effective at preventing severe forms of TB in children, including tuberculous meningitis and miliary tuberculosis. The WHO recommends a single dose at birth in endemic countries.',
    descriptionPt:
      'A vacina Bacillus Calmette-Guérin protege contra a tuberculose (TB), uma das principais causas de morte no mundo. É especialmente eficaz na prevenção de formas graves de TB em crianças, incluindo meningite tuberculosa e tuberculose miliar. A OMS recomenda uma dose única ao nascer em países endêmicos.',
    ageMonths: 0,
    ageLabel: 'At Birth',
    ageLabelPt: 'Ao Nascer',
    group: 'birth',
    doses: 1,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Small scar (nodule) at injection site – expected and normal',
      'Mild fever (37.5–38.5°C) within 24–48 hours',
      'Localized swelling and redness at injection site',
      'Axillary lymphadenopathy (swollen lymph nodes near armpit)',
      'Superficial abscess at injection site (rare, ~1–2%)',
      'Keloid formation at scar site (rare)',
      'Disseminated BCG infection in immunocompromised infants (very rare)',
    ],
    sideEffectsPt: [
      'Pequena cicatriz (nódulo) no local da injeção – esperada e normal',
      'Febre leve (37,5–38,5°C) dentro de 24–48 horas',
      'Inchaço localizado e vermelhidão no local da injeção',
      'Linfadenopatia axilar (gânglios linfáticos inchados perto da axila)',
      'Abscesso superficial no local da injeção (raro, ~1–2%)',
      'Formação de queloide no local da cicatriz (raro)',
      'Infecção disseminada por BCG em bebês imunocomprometidos (muito raro)',
    ],
    benefits: [
      'Prevents severe childhood TB including meningitis (80% efficacy)',
      'Reduces risk of miliary (disseminated) tuberculosis',
      'Provides cross-protection against leprosy (up to 50%)',
      'Effective immediately – critical in high-prevalence settings like Angola',
      'Single dose provides decades of protection in children',
      'Reduces TB-related mortality by approximately 50% in infants',
      'WHO-recommended for all newborns in TB-endemic countries',
    ],
    benefitsPt: [
      'Previne TB grave na infância incluindo meningite (80% de eficácia)',
      'Reduz risco de tuberculose miliar (disseminada)',
      'Fornece proteção cruzada contra hanseníase (até 50%)',
      'Eficaz imediatamente – crucial em ambientes de alta prevalência como Angola',
      'Dose única fornece décadas de proteção em crianças',
      'Reduz mortalidade relacionada à TB em aproximadamente 50% em bebês',
      'Recomendada pela OMS para todos os recém-nascidos em países endêmicos de TB',
    ],
    detailedInfo: {
      mechanism:
        'BCG is a live attenuated vaccine derived from Mycobacterium bovis. It stimulates cell-mediated immunity by activating T-lymphocytes and macrophages, creating a robust immune response against Mycobacterium tuberculosis without causing disease.',
      mechanismPt:
        'A BCG é uma vacina viva atenuada derivada do Mycobacterium bovis. Estimula a imunidade mediada por células ativando linfócitos T e macrófagos, criando uma resposta imune robusta contra o Mycobacterium tuberculosis sem causar doença.',
      composition:
        'Live attenuated strain of Mycobacterium bovis (various sub-strains: Danish 1331, Tokyo 172, Pasteur 1173-P2). Reconstituted with sterile saline. Contains no adjuvant or preservative.',
      compositionPt:
        'Cepa viva atenuada de Mycobacterium bovis (várias sub-cepas: Danish 1331, Tokyo 172, Pasteur 1173-P2). Reconstituída com solução salina estéril. Não contém adjuvante ou conservante.',
      contraindications: [
        'Known HIV infection with immunosuppression',
        'Congenital immunodeficiency disorders (SCID)',
        'Infants born to mothers on immunosuppressive therapy',
        'Active generalized skin disease or infection',
        'Premature infants weighing less than 2,000 grams',
      ],
      contraindicationsPt: [
        'Infecção por HIV conhecida com imunossupressão',
        'Distúrbios de imunodeficiência congênita (SCID)',
        'Bebês nascidos de mães em terapia imunossupressora',
        'Doença de pele generalizada ativa ou infecção',
        'Bebês prematuros com peso inferior a 2.000 gramas',
      ],
      storage: 'Store lyophilized vaccine at +2°C to +8°C. Protect from light. Once reconstituted, use within 6 hours and discard any remaining vaccine. Never freeze reconstituted BCG.',
      storagePt: 'Armazenar vacina liofilizada a +2°C a +8°C. Proteger da luz. Após reconstituição, usar dentro de 6 horas e descartar qualquer vacina restante. Nunca congelar BCG reconstituída.',
    },
  },
  {
    id: 'hepb-1',
    name: 'Hepatitis B – 1st dose',
    namePt: 'Hepatite B – 1ª dose',
    nameEn: 'Hepatitis B – 1st dose',
    description:
      'The hepatitis B birth dose is critical for preventing perinatal transmission of the hepatitis B virus (HBV), which can cause chronic liver infection, cirrhosis, and hepatocellular carcinoma. The WHO recommends this dose within 24 hours of birth. It is the first of a 3-dose series that provides over 95% protection.',
    descriptionPt:
      'A dose de nascimento da hepatite B é crítica para prevenir a transmissão perinatal do vírus da hepatite B (VHB), que pode causar infecção hepática crônica, cirrose e carcinoma hepatocelular. A OMS recomenda esta dose dentro de 24 horas após o nascimento. É a primeira de uma série de 3 doses que fornece mais de 95% de proteção.',
    ageMonths: 0,
    ageLabel: 'At Birth',
    ageLabelPt: 'Ao Nascer',
    group: 'birth',
    doses: 3,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Soreness, redness, or swelling at injection site (25–30%)',
      'Low-grade fever (37.5–38°C) lasting 1–2 days',
      'Irritability and excessive crying in newborns',
      'Mild fatigue or malaise',
      'Decreased feeding for 12–24 hours',
      'Headache (in older infants, rare)',
      'Anaphylaxis (extremely rare, ~1 in 1.1 million doses)',
    ],
    sideEffectsPt: [
      'Dor, vermelhidão ou inchaço no local da injeção (25–30%)',
      'Febre baixa (37,5–38°C) durando 1–2 dias',
      'Irritabilidade e choro excessivo em recém-nascidos',
      'Fadiga leve ou mal-estar',
      'Diminuição da alimentação por 12–24 horas',
      'Dor de cabeça (em bebês mais velhos, raro)',
      'Anafilaxia (extremamente raro, ~1 em 1,1 milhão de doses)',
    ],
    benefits: [
      'Prevents chronic hepatitis B infection (95% efficacy after 3 doses)',
      'Reduces risk of liver cirrhosis and liver failure',
      'Prevents hepatocellular carcinoma (liver cancer)',
      'Blocks mother-to-child transmission at birth',
      'Protection lasts 20+ years, often lifelong',
      'Critical in preventing the silent carrier state in infants',
      'Part of WHO global strategy to eliminate hepatitis B by 2030',
    ],
    benefitsPt: [
      'Previne infecção crônica por hepatite B (95% de eficácia após 3 doses)',
      'Reduz risco de cirrose hepática e insuficiência hepática',
      'Previne carcinoma hepatocelular (câncer de fígado)',
      'Bloqueia transmissão de mãe para filho ao nascimento',
      'Proteção dura mais de 20 anos, frequentemente vitalícia',
      'Crítica na prevenção do estado de portador silencioso em bebês',
      'Parte da estratégia global da OMS para eliminar hepatite B até 2030',
    ],
    detailedInfo: {
      mechanism:
        'Recombinant vaccine containing hepatitis B surface antigen (HBsAg) produced in yeast cells. Stimulates humoral immunity by inducing anti-HBs antibodies, providing seroprotection when titers exceed 10 mIU/mL.',
      mechanismPt:
        'Vacina recombinante contendo antígeno de superfície da hepatite B (HBsAg) produzido em células de levedura. Estimula imunidade humoral induzindo anticorpos anti-HBs, fornecendo soroproteção quando os títulos excedem 10 mIU/mL.',
      composition:
        'Recombinant HBsAg protein (10 mcg pediatric dose), adsorbed onto aluminum hydroxide adjuvant. May contain trace amounts of yeast protein. Preservative-free single-dose formulation.',
      compositionPt:
        'Proteína HBsAg recombinante (10 mcg dose pediátrica), adsorvida em adjuvante de hidróxido de alumínio. Pode conter vestígios de proteína de levedura. Formulação de dose única sem conservante.',
      contraindications: [
        'Severe allergic reaction (anaphylaxis) to a previous dose',
        'Known hypersensitivity to yeast or any vaccine component',
        'Moderate to severe acute illness (defer until recovery)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave (anafilaxia) a uma dose anterior',
        'Hipersensibilidade conhecida a levedura ou qualquer componente da vacina',
        'Doença aguda moderada a grave (adiar até recuperação)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze – freezing destroys vaccine potency. Protect from light. Use within the expiry date on the vial.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar – congelamento destrói a potência da vacina. Proteger da luz. Usar dentro da data de validade no frasco.',
    },
  },

  // ============================================================
  // 2 MONTHS
  // ============================================================
  {
    id: 'penta-1',
    name: 'Pentavalent – 1st dose',
    namePt: 'Pentavalente – 1ª dose',
    nameEn: 'Pentavalent – 1st dose',
    description:
      'The pentavalent vaccine is a 5-in-1 combination that protects against diphtheria, tetanus, pertussis (whooping cough), hepatitis B, and Haemophilus influenzae type b (Hib). This combined approach reduces the number of injections while providing broad protection. It is a cornerstone of the WHO Expanded Programme on Immunization (EPI).',
    descriptionPt:
      'A vacina pentavalente é uma combinação 5-em-1 que protege contra difteria, tétano, coqueluche, hepatite B e Haemophilus influenzae tipo b (Hib). Esta abordagem combinada reduz o número de injeções enquanto fornece proteção ampla. É uma pedra angular do Programa Ampliado de Imunização (PAI) da OMS.',
    ageMonths: 2,
    ageLabel: '2 months',
    ageLabelPt: '2 meses',
    group: '2m',
    doses: 3,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Fever (38–39°C) within 24–48 hours (~50% of recipients)',
      'Irritability and prolonged crying (up to 3 hours)',
      'Swelling, redness, and induration at injection site',
      'Loss of appetite for 1–2 days',
      'Drowsiness and increased sleep',
      'Vomiting or mild diarrhea (uncommon)',
      'Hypotonic-hyporesponsive episode – HHE (rare, self-resolving)',
      'Febrile seizures (rare, ~1 in 14,000 doses)',
    ],
    sideEffectsPt: [
      'Febre (38–39°C) dentro de 24–48 horas (~50% dos vacinados)',
      'Irritabilidade e choro prolongado (até 3 horas)',
      'Inchaço, vermelhidão e endurecimento no local da injeção',
      'Perda de apetite por 1–2 dias',
      'Sonolência e aumento do sono',
      'Vômito ou diarreia leve (incomum)',
      'Episódio hipotônico-hiporresponsivo – EHH (raro, autolimitado)',
      'Convulsões febris (raro, ~1 em 14.000 doses)',
    ],
    benefits: [
      'Protects against 5 potentially fatal diseases in a single injection',
      'Reduces number of clinic visits and injections needed',
      'Prevents pertussis (whooping cough), which has high infant mortality',
      'Prevents invasive Hib disease including bacterial meningitis',
      'Continues hepatitis B immunization series',
      'Part of WHO EPI – backed by global safety and efficacy data',
      'Over 85% efficacy after completing the 3-dose primary series',
    ],
    benefitsPt: [
      'Protege contra 5 doenças potencialmente fatais em uma única injeção',
      'Reduz número de visitas clínicas e injeções necessárias',
      'Previne coqueluche, que tem alta mortalidade infantil',
      'Previne doença invasiva por Hib incluindo meningite bacteriana',
      'Continua a série de imunização contra hepatite B',
      'Parte do PAI da OMS – respaldada por dados globais de segurança e eficácia',
      'Mais de 85% de eficácia após completar a série primária de 3 doses',
    ],
    detailedInfo: {
      mechanism:
        'Combination vaccine containing diphtheria and tetanus toxoids, inactivated pertussis components, recombinant HBsAg, and purified Hib polysaccharide conjugated to tetanus toxoid. Stimulates both humoral and cellular immunity against all five pathogens.',
      mechanismPt:
        'Vacina combinada contendo toxoides de difteria e tétano, componentes inativados de coqueluche, HBsAg recombinante e polissacarídeo purificado de Hib conjugado ao toxoide tetânico. Estimula imunidade humoral e celular contra os cinco patógenos.',
      composition:
        'Diphtheria toxoid (≥30 IU), tetanus toxoid (≥60 IU), inactivated Bordetella pertussis, HBsAg (10 mcg), Hib PRP conjugated to tetanus protein (10 mcg). Adjuvant: aluminum phosphate. Preservative: thiomersal (multi-dose vials).',
      compositionPt:
        'Toxoide diftérico (≥30 UI), toxoide tetânico (≥60 UI), Bordetella pertussis inativada, HBsAg (10 mcg), PRP de Hib conjugado a proteína tetânica (10 mcg). Adjuvante: fosfato de alumínio. Conservante: tiomersal (frascos multidose).',
      contraindications: [
        'Severe allergic reaction to a previous dose of pentavalent or any component',
        'Encephalopathy within 7 days of a previous pertussis-containing vaccine',
        'Progressive neurological disorder (until stabilized)',
        'Moderate to severe acute illness (defer vaccination)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma dose anterior de pentavalente ou qualquer componente',
        'Encefalopatia dentro de 7 dias de uma vacina anterior contendo coqueluche',
        'Distúrbio neurológico progressivo (até estabilização)',
        'Doença aguda moderada a grave (adiar vacinação)',
      ],
      storage: 'Store at +2°C to +8°C. Do NOT freeze – freezing irreversibly damages the vaccine. Shake well before use. Discard multi-dose vials within 28 days of opening or at end of session (whichever is sooner).',
      storagePt: 'Armazenar a +2°C a +8°C. NÃO congelar – congelamento danifica irreversivelmente a vacina. Agitar bem antes do uso. Descartar frascos multidose dentro de 28 dias após abertura ou ao final da sessão (o que ocorrer primeiro).',
    },
  },
  {
    id: 'ipv-1',
    name: 'Polio (IPV) – 1st dose',
    namePt: 'Polio (VIP) – 1ª dose',
    nameEn: 'Polio (IPV) – 1st dose',
    description:
      'The inactivated polio vaccine (IPV) protects against all three serotypes of poliovirus. Unlike the oral polio vaccine (OPV), IPV cannot cause vaccine-derived polio. It is administered by injection and is a key component of the global polio eradication strategy endorsed by the WHO.',
    descriptionPt:
      'A vacina inativada contra poliomielite (VIP) protege contra os três sorotipos do poliovírus. Diferente da vacina oral contra pólio (VOP), a VIP não pode causar pólio derivada da vacina. É administrada por injeção e é componente chave da estratégia global de erradicação da pólio endossada pela OMS.',
    ageMonths: 2,
    ageLabel: '2 months',
    ageLabelPt: '2 meses',
    group: '2m',
    doses: 3,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Mild pain and redness at injection site (20–30%)',
      'Low-grade fever (37.5–38°C) for 1–2 days',
      'Localized induration or swelling',
      'Irritability and fussiness in infants',
      'Temporary decrease in appetite',
      'Mild drowsiness',
      'Allergic reaction (extremely rare)',
    ],
    sideEffectsPt: [
      'Dor leve e vermelhidão no local da injeção (20–30%)',
      'Febre baixa (37,5–38°C) por 1–2 dias',
      'Endurecimento localizado ou inchaço',
      'Irritabilidade e agitação em bebês',
      'Diminuição temporária do apetite',
      'Sonolência leve',
      'Reação alérgica (extremamente raro)',
    ],
    benefits: [
      'Prevents poliomyelitis (paralytic polio) – a crippling disease',
      'Cannot cause vaccine-derived polio (unlike OPV)',
      'Induces strong systemic humoral immunity (>99% seroconversion after 3 doses)',
      'Essential for global polio eradication – WHO goal',
      'Safe for immunocompromised individuals',
      'Contributes to herd immunity when combined with OPV campaigns',
    ],
    benefitsPt: [
      'Previne poliomielite (pólio paralítica) – uma doença incapacitante',
      'Não pode causar pólio derivada da vacina (diferente da VOP)',
      'Induz forte imunidade humoral sistêmica (>99% de soroconversão após 3 doses)',
      'Essencial para erradicação global da pólio – meta da OMS',
      'Segura para indivíduos imunocomprometidos',
      'Contribui para imunidade coletiva quando combinada com campanhas de VOP',
    ],
    detailedInfo: {
      mechanism:
        'Contains formalin-inactivated poliovirus types 1, 2, and 3 grown in Vero cells or human diploid cells. Induces neutralizing IgG antibodies against all three serotypes, providing systemic immunity and preventing viremia and paralysis.',
      mechanismPt:
        'Contém poliovírus tipos 1, 2 e 3 inativados por formalina cultivados em células Vero ou células diploides humanas. Induz anticorpos IgG neutralizantes contra os três sorotipos, fornecendo imunidade sistêmica e prevenindo viremia e paralisia.',
      composition:
        'Inactivated poliovirus type 1 (Mahoney, 40 DU), type 2 (MEF-1, 8 DU), type 3 (Saukett, 32 DU). Adjuvant: aluminum hydroxide. May contain traces of formaldehyde, 2-phenoxyethanol, and neomycin/streptomycin.',
      compositionPt:
        'Poliovírus inativado tipo 1 (Mahoney, 40 UD), tipo 2 (MEF-1, 8 UD), tipo 3 (Saukett, 32 UD). Adjuvante: hidróxido de alumínio. Pode conter vestígios de formaldeído, 2-fenoxietanol e neomicina/estreptomicina.',
      contraindications: [
        'Severe allergic reaction to neomycin, streptomycin, or polymyxin B',
        'Anaphylaxis after a previous IPV dose',
        'Moderate to severe acute illness (defer until recovery)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave à neomicina, estreptomicina ou polimixina B',
        'Anafilaxia após dose anterior de VIP',
        'Doença aguda moderada a grave (adiar até recuperação)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze. Protect from light. Multi-dose vials should be discarded after 28 days of opening.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar. Proteger da luz. Frascos multidose devem ser descartados após 28 dias da abertura.',
    },
  },
  {
    id: 'rota-1',
    name: 'Rotavirus – 1st dose',
    namePt: 'Rotavírus – 1ª dose',
    nameEn: 'Rotavirus – 1st dose',
    description:
      'The rotavirus vaccine is an oral vaccine that protects against severe gastroenteritis caused by rotavirus, the leading cause of severe diarrhea and dehydration in children under 5 worldwide. The WHO recommends the first dose between 6 and 15 weeks of age. It has dramatically reduced hospitalizations and deaths from rotavirus disease globally.',
    descriptionPt:
      'A vacina contra rotavírus é uma vacina oral que protege contra gastroenterite grave causada pelo rotavírus, a principal causa de diarreia severa e desidratação em crianças menores de 5 anos no mundo. A OMS recomenda a primeira dose entre 6 e 15 semanas de idade. Reduziu drasticamente hospitalizações e mortes por doença por rotavírus globalmente.',
    ageMonths: 2,
    ageLabel: '2 months',
    ageLabelPt: '2 meses',
    group: '2m',
    doses: 2,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Mild transient diarrhea (3–4%)',
      'Irritability and fussiness (up to 8%)',
      'Mild vomiting within 1 hour of administration',
      'Flatulence and abdominal distension',
      'Low-grade fever (uncommon)',
      'Decreased appetite for 1–2 days',
      'Intussusception (very rare, ~1–6 per 100,000 vaccinated infants)',
    ],
    sideEffectsPt: [
      'Diarreia leve e transitória (3–4%)',
      'Irritabilidade e agitação (até 8%)',
      'Vômito leve dentro de 1 hora da administração',
      'Flatulência e distensão abdominal',
      'Febre baixa (incomum)',
      'Diminuição do apetite por 1–2 dias',
      'Intussuscepção (muito raro, ~1–6 por 100.000 bebês vacinados)',
    ],
    benefits: [
      'Prevents severe rotavirus gastroenteritis (85–98% efficacy in developed settings)',
      'Reduces hospitalization for diarrhea by up to 85%',
      'Oral administration – no injection needed',
      'Prevents life-threatening dehydration in infants',
      'Reduces childhood mortality from diarrhea in low-income countries',
      'Provides herd protection to unvaccinated household contacts',
      'WHO-recommended for all infants globally since 2009',
    ],
    benefitsPt: [
      'Previne gastroenterite grave por rotavírus (85–98% de eficácia em países desenvolvidos)',
      'Reduz hospitalização por diarreia em até 85%',
      'Administração oral – sem necessidade de injeção',
      'Previne desidratação potencialmente fatal em bebês',
      'Reduz mortalidade infantil por diarreia em países de baixa renda',
      'Fornece proteção coletiva a contactantes domiciliares não vacinados',
      'Recomendada pela OMS para todos os bebês globalmente desde 2009',
    ],
    detailedInfo: {
      mechanism:
        'Live attenuated oral vaccine. Rotarix (monovalent G1P[8]) or RotaTeq (pentavalent G1-G4, P[8]). Replicates in the intestinal epithelium, inducing mucosal IgA and systemic IgG antibodies, mimicking natural infection without causing severe disease.',
      mechanismPt:
        'Vacina oral viva atenuada. Rotarix (monovalente G1P[8]) ou RotaTeq (pentavalente G1-G4, P[8]). Replica-se no epitélio intestinal, induzindo anticorpos IgA mucosal e IgG sistêmico, imitando infecção natural sem causar doença grave.',
      composition:
        'Rotarix: live attenuated human rotavirus strain RIX4414 (G1P[8]), ≥10⁶ CCID₅₀, in oral suspension with sucrose, dextran, sorbitol, amino acids. Latex-free oral applicator.',
      compositionPt:
        'Rotarix: cepa de rotavírus humano vivo atenuado RIX4414 (G1P[8]), ≥10⁶ CCID₅₀, em suspensão oral com sacarose, dextrana, sorbitol, aminoácidos. Aplicador oral sem látex.',
      contraindications: [
        'History of intussusception',
        'Severe combined immunodeficiency (SCID)',
        'Uncorrected congenital malformation of the GI tract',
        'Severe allergic reaction to a previous rotavirus vaccine dose',
        'Acute severe gastroenteritis or vomiting (defer until recovery)',
      ],
      contraindicationsPt: [
        'Histórico de intussuscepção',
        'Imunodeficiência combinada grave (SCID)',
        'Malformação congênita não corrigida do trato gastrointestinal',
        'Reação alérgica grave a uma dose anterior de vacina contra rotavírus',
        'Gastroenterite aguda grave ou vômito (adiar até recuperação)',
      ],
      storage: 'Rotarix: store at +2°C to +8°C. Do not freeze. Protect from light. Once reconstituted, administer promptly or within 24 hours (refrigerated).',
      storagePt: 'Rotarix: armazenar a +2°C a +8°C. Não congelar. Proteger da luz. Após reconstituição, administrar prontamente ou dentro de 24 horas (refrigerada).',
    },
  },
  {
    id: 'pneumo-1',
    name: 'Pneumococcal – 1st dose',
    namePt: 'Pneumocócica – 1ª dose',
    nameEn: 'Pneumococcal – 1st dose',
    description:
      'The pneumococcal conjugate vaccine (PCV) protects against Streptococcus pneumoniae, a leading cause of pneumonia, meningitis, and sepsis in children under 5. In Angola and sub-Saharan Africa, pneumococcal disease is among the top killers of young children. The WHO recommends a 3-dose schedule (2+1 or 3+0).',
    descriptionPt:
      'A vacina pneumocócica conjugada (VPC) protege contra Streptococcus pneumoniae, uma das principais causas de pneumonia, meningite e sepse em crianças menores de 5 anos. Em Angola e na África Subsaariana, a doença pneumocócica está entre as principais causas de morte de crianças pequenas. A OMS recomenda um esquema de 3 doses (2+1 ou 3+0).',
    ageMonths: 2,
    ageLabel: '2 months',
    ageLabelPt: '2 meses',
    group: '2m',
    doses: 3,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Fever ≥38°C (up to 30% of recipients)',
      'Injection site pain, redness, and swelling',
      'Decreased appetite and refusal to feed',
      'Irritability and restlessness',
      'Drowsiness and increased sleep',
      'Mild diarrhea or vomiting',
      'Rash or urticaria (uncommon)',
      'Febrile seizures (rare, ~1 per 30,000 doses)',
    ],
    sideEffectsPt: [
      'Febre ≥38°C (até 30% dos vacinados)',
      'Dor, vermelhidão e inchaço no local da injeção',
      'Diminuição do apetite e recusa alimentar',
      'Irritabilidade e inquietação',
      'Sonolência e aumento do sono',
      'Diarreia leve ou vômito',
      'Erupção cutânea ou urticária (incomum)',
      'Convulsões febris (raro, ~1 por 30.000 doses)',
    ],
    benefits: [
      'Prevents pneumococcal pneumonia – the #1 infectious killer of children globally',
      'Protects against bacterial meningitis (case fatality 20–50% in Africa)',
      'Prevents bloodstream infections (bacteremia and sepsis)',
      'Reduces acute otitis media (middle ear infections)',
      'Reduces antibiotic resistance by preventing infections that lead to antibiotic use',
      'Provides indirect (herd) protection to unvaccinated community members',
      'WHO-recommended for all children with high priority in Africa',
    ],
    benefitsPt: [
      'Previne pneumonia pneumocócica – a principal causa infecciosa de morte infantil globalmente',
      'Protege contra meningite bacteriana (letalidade de 20–50% na África)',
      'Previne infecções da corrente sanguínea (bacteremia e sepse)',
      'Reduz otite média aguda (infecções do ouvido médio)',
      'Reduz resistência antimicrobiana ao prevenir infecções que levam ao uso de antibióticos',
      'Fornece proteção indireta (coletiva) a membros não vacinados da comunidade',
      'Recomendada pela OMS para todas as crianças com alta prioridade na África',
    ],
    detailedInfo: {
      mechanism:
        'Conjugate vaccine linking pneumococcal capsular polysaccharides to a carrier protein (CRM197 or protein D). This conjugation converts a T-cell-independent response into a T-cell-dependent one, enabling effective immunization in infants and immunological memory.',
      mechanismPt:
        'Vacina conjugada que liga polissacarídeos capsulares pneumocócicos a uma proteína carreadora (CRM197 ou proteína D). Esta conjugação converte uma resposta T-independente em T-dependente, permitindo imunização eficaz em bebês e memória imunológica.',
      composition:
        'PCV13: 13 pneumococcal serotype polysaccharides (1, 3, 4, 5, 6A, 6B, 7F, 9V, 14, 18C, 19A, 19F, 23F) conjugated to CRM197 carrier protein. Adjuvant: aluminum phosphate. No preservative.',
      compositionPt:
        'VPC13: 13 polissacarídeos de sorotipos pneumocócicos (1, 3, 4, 5, 6A, 6B, 7F, 9V, 14, 18C, 19A, 19F, 23F) conjugados à proteína carreadora CRM197. Adjuvante: fosfato de alumínio. Sem conservante.',
      contraindications: [
        'Severe allergic reaction to a previous PCV dose or any vaccine containing diphtheria toxoid',
        'Known hypersensitivity to any component of the vaccine',
        'Moderate to severe acute illness (defer vaccination)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a dose anterior de VPC ou qualquer vacina contendo toxoide diftérico',
        'Hipersensibilidade conhecida a qualquer componente da vacina',
        'Doença aguda moderada a grave (adiar vacinação)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze. Discard if frozen. Single-dose prefilled syringe should be used immediately after opening.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar. Descartar se congelada. Seringa preenchida de dose única deve ser usada imediatamente após abertura.',
    },
  },
  {
    id: 'hepb-2',
    name: 'Hepatitis B – 2nd dose',
    namePt: 'Hepatite B – 2ª dose',
    nameEn: 'Hepatitis B – 2nd dose',
    description:
      'The second dose of hepatitis B vaccine reinforces the immune response initiated by the birth dose. Given at 2 months of age, it significantly boosts anti-HBs antibody levels. This dose is critical for building reliable protection, particularly in infants born to HBsAg-positive mothers.',
    descriptionPt:
      'A segunda dose da vacina contra hepatite B reforça a resposta imune iniciada pela dose de nascimento. Dada aos 2 meses de idade, aumenta significativamente os níveis de anticorpos anti-HBs. Esta dose é crítica para construir proteção confiável, particularmente em bebês nascidos de mães HBsAg-positivas.',
    ageMonths: 2,
    ageLabel: '2 months',
    ageLabelPt: '2 meses',
    group: '2m',
    doses: 3,
    doseNumber: 2,
    dependsOn: ['hepb-1'],
    category: 'mandatory',
    sideEffects: [
      'Soreness and tenderness at injection site',
      'Low-grade fever (37.5–38°C)',
      'Irritability and fussiness',
      'Mild fatigue or lethargy',
      'Decreased appetite for 24 hours',
      'Mild headache (in older infants)',
    ],
    sideEffectsPt: [
      'Dor e sensibilidade no local da injeção',
      'Febre baixa (37,5–38°C)',
      'Irritabilidade e agitação',
      'Fadiga leve ou letargia',
      'Diminuição do apetite por 24 horas',
      'Dor de cabeça leve (em bebês mais velhos)',
    ],
    benefits: [
      'Strengthens immune response from birth dose',
      'Raises anti-HBs antibody titers above protective threshold',
      'Reduces risk of chronic HBV carrier state',
      'Essential step in completing the 3-dose series',
      'Prevents vertical transmission from infected mothers',
      'Supports WHO hepatitis B elimination goals',
    ],
    benefitsPt: [
      'Fortalece a resposta imune da dose de nascimento',
      'Eleva títulos de anticorpos anti-HBs acima do limiar protetor',
      'Reduz risco do estado de portador crônico do VHB',
      'Etapa essencial para completar a série de 3 doses',
      'Previne transmissão vertical de mães infectadas',
      'Apoia metas da OMS para eliminação da hepatite B',
    ],
    detailedInfo: {
      mechanism:
        'Booster dose of recombinant HBsAg. Activates memory B-cells primed by the first dose, amplifying the anamnestic (secondary) antibody response and increasing anti-HBs titers for sustained protection.',
      mechanismPt:
        'Dose de reforço de HBsAg recombinante. Ativa células B de memória preparadas pela primeira dose, amplificando a resposta anamnéstica (secundária) de anticorpos e aumentando títulos de anti-HBs para proteção sustentada.',
      composition:
        'Recombinant HBsAg protein (10 mcg pediatric dose), aluminum hydroxide adjuvant. Preservative-free single-dose formulation.',
      compositionPt:
        'Proteína HBsAg recombinante (10 mcg dose pediátrica), adjuvante de hidróxido de alumínio. Formulação de dose única sem conservante.',
      contraindications: [
        'Severe allergic reaction to a previous hepatitis B vaccine dose',
        'Known hypersensitivity to yeast or any component',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a dose anterior da vacina contra hepatite B',
        'Hipersensibilidade conhecida a levedura ou qualquer componente',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze. Protect from light.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar. Proteger da luz.',
    },
  },

  // ============================================================
  // 3 MONTHS
  // ============================================================
  {
    id: 'meningo-1',
    name: 'Meningococcal – 1st dose',
    namePt: 'Meningocócica – 1ª dose',
    nameEn: 'Meningococcal – 1st dose',
    description:
      'The meningococcal conjugate vaccine protects against invasive meningococcal disease caused by Neisseria meningitidis serogroup A, which is responsible for devastating epidemics in the African meningitis belt. The disease can progress from first symptoms to death within 24 hours, making vaccination essential.',
    descriptionPt:
      'A vacina meningocócica conjugada protege contra a doença meningocócica invasiva causada por Neisseria meningitidis sorogrupo A, responsável por epidemias devastadoras no cinturão da meningite africana. A doença pode progredir dos primeiros sintomas à morte em 24 horas, tornando a vacinação essencial.',
    ageMonths: 3,
    ageLabel: '3 months',
    ageLabelPt: '3 meses',
    group: '3m',
    doses: 3,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Fever (38–39°C) within 48 hours',
      'Headache and general malaise',
      'Fatigue and drowsiness',
      'Pain, redness, and swelling at injection site',
      'Irritability in infants',
      'Nausea or vomiting (uncommon)',
      'Myalgia and arthralgia (rare)',
      'Anaphylactic reaction (extremely rare)',
    ],
    sideEffectsPt: [
      'Febre (38–39°C) dentro de 48 horas',
      'Dor de cabeça e mal-estar geral',
      'Fadiga e sonolência',
      'Dor, vermelhidão e inchaço no local da injeção',
      'Irritabilidade em bebês',
      'Náusea ou vômito (incomum)',
      'Mialgia e artralgia (raro)',
      'Reação anafilática (extremamente raro)',
    ],
    benefits: [
      'Prevents bacterial meningitis – a leading cause of childhood death in Africa',
      'Protects against meningococcal septicemia (bloodstream infection)',
      'Critical for children in the African meningitis belt including Angola',
      'Reduces risk of devastating neurological sequelae (deafness, brain damage)',
      'Herd immunity effect reduces transmission in the community',
      'Case fatality rate of meningococcal disease is 10–15% even with treatment',
    ],
    benefitsPt: [
      'Previne meningite bacteriana – uma das principais causas de morte infantil na África',
      'Protege contra septicemia meningocócica (infecção da corrente sanguínea)',
      'Crítica para crianças no cinturão da meningite africana incluindo Angola',
      'Reduz risco de sequelas neurológicas devastadoras (surdez, dano cerebral)',
      'Efeito de imunidade coletiva reduz transmissão na comunidade',
      'Taxa de letalidade da doença meningocócica é 10–15% mesmo com tratamento',
    ],
    detailedInfo: {
      mechanism:
        'Conjugate vaccine containing purified meningococcal group A capsular polysaccharide covalently linked to tetanus toxoid carrier protein. Induces T-cell-dependent immune response and immunological memory, effective even in young infants.',
      mechanismPt:
        'Vacina conjugada contendo polissacarídeo capsular purificado do grupo A meningocócico ligado covalentemente à proteína carreadora de toxoide tetânico. Induz resposta imune T-dependente e memória imunológica, eficaz mesmo em bebês pequenos.',
      composition:
        'MenAfriVac or equivalent: 10 mcg meningococcal group A polysaccharide conjugated to tetanus toxoid. Adjuvant: aluminum phosphate. Preservative: thiomersal (multi-dose).',
      compositionPt:
        'MenAfriVac ou equivalente: 10 mcg de polissacarídeo meningocócico grupo A conjugado ao toxoide tetânico. Adjuvante: fosfato de alumínio. Conservante: tiomersal (multidose).',
      contraindications: [
        'Severe allergic reaction to a previous meningococcal vaccine or tetanus toxoid',
        'Moderate to severe acute illness (defer until recovery)',
        'Known hypersensitivity to any vaccine component',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a vacina meningocócica anterior ou toxoide tetânico',
        'Doença aguda moderada a grave (adiar até recuperação)',
        'Hipersensibilidade conhecida a qualquer componente da vacina',
      ],
      storage: 'Store lyophilized vaccine and diluent at +2°C to +8°C. Reconstitute immediately before use. Discard reconstituted vaccine after 6 hours.',
      storagePt: 'Armazenar vacina liofilizada e diluente a +2°C a +8°C. Reconstituir imediatamente antes do uso. Descartar vacina reconstituída após 6 horas.',
    },
  },

  // ============================================================
  // 4 MONTHS
  // ============================================================
  {
    id: 'penta-2',
    name: 'Pentavalent – 2nd dose',
    namePt: 'Pentavalente – 2ª dose',
    nameEn: 'Pentavalent – 2nd dose',
    description:
      'Second dose of the 5-in-1 combined vaccine for diphtheria, tetanus, pertussis, hepatitis B, and Hib. This dose strengthens the primary immune response and is essential for building adequate antibody levels. The interval of at least 4 weeks from the first dose ensures optimal immunogenicity.',
    descriptionPt:
      'Segunda dose da vacina combinada 5-em-1 para difteria, tétano, coqueluche, hepatite B e Hib. Esta dose fortalece a resposta imune primária e é essencial para construir níveis adequados de anticorpos. O intervalo de pelo menos 4 semanas da primeira dose garante imunogenicidade ótima.',
    ageMonths: 4,
    ageLabel: '4 months',
    ageLabelPt: '4 meses',
    group: '4m',
    doses: 3,
    doseNumber: 2,
    dependsOn: ['penta-1'],
    category: 'mandatory',
    sideEffects: [
      'Fever (38–39°C) – may be slightly higher than 1st dose reaction',
      'Irritability and persistent crying',
      'Swelling and induration at injection site (may be larger than 1st dose)',
      'Decreased appetite for 1–2 days',
      'Drowsiness or restless sleep',
      'Mild vomiting (uncommon)',
      'Hypotonic-hyporesponsive episode (rare)',
    ],
    sideEffectsPt: [
      'Febre (38–39°C) – pode ser ligeiramente mais alta que a reação da 1ª dose',
      'Irritabilidade e choro persistente',
      'Inchaço e endurecimento no local da injeção (pode ser maior que na 1ª dose)',
      'Diminuição do apetite por 1–2 dias',
      'Sonolência ou sono inquieto',
      'Vômito leve (incomum)',
      'Episódio hipotônico-hiporresponsivo (raro)',
    ],
    benefits: [
      'Boosts primary immune response against all 5 antigens',
      'Builds toward protective antibody levels',
      'Maintains continuity of the immunization schedule',
      'Reduces vulnerability window between doses',
      'Essential for complete protection against pertussis in young infants',
    ],
    benefitsPt: [
      'Reforça resposta imune primária contra todos os 5 antígenos',
      'Constrói em direção a níveis protetores de anticorpos',
      'Mantém continuidade do calendário de imunização',
      'Reduz janela de vulnerabilidade entre doses',
      'Essencial para proteção completa contra coqueluche em bebês pequenos',
    ],
    detailedInfo: {
      mechanism:
        'Same formulation as dose 1. Second exposure amplifies the primary immune response, increasing antibody titers and expanding the population of memory B and T cells for each of the five antigens.',
      mechanismPt:
        'Mesma formulação da dose 1. Segunda exposição amplifica a resposta imune primária, aumentando títulos de anticorpos e expandindo a população de células B e T de memória para cada um dos cinco antígenos.',
      composition:
        'Identical to pentavalent dose 1: DTP-HepB-Hib combination with aluminum phosphate adjuvant.',
      compositionPt:
        'Idêntica à dose 1 da pentavalente: combinação DTP-HepB-Hib com adjuvante de fosfato de alumínio.',
      contraindications: [
        'Severe allergic reaction to dose 1 or any component',
        'Encephalopathy within 7 days of dose 1',
        'Progressive neurological disorder',
      ],
      contraindicationsPt: [
        'Reação alérgica grave à dose 1 ou qualquer componente',
        'Encefalopatia dentro de 7 dias da dose 1',
        'Distúrbio neurológico progressivo',
      ],
      storage: 'Store at +2°C to +8°C. Do NOT freeze. Shake well before use.',
      storagePt: 'Armazenar a +2°C a +8°C. NÃO congelar. Agitar bem antes do uso.',
    },
  },
  {
    id: 'ipv-2',
    name: 'Polio (IPV) – 2nd dose',
    namePt: 'Polio (VIP) – 2ª dose',
    nameEn: 'Polio (IPV) – 2nd dose',
    description:
      'Second dose of the inactivated polio vaccine, given at 4 months. This dose significantly boosts neutralizing antibody titers against all three poliovirus serotypes. After two doses of IPV, seroconversion rates typically exceed 95% for all serotypes.',
    descriptionPt:
      'Segunda dose da vacina inativada contra poliomielite, dada aos 4 meses. Esta dose aumenta significativamente os títulos de anticorpos neutralizantes contra os três sorotipos de poliovírus. Após duas doses de VIP, as taxas de soroconversão tipicamente excedem 95% para todos os sorotipos.',
    ageMonths: 4,
    ageLabel: '4 months',
    ageLabelPt: '4 meses',
    group: '4m',
    doses: 3,
    doseNumber: 2,
    dependsOn: ['ipv-1'],
    category: 'mandatory',
    sideEffects: [
      'Mild pain at injection site',
      'Low-grade fever (37.5–38°C)',
      'Localized swelling',
      'Irritability',
      'Temporary loss of appetite',
      'Drowsiness',
    ],
    sideEffectsPt: [
      'Dor leve no local da injeção',
      'Febre baixa (37,5–38°C)',
      'Inchaço localizado',
      'Irritabilidade',
      'Perda temporária de apetite',
      'Sonolência',
    ],
    benefits: [
      'Strengthens immunity against all three poliovirus types',
      'Seroconversion exceeds 95% after second dose',
      'Critical step toward complete polio protection',
      'Contributes to global polio eradication effort',
      'Safe for all infants including immunocompromised',
    ],
    benefitsPt: [
      'Fortalece imunidade contra os três tipos de poliovírus',
      'Soroconversão excede 95% após segunda dose',
      'Etapa crítica para proteção completa contra pólio',
      'Contribui para o esforço global de erradicação da pólio',
      'Segura para todos os bebês incluindo imunocomprometidos',
    ],
    detailedInfo: {
      mechanism:
        'Boosters the primary response to inactivated poliovirus types 1, 2, and 3. Enhances neutralizing antibody titers and primes mucosal immunity when combined with OPV campaigns.',
      mechanismPt:
        'Reforça a resposta primária ao poliovírus inativado tipos 1, 2 e 3. Aumenta títulos de anticorpos neutralizantes e prepara imunidade mucosal quando combinada com campanhas de VOP.',
      composition: 'Same as IPV dose 1: inactivated poliovirus types 1, 2, and 3 with aluminum hydroxide adjuvant.',
      compositionPt: 'Mesma que VIP dose 1: poliovírus inativado tipos 1, 2 e 3 com adjuvante de hidróxido de alumínio.',
      contraindications: [
        'Severe allergic reaction to previous IPV dose',
        'Known hypersensitivity to neomycin, streptomycin, or polymyxin B',
      ],
      contraindicationsPt: [
        'Reação alérgica grave à dose anterior de VIP',
        'Hipersensibilidade conhecida à neomicina, estreptomicina ou polimixina B',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },
  {
    id: 'rota-2',
    name: 'Rotavirus – 2nd dose',
    namePt: 'Rotavírus – 2ª dose',
    nameEn: 'Rotavirus – 2nd dose',
    description:
      'The second and final dose of the rotavirus oral vaccine (Rotarix 2-dose schedule). This dose completes the primary series and provides maximum protection. WHO guidelines specify that this dose should be given by 24 weeks of age at the latest.',
    descriptionPt:
      'A segunda e última dose da vacina oral contra rotavírus (esquema de 2 doses Rotarix). Esta dose completa a série primária e fornece proteção máxima. As diretrizes da OMS especificam que esta dose deve ser dada até 24 semanas de idade no máximo.',
    ageMonths: 4,
    ageLabel: '4 months',
    ageLabelPt: '4 meses',
    group: '4m',
    doses: 2,
    doseNumber: 2,
    dependsOn: ['rota-1'],
    category: 'mandatory',
    sideEffects: [
      'Mild transient diarrhea',
      'Irritability and fussiness',
      'Flatulence',
      'Mild vomiting (if dose is vomited within 10 min, no redosing per WHO)',
      'Low-grade fever',
      'Abdominal discomfort',
      'Intussusception (very rare, primarily within 7 days post-vaccination)',
    ],
    sideEffectsPt: [
      'Diarreia leve e transitória',
      'Irritabilidade e agitação',
      'Flatulência',
      'Vômito leve (se dose for vomitada dentro de 10 min, sem redose conforme OMS)',
      'Febre baixa',
      'Desconforto abdominal',
      'Intussuscepção (muito raro, principalmente dentro de 7 dias pós-vacinação)',
    ],
    benefits: [
      'Completes rotavirus protection with maximum efficacy',
      'Provides 85–100% protection against severe rotavirus gastroenteritis',
      'Prevents life-threatening dehydration episodes',
      'Reduces childhood diarrhea mortality significantly',
      'No additional injections – oral administration',
      'Herd protection to younger unvaccinated siblings',
    ],
    benefitsPt: [
      'Completa proteção contra rotavírus com eficácia máxima',
      'Fornece 85–100% de proteção contra gastroenterite grave por rotavírus',
      'Previne episódios de desidratação potencialmente fatais',
      'Reduz mortalidade por diarreia infantil significativamente',
      'Sem injeções adicionais – administração oral',
      'Proteção coletiva para irmãos mais novos não vacinados',
    ],
    detailedInfo: {
      mechanism:
        'Same as dose 1. Second oral dose maximizes mucosal IgA response in the gut and systemic IgG, providing robust protection against multiple rotavirus strains through cross-reactive immunity.',
      mechanismPt:
        'Mesma da dose 1. Segunda dose oral maximiza resposta IgA mucosal no intestino e IgG sistêmico, fornecendo proteção robusta contra múltiplas cepas de rotavírus através de imunidade cruzada.',
      composition: 'Same as Rotarix dose 1: live attenuated human rotavirus strain RIX4414 (G1P[8]).',
      compositionPt: 'Mesma que Rotarix dose 1: cepa de rotavírus humano vivo atenuado RIX4414 (G1P[8]).',
      contraindications: [
        'History of intussusception',
        'Severe combined immunodeficiency (SCID)',
        'Severe allergic reaction to dose 1',
      ],
      contraindicationsPt: [
        'Histórico de intussuscepção',
        'Imunodeficiência combinada grave (SCID)',
        'Reação alérgica grave à dose 1',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze. Administer promptly after preparation.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar. Administrar prontamente após preparação.',
    },
  },
  {
    id: 'pneumo-2',
    name: 'Pneumococcal – 2nd dose',
    namePt: 'Pneumocócica – 2ª dose',
    nameEn: 'Pneumococcal – 2nd dose',
    description:
      'The second dose of pneumococcal conjugate vaccine strengthens immunity against Streptococcus pneumoniae. In the WHO-recommended 3-dose (3p+0) schedule used in many African countries, this is a critical primary series dose. It significantly boosts serotype-specific antibody concentrations.',
    descriptionPt:
      'A segunda dose da vacina pneumocócica conjugada fortalece a imunidade contra Streptococcus pneumoniae. No esquema de 3 doses (3p+0) recomendado pela OMS usado em muitos países africanos, esta é uma dose crítica da série primária. Aumenta significativamente as concentrações de anticorpos sorotipo-específicos.',
    ageMonths: 4,
    ageLabel: '4 months',
    ageLabelPt: '4 meses',
    group: '4m',
    doses: 3,
    doseNumber: 2,
    dependsOn: ['pneumo-1'],
    category: 'mandatory',
    sideEffects: [
      'Fever ≥38°C',
      'Injection site reactions (pain, swelling, redness)',
      'Decreased appetite',
      'Irritability and restlessness',
      'Sleepiness',
      'Diarrhea or vomiting (uncommon)',
    ],
    sideEffectsPt: [
      'Febre ≥38°C',
      'Reações no local da injeção (dor, inchaço, vermelhidão)',
      'Diminuição do apetite',
      'Irritabilidade e inquietação',
      'Sonolência',
      'Diarreia ou vômito (incomum)',
    ],
    benefits: [
      'Enhanced protection against pneumococcal pneumonia and meningitis',
      'Builds stronger serotype-specific immune response',
      'Further reduces risk of invasive pneumococcal disease',
      'Maintains protection continuity during vulnerable early months',
      'Contributes to herd immunity in the community',
    ],
    benefitsPt: [
      'Proteção aprimorada contra pneumonia e meningite pneumocócica',
      'Constrói resposta imune sorotipo-específica mais forte',
      'Reduz ainda mais risco de doença pneumocócica invasiva',
      'Mantém continuidade de proteção durante os meses vulneráveis iniciais',
      'Contribui para imunidade coletiva na comunidade',
    ],
    detailedInfo: {
      mechanism:
        'Second exposure to PCV antigens amplifies antibody production and expands memory B-cell populations for each of the included serotypes.',
      mechanismPt:
        'Segunda exposição aos antígenos da VPC amplifica produção de anticorpos e expande populações de células B de memória para cada sorotipo incluído.',
      composition: 'Same as PCV dose 1.',
      compositionPt: 'Mesma que VPC dose 1.',
      contraindications: [
        'Severe allergic reaction to PCV dose 1',
        'Known hypersensitivity to any component',
      ],
      contraindicationsPt: [
        'Reação alérgica grave à VPC dose 1',
        'Hipersensibilidade conhecida a qualquer componente',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // ============================================================
  // 5 MONTHS
  // ============================================================
  {
    id: 'meningo-2',
    name: 'Meningococcal – 2nd dose',
    namePt: 'Meningocócica – 2ª dose',
    nameEn: 'Meningococcal – 2nd dose',
    description:
      'Second dose of meningococcal conjugate vaccine, given 2 months after the first dose. This dose is essential for strengthening the immune response, especially in infants whose immune systems require multiple exposures to develop lasting protection against Neisseria meningitidis.',
    descriptionPt:
      'Segunda dose da vacina meningocócica conjugada, dada 2 meses após a primeira dose. Esta dose é essencial para fortalecer a resposta imune, especialmente em bebês cujos sistemas imunológicos requerem múltiplas exposições para desenvolver proteção duradoura contra Neisseria meningitidis.',
    ageMonths: 5,
    ageLabel: '5 months',
    ageLabelPt: '5 meses',
    group: '5m',
    doses: 3,
    doseNumber: 2,
    dependsOn: ['meningo-1'],
    category: 'mandatory',
    sideEffects: [
      'Fever (38–39°C)',
      'Headache and malaise',
      'Fatigue',
      'Injection site pain and swelling',
      'Irritability',
      'Nausea (uncommon)',
      'Myalgia (rare)',
    ],
    sideEffectsPt: [
      'Febre (38–39°C)',
      'Dor de cabeça e mal-estar',
      'Fadiga',
      'Dor e inchaço no local da injeção',
      'Irritabilidade',
      'Náusea (incomum)',
      'Mialgia (raro)',
    ],
    benefits: [
      'Boosted immunity against meningococcal disease',
      'Extended duration of protection',
      'Reduces risk of meningococcal epidemics in the community',
      'Critical in the African meningitis belt',
      'Prevents potentially lethal septicemia',
    ],
    benefitsPt: [
      'Imunidade reforçada contra doença meningocócica',
      'Duração estendida de proteção',
      'Reduz risco de epidemias meningocócicas na comunidade',
      'Crítica no cinturão da meningite africana',
      'Previne septicemia potencialmente letal',
    ],
    detailedInfo: {
      mechanism: 'Same conjugate vaccine as dose 1. Second dose amplifies the T-cell-dependent immune response and strengthens immunological memory.',
      mechanismPt: 'Mesma vacina conjugada da dose 1. Segunda dose amplifica a resposta imune T-dependente e fortalece a memória imunológica.',
      composition: 'Same as meningococcal dose 1.',
      compositionPt: 'Mesma que dose 1 meningocócica.',
      contraindications: [
        'Severe reaction to meningococcal dose 1',
        'Moderate to severe acute illness',
      ],
      contraindicationsPt: [
        'Reação grave à dose 1 meningocócica',
        'Doença aguda moderada a grave',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // ============================================================
  // 6 MONTHS
  // ============================================================
  {
    id: 'penta-3',
    name: 'Pentavalent – 3rd dose',
    namePt: 'Pentavalente – 3ª dose',
    nameEn: 'Pentavalent – 3rd dose',
    description:
      'Third and final dose of the pentavalent vaccine, completing the primary immunization series against diphtheria, tetanus, pertussis, hepatitis B, and Hib. After this dose, the child achieves full primary immunity with antibody levels above the protective threshold for all five antigens.',
    descriptionPt:
      'Terceira e última dose da vacina pentavalente, completando a série primária de imunização contra difteria, tétano, coqueluche, hepatite B e Hib. Após esta dose, a criança atinge imunidade primária completa com níveis de anticorpos acima do limiar protetor para os cinco antígenos.',
    ageMonths: 6,
    ageLabel: '6 months',
    ageLabelPt: '6 meses',
    group: '6m',
    doses: 3,
    doseNumber: 3,
    dependsOn: ['penta-2'],
    category: 'mandatory',
    sideEffects: [
      'Fever (38–39°C) within 24–48 hours',
      'Irritability and prolonged crying',
      'Injection site swelling, redness, and pain (may persist 2–3 days)',
      'Loss of appetite',
      'Drowsiness',
      'Mild vomiting',
      'Extensive limb swelling (rare, more common with booster doses)',
    ],
    sideEffectsPt: [
      'Febre (38–39°C) dentro de 24–48 horas',
      'Irritabilidade e choro prolongado',
      'Inchaço, vermelhidão e dor no local da injeção (pode persistir 2–3 dias)',
      'Perda de apetite',
      'Sonolência',
      'Vômito leve',
      'Inchaço extenso do membro (raro, mais comum com doses de reforço)',
    ],
    benefits: [
      'Completes primary immunization against 5 diseases',
      'Achieves full protective antibody levels',
      'Provides long-lasting immunity with booster dose at 18 months',
      'Dramatically reduces infant mortality from DTP-preventable diseases',
      'Completes hepatitis B series (with birth dose and dose at 2 months)',
      'Hib protection prevents bacterial meningitis and epiglottitis',
    ],
    benefitsPt: [
      'Completa imunização primária contra 5 doenças',
      'Atinge níveis protetores completos de anticorpos',
      'Fornece imunidade duradoura com dose de reforço aos 18 meses',
      'Reduz drasticamente mortalidade infantil por doenças preveníveis por DTP',
      'Completa série de hepatite B (com dose de nascimento e dose aos 2 meses)',
      'Proteção contra Hib previne meningite bacteriana e epiglotite',
    ],
    detailedInfo: {
      mechanism: 'Final primary dose. Maximizes antibody titers and establishes robust immunological memory against all five antigens for long-term protection.',
      mechanismPt: 'Última dose primária. Maximiza títulos de anticorpos e estabelece memória imunológica robusta contra os cinco antígenos para proteção de longo prazo.',
      composition: 'Same as pentavalent dose 1 and 2.',
      compositionPt: 'Mesma que doses 1 e 2 da pentavalente.',
      contraindications: [
        'Severe allergic reaction to previous pentavalent doses',
        'Encephalopathy after prior pertussis-containing vaccine',
        'Progressive neurological disorder',
      ],
      contraindicationsPt: [
        'Reação alérgica grave às doses anteriores de pentavalente',
        'Encefalopatia após vacina anterior contendo coqueluche',
        'Distúrbio neurológico progressivo',
      ],
      storage: 'Store at +2°C to +8°C. Do NOT freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. NÃO congelar.',
    },
  },
  {
    id: 'ipv-3',
    name: 'Polio (IPV) – 3rd dose',
    namePt: 'Polio (VIP) – 3ª dose',
    nameEn: 'Polio (IPV) – 3rd dose',
    description:
      'Third and final primary dose of IPV, completing the polio immunization series. After three doses, seroconversion rates reach 99–100% against all three poliovirus serotypes. This dose is essential for lifelong protection against paralytic poliomyelitis.',
    descriptionPt:
      'Terceira e última dose primária de VIP, completando a série de imunização contra pólio. Após três doses, as taxas de soroconversão atingem 99–100% contra os três sorotipos de poliovírus. Esta dose é essencial para proteção vitalícia contra poliomielite paralítica.',
    ageMonths: 6,
    ageLabel: '6 months',
    ageLabelPt: '6 meses',
    group: '6m',
    doses: 3,
    doseNumber: 3,
    dependsOn: ['ipv-2'],
    category: 'mandatory',
    sideEffects: [
      'Mild pain at injection site',
      'Low-grade fever',
      'Localized swelling and redness',
      'Irritability',
      'Drowsiness',
      'Mild gastrointestinal upset (rare)',
    ],
    sideEffectsPt: [
      'Dor leve no local da injeção',
      'Febre baixa',
      'Inchaço localizado e vermelhidão',
      'Irritabilidade',
      'Sonolência',
      'Desconforto gastrointestinal leve (raro)',
    ],
    benefits: [
      'Complete protection against all 3 poliovirus serotypes',
      '99–100% seroconversion – near-perfect immunity',
      'Critical for maintaining polio-free status',
      'Prevents vaccine-derived poliovirus circulation',
      'Essential contribution to global polio eradication',
      'Lifelong immunity with potential booster if needed',
    ],
    benefitsPt: [
      'Proteção completa contra os 3 sorotipos de poliovírus',
      '99–100% de soroconversão – imunidade quase perfeita',
      'Crítica para manter status livre de pólio',
      'Previne circulação de poliovírus derivado de vacina',
      'Contribuição essencial para erradicação global da pólio',
      'Imunidade vitalícia com potencial reforço se necessário',
    ],
    detailedInfo: {
      mechanism: 'Final primary dose maximizes and consolidates neutralizing antibody titers against poliovirus types 1, 2, and 3, establishing long-term immunological memory.',
      mechanismPt: 'Última dose primária maximiza e consolida títulos de anticorpos neutralizantes contra poliovírus tipos 1, 2 e 3, estabelecendo memória imunológica de longo prazo.',
      composition: 'Same as IPV doses 1 and 2.',
      compositionPt: 'Mesma que VIP doses 1 e 2.',
      contraindications: [
        'Severe allergic reaction to previous IPV doses',
        'Known allergy to neomycin, streptomycin, or polymyxin B',
      ],
      contraindicationsPt: [
        'Reação alérgica grave às doses anteriores de VIP',
        'Alergia conhecida à neomicina, estreptomicina ou polimixina B',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },
  {
    id: 'hepb-3',
    name: 'Hepatitis B – 3rd dose',
    namePt: 'Hepatite B – 3ª dose',
    nameEn: 'Hepatitis B – 3rd dose',
    description:
      'Third and final dose of the hepatitis B series. This dose completes the immunization schedule and provides long-term, often lifelong, protection. After three doses, over 95% of healthy infants develop protective anti-HBs antibody levels (≥10 mIU/mL).',
    descriptionPt:
      'Terceira e última dose da série de hepatite B. Esta dose completa o calendário de imunização e fornece proteção de longo prazo, frequentemente vitalícia. Após três doses, mais de 95% dos bebês saudáveis desenvolvem níveis protetores de anticorpos anti-HBs (≥10 mIU/mL).',
    ageMonths: 6,
    ageLabel: '6 months',
    ageLabelPt: '6 meses',
    group: '6m',
    doses: 3,
    doseNumber: 3,
    dependsOn: ['hepb-2'],
    category: 'mandatory',
    sideEffects: [
      'Soreness at injection site',
      'Low-grade fever',
      'Mild fatigue',
      'Headache (in older infants)',
      'Irritability',
      'Temporary reduced appetite',
    ],
    sideEffectsPt: [
      'Dor no local da injeção',
      'Febre baixa',
      'Fadiga leve',
      'Dor de cabeça (em bebês mais velhos)',
      'Irritabilidade',
      'Apetite temporariamente reduzido',
    ],
    benefits: [
      'Completes hepatitis B immunization – 95%+ seroprotection rate',
      'Provides lifelong protection against chronic HBV infection',
      'Prevents cirrhosis and hepatocellular carcinoma',
      'Critical public health impact – reduces HBV prevalence in population',
      'Anamnestic response persists even if antibody levels decline over time',
      'Part of WHO strategy to eliminate hepatitis B as a public health threat',
    ],
    benefitsPt: [
      'Completa imunização contra hepatite B – taxa de soroproteção de 95%+',
      'Fornece proteção vitalícia contra infecção crônica por VHB',
      'Previne cirrose e carcinoma hepatocelular',
      'Impacto crítico de saúde pública – reduz prevalência de VHB na população',
      'Resposta anamnéstica persiste mesmo se níveis de anticorpos diminuírem ao longo do tempo',
      'Parte da estratégia da OMS para eliminar hepatite B como ameaça à saúde pública',
    ],
    detailedInfo: {
      mechanism: 'Final dose of recombinant HBsAg. Maximizes anti-HBs antibody titers and establishes durable immunological memory capable of rapid anamnestic responses upon future HBV exposure.',
      mechanismPt: 'Última dose de HBsAg recombinante. Maximiza títulos de anticorpos anti-HBs e estabelece memória imunológica durável capaz de respostas anamnésticas rápidas em exposição futura ao VHB.',
      composition: 'Same as hepatitis B doses 1 and 2.',
      compositionPt: 'Mesma que doses 1 e 2 de hepatite B.',
      contraindications: [
        'Severe allergic reaction to previous hepatitis B vaccine doses',
        'Known hypersensitivity to yeast',
      ],
      contraindicationsPt: [
        'Reação alérgica grave às doses anteriores da vacina contra hepatite B',
        'Hipersensibilidade conhecida a levedura',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // ============================================================
  // 9 MONTHS
  // ============================================================
  {
    id: 'yellow-fever',
    name: 'Yellow Fever',
    namePt: 'Febre Amarela',
    nameEn: 'Yellow Fever',
    description:
      'The yellow fever vaccine is a live attenuated vaccine that provides protection against yellow fever virus, a mosquito-borne flavivirus causing hemorrhagic fever with up to 50% case fatality in severe cases. Angola is an endemic country, and a single dose provides lifelong immunity per WHO position (2013 revision). International travel to/from Angola requires proof of vaccination.',
    descriptionPt:
      'A vacina contra febre amarela é uma vacina viva atenuada que fornece proteção contra o vírus da febre amarela, um flavivírus transmitido por mosquitos que causa febre hemorrágica com até 50% de letalidade em casos graves. Angola é um país endêmico, e uma dose única fornece imunidade vitalícia conforme posição da OMS (revisão de 2013). Viagem internacional para/de Angola requer comprovante de vacinação.',
    ageMonths: 9,
    ageLabel: '9 months',
    ageLabelPt: '9 meses',
    group: '9m',
    doses: 1,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Low-grade fever (up to 25% of recipients)',
      'Headache and myalgia lasting 1–3 days',
      'Injection site pain and soreness',
      'Mild fatigue and malaise',
      'Nausea or abdominal discomfort (uncommon)',
      'Yellow fever vaccine-associated neurotropic disease – YEL-AND (very rare, ~0.4–0.8 per 100,000)',
      'Yellow fever vaccine-associated viscerotropic disease – YEL-AVD (very rare, ~0.3–0.4 per 100,000)',
      'Anaphylaxis in individuals allergic to egg protein (very rare)',
    ],
    sideEffectsPt: [
      'Febre baixa (até 25% dos vacinados)',
      'Dor de cabeça e mialgia durando 1–3 dias',
      'Dor e sensibilidade no local da injeção',
      'Fadiga leve e mal-estar',
      'Náusea ou desconforto abdominal (incomum)',
      'Doença neurotrópica associada à vacina contra febre amarela – YEL-AND (muito raro, ~0,4–0,8 por 100.000)',
      'Doença viscerotrópica associada à vacina contra febre amarela – YEL-AVD (muito raro, ~0,3–0,4 por 100.000)',
      'Anafilaxia em indivíduos alérgicos à proteína do ovo (muito raro)',
    ],
    benefits: [
      'Single dose provides lifelong immunity (WHO position since 2013)',
      'Prevents yellow fever – a disease with up to 50% mortality in severe cases',
      'Essential in Angola and other endemic African countries',
      'Required for international travel (International Health Regulations)',
      'Immunity develops within 10 days in 95% of vaccinees',
      'Prevents devastating outbreaks (Angola experienced a major outbreak in 2016)',
      'Contributes to herd immunity and epidemic prevention',
    ],
    benefitsPt: [
      'Dose única fornece imunidade vitalícia (posição da OMS desde 2013)',
      'Previne febre amarela – doença com até 50% de mortalidade em casos graves',
      'Essencial em Angola e outros países africanos endêmicos',
      'Exigida para viagens internacionais (Regulamento Sanitário Internacional)',
      'Imunidade se desenvolve em 10 dias em 95% dos vacinados',
      'Previne surtos devastadores (Angola vivenciou um grande surto em 2016)',
      'Contribui para imunidade coletiva e prevenção de epidemias',
    ],
    detailedInfo: {
      mechanism:
        'Live attenuated vaccine using the 17D strain of yellow fever virus. Replicates in host cells and induces both humoral (neutralizing IgM and IgG antibodies) and cellular (CD4+ and CD8+ T-cell) immune responses. Provides robust and durable immunity.',
      mechanismPt:
        'Vacina viva atenuada usando a cepa 17D do vírus da febre amarela. Replica-se nas células do hospedeiro e induz respostas imunes humorais (anticorpos neutralizantes IgM e IgG) e celulares (células T CD4+ e CD8+). Fornece imunidade robusta e durável.',
      composition:
        'Live attenuated 17D-204 or 17DD strain of yellow fever virus, propagated in embryonated chicken eggs. Reconstituted with sterile saline. May contain sorbitol, gelatin, and trace amounts of egg protein.',
      compositionPt:
        'Cepa 17D-204 ou 17DD viva atenuada do vírus da febre amarela, propagada em ovos embrionados de galinha. Reconstituída com solução salina estéril. Pode conter sorbitol, gelatina e vestígios de proteína do ovo.',
      contraindications: [
        'Infants under 6 months of age',
        'Severe egg allergy (anaphylaxis)',
        'Severe immunodeficiency (symptomatic HIV, thymus disorders)',
        'History of thymus disease (thymoma, thymectomy)',
        'Pregnant women (relative contraindication – risk-benefit assessment)',
        'Currently on immunosuppressive therapy',
      ],
      contraindicationsPt: [
        'Bebês com menos de 6 meses de idade',
        'Alergia grave a ovo (anafilaxia)',
        'Imunodeficiência grave (HIV sintomático, distúrbios do timo)',
        'Histórico de doença do timo (timoma, timectomia)',
        'Mulheres grávidas (contraindicação relativa – avaliação risco-benefício)',
        'Atualmente em terapia imunossupressora',
      ],
      storage: 'Store lyophilized vaccine at +2°C to +8°C. Protect from light. Once reconstituted, use within 1 hour. Discard any unused reconstituted vaccine.',
      storagePt: 'Armazenar vacina liofilizada a +2°C a +8°C. Proteger da luz. Após reconstituição, usar dentro de 1 hora. Descartar qualquer vacina reconstituída não utilizada.',
    },
  },

  // ============================================================
  // 12 MONTHS
  // ============================================================
  {
    id: 'meningo-3',
    name: 'Meningococcal – 3rd dose',
    namePt: 'Meningocócica – 3ª dose',
    nameEn: 'Meningococcal – 3rd dose',
    description:
      'Third and final dose (booster) of the meningococcal conjugate vaccine, given at 12 months. This booster dose is critical for establishing long-term immunological memory and maintaining protective antibody levels into early childhood and beyond.',
    descriptionPt:
      'Terceira e última dose (reforço) da vacina meningocócica conjugada, dada aos 12 meses. Esta dose de reforço é crítica para estabelecer memória imunológica de longo prazo e manter níveis protetores de anticorpos durante a primeira infância e além.',
    ageMonths: 12,
    ageLabel: '12 months',
    ageLabelPt: '12 meses',
    group: '12m',
    doses: 3,
    doseNumber: 3,
    dependsOn: ['meningo-2'],
    category: 'mandatory',
    sideEffects: [
      'Fever (38–39°C)',
      'Headache',
      'Fatigue and drowsiness',
      'Injection site pain, swelling, and redness',
      'Irritability and crying',
      'Nausea (uncommon)',
      'Arthralgia (rare in infants)',
    ],
    sideEffectsPt: [
      'Febre (38–39°C)',
      'Dor de cabeça',
      'Fadiga e sonolência',
      'Dor, inchaço e vermelhidão no local da injeção',
      'Irritabilidade e choro',
      'Náusea (incomum)',
      'Artralgia (raro em bebês)',
    ],
    benefits: [
      'Full meningococcal protection with long-term memory',
      'Critical for toddlers entering daycare and social settings',
      'Prevents meningococcal meningitis and sepsis',
      'Protects against devastating neurological sequelae',
      'Maintains community herd immunity',
      'Essential in the African meningitis belt',
    ],
    benefitsPt: [
      'Proteção meningocócica completa com memória de longo prazo',
      'Crítica para crianças entrando em creches e ambientes sociais',
      'Previne meningite e sepse meningocócica',
      'Protege contra sequelas neurológicas devastadoras',
      'Mantém imunidade coletiva na comunidade',
      'Essencial no cinturão da meningite africana',
    ],
    detailedInfo: {
      mechanism: 'Booster dose reactivates memory B-cells established by the primary series, producing a rapid and robust anamnestic antibody response with higher and more durable antibody titers.',
      mechanismPt: 'Dose de reforço reativa células B de memória estabelecidas pela série primária, produzindo resposta anamnéstica rápida e robusta de anticorpos com títulos mais altos e duráveis.',
      composition: 'Same as meningococcal doses 1 and 2.',
      compositionPt: 'Mesma que doses 1 e 2 meningocócicas.',
      contraindications: [
        'Severe allergic reaction to previous meningococcal doses',
        'Moderate to severe acute illness',
      ],
      contraindicationsPt: [
        'Reação alérgica grave às doses anteriores meningocócicas',
        'Doença aguda moderada a grave',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },
  {
    id: 'mmr-1',
    name: 'MMR – 1st dose',
    namePt: 'Tríplice Viral – 1ª dose',
    nameEn: 'MMR – 1st dose',
    description:
      'The MMR vaccine protects against measles, mumps, and rubella – three highly contagious viral diseases. Measles alone kills over 100,000 children annually worldwide. The first dose at 12 months is approximately 93% effective against measles, 78% against mumps, and 97% against rubella. A second dose boosts efficacy to 97%+ for measles.',
    descriptionPt:
      'A vacina tríplice viral protege contra sarampo, caxumba e rubéola – três doenças virais altamente contagiosas. Somente o sarampo mata mais de 100.000 crianças anualmente no mundo. A primeira dose aos 12 meses é aproximadamente 93% eficaz contra sarampo, 78% contra caxumba e 97% contra rubéola. Uma segunda dose aumenta a eficácia para 97%+ contra sarampo.',
    ageMonths: 12,
    ageLabel: '12 months',
    ageLabelPt: '12 meses',
    group: '12m',
    doses: 2,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Fever ≥39°C occurring 7–12 days after vaccination (5–15%)',
      'Mild measles-like rash 7–10 days post-vaccination (5%)',
      'Transient swollen parotid glands (mumps component, rare)',
      'Joint pain or stiffness, especially in adult women (rubella component)',
      'Febrile seizures (1 per 3,000 doses)',
      'Temporary thrombocytopenia (1 per 25,000 doses, self-resolving)',
      'Lymphadenopathy (swollen lymph nodes)',
      'Anaphylaxis (1 per 1 million doses)',
    ],
    sideEffectsPt: [
      'Febre ≥39°C ocorrendo 7–12 dias após vacinação (5–15%)',
      'Erupção leve semelhante ao sarampo 7–10 dias pós-vacinação (5%)',
      'Inchaço transitório das glândulas parótidas (componente de caxumba, raro)',
      'Dor ou rigidez articular, especialmente em mulheres adultas (componente rubéola)',
      'Convulsões febris (1 por 3.000 doses)',
      'Trombocitopenia temporária (1 por 25.000 doses, autolimitada)',
      'Linfadenopatia (gânglios linfáticos inchados)',
      'Anafilaxia (1 por 1 milhão de doses)',
    ],
    benefits: [
      'Prevents measles – one of the most contagious diseases known (R₀ = 12–18)',
      'Prevents mumps and its complications (orchitis, deafness, meningitis)',
      'Prevents congenital rubella syndrome – a devastating cause of birth defects',
      '93% efficacy against measles after first dose',
      'Three diseases prevented with a single injection',
      'Critical for preventing outbreaks in schools and communities',
      'Measles vaccination has saved an estimated 56 million lives since 2000 (WHO)',
    ],
    benefitsPt: [
      'Previne sarampo – uma das doenças mais contagiosas conhecidas (R₀ = 12–18)',
      'Previne caxumba e suas complicações (orquite, surdez, meningite)',
      'Previne síndrome da rubéola congênita – causa devastadora de defeitos congênitos',
      '93% de eficácia contra sarampo após primeira dose',
      'Três doenças prevenidas com uma única injeção',
      'Crítica para prevenir surtos em escolas e comunidades',
      'Vacinação contra sarampo salvou estimados 56 milhões de vidas desde 2000 (OMS)',
    ],
    detailedInfo: {
      mechanism:
        'Live attenuated vaccine containing weakened strains of measles (Edmonston-Enders or Schwarz), mumps (Jeryl Lynn or Leningrad-Zagreb), and rubella (RA 27/3) viruses. Each component replicates and stimulates both humoral and cell-mediated immune responses.',
      mechanismPt:
        'Vacina viva atenuada contendo cepas enfraquecidas de sarampo (Edmonston-Enders ou Schwarz), caxumba (Jeryl Lynn ou Leningrad-Zagreb) e rubéola (RA 27/3). Cada componente se replica e estimula respostas imunes humorais e mediadas por células.',
      composition:
        'Live attenuated measles virus (≥1,000 CCID₅₀), mumps virus (≥5,000 CCID₅₀), rubella virus (≥1,000 CCID₅₀). Grown in chick embryo fibroblast cells (measles/mumps) and human diploid cells (rubella). Contains neomycin, sorbitol, gelatin.',
      compositionPt:
        'Vírus vivo atenuado do sarampo (≥1.000 CCID₅₀), vírus da caxumba (≥5.000 CCID₅₀), vírus da rubéola (≥1.000 CCID₅₀). Cultivados em células fibroblásticas de embrião de galinha (sarampo/caxumba) e células diploides humanas (rubéola). Contém neomicina, sorbitol, gelatina.',
      contraindications: [
        'Pregnancy (defer vaccination for at least 4 weeks before conception)',
        'Severe immunodeficiency (AIDS, active leukemia, lymphoma)',
        'Known severe allergy to neomycin or gelatin',
        'Recent (within 11 months) receipt of blood products or immunoglobulins',
        'Active untreated tuberculosis',
        'History of anaphylaxis to a prior MMR dose',
      ],
      contraindicationsPt: [
        'Gravidez (adiar vacinação por pelo menos 4 semanas antes da concepção)',
        'Imunodeficiência grave (AIDS, leucemia ativa, linfoma)',
        'Alergia grave conhecida à neomicina ou gelatina',
        'Recebimento recente (dentro de 11 meses) de hemoderivados ou imunoglobulinas',
        'Tuberculose ativa não tratada',
        'Histórico de anafilaxia a uma dose anterior de tríplice viral',
      ],
      storage: 'Store lyophilized vaccine at +2°C to +8°C (can be frozen for long-term storage). Protect from light. Once reconstituted, use within 8 hours (refrigerated) or within 1 hour at room temperature.',
      storagePt: 'Armazenar vacina liofilizada a +2°C a +8°C (pode ser congelada para armazenamento de longo prazo). Proteger da luz. Após reconstituição, usar dentro de 8 horas (refrigerada) ou dentro de 1 hora à temperatura ambiente.',
    },
  },
  {
    id: 'hepa-1',
    name: 'Hepatitis A – 1st dose',
    namePt: 'Hepatite A – 1ª dose',
    nameEn: 'Hepatitis A – 1st dose',
    description:
      'The hepatitis A vaccine protects against HAV infection, a liver disease transmitted through contaminated food and water. In regions with intermediate to high endemicity, vaccination is critical. A single dose provides 95% protection within 2–4 weeks, and the 2-dose series ensures long-term immunity lasting 25+ years.',
    descriptionPt:
      'A vacina contra hepatite A protege contra infecção por HAV, uma doença hepática transmitida por alimentos e água contaminados. Em regiões com endemicidade intermediária a alta, a vacinação é crítica. Uma dose única fornece 95% de proteção em 2–4 semanas, e a série de 2 doses garante imunidade de longo prazo durando mais de 25 anos.',
    ageMonths: 12,
    ageLabel: '12 months',
    ageLabelPt: '12 meses',
    group: '12m',
    doses: 2,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Soreness and pain at injection site (50%)',
      'Headache (15%)',
      'Loss of appetite',
      'Fatigue and malaise',
      'Low-grade fever',
      'Irritability in young children',
      'Nausea (uncommon)',
      'Anaphylaxis (extremely rare)',
    ],
    sideEffectsPt: [
      'Dor e sensibilidade no local da injeção (50%)',
      'Dor de cabeça (15%)',
      'Perda de apetite',
      'Fadiga e mal-estar',
      'Febre baixa',
      'Irritabilidade em crianças pequenas',
      'Náusea (incomum)',
      'Anafilaxia (extremamente raro)',
    ],
    benefits: [
      'Prevents hepatitis A – a significant cause of acute liver failure',
      '95% seroprotection within 2–4 weeks of first dose',
      'Protects against foodborne and waterborne transmission',
      'Critical in areas with poor sanitation and water quality',
      'Prevents large-scale outbreaks in communities',
      'Part of WHO-recommended routine immunization in endemic areas',
    ],
    benefitsPt: [
      'Previne hepatite A – causa significativa de insuficiência hepática aguda',
      '95% de soroproteção dentro de 2–4 semanas da primeira dose',
      'Protege contra transmissão por alimentos e água',
      'Crítica em áreas com saneamento e qualidade de água precários',
      'Previne surtos em grande escala nas comunidades',
      'Parte da imunização de rotina recomendada pela OMS em áreas endêmicas',
    ],
    detailedInfo: {
      mechanism:
        'Inactivated (formalin-killed) hepatitis A virus vaccine. Induces anti-HAV IgG antibodies that provide neutralizing protection against the virus. One dose primes the immune system; the second dose establishes long-term immunological memory.',
      mechanismPt:
        'Vacina de vírus da hepatite A inativado (morto por formalina). Induz anticorpos IgG anti-HAV que fornecem proteção neutralizante contra o vírus. Uma dose prepara o sistema imunológico; a segunda dose estabelece memória imunológica de longo prazo.',
      composition:
        'Inactivated hepatitis A virus (HM175 or GBM strain, ≥720 ELISA units pediatric). Adjuvant: aluminum hydroxide. Preservative-free. May contain traces of formaldehyde and neomycin.',
      compositionPt:
        'Vírus da hepatite A inativado (cepa HM175 ou GBM, ≥720 unidades ELISA pediátricas). Adjuvante: hidróxido de alumínio. Sem conservante. Pode conter vestígios de formaldeído e neomicina.',
      contraindications: [
        'Severe allergic reaction to a previous dose or any component (including neomycin)',
        'Moderate to severe acute illness (defer until recovery)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma dose anterior ou qualquer componente (incluindo neomicina)',
        'Doença aguda moderada a grave (adiar até recuperação)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze – freezing destroys the vaccine. Protect from light.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar – congelamento destrói a vacina. Proteger da luz.',
    },
  },
  {
    id: 'pneumo-3',
    name: 'Pneumococcal – 3rd dose',
    namePt: 'Pneumocócica – 3ª dose',
    nameEn: 'Pneumococcal – 3rd dose',
    description:
      'Booster dose of the pneumococcal conjugate vaccine given at 12 months. In the 3p+0 schedule, this is the final primary dose. It consolidates protection and establishes long-term immunological memory against Streptococcus pneumoniae serotypes. This dose is associated with a strong anamnestic antibody response.',
    descriptionPt:
      'Dose de reforço da vacina pneumocócica conjugada dada aos 12 meses. No esquema 3p+0, esta é a última dose primária. Consolida a proteção e estabelece memória imunológica de longo prazo contra sorotipos de Streptococcus pneumoniae. Esta dose está associada a uma forte resposta anamnéstica de anticorpos.',
    ageMonths: 12,
    ageLabel: '12 months',
    ageLabelPt: '12 meses',
    group: '12m',
    doses: 3,
    doseNumber: 3,
    dependsOn: ['pneumo-2'],
    category: 'mandatory',
    sideEffects: [
      'Fever ≥38°C',
      'Injection site reactions',
      'Decreased appetite',
      'Sleepiness',
      'Irritability',
      'Diarrhea (uncommon)',
      'Rash (uncommon)',
    ],
    sideEffectsPt: [
      'Febre ≥38°C',
      'Reações no local da injeção',
      'Diminuição do apetite',
      'Sonolência',
      'Irritabilidade',
      'Diarreia (incomum)',
      'Erupção cutânea (incomum)',
    ],
    benefits: [
      'Long-term pneumonia protection through immunological memory',
      'Reduced ear infections (otitis media)',
      'Prevents invasive pneumococcal disease throughout childhood',
      'Reduces antibiotic use and antimicrobial resistance',
      'Provides herd protection for unvaccinated individuals',
      'Critical dose for establishing durable serotype-specific immunity',
    ],
    benefitsPt: [
      'Proteção de longo prazo contra pneumonia através de memória imunológica',
      'Redução de infecções de ouvido (otite média)',
      'Previne doença pneumocócica invasiva durante toda a infância',
      'Reduz uso de antibióticos e resistência antimicrobiana',
      'Fornece proteção coletiva para indivíduos não vacinados',
      'Dose crítica para estabelecer imunidade sorotipo-específica durável',
    ],
    detailedInfo: {
      mechanism: 'Booster dose reactivates memory B-cells from the primary series, producing a rapid, high-titer antibody response that provides durable protection against all included pneumococcal serotypes.',
      mechanismPt: 'Dose de reforço reativa células B de memória da série primária, produzindo resposta rápida de anticorpos em alto título que fornece proteção durável contra todos os sorotipos pneumocócicos incluídos.',
      composition: 'Same as PCV doses 1 and 2.',
      compositionPt: 'Mesma que VPC doses 1 e 2.',
      contraindications: [
        'Severe allergic reaction to previous PCV doses',
        'Moderate to severe acute illness',
      ],
      contraindicationsPt: [
        'Reação alérgica grave às doses anteriores de VPC',
        'Doença aguda moderada a grave',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },
  {
    id: 'varicella',
    name: 'Varicella (Chickenpox) – 1st dose',
    namePt: 'Varicela (Catapora) – 1ª dose',
    nameEn: 'Varicella (Chickenpox) – 1st dose',
    description:
      'The varicella vaccine protects against chickenpox caused by varicella-zoster virus (VZV). While often considered mild, varicella can cause serious complications including bacterial skin infections, pneumonia, encephalitis, and death – especially in newborns and immunocompromised individuals. The vaccine is 85% effective against any varicella and >95% effective against severe disease after one dose.',
    descriptionPt:
      'A vacina contra varicela protege contra catapora causada pelo vírus varicela-zóster (VZV). Embora frequentemente considerada leve, a varicela pode causar complicações graves incluindo infecções bacterianas de pele, pneumonia, encefalite e morte – especialmente em recém-nascidos e indivíduos imunocomprometidos. A vacina é 85% eficaz contra qualquer varicela e >95% eficaz contra doença grave após uma dose.',
    ageMonths: 12,
    ageLabel: '12 months',
    ageLabelPt: '12 meses',
    group: '12m',
    doses: 2,
    doseNumber: 1,
    category: 'mandatory',
    sideEffects: [
      'Mild varicella-like rash (3–5%, usually <10 lesions)',
      'Low-grade fever (10–15%)',
      'Injection site soreness, redness, and swelling',
      'Fatigue and irritability',
      'Headache',
      'Mild upper respiratory symptoms',
      'Febrile seizure (very rare)',
      'Herpes zoster (shingles) later in life from vaccine strain (very rare, lower risk than wild virus)',
    ],
    sideEffectsPt: [
      'Erupção leve semelhante à varicela (3–5%, geralmente <10 lesões)',
      'Febre baixa (10–15%)',
      'Dor, vermelhidão e inchaço no local da injeção',
      'Fadiga e irritabilidade',
      'Dor de cabeça',
      'Sintomas leves do trato respiratório superior',
      'Convulsão febril (muito raro)',
      'Herpes zóster (cobreiro) mais tarde na vida pela cepa vacinal (muito raro, risco menor que vírus selvagem)',
    ],
    benefits: [
      'Prevents chickenpox – a highly contagious disease (R₀ = 10–12)',
      'Over 95% effective at preventing severe chickenpox',
      'Prevents bacterial superinfections of skin lesions',
      'Prevents varicella pneumonia and encephalitis',
      'Reduces future risk of herpes zoster (shingles)',
      'Prevents scarring from varicella lesions',
      'Protects vulnerable household contacts (newborns, immunocompromised)',
    ],
    benefitsPt: [
      'Previne catapora – uma doença altamente contagiosa (R₀ = 10–12)',
      'Mais de 95% eficaz na prevenção de catapora grave',
      'Previne superinfecções bacterianas das lesões de pele',
      'Previne pneumonia e encefalite por varicela',
      'Reduz risco futuro de herpes zóster (cobreiro)',
      'Previne cicatrizes das lesões de varicela',
      'Protege contactantes domiciliares vulneráveis (recém-nascidos, imunocomprometidos)',
    ],
    detailedInfo: {
      mechanism:
        'Live attenuated vaccine containing the Oka strain of varicella-zoster virus. Replicates in the host and induces both humoral (anti-VZV IgG) and cellular (VZV-specific T-cell) immune responses, mimicking natural infection without severe disease.',
      mechanismPt:
        'Vacina viva atenuada contendo a cepa Oka do vírus varicela-zóster. Replica-se no hospedeiro e induz respostas imunes humorais (IgG anti-VZV) e celulares (células T VZV-específicas), imitando infecção natural sem doença grave.',
      composition:
        'Live attenuated Oka strain VZV (≥1,350 PFU). Propagated in human diploid cell cultures (MRC-5). Contains sucrose, gelatin, sodium chloride, monosodium L-glutamate, sodium phosphate, potassium phosphate, potassium chloride, EDTA, neomycin, and fetal bovine serum.',
      compositionPt:
        'Cepa Oka viva atenuada de VZV (≥1.350 UFP). Propagada em culturas de células diploides humanas (MRC-5). Contém sacarose, gelatina, cloreto de sódio, glutamato monossódico de L, fosfato de sódio, fosfato de potássio, cloreto de potássio, EDTA, neomicina e soro fetal bovino.',
      contraindications: [
        'Pregnancy (wait 1 month after vaccination before conceiving)',
        'Severe immunodeficiency (leukemia, lymphoma, AIDS)',
        'High-dose systemic immunosuppressive therapy',
        'Known severe allergy to neomycin or gelatin',
        'Active untreated tuberculosis',
        'Recent receipt of blood products or immunoglobulins (defer 3–11 months)',
      ],
      contraindicationsPt: [
        'Gravidez (esperar 1 mês após vacinação antes de conceber)',
        'Imunodeficiência grave (leucemia, linfoma, AIDS)',
        'Terapia imunossupressora sistêmica em alta dose',
        'Alergia grave conhecida à neomicina ou gelatina',
        'Tuberculose ativa não tratada',
        'Recebimento recente de hemoderivados ou imunoglobulinas (adiar 3–11 meses)',
      ],
      storage: 'Store lyophilized vaccine at -50°C to +8°C (frozen or refrigerated). Once reconstituted, use within 30 minutes. Protect from light.',
      storagePt: 'Armazenar vacina liofilizada a -50°C a +8°C (congelada ou refrigerada). Após reconstituição, usar dentro de 30 minutos. Proteger da luz.',
    },
  },

  // ============================================================
  // 15 MONTHS
  // ============================================================
  {
    id: 'mmr-2',
    name: 'MMR – 2nd dose',
    namePt: 'Tríplice Viral – 2ª dose',
    nameEn: 'MMR – 2nd dose',
    description:
      'Second dose of the MMR vaccine, given at 15 months (or at school entry, depending on national schedule). This dose raises measles protection to 97%+, catches the ~7% of children who did not respond to the first dose, and ensures robust population-level herd immunity (requires 95% coverage for measles).',
    descriptionPt:
      'Segunda dose da vacina tríplice viral, dada aos 15 meses (ou na entrada escolar, dependendo do calendário nacional). Esta dose eleva a proteção contra sarampo para 97%+, alcança os ~7% das crianças que não responderam à primeira dose e garante imunidade coletiva robusta na população (requer 95% de cobertura para sarampo).',
    ageMonths: 15,
    ageLabel: '15 months',
    ageLabelPt: '15 meses',
    group: '15m',
    doses: 2,
    doseNumber: 2,
    dependsOn: ['mmr-1'],
    category: 'mandatory',
    sideEffects: [
      'Fever (usually milder than after dose 1)',
      'Mild rash',
      'Swollen parotid glands (rare)',
      'Joint pain (rubella component, mainly in adult women)',
      'Febrile seizures (less common than after dose 1)',
      'Thrombocytopenia (rare)',
    ],
    sideEffectsPt: [
      'Febre (geralmente mais leve que após dose 1)',
      'Erupção leve',
      'Inchaço das glândulas parótidas (raro)',
      'Dor articular (componente rubéola, principalmente em mulheres adultas)',
      'Convulsões febris (menos comum que após dose 1)',
      'Trombocitopenia (raro)',
    ],
    benefits: [
      'Raises measles protection to 97%+ (from 93% after dose 1)',
      'Catches the 5–7% primary vaccine failures from dose 1',
      'Essential for achieving measles elimination (requires ≥95% coverage)',
      'Prevents congenital rubella syndrome outbreaks',
      'Strengthens long-term mumps immunity',
      'Critical for maintaining herd immunity in the community',
    ],
    benefitsPt: [
      'Eleva proteção contra sarampo para 97%+ (de 93% após dose 1)',
      'Alcança os 5–7% de falhas vacinas primárias da dose 1',
      'Essencial para alcançar eliminação do sarampo (requer ≥95% de cobertura)',
      'Previne surtos de síndrome da rubéola congênita',
      'Fortalece imunidade de longo prazo contra caxumba',
      'Crítica para manter imunidade coletiva na comunidade',
    ],
    detailedInfo: {
      mechanism: 'Same live attenuated MMR formulation. Second dose provides a booster response in those already immune and a primary response in the small percentage who failed to seroconvert after dose 1.',
      mechanismPt: 'Mesma formulação viva atenuada de tríplice viral. Segunda dose fornece resposta de reforço nos já imunes e resposta primária na pequena porcentagem que não soroconverteu após dose 1.',
      composition: 'Same as MMR dose 1.',
      compositionPt: 'Mesma que dose 1 da tríplice viral.',
      contraindications: [
        'Pregnancy',
        'Severe immunodeficiency',
        'Anaphylaxis to dose 1, neomycin, or gelatin',
        'Recent receipt of blood products or immunoglobulins',
      ],
      contraindicationsPt: [
        'Gravidez',
        'Imunodeficiência grave',
        'Anafilaxia à dose 1, neomicina ou gelatina',
        'Recebimento recente de hemoderivados ou imunoglobulinas',
      ],
      storage: 'Store lyophilized vaccine at +2°C to +8°C. Once reconstituted, use within 8 hours if refrigerated.',
      storagePt: 'Armazenar vacina liofilizada a +2°C a +8°C. Após reconstituição, usar dentro de 8 horas se refrigerada.',
    },
  },

  // ============================================================
  // 18 MONTHS
  // ============================================================
  {
    id: 'dtp-booster',
    name: 'DTP Booster',
    namePt: 'DTP Reforço',
    nameEn: 'DTP Booster',
    description:
      'Booster dose of diphtheria, tetanus, and pertussis vaccine given at 18 months. This dose is critical for maintaining immunity that begins to wane after the primary 3-dose pentavalent series. It particularly reinforces pertussis protection, as whooping cough remains a significant threat to young children in Angola.',
    descriptionPt:
      'Dose de reforço de difteria, tétano e coqueluche dada aos 18 meses. Esta dose é crítica para manter a imunidade que começa a diminuir após a série primária de 3 doses da pentavalente. Reforça particularmente a proteção contra coqueluche, pois a tosse convulsa continua sendo uma ameaça significativa para crianças pequenas em Angola.',
    ageMonths: 18,
    ageLabel: '18 months',
    ageLabelPt: '18 meses',
    group: '18m',
    doses: 1,
    doseNumber: 1,
    dependsOn: ['penta-3'],
    category: 'mandatory',
    sideEffects: [
      'Pain and significant swelling at injection site (more common in booster doses)',
      'Fever (38–39°C)',
      'Irritability and persistent crying',
      'Entire limb swelling (Arthus-like reaction, uncommon but recognized)',
      'Decreased appetite',
      'Drowsiness or restlessness',
      'Febrile seizure (rare)',
    ],
    sideEffectsPt: [
      'Dor e inchaço significativo no local da injeção (mais comum em doses de reforço)',
      'Febre (38–39°C)',
      'Irritabilidade e choro persistente',
      'Inchaço do membro inteiro (reação tipo Arthus, incomum mas reconhecida)',
      'Diminuição do apetite',
      'Sonolência ou inquietação',
      'Convulsão febril (raro)',
    ],
    benefits: [
      'Maintains and extends immunity from the pentavalent primary series',
      'Prevents pertussis (whooping cough) resurgence in toddlers',
      'Prevents tetanus – critical in areas with limited wound care',
      'Prevents diphtheria outbreaks',
      'Extends protection through early childhood years',
      'Supported by WHO as part of the standard immunization schedule',
    ],
    benefitsPt: [
      'Mantém e estende imunidade da série primária pentavalente',
      'Previne ressurgimento da coqueluche (tosse convulsa) em crianças pequenas',
      'Previne tétano – crítico em áreas com cuidado limitado de feridas',
      'Previne surtos de difteria',
      'Estende proteção durante os primeiros anos da infância',
      'Apoiada pela OMS como parte do calendário padrão de imunização',
    ],
    detailedInfo: {
      mechanism:
        'Contains diphtheria and tetanus toxoids and inactivated pertussis components (whole-cell or acellular). Booster dose reactivates waning memory B and T cells, producing a rapid and amplified anamnestic response.',
      mechanismPt:
        'Contém toxoides de difteria e tétano e componentes inativados de coqueluche (célula inteira ou acelular). Dose de reforço reativa células B e T de memória em declínio, produzindo resposta anamnéstica rápida e amplificada.',
      composition:
        'DTP whole-cell: diphtheria toxoid (≥30 IU), tetanus toxoid (≥60 IU), inactivated Bordetella pertussis (≥4 IU). Adjuvant: aluminum salt. Preservative: thiomersal (multi-dose).',
      compositionPt:
        'DTP célula inteira: toxoide diftérico (≥30 UI), toxoide tetânico (≥60 UI), Bordetella pertussis inativada (≥4 UI). Adjuvante: sal de alumínio. Conservante: tiomersal (multidose).',
      contraindications: [
        'Encephalopathy within 7 days of a previous pertussis-containing vaccine',
        'Severe allergic reaction to a previous DTP dose',
        'Progressive neurological disorder',
        'Moderate to severe acute illness (defer)',
      ],
      contraindicationsPt: [
        'Encefalopatia dentro de 7 dias de uma vacina anterior contendo coqueluche',
        'Reação alérgica grave a uma dose anterior de DTP',
        'Distúrbio neurológico progressivo',
        'Doença aguda moderada a grave (adiar)',
      ],
      storage: 'Store at +2°C to +8°C. Do NOT freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. NÃO congelar.',
    },
  },
  {
    id: 'hepa-2',
    name: 'Hepatitis A – 2nd dose',
    namePt: 'Hepatite A – 2ª dose',
    nameEn: 'Hepatitis A – 2nd dose',
    description:
      'Second and final dose of the hepatitis A vaccine, given 6 months after the first dose. This dose establishes long-term immunological memory and provides protection estimated to last 25+ years, potentially lifelong. After two doses, seroprotection rates approach 100%.',
    descriptionPt:
      'Segunda e última dose da vacina contra hepatite A, dada 6 meses após a primeira dose. Esta dose estabelece memória imunológica de longo prazo e fornece proteção estimada em mais de 25 anos, potencialmente vitalícia. Após duas doses, as taxas de soroproteção se aproximam de 100%.',
    ageMonths: 18,
    ageLabel: '18 months',
    ageLabelPt: '18 meses',
    group: '18m',
    doses: 2,
    doseNumber: 2,
    dependsOn: ['hepa-1'],
    category: 'mandatory',
    sideEffects: [
      'Injection site soreness (less common than dose 1)',
      'Headache',
      'Loss of appetite',
      'Mild fatigue',
      'Low-grade fever',
      'Irritability in children',
    ],
    sideEffectsPt: [
      'Dor no local da injeção (menos comum que dose 1)',
      'Dor de cabeça',
      'Perda de apetite',
      'Fadiga leve',
      'Febre baixa',
      'Irritabilidade em crianças',
    ],
    benefits: [
      'Provides long-term hepatitis A protection (25+ years, potentially lifelong)',
      'Near 100% seroprotection after two-dose series',
      'Safe for travel to regions with hepatitis A risk',
      'Prevents outbreaks in settings with poor sanitation',
      'Protects the liver from acute hepatitis A infection',
      'Establishes durable immunological memory',
    ],
    benefitsPt: [
      'Fornece proteção de longo prazo contra hepatite A (mais de 25 anos, potencialmente vitalícia)',
      'Quase 100% de soroproteção após série de duas doses',
      'Segura para viagens a regiões com risco de hepatite A',
      'Previne surtos em ambientes com saneamento precário',
      'Protege o fígado de infecção aguda por hepatite A',
      'Estabelece memória imunológica durável',
    ],
    detailedInfo: {
      mechanism: 'Second dose of inactivated HAV boosts anti-HAV antibody titers dramatically and establishes long-lived plasma cells and memory B-cells for durable protection.',
      mechanismPt: 'Segunda dose de HAV inativado aumenta drasticamente os títulos de anticorpos anti-HAV e estabelece plasmócitos de longa vida e células B de memória para proteção durável.',
      composition: 'Same as hepatitis A dose 1.',
      compositionPt: 'Mesma que dose 1 de hepatite A.',
      contraindications: [
        'Severe allergic reaction to dose 1 or any component',
        'Moderate to severe acute illness',
      ],
      contraindicationsPt: [
        'Reação alérgica grave à dose 1 ou qualquer componente',
        'Doença aguda moderada a grave',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // ============================================================
  // RECOMMENDED VACCINES (Internationally recommended per WHO)
  // ============================================================

  // -- Meningococcal B (2 months) --
  {
    id: 'meningo-b-1',
    name: 'Meningococcal B – 1st dose',
    namePt: 'Meningocócica B – 1ª dose',
    nameEn: 'Meningococcal B – 1st dose',
    description:
      'The meningococcal B (MenB) vaccine protects against invasive disease caused by Neisseria meningitidis serogroup B, which is not covered by the standard meningococcal conjugate vaccines (serogroup A/C/W/Y). Serogroup B is a leading cause of bacterial meningitis in infants in many countries. Two doses plus a booster are recommended.',
    descriptionPt:
      'A vacina meningocócica B (MenB) protege contra doença invasiva causada por Neisseria meningitidis sorogrupo B, que não é coberta pelas vacinas meningocócicas conjugadas padrão (sorogrupo A/C/W/Y). O sorogrupo B é uma das principais causas de meningite bacteriana em bebês em muitos países. São recomendadas duas doses mais um reforço.',
    ageMonths: 2,
    ageLabel: '2 months',
    ageLabelPt: '2 meses',
    group: '2m',
    doses: 2,
    doseNumber: 1,
    category: 'recommended',
    sideEffects: [
      'High fever (≥38.5°C) – more common when given with routine vaccines',
      'Injection site pain, redness, and swelling (very common)',
      'Irritability and prolonged crying (very common in infants)',
      'Drowsiness',
      'Decreased appetite',
      'Unusual crying (uncommon)',
      'Rash or urticaria (uncommon)',
      'Kawasaki disease (very rare, under surveillance)',
    ],
    sideEffectsPt: [
      'Febre alta (≥38,5°C) – mais comum quando administrada com vacinas de rotina',
      'Dor, vermelhidão e inchaço no local da injeção (muito comum)',
      'Irritabilidade e choro prolongado (muito comum em bebês)',
      'Sonolência',
      'Diminuição do apetite',
      'Choro incomum (incomum)',
      'Erupção cutânea ou urticária (incomum)',
      'Doença de Kawasaki (muito raro, sob vigilância)',
    ],
    benefits: [
      'Protects against serogroup B meningococcal disease – the leading cause of meningitis in some countries',
      'Covers serogroup B which is not included in MenACWY vaccines',
      'Prevents potentially fatal meningococcal sepsis',
      'Reduces risk of severe neurological sequelae (deafness, limb loss)',
      'Recommended by WHO for high-risk settings and national programs',
    ],
    benefitsPt: [
      'Protege contra doença meningocócica sorogrupo B – a principal causa de meningite em alguns países',
      'Cobre sorogrupo B que não está incluído nas vacinas MenACWY',
      'Previne sepse meningocócica potencialmente fatal',
      'Reduz risco de sequelas neurológicas graves (surdez, perda de membro)',
      'Recomendada pela OMS para ambientes de alto risco e programas nacionais',
    ],
    detailedInfo: {
      mechanism:
        'Protein-based (non-conjugate) vaccine. Bexsero (4CMenB) contains four recombinant proteins: fHbp, NadA, NHBA, and outer membrane vesicles (OMV) from NZ strain. These antigens are expressed on the surface of most MenB strains and induce serum bactericidal antibodies.',
      mechanismPt:
        'Vacina baseada em proteínas (não conjugada). Bexsero (4CMenB) contém quatro proteínas recombinantes: fHbp, NadA, NHBA e vesículas de membrana externa (OMV) da cepa NZ. Esses antígenos são expressos na superfície da maioria das cepas MenB e induzem anticorpos bactericidas séricos.',
      composition:
        'Bexsero: recombinant NHBA fusion protein (50 mcg), recombinant NadA protein (50 mcg), recombinant fHbp fusion protein (50 mcg), outer membrane vesicles (25 mcg PorA P1.4). Adjuvant: aluminum hydroxide.',
      compositionPt:
        'Bexsero: proteína de fusão NHBA recombinante (50 mcg), proteína NadA recombinante (50 mcg), proteína de fusão fHbp recombinante (50 mcg), vesículas de membrana externa (25 mcg PorA P1.4). Adjuvante: hidróxido de alumínio.',
      contraindications: [
        'Severe allergic reaction to a previous MenB vaccine dose or any component',
        'Moderate to severe acute illness (defer)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma dose anterior de vacina MenB ou qualquer componente',
        'Doença aguda moderada a grave (adiar)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze. Protect from light.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar. Proteger da luz.',
    },
  },

  // -- Meningococcal B (4 months) --
  {
    id: 'meningo-b-2',
    name: 'Meningococcal B – 2nd dose',
    namePt: 'Meningocócica B – 2ª dose',
    nameEn: 'Meningococcal B – 2nd dose',
    description:
      'Second dose of the meningococcal B vaccine, given at least 2 months after the first dose. This dose completes the primary series and significantly boosts serum bactericidal antibody titers against meningococcal serogroup B. A booster dose at 12 months is recommended for sustained protection.',
    descriptionPt:
      'Segunda dose da vacina meningocócica B, dada pelo menos 2 meses após a primeira dose. Esta dose completa a série primária e aumenta significativamente os títulos de anticorpos bactericidas séricos contra o sorogrupo B meningocócico. Uma dose de reforço aos 12 meses é recomendada para proteção sustentada.',
    ageMonths: 4,
    ageLabel: '4 months',
    ageLabelPt: '4 meses',
    group: '4m',
    doses: 2,
    doseNumber: 2,
    dependsOn: ['meningo-b-1'],
    category: 'recommended',
    sideEffects: [
      'Fever (≥38°C) – prophylactic paracetamol may be recommended',
      'Injection site pain and swelling',
      'Irritability',
      'Drowsiness',
      'Decreased appetite',
      'Rash (uncommon)',
    ],
    sideEffectsPt: [
      'Febre (≥38°C) – paracetamol profilático pode ser recomendado',
      'Dor e inchaço no local da injeção',
      'Irritabilidade',
      'Sonolência',
      'Diminuição do apetite',
      'Erupção cutânea (incomum)',
    ],
    benefits: [
      'Completes primary MenB immunization',
      'Maximizes serum bactericidal antibody response',
      'Provides broader strain coverage against MenB',
      'Reduces risk of infant meningococcal meningitis and sepsis',
      'Establishes foundation for long-term protection with booster',
    ],
    benefitsPt: [
      'Completa imunização primária MenB',
      'Maximiza resposta de anticorpos bactericidas séricos',
      'Fornece cobertura mais ampla de cepas contra MenB',
      'Reduz risco de meningite e sepse meningocócica infantil',
      'Estabelece base para proteção de longo prazo com reforço',
    ],
    detailedInfo: {
      mechanism: 'Same as MenB dose 1. Second dose amplifies the immune response and increases bactericidal antibody titers against the four target antigens.',
      mechanismPt: 'Mesma que dose 1 MenB. Segunda dose amplifica a resposta imune e aumenta títulos de anticorpos bactericidas contra os quatro antígenos alvo.',
      composition: 'Same as MenB dose 1 (Bexsero).',
      compositionPt: 'Mesma que dose 1 MenB (Bexsero).',
      contraindications: [
        'Severe reaction to MenB dose 1',
        'Moderate to severe acute illness',
      ],
      contraindicationsPt: [
        'Reação grave à dose 1 MenB',
        'Doença aguda moderada a grave',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // -- Influenza (6 months) --
  {
    id: 'influenza',
    name: 'Influenza (Annual)',
    namePt: 'Gripe (Anual)',
    nameEn: 'Influenza (Annual)',
    description:
      'The influenza vaccine protects against seasonal influenza viruses, which cause significant morbidity and mortality worldwide, particularly in young children, the elderly, and immunocompromised individuals. The WHO recommends annual vaccination as the virus strains change each year. For children receiving influenza vaccine for the first time, two doses are recommended 4 weeks apart.',
    descriptionPt:
      'A vacina contra gripe protege contra vírus da influenza sazonal, que causam morbidade e mortalidade significativas no mundo, particularmente em crianças pequenas, idosos e indivíduos imunocomprometidos. A OMS recomenda vacinação anual pois as cepas do vírus mudam a cada ano. Para crianças recebendo a vacina contra gripe pela primeira vez, duas doses com 4 semanas de intervalo são recomendadas.',
    ageMonths: 6,
    ageLabel: '6 months',
    ageLabelPt: '6 meses',
    group: '6m',
    doses: 1,
    doseNumber: 1,
    category: 'recommended',
    sideEffects: [
      'Injection site soreness (most common, 30–40%)',
      'Low-grade fever lasting 1–2 days',
      'Myalgia (muscle aches)',
      'Fatigue and malaise',
      'Headache',
      'Irritability in young children',
      'Allergic reaction in individuals with egg allergy (rare)',
      'Guillain-Barré syndrome (extremely rare, ~1 per million)',
    ],
    sideEffectsPt: [
      'Dor no local da injeção (mais comum, 30–40%)',
      'Febre baixa durando 1–2 dias',
      'Mialgia (dores musculares)',
      'Fadiga e mal-estar',
      'Dor de cabeça',
      'Irritabilidade em crianças pequenas',
      'Reação alérgica em indivíduos com alergia a ovo (raro)',
      'Síndrome de Guillain-Barré (extremamente raro, ~1 por milhão)',
    ],
    benefits: [
      'Prevents seasonal influenza and its complications',
      'Reduces hospitalization risk by 40–60% during flu season',
      'Prevents influenza-related pneumonia in young children',
      'Updated annually to match circulating strains',
      'Reduces school/daycare absenteeism',
      'Prevents transmission to high-risk household contacts',
      'WHO recommends annually for children aged 6 months to 5 years',
    ],
    benefitsPt: [
      'Previne gripe sazonal e suas complicações',
      'Reduz risco de hospitalização em 40–60% durante a temporada de gripe',
      'Previne pneumonia relacionada à influenza em crianças pequenas',
      'Atualizada anualmente para corresponder às cepas circulantes',
      'Reduz absenteísmo escolar/creche',
      'Previne transmissão a contactantes domiciliares de alto risco',
      'OMS recomenda anualmente para crianças de 6 meses a 5 anos',
    ],
    detailedInfo: {
      mechanism:
        'Inactivated influenza vaccine (IIV) or live attenuated influenza vaccine (LAIV). IIV contains split virus or subunit antigens (hemagglutinin and neuraminidase) from WHO-recommended strains. Induces strain-specific neutralizing antibodies (anti-HA IgG).',
      mechanismPt:
        'Vacina inativada contra influenza (VII) ou vacina viva atenuada contra influenza (VVAI). VII contém vírus fragmentado ou antígenos de subunidade (hemaglutinina e neuraminidase) das cepas recomendadas pela OMS. Induz anticorpos neutralizantes cepa-específicos (IgG anti-HA).',
      composition:
        'Quadrivalent IIV: contains hemagglutinin (15 mcg per strain) from two influenza A strains (H1N1, H3N2) and two influenza B strains (Victoria, Yamagata lineage). May contain trace egg protein, formaldehyde, and polysorbate 80.',
      compositionPt:
        'VII quadrivalente: contém hemaglutinina (15 mcg por cepa) de duas cepas de influenza A (H1N1, H3N2) e duas cepas de influenza B (linhagem Victoria, Yamagata). Pode conter vestígios de proteína de ovo, formaldeído e polissorbato 80.',
      contraindications: [
        'Severe allergic reaction (anaphylaxis) to a previous influenza vaccine dose',
        'Severe egg allergy (anaphylaxis) – use egg-free formulations if available',
        'History of Guillain-Barré syndrome within 6 weeks of a previous flu vaccine',
        'Moderate to severe acute illness (defer)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave (anafilaxia) a uma dose anterior de vacina contra gripe',
        'Alergia grave a ovo (anafilaxia) – usar formulações sem ovo se disponíveis',
        'Histórico de síndrome de Guillain-Barré dentro de 6 semanas de uma vacina contra gripe anterior',
        'Doença aguda moderada a grave (adiar)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze. Use within the expiry date. Seasonal vaccine must be discarded after the season ends.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar. Usar dentro da data de validade. Vacina sazonal deve ser descartada após o término da temporada.',
    },
  },

  // -- Varicella 2nd dose (4 years) --
  {
    id: 'varicella-2',
    name: 'Varicella (Chickenpox) – 2nd dose',
    namePt: 'Varicela (Catapora) – 2ª dose',
    nameEn: 'Varicella (Chickenpox) – 2nd dose',
    description:
      'Second dose of varicella vaccine, recommended at 4–6 years of age. This dose raises efficacy to 98%+ against any chickenpox and virtually 100% against severe disease. Two-dose schedules have dramatically reduced chickenpox-related hospitalizations, complications, and deaths in countries that have adopted them.',
    descriptionPt:
      'Segunda dose da vacina contra varicela, recomendada aos 4–6 anos de idade. Esta dose eleva a eficácia para 98%+ contra qualquer catapora e virtualmente 100% contra doença grave. Esquemas de duas doses reduziram dramaticamente hospitalizações, complicações e mortes relacionadas à catapora nos países que os adotaram.',
    ageMonths: 48,
    ageLabel: '4 years',
    ageLabelPt: '4 anos',
    group: '4y',
    doses: 2,
    doseNumber: 2,
    dependsOn: ['varicella'],
    category: 'recommended',
    sideEffects: [
      'Injection site pain and swelling (milder than dose 1)',
      'Low-grade fever',
      'Mild varicella-like rash (1–3%)',
      'Headache',
      'Fatigue',
    ],
    sideEffectsPt: [
      'Dor e inchaço no local da injeção (mais leve que dose 1)',
      'Febre baixa',
      'Erupção leve semelhante à varicela (1–3%)',
      'Dor de cabeça',
      'Fadiga',
    ],
    benefits: [
      'Raises chickenpox protection to 98%+',
      'Virtually 100% protection against severe varicella',
      'Prevents breakthrough varicella infections',
      'Reduces varicella transmission in schools and communities',
      'Further reduces future risk of herpes zoster (shingles)',
    ],
    benefitsPt: [
      'Eleva proteção contra catapora para 98%+',
      'Virtualmente 100% de proteção contra varicela grave',
      'Previne infecções de varicela de escape',
      'Reduz transmissão de varicela em escolas e comunidades',
      'Reduz ainda mais o risco futuro de herpes zóster (cobreiro)',
    ],
    detailedInfo: {
      mechanism: 'Same Oka strain live attenuated VZV vaccine. Second dose boosts humoral and cellular immunity, catching primary vaccine failures and ensuring durable protection.',
      mechanismPt: 'Mesma vacina viva atenuada de VZV cepa Oka. Segunda dose reforça imunidade humoral e celular, alcançando falhas vacinas primárias e garantindo proteção durável.',
      composition: 'Same as varicella dose 1.',
      compositionPt: 'Mesma que dose 1 de varicela.',
      contraindications: [
        'Pregnancy',
        'Severe immunodeficiency',
        'Severe allergy to neomycin, gelatin, or varicella dose 1',
      ],
      contraindicationsPt: [
        'Gravidez',
        'Imunodeficiência grave',
        'Alergia grave à neomicina, gelatina ou dose 1 de varicela',
      ],
      storage: 'Store lyophilized vaccine at -50°C to +8°C. Use within 30 minutes of reconstitution.',
      storagePt: 'Armazenar vacina liofilizada a -50°C a +8°C. Usar dentro de 30 minutos da reconstituição.',
    },
  },

  // -- DTP School Booster (4 years) --
  {
    id: 'dtp-school',
    name: 'DTP School Booster',
    namePt: 'DTP Reforço Escolar',
    nameEn: 'DTP School Booster',
    description:
      'A second booster dose of diphtheria, tetanus, and pertussis vaccine given at school entry (4–6 years). This dose is recommended by the WHO to extend protection through the school years, as immunity from the primary series and first booster begins to wane. Particularly important for pertussis, which has shown resurgence in many countries.',
    descriptionPt:
      'Uma segunda dose de reforço de difteria, tétano e coqueluche dada na entrada escolar (4–6 anos). Esta dose é recomendada pela OMS para estender a proteção durante os anos escolares, pois a imunidade da série primária e primeiro reforço começa a diminuir. Particularmente importante para coqueluche, que mostrou ressurgimento em muitos países.',
    ageMonths: 48,
    ageLabel: '4 years',
    ageLabelPt: '4 anos',
    group: '4y',
    doses: 1,
    doseNumber: 1,
    dependsOn: ['dtp-booster'],
    category: 'recommended',
    sideEffects: [
      'Injection site pain and significant swelling (common in booster doses)',
      'Fever',
      'Headache',
      'Entire limb swelling (uncommon, self-resolving)',
      'Fatigue and malaise',
      'Irritability',
    ],
    sideEffectsPt: [
      'Dor e inchaço significativo no local da injeção (comum em doses de reforço)',
      'Febre',
      'Dor de cabeça',
      'Inchaço do membro inteiro (incomum, autolimitado)',
      'Fadiga e mal-estar',
      'Irritabilidade',
    ],
    benefits: [
      'Extends DTP protection through school years',
      'Prevents pertussis resurgence in school-age children',
      'Maintains tetanus and diphtheria immunity',
      'Reduces whooping cough transmission to younger siblings and infants',
      'Supported by WHO immunization schedule recommendations',
    ],
    benefitsPt: [
      'Estende proteção DTP durante os anos escolares',
      'Previne ressurgimento de coqueluche em crianças em idade escolar',
      'Mantém imunidade contra tétano e difteria',
      'Reduz transmissão de tosse convulsa para irmãos mais novos e bebês',
      'Apoiada pelas recomendações do calendário de imunização da OMS',
    ],
    detailedInfo: {
      mechanism: 'Booster with DTP (whole-cell or acellular). Reactivates immunological memory for diphtheria, tetanus, and pertussis antigens.',
      mechanismPt: 'Reforço com DTP (célula inteira ou acelular). Reativa memória imunológica para antígenos de difteria, tétano e coqueluche.',
      composition: 'DTP or DTaP formulation appropriate for the child\'s age. Reduced-antigen formulations (Tdap) may be used for older children.',
      compositionPt: 'Formulação DTP ou DTPa apropriada para a idade da criança. Formulações com antígenos reduzidos (Tdap) podem ser usadas para crianças mais velhas.',
      contraindications: [
        'Encephalopathy after previous pertussis-containing vaccine',
        'Severe allergic reaction to previous DTP dose',
        'Progressive neurological disorder',
      ],
      contraindicationsPt: [
        'Encefalopatia após vacina anterior contendo coqueluche',
        'Reação alérgica grave a dose anterior de DTP',
        'Distúrbio neurológico progressivo',
      ],
      storage: 'Store at +2°C to +8°C. Do NOT freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. NÃO congelar.',
    },
  },

  // -- IPV Booster (4 years) --
  {
    id: 'ipv-booster',
    name: 'Polio (IPV) – Booster',
    namePt: 'Polio (VIP) – Reforço',
    nameEn: 'Polio (IPV) – Booster',
    description:
      'A booster dose of IPV given at school entry (4–6 years) to maintain lifelong polio immunity. While the 3-dose primary series provides excellent protection, this booster ensures antibody levels remain high through adulthood. The WHO recommends this dose in countries using IPV-only schedules.',
    descriptionPt:
      'Uma dose de reforço de VIP dada na entrada escolar (4–6 anos) para manter imunidade vitalícia contra pólio. Embora a série primária de 3 doses forneça excelente proteção, este reforço garante que os níveis de anticorpos permaneçam altos durante a vida adulta. A OMS recomenda esta dose em países que usam esquemas somente com VIP.',
    ageMonths: 48,
    ageLabel: '4 years',
    ageLabelPt: '4 anos',
    group: '4y',
    doses: 1,
    doseNumber: 1,
    dependsOn: ['ipv-3'],
    category: 'recommended',
    sideEffects: [
      'Mild injection site pain',
      'Low-grade fever',
      'Fatigue',
      'Headache',
      'Localized swelling',
    ],
    sideEffectsPt: [
      'Dor leve no local da injeção',
      'Febre baixa',
      'Fadiga',
      'Dor de cabeça',
      'Inchaço localizado',
    ],
    benefits: [
      'Maintains lifelong polio immunity',
      'Boosts antibody titers to high protective levels',
      'Essential for polio-free status maintenance',
      'Supports global polio eradication goals',
      'Prevents any future risk of paralytic poliomyelitis',
    ],
    benefitsPt: [
      'Mantém imunidade vitalícia contra pólio',
      'Eleva títulos de anticorpos a níveis protetores altos',
      'Essencial para manutenção do status livre de pólio',
      'Apoia metas globais de erradicação da pólio',
      'Previne qualquer risco futuro de poliomielite paralítica',
    ],
    detailedInfo: {
      mechanism: 'Booster dose of inactivated poliovirus. Rapidly reactivates memory immune response, restoring high neutralizing antibody titers against all three poliovirus serotypes.',
      mechanismPt: 'Dose de reforço de poliovírus inativado. Reativa rapidamente resposta imune de memória, restaurando títulos altos de anticorpos neutralizantes contra os três sorotipos de poliovírus.',
      composition: 'Same as primary IPV doses.',
      compositionPt: 'Mesma que doses primárias de VIP.',
      contraindications: [
        'Severe allergic reaction to previous IPV doses or components (neomycin, streptomycin)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a doses anteriores de VIP ou componentes (neomicina, estreptomicina)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // -- COVID-19 Primary (6 months) --
  {
    id: 'covid-primary',
    name: 'COVID-19 – Primary dose',
    namePt: 'COVID-19 – Dose primária',
    nameEn: 'COVID-19 – Primary dose',
    description:
      'COVID-19 vaccination is recommended for children from 6 months of age per WHO guidance. The vaccines available for young children include mRNA-based (Pfizer-BioNTech, Moderna) and protein subunit vaccines (Novavax). Vaccination reduces the risk of severe COVID-19, hospitalization, MIS-C (multisystem inflammatory syndrome in children), and long COVID.',
    descriptionPt:
      'A vacinação contra COVID-19 é recomendada para crianças a partir de 6 meses de idade conforme orientação da OMS. As vacinas disponíveis para crianças pequenas incluem baseadas em mRNA (Pfizer-BioNTech, Moderna) e vacinas de subunidade proteica (Novavax). A vacinação reduz o risco de COVID-19 grave, hospitalização, SIM-P (síndrome inflamatória multissistêmica pediátrica) e COVID longa.',
    ageMonths: 6,
    ageLabel: '6 months',
    ageLabelPt: '6 meses',
    group: '6m',
    doses: 1,
    doseNumber: 1,
    category: 'recommended',
    sideEffects: [
      'Injection site pain and tenderness (most common)',
      'Fatigue and drowsiness',
      'Irritability and crying in infants',
      'Fever (38–39°C, less common in young children than adults)',
      'Decreased appetite',
      'Myalgia',
      'Headache (in older children)',
      'Myocarditis/pericarditis (extremely rare, primarily in adolescent males after mRNA vaccines)',
    ],
    sideEffectsPt: [
      'Dor e sensibilidade no local da injeção (mais comum)',
      'Fadiga e sonolência',
      'Irritabilidade e choro em bebês',
      'Febre (38–39°C, menos comum em crianças pequenas que em adultos)',
      'Diminuição do apetite',
      'Mialgia',
      'Dor de cabeça (em crianças mais velhas)',
      'Miocardite/pericardite (extremamente raro, principalmente em adolescentes masculinos após vacinas de mRNA)',
    ],
    benefits: [
      'Prevents severe COVID-19 disease in children',
      'Reduces risk of MIS-C (multisystem inflammatory syndrome in children)',
      'Reduces hospitalization and ICU admission',
      'Reduces risk of long COVID symptoms',
      'Helps protect vulnerable household contacts',
      'WHO SAGE recommends vaccination for children in risk groups',
    ],
    benefitsPt: [
      'Previne doença grave por COVID-19 em crianças',
      'Reduz risco de SIM-P (síndrome inflamatória multissistêmica pediátrica)',
      'Reduz hospitalização e admissão em UTI',
      'Reduz risco de sintomas de COVID longa',
      'Ajuda a proteger contactantes domiciliares vulneráveis',
      'SAGE da OMS recomenda vacinação para crianças em grupos de risco',
    ],
    detailedInfo: {
      mechanism:
        'mRNA vaccines (e.g., Pfizer-BioNTech Comirnaty) encode the SARS-CoV-2 spike protein. After injection, cells produce spike protein, stimulating both humoral (neutralizing antibodies) and cellular (T-cell) immune responses. Updated formulations target currently circulating variants.',
      mechanismPt:
        'Vacinas de mRNA (ex: Pfizer-BioNTech Comirnaty) codificam a proteína spike do SARS-CoV-2. Após injeção, as células produzem proteína spike, estimulando respostas imunes humorais (anticorpos neutralizantes) e celulares (células T). Formulações atualizadas visam variantes atualmente circulantes.',
      composition:
        'Pfizer-BioNTech pediatric (6m–4y): 3 mcg mRNA encoding spike protein, lipid nanoparticles (ALC-0315, ALC-0159, DSPC, cholesterol), tromethamine, sucrose. No preservatives.',
      compositionPt:
        'Pfizer-BioNTech pediátrica (6m–4a): 3 mcg de mRNA codificando proteína spike, nanopartículas lipídicas (ALC-0315, ALC-0159, DSPC, colesterol), trometamina, sacarose. Sem conservantes.',
      contraindications: [
        'Severe allergic reaction (anaphylaxis) to a previous COVID-19 vaccine dose',
        'Known allergy to PEG (polyethylene glycol) or polysorbate',
        'Myocarditis after a previous mRNA COVID-19 vaccine dose',
      ],
      contraindicationsPt: [
        'Reação alérgica grave (anafilaxia) a uma dose anterior de vacina COVID-19',
        'Alergia conhecida a PEG (polietilenoglicol) ou polissorbato',
        'Miocardite após dose anterior de vacina COVID-19 de mRNA',
      ],
      storage: 'Pfizer pediatric: store frozen at -90°C to -60°C (ultra-cold) or refrigerated at +2°C to +8°C for up to 10 weeks. Once thawed, do not refreeze. Dilute before use.',
      storagePt: 'Pfizer pediátrica: armazenar congelada a -90°C a -60°C (ultra-frio) ou refrigerada a +2°C a +8°C por até 10 semanas. Uma vez descongelada, não recongelar. Diluir antes do uso.',
    },
  },

  // -- HPV (9 years) --
  {
    id: 'hpv-1',
    name: 'HPV – 1st dose',
    namePt: 'HPV – 1ª dose',
    nameEn: 'HPV – 1st dose',
    description:
      'The human papillomavirus (HPV) vaccine protects against the HPV types that cause most cervical cancers (16, 18) and genital warts (6, 11). The WHO recommends vaccination at 9–14 years, ideally before any sexual activity begins. A single-dose schedule has been endorsed by WHO SAGE since 2022 as an alternative to the 2-dose schedule, with comparable efficacy.',
    descriptionPt:
      'A vacina contra papilomavírus humano (HPV) protege contra os tipos de HPV que causam a maioria dos cânceres cervicais (16, 18) e verrugas genitais (6, 11). A OMS recomenda vacinação entre 9–14 anos, idealmente antes do início de qualquer atividade sexual. Um esquema de dose única foi endossado pelo SAGE da OMS desde 2022 como alternativa ao esquema de 2 doses, com eficácia comparável.',
    ageMonths: 108,
    ageLabel: '9 years',
    ageLabelPt: '9 anos',
    group: '9y',
    doses: 2,
    doseNumber: 1,
    category: 'recommended',
    sideEffects: [
      'Injection site pain (80–90% – most common side effect)',
      'Injection site swelling and redness',
      'Headache (20–30%)',
      'Fatigue',
      'Nausea and dizziness',
      'Myalgia',
      'Syncope (fainting) shortly after vaccination – observe for 15 minutes',
      'Anaphylaxis (extremely rare)',
    ],
    sideEffectsPt: [
      'Dor no local da injeção (80–90% – efeito colateral mais comum)',
      'Inchaço e vermelhidão no local da injeção',
      'Dor de cabeça (20–30%)',
      'Fadiga',
      'Náusea e tontura',
      'Mialgia',
      'Síncope (desmaio) logo após vacinação – observar por 15 minutos',
      'Anafilaxia (extremamente raro)',
    ],
    benefits: [
      'Prevents cervical cancer – the 4th most common cancer in women worldwide',
      'Prevents HPV types 16 and 18, responsible for ~70% of cervical cancers',
      'Prevents genital warts (HPV 6 and 11 – quadrivalent/nonavalent vaccines)',
      'Prevents oropharyngeal, anal, vulvar, vaginal, and penile cancers',
      'Near 100% efficacy against HPV 16/18-related precancerous lesions in HPV-naïve individuals',
      'WHO recommends for all girls (and boys in some programs) aged 9–14',
      'Major step toward cervical cancer elimination (WHO global strategy)',
    ],
    benefitsPt: [
      'Previne câncer cervical – o 4º câncer mais comum em mulheres no mundo',
      'Previne HPV tipos 16 e 18, responsáveis por ~70% dos cânceres cervicais',
      'Previne verrugas genitais (HPV 6 e 11 – vacinas quadrivalentes/nonavalentes)',
      'Previne cânceres orofaríngeo, anal, vulvar, vaginal e peniano',
      'Quase 100% de eficácia contra lesões pré-cancerosas relacionadas ao HPV 16/18 em indivíduos HPV-naïve',
      'OMS recomenda para todas as meninas (e meninos em alguns programas) de 9–14 anos',
      'Passo importante para eliminação do câncer cervical (estratégia global da OMS)',
    ],
    detailedInfo: {
      mechanism:
        'Recombinant vaccine containing virus-like particles (VLPs) of HPV L1 capsid protein produced in yeast or insect cells. VLPs are non-infectious and cannot cause HPV infection. They induce high-titer neutralizing antibodies against targeted HPV types.',
      mechanismPt:
        'Vacina recombinante contendo partículas semelhantes a vírus (VLPs) da proteína do capsídeo L1 do HPV produzidas em células de levedura ou inseto. VLPs não são infecciosas e não podem causar infecção por HPV. Induzem anticorpos neutralizantes em alto título contra os tipos de HPV-alvo.',
      composition:
        'Gardasil 9 (nonavalent): VLPs of HPV types 6, 11, 16, 18, 31, 33, 45, 52, 58. Each type 20–40 mcg L1 protein. Adjuvant: amorphous aluminum hydroxyphosphate sulfate (AAHS). No preservative.',
      compositionPt:
        'Gardasil 9 (nonavalente): VLPs dos tipos de HPV 6, 11, 16, 18, 31, 33, 45, 52, 58. Cada tipo 20–40 mcg de proteína L1. Adjuvante: sulfato de hidroxifosfato de alumínio amorfo (AAHS). Sem conservante.',
      contraindications: [
        'Severe allergic reaction to a previous HPV vaccine dose or any component',
        'Known hypersensitivity to yeast (Gardasil) or insect cell proteins (Cervarix)',
        'Pregnancy (not recommended – defer until after delivery)',
        'Moderate to severe acute illness (defer)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma dose anterior de vacina HPV ou qualquer componente',
        'Hipersensibilidade conhecida a levedura (Gardasil) ou proteínas de células de inseto (Cervarix)',
        'Gravidez (não recomendada – adiar até após o parto)',
        'Doença aguda moderada a grave (adiar)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze – freezing destroys the vaccine. Protect from light.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar – congelamento destrói a vacina. Proteger da luz.',
    },
  },
  {
    id: 'hpv-2',
    name: 'HPV – 2nd dose',
    namePt: 'HPV – 2ª dose',
    nameEn: 'HPV – 2nd dose',
    description:
      'Second dose of the HPV vaccine, recommended 6–12 months after the first dose for individuals vaccinated before age 15. This dose ensures maximum and long-lasting antibody titers. The WHO has noted that even a single dose provides substantial protection, but two doses remain the standard recommendation for optimal immunity in the 2-dose schedule.',
    descriptionPt:
      'Segunda dose da vacina HPV, recomendada 6–12 meses após a primeira dose para indivíduos vacinados antes dos 15 anos. Esta dose garante títulos de anticorpos máximos e duradouros. A OMS observou que mesmo uma dose única fornece proteção substancial, mas duas doses permanecem a recomendação padrão para imunidade ótima no esquema de 2 doses.',
    ageMonths: 114,
    ageLabel: '9.5 years',
    ageLabelPt: '9,5 anos',
    group: '9y',
    doses: 2,
    doseNumber: 2,
    dependsOn: ['hpv-1'],
    category: 'recommended',
    sideEffects: [
      'Injection site pain',
      'Swelling and redness at injection site',
      'Headache',
      'Fatigue',
      'Nausea',
      'Syncope (observe 15 min post-vaccination)',
    ],
    sideEffectsPt: [
      'Dor no local da injeção',
      'Inchaço e vermelhidão no local da injeção',
      'Dor de cabeça',
      'Fadiga',
      'Náusea',
      'Síncope (observar 15 min pós-vacinação)',
    ],
    benefits: [
      'Maximizes and sustains HPV antibody titers for decades',
      'Completes the 2-dose HPV immunization schedule',
      'Ensures robust protection against HPV-related cancers',
      'Provides additional assurance of long-term immunity',
      'Supports global cervical cancer elimination goals',
    ],
    benefitsPt: [
      'Maximiza e sustenta títulos de anticorpos HPV por décadas',
      'Completa o esquema de imunização HPV de 2 doses',
      'Garante proteção robusta contra cânceres relacionados ao HPV',
      'Fornece garantia adicional de imunidade de longo prazo',
      'Apoia metas globais de eliminação do câncer cervical',
    ],
    detailedInfo: {
      mechanism: 'Same VLP-based vaccine as dose 1. Second dose triggers a strong anamnestic response with high-avidity neutralizing antibodies, establishing durable immunological memory.',
      mechanismPt: 'Mesma vacina baseada em VLP da dose 1. Segunda dose desencadeia forte resposta anamnéstica com anticorpos neutralizantes de alta avidez, estabelecendo memória imunológica durável.',
      composition: 'Same as HPV dose 1.',
      compositionPt: 'Mesma que dose 1 de HPV.',
      contraindications: [
        'Severe allergic reaction to HPV dose 1',
        'Pregnancy',
      ],
      contraindicationsPt: [
        'Reação alérgica grave à dose 1 de HPV',
        'Gravidez',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // -- Tdap (11 years) --
  {
    id: 'tdap',
    name: 'Tdap (Tetanus, Diphtheria, Pertussis)',
    namePt: 'Tdap (Tétano, Difteria, Coqueluche)',
    nameEn: 'Tdap (Tetanus, Diphtheria, Pertussis)',
    description:
      'The Tdap vaccine is a reduced-antigen formulation of tetanus toxoid, diphtheria toxoid, and acellular pertussis, designed for adolescents and adults. Given at 11–12 years, it boosts waning immunity from childhood DTP/DTaP vaccines. This is particularly important for preventing pertussis transmission to vulnerable infants (cocoon strategy).',
    descriptionPt:
      'A vacina Tdap é uma formulação com antígenos reduzidos de toxoide tetânico, toxoide diftérico e coqueluche acelular, projetada para adolescentes e adultos. Dada aos 11–12 anos, reforça a imunidade em declínio das vacinas DTP/DTPa da infância. É particularmente importante para prevenir transmissão de coqueluche a bebês vulneráveis (estratégia cocoon).',
    ageMonths: 132,
    ageLabel: '11 years',
    ageLabelPt: '11 anos',
    group: '11y',
    doses: 1,
    doseNumber: 1,
    dependsOn: ['dtp-booster'],
    category: 'recommended',
    sideEffects: [
      'Injection site pain (75–80%)',
      'Injection site swelling and redness',
      'Headache (40%)',
      'Fatigue (30%)',
      'Nausea and abdominal pain',
      'Myalgia and arthralgia',
      'Fever (5–10%)',
      'Extensive limb swelling (uncommon)',
    ],
    sideEffectsPt: [
      'Dor no local da injeção (75–80%)',
      'Inchaço e vermelhidão no local da injeção',
      'Dor de cabeça (40%)',
      'Fadiga (30%)',
      'Náusea e dor abdominal',
      'Mialgia e artralgia',
      'Febre (5–10%)',
      'Inchaço extenso do membro (incomum)',
    ],
    benefits: [
      'Restores tetanus protection – essential for wound care and injury prevention',
      'Renews diphtheria immunity through adolescence and adulthood',
      'Prevents pertussis transmission from adolescents to infants',
      'Reduces whooping cough morbidity in adolescents',
      'Recommended as cocoon strategy to protect newborns',
      'WHO recommends Td/Tdap booster at adolescence',
    ],
    benefitsPt: [
      'Restaura proteção contra tétano – essencial para cuidado de feridas e prevenção de lesões',
      'Renova imunidade contra difteria durante adolescência e vida adulta',
      'Previne transmissão de coqueluche de adolescentes para bebês',
      'Reduz morbidade por tosse convulsa em adolescentes',
      'Recomendada como estratégia cocoon para proteger recém-nascidos',
      'OMS recomenda reforço Td/Tdap na adolescência',
    ],
    detailedInfo: {
      mechanism:
        'Contains reduced quantities of diphtheria toxoid (≥2 IU) and acellular pertussis antigens (pertussis toxoid, FHA, pertactin) plus tetanus toxoid (≥20 IU). The reduced antigen content minimizes adverse reactions in adolescents/adults while effectively boosting immunity.',
      mechanismPt:
        'Contém quantidades reduzidas de toxoide diftérico (≥2 UI) e antígenos de coqueluche acelular (toxoide pertussis, FHA, pertactina) mais toxoide tetânico (≥20 UI). O conteúdo reduzido de antígenos minimiza reações adversas em adolescentes/adultos enquanto efetivamente reforça a imunidade.',
      composition:
        'Boostrix or Adacel: tetanus toxoid (5–10 Lf), reduced diphtheria toxoid (2–2.5 Lf), acellular pertussis antigens (PT, FHA, pertactin, fimbriae). Adjuvant: aluminum hydroxide/phosphate.',
      compositionPt:
        'Boostrix ou Adacel: toxoide tetânico (5–10 Lf), toxoide diftérico reduzido (2–2,5 Lf), antígenos de coqueluche acelular (PT, FHA, pertactina, fímbrias). Adjuvante: hidróxido/fosfato de alumínio.',
      contraindications: [
        'Encephalopathy within 7 days of a previous pertussis-containing vaccine',
        'Severe allergic reaction to a previous Tdap/DTP/DTaP dose',
        'Progressive neurological disorder (until stabilized)',
      ],
      contraindicationsPt: [
        'Encefalopatia dentro de 7 dias de uma vacina anterior contendo coqueluche',
        'Reação alérgica grave a uma dose anterior de Tdap/DTP/DTPa',
        'Distúrbio neurológico progressivo (até estabilização)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // -- Meningococcal ACWY (11 years) --
  {
    id: 'meningo-acwy',
    name: 'Meningococcal ACWY',
    namePt: 'Meningocócica ACWY',
    nameEn: 'Meningococcal ACWY',
    description:
      'The quadrivalent meningococcal conjugate vaccine (MenACWY) protects against serogroups A, C, W, and Y of Neisseria meningitidis. It is recommended for adolescents as meningococcal disease has a second peak in incidence at 16–21 years. This vaccine is also required for Hajj pilgrimage and recommended for college dormitory residents.',
    descriptionPt:
      'A vacina meningocócica conjugada quadrivalente (MenACWY) protege contra sorogrupos A, C, W e Y de Neisseria meningitidis. É recomendada para adolescentes pois a doença meningocócica tem um segundo pico de incidência entre 16–21 anos. Esta vacina também é exigida para peregrinação ao Hajj e recomendada para residentes de dormitórios universitários.',
    ageMonths: 132,
    ageLabel: '11 years',
    ageLabelPt: '11 anos',
    group: '11y',
    doses: 1,
    doseNumber: 1,
    category: 'recommended',
    sideEffects: [
      'Injection site pain and tenderness (up to 50%)',
      'Headache (30–40%)',
      'Fatigue (25–35%)',
      'Myalgia',
      'Nausea',
      'Fever (5%)',
      'Arthralgia',
      'Anaphylaxis (extremely rare)',
    ],
    sideEffectsPt: [
      'Dor e sensibilidade no local da injeção (até 50%)',
      'Dor de cabeça (30–40%)',
      'Fadiga (25–35%)',
      'Mialgia',
      'Náusea',
      'Febre (5%)',
      'Artralgia',
      'Anafilaxia (extremamente raro)',
    ],
    benefits: [
      'Protects against 4 meningococcal serogroups (A, C, W, Y)',
      'Critical for adolescents – second peak age for meningococcal disease',
      'Required for Hajj pilgrimage and recommended for international travel',
      'Prevents meningococcal meningitis and septicemia',
      'Reduces nasopharyngeal carriage and community transmission',
      'Essential for university/dormitory residents (close-quarter living)',
    ],
    benefitsPt: [
      'Protege contra 4 sorogrupos meningocócicos (A, C, W, Y)',
      'Crítica para adolescentes – segunda faixa etária de pico para doença meningocócica',
      'Exigida para peregrinação ao Hajj e recomendada para viagens internacionais',
      'Previne meningite e septicemia meningocócica',
      'Reduz portação nasofaríngea e transmissão comunitária',
      'Essencial para residentes universitários/dormitórios (convivência em espaços confinados)',
    ],
    detailedInfo: {
      mechanism:
        'Conjugate vaccine linking capsular polysaccharides of serogroups A, C, W-135, and Y to a carrier protein (CRM197, tetanus toxoid, or diphtheria toxoid). Induces T-cell-dependent immune response and immunological memory.',
      mechanismPt:
        'Vacina conjugada ligando polissacarídeos capsulares dos sorogrupos A, C, W-135 e Y a uma proteína carreadora (CRM197, toxoide tetânico ou toxoide diftérico). Induz resposta imune T-dependente e memória imunológica.',
      composition:
        'Menactra or Menveo: meningococcal group A, C, W-135, Y polysaccharides (4–10 mcg each) conjugated to diphtheria toxoid (Menactra) or CRM197 (Menveo). No preservative.',
      compositionPt:
        'Menactra ou Menveo: polissacarídeos meningocócicos grupo A, C, W-135, Y (4–10 mcg cada) conjugados ao toxoide diftérico (Menactra) ou CRM197 (Menveo). Sem conservante.',
      contraindications: [
        'Severe allergic reaction to a previous meningococcal vaccine or any component',
        'Known hypersensitivity to diphtheria toxoid (Menactra) or CRM197 (Menveo)',
        'Moderate to severe acute illness (defer)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma vacina meningocócica anterior ou qualquer componente',
        'Hipersensibilidade conhecida ao toxoide diftérico (Menactra) ou CRM197 (Menveo)',
        'Doença aguda moderada a grave (adiar)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // ============================================================
  // TRAVEL VACCINES
  // ============================================================

  // -- Typhoid (2 years) --
  {
    id: 'typhoid',
    name: 'Typhoid Fever',
    namePt: 'Febre Tifoide',
    nameEn: 'Typhoid Fever',
    description:
      'The typhoid vaccine protects against Salmonella enterica serovar Typhi, which causes typhoid fever – a potentially fatal systemic infection transmitted through contaminated food and water. The WHO recommends typhoid conjugate vaccine (TCV) for children from 6 months of age in endemic countries, and for travelers to high-risk areas.',
    descriptionPt:
      'A vacina contra febre tifoide protege contra Salmonella enterica sorovar Typhi, que causa febre tifoide – uma infecção sistêmica potencialmente fatal transmitida por alimentos e água contaminados. A OMS recomenda a vacina tifoide conjugada (VTC) para crianças a partir de 6 meses em países endêmicos e para viajantes a áreas de alto risco.',
    ageMonths: 24,
    ageLabel: '2 years',
    ageLabelPt: '2 anos',
    group: '2y',
    doses: 1,
    doseNumber: 1,
    category: 'travel',
    sideEffects: [
      'Injection site pain and tenderness (20–30%)',
      'Low-grade fever',
      'Headache',
      'Fatigue and malaise',
      'Myalgia',
      'Nausea or abdominal discomfort',
    ],
    sideEffectsPt: [
      'Dor e sensibilidade no local da injeção (20–30%)',
      'Febre baixa',
      'Dor de cabeça',
      'Fadiga e mal-estar',
      'Mialgia',
      'Náusea ou desconforto abdominal',
    ],
    benefits: [
      'Prevents typhoid fever – a disease with 1% mortality even with treatment',
      'Essential for travelers to South Asia, Africa, and Latin America',
      'Typhoid conjugate vaccine (TCV) provides 85% efficacy',
      'Single dose provides 5+ years of protection',
      'Reduces risk of antimicrobial-resistant typhoid',
      'WHO-prequalified TCV available for endemic country programs',
    ],
    benefitsPt: [
      'Previne febre tifoide – doença com 1% de mortalidade mesmo com tratamento',
      'Essencial para viajantes ao Sul da Ásia, África e América Latina',
      'Vacina tifoide conjugada (VTC) fornece 85% de eficácia',
      'Dose única fornece mais de 5 anos de proteção',
      'Reduz risco de febre tifoide resistente a antimicrobianos',
      'VTC pré-qualificada pela OMS disponível para programas de países endêmicos',
    ],
    detailedInfo: {
      mechanism:
        'Typhoid conjugate vaccine (TCV): Vi capsular polysaccharide of S. Typhi conjugated to tetanus toxoid carrier protein. Induces T-cell-dependent immune response effective in children under 2 years, unlike unconjugated Vi polysaccharide vaccines.',
      mechanismPt:
        'Vacina tifoide conjugada (VTC): polissacarídeo capsular Vi de S. Typhi conjugado à proteína carreadora de toxoide tetânico. Induz resposta imune T-dependente eficaz em crianças menores de 2 anos, diferente das vacinas de polissacarídeo Vi não conjugadas.',
      composition:
        'Typbar-TCV: 25 mcg Vi polysaccharide of S. Typhi conjugated to tetanus toxoid. Adjuvant: none required. Preservative-free single-dose vial.',
      compositionPt:
        'Typbar-TCV: 25 mcg de polissacarídeo Vi de S. Typhi conjugado ao toxoide tetânico. Adjuvante: não necessário. Frasco de dose única sem conservante.',
      contraindications: [
        'Severe allergic reaction to a previous typhoid vaccine dose',
        'Moderate to severe acute febrile illness (defer)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma dose anterior de vacina tifoide',
        'Doença febril aguda moderada a grave (adiar)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // -- Rabies Pre-Exposure (2 years) --
  {
    id: 'rabies-pre',
    name: 'Rabies (Pre-Exposure)',
    namePt: 'Raiva (Pré-Exposição)',
    nameEn: 'Rabies (Pre-Exposure)',
    description:
      'Rabies pre-exposure prophylaxis (PrEP) is recommended for travelers and residents in areas where rabies is endemic, particularly in Africa and Asia. Rabies is 100% fatal once symptoms appear, making prevention critical. The WHO recommends a 2-dose intradermal PrEP schedule on days 0 and 7.',
    descriptionPt:
      'A profilaxia pré-exposição (PrEP) contra raiva é recomendada para viajantes e residentes em áreas onde a raiva é endêmica, particularmente na África e Ásia. A raiva é 100% fatal após o aparecimento de sintomas, tornando a prevenção crítica. A OMS recomenda um esquema de PrEP intradérmica de 2 doses nos dias 0 e 7.',
    ageMonths: 24,
    ageLabel: '2 years',
    ageLabelPt: '2 anos',
    group: '2y',
    doses: 2,
    doseNumber: 1,
    category: 'travel',
    sideEffects: [
      'Injection site pain, redness, and swelling (30–70%)',
      'Headache',
      'Nausea and abdominal pain',
      'Myalgia',
      'Dizziness',
      'Low-grade fever',
      'Allergic reaction (rare)',
    ],
    sideEffectsPt: [
      'Dor, vermelhidão e inchaço no local da injeção (30–70%)',
      'Dor de cabeça',
      'Náusea e dor abdominal',
      'Mialgia',
      'Tontura',
      'Febre baixa',
      'Reação alérgica (raro)',
    ],
    benefits: [
      'Provides baseline immunity against rabies – a 100% fatal disease',
      'Simplifies post-exposure treatment (only 2 booster doses needed instead of full PEP)',
      'Eliminates the need for rabies immunoglobulin (RIG) after exposure – often unavailable in developing countries',
      'Essential for travelers to rabies-endemic areas in Africa and Asia',
      'Important for children who may not report animal bites',
      'WHO-recommended for high-risk populations',
    ],
    benefitsPt: [
      'Fornece imunidade basal contra raiva – uma doença 100% fatal',
      'Simplifica tratamento pós-exposição (apenas 2 doses de reforço necessárias em vez de PEP completa)',
      'Elimina necessidade de imunoglobulina antirrábica (RIG) após exposição – frequentemente indisponível em países em desenvolvimento',
      'Essencial para viajantes a áreas endêmicas de raiva na África e Ásia',
      'Importante para crianças que podem não relatar mordidas de animais',
      'Recomendada pela OMS para populações de alto risco',
    ],
    detailedInfo: {
      mechanism:
        'Inactivated rabies virus vaccine (cell-culture-derived). Induces virus-neutralizing antibodies (VNA) against rabies glycoprotein. Adequate VNA titer (≥0.5 IU/mL) provides protection and simplifies post-exposure management.',
      mechanismPt:
        'Vacina de vírus da raiva inativado (derivada de cultura celular). Induz anticorpos neutralizantes de vírus (VNA) contra glicoproteína da raiva. Título adequado de VNA (≥0,5 UI/mL) fornece proteção e simplifica manejo pós-exposição.',
      composition:
        'Purified Vero cell rabies vaccine (PVRV) or human diploid cell vaccine (HDCV). Contains inactivated rabies virus (Pitman-Moore or PM-1503 strain), ≥2.5 IU per dose. May contain human albumin and traces of neomycin.',
      compositionPt:
        'Vacina antirrábica purificada de células Vero (PVRV) ou vacina de células diploides humanas (HDCV). Contém vírus da raiva inativado (cepa Pitman-Moore ou PM-1503), ≥2,5 UI por dose. Pode conter albumina humana e vestígios de neomicina.',
      contraindications: [
        'Severe allergic reaction to a previous rabies vaccine dose',
        'Known hypersensitivity to any vaccine component (neomycin, human albumin)',
        'Note: There are NO contraindications for post-exposure rabies vaccination – rabies is 100% fatal',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma dose anterior de vacina antirrábica',
        'Hipersensibilidade conhecida a qualquer componente da vacina (neomicina, albumina humana)',
        'Nota: NÃO há contraindicações para vacinação antirrábica pós-exposição – a raiva é 100% fatal',
      ],
      storage: 'Store lyophilized vaccine at +2°C to +8°C. Reconstitute with provided diluent immediately before use. Use within 6 hours of reconstitution.',
      storagePt: 'Armazenar vacina liofilizada a +2°C a +8°C. Reconstituir com diluente fornecido imediatamente antes do uso. Usar dentro de 6 horas da reconstituição.',
    },
  },

  // -- Cholera (2 years) --
  {
    id: 'cholera',
    name: 'Cholera',
    namePt: 'Cólera',
    nameEn: 'Cholera',
    description:
      'The oral cholera vaccine (OCV) protects against Vibrio cholerae serogroups O1 and O139, which cause cholera – an acute diarrheal disease that can kill within hours if untreated. The WHO recommends OCV for endemic areas and during outbreaks. Two doses provide 65% protection for up to 3 years in adults and 5 years in children over 5.',
    descriptionPt:
      'A vacina oral contra cólera (VOC) protege contra Vibrio cholerae sorogrupos O1 e O139, que causam cólera – uma doença diarreica aguda que pode matar em horas se não tratada. A OMS recomenda VOC para áreas endêmicas e durante surtos. Duas doses fornecem 65% de proteção por até 3 anos em adultos e 5 anos em crianças acima de 5.',
    ageMonths: 24,
    ageLabel: '2 years',
    ageLabelPt: '2 anos',
    group: '2y',
    doses: 2,
    doseNumber: 1,
    category: 'travel',
    sideEffects: [
      'Abdominal pain or cramping (most common)',
      'Nausea',
      'Mild diarrhea',
      'Headache',
      'Fatigue',
      'Decreased appetite',
    ],
    sideEffectsPt: [
      'Dor abdominal ou cólicas (mais comum)',
      'Náusea',
      'Diarreia leve',
      'Dor de cabeça',
      'Fadiga',
      'Diminuição do apetite',
    ],
    benefits: [
      'Prevents cholera – a disease that can kill within hours',
      'Oral vaccine – no injection required',
      'Essential for travelers to cholera-endemic regions',
      'Used in WHO-coordinated outbreak response campaigns',
      '65% overall efficacy for 2–3 years',
      'Provides herd protection when high coverage is achieved',
    ],
    benefitsPt: [
      'Previne cólera – uma doença que pode matar em horas',
      'Vacina oral – sem necessidade de injeção',
      'Essencial para viajantes a regiões endêmicas de cólera',
      'Usada em campanhas de resposta a surtos coordenadas pela OMS',
      '65% de eficácia geral por 2–3 anos',
      'Fornece proteção coletiva quando alta cobertura é alcançada',
    ],
    detailedInfo: {
      mechanism:
        'Killed whole-cell oral vaccine (Shanchol, Euvichol). Contains inactivated V. cholerae O1 (Inaba and Ogawa biotypes, classical and El Tor) and O139 organisms. Induces mucosal IgA antibodies in the gut lining, preventing colonization.',
      mechanismPt:
        'Vacina oral de célula inteira morta (Shanchol, Euvichol). Contém V. cholerae O1 inativado (biotipos Inaba e Ogawa, clássico e El Tor) e organismos O139. Induz anticorpos IgA mucosal no revestimento intestinal, prevenindo colonização.',
      composition:
        'Shanchol/Euvichol: inactivated V. cholerae O1 Inaba classical, O1 Inaba El Tor, O1 Ogawa classical, O1 Ogawa El Tor, and O139 (total ~1.5 × 10¹¹ cells). Buffer solution. No preservative.',
      compositionPt:
        'Shanchol/Euvichol: V. cholerae O1 Inaba clássico inativado, O1 Inaba El Tor, O1 Ogawa clássico, O1 Ogawa El Tor e O139 (total ~1,5 × 10¹¹ células). Solução tampão. Sem conservante.',
      contraindications: [
        'Severe allergic reaction to a previous cholera vaccine dose',
        'Acute severe gastroenteritis (defer until resolved)',
        'Children under 1 year of age (limited safety data)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma dose anterior de vacina contra cólera',
        'Gastroenterite aguda grave (adiar até resolução)',
        'Crianças menores de 1 ano (dados de segurança limitados)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze. Single-dose vial for oral administration.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar. Frasco de dose única para administração oral.',
    },
  },

  // -- Japanese Encephalitis (2 years) --
  {
    id: 'japanese-enc',
    name: 'Japanese Encephalitis',
    namePt: 'Encefalite Japonesa',
    nameEn: 'Japanese Encephalitis',
    description:
      'The Japanese encephalitis (JE) vaccine protects against the JE virus, a mosquito-borne flavivirus that is the leading cause of vaccine-preventable encephalitis in Asia. While most JE infections are asymptomatic, 20–30% of clinical cases are fatal, and 30–50% of survivors have permanent neurological damage. Recommended for travelers to endemic areas in Asia and the Western Pacific.',
    descriptionPt:
      'A vacina contra encefalite japonesa (EJ) protege contra o vírus EJ, um flavivírus transmitido por mosquitos que é a principal causa de encefalite prevenível por vacina na Ásia. Embora a maioria das infecções por EJ seja assintomática, 20–30% dos casos clínicos são fatais, e 30–50% dos sobreviventes têm dano neurológico permanente. Recomendada para viajantes a áreas endêmicas na Ásia e Pacífico Ocidental.',
    ageMonths: 24,
    ageLabel: '2 years',
    ageLabelPt: '2 anos',
    group: '2y',
    doses: 2,
    doseNumber: 1,
    category: 'travel',
    sideEffects: [
      'Injection site pain and tenderness',
      'Headache (20–30%)',
      'Myalgia (15–20%)',
      'Fatigue',
      'Fever (5–10%)',
      'Nausea',
      'Rash (uncommon)',
    ],
    sideEffectsPt: [
      'Dor e sensibilidade no local da injeção',
      'Dor de cabeça (20–30%)',
      'Mialgia (15–20%)',
      'Fadiga',
      'Febre (5–10%)',
      'Náusea',
      'Erupção cutânea (incomum)',
    ],
    benefits: [
      'Prevents Japanese encephalitis – 20–30% fatality rate in clinical cases',
      'Prevents devastating neurological sequelae (seizures, paralysis, cognitive impairment)',
      'Essential for travelers to rural areas of Southeast Asia and Western Pacific',
      '96% seroprotection after 2 doses of Ixiaro (Vero cell-derived vaccine)',
      'WHO-recommended for endemic countries and at-risk travelers',
    ],
    benefitsPt: [
      'Previne encefalite japonesa – taxa de letalidade de 20–30% em casos clínicos',
      'Previne sequelas neurológicas devastadoras (convulsões, paralisia, comprometimento cognitivo)',
      'Essencial para viajantes a áreas rurais do Sudeste Asiático e Pacífico Ocidental',
      '96% de soroproteção após 2 doses de Ixiaro (vacina derivada de células Vero)',
      'Recomendada pela OMS para países endêmicos e viajantes em risco',
    ],
    detailedInfo: {
      mechanism:
        'Inactivated Vero cell-derived JE vaccine (Ixiaro/JEEV). Contains formalin-inactivated JE virus (SA14-14-2 strain). Induces neutralizing antibodies against JE virus envelope protein.',
      mechanismPt:
        'Vacina EJ derivada de células Vero inativada (Ixiaro/JEEV). Contém vírus EJ inativado por formalina (cepa SA14-14-2). Induz anticorpos neutralizantes contra a proteína do envelope do vírus EJ.',
      composition:
        'Ixiaro: inactivated JE virus SA14-14-2 strain (6 mcg), adsorbed onto aluminum hydroxide. Contains protamine sulfate, formaldehyde (residual), and bovine serum albumin (residual).',
      compositionPt:
        'Ixiaro: vírus EJ inativado cepa SA14-14-2 (6 mcg), adsorvido em hidróxido de alumínio. Contém sulfato de protamina, formaldeído (residual) e albumina sérica bovina (residual).',
      contraindications: [
        'Severe allergic reaction to a previous JE vaccine dose or any component',
        'Known allergy to protamine sulfate',
        'Moderate to severe acute illness (defer)',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma dose anterior de vacina EJ ou qualquer componente',
        'Alergia conhecida a sulfato de protamina',
        'Doença aguda moderada a grave (adiar)',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze. Protect from light.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar. Proteger da luz.',
    },
  },

  // -- Hepatitis A for Travelers (2 years) --
  {
    id: 'hav-travel',
    name: 'Hepatitis A (Travelers)',
    namePt: 'Hepatite A (Viajantes)',
    nameEn: 'Hepatitis A (Travelers)',
    description:
      'The hepatitis A vaccine for travelers is recommended for individuals traveling from low-endemicity areas to regions with intermediate or high hepatitis A endemicity. A single dose provides 95% protection within 2–4 weeks and is sufficient for most travel itineraries. A second dose 6–12 months later provides long-term protection.',
    descriptionPt:
      'A vacina contra hepatite A para viajantes é recomendada para indivíduos viajando de áreas de baixa endemicidade para regiões com endemicidade intermediária ou alta de hepatite A. Uma dose única fornece 95% de proteção dentro de 2–4 semanas e é suficiente para a maioria dos itinerários de viagem. Uma segunda dose 6–12 meses depois fornece proteção de longo prazo.',
    ageMonths: 24,
    ageLabel: '2 years',
    ageLabelPt: '2 anos',
    group: '2y',
    doses: 1,
    doseNumber: 1,
    category: 'travel',
    sideEffects: [
      'Injection site soreness (50%)',
      'Headache',
      'Fatigue',
      'Loss of appetite',
      'Low-grade fever',
      'Nausea',
    ],
    sideEffectsPt: [
      'Dor no local da injeção (50%)',
      'Dor de cabeça',
      'Fadiga',
      'Perda de apetite',
      'Febre baixa',
      'Náusea',
    ],
    benefits: [
      'Rapid protection – 95% seroconversion within 2–4 weeks',
      'Essential for travel to regions with poor sanitation',
      'Prevents hepatitis A outbreaks among travelers',
      'Single dose sufficient for short-term travel protection',
      'WHO-recommended for travelers to endemic areas',
    ],
    benefitsPt: [
      'Proteção rápida – 95% de soroconversão dentro de 2–4 semanas',
      'Essencial para viagens a regiões com saneamento precário',
      'Previne surtos de hepatite A entre viajantes',
      'Dose única suficiente para proteção de viagem de curto prazo',
      'Recomendada pela OMS para viajantes a áreas endêmicas',
    ],
    detailedInfo: {
      mechanism: 'Same inactivated HAV vaccine as routine hepatitis A vaccination. Induces anti-HAV IgG neutralizing antibodies.',
      mechanismPt: 'Mesma vacina HAV inativada da vacinação rotineira contra hepatite A. Induz anticorpos neutralizantes IgG anti-HAV.',
      composition: 'Same as routine hepatitis A vaccine.',
      compositionPt: 'Mesma que vacina rotineira contra hepatite A.',
      contraindications: [
        'Severe allergic reaction to a previous hepatitis A vaccine dose or any component',
      ],
      contraindicationsPt: [
        'Reação alérgica grave a uma dose anterior da vacina contra hepatite A ou qualquer componente',
      ],
      storage: 'Store at +2°C to +8°C. Do not freeze.',
      storagePt: 'Armazenar a +2°C a +8°C. Não congelar.',
    },
  },

  // -- Yellow Fever Travel Booster (10 years) --
  {
    id: 'yellow-fever-travel',
    name: 'Yellow Fever (Travel Booster)',
    namePt: 'Febre Amarela (Reforço para Viajantes)',
    nameEn: 'Yellow Fever (Travel Booster)',
    description:
      'While the WHO has stated that a single dose of yellow fever vaccine provides lifelong protection (and the International Health Regulations no longer require boosters), some countries may still require proof of recent vaccination. This travel booster dose is recommended for travelers visiting high-risk yellow fever endemic areas who were vaccinated more than 10 years prior, particularly those with immunocompromising conditions.',
    descriptionPt:
      'Embora a OMS tenha declarado que uma dose única da vacina contra febre amarela fornece proteção vitalícia (e o Regulamento Sanitário Internacional não exija mais reforços), alguns países ainda podem exigir comprovante de vacinação recente. Esta dose de reforço para viajantes é recomendada para viajantes visitando áreas endêmicas de alto risco de febre amarela que foram vacinados há mais de 10 anos, particularmente aqueles com condições imunocomprometedoras.',
    ageMonths: 120,
    ageLabel: '10 years',
    ageLabelPt: '10 anos',
    group: '10y',
    doses: 1,
    doseNumber: 1,
    dependsOn: ['yellow-fever'],
    category: 'travel',
    sideEffects: [
      'Low-grade fever',
      'Headache',
      'Injection site pain',
      'Myalgia',
      'Fatigue',
      'YEL-AND (very rare in revaccinees)',
      'YEL-AVD (very rare, primarily first-time vaccines)',
    ],
    sideEffectsPt: [
      'Febre baixa',
      'Dor de cabeça',
      'Dor no local da injeção',
      'Mialgia',
      'Fadiga',
      'YEL-AND (muito raro em revacinados)',
      'YEL-AVD (muito raro, principalmente em vacinados pela primeira vez)',
    ],
    benefits: [
      'Restores optimal antibody levels for high-risk travel',
      'May be required by some countries for entry',
      'Provides renewed International Certificate of Vaccination',
      'Recommended for immunocompromised individuals who may have suboptimal initial response',
      'Peace of mind for travelers to endemic areas',
    ],
    benefitsPt: [
      'Restaura níveis ótimos de anticorpos para viagens de alto risco',
      'Pode ser exigida por alguns países para entrada',
      'Fornece Certificado Internacional de Vacinação renovado',
      'Recomendada para indivíduos imunocomprometidos que podem ter resposta inicial subótima',
      'Tranquilidade para viajantes a áreas endêmicas',
    ],
    detailedInfo: {
      mechanism: 'Same 17D strain live attenuated yellow fever vaccine. Booster dose rapidly reactivates memory immune response.',
      mechanismPt: 'Mesma vacina viva atenuada de febre amarela cepa 17D. Dose de reforço reativa rapidamente resposta imune de memória.',
      composition: 'Same as primary yellow fever vaccine.',
      compositionPt: 'Mesma que vacina primária contra febre amarela.',
      contraindications: [
        'Severe immunodeficiency',
        'Thymus disorders',
        'Severe egg allergy',
        'Pregnancy (relative contraindication)',
        'Infants under 9 months',
      ],
      contraindicationsPt: [
        'Imunodeficiência grave',
        'Distúrbios do timo',
        'Alergia grave a ovo',
        'Gravidez (contraindicação relativa)',
        'Bebês menores de 9 meses',
      ],
      storage: 'Store lyophilized vaccine at +2°C to +8°C. Use within 1 hour of reconstitution.',
      storagePt: 'Armazenar vacina liofilizada a +2°C a +8°C. Usar dentro de 1 hora da reconstituição.',
    },
  },
];
