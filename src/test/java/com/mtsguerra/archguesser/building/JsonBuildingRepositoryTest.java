package com.mtsguerra.archguesser.building;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;

import tools.jackson.databind.json.JsonMapper;

class JsonBuildingRepositoryTest {

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Test
    void shippedCatalogueLoadsAndPassesValidation() {
        var repository = new JsonBuildingRepository(jsonMapper, new ClassPathResource("data/buildings.json"));

        assertThat(repository.findAll()).hasSizeGreaterThanOrEqualTo(5);
        assertThat(repository.findById("villa-savoye")).get()
                .satisfies(b -> {
                    assertThat(b.era()).isEqualTo(Era.MODERNISM);
                    assertThat(b.hints()).hasSizeGreaterThanOrEqualTo(BuildingValidator.MIN_HINTS);
                });
    }

    @Test
    void failsOnUnknownField() {
        var data = json("[{\"id\": \"a\", \"nmae\": \"typo\"}]");

        assertThatThrownBy(() -> new JsonBuildingRepository(jsonMapper, data))
                .hasMessageContaining("nmae");
    }

    @Test
    void failsWithValidationErrors() {
        var data = json("[{\"id\": \"a\"}]");

        assertThatThrownBy(() -> new JsonBuildingRepository(jsonMapper, data))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid building data")
                .hasMessageContaining("name is required");
    }

    private static ByteArrayResource json(String content) {
        return new ByteArrayResource(content.getBytes(StandardCharsets.UTF_8));
    }
}
