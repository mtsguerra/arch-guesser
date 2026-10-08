package com.mtsguerra.archguesser.building;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class BuildingValidatorTest {

    @Test
    void acceptsValidBuilding() {
        assertThat(BuildingValidator.validate(List.of(building("a", hints(2))))).isEmpty();
    }

    @Test
    void rejectsDuplicateIds() {
        List<String> errors = BuildingValidator.validate(List.of(building("a", hints(2)), building("a", hints(2))));

        assertThat(errors).singleElement().asString().contains("duplicate id");
    }

    @Test
    void rejectsTooFewHints() {
        List<String> errors = BuildingValidator.validate(List.of(building("a", hints(1))));

        assertThat(errors).singleElement().asString().contains("at least 2 hints");
    }

    @Test
    void rejectsHintsOutOfOrder() {
        List<Hint> hints = List.of(fact(2), fact(1));

        List<String> errors = BuildingValidator.validate(List.of(building("a", hints)));

        assertThat(errors).hasSize(2).allSatisfy(e -> assertThat(e).contains(".order must be"));
    }

    @Test
    void rejectsImageHintWithoutImage() {
        List<Hint> hints = List.of(fact(1), new Hint(2, HintType.IMAGE, null, "caption", null));

        List<String> errors = BuildingValidator.validate(List.of(building("a", hints)));

        assertThat(errors).singleElement().asString().contains("hints[1].image is required");
    }

    @Test
    void rejectsMissingArchitects() {
        Building b = building("a", hints(2));
        Building noArchitects = new Building(b.id(), b.name(), b.aliases(), List.of(), b.location(),
                b.yearCompleted(), b.era(), b.style(), b.drawings(), b.hints(), b.summary());

        List<String> errors = BuildingValidator.validate(List.of(noArchitects));

        assertThat(errors).singleElement().asString().contains("at least one architect");
    }

    @Test
    void rejectsAssetsOutsideTheBuildingFolder() {
        Building b = building("a", hints(2));
        Drawing foreign = new Drawing(DrawingType.FLOOR_PLAN, "Plan", "/buildings/other/plan.jpg", "alt", null);
        Building withForeignDrawing = new Building(b.id(), b.name(), b.aliases(), b.architects(), b.location(),
                b.yearCompleted(), b.era(), b.style(), List.of(foreign), b.hints(), b.summary());

        List<String> errors = BuildingValidator.validate(List.of(withForeignDrawing));

        assertThat(errors).singleElement().asString().contains("must start with '/buildings/a/'");
    }

    @Test
    void reportsEveryProblemAtOnce() {
        Building broken = new Building("Not Kebab", null, null, null, null, null, null, null, null, null, null);

        List<String> errors = BuildingValidator.validate(List.of(broken));

        assertThat(errors).hasSizeGreaterThanOrEqualTo(8);
    }

    private static Building building(String id, List<Hint> hints) {
        return new Building(
                id,
                "Name",
                null,
                List.of(new Architect("Architect", null, "1900–1990", "French", "Bio")),
                new Location("City", "France", "FR"),
                1950,
                Era.MODERNISM,
                "Style",
                List.of(new Drawing(DrawingType.FLOOR_PLAN, "Plan", "/buildings/" + id + "/plan.jpg", "alt", null)),
                hints,
                new Summary("Description", null, null));
    }

    private static List<Hint> hints(int count) {
        return java.util.stream.IntStream.rangeClosed(1, count).mapToObj(BuildingValidatorTest::fact).toList();
    }

    private static Hint fact(int order) {
        return new Hint(order, HintType.FACT, null, null, "Fact " + order);
    }
}
