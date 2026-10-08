package com.mtsguerra.archguesser.building;

import java.util.List;

/**
 * A famous building as served to the game. This record is both the storage
 * model and the API response, since the client needs every field for a round.
 */
public record Building(
        String id,
        String name,
        List<String> aliases,
        List<Architect> architects,
        Location location,
        Integer yearCompleted,
        Era era,
        String style,
        List<Drawing> drawings,
        List<Hint> hints,
        Summary summary
) {
    public Building {
        aliases = Lists.nullToEmpty(aliases);
        architects = Lists.nullToEmpty(architects);
        drawings = Lists.nullToEmpty(drawings);
        hints = Lists.nullToEmpty(hints);
    }
}
