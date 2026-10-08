package com.mtsguerra.archguesser.building;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
class BuildingController {

    private final BuildingService service;

    BuildingController(BuildingService service) {
        this.service = service;
    }

    /** {@code exclude} is a comma-separated list of ids already seen this session. */
    @GetMapping("/buildings/random")
    Building random(@RequestParam(defaultValue = "") Set<String> exclude) {
        return service.random(exclude);
    }

    @GetMapping("/buildings/{id}")
    Building byId(@PathVariable String id) {
        return service.findById(id);
    }

    @GetMapping("/eras")
    List<EraView> eras() {
        return service.eras();
    }
}
