package com.mtsguerra.archguesser.building;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Repository;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * Loads the catalogue from a JSON file once at startup and serves it from memory.
 * Invalid data stops the application from starting.
 */
@Repository
class JsonBuildingRepository implements BuildingRepository {

    private final List<Building> buildings;
    private final Map<String, Building> byId;

    JsonBuildingRepository(
            JsonMapper jsonMapper,
            @Value("${archguesser.data-location:classpath:data/buildings.json}") Resource dataFile) {
        this.buildings = load(jsonMapper, dataFile);
        Map<String, Building> index = new LinkedHashMap<>();
        buildings.forEach(b -> index.put(b.id(), b));
        this.byId = Map.copyOf(index);
    }

    private static List<Building> load(JsonMapper jsonMapper, Resource dataFile) {
        List<Building> parsed;
        try (InputStream in = dataFile.getInputStream()) {
            // Strict about unknown fields so a typo in the data file fails instead of vanishing.
            parsed = jsonMapper.readerFor(new TypeReference<List<Building>>() { })
                    .with(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                    .readValue(in);
        } catch (IOException ex) {
            throw new UncheckedIOException("Cannot read building data from " + dataFile, ex);
        }

        List<String> errors = BuildingValidator.validate(parsed);
        if (!errors.isEmpty()) {
            throw new IllegalStateException("Invalid building data in " + dataFile + ":\n  - "
                    + String.join("\n  - ", errors));
        }
        return List.copyOf(parsed);
    }

    @Override
    public List<Building> findAll() {
        return buildings;
    }

    @Override
    public Optional<Building> findById(String id) {
        return Optional.ofNullable(byId.get(id));
    }
}
