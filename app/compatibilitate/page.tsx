'use client'

import { useState } from 'react'
import { Heart, Gem, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/components/navbar'
import { StarField } from '@/components/star-field'

export default function CompatibilityPage() {
  const [analysisType, setAnalysisType] = useState<'numerology' | 'astrology'>('numerology')
  const [language, setLanguage] = useState<'ro' | 'ru'>('ro')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const [person1, setPerson1] = useState({ name: 'Maria Popescu', date: '', time: '', city: 'Bucuresti' })
  const [person2, setPerson2] = useState({ name: 'Andrei Ionescu', date: '', time: '', city: 'Cluj-Napoca' })
  const [relationshipType, setRelationshipType] = useState('romantic')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const endpoint = analysisType === 'numerology' ? '/api/analyze-compatibility' : '/api/synastry-analysis'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1, person2, relationshipType, language })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const isAstrology = analysisType === 'astrology'
  const titleText = isAstrology ? (language === 'ro' ? 'Compatibilitate Astrologică' : 'Астрологическая совместимость') : (language === 'ro' ? 'Compatibilitate Numerologică' : 'Нумерологическая совместимость')
  const descriptionText = isAstrology ? (language === 'ro' ? 'Analizează sinastria astrologică, compatibilitatea planetelor și potențialul relației pe termen lung.' : 'Анализируйте астрологическую синастрию, совместимость планет и потенциал отношений в долгосрочной перспективе.') : (language === 'ro' ? 'Descoperă dinamica profundă a relației tale, punctele forte și conflictele ascunse.' : 'Откройте глубокую динамику вашего отношения, сильные стороны и скрытые конфликты.')

  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="text-sm text-pink-400">{language === 'ro' ? 'Analiza Premium' : 'Премиум анализ'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              {titleText}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {descriptionText}
            </p>
          </div>

          {!result ? (
            <>
              {/* Analysis Type Selector - ALWAYS VISIBLE */}
              <Card className="bg-background/40 backdrop-blur-xl border-violet-500/20 mb-8">
                <CardHeader>
                  <CardTitle className="text-center">{language === 'ro' ? 'Alege Tip Analiză' : 'Выберите тип анализа'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button
                      onClick={() => {
                        setAnalysisType('numerology')
                        setError(null)
                      }}
                      variant={analysisType === 'numerology' ? 'default' : 'outline'}
                      className="gap-2"
                    >
                      <Gem className="h-4 w-4" />
                      {language === 'ro' ? 'Numerologie' : 'Нумерология'}
                    </Button>
                    <Button
                      onClick={() => {
                        setAnalysisType('astrology')
                        setError(null)
                      }}
                      variant={analysisType === 'astrology' ? 'default' : 'outline'}
                      className="gap-2"
                    >
                      <Star className="h-4 w-4" />
                      {language === 'ro' ? 'Astrologie (Sinastrie)' : 'Астрология (Синастрия)'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Person 1 */}
                  <Card className="bg-background/40 backdrop-blur-xl border-pink-500/20">
                    <CardHeader>
                      <CardTitle>{language === 'ro' ? 'Persoana 1' : 'Личность 1'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>{language === 'ro' ? 'Nume complet *' : 'Полное имя *'}</Label>
                        <Input value={person1.name} onChange={(e) => setPerson1({ ...person1, name: e.target.value })} required />
                      </div>
                      <div>
                        <Label>{language === 'ro' ? 'Data nașterii *' : 'Дата рождения *'}</Label>
                        <Input type="date" value={person1.date} onChange={(e) => setPerson1({ ...person1, date: e.target.value })} required />
                      </div>
                      <div>
                        <Label>{language === 'ro' ? `Ora nașterii ${isAstrology ? '*' : '(opțional)'}` : `Время рождения ${isAstrology ? '*' : '(опционально)'}`}</Label>
                        <Input type="time" value={person1.time} onChange={(e) => setPerson1({ ...person1, time: e.target.value })} required={isAstrology} />
                      </div>
                      <div>
                        <Label>{language === 'ro' ? `Oraș naștere ${isAstrology ? '*' : '(opțional)'}` : `Город рождения ${isAstrology ? '*' : '(опционально)'}`}</Label>
                        <Input value={person1.city} onChange={(e) => setPerson1({ ...person1, city: e.target.value })} required={isAstrology} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Person 2 */}
                  <Card className="bg-background/40 backdrop-blur-xl border-blue-500/20">
                    <CardHeader>
                      <CardTitle>{language === 'ro' ? 'Persoana 2' : 'Личность 2'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>{language === 'ro' ? 'Nume complet *' : 'Полное имя *'}</Label>
                        <Input value={person2.name} onChange={(e) => setPerson2({ ...person2, name: e.target.value })} required />
                      </div>
                      <div>
                        <Label>{language === 'ro' ? 'Data nașterii *' : 'Дата рождения *'}</Label>
                        <Input type="date" value={person2.date} onChange={(e) => setPerson2({ ...person2, date: e.target.value })} required />
                      </div>
                      <div>
                        <Label>{language === 'ro' ? `Ora nașterii ${isAstrology ? '*' : '(opțional)'}` : `Время рождения ${isAstrology ? '*' : '(опционально)'}`}</Label>
                        <Input type="time" value={person2.time} onChange={(e) => setPerson2({ ...person2, time: e.target.value })} required={isAstrology} />
                      </div>
                      <div>
                        <Label>{language === 'ro' ? `Oraș naștere ${isAstrology ? '*' : '(opțional)'}` : `Город рождения ${isAstrology ? '*' : '(опционально)'}`}</Label>
                        <Input value={person2.city} onChange={(e) => setPerson2({ ...person2, city: e.target.value })} required={isAstrology} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Options */}
                <Card className="bg-background/40 backdrop-blur-xl border-violet-500/20 mb-8">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>{language === 'ro' ? 'Tipul relației' : 'Тип отношений'}</Label>
                        <Select value={relationshipType} onValueChange={setRelationshipType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="romantic">{language === 'ro' ? 'Relație romantică' : 'Романтические отношения'}</SelectItem>
                            <SelectItem value="marriage">{language === 'ro' ? 'Căsătorie' : 'Брак'}</SelectItem>
                            <SelectItem value="friendship">{language === 'ro' ? 'Prietenie' : 'Дружба'}</SelectItem>
                            <SelectItem value="business">{language === 'ro' ? 'Parteneriat de afaceri' : 'Деловое партнёрство'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{language === 'ro' ? 'Limba' : 'Язык'}</Label>
                        <Select value={language} onValueChange={(v) => setLanguage(v as 'ro' | 'ru')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ro">Română</SelectItem>
                            <SelectItem value="ru">Русский</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8 text-red-400">{error}</div>}

                <Button type="submit" disabled={isLoading} className="w-full py-6 text-lg">
                  {isLoading ? (language === 'ro' ? 'Se analizează...' : 'Анализируется...') : (language === 'ro' ? 'Analizează Compatibilitatea' : 'Анализировать совместимость')}
                </Button>
              </form>
            </>
          ) : (
            <Card className="bg-background/40 backdrop-blur-xl border-violet-500/20">
              <CardContent className="pt-6">
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: result.analysis || result.report || JSON.stringify(result) }} />
                </div>
                <Button onClick={() => setResult(null)} className="mt-8 w-full">
                  {language === 'ro' ? 'Noua Analiză' : 'Новый анализ'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
