import { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, Trash2, Palette, Minus, Plus } from 'lucide-react';

const COLORS = ['#1f2937','#7c3aed','#ef4444','#f59e0b','#10b981','#06b6d4','#ec4899','#3b82f6'];

export default function DrawingCanvas({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [color, setColor] = useState('#1f2937');
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const lastPos = useRef(null);

  const BG_COLORS = ['#ffffff','#fdf4ff','#f0fdf4','#eff6ff','#fffbeb','#fef2f2'];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [bgColor]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? bgColor : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/jpeg', 0.7);
    onSave(imageData);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Tool */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button
            onClick={() => setTool('pen')}
            className={`p-2.5 transition-colors ${tool === 'pen' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Pen size={16} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2.5 transition-colors ${tool === 'eraser' ? 'bg-gray-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Eraser size={16} />
          </button>
        </div>

        {/* Line width */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1">
          <button onClick={() => setLineWidth(w => Math.max(1, w - 2))} className="p-1 hover:text-primary-600">
            <Minus size={14} />
          </button>
          <span className="text-xs font-semibold text-gray-600 w-4 text-center">{lineWidth}</span>
          <button onClick={() => setLineWidth(w => Math.min(20, w + 2))} className="p-1 hover:text-primary-600">
            <Plus size={14} />
          </button>
        </div>

        {/* Pen colors */}
        <div className="flex gap-1.5">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pen'); }}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c && tool === 'pen' ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <button
          onClick={clearCanvas}
          className="ml-auto p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* BG Color */}
      <div className="flex items-center gap-2">
        <Palette size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500">Background:</span>
        <div className="flex gap-1.5">
          {BG_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setBgColor(c)}
              className={`w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110 ${bgColor === c ? 'border-gray-500' : 'border-gray-200'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 touch-none">
        <canvas
          ref={canvasRef}
          width={600}
          height={340}
          className="w-full cursor-crosshair block"
          style={{ touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {/* Hint overlay */}
        <div className="absolute top-2 right-2 text-xs text-gray-300 pointer-events-none">
          Gambar di sini ✏️
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl text-sm hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 gradient-primary text-white font-semibold rounded-2xl text-sm hover:opacity-90 transition-opacity"
        >
          Gunakan Gambar ini ✓
        </button>
      </div>
    </div>
  );
}
