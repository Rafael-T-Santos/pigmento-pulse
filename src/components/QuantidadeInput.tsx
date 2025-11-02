import { Minus, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuantidadeInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const QuantidadeInput = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 999 
}: QuantidadeInputProps) => {
  
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (isNaN(newValue) || newValue < min) {
      onChange(min);
    } else if (newValue > max) {
      onChange(max);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="quantidade" className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        Quantidade de Latas
      </Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="Diminuir quantidade"
          className="h-10 w-10 shrink-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          id="quantidade"
          type="number"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          className="text-center text-lg font-semibold w-24"
          aria-label="Quantidade de latas"
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="Aumentar quantidade"
          className="h-10 w-10 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Calcule o total necessário para múltiplas unidades (mínimo {min}, máximo {max})
      </p>
    </div>
  );
};
