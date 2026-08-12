import swisseph as swe
from datetime import datetime

CITY_COORDINATES = {
    "delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777),
    "bangalore": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639),
    "hyderabad": (17.3850, 78.4867),
    "pune": (18.5204, 73.8567),
    "ahmedabad": (23.0225, 72.5714),
    "jaipur": (26.9124, 75.7873),
    "lucknow": (26.8467, 80.9462)
}

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

def get_city_lat_lon(city_name: str):
    key = city_name.strip().lower()
    return CITY_COORDINATES.get(key, (28.6139, 77.2090))  # Default to Delhi if not matched

def compute_chart_features(birth_date: str, birth_time: str, lat: float, lon: float):
    dt = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
    ut = dt.hour + dt.minute / 60.0 + dt.second / 3600.0 - 5.5  # Adjust IST (UTC+5:30) to UT
    jd = swe.julday(dt.year, dt.month, dt.day, ut)

    # Use Lahiri Ayanamsa for Sidereal / Vedic Astrology
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SIDEREAL

    # Houses & Ascendant (Lagna)
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'P', flags)
    asc_deg = ascmc[0]
    lagna_sign_idx = int(asc_deg // 30) % 12
    lagna = ZODIAC_SIGNS[lagna_sign_idx]

    # Moon Calculation
    moon_pos, _ = swe.calc_ut(jd, swe.MOON, flags)
    moon_deg = moon_pos[0]
    moon_sign_idx = int(moon_deg // 30) % 12
    moon_sign = ZODIAC_SIGNS[moon_sign_idx]

    # Nakshatra
    nakshatra_idx = int(moon_deg // (360.0 / 27.0)) % 27
    nakshatra = NAKSHATRAS[nakshatra_idx]

    # Dasha Lord based on Nakshatra
    dasha_lord = DASHA_LORDS[nakshatra_idx % 9]

    # Mars Position & Affliction (Manglik check - houses 1, 2, 4, 7, 8, 12 from Lagna)
    mars_pos, _ = swe.calc_ut(jd, swe.MARS, flags)
    mars_deg = mars_pos[0]
    mars_sign_idx = int(mars_deg // 30) % 12
    mars_house = (mars_sign_idx - lagna_sign_idx) % 12 + 1
    mars_afflicted = mars_house in [1, 2, 4, 7, 8, 12]

    # Saturn Return (Saturn in transit or natal near Moon sign / Saturn position simplified)
    saturn_pos, _ = swe.calc_ut(jd, swe.SATURN, flags)
    saturn_deg = saturn_pos[0]
    saturn_sign_idx = int(saturn_deg // 30) % 12
    saturn_return = (saturn_sign_idx == moon_sign_idx)

    # Rahu & Ketu Axis
    rahu_pos, _ = swe.calc_ut(jd, swe.MEAN_NODE, flags)
    rahu_deg = rahu_pos[0]
    rahu_sign_idx = int(rahu_deg // 30) % 12
    ketu_sign_idx = (rahu_sign_idx + 6) % 12
    rahu_ketu_axis = f"{ZODIAC_SIGNS[rahu_sign_idx]}-{ZODIAC_SIGNS[ketu_sign_idx]}"

    # Jupiter Aspect (Aspects 1st, 5th, 7th, 9th houses from its position)
    jup_pos, _ = swe.calc_ut(jd, swe.JUPITER, flags)
    jup_deg = jup_pos[0]
    jup_sign_idx = int(jup_deg // 30) % 12
    jup_house_from_lagna = (jup_sign_idx - lagna_sign_idx) % 12 + 1
    jup_house_from_moon = (jup_sign_idx - moon_sign_idx) % 12 + 1
    
    jupiter_aspect = (jup_house_from_lagna in [1, 5, 7, 9]) or (jup_house_from_moon in [1, 5, 7, 9])

    return {
        "lagna": lagna,
        "moon_sign": moon_sign,
        "nakshatra": nakshatra,
        "dasha_lord": dasha_lord,
        "mars_afflicted": bool(mars_afflicted),
        "saturn_return": bool(saturn_return),
        "rahu_ketu_axis": rahu_ketu_axis,
        "jupiter_aspect": bool(jupiter_aspect)
    }
