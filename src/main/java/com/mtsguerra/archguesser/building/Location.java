package com.mtsguerra.archguesser.building;

/**
 * @param countryCode ISO 3166-1 alpha-2 code, e.g. {@code FR}
 */
public record Location(String city, String country, String countryCode) {
}
