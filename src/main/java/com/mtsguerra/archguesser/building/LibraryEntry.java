package com.mtsguerra.archguesser.building;

import java.util.List;

/** What the Library shows of a building once it is unlocked, in the player's language. Locked buildings are drawn from the era alone. */
public record LibraryEntry(String id, String name, List<String> architects, String era, Integer yearCompleted, String countryCode, String country) {

    static LibraryEntry of(Building b) {
        return new LibraryEntry(
                b.id(),
                b.name(),
                b.architects().stream().map(Architect::name).toList(),
                b.era().name(),
                b.yearCompleted(),
                b.location().countryCode(),
                b.location().country());
    }
}
