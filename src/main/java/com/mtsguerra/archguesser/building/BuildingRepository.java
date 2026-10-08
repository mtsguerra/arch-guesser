package com.mtsguerra.archguesser.building;

import java.util.List;
import java.util.Optional;

public interface BuildingRepository {

    List<Building> findAll();

    Optional<Building> findById(String id);
}
