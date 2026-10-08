package com.mtsguerra.archguesser.building;

/**
 * An image asset.
 *
 * @param src root-relative path served by the frontend, e.g. {@code /buildings/villa-savoye/interior.jpg}
 */
public record Media(String src, String alt, String credit) {
}
