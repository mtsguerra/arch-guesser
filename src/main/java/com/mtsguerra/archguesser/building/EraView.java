package com.mtsguerra.archguesser.building;

/** API shape for an {@link Era}; {@code id} matches the value used in {@link Building#era()}. */
public record EraView(String id, String label, int startYear, Integer endYear) {

    static EraView of(Era era) {
        return new EraView(era.name(), era.label(), era.startYear(), era.endYear());
    }
}
