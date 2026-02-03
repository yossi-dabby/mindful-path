import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { calmBingoTiles } from './mindGamesContent';
import { CheckCircle } from 'lucide-react';

export default function CalmBingo({ onClose }) {
  const [selected, setSelected] = useState([]);

  const handleTileClick = (tile) => {
    if (selected.includes(tile)) {
      setSelected(selected.filter(t => t !== tile));
    } else if (selected.length < 2) {
      setSelected([...selected, tile]);
    }
  };

  const isComplete = selected.length === 2;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
        Mark 2 actions you'll do now:
      </p>

      <div className="grid grid-cols-2 gap-2">
        {calmBingoTiles.map((tile, index) => {
          const isSelected = selected.includes(tile);
          return (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 px-3 text-left justify-start relative"
              style={{
                borderRadius: '12px',
                borderColor: isSelected
                  ? 'rgba(34, 197, 94, 0.4)'
                  : 'rgba(38, 166, 154, 0.2)',
                backgroundColor: isSelected
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'transparent'
              }}
              onClick={() => handleTileClick(tile)}
            >
              <span className="text-xs">{tile}</span>
              {isSelected && (
                <CheckCircle className="w-4 h-4 text-green-600 absolute top-2 right-2" />
              )}
            </Button>
          );
        })}
      </div>

      {isComplete && (
        <Card className="p-4 border-0" style={{
          borderRadius: '16px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
            ✓ Mini round complete! Take a moment to do these now.
          </p>
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