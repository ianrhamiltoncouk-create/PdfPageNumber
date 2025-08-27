import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { NumberingSettings } from "@/pages/pdf-numbering";

interface NumberingControlsProps {
  settings: NumberingSettings;
  onSettingsChange: (settings: NumberingSettings) => void;
  totalPages: number;
}

export default function NumberingControls({
  settings,
  onSettingsChange,
  totalPages,
}: NumberingControlsProps) {
  const updateSetting = <K extends keyof NumberingSettings>(
    key: K,
    value: NumberingSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Start From Page */}
      <div className="space-y-2">
        <Label htmlFor="visibleFromPage" className="text-sm font-medium">
          Start numbering from page
        </Label>
        <Input
          id="visibleFromPage"
          type="number"
          min="1"
          max={totalPages}
          value={settings.visibleFromPage}
          onChange={(e) => updateSetting("visibleFromPage", parseInt(e.target.value) || 1)}
          data-testid="input-visible-from-page"
        />
        <p className="text-xs text-muted-foreground">
          Earlier pages won't show numbers but are still counted
        </p>
      </div>

      {/* Starting Number */}
      <div className="space-y-2">
        <Label htmlFor="startNumber" className="text-sm font-medium">
          Starting number
        </Label>
        <Input
          id="startNumber"
          type="number"
          min="1"
          value={settings.startNumber}
          onChange={(e) => updateSetting("startNumber", parseInt(e.target.value) || 1)}
          data-testid="input-start-number"
        />
      </div>

      {/* Page Range */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="customRange"
            checked={settings.customRange}
            onCheckedChange={(checked) => updateSetting("customRange", !!checked)}
            data-testid="checkbox-custom-range"
          />
          <Label htmlFor="customRange" className="text-sm font-medium">
            Custom page range
          </Label>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="From"
            min="1"
            max={totalPages}
            value={settings.rangeFrom}
            onChange={(e) => updateSetting("rangeFrom", parseInt(e.target.value) || 1)}
            disabled={!settings.customRange}
            data-testid="input-range-from"
          />
          <Input
            type="number"
            placeholder="To"
            min="1"
            max={totalPages}
            value={settings.rangeTo}
            onChange={(e) => updateSetting("rangeTo", parseInt(e.target.value) || totalPages)}
            disabled={!settings.customRange}
            data-testid="input-range-to"
          />
        </div>
      </div>

      {/* Skip Pages Pattern */}
      <div className="space-y-2">
        <Label htmlFor="skipPattern" className="text-sm font-medium">
          Skip pages pattern
        </Label>
        <Input
          id="skipPattern"
          type="text"
          placeholder="e.g., 1,2,10-12"
          value={settings.skipPattern}
          onChange={(e) => updateSetting("skipPattern", e.target.value)}
          data-testid="input-skip-pattern"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated pages/ranges to skip
        </p>
      </div>
    </div>
  );
}
