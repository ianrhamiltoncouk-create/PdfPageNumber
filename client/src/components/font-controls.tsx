import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { FontSettings } from "@/pages/pdf-numbering";

interface FontControlsProps {
  settings: FontSettings;
  onSettingsChange: (settings: FontSettings) => void;
}

const FONT_FAMILIES = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "helvetica", label: "Helvetica" },
  { value: "times", label: "Times New Roman" },
];

export default function FontControls({
  settings,
  onSettingsChange,
}: FontControlsProps) {
  const updateSetting = <K extends keyof FontSettings>(
    key: K,
    value: FontSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Font Family */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Font family</Label>
        <Select value={settings.family} onValueChange={(value) => updateSetting("family", value)}>
          <SelectTrigger data-testid="select-font-family">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Font size</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            min="6"
            max="72"
            value={settings.size}
            onChange={(e) => updateSetting("size", parseInt(e.target.value) || 12)}
            className="flex-1"
            data-testid="input-font-size"
          />
          <span className="text-sm text-muted-foreground">pt</span>
        </div>
      </div>

      {/* Font Color */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Color</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={settings.color}
            onChange={(e) => updateSetting("color", e.target.value)}
            className="w-12 h-10 border border-input rounded-md bg-background cursor-pointer"
            data-testid="input-color-picker"
          />
          <Input
            type="text"
            value={settings.color}
            onChange={(e) => updateSetting("color", e.target.value)}
            className="flex-1 font-mono"
            data-testid="input-color-text"
          />
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Opacity</Label>
          <span className="text-sm text-muted-foreground" data-testid="text-opacity-value">
            {settings.opacity}%
          </span>
        </div>
        <Slider
          value={[settings.opacity]}
          onValueChange={(value) => updateSetting("opacity", value[0])}
          max={100}
          min={0}
          step={1}
          data-testid="slider-opacity"
        />
      </div>
    </div>
  );
}
