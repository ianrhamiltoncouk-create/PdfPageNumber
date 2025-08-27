import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { PositionSettings } from "@/pages/pdf-numbering";

interface PositionControlsProps {
  settings: PositionSettings;
  onSettingsChange: (settings: PositionSettings) => void;
}

const POSITION_PRESETS = [
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-outer", label: "Bottom Outer" },
  { value: "bottom-inner", label: "Bottom Inner" },
  { value: "top-center", label: "Top Center" },
  { value: "top-outer", label: "Top Outer" },
  { value: "top-inner", label: "Top Inner" },
  { value: "custom", label: "Custom Position" },
];

const GUTTER_PRESETS = [
  { value: "custom", label: "Custom" },
  { value: "0.3", label: "0.3\"" },
  { value: "0.4", label: "0.4\"" },
  { value: "0.5", label: "0.5\"" },
  { value: "0.75", label: "0.75\"" },
  { value: "1.0", label: "1.0\"" },
];

export default function PositionControls({
  settings,
  onSettingsChange,
}: PositionControlsProps) {
  const updateSetting = <K extends keyof PositionSettings>(
    key: K,
    value: PositionSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handlePresetChange = (preset: string) => {
    updateSetting("preset", preset);
    // Set default gutter values for presets
    if (preset !== "custom") {
      // Convert preset to inches then to current units
      const inchValue = preset === "0.3" ? 0.3 : preset === "0.4" ? 0.4 : preset === "0.5" ? 0.5 : preset === "0.75" ? 0.75 : preset === "1.0" ? 1.0 : 0.25;
      let gutterValue: number;
      switch (settings.units) {
        case "in":
          gutterValue = inchValue;
          break;
        case "mm":
          gutterValue = inchValue * 25.4;
          break;
        default: // pt
          gutterValue = inchValue * 72;
          break;
      }
      updateSetting("gutterMargin", Math.round(gutterValue * 100) / 100);
    }
  };

  const handleGutterPresetChange = (preset: string) => {
    updateSetting("gutterPreset", preset);
    if (preset !== "custom") {
      const inchValue = parseFloat(preset);
      let gutterValue: number;
      switch (settings.units) {
        case "in":
          gutterValue = inchValue;
          break;
        case "mm":
          gutterValue = inchValue * 25.4;
          break;
        default: // pt
          gutterValue = inchValue * 72;
          break;
      }
      updateSetting("gutterMargin", Math.round(gutterValue * 100) / 100);
    }
  };

  return (
    <div className="space-y-4">
      {/* Position Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Position preset</Label>
        <div className="grid grid-cols-2 gap-2">
          {POSITION_PRESETS.slice(0, 6).map((preset) => (
            <Button
              key={preset.value}
              variant={settings.preset === preset.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetChange(preset.value)}
              className="text-xs"
              data-testid={`button-preset-${preset.value}`}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Button
          variant={settings.preset === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetChange("custom")}
          className="w-full text-xs"
          data-testid="button-preset-custom"
        >
          Custom Position
        </Button>
      </div>

      {/* Custom Position Inputs */}
      {settings.preset === "custom" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">X Position</Label>
              <Input
                type="number"
                value={settings.customX}
                onChange={(e) => updateSetting("customX", parseFloat(e.target.value) || 0)}
                data-testid="input-custom-x"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Y Position</Label>
              <Input
                type="number"
                value={settings.customY}
                onChange={(e) => updateSetting("customY", parseFloat(e.target.value) || 0)}
                data-testid="input-custom-y"
              />
            </div>
          </div>
        </div>
      )}

      {/* Units */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Units</Label>
        <Select value={settings.units} onValueChange={(value) => updateSetting("units", value as "pt" | "mm" | "in")}>
          <SelectTrigger data-testid="select-units">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt">Points (pt)</SelectItem>
            <SelectItem value="mm">Millimeters (mm)</SelectItem>
            <SelectItem value="in">Inches (in)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gutter Margin */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Gutter margin</Label>
        <div className="flex gap-2">
          <Select value={settings.gutterPreset} onValueChange={handleGutterPresetChange}>
            <SelectTrigger className="w-24" data-testid="select-gutter-preset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GUTTER_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            step="0.1"
            value={settings.gutterMargin}
            onChange={(e) => updateSetting("gutterMargin", parseFloat(e.target.value) || 0)}
            data-testid="input-gutter-margin"
          />
        </div>
      </div>

      {/* Mirrored Gutter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="mirroredGutter"
            checked={settings.mirroredGutter}
            onCheckedChange={(checked) => updateSetting("mirroredGutter", !!checked)}
            data-testid="checkbox-mirrored-gutter"
          />
          <Label htmlFor="mirroredGutter" className="text-sm font-medium">
            Mirrored gutter
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Mirror gutter positioning for book layouts (odd/even pages)
        </p>
      </div>
    </div>
  );
}
