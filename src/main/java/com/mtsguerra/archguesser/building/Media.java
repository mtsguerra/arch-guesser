package com.mtsguerra.archguesser.building;

/**
 * An image asset.
 *
 * @param src    a local root-relative path (e.g. {@code /buildings/villa-savoye/interior.jpg})
 *               or an {@code https://upload.wikimedia.org/} URL
 * @param source optional page the image comes from (e.g. its Wikimedia Commons file page)
 */
public record Media(String src, String alt, String credit, String source) {
}
