package com.mtsguerra.archguesser.building;

import java.util.List;

public record Architect(
        String name,
        List<String> aliases,
        String lifespan,
        String nationality,
        String bio
) {
    public Architect {
        aliases = Lists.nullToEmpty(aliases);
    }
}
