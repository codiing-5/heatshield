import math
from typing import Dict, Any, Tuple
from app.schemas.heat_intelligence import (
    ThermalCalculationRequest,
    ThermalCalculationResponse,
)


class ThermalIndicesEngine:
    """
    Scientific Thermal Intelligence & Biometeorology Engine.
    Implements:
      - Wet-Bulb Temperature (Stull 2011 empirical formula)
      - Globe Temperature & Outdoor WBGT (ISO 7243)
      - NOAA Steadman Heat Index (Rothfusz Regression)
      - Universal Thermal Climate Index (UTCI polynomial model)
      - Canadian Humidex
      - Physiological strain, hydration, and labor work-rest quotas
    """

    @staticmethod
    def calculate_vapor_pressure_kpa(temp_c: float, rh_pct: float) -> float:
        """Calculate actual vapor pressure in kPa using Tetens formula."""
        sat_vapor_pressure_kpa = 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
        return (rh_pct / 100.0) * sat_vapor_pressure_kpa

    @staticmethod
    def calculate_wet_bulb_temp(temp_c: float, rh_pct: float) -> float:
        """
        Calculate Wet-Bulb Temperature (°C) using Stull (2011) formula.
        Accurate within 0.3°C across standard terrestrial relative humidities (5% - 99%) and temperatures (-20°C - 50°C).
        """
        t = temp_c
        rh = rh_pct
        
        tw = (
            t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
            + math.atan(t + rh)
            - math.atan(rh - 1.676331)
            + 0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh)
            - 4.686035
        )
        return round(tw, 2)

    @staticmethod
    def estimate_globe_temperature(
        temp_c: float, 
        surface_temp_c: float, 
        solar_radiation_wm2: float, 
        wind_speed_ms: float
    ) -> float:
        """
        Estimate black globe temperature (°C) considering solar irradiance, convection, and surface radiation.
        """
        wind = max(0.2, wind_speed_ms)
        # Mean radiant temperature estimation
        rad_component = (solar_radiation_wm2 * 0.7) / (5.67e-8 * (wind ** 0.58) + 12.0)
        surface_effect = max(0.0, (surface_temp_c - temp_c) * 0.25)
        tg = temp_c + (rad_component * 0.015) + surface_effect
        return round(tg, 2)

    @staticmethod
    def calculate_wbgt(
        ambient_c: float, 
        wet_bulb_c: float, 
        globe_c: float
    ) -> float:
        """
        Calculate Outdoor Wet-Bulb Globe Temperature (WBGT) per ISO 7243 standard:
        WBGT = 0.7 * Tw + 0.2 * Tg + 0.1 * Ta
        """
        wbgt = 0.7 * wet_bulb_c + 0.2 * globe_c + 0.1 * ambient_c
        return round(wbgt, 2)

    @staticmethod
    def calculate_heat_index(temp_c: float, rh_pct: float) -> float:
        """
        Calculate NOAA Steadman Heat Index (°C) using Rothfusz polynomial regression.
        """
        # Convert to Fahrenheit for standard NOAA formula
        tf = (temp_c * 9.0 / 5.0) + 32.0
        rh = rh_pct

        if tf < 80.0:
            hi_f = 0.5 * (tf + 61.0 + ((tf - 68.0) * 1.2) + (rh * 0.094))
        else:
            hi_f = (
                -42.379
                + 2.04901523 * tf
                + 10.14333127 * rh
                - 0.22475541 * tf * rh
                - 0.00683783 * tf * tf
                - 0.05481717 * rh * rh
                + 0.00122874 * tf * tf * rh
                + 0.00085282 * tf * rh * rh
                - 0.00000199 * tf * tf * rh * rh
            )
            # Adjustments for dry air / high heat and high humidity
            if rh < 13.0 and 80.0 <= tf <= 112.0:
                adjustment = ((13.0 - rh) / 4.0) * math.sqrt((17.0 - abs(tf - 95.0)) / 17.0)
                hi_f -= adjustment
            elif rh > 85.0 and 80.0 <= tf <= 87.0:
                adjustment = ((rh - 85.0) / 10.0) * ((87.0 - tf) / 5.0)
                hi_f += adjustment

        hi_c = (hi_f - 32.0) * 5.0 / 9.0
        return round(hi_c, 2)

    @staticmethod
    def calculate_utci(
        temp_c: float, 
        rh_pct: float, 
        wind_speed_ms: float, 
        globe_temp_c: float
    ) -> float:
        """
        Calculate Universal Thermal Climate Index (UTCI) biometeorological equivalent temperature.
        """
        ta = temp_c
        tmrt = globe_temp_c
        va = max(0.5, wind_speed_ms)
        vp_hpa = ThermalIndicesEngine.calculate_vapor_pressure_kpa(temp_c, rh_pct) * 10.0
        
        # UTCI polynomial approximation
        delta_tmrt = tmrt - ta
        utci = (
            ta
            + (0.6075 * delta_tmrt)
            - (0.0288 * delta_tmrt * math.sqrt(va))
            + (0.0036 * ta * vp_hpa)
            - (1.43 * math.sqrt(va))
        )
        return round(utci, 2)

    @staticmethod
    def calculate_humidex(temp_c: float, rh_pct: float) -> float:
        """
        Calculate Canadian Humidex:
        Humidex = T + 5/9 * (e - 10) where e is vapor pressure in mb (hPa)
        """
        vp_hpa = ThermalIndicesEngine.calculate_vapor_pressure_kpa(temp_c, rh_pct) * 10.0
        humidex = temp_c + (5.0 / 9.0) * (vp_hpa - 10.0)
        return round(max(temp_c, humidex), 2)

    @staticmethod
    def assess_risk(wbgt_c: float, heat_index_c: float) -> Dict[str, Any]:
        """
        Determine physiological risk category, work-rest cycle, hydration rate, and exposure limit.
        """
        if wbgt_c >= 32.2 or heat_index_c >= 52.0:
            return {
                "risk_level": "CRITICAL",
                "labor_work_rest_ratio": "15 min Work / 45 min Rest per hour",
                "recommended_hydration_l_hr": 1.2,
                "max_continuous_exposure_mins": 20,
                "advisory": "Extreme danger of heat stroke with continuous exposure. Halt all unmitigated outdoor heavy physical labor immediately.",
            }
        elif wbgt_c >= 31.0 or heat_index_c >= 45.0:
            return {
                "risk_level": "EXTREME",
                "labor_work_rest_ratio": "30 min Work / 30 min Rest per hour",
                "recommended_hydration_l_hr": 1.0,
                "max_continuous_exposure_mins": 35,
                "advisory": "Dangerous heat stress imminent. Implement mandatory shade rotations and continuous electrolyte hydration.",
            }
        elif wbgt_c >= 29.4 or heat_index_c >= 39.0:
            return {
                "risk_level": "HIGH",
                "labor_work_rest_ratio": "45 min Work / 15 min Rest per hour",
                "recommended_hydration_l_hr": 0.8,
                "max_continuous_exposure_mins": 60,
                "advisory": "High heat caution. Vulnerable demographics and outdoor workers should reduce exertion and seek conditioned spaces.",
            }
        elif wbgt_c >= 26.7 or heat_index_c >= 32.0:
            return {
                "risk_level": "MODERATE",
                "labor_work_rest_ratio": "50 min Work / 10 min Rest per hour",
                "recommended_hydration_l_hr": 0.6,
                "max_continuous_exposure_mins": 120,
                "advisory": "Moderate heat burden. Ensure hydration availability and sun protection.",
            }
        else:
            return {
                "risk_level": "LOW",
                "labor_work_rest_ratio": "Continuous work with standard breaks",
                "recommended_hydration_l_hr": 0.4,
                "max_continuous_exposure_mins": 240,
                "advisory": "Optimal thermal conditions. No acute heat stress alerts.",
            }

    @classmethod
    def evaluate(cls, req: ThermalCalculationRequest) -> ThermalCalculationResponse:
        """Full pipeline evaluation for request."""
        surface_temp = req.surface_temp_c if req.surface_temp_c is not None else (req.ambient_temp_c + 8.5)
        
        tw = cls.calculate_wet_bulb_temp(req.ambient_temp_c, req.relative_humidity_pct)
        tg = cls.estimate_globe_temperature(req.ambient_temp_c, surface_temp, req.solar_radiation_wm2, req.wind_speed_ms)
        wbgt = cls.calculate_wbgt(req.ambient_temp_c, tw, tg)
        hi = cls.calculate_heat_index(req.ambient_temp_c, req.relative_humidity_pct)
        utci = cls.calculate_utci(req.ambient_temp_c, req.relative_humidity_pct, req.wind_speed_ms, tg)
        humidex = cls.calculate_humidex(req.ambient_temp_c, req.relative_humidity_pct)
        vp = round(cls.calculate_vapor_pressure_kpa(req.ambient_temp_c, req.relative_humidity_pct), 3)
        
        risk = cls.assess_risk(wbgt, hi)

        return ThermalCalculationResponse(
            ambient_temp_c=req.ambient_temp_c,
            relative_humidity_pct=req.relative_humidity_pct,
            wet_bulb_temp_c=tw,
            globe_temp_c=tg,
            wbgt_c=wbgt,
            heat_index_c=hi,
            utci_c=utci,
            humidex=humidex,
            vapor_pressure_kpa=vp,
            risk_level=risk["risk_level"],
            labor_work_rest_ratio=risk["labor_work_rest_ratio"],
            recommended_hydration_l_hr=risk["recommended_hydration_l_hr"],
            max_continuous_exposure_mins=risk["max_continuous_exposure_mins"],
            physiological_advisory=risk["advisory"],
        )


thermal_engine = ThermalIndicesEngine()
