package com.mtsguerra.archguesser.building;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;

import com.mtsguerra.archguesser.common.NotFoundException;

@Service
public class BuildingService {

    private final BuildingRepository repository;

    public BuildingService(BuildingRepository repository) {
        this.repository = repository;
    }

    public Building findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("No building with id '" + id + "'"));
    }

    /**
     * Picks a random building the player hasn't seen. Once every building has
     * been excluded, the exclusions are ignored so play never dead-ends.
     */
    public Building random(Set<String> exclude) {
        List<Building> all = repository.findAll();
        List<Building> unseen = all.stream().filter(b -> !exclude.contains(b.id())).toList();
        if (all.isEmpty()) throw new NotFoundException("The building catalogue is empty");
        List<Building> pool = unseen.isEmpty() ? all : unseen;
        return pool.get(ThreadLocalRandom.current().nextInt(pool.size()));
    }

    public List<EraView> eras() {
        return Arrays.stream(Era.values()).map(EraView::of).toList();
    }
}
