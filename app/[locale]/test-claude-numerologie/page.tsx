'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function TestClaudeNumerologie() {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setAnalysis('');
    setMetadata(null);

    try {
      console.log('[v0] Apelam endpoint analiză Claude...');
      const response = await fetch('/api/numerologie/analyze-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      console.log('[v0] Status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eroare necunoscută');
      }

      console.log('[v0] Răspuns primit cu succes');
      setAnalysis(data.analysis || '');
      setMetadata(data.metadata || {});
    } catch (err: any) {
      console.error('[v0] Eroare:', err);
      setError(err.message || 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-purple-500/30 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-purple-300 mb-4">Informații</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <p>
                  <span className="text-purple-400 font-semibold">Fișier:</span>
                  <br /> numerologie_22.xlsm
                </p>
                <p>
                  <span className="text-purple-400 font-semibold">Date:</span>
                  <br /> 12 coli, 966+ rânduri
                </p>
                <p>
                  <span className="text-purple-400 font-semibold">Model:</span>
                  <br /> Claude 3.5 Sonnet
                </p>
                <p>
                  <span className="text-purple-400 font-semibold">Status:</span>
                  <br /> 
                  <span className="text-green-400">✓ Activ</span>
                </p>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Test Analiză Numerologie cu Claude</h1>
          <p className="text-gray-300">Analizează datele Excel prin Vercel AI Gateway</p>
        </div>

        {/* Button */}
        <Card className="p-6 mb-6 bg-slate-800/50 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Analiză Claude 3.5 Sonnet</h2>
              <p className="text-sm text-gray-400">Trimite datele numerologice la Claude pentru interpretare detaliată</p>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Analizează...
                </div>
              ) : (
                'Pornit Analiză'
              )}
            </Button>
          </div>
        </Card>

        {/* Metadata */}
        {metadata && (
          <Card className="p-4 mb-6 bg-slate-800/50 border-green-500/30">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Model</p>
                <p className="text-white font-mono">{metadata.model}</p>
              </div>
              <div>
                <p className="text-gray-400">Coli Procesate</p>
                <p className="text-white font-mono">{metadata.dataProcessed?.sheetsCount || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Rânduri Procesate</p>
                <p className="text-white font-mono">{metadata.dataProcessed?.totalRows || 'N/A'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="p-4 mb-6 bg-red-900/20 border-red-500/30">
            <p className="text-red-300 text-sm">
              <strong>Eroare:</strong> {error}
            </p>
          </Card>
        )}

        {/* Analysis Result */}
        {analysis && (
          <Card className="p-6 bg-slate-800/50 border-purple-500/30">
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-100 space-y-4 max-h-[600px] overflow-y-auto">
                {analysis.split('\n').map((line, i) => (
                  <div key={i} className="text-sm leading-relaxed">
                    {line.includes('**') ? (
                      <p className="font-semibold text-purple-300">{line.replace(/\*\*/g, '')}</p>
                    ) : line.includes('###') ? (
                      <h3 className="text-lg font-bold text-purple-400 mt-4">{line.replace(/#{1,3}\s/g, '')}</h3>
                    ) : line.includes('##') ? (
                      <h2 className="text-xl font-bold text-purple-300 mt-6">{line.replace(/#{1,2}\s/g, '')}</h2>
                    ) : line.trim() ? (
                      <p>{line}</p>
                    ) : (
                      <div className="h-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {!analysis && !loading && !error && (
          <Card className="p-8 bg-slate-800/30 border-slate-700/30 text-center">
            <p className="text-gray-400">Click pe butonul "Pornit Analiză" pentru a iniția procesul</p>
          </Card>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
