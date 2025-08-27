/**
 * Unit conversion utilities for PDF positioning
 * 
 * PDF coordinate system uses points (pt) as the base unit
 * 1 inch = 72 points
 * 1 mm = 2.834645669 points (approximately 2.834 points)
 */

export type Unit = "pt" | "mm" | "in";

/**
 * Convert a value from any unit to points (PDF's native unit)
 */
export function convertToPoints(value: number, fromUnit: Unit): number {
  switch (fromUnit) {
    case "pt":
      return value;
    case "mm":
      return value * 2.834645669;
    case "in":
      return value * 72;
    default:
      return value;
  }
}

/**
 * Convert a value from points to any unit
 */
export function convertFromPoints(value: number, toUnit: Unit): number {
  switch (toUnit) {
    case "pt":
      return value;
    case "mm":
      return value / 2.834645669;
    case "in":
      return value / 72;
    default:
      return value;
  }
}

/**
 * Convert a value from one unit to another
 */
export function convertUnits(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) {
    return value;
  }
  
  const points = convertToPoints(value, fromUnit);
  return convertFromPoints(points, toUnit);
}

/**
 * Round a number to a reasonable precision for the given unit
 */
export function roundToUnit(value: number, unit: Unit): number {
  switch (unit) {
    case "pt":
      return Math.round(value * 10) / 10; // 1 decimal place
    case "mm":
      return Math.round(value * 100) / 100; // 2 decimal places
    case "in":
      return Math.round(value * 1000) / 1000; // 3 decimal places
    default:
      return Math.round(value * 10) / 10;
  }
}

/**
 * Get the step value for input controls based on unit
 */
export function getStepForUnit(unit: Unit): number {
  switch (unit) {
    case "pt":
      return 1;
    case "mm":
      return 0.1;
    case "in":
      return 0.01;
    default:
      return 1;
  }
}

/**
 * Get appropriate min/max values for common measurements in each unit
 */
export function getUnitLimits(unit: Unit): { min: number; max: number } {
  switch (unit) {
    case "pt":
      return { min: 0, max: 720 }; // 0 to 10 inches
    case "mm":
      return { min: 0, max: 254 }; // 0 to 10 inches
    case "in":
      return { min: 0, max: 10 };
    default:
      return { min: 0, max: 720 };
  }
}
