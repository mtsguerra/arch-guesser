package com.mtsguerra.archguesser.building;

/**
 * Architectural eras the player picks from. Year ranges are approximate and
 * may overlap; negative years are BCE, and a null end year means ongoing.
 */
public enum Era {
    ANCIENT_EGYPTIAN("Ancient Egyptian", -2700, -300),
    PRE_COLUMBIAN("Pre-Columbian", -1000, 1550),
    CLASSICAL("Classical Antiquity", -800, 476),
    BYZANTINE("Byzantine", 330, 1453),
    INDIC("Indian & Southeast Asian", 500, 1500),
    EAST_ASIAN("East Asian Traditional", 600, 1900),
    ISLAMIC("Islamic, Moorish & Mughal", 650, 1800),
    MEDIEVAL("Romanesque & Gothic", 1000, 1500),
    RUSSIAN("Russian Orthodox", 1000, 1700),
    OTTOMAN("Ottoman", 1300, 1922),
    MANUELINE("Manueline", 1490, 1540),
    RENAISSANCE("Renaissance", 1400, 1600),
    MANNERISM("Mannerism", 1520, 1600),
    BAROQUE("Baroque", 1600, 1750),
    NEOCLASSICAL("Neoclassical", 1750, 1850),
    INDUSTRIAL("Industrial & Iron", 1780, 1900),
    HISTORICISM("Historicism & Gothic Revival", 1830, 1900),
    ART_NOUVEAU("Art Nouveau", 1890, 1914),
    ART_DECO("Art Deco", 1920, 1940),
    MODERNISM("Modernism", 1920, 1970),
    BRUTALISM("Brutalism", 1950, 1980),
    POSTMODERNISM("Postmodernism", 1970, 1995),
    CONTEMPORARY("Contemporary", 1990, null);

    private final String label;
    private final int startYear;
    private final Integer endYear;

    Era(String label, int startYear, Integer endYear) {
        this.label = label;
        this.startYear = startYear;
        this.endYear = endYear;
    }

    public String label() {
        return label;
    }

    public int startYear() {
        return startYear;
    }

    public Integer endYear() {
        return endYear;
    }
}
