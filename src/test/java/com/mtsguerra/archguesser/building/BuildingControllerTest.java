package com.mtsguerra.archguesser.building;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class BuildingControllerTest {

    private static final String ALL_BUT_SAVOYE = "villa-rotonda,sant-ivo-alla-sapienza,monticello,salk-institute";

    @Autowired
    MockMvc mvc;

    @Test
    void returnsBuildingById() throws Exception {
        mvc.perform(get("/api/buildings/villa-savoye"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Villa Savoye"))
                .andExpect(jsonPath("$.architects[*].name").value(Matchers.contains("Le Corbusier", "Pierre Jeanneret")))
                .andExpect(jsonPath("$.era").value("MODERNISM"))
                .andExpect(jsonPath("$.hints[0].order").value(1));
    }

    @Test
    void unknownIdIsProblem404() throws Exception {
        mvc.perform(get("/api/buildings/nope"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.detail").value("No building with id 'nope'"));
    }

    @Test
    void randomSkipsExcludedBuildings() throws Exception {
        mvc.perform(get("/api/buildings/random").param("exclude", ALL_BUT_SAVOYE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("villa-savoye"));
    }

    @Test
    void randomIgnoresExclusionsOnceEverythingIsSeen() throws Exception {
        mvc.perform(get("/api/buildings/random").param("exclude", ALL_BUT_SAVOYE + ",villa-savoye"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    void randomWorksWithoutExclusions() throws Exception {
        mvc.perform(get("/api/buildings/random"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    void listsErasInChronologicalOrder() throws Exception {
        mvc.perform(get("/api/eras"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("CLASSICAL"))
                .andExpect(jsonPath("$[0].startYear").value(-800))
                .andExpect(jsonPath("$[?(@.id == 'CONTEMPORARY')].endYear").value(Matchers.contains(Matchers.nullValue())));
    }
}
