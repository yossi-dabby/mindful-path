// Mind Games UI translations - game UI strings (prompts, labels, buttons)
// This covers all games for all 7 supported languages

export const mindGamesUiStrings = {
  // English (default - used as fallback)
  common: { try_another: "Try Another" },
  memory_match: {
    title: "Memory Match",
    instructions: "Find all matching pairs by clicking cards.",
    moves: "Moves",
    complete_title: "Well done!",
    complete_message: "You completed the memory game in {{moves}} moves."
  },
  focus_flow: {
    title: "Focus Flow",
    instructions: "Watch the sequence carefully, then repeat it.",
    watch_carefully: "Watch carefully...",
    level: "Level",
    game_over: "Good effort!",
    final_score: "You reached level {{score}}.",
    colors: { teal: "Teal", lavender: "Lavender", coral: "Coral", sage: "Sage" }
  },
  pattern_shift: {
    title: "Pattern Shift",
    complete_title: "Pattern Master!",
    complete_message: "You got {{score}} out of {{total}} patterns correct.",
    patterns: [
      { question: "What comes next in the pattern: Red, Blue, Green, Red, Blue, ?" },
      { question: "Which shape completes the pattern: Circle, Square, ?, Circle?" },
      { question: "What size comes next: Large, Medium, ?, Large?" },
      { question: "Continue the pattern: 1, 2, 3, 1, ?" }
    ]
  },
  word_association: {
    title: "Word Association",
    instructions: "Quickly think of a word related to the one shown. Complete 5 associations.",
    prompt: "What word comes to mind?",
    input_placeholder: "Type your association...",
    submit: "Submit",
    your_chain: "Your chain:",
    complete_title: "Creative thinking!",
    complete_message: "You've created a unique chain of associations.",
    start_words: ["Calm", "Growth", "Strength", "Joy", "Peace", "Courage", "Hope", "Balance"]
  },
  number_sequence: {
    title: "Number Sequence",
    instructions: "Find the pattern and predict the next number.",
    answer_placeholder: "Your answer",
    check: "Check",
    correct: "Correct!",
    incorrect: "Not quite. The answer is {{answer}}.",
    complete_title: "Sequence solved!",
    complete_message: "You got {{score}} out of {{total}} sequences correct.",
    sequences: [
      { rule: "Pattern: Add 2 each time" },
      { rule: "Pattern: Add increasing numbers (1, 2, 3, 4, 5)" },
      { rule: "Pattern: Multiples of 5" },
      { rule: "Pattern: Add 1, then 2, then 3, then 4" },
      { rule: "Pattern: Multiply by 2 each time" }
    ]
  },
  reframe_pick: {
    situation: "Situation:",
    automatic_thought: "Automatic thought:",
    choose: "Choose the most balanced response:",
    why_label: "Why this works:"
  },
  evidence_balance: {
    thought_label: "Thought:",
    for_label: "Evidence FOR:",
    against_label: "Evidence AGAINST:",
    show_conclusion: "Show Balanced Conclusion",
    conclusion_label: "Balanced Conclusion:"
  },
  quick_win: {
    log_prompt: "Log one small win from today:",
    input_placeholder: "Type your win...",
    log_button: "Log",
    preset_prompt: "Or pick a common win:",
    success_message: "Win logged! Keep building momentum."
  },
  opposite_action: {
    emotion_label: "Emotion:",
    urge_label: "Urge:",
    opposite_label: "Opposite Action:",
    pick_step: "Pick one small step:",
    note_label: "Note:"
  },
  urge_surfing: {
    completed: "Completed: {{count}}",
    guided: "Guided",
    independent: "Independent",
    finish_prompt: "After surfing, pick one:",
    success: "✓ Good! Urges rise and fall. You rode the wave."
  },
  value_compass: {
    pick_value: "Pick a value that matters to you right now:",
    your_value: "Your Value: {{value}}",
    pick_action: "Choose one tiny action aligned with this value:",
    success: "✓ Great! Small value-based actions build a meaningful life.",
    reset: "Pick Different Value"
  },
  tiny_experiment: {
    belief_label: "Belief to test:",
    pick_experiment: "Pick one tiny experiment (2 min max):",
    success: "✓ Experiments collect data. Even 'negative' results teach you something valuable."
  },
  worry_time: {
    current_worry: "Current Worry:",
    park_it: "Park it:",
    tiny_step: "Do this tiny step now:",
    success: "✓ Great! You parked the worry and took a present-moment action."
  },
  dbt_stop: {
    trigger: "Trigger:",
    next_step: "Choose one wise next step:",
    chosen: "✓ You chose: {{step}}"
  },
  defusion_cards: {
    sticky_thought: "Sticky Thought:",
    prompt: "Try one defusion line:",
    success: "Nice! You created space between you and the thought. Notice: you can observe it without being controlled by it.",
    next_card: "Next Card"
  },
  calm_bingo: {
    prompt: "Mark 2 actions you'll do now:",
    success: "✓ Mini round complete! Take a moment to do these now."
  },
  tipp_skills: {
    prompt: "When you need to change your body chemistry fast:",
    pick_action: "Pick one to try right now:",
    success: "✓ Great! TIPP skills change your physiology to reduce emotional intensity."
  },
  accepts: {
    prompt: "When you need to distract from overwhelming emotions, use ACCEPTS:",
    try_now: "Try this now:"
  },
  improve: {
    prompt: "IMPROVE the moment when you're in crisis and need to shift your state:",
    quick_action: "Quick Action:"
  },
  self_soothe: {
    prompt: "Self-soothe with your 5 senses to create moments of comfort and safety.",
    back: "← Back to senses",
    success: "✓ Take a moment to fully experience this. Self-soothing is a gift you give yourself."
  }
};

export const mindGamesUiByLanguage = {
  he: {
    common: { try_another: "נסה אחר" },
    reframe_pick: {
      situation: "מצב:",
      automatic_thought: "מחשבה אוטומטית:",
      choose: "בחרו את התגובה המאוזנת ביותר:",
      why_label: "למה זה עובד:"
    },
    evidence_balance: {
      thought_label: "מחשבה:",
      for_label: "ראיות בעד:",
      against_label: "ראיות נגד:",
      show_conclusion: "הצג מסקנה מאוזנת",
      conclusion_label: "מסקנה מאוזנת:"
    },
    memory_match: {
      title: "התאמת זיכרון",
      instructions: "מצאו את כל הזוגות התואמים על ידי לחיצה על קלפים.",
      moves: "מהלכים",
      complete_title: "כל הכבוד!",
      complete_message: "השלמתם את משחק הזיכרון ב-{{moves}} מהלכים."
    },
    focus_flow: {
      title: "זרימת מיקוד",
      instructions: "צפו ברצף בעיון, ואז חזרו עליו.",
      watch_carefully: "צפו בעיון...",
      level: "רמה",
      game_over: "מאמץ טוב!",
      final_score: "הגעתם לרמה {{score}}.",
      colors: { teal: "טורקיז", lavender: "לבנדר", coral: "אלמוג", sage: "מרווה" }
    },
    pattern_shift: {
      title: "שינוי דפוסים",
      complete_title: "אמן דפוסים!",
      complete_message: "קיבלתם {{score}} מתוך {{total}} דפוסים נכון.",
      patterns: [
        { question: "מה בא הבא בדפוס: אדום, כחול, ירוק, אדום, כחול, ?" },
        { question: "איזו צורה משלימה את הדפוס: עיגול, ריבוע, ?, עיגול?" },
        { question: "איזה גודל בא הבא: גדול, בינוני, ?, גדול?" },
        { question: "המשיכו את הדפוס: 1, 2, 3, 1, ?" }
      ]
    },
    word_association: {
      title: "קישור מילים",
      instructions: "חשבו במהירות על מילה הקשורה לזו המוצגת. השלימו 5 קישורים.",
      prompt: "איזו מילה עולה בראש?",
      input_placeholder: "הקלידו את הקישור שלכם...",
      submit: "שלח",
      your_chain: "השרשרת שלכם:",
      complete_title: "חשיבה יצירתית!",
      complete_message: "יצרתם שרשרת ייחודית של קישורים.",
      start_words: ["רוגע", "צמיחה", "כוח", "שמחה", "שלום", "אומץ", "תקווה", "איזון"]
    },
    number_sequence: {
      title: "רצף מספרים",
      instructions: "מצאו את הדפוס וחזו את המספר הבא.",
      answer_placeholder: "התשובה שלכם",
      check: "בדוק",
      correct: "נכון!",
      incorrect: "לא בדיוק. התשובה היא {{answer}}.",
      complete_title: "רצף נפתר!",
      complete_message: "קיבלתם {{score}} מתוך {{total}} רצפים נכון.",
      sequences: [
        { rule: "דפוס: הוסף 2 בכל פעם" },
        { rule: "דפוס: הוסף מספרים עולים (1, 2, 3, 4, 5)" },
        { rule: "דפוס: כפולות של 5" },
        { rule: "דפוס: הוסף 1, אז 2, אז 3, אז 4" },
        { rule: "דפוס: הכפל ב-2 בכל פעם" }
      ]
    },
    quick_win: {
      log_prompt: "רשום ניצחון קטן אחד מהיום:",
      input_placeholder: "הקלד את הניצחון שלך...",
      log_button: "רשום",
      preset_prompt: "או בחר ניצחון נפוץ:",
      success_message: "ניצחון נרשם! המשך לבנות תנופה."
    },
    opposite_action: {
      emotion_label: "רגש:",
      urge_label: "דחף:",
      opposite_label: "פעולה הפוכה:",
      pick_step: "בחר צעד קטן אחד:",
      note_label: "הערה:"
    },
    urge_surfing: {
      completed: "הושלם: {{count}}",
      guided: "מודרך",
      independent: "עצמאי",
      finish_prompt: "אחרי הגלישה, בחר אחד:",
      success: "✓ טוב! דחפים עולים ויורדים. רכבת על הגל."
    },
    value_compass: {
      pick_value: "בחר ערך שחשוב לך עכשיו:",
      your_value: "הערך שלך: {{value}}",
      pick_action: "בחר פעולה קטנה אחת המיושרת עם הערך הזה:",
      success: "✓ נהדר! פעולות קטנות מבוססות ערכים בונות חיים משמעותיים.",
      reset: "בחר ערך אחר"
    },
    tiny_experiment: {
      belief_label: "אמונה לבדיקה:",
      pick_experiment: "בחר ניסוי קטן אחד (מקסימום 2 דקות):",
      success: "✓ ניסויים אוספים נתונים. גם תוצאות 'שליליות' מלמדות אותך משהו יקר."
    },
    worry_time: {
      current_worry: "דאגה נוכחית:",
      park_it: "חנה אותה:",
      tiny_step: "עשה את הצעד הקטן הזה עכשיו:",
      success: "✓ נהדר! חנית את הדאגה ולקחת פעולה ברגע הנוכחי."
    },
    dbt_stop: {
      trigger: "טריגר:",
      next_step: "בחר צעד חכם אחד הבא:",
      chosen: "✓ בחרת: {{step}}"
    },
    defusion_cards: {
      sticky_thought: "מחשבה דביקה:",
      prompt: "נסה שורת דפיוזן אחת:",
      success: "יפה! יצרת מרחב בינך לבין המחשבה. שים לב: אתה יכול להתבונן בה מבלי שהיא שולטת בך.",
      next_card: "קלף הבא"
    },
    calm_bingo: {
      prompt: "סמן 2 פעולות שתעשה עכשיו:",
      success: "✓ סיבוב מיני הושלם! קח רגע לעשות אלה עכשיו."
    },
    tipp_skills: {
      prompt: "כאשר אתה צריך לשנות את כימיית הגוף שלך במהירות:",
      pick_action: "בחר אחד לנסות עכשיו:",
      success: "✓ נהדר! מיומנויות TIPP משנות את הפיזיולוגיה שלך כדי להפחית עוצמה רגשית."
    },
    accepts: {
      prompt: "כאשר אתה צריך להסיח את הדעת מרגשות מכריעים, השתמש ב-ACCEPTS:",
      try_now: "נסה את זה עכשיו:"
    },
    improve: {
      prompt: "שפר את הרגע כאשר אתה במשבר וצריך לשנות מצב:",
      quick_action: "פעולה מהירה:"
    },
    self_soothe: {
      prompt: "הרגע עצמך עם 5 החושים שלך כדי ליצור רגעים של נוחות ובטחון.",
      back: "← חזרה לחושים",
      success: "✓ קח רגע לחוות את זה במלואו. הרגעה עצמית היא מתנה שאתה נותן לעצמך."
    }
  },
  es: {
    common: { try_another: "Probar Otro" },
    reframe_pick: {
      situation: "Situación:",
      automatic_thought: "Pensamiento automático:",
      choose: "Elige la respuesta más equilibrada:",
      why_label: "Por qué funciona:"
    },
    evidence_balance: {
      thought_label: "Pensamiento:",
      for_label: "Evidencia A FAVOR:",
      against_label: "Evidencia EN CONTRA:",
      show_conclusion: "Mostrar conclusión equilibrada",
      conclusion_label: "Conclusión equilibrada:"
    },
    memory_match: {
      title: "Emparejamiento de Memoria",
      instructions: "Encuentra todos los pares coincidentes haciendo clic en las cartas.",
      moves: "Movimientos",
      complete_title: "¡Bien hecho!",
      complete_message: "Completaste el juego de memoria en {{moves}} movimientos."
    },
    focus_flow: {
      title: "Flujo de Enfoque",
      instructions: "Observa la secuencia con cuidado, luego repítela.",
      watch_carefully: "Observa con cuidado...",
      level: "Nivel",
      game_over: "¡Buen esfuerzo!",
      final_score: "Alcanzaste el nivel {{score}}.",
      colors: { teal: "Verde azulado", lavender: "Lavanda", coral: "Coral", sage: "Salvia" }
    },
    pattern_shift: {
      title: "Cambio de Patrón",
      complete_title: "¡Maestro de patrones!",
      complete_message: "Acertaste {{score}} de {{total}} patrones.",
      patterns: [
        { question: "¿Qué sigue en el patrón: Rojo, Azul, Verde, Rojo, Azul, ?" },
        { question: "¿Qué forma completa el patrón: Círculo, Cuadrado, ?, Círculo?" },
        { question: "¿Qué tamaño sigue: Grande, Mediano, ?, Grande?" },
        { question: "Continúa el patrón: 1, 2, 3, 1, ?" }
      ]
    },
    word_association: {
      title: "Asociación de Palabras",
      instructions: "Piensa rápidamente en una palabra relacionada con la mostrada. Completa 5 asociaciones.",
      prompt: "¿Qué palabra viene a la mente?",
      input_placeholder: "Escribe tu asociación...",
      submit: "Enviar",
      your_chain: "Tu cadena:",
      complete_title: "¡Pensamiento creativo!",
      complete_message: "Has creado una cadena única de asociaciones.",
      start_words: ["Calma", "Crecimiento", "Fuerza", "Alegría", "Paz", "Coraje", "Esperanza", "Balance"]
    },
    number_sequence: {
      title: "Secuencia Numérica",
      instructions: "Encuentra el patrón y predice el siguiente número.",
      answer_placeholder: "Tu respuesta",
      check: "Verificar",
      correct: "¡Correcto!",
      incorrect: "No exactamente. La respuesta es {{answer}}.",
      complete_title: "¡Secuencia resuelta!",
      complete_message: "Acertaste {{score}} de {{total}} secuencias.",
      sequences: [
        { rule: "Patrón: Sumar 2 cada vez" },
        { rule: "Patrón: Sumar números crecientes (1, 2, 3, 4, 5)" },
        { rule: "Patrón: Múltiplos de 5" },
        { rule: "Patrón: Sumar 1, luego 2, luego 3, luego 4" },
        { rule: "Patrón: Multiplicar por 2 cada vez" }
      ]
    },
    quick_win: { log_prompt: "Registra una pequeña victoria de hoy:", input_placeholder: "Escribe tu victoria...", log_button: "Registrar", preset_prompt: "O elige una victoria común:", success_message: "¡Victoria registrada! Sigue construyendo impulso." },
    opposite_action: { emotion_label: "Emoción:", urge_label: "Impulso:", opposite_label: "Acción Opuesta:", pick_step: "Elige un pequeño paso:", note_label: "Nota:" },
    urge_surfing: { completed: "Completado: {{count}}", guided: "Guiado", independent: "Independiente", finish_prompt: "Después de surfear, elige uno:", success: "✓ ¡Bien! Los impulsos suben y bajan. Montaste la ola." },
    value_compass: { pick_value: "Elige un valor que te importe ahora mismo:", your_value: "Tu Valor: {{value}}", pick_action: "Elige una pequeña acción alineada con este valor:", success: "✓ ¡Genial! Las pequeñas acciones basadas en valores construyen una vida significativa.", reset: "Elegir Valor Diferente" },
    tiny_experiment: { belief_label: "Creencia a probar:", pick_experiment: "Elige un experimento pequeño (máx. 2 min):", success: "✓ Los experimentos recopilan datos. Incluso los resultados 'negativos' te enseñan algo valioso." },
    worry_time: { current_worry: "Preocupación Actual:", park_it: "Apárcala:", tiny_step: "Haz este pequeño paso ahora:", success: "✓ ¡Genial! Aparcaste la preocupación y tomaste una acción en el momento presente." },
    dbt_stop: { trigger: "Desencadenante:", next_step: "Elige un sabio próximo paso:", chosen: "✓ Elegiste: {{step}}" },
    defusion_cards: { sticky_thought: "Pensamiento Pegajoso:", prompt: "Prueba una línea de defusión:", success: "¡Bien! Creaste espacio entre tú y el pensamiento. Nota: puedes observarlo sin ser controlado por él.", next_card: "Siguiente Carta" },
    calm_bingo: { prompt: "Marca 2 acciones que harás ahora:", success: "✓ ¡Mini ronda completa! Tómate un momento para hacer estas ahora." },
    tipp_skills: { prompt: "Cuando necesites cambiar tu química corporal rápidamente:", pick_action: "Elige uno para probar ahora mismo:", success: "✓ ¡Genial! Las habilidades TIPP cambian tu fisiología para reducir la intensidad emocional." },
    accepts: { prompt: "Cuando necesites distraerte de emociones abrumadoras, usa ACCEPTS:", try_now: "Prueba esto ahora:" },
    improve: { prompt: "MEJORA el momento cuando estás en crisis y necesitas cambiar tu estado:", quick_action: "Acción Rápida:" },
    self_soothe: { prompt: "Autocálmate con tus 5 sentidos para crear momentos de comodidad y seguridad.", back: "← Volver a los sentidos", success: "✓ Tómate un momento para experimentar esto plenamente. El autocalmado es un regalo que te das a ti mismo." }
  },
  fr: {
    common: { try_another: "Essayer un autre" },
    reframe_pick: {
      situation: "Situation :",
      automatic_thought: "Pensée automatique :",
      choose: "Choisissez la réponse la plus équilibrée :",
      why_label: "Pourquoi ça marche :"
    },
    evidence_balance: {
      thought_label: "Pensée :",
      for_label: "Preuves POUR :",
      against_label: "Preuves CONTRE :",
      show_conclusion: "Afficher la conclusion équilibrée",
      conclusion_label: "Conclusion équilibrée :"
    },
    memory_match: {
      title: "Correspondance de Mémoire",
      instructions: "Trouvez toutes les paires correspondantes en cliquant sur les cartes.",
      moves: "Mouvements",
      complete_title: "Bien joué !",
      complete_message: "Vous avez terminé le jeu de mémoire en {{moves}} mouvements."
    },
    focus_flow: {
      title: "Flux de Concentration",
      instructions: "Regardez attentivement la séquence, puis répétez-la.",
      watch_carefully: "Regardez attentivement...",
      level: "Niveau",
      game_over: "Bon effort !",
      final_score: "Vous avez atteint le niveau {{score}}.",
      colors: { teal: "Sarcelle", lavender: "Lavande", coral: "Corail", sage: "Sauge" }
    },
    pattern_shift: {
      title: "Changement de Motif",
      complete_title: "Maître des motifs !",
      complete_message: "Vous avez obtenu {{score}} motifs corrects sur {{total}}.",
      patterns: [
        { question: "Que vient ensuite dans le motif : Rouge, Bleu, Vert, Rouge, Bleu, ?" },
        { question: "Quelle forme complète le motif : Cercle, Carré, ?, Cercle ?" },
        { question: "Quelle taille vient ensuite : Grand, Moyen, ?, Grand ?" },
        { question: "Continuez le motif : 1, 2, 3, 1, ?" }
      ]
    },
    word_association: {
      title: "Association de Mots",
      instructions: "Pensez rapidement à un mot lié à celui montré. Complétez 5 associations.",
      prompt: "Quel mot vous vient à l'esprit ?",
      input_placeholder: "Tapez votre association...",
      submit: "Soumettre",
      your_chain: "Votre chaîne :",
      complete_title: "Pensée créative !",
      complete_message: "Vous avez créé une chaîne unique d'associations.",
      start_words: ["Calme", "Croissance", "Force", "Joie", "Paix", "Courage", "Espoir", "Équilibre"]
    },
    number_sequence: {
      title: "Séquence de Nombres",
      instructions: "Trouvez le motif et prédisez le nombre suivant.",
      answer_placeholder: "Votre réponse",
      check: "Vérifier",
      correct: "Correct !",
      incorrect: "Pas tout à fait. La réponse est {{answer}}.",
      complete_title: "Séquence résolue !",
      complete_message: "Vous avez obtenu {{score}} séquences correctes sur {{total}}.",
      sequences: [
        { rule: "Motif : Ajouter 2 à chaque fois" },
        { rule: "Motif : Ajouter des nombres croissants (1, 2, 3, 4, 5)" },
        { rule: "Motif : Multiples de 5" },
        { rule: "Motif : Ajouter 1, puis 2, puis 3, puis 4" },
        { rule: "Motif : Multiplier par 2 à chaque fois" }
      ]
    },
    quick_win: { log_prompt: "Notez une petite victoire d'aujourd'hui :", input_placeholder: "Tapez votre victoire...", log_button: "Noter", preset_prompt: "Ou choisissez une victoire courante :", success_message: "Victoire notée ! Continuez à construire l'élan." },
    opposite_action: { emotion_label: "Émotion :", urge_label: "Impulsion :", opposite_label: "Action Opposée :", pick_step: "Choisissez un petit pas :", note_label: "Note :" },
    urge_surfing: { completed: "Terminé : {{count}}", guided: "Guidé", independent: "Indépendant", finish_prompt: "Après avoir surfé, choisissez-en un :", success: "✓ Bien ! Les impulsions montent et descendent. Vous avez chevauché la vague." },
    value_compass: { pick_value: "Choisissez une valeur qui vous importe maintenant :", your_value: "Votre Valeur : {{value}}", pick_action: "Choisissez une petite action alignée avec cette valeur :", success: "✓ Super ! Les petites actions basées sur les valeurs construisent une vie significative.", reset: "Choisir une Valeur Différente" },
    tiny_experiment: { belief_label: "Croyance à tester :", pick_experiment: "Choisissez une petite expérience (max. 2 min) :", success: "✓ Les expériences collectent des données. Même les résultats 'négatifs' vous apprennent quelque chose de précieux." },
    worry_time: { current_worry: "Inquiétude Actuelle :", park_it: "Garez-la :", tiny_step: "Faites ce petit pas maintenant :", success: "✓ Super ! Vous avez garé l'inquiétude et pris une action dans le moment présent." },
    dbt_stop: { trigger: "Déclencheur :", next_step: "Choisissez une sage prochaine étape :", chosen: "✓ Vous avez choisi : {{step}}" },
    defusion_cards: { sticky_thought: "Pensée Collante :", prompt: "Essayez une ligne de défusion :", success: "Bien ! Vous avez créé de l'espace entre vous et la pensée. Notez : vous pouvez l'observer sans en être contrôlé.", next_card: "Carte Suivante" },
    calm_bingo: { prompt: "Cochez 2 actions que vous ferez maintenant :", success: "✓ Mini tour terminé ! Prenez un moment pour faire ces choses maintenant." },
    tipp_skills: { prompt: "Quand vous avez besoin de changer votre chimie corporelle rapidement :", pick_action: "Choisissez-en un à essayer maintenant :", success: "✓ Super ! Les compétences TIPP changent votre physiologie pour réduire l'intensité émotionnelle." },
    accepts: { prompt: "Quand vous avez besoin de vous distraire des émotions accablantes, utilisez ACCEPTS :", try_now: "Essayez ceci maintenant :" },
    improve: { prompt: "AMÉLIOREZ le moment quand vous êtes en crise et avez besoin de changer d'état :", quick_action: "Action Rapide :" },
    self_soothe: { prompt: "Apaisez-vous avec vos 5 sens pour créer des moments de confort et de sécurité.", back: "← Retour aux sens", success: "✓ Prenez un moment pour vivre cela pleinement. L'auto-apaisement est un cadeau que vous vous offrez." }
  },
  de: {
    common: { try_another: "Anderes versuchen" },
    reframe_pick: {
      situation: "Situation:",
      automatic_thought: "Automatischer Gedanke:",
      choose: "Wählen Sie die ausgewogenste Antwort:",
      why_label: "Warum das funktioniert:"
    },
    evidence_balance: {
      thought_label: "Gedanke:",
      for_label: "Beweise DAFÜR:",
      against_label: "Beweise DAGEGEN:",
      show_conclusion: "Ausgewogene Schlussfolgerung anzeigen",
      conclusion_label: "Ausgewogene Schlussfolgerung:"
    },
    memory_match: {
      title: "Gedächtnis-Match",
      instructions: "Finden Sie alle passenden Paare, indem Sie auf Karten klicken.",
      moves: "Züge",
      complete_title: "Gut gemacht!",
      complete_message: "Sie haben das Gedächtnisspiel in {{moves}} Zügen abgeschlossen."
    },
    focus_flow: {
      title: "Fokus-Fluss",
      instructions: "Beobachten Sie die Sequenz sorgfältig und wiederholen Sie sie dann.",
      watch_carefully: "Beobachten Sie sorgfältig...",
      level: "Stufe",
      game_over: "Gute Leistung!",
      final_score: "Sie haben Stufe {{score}} erreicht.",
      colors: { teal: "Türkis", lavender: "Lavendel", coral: "Koralle", sage: "Salbei" }
    },
    pattern_shift: {
      title: "Muster-Wechsel",
      complete_title: "Muster-Meister!",
      complete_message: "Sie haben {{score}} von {{total}} Mustern richtig erkannt.",
      patterns: [
        { question: "Was kommt als nächstes im Muster: Rot, Blau, Grün, Rot, Blau, ?" },
        { question: "Welche Form vervollständigt das Muster: Kreis, Quadrat, ?, Kreis?" },
        { question: "Welche Größe kommt als nächstes: Groß, Mittel, ?, Groß?" },
        { question: "Setzen Sie das Muster fort: 1, 2, 3, 1, ?" }
      ]
    },
    word_association: {
      title: "Wort-Assoziation",
      instructions: "Denken Sie schnell an ein Wort, das mit dem gezeigten verwandt ist. Vervollständigen Sie 5 Assoziationen.",
      prompt: "Welches Wort kommt Ihnen in den Sinn?",
      input_placeholder: "Geben Sie Ihre Assoziation ein...",
      submit: "Senden",
      your_chain: "Ihre Kette:",
      complete_title: "Kreatives Denken!",
      complete_message: "Sie haben eine einzigartige Kette von Assoziationen erstellt.",
      start_words: ["Ruhe", "Wachstum", "Stärke", "Freude", "Frieden", "Mut", "Hoffnung", "Balance"]
    },
    number_sequence: {
      title: "Zahlenfolge",
      instructions: "Finden Sie das Muster und sagen Sie die nächste Zahl voraus.",
      answer_placeholder: "Ihre Antwort",
      check: "Prüfen",
      correct: "Richtig!",
      incorrect: "Nicht ganz. Die Antwort ist {{answer}}.",
      complete_title: "Sequenz gelöst!",
      complete_message: "Sie haben {{score}} von {{total}} Sequenzen richtig.",
      sequences: [
        { rule: "Muster: Jedes Mal 2 addieren" },
        { rule: "Muster: Steigende Zahlen addieren (1, 2, 3, 4, 5)" },
        { rule: "Muster: Vielfache von 5" },
        { rule: "Muster: 1 addieren, dann 2, dann 3, dann 4" },
        { rule: "Muster: Jedes Mal mit 2 multiplizieren" }
      ]
    },
    quick_win: { log_prompt: "Notieren Sie einen kleinen Erfolg von heute:", input_placeholder: "Geben Sie Ihren Erfolg ein...", log_button: "Notieren", preset_prompt: "Oder wählen Sie einen häufigen Erfolg:", success_message: "Erfolg notiert! Bauen Sie weiter Schwung auf." },
    opposite_action: { emotion_label: "Emotion:", urge_label: "Drang:", opposite_label: "Gegenteilige Aktion:", pick_step: "Wählen Sie einen kleinen Schritt:", note_label: "Hinweis:" },
    urge_surfing: { completed: "Abgeschlossen: {{count}}", guided: "Geführt", independent: "Unabhängig", finish_prompt: "Nach dem Surfen, wählen Sie eines:", success: "✓ Gut! Dränge steigen und fallen. Sie haben die Welle geritten." },
    value_compass: { pick_value: "Wählen Sie einen Wert, der Ihnen jetzt wichtig ist:", your_value: "Ihr Wert: {{value}}", pick_action: "Wählen Sie eine kleine Aktion, die mit diesem Wert übereinstimmt:", success: "✓ Super! Kleine wertbasierte Aktionen bauen ein bedeutungsvolles Leben auf.", reset: "Anderen Wert Wählen" },
    tiny_experiment: { belief_label: "Zu testende Überzeugung:", pick_experiment: "Wählen Sie ein kleines Experiment (max. 2 Min.):", success: "✓ Experimente sammeln Daten. Auch 'negative' Ergebnisse lehren Sie etwas Wertvolles." },
    worry_time: { current_worry: "Aktuelle Sorge:", park_it: "Parken Sie sie:", tiny_step: "Machen Sie diesen kleinen Schritt jetzt:", success: "✓ Super! Sie haben die Sorge geparkt und eine Handlung im gegenwärtigen Moment ergriffen." },
    dbt_stop: { trigger: "Auslöser:", next_step: "Wählen Sie einen weisen nächsten Schritt:", chosen: "✓ Sie wählten: {{step}}" },
    defusion_cards: { sticky_thought: "Klebriger Gedanke:", prompt: "Versuchen Sie eine Defusions-Zeile:", success: "Gut! Sie haben Raum zwischen sich und dem Gedanken geschaffen. Beachten Sie: Sie können ihn beobachten, ohne von ihm kontrolliert zu werden.", next_card: "Nächste Karte" },
    calm_bingo: { prompt: "Markieren Sie 2 Aktionen, die Sie jetzt tun werden:", success: "✓ Mini-Runde abgeschlossen! Nehmen Sie sich einen Moment, um diese jetzt zu tun." },
    tipp_skills: { prompt: "Wenn Sie Ihre Körperchemie schnell ändern müssen:", pick_action: "Wählen Sie eines, das Sie jetzt ausprobieren möchten:", success: "✓ Super! TIPP-Fähigkeiten ändern Ihre Physiologie, um emotionale Intensität zu reduzieren." },
    accepts: { prompt: "Wenn Sie sich von überwältigenden Emotionen ablenken müssen, verwenden Sie ACCEPTS:", try_now: "Versuchen Sie dies jetzt:" },
    improve: { prompt: "VERBESSERN Sie den Moment, wenn Sie in einer Krise sind und Ihren Zustand ändern müssen:", quick_action: "Schnelle Aktion:" },
    self_soothe: { prompt: "Beruhigen Sie sich mit Ihren 5 Sinnen, um Momente des Komforts und der Sicherheit zu schaffen.", back: "← Zurück zu den Sinnen", success: "✓ Nehmen Sie sich einen Moment, um dies vollständig zu erleben. Selbstberuhigung ist ein Geschenk, das Sie sich selbst machen." }
  },
  it: {
    common: { try_another: "Prova un altro" },
    memory_match: {
      title: "Abbinamento di Memoria",
      instructions: "Trova tutte le coppie corrispondenti facendo clic sulle carte.",
      moves: "Mosse",
      complete_title: "Ben fatto!",
      complete_message: "Hai completato il gioco di memoria in {{moves}} mosse."
    },
    focus_flow: {
      title: "Flusso di Concentrazione",
      instructions: "Osserva attentamente la sequenza, poi ripetila.",
      watch_carefully: "Osserva attentamente...",
      level: "Livello",
      game_over: "Buon sforzo!",
      final_score: "Hai raggiunto il livello {{score}}.",
      colors: { teal: "Turchese", lavender: "Lavanda", coral: "Corallo", sage: "Salvia" }
    },
    pattern_shift: {
      title: "Cambio di Schema",
      complete_title: "Maestro di schemi!",
      complete_message: "Hai indovinato {{score}} schemi su {{total}}.",
      patterns: [
        { question: "Cosa viene dopo nel modello: Rosso, Blu, Verde, Rosso, Blu, ?" },
        { question: "Quale forma completa il modello: Cerchio, Quadrato, ?, Cerchio?" },
        { question: "Quale dimensione viene dopo: Grande, Medio, ?, Grande?" },
        { question: "Continua il modello: 1, 2, 3, 1, ?" }
      ]
    },
    word_association: {
      title: "Associazione di Parole",
      instructions: "Pensa rapidamente a una parola correlata a quella mostrata. Completa 5 associazioni.",
      prompt: "Quale parola ti viene in mente?",
      input_placeholder: "Digita la tua associazione...",
      submit: "Invia",
      your_chain: "La tua catena:",
      complete_title: "Pensiero creativo!",
      complete_message: "Hai creato una catena unica di associazioni.",
      start_words: ["Calma", "Crescita", "Forza", "Gioia", "Pace", "Coraggio", "Speranza", "Equilibrio"]
    },
    number_sequence: {
      title: "Sequenza di Numeri",
      instructions: "Trova il modello e prevedi il numero successivo.",
      answer_placeholder: "La tua risposta",
      check: "Controlla",
      correct: "Corretto!",
      incorrect: "Non proprio. La risposta è {{answer}}.",
      complete_title: "Sequenza risolta!",
      complete_message: "Hai indovinato {{score}} sequenze su {{total}}.",
      sequences: [
        { rule: "Modello: Aggiungi 2 ogni volta" },
        { rule: "Modello: Aggiungi numeri crescenti (1, 2, 3, 4, 5)" },
        { rule: "Modello: Multipli di 5" },
        { rule: "Modello: Aggiungi 1, poi 2, poi 3, poi 4" },
        { rule: "Modello: Moltiplica per 2 ogni volta" }
      ]
    },
    quick_win: { log_prompt: "Registra una piccola vittoria di oggi:", input_placeholder: "Scrivi la tua vittoria...", log_button: "Registra", preset_prompt: "O scegli una vittoria comune:", success_message: "Vittoria registrata! Continua a costruire slancio." },
    opposite_action: { emotion_label: "Emozione:", urge_label: "Impulso:", opposite_label: "Azione Opposta:", pick_step: "Scegli un piccolo passo:", note_label: "Nota:" },
    urge_surfing: { completed: "Completato: {{count}}", guided: "Guidato", independent: "Indipendente", finish_prompt: "Dopo aver surfato, scegline uno:", success: "✓ Bene! Gli impulsi salgono e scendono. Hai cavalcato l'onda." },
    value_compass: { pick_value: "Scegli un valore che ti importa adesso:", your_value: "Il Tuo Valore: {{value}}", pick_action: "Scegli una piccola azione allineata con questo valore:", success: "✓ Ottimo! Le piccole azioni basate sui valori costruiscono una vita significativa.", reset: "Scegli Valore Diverso" },
    tiny_experiment: { belief_label: "Credenza da testare:", pick_experiment: "Scegli un piccolo esperimento (max. 2 min):", success: "✓ Gli esperimenti raccolgono dati. Anche i risultati 'negativi' ti insegnano qualcosa di prezioso." },
    worry_time: { current_worry: "Preoccupazione Attuale:", park_it: "Parcheggiala:", tiny_step: "Fai questo piccolo passo ora:", success: "✓ Ottimo! Hai parcheggiato la preoccupazione e preso un'azione nel momento presente." },
    dbt_stop: { trigger: "Trigger:", next_step: "Scegli un saggio prossimo passo:", chosen: "✓ Hai scelto: {{step}}" },
    defusion_cards: { sticky_thought: "Pensiero Appiccicoso:", prompt: "Prova una riga di defusione:", success: "Bene! Hai creato spazio tra te e il pensiero. Nota: puoi osservarlo senza essere controllato da esso.", next_card: "Prossima Carta" },
    calm_bingo: { prompt: "Segna 2 azioni che farai ora:", success: "✓ Mini turno completato! Prenditi un momento per farlo adesso." },
    tipp_skills: { prompt: "Quando devi cambiare la tua chimica corporea velocemente:", pick_action: "Scegline uno da provare subito:", success: "✓ Ottimo! Le abilità TIPP cambiano la tua fisiologia per ridurre l'intensità emotiva." },
    accepts: { prompt: "Quando devi distrarti da emozioni travolgenti, usa ACCEPTS:", try_now: "Prova questo ora:" },
    improve: { prompt: "MIGLIORA il momento quando sei in crisi e hai bisogno di cambiare il tuo stato:", quick_action: "Azione Rapida:" },
    self_soothe: { prompt: "Calmati con i tuoi 5 sensi per creare momenti di comfort e sicurezza.", back: "← Torna ai sensi", success: "✓ Prenditi un momento per vivere questo pienamente. L'auto-calmante è un regalo che fai a te stesso." }
  },
  pt: {
    common: { try_another: "Tentar Outro" },
    memory_match: {
      title: "Combinação de Memória",
      instructions: "Encontre todos os pares correspondentes clicando nas cartas.",
      moves: "Movimentos",
      complete_title: "Muito bem!",
      complete_message: "Você completou o jogo de memória em {{moves}} movimentos."
    },
    focus_flow: {
      title: "Fluxo de Foco",
      instructions: "Observe a sequência com cuidado, depois repita.",
      watch_carefully: "Observe com cuidado...",
      level: "Nível",
      game_over: "Bom esforço!",
      final_score: "Você alcançou o nível {{score}}.",
      colors: { teal: "Azul-petróleo", lavender: "Lavanda", coral: "Coral", sage: "Sálvia" }
    },
    pattern_shift: {
      title: "Mudança de Padrão",
      complete_title: "Mestre de padrões!",
      complete_message: "Você acertou {{score}} de {{total}} padrões.",
      patterns: [
        { question: "O que vem a seguir no padrão: Vermelho, Azul, Verde, Vermelho, Azul, ?" },
        { question: "Qual forma completa o padrão: Círculo, Quadrado, ?, Círculo?" },
        { question: "Qual tamanho vem a seguir: Grande, Médio, ?, Grande?" },
        { question: "Continue o padrão: 1, 2, 3, 1, ?" }
      ]
    },
    word_association: {
      title: "Associação de Palavras",
      instructions: "Pense rapidamente em uma palavra relacionada à mostrada. Complete 5 associações.",
      prompt: "Qual palavra vem à mente?",
      input_placeholder: "Digite sua associação...",
      submit: "Enviar",
      your_chain: "Sua cadeia:",
      complete_title: "Pensamento criativo!",
      complete_message: "Você criou uma cadeia única de associações.",
      start_words: ["Calma", "Crescimento", "Força", "Alegria", "Paz", "Coragem", "Esperança", "Equilíbrio"]
    },
    number_sequence: {
      title: "Sequência Numérica",
      instructions: "Encontre o padrão e preveja o próximo número.",
      answer_placeholder: "Sua resposta",
      check: "Verificar",
      correct: "Correto!",
      incorrect: "Não exatamente. A resposta é {{answer}}.",
      complete_title: "Sequência resolvida!",
      complete_message: "Você acertou {{score}} de {{total}} sequências.",
      sequences: [
        { rule: "Padrão: Adicionar 2 cada vez" },
        { rule: "Padrão: Adicionar números crescentes (1, 2, 3, 4, 5)" },
        { rule: "Padrão: Múltiplos de 5" },
        { rule: "Padrão: Adicionar 1, depois 2, depois 3, depois 4" },
        { rule: "Padrão: Multiplicar por 2 cada vez" }
      ]
    },
    quick_win: { log_prompt: "Registre uma pequena vitória de hoje:", input_placeholder: "Digite sua vitória...", log_button: "Registrar", preset_prompt: "Ou escolha uma vitória comum:", success_message: "Vitória registrada! Continue construindo impulso." },
    opposite_action: { emotion_label: "Emoção:", urge_label: "Impulso:", opposite_label: "Ação Oposta:", pick_step: "Escolha um pequeno passo:", note_label: "Nota:" },
    urge_surfing: { completed: "Concluído: {{count}}", guided: "Guiado", independent: "Independente", finish_prompt: "Após surfar, escolha um:", success: "✓ Bom! Impulsos sobem e descem. Você surfou a onda." },
    value_compass: { pick_value: "Escolha um valor que importa para você agora:", your_value: "Seu Valor: {{value}}", pick_action: "Escolha uma pequena ação alinhada com este valor:", success: "✓ Ótimo! Pequenas ações baseadas em valores constroem uma vida significativa.", reset: "Escolher Valor Diferente" },
    tiny_experiment: { belief_label: "Crença a testar:", pick_experiment: "Escolha um pequeno experimento (máx. 2 min):", success: "✓ Experimentos coletam dados. Mesmo resultados 'negativos' ensinam algo valioso." },
    worry_time: { current_worry: "Preocupação Atual:", park_it: "Estacione-a:", tiny_step: "Faça este pequeno passo agora:", success: "✓ Ótimo! Você estacionou a preocupação e tomou uma ação no momento presente." },
    dbt_stop: { trigger: "Gatilho:", next_step: "Escolha um sábio próximo passo:", chosen: "✓ Você escolheu: {{step}}" },
    defusion_cards: { sticky_thought: "Pensamento Pegajoso:", prompt: "Tente uma linha de defusão:", success: "Muito bem! Você criou espaço entre você e o pensamento. Perceba: você pode observá-lo sem ser controlado por ele.", next_card: "Próxima Carta" },
    calm_bingo: { prompt: "Marque 2 ações que você fará agora:", success: "✓ Mini rodada completa! Reserve um momento para fazer isso agora." },
    tipp_skills: { prompt: "Quando você precisa mudar sua química corporal rapidamente:", pick_action: "Escolha um para tentar agora:", success: "✓ Ótimo! As habilidades TIPP mudam sua fisiologia para reduzir a intensidade emocional." },
    accepts: { prompt: "Quando você precisar se distrair de emoções avassaladoras, use ACCEPTS:", try_now: "Tente isso agora:" },
    improve: { prompt: "MELHORE o momento quando você está em crise e precisa mudar seu estado:", quick_action: "Ação Rápida:" },
    self_soothe: { prompt: "Acalme-se com seus 5 sentidos para criar momentos de conforto e segurança.", back: "← Voltar aos sentidos", success: "✓ Reserve um momento para vivenciar isso plenamente. A auto-calmante é um presente que você se dá." }
  }
};