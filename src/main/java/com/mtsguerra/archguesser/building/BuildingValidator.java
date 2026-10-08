package com.mtsguerra.archguesser.building;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Checks the building catalogue for data errors. Collects every problem
 * instead of stopping at the first, so one startup run surfaces them all.
 */
final class BuildingValidator {

    static final int MIN_HINTS = 2;

    private static final Pattern ID = Pattern.compile("[a-z0-9]+(-[a-z0-9]+)*");
    private static final Pattern COUNTRY_CODE = Pattern.compile("[A-Z]{2}");

    private BuildingValidator() {
    }

    static List<String> validate(List<Building> buildings) {
        List<String> errors = new ArrayList<>();
        Set<String> seenIds = new HashSet<>();

        for (int i = 0; i < buildings.size(); i++) {
            Building b = buildings.get(i);
            if (b == null) {
                errors.add("buildings[" + i + "]: entry is null");
                continue;
            }
            String where = "buildings[" + i + "] (" + b.id() + ")";
            Errors e = new Errors(errors, where);

            if (isBlank(b.id()) || !ID.matcher(b.id()).matches()) {
                e.add("id must be non-blank kebab-case");
            } else if (!seenIds.add(b.id())) {
                e.add("duplicate id");
            }
            e.requireText(b.name(), "name");
            if (b.yearCompleted() == null) e.add("yearCompleted is required");
            if (b.era() == null) e.add("era is required");

            validateArchitects(b.architects(), e);
            validateLocation(b.location(), e);
            validateDrawings(b, e);
            validateHints(b, e);
            validateSummary(b.summary(), e);
        }
        return errors;
    }

    private static void validateArchitects(List<Architect> architects, Errors e) {
        if (architects.isEmpty()) e.add("at least one architect is required");
        for (int i = 0; i < architects.size(); i++) {
            Architect a = architects.get(i);
            String field = "architects[" + i + "]";
            if (a == null) {
                e.add(field + " is null");
                continue;
            }
            e.requireText(a.name(), field + ".name");
            e.requireText(a.bio(), field + ".bio");
        }
    }

    private static void validateLocation(Location l, Errors e) {
        if (l == null) {
            e.add("location is required");
            return;
        }
        e.requireText(l.country(), "location.country");
        if (l.countryCode() == null || !COUNTRY_CODE.matcher(l.countryCode()).matches()) {
            e.add("location.countryCode must be an ISO alpha-2 code like 'FR'");
        }
    }

    private static void validateDrawings(Building b, Errors e) {
        if (b.drawings().isEmpty()) e.add("at least one drawing is required");
        for (int i = 0; i < b.drawings().size(); i++) {
            Drawing d = b.drawings().get(i);
            String field = "drawings[" + i + "]";
            if (d.type() == null) e.add(field + ".type is required");
            e.requireAsset(b.id(), d.src(), field + ".src");
            e.requireText(d.alt(), field + ".alt");
        }
    }

    private static void validateHints(Building b, Errors e) {
        List<Hint> hints = b.hints();
        if (hints.size() < MIN_HINTS) e.add("at least " + MIN_HINTS + " hints are required");
        for (int i = 0; i < hints.size(); i++) {
            Hint h = hints.get(i);
            String field = "hints[" + i + "]";
            if (h.order() != i + 1) e.add(field + ".order must be " + (i + 1) + " (hints are listed in reveal order)");
            if (h.type() == null) {
                e.add(field + ".type is required");
                continue;
            }
            switch (h.type()) {
                case IMAGE -> {
                    if (h.image() == null) {
                        e.add(field + ".image is required for IMAGE hints");
                    } else {
                        e.requireAsset(b.id(), h.image().src(), field + ".image.src");
                        e.requireText(h.image().alt(), field + ".image.alt");
                    }
                }
                case FACT -> e.requireText(h.text(), field + ".text");
            }
        }
    }

    private static void validateSummary(Summary s, Errors e) {
        if (s == null) {
            e.add("summary is required");
            return;
        }
        e.requireText(s.description(), "summary.description");
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private record Errors(List<String> sink, String where) {

        void add(String message) {
            sink.add(where + ": " + message);
        }

        void requireText(String value, String field) {
            if (isBlank(value)) add(field + " is required");
        }

        /** Assets must live in the building's own folder, which catches copy-paste mix-ups. */
        void requireAsset(String buildingId, String src, String field) {
            String prefix = "/buildings/" + buildingId + "/";
            if (src == null || !src.startsWith(prefix)) add(field + " must start with '" + prefix + "'");
        }
    }
}
