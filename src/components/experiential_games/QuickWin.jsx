import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { quickWinPresets } from './mindGamesContent';
import { Sparkles } from 'lucide-react';

export default function QuickWin({ onClose }) {
  const [customWin, setCustomWin] = useState('');
  const [savedWins, setSavedWins] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mindgames_quickWins');
    if (stored) {
      setSavedWins(JSON.parse(stored));
    }
  }, []);

  const handlePresetClick = (preset) => {
    saveWin(preset);
  };

  const handleCustomSubmit = () => {
    if (customWin.trim()) {
      saveWin(customWin.trim());
      setCustomWin('');
    }
  };

  const saveWin = (win) => {
    const newWins = [
      { text: win, date: new Date().toISOString() },
      ...savedWins
    ].slice(0, 20);
    setSavedWins(newWins);
    localStorage.setItem('mindgames_quickWins', JSON.stringify(newWins));
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
        Log one small win from today:
      </p>

      <div className="flex gap-2">
        <Input
          value={customWin}
          onChange={(e) => setCustomWin(e.target.value)}
          placeholder="Type your win..."
          onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
          style={{ borderRadius: '12px' }}
        />
        <Button
          onClick={handleCustomSubmit}
          disabled={!customWin.trim()}
          style={{
            borderRadius: '12px',
            backgroundColor: '#26A69A',
            color: 'white'
          }}
        >
          Log
        </Button>
      </div>

      <p className="text-xs" style={{ color: '#5A7A72' }}>
        Or pick a common win:
      </p>
      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {quickWinPresets.map((preset, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="h-auto py-2 px-3 text-left justify-start"
            style={{
              borderRadius: '10px',
              borderColor: 'rgba(38, 166, 154, 0.2)'
            }}
            onClick={() => handlePresetClick(preset)}
          >
            {preset}
          </Button>
        ))}
      </div>

      {showSuccess && (
        <Card className="p-3 border-0" style={{
          borderRadius: '12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-600" />
            <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
              Win logged! Keep building momentum.
            </p>
          </div>
        </Card>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          Close
        </Button>
      </div>
    </div>
  );
}