import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Play, CheckCircle, Clock, BookOpen, Lightbulb, Star, Video, Heart, Headphones, Eye, Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BreathingVisual from './BreathingVisual';
import AudioPlayer from '../audio/AudioPlayer';
import { motion } from 'framer-motion';
import PremiumBadge from '../subscription/PremiumBadge';
import ExerciseMediaBadge from './ExerciseMediaBadge';
import { exportExercisePdf } from './exportExercisePdfUtils';

export default function ExerciseDetail({ exercise, onClose, onComplete, onToggleFavorite }) {
  const { t, i18n } = useTranslation();
  const [completed, setCompleted] = useState(false);
  const [showBreathingVisual, setShowBreathingVisual] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const pdfTextByLanguage = {
    en: {
      download: 'Download PDF',
      downloading: 'Preparing PDF...',
      subtitle: 'Printable exercise summary for offline practice',
      generatedOn: 'Generated on',
      details: 'Exercise Details',
      category: 'Category',
      difficulty: 'Difficulty',
      duration: 'Duration',
      minutes: 'min',
      progress: 'Your Progress',
      footer: 'For personal offline practice. Not a substitute for emergency or professional care.',
      noInstructions: 'No instructions available for this exercise yet.'
    },
    he: {
      download: 'הורדת PDF',
      downloading: 'מכין PDF...',
      subtitle: 'סיכום תרגיל להדפסה לשימוש לא מקוון',
      generatedOn: 'נוצר בתאריך',
      details: 'פרטי התרגיל',
      category: 'קטגוריה',
      difficulty: 'רמת קושי',
      duration: 'משך',
      minutes: 'דק׳',
      progress: 'ההתקדמות שלך',
      footer: 'לשימוש אישי לא מקוון בלבד. אינו מהווה תחליף לטיפול מקצועי או חירום.',
      noInstructions: 'עדיין אין הוראות זמינות לתרגיל זה.'
    },
    es: {
      download: 'Descargar PDF',
      downloading: 'Preparando PDF...',
      subtitle: 'Resumen imprimible del ejercicio para practicar sin conexión',
      generatedOn: 'Generado el',
      details: 'Detalles del ejercicio',
      category: 'Categoría',
      difficulty: 'Dificultad',
      duration: 'Duración',
      minutes: 'min',
      progress: 'Tu progreso',
      footer: 'Para práctica personal sin conexión. No sustituye la atención profesional o de emergencia.',
      noInstructions: 'Todavía no hay instrucciones disponibles para este ejercicio.'
    },
    fr: {
      download: 'Télécharger le PDF',
      downloading: 'Préparation du PDF...',
      subtitle: 'Résumé imprimable de l’exercice pour une pratique hors ligne',
      generatedOn: 'Généré le',
      details: 'Détails de l’exercice',
      category: 'Catégorie',
      difficulty: 'Difficulté',
      duration: 'Durée',
      minutes: 'min',
      progress: 'Votre progression',
      footer: 'Pour une pratique personnelle hors ligne. Ne remplace pas une aide professionnelle ou d’urgence.',
      noInstructions: 'Aucune instruction disponible pour cet exercice pour le moment.'
    },
    de: {
      download: 'PDF herunterladen',
      downloading: 'PDF wird vorbereitet...',
      subtitle: 'Druckbare Übungszusammenfassung für die Offline-Nutzung',
      generatedOn: 'Erstellt am',
      details: 'Übungsdetails',
      category: 'Kategorie',
      difficulty: 'Schwierigkeit',
      duration: 'Dauer',
      minutes: 'Min.',
      progress: 'Dein Fortschritt',
      footer: 'Für die persönliche Offline-Nutzung. Kein Ersatz für professionelle oder Notfallhilfe.',
      noInstructions: 'Für diese Übung sind noch keine Anweisungen verfügbar.'
    },
    it: {
      download: 'Scarica PDF',
      downloading: 'Preparazione PDF...',
      subtitle: 'Riepilogo stampabile dell’esercizio per l’uso offline',
      generatedOn: 'Generato il',
      details: 'Dettagli dell’esercizio',
      category: 'Categoria',
      difficulty: 'Difficoltà',
      duration: 'Durata',
      minutes: 'min',
      progress: 'I tuoi progressi',
      footer: 'Per pratica personale offline. Non sostituisce assistenza professionale o di emergenza.',
      noInstructions: 'Non ci sono ancora istruzioni disponibili per questo esercizio.'
    },
    pt: {
      download: 'Baixar PDF',
      downloading: 'Preparando PDF...',
      subtitle: 'Resumo imprimível do exercício para prática offline',
      generatedOn: 'Gerado em',
      details: 'Detalhes do exercício',
      category: 'Categoria',
      difficulty: 'Dificuldade',
      duration: 'Duração',
      minutes: 'min',
      progress: 'Seu progresso',
      footer: 'Para prática pessoal offline. Não substitui cuidados profissionais ou de emergência.',
      noInstructions: 'Ainda não há instruções disponíveis para este exercício.'
    }
  };

  const pdfText = pdfTextByLanguage[i18n.language] || pdfTextByLanguage.en;

  const instructionSteps = exercise.detailed_steps?.length > 0 ?
  exercise.detailed_steps :
  exercise.steps?.map((step, index) => ({
    step_number: index + 1,
    title: step.title,
    description: step.description
  })) || [];

  const instructionText = exercise.instructions?.trim() || (
  instructionSteps.length > 0 ?
  instructionSteps.map((step, index) => `${index + 1}. ${step.title ? `${step.title}: ` : ''}${step.description || ''}`).join('\n\n') :
  [exercise.description, exercise.detailed_description].filter(Boolean).join('\n\n'));

  // Fetch linked audio content
  const { data: audioContent } = useQuery({
    queryKey: ['audioContent', exercise.id],
    queryFn: () => base44.entities.AudioContent.filter({ linked_exercise_id: exercise.id }),
    initialData: []
  });

  const handleComplete = () => {
    setCompleted(true);
    onComplete();
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleStartBreathing = (duration) => {
    setSelectedDuration(duration);
    setShowBreathingVisual(true);
  };

  const handleBreathingComplete = () => {
    handleComplete();
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportExercisePdf({
        exercise,
        language: i18n.language,
        labels: {
          subtitle: pdfText.subtitle,
          generatedOn: pdfText.generatedOn,
          details: pdfText.details,
          category: pdfText.category,
          difficulty: pdfText.difficulty,
          duration: pdfText.duration,
          minutes: pdfText.minutes,
          about: t('exercises.detail.about'),
          instructions: t('exercises.detail.instructions'),
          stepByStep: t('exercises.detail.step_by_step_guide'),
          benefits: t('exercises.detail.key_benefits'),
          tips: t('exercises.detail.helpful_tips'),
          helpsWith: t('exercises.detail.helps_with'),
          progress: pdfText.progress,
          timesCompleted: t('exercises.detail.times_completed'),
          minutesPracticed: t('exercises.detail.minutes_practiced'),
          lastPracticed: t('exercises.detail.last_practiced', { date: new Date().toLocaleDateString(i18n.language || undefined) }).replace(/:.*$/, ''),
          footer: pdfText.footer,
          noInstructions: pdfText.noInstructions,
          untitled: t('exercises.detail.untitled_exercise')
        }
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (showBreathingVisual && exercise.category === 'breathing') {
    return (
      <BreathingVisual
        exercise={exercise}
        duration={selectedDuration}
        onClose={() => setShowBreathingVisual(false)}
        onComplete={handleBreathingComplete} />);


  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)'
      }}>

      <div className="min-h-full flex items-start justify-center p-4 pt-6 pb-24 md:items-center md:p-6">
      <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl my-0 md:my-8"
          style={{ maxHeight: 'calc(100vh - 32px)' }}>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="bg-teal-100 p-6 flex flex-col space-y-1.5 border-b from-green-50 to-blue-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-teal-600 text-2xl font-semibold tracking-[-0.012em]">{exercise.title || 'Untitled Exercise'}</CardTitle>
                  <button
                      onClick={() => onToggleFavorite?.(exercise)} className="mr-2 mb-16 pt-2 pr-4 pl-3 text-base font-medium rounded-[48px] hover:bg-white/50 transition-colors">


                    <Heart className="text-red-600 mb-2 lucide lucide-heart w-5 h-5" />


                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-teal-200 text-teal-600 px-2.5 py-1 font-medium capitalize tracking-[0.01em] leading-4 rounded-[var(--radius-chip)] inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/70">
                    {exercise.difficulty || 'beginner'}
                  </Badge>
                  {exercise.difficulty === 'advanced' && <PremiumBadge />}
                  <ExerciseMediaBadge mediaType={exercise.media_type} size="md" />
                  {exercise.duration_options?.length > 0 ?
                    <Badge variant="secondary" className="bg-secondary/86 text-teal-600 px-2.5 py-1 font-medium tracking-[0.01em] leading-4 rounded-[var(--radius-chip)] border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exercise.duration_options.join(', ')} min options
                    </Badge> :
                    exercise.duration_minutes &&
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exercise.duration_minutes} minutes
                    </Badge>
                    }
                  {exercise.video_url &&
                    <Badge className="flex items-center gap-1 bg-purple-100 text-purple-700">
                      <Video className="w-3 h-3" />
                      Video
                    </Badge>
                    }
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf} className="bg-teal-600 text-gray-950 px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 min-h-[44px] md:min-h-0">


                  {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isExportingPdf ? pdfText.downloading : pdfText.download}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="text-teal-600 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-teal-300 p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              {/* Left Column: Main Content */}
              <div className="flex flex-col space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className={`grid w-full ${audioContent.length > 0 ? 'grid-cols-5' : 'grid-cols-4'}`}>
                <TabsTrigger value="overview" className="text-gray-950 px-3 py-1 font-medium tracking-[0.003em] leading-none rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)]">
                  <BookOpen className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="instructions" className="text-gray-950 px-3 py-1 font-medium tracking-[0.003em] leading-none rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)]">
                  <Play className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Practice</span>
                </TabsTrigger>
                {audioContent.length > 0 &&
                      <TabsTrigger value="audio">
                    <Headphones className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Audio</span>
                  </TabsTrigger>
                      }
                <TabsTrigger value="benefits" className="text-gray-950 px-3 py-1 font-medium tracking-[0.003em] leading-none rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)]">
                  <Star className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Benefits</span>
                </TabsTrigger>
                <TabsTrigger value="tips" className="bg-teal-300 text-gray-950 px-3 py-1 font-medium tracking-[0.003em] leading-none rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)]">
                  <Lightbulb className="text-gray-950 lucide lucide-lightbulb w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Tips</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 max-h-[50vh] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">About This Exercise</h3>
                  <p className="text-gray-600 leading-relaxed">{exercise.description || ''}</p>
                  {exercise.detailed_description &&
                        <p className="text-gray-600 leading-relaxed mt-3">{exercise.detailed_description}</p>
                        }
                </div>

                {/* Visualization Script */}
                {exercise.media_type === 'visualization' && exercise.visualization_script &&
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Guided Visualization</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed italic">
                      "{exercise.visualization_script}"
                    </p>
                  </div>
                      }

                {/* Video Preview */}
                {exercise.video_url &&
                      <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Video Demonstration</h3>
                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
                      <iframe
                            src={exercise.video_url}
                            className="w-full h-full"
                            allowFullScreen
                            title={exercise.title} />

                    </div>
                  </div>
                      }

                {/* Audio URL */}
                {exercise.audio_url &&
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Headphones className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Audio Guide</h3>
                    </div>
                    <audio
                          controls
                          className="w-full"
                          src={exercise.audio_url}>

                      Your browser does not support the audio element.
                    </audio>
                  </div>
                      }

                {/* Tags */}
                {exercise.tags?.length > 0 &&
                      <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Helps With</h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise.tags.filter((tag) => tag && typeof tag === 'string').map((tag, i) =>
                          <Badge key={i} variant="secondary" className="capitalize">
                          {tag}
                        </Badge>
                          )}
                    </div>
                  </div>
                      }
              </TabsContent>

              {/* Audio Tab */}
              {audioContent.length > 0 &&
                    <TabsContent value="audio" className="space-y-4 max-h-[50vh] overflow-y-auto">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Guided Audio</h3>
                    <p className="text-gray-600 mb-4">
                      Follow along with professionally narrated audio guidance for this exercise.
                    </p>
                    {audioContent.map((audio) =>
                        <div key={audio.id} className="mb-4">
                        <AudioPlayer
                            audioContent={audio}
                            onComplete={handleComplete} />

                      </div>
                        )}
                  </div>
                </TabsContent>
                    }

              {/* Instructions Tab */}
              <TabsContent value="instructions" className="space-y-4 max-h-[50vh] overflow-y-auto">
                {instructionSteps.length > 0 ?
                      <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Step-by-Step Guide</h3>
                    <div className="space-y-4">
                      {instructionSteps.map((step, i) =>
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }} className="bg-teal-200 p-4 rounded-xl flex gap-4 from-green-50 to-blue-50 border border-green-200">


                          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                            {step.step_number || i + 1}
                          </div>
                          <div className="flex-1">
                            {step.title &&
                              <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
                              }
                            <p className="text-gray-700">{step.description || ''}</p>
                            {step.duration_seconds &&
                              <p className="text-sm text-gray-500 mt-1">
                                Duration: {step.duration_seconds} seconds
                              </p>
                              }
                          </div>
                        </motion.div>
                          )}
                    </div>
                  </div> :

                      <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
                    <div className="bg-teal-100 text-teal-600 p-4 rounded-xl border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {instructionText || 'Instructions will appear here soon.'}
                      </p>
                    </div>
                  </div>
                      }

                {/* Duration Options for Breathing Exercises */}
                {exercise.category === 'breathing' && exercise.duration_options?.length > 0 &&
                      <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose Duration</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {exercise.duration_options.map((duration) =>
                          <Button
                            key={duration}
                            onClick={() => handleStartBreathing(duration)}
                            className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg font-semibold">

                          {duration} min
                        </Button>
                          )}
                    </div>
                  </div>
                      }
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value="benefits" className="space-y-4 max-h-[50vh] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Benefits</h3>
                  {exercise.benefits?.length > 0 ?
                        <div className="space-y-3">
                      {exercise.benefits.filter((benefit) => benefit && typeof benefit === 'string').map((benefit, i) =>
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }} className="bg-teal-100 p-4 rounded-lg flex items-start gap-3 border border-green-200">


                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700">{benefit}</p>
                        </motion.div>
                          )}
                    </div> :

                        <p className="text-gray-600">
                      This exercise helps improve mental well-being, reduce stress, and enhance emotional regulation.
                    </p>
                        }
                </div>
              </TabsContent>

              {/* Tips Tab */}
              <TabsContent value="tips" className="space-y-4 max-h-[50vh] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Helpful Tips</h3>
                  {exercise.tips?.length > 0 ?
                        <div className="space-y-3">
                      {exercise.tips.filter((tip) => tip && typeof tip === 'string').map((tip, i) =>
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }} className="bg-teal-100 p-4 rounded-lg flex items-start gap-3 border border-blue-200">


                          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700">{tip}</p>
                        </motion.div>
                          )}
                    </div> :

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-600">
                        Practice regularly for best results. Find a quiet space, start slowly, and be patient with yourself.
                      </p>
                    </div>
                        }
                </div>
              </TabsContent>
            </Tabs>

                {/* Mobile: Progress Stats */}
                <div className="lg:hidden">
                  <div className="bg-teal-100 p-6 rounded-xl from-green-50 to-blue-50 border-2 border-green-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Progress</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{exercise.completed_count || 0}</p>
                        <p className="text-gray-950 text-xs">Times Completed</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{exercise.total_time_practiced || 0}</p>
                        <p className="text-gray-950 text-xs">Minutes Practiced</p>
                      </div>
                    </div>
                    {exercise.last_completed &&
                      <p className="text-xs text-gray-500 mt-3">
                        Last practiced: {new Date(exercise.last_completed).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      }
                  </div>
                </div>

                {/* Mobile: Action Buttons */}
                {exercise.category !== 'breathing' &&
                  <div className="lg:hidden flex gap-3">
                    {completed ?
                    <div className="flex-1 bg-green-100 border border-green-300 rounded-xl p-4 flex items-center justify-center gap-2 text-green-700 font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Exercise Completed!
                      </div> :

                    <>
                        <Button variant="outline" onClick={onClose} className="bg-teal-100 text-gray-950 px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 min-h-[44px] md:min-h-0 flex-1">
                          Close
                        </Button>
                        <Button onClick={handleComplete} className="bg-teal-100 text-gray-950 px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0 flex-1 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Mark as Complete
                        </Button>
                      </>
                    }
                  </div>
                  }
              </div>

              {/* Right Column: Progress & Actions (Desktop) */}
              <div className="hidden lg:flex lg:flex-col gap-4 self-start">
                {/* Completion Stats */}
                <div className="bg-teal-100 p-6 rounded-xl from-green-50 to-blue-50 border-2 border-green-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Progress</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{exercise.completed_count || 0}</p>
                      <p className="text-xs text-gray-600">Times Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{exercise.total_time_practiced || 0}</p>
                      <p className="text-xs text-gray-600">Minutes Practiced</p>
                    </div>
                  </div>
                  {exercise.last_completed &&
                    <p className="text-xs text-gray-500 mt-3">
                      Last practiced: {new Date(exercise.last_completed).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    }
                </div>

                {/* Action Buttons - Desktop */}
                {exercise.category !== 'breathing' &&
                  <div className="flex flex-col gap-3">
                    {completed ?
                    <div className="bg-green-100 border border-green-300 rounded-xl p-4 flex items-center justify-center gap-2 text-green-700 font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Exercise Completed!
                      </div> :

                    <>
                        <Button onClick={handleComplete} className="bg-teal-500 text-primary-foreground px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0 w-full hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Mark as Complete
                        </Button>
                        <Button variant="outline" onClick={onClose} className="bg-teal-100 text-secondary-foreground px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 min-h-[44px] md:min-h-0 w-full">
                          Close
                        </Button>
                      </>
                    }
                  </div>
                  }
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>,
    document.body
  );

}