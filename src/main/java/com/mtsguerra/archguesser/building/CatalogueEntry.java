package com.mtsguerra.archguesser.building;

import java.util.List;

/** The few fields the Custom mode filters on, so the browser can count matches without every building. */
public record CatalogueEntry(String id, List<String> architects, String era, String countryCode, String country) {

    static CatalogueEntry of(Building b) {
        return new CatalogueEntry(
                b.id(),
                b.architects().stream().map(Architect::name).toList(),
                b.era().name(),
                b.location().countryCode(),
                b.location().country());
    }
}
